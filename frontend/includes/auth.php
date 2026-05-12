<?php
/**
 * ELBIS — session user helpers and login (users table).
 */

require_once __DIR__ . '/session.php';

function elbis_is_evsu_email(string $email): bool
{
    $e = strtolower(trim($email));
    $suffix = '@evsu.edu.ph';
    $len = strlen($suffix);
    return strlen($e) > $len && substr_compare($e, $suffix, -$len) === 0;
}

function elbis_attempt_login(mysqli $db, string $email, string $password)
{
    if (trim($email) === '' || $password === '') {
        return ['ok' => false, 'error' => 'Please enter your EVSU email and password.'];
    }

    if (!elbis_is_evsu_email($email)) {
        return ['ok' => false, 'error' => 'Email format is incorrect. Please check and try again.'];
    }

    $emailNorm = strtolower(trim($email));

    $sql = 'SELECT user_id, email, password, name, role FROM users WHERE LOWER(email) = ? LIMIT 1';
    $stmt = mysqli_prepare($db, $sql);
    if (!$stmt) {
        return ['ok' => false, 'error' => 'Unable to verify login. Please try again.'];
    }

    mysqli_stmt_bind_param($stmt, 's', $emailNorm);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = $result ? mysqli_fetch_assoc($result) : null;
    mysqli_stmt_close($stmt);

    if (!$row) {
        return ['ok' => false, 'error' => 'Account is not registered. Please create an account first.'];
    }

    $storedPassword = (string) ($row['password'] ?? '');
    $isPasswordValid = false;
    if ($storedPassword !== '') {
        $looksHashed = strncmp($storedPassword, '$2y$', 4) === 0
            || strncmp($storedPassword, '$2b$', 4) === 0
            || strncmp($storedPassword, '$argon2', 7) === 0;
        if ($looksHashed) {
            $isPasswordValid = password_verify($password, $storedPassword);
        } else {
            // Legacy/bootstrap rows may store plain text temporarily.
            $isPasswordValid = hash_equals($storedPassword, $password);
        }
    }
    if (!$isPasswordValid) {
        return ['ok' => false, 'error' => 'Invalid email or password.'];
    }

    $role = trim((string) ($row['role'] ?? 'Library Staff'));
    $roleLower = strtolower($role);
    $kind = 'staff';

    $_SESSION['elbis_user'] = [
        'id' => (string) $row['user_id'],
        'user_id' => (string) $row['user_id'],
        'email' => (string) $row['email'],
        'name' => (string) ($row['name'] ?? ''),
        'role' => $role,
        'kind' => $kind,
    ];

    $redirect = elbis_redirect_url_for_role($roleLower);
    return ['ok' => true, 'redirect' => $redirect];
}

function elbis_attempt_staff_register(mysqli $db, string $name, string $email, string $password, string $passwordConfirm)
{
    $name = trim($name);
    $email = trim($email);

    if ($name === '' || $email === '' || $password === '') {
        return ['ok' => false, 'error' => 'Please fill in all required fields.'];
    }

    if (!elbis_is_evsu_email($email)) {
        return ['ok' => false, 'error' => 'Please use a valid EVSU email address.'];
    }

    if (strlen($password) < 6) {
        return ['ok' => false, 'error' => 'Password must be at least 6 characters.'];
    }

    if (!hash_equals($password, $passwordConfirm)) {
        return ['ok' => false, 'error' => 'Passwords do not match.'];
    }

    $emailNorm = strtolower($email);

    $checkSql = 'SELECT user_id FROM users WHERE LOWER(email) = ? LIMIT 1';
    $checkStmt = mysqli_prepare($db, $checkSql);
    if (!$checkStmt) {
        return ['ok' => false, 'error' => 'Unable to create account. Please try again.'];
    }
    mysqli_stmt_bind_param($checkStmt, 's', $emailNorm);
    mysqli_stmt_execute($checkStmt);
    $checkRes = mysqli_stmt_get_result($checkStmt);
    $existing = $checkRes ? mysqli_fetch_assoc($checkRes) : null;
    mysqli_stmt_close($checkStmt);

    if ($existing) {
        return ['ok' => false, 'error' => 'Email is already registered.'];
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    if (!is_string($hashed) || $hashed === '') {
        return ['ok' => false, 'error' => 'Unable to create account. Please try again.'];
    }

    $role = 'Library Staff';
    $insertSql = 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)';
    $stmt = mysqli_prepare($db, $insertSql);
    if (!$stmt) {
        return ['ok' => false, 'error' => 'Unable to create account. Please try again.'];
    }
    mysqli_stmt_bind_param($stmt, 'ssss', $emailNorm, $hashed, $name, $role);
    $ok = mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

    if (!$ok) {
        return ['ok' => false, 'error' => 'Unable to create account. Please try again.'];
    }

    return ['ok' => true];
}

function elbis_redirect_url_for_role(string $roleLower): string
{
    if ($roleLower === 'library staff' || $roleLower === 'staff' || $roleLower === 'librarian') {
        return 'staff-dashboard.php';
    }
    if ($roleLower === 'admin') {
        return 'dashboard.php';
    }
    return 'dashboard.php';
}

function elbis_current_user()
{
    $u = $_SESSION['elbis_user'] ?? null;
    return is_array($u) && !empty($u['email']) ? $u : null;
}

function elbis_staff_session_ok(): bool
{
    $u = elbis_current_user();
    if (!$u) {
        return false;
    }
    if (($u['kind'] ?? '') !== 'staff') {
        return false;
    }
    $role = strtolower(trim((string) ($u['role'] ?? '')));
    // Staff pages should be accessible to Library Staff and Admin accounts.
    return in_array($role, ['library staff', 'staff', 'librarian', 'admin'], true);
}

function elbis_admin_session_ok(): bool
{
    $u = elbis_current_user();
    if (!$u) {
        return false;
    }
    if (($u['kind'] ?? '') !== 'staff') {
        return false;
    }
    $role = strtolower(trim((string) ($u['role'] ?? '')));
    return $role === 'admin';
}

function elbis_logout(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], (bool) $p['secure'], (bool) $p['httponly']);
    }
    session_destroy();
}
