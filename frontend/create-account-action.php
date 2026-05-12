<?php
/**
 * Staff portal create-account — creates a row in users table.
 */

require_once __DIR__ . '/includes/session.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: create-account.php');
    exit;
}

$name = isset($_POST['name']) ? (string) $_POST['name'] : '';
$email = isset($_POST['email']) ? (string) $_POST['email'] : '';
$password = isset($_POST['password']) ? (string) $_POST['password'] : '';
$passwordConfirm = isset($_POST['passwordConfirm']) ? (string) $_POST['passwordConfirm'] : '';

$_SESSION['register_prefill'] = [
    'name' => $name,
    'email' => $email,
];

$result = elbis_attempt_staff_register($elbis_mysqli, $name, $email, $password, $passwordConfirm);
mysqli_close($elbis_mysqli);

if (!$result['ok']) {
    $_SESSION['register_error'] = $result['error'] ?? 'Unable to create account.';
    header('Location: create-account.php');
    exit;
}

unset($_SESSION['register_prefill']);
$_SESSION['login_success'] = 'Account created successfully. You can sign in now.';
header('Location: login.php');
exit;

