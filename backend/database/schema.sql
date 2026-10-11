-- Gulf HR Solution Database Schema (Bahrain & GCC Ready)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `indemnity_calculations`;
DROP TABLE IF EXISTS `loan_repayments`;
DROP TABLE IF EXISTS `loans`;
DROP TABLE IF EXISTS `payslips`;
DROP TABLE IF EXISTS `payroll_periods`;
DROP TABLE IF EXISTS `leave_applications`;
DROP TABLE IF EXISTS `leave_types`;
DROP TABLE IF EXISTS `holidays`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `employee_documents`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `designations`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `settings`;

-- 1. System Settings Table
CREATE TABLE `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `company_name` VARCHAR(255) NOT NULL DEFAULT 'Gulf Enterprise HR & Payroll Co.',
    `cr_no` VARCHAR(100) DEFAULT 'CR-104928-BH',
    `tax_number` VARCHAR(100) DEFAULT '',
    `country` VARCHAR(50) NOT NULL DEFAULT 'Bahrain',
    `country_code` VARCHAR(10) NOT NULL DEFAULT 'BH',
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'Asia/Bahrain',
    `date_format` VARCHAR(30) NOT NULL DEFAULT 'd/m/Y',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'BHD',
    `currency_symbol` VARCHAR(10) NOT NULL DEFAULT 'BD',
    `currency_decimals` INT NOT NULL DEFAULT 3,
    
    -- GOSI / Social Insurance Defaults
    `gosi_citizen_emp_rate` DECIMAL(5,2) NOT NULL DEFAULT 7.00,
    `gosi_citizen_comp_rate` DECIMAL(5,2) NOT NULL DEFAULT 12.00,
    `gosi_expat_emp_rate` DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    `gosi_expat_comp_rate` DECIMAL(5,2) NOT NULL DEFAULT 3.00,
    
    -- LMRA & Labor Regulations
    `lmra_monthly_fee` DECIMAL(10,3) NOT NULL DEFAULT 10.000,
    `work_hours_per_day` DECIMAL(4,2) NOT NULL DEFAULT 8.00,
    `work_days_per_month` INT NOT NULL DEFAULT 30,
    
    -- Overtime Multipliers (Bahrain Labor Law)
    `ot_normal_multiplier` DECIMAL(4,2) NOT NULL DEFAULT 1.25,
    `ot_night_multiplier` DECIMAL(4,2) NOT NULL DEFAULT 1.50,
    `ot_holiday_multiplier` DECIMAL(4,2) NOT NULL DEFAULT 2.00,
    
    -- Indemnity / End of Service Rules
    `indemnity_tier1_max_years` INT NOT NULL DEFAULT 3,
    `indemnity_tier1_days_per_year` DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    `indemnity_tier2_days_per_year` DECIMAL(5,2) NOT NULL DEFAULT 30.00,
    
    `company_address` TEXT,
    `company_phone` VARCHAR(50) DEFAULT '+973 1700 0000',
    `company_email` VARCHAR(100) DEFAULT 'hr@gulfenterprise.bh',
    `logo_url` VARCHAR(255) DEFAULT '',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Departments Table
CREATE TABLE `departments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Designations Table
CREATE TABLE `designations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `department_id` INT,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Employees Table
CREATE TABLE `employees` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `emp_code` VARCHAR(30) NOT NULL UNIQUE,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) UNIQUE,
    `phone` VARCHAR(50),
    `gender` ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
    `dob` DATE,
    `nationality` VARCHAR(100) DEFAULT 'Bahraini',
    `is_gcc_citizen` TINYINT(1) DEFAULT 1,
    
    -- Identification & Expiries
    `cpr_no` VARCHAR(50) NOT NULL,
    `cpr_expiry` DATE,
    `passport_no` VARCHAR(50),
    `passport_expiry` DATE,
    `visa_no` VARCHAR(50),
    `visa_expiry` DATE,
    `driving_license_no` VARCHAR(50),
    `driving_license_expiry` DATE,
    `insurance_no` VARCHAR(50),
    `insurance_expiry` DATE,
    `gosi_no` VARCHAR(50),
    `lmra_no` VARCHAR(50),
    
    -- Employment Details
    `department_id` INT,
    `designation_id` INT,
    `date_of_joining` DATE NOT NULL,
    `date_of_leaving` DATE DEFAULT NULL,
    `employment_type` ENUM('Full-Time', 'Part-Time', 'Contract', 'Probation') DEFAULT 'Full-Time',
    `status` ENUM('Active', 'On Leave', 'Terminated', 'Resigned') DEFAULT 'Active',
    
    -- Salary & Allowance Structure (Bahrain Specific BHD)
    `basic_salary` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `housing_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `transport_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `car_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `mobile_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `food_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `other_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    
    -- Banking Details
    `bank_name` VARCHAR(100),
    `iban` VARCHAR(50),
    `bank_account_no` VARCHAR(50),
    
    `profile_photo` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`designation_id`) REFERENCES `designations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Users & Auth Table (Admin & Employee login)
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` INT NULL UNIQUE,
    `username` VARCHAR(80) NOT NULL UNIQUE,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'hr', 'employee') NOT NULL DEFAULT 'employee',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `last_login` DATETIME DEFAULT NULL,
    `api_token` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Employee Documents / Attachments Table with Expiries
CREATE TABLE `employee_documents` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` INT NOT NULL,
    `doc_type` ENUM('CPR', 'Passport', 'Visa', 'Contract', 'Driving License', 'Insurance', 'Certificate', 'Offer Letter', 'Other') NOT NULL,
    `doc_name` VARCHAR(200) NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `file_size` INT DEFAULT 0,
    `file_ext` VARCHAR(20) DEFAULT '',
    `issue_date` DATE DEFAULT NULL,
    `expiry_date` DATE DEFAULT NULL,
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Holidays Table
CREATE TABLE `holidays` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `holiday_date` DATE NOT NULL,
    `holiday_year` INT NOT NULL,
    `is_recurring` TINYINT(1) DEFAULT 0,
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Leave Types Table
CREATE TABLE `leave_types` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `days_allowed_per_year` INT NOT NULL DEFAULT 30,
    `is_paid` TINYINT(1) DEFAULT 1,
    `carry_forward` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Leave Applications Table
