-- Ensure ELBIS staff users exist (run inside your `elbis` database).
-- This is safe to re-run.

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'Library Staff',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin login: admin@evsu.edu.ph / admin123
-- Staff login: staff@evsu.edu.ph / staff123
INSERT INTO `users` (`email`, `password`, `name`, `role`) VALUES
('admin@evsu.edu.ph', '$2y$10$cx.qN432Cu3ov0gheO8tbufCHbXRlxIAI2Cc7nRV8E7XarPhNqz.2', 'Library Admin', 'Admin'),
('staff@evsu.edu.ph', 'staff123', 'Library Staff', 'Library Staff')
ON DUPLICATE KEY UPDATE
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`);

