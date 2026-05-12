-- ELBIS final SRS schema (import in phpMyAdmin or mysql CLI)
CREATE DATABASE IF NOT EXISTS `elbis` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `elbis`;

-- USERS
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

-- BOOKS
CREATE TABLE IF NOT EXISTS `books` (
  `book_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `year` INT NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STUDENT (borrowers only)
CREATE TABLE IF NOT EXISTS `student` (
  `student_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `email` VARCHAR(255) NOT NULL,
  `student_name` VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(20) NULL,
  `program` VARCHAR(100) NULL,
  `year_section` VARCHAR(100) NULL,
  PRIMARY KEY (`student_id`),
  KEY `idx_student_user_id` (`user_id`),
  CONSTRAINT `fk_student_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TRANSACTION_RECORDS
CREATE TABLE IF NOT EXISTS `transaction_records` (
  `borrow_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `book_id` INT UNSIGNED NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `borrow_date` DATETIME NOT NULL,
  `return_date` DATETIME NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Borrowed',
  PRIMARY KEY (`borrow_id`),
  KEY `idx_tr_user_id` (`user_id`),
  KEY `idx_tr_student_id` (`student_id`),
  KEY `idx_tr_book_id` (`book_id`),
  CONSTRAINT `fk_transaction_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_transaction_student`
    FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_transaction_book`
    FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AUDIT_LOG
CREATE TABLE IF NOT EXISTS `audit_log` (
  `log_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `date_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_audit_user_id` (`user_id`),
  CONSTRAINT `fk_audit_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed system users
-- Admin login: admin@evsu.edu.ph / admin123
-- Library Staff login: staff@evsu.edu.ph / staff123
INSERT INTO `users` (`email`, `password`, `name`, `role`) VALUES
('admin@evsu.edu.ph', '$2y$10$cx.qN432Cu3ov0gheO8tbufCHbXRlxIAI2Cc7nRV8E7XarPhNqz.2', 'Library Admin', 'Admin'),
('staff@evsu.edu.ph', 'staff123', 'Library Staff', 'Library Staff')
ON DUPLICATE KEY UPDATE
  `password` = VALUES(`password`),
  `name` = VALUES(`name`),
  `role` = VALUES(`role`);
