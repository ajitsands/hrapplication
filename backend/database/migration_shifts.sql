-- backend/database/migration_shifts.sql
-- Shift Management & Shift-Based Overtime Engine Tables

-- 1. Shifts Master Table
CREATE TABLE IF NOT EXISTS `shifts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(30) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `shift_type` ENUM('Standard', 'Night', 'Split', 'Flexible') DEFAULT 'Standard',
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `total_hours` DECIMAL(4,2) NOT NULL DEFAULT 8.00,
    `break_minutes` INT NOT NULL DEFAULT 60,
    `grace_late_in` INT NOT NULL DEFAULT 15,
    `grace_early_out` INT NOT NULL DEFAULT 15,
    `half_day_min_hours` DECIMAL(4,2) NOT NULL DEFAULT 4.00,
    `full_day_min_hours` DECIMAL(4,2) NOT NULL DEFAULT 7.00,
    `is_night_shift` TINYINT(1) DEFAULT 0,
    `split_start_time_2` TIME NULL,
    `split_end_time_2` TIME NULL,
    `color_code` VARCHAR(20) DEFAULT '#0ea5e9',
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Employee Default Shift Assignment Table
CREATE TABLE IF NOT EXISTS `employee_shift_assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` INT NOT NULL,
    `shift_id` INT NOT NULL,
    `effective_from` DATE NOT NULL,
    `effective_to` DATE NULL,
    `is_default` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Monthly / Weekly Shift Rostering Table
CREATE TABLE IF NOT EXISTS `shift_roster` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` INT NOT NULL,
    `date` DATE NOT NULL,
    `shift_id` INT NULL,
    `is_off_day` TINYINT(1) DEFAULT 0,
    `notes` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uniq_roster_emp_date` (`employee_id`, `date`),
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
