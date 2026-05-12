<?php
/**
 * Staff portal login — POST email + password, users table, role-based redirect.
 */

require_once __DIR__ . '/includes/session.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: login.php');
    exit;
}

$email = isset($_POST['email']) ? (string) $_POST['email'] : '';
$password = isset($_POST['password']) ? (string) $_POST['password'] : '';

$result = elbis_attempt_login($elbis_mysqli, $email, $password);
mysqli_close($elbis_mysqli);

if (!$result['ok']) {
    $_SESSION['login_error'] = $result['error'] ?? 'Unable to sign in.';
    header('Location: login.php');
    exit;
}

header('Location: ' . $result['redirect']);
exit;
