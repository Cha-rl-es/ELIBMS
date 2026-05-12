<?php
/**
 * ELBIS — reusable MySQL connection for XAMPP (database: elbis).
 * Uses mysqli_connect; charset utf8mb4.
 *
 * Optional env overrides: ELBIS_DB_HOST, ELBIS_DB_USER, ELBIS_DB_PASS, ELBIS_DB_NAME
 */

$dbHost = getenv('ELBIS_DB_HOST') ?: '127.0.0.1';
$dbUser = getenv('ELBIS_DB_USER') ?: 'root';
$dbPass = getenv('ELBIS_DB_PASS') !== false ? getenv('ELBIS_DB_PASS') : '';
$dbName = getenv('ELBIS_DB_NAME') ?: 'elbis';

$elbis_mysqli = mysqli_connect($dbHost, $dbUser, $dbPass, $dbName);

if (!$elbis_mysqli) {
    http_response_code(500);
    exit('Database connection failed: ' . htmlspecialchars(mysqli_connect_error(), ENT_QUOTES, 'UTF-8'));
}

mysqli_set_charset($elbis_mysqli, 'utf8mb4');

// Bootstrap minimal auth schema + demo accounts if missing.
// This keeps local XAMPP installs working even if the SQL dump wasn't imported yet.
mysqli_query(
    $elbis_mysqli,
    "CREATE TABLE IF NOT EXISTS `users` (
      `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      `email` VARCHAR(255) NOT NULL,
      `password` VARCHAR(255) NOT NULL,
      `name` VARCHAR(255) NOT NULL,
      `role` VARCHAR(50) NOT NULL DEFAULT 'Library Staff',
      `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`user_id`),
      UNIQUE KEY `uk_users_email` (`email`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
);

// Admin password is hashed; staff is plain for compatibility with the existing demo.
mysqli_query(
    $elbis_mysqli,
    "INSERT IGNORE INTO `users` (`email`, `password`, `name`, `role`) VALUES
    ('admin@evsu.edu.ph', '$2y$10$cx.qN432Cu3ov0gheO8tbufCHbXRlxIAI2Cc7nRV8E7XarPhNqz.2', 'Library Admin', 'Admin'),
    ('staff@evsu.edu.ph', 'staff123', 'Library Staff', 'Library Staff')"
);