CREATE TABLE `leave_applications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` INT NOT NULL,
    `leave_type_id` INT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `total_days` DECIMAL(5,2) NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('Pending', 'Approved', 'Rejected', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `approved_by` INT DEFAULT NULL,
    `approved_at` DATETIME DEFAULT NULL,
    `rejection_reason` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Attendance Table
CREATE TABLE `attendance` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` INT NOT NULL,
    `date` DATE NOT NULL,
    `check_in` TIME DEFAULT NULL,
    `check_out` TIME DEFAULT NULL,
    `total_hours` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    `status` ENUM('Present', 'Absent', 'Half Day', 'Holiday', 'On Leave', 'Weekend') NOT NULL DEFAULT 'Present',
    `ot_hours` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    `ot_rate_applied` DECIMAL(4,2) NOT NULL DEFAULT 1.25,
    `source` VARCHAR(50) DEFAULT 'Biometric CSV',
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_emp_date` (`employee_id`, `date`),
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Loans & Advances Table
CREATE TABLE `loans` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` INT NOT NULL,
    `loan_title` VARCHAR(150) NOT NULL DEFAULT 'Personal Salary Advance',
    `loan_amount` DECIMAL(12,3) NOT NULL,
    `monthly_installment` DECIMAL(12,3) NOT NULL,
    `total_installments` INT NOT NULL,
    `paid_installments` INT NOT NULL DEFAULT 0,
    `remaining_amount` DECIMAL(12,3) NOT NULL,
    `start_month` INT NOT NULL,
    `start_year` INT NOT NULL,
    `status` ENUM('Active', 'Completed', 'Paused', 'Cancelled') NOT NULL DEFAULT 'Active',
    `reason` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Payroll Periods Table
CREATE TABLE `payroll_periods` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `month` INT NOT NULL,
    `year` INT NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `status` ENUM('Draft', 'Processing', 'Approved', 'Paid') NOT NULL DEFAULT 'Draft',
    `total_gross` DECIMAL(14,3) NOT NULL DEFAULT 0.000,
    `total_deductions` DECIMAL(14,3) NOT NULL DEFAULT 0.000,
    `total_net` DECIMAL(14,3) NOT NULL DEFAULT 0.000,
    `total_employees` INT NOT NULL DEFAULT 0,
    `processed_by` INT DEFAULT NULL,
    `processed_at` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_payroll_month_year` (`month`, `year`),
    FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Payslips Table (Detailed Bahrain / Gulf calculation)
CREATE TABLE `payslips` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `payroll_period_id` INT NOT NULL,
    `employee_id` INT NOT NULL,
    
    -- Earnings breakdown
    `basic_salary` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `housing_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `transport_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `car_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `mobile_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `food_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `other_allowance` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    
    -- Overtime & Attendance Adjustments
    `present_days` INT NOT NULL DEFAULT 30,
    `absent_days` INT NOT NULL DEFAULT 0,
    `leave_days` INT NOT NULL DEFAULT 0,
    `ot_hours` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `ot_amount` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `leave_salary` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `bonus` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `total_earnings` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    
    -- Deductions
    `gosi_employee_deduction` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `gosi_employer_contribution` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `lmra_monthly_fee` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `loan_deduction` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `absent_deduction` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `other_deduction` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `total_deductions` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    
    -- Net Amount
    `net_salary` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `payment_status` ENUM('Unpaid', 'Paid') NOT NULL DEFAULT 'Unpaid',
    `payment_method` ENUM('Bank Transfer / SBP', 'Cheque', 'Cash') DEFAULT 'Bank Transfer / SBP',
    `payment_date` DATE DEFAULT NULL,
    `remarks` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY `unique_payslip_period_emp` (`payroll_period_id`, `employee_id`),
    FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Loan Repayments Record
CREATE TABLE `loan_repayments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `loan_id` INT NOT NULL,
    `payslip_id` INT DEFAULT NULL,
    `amount` DECIMAL(12,3) NOT NULL,
    `repayment_date` DATE NOT NULL,
    `notes` VARCHAR(255) DEFAULT 'Automated payroll deduction',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`loan_id`) REFERENCES `loans`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`payslip_id`) REFERENCES `payslips`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Indemnity / End of Service (EOSB) Calculations Table
CREATE TABLE `indemnity_calculations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employee_id` INT NOT NULL,
    `calculation_date` DATE NOT NULL,
    `joining_date` DATE NOT NULL,
    `exit_date` DATE NOT NULL,
    `service_years` INT NOT NULL DEFAULT 0,
    `service_months` INT NOT NULL DEFAULT 0,
    `service_days` INT NOT NULL DEFAULT 0,
    `last_basic_salary` DECIMAL(12,3) NOT NULL,
    `tier1_days` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    `tier1_amount` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `tier2_days` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    `tier2_amount` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `total_indemnity` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `leave_encashment_amount` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `other_dues` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `deductions_amount` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `final_settlement_amount` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
    `reason` ENUM('Resignation', 'Termination', 'Contract Completion', 'Retirement', 'Other') DEFAULT 'Contract Completion',
    `status` ENUM('Draft', 'Approved', 'Paid') NOT NULL DEFAULT 'Draft',
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
