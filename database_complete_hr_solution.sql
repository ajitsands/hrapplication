-- ============================================================
-- Gulf HR Enterprise Database Complete Dump for cPanel Import
-- Target: hr.trackmyteam.us
-- Generated on: 2026-10-11 09:09:47
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- Table structure for `attendance`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `shift_id` int(11) DEFAULT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `early_in_mins` int(11) NOT NULL DEFAULT '0',
  `late_in_mins` int(11) NOT NULL DEFAULT '0',
  `early_out_mins` int(11) NOT NULL DEFAULT '0',
  `total_hours` decimal(4,2) NOT NULL DEFAULT '0.00',
  `status` enum('Present','Absent','Half Day','Holiday','On Leave','Weekend') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Present',
  `ot_hours` decimal(4,2) NOT NULL DEFAULT '0.00',
  `day_ot_hours` decimal(4,2) NOT NULL DEFAULT '0.00',
  `night_ot_hours` decimal(4,2) NOT NULL DEFAULT '0.00',
  `holiday_ot_hours` decimal(4,2) NOT NULL DEFAULT '0.00',
  `ot_rate_applied` decimal(4,2) NOT NULL DEFAULT '1.25',
  `source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Biometric CSV',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_emp_date` (`employee_id`,`date`),
  KEY `fk_attendance_shift` (`shift_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendance_shift` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `attendance`
INSERT INTO `attendance` (`id`, `employee_id`, `date`, `shift_id`, `check_in`, `check_out`, `early_in_mins`, `late_in_mins`, `early_out_mins`, `total_hours`, `status`, `ot_hours`, `day_ot_hours`, `night_ot_hours`, `holiday_ot_hours`, `ot_rate_applied`, `source`, `notes`, `created_at`) VALUES
('1', '1', '2026-10-01', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('2', '2', '2026-10-01', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('3', '3', '2026-10-01', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('4', '4', '2026-10-01', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('5', '5', '2026-10-01', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('6', '1', '2026-10-02', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('7', '2', '2026-10-02', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('8', '3', '2026-10-02', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('9', '4', '2026-10-02', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('10', '5', '2026-10-02', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('11', '1', '2026-10-03', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('12', '2', '2026-10-03', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('13', '3', '2026-10-03', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('14', '4', '2026-10-03', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('15', '5', '2026-10-03', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('16', '1', '2026-10-04', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('17', '2', '2026-10-04', NULL, '08:00:00', '18:00:00', '0', '0', '0', '10.50', 'Present', '2.50', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('18', '3', '2026-10-04', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('19', '4', '2026-10-04', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('20', '5', '2026-10-04', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('21', '1', '2026-10-05', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('22', '2', '2026-10-05', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('23', '3', '2026-10-05', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('24', '4', '2026-10-05', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('25', '5', '2026-10-05', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('26', '1', '2026-10-06', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('27', '2', '2026-10-06', NULL, '08:00:00', '18:00:00', '0', '0', '0', '10.50', 'Present', '2.50', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('28', '3', '2026-10-06', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('29', '4', '2026-10-06', NULL, '08:00:00', '17:00:00', '0', '0', '0', '9.50', 'Present', '1.50', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('30', '5', '2026-10-06', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('31', '1', '2026-10-07', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('32', '2', '2026-10-07', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('33', '3', '2026-10-07', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('34', '4', '2026-10-07', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('35', '5', '2026-10-07', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('36', '1', '2026-10-08', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('37', '2', '2026-10-08', NULL, '08:00:00', '18:00:00', '0', '0', '0', '10.50', 'Present', '2.50', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('38', '3', '2026-10-08', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('39', '4', '2026-10-08', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('40', '5', '2026-10-08', NULL, '08:00:00', '16:00:00', '0', '0', '0', '8.00', 'Present', '0.00', '0.00', '0.00', '0.00', '1.25', 'Biometric CSV', 'Normal Punch', '2026-10-11 00:50:12'),
('41', '1', '2026-10-09', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('42', '2', '2026-10-09', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('43', '3', '2026-10-09', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('44', '4', '2026-10-09', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('45', '5', '2026-10-09', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('46', '1', '2026-10-10', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('47', '2', '2026-10-10', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('48', '3', '2026-10-10', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('49', '4', '2026-10-10', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12'),
('50', '5', '2026-10-10', NULL, NULL, NULL, '0', '0', '0', '0.00', 'Weekend', '0.00', '0.00', '0.00', '0.00', '1.50', 'System', 'Gulf Weekend', '2026-10-11 00:50:12');

-- ------------------------------------------------------------
-- Table structure for `departments`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `default_shift_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_dept_default_shift` (`default_shift_id`),
  CONSTRAINT `fk_dept_default_shift` FOREIGN KEY (`default_shift_id`) REFERENCES `shifts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `departments`
INSERT INTO `departments` (`id`, `name`, `code`, `description`, `default_shift_id`, `created_at`) VALUES
('1', 'Human Resources & Admin', 'HR', 'Manages employee lifecycle, talent, and administration', '1', '2026-10-11 00:50:11'),
('2', 'Information Technology', 'IT', 'Software development, infrastructure, and technical support', '1', '2026-10-11 00:50:11'),
('3', 'Finance & Accounts', 'FIN', 'Payroll, accounting, financial planning, and audit', '1', '2026-10-11 00:50:11'),
('4', 'Operations & Logistics', 'OPS', 'Day-to-day operations and supply chain management', '1', '2026-10-11 00:50:11'),
('5', 'Sales & Business Dev', 'SBD', 'Commercial operations, client relations, and growth', '1', '2026-10-11 00:50:11');

-- ------------------------------------------------------------
-- Table structure for `designations`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `designations`;
CREATE TABLE `designations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `designations_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `designations`
INSERT INTO `designations` (`id`, `name`, `department_id`, `description`, `created_at`) VALUES
('1', 'HR Director', '1', 'Head of HR', '2026-10-11 00:50:11'),
('2', 'HR Specialist', '1', 'HR Operations', '2026-10-11 00:50:11'),
('3', 'Lead Software Engineer', '2', 'Senior tech architect', '2026-10-11 00:50:11'),
('4', 'Full Stack Developer', '2', 'Core engineer', '2026-10-11 00:50:11'),
('5', 'Chief Accountant', '3', 'Head of finance', '2026-10-11 00:50:11'),
('6', 'Payroll Accountant', '3', 'Handles salary and tax', '2026-10-11 00:50:11'),
('7', 'Operations Manager', '4', 'Oversees logistics', '2026-10-11 00:50:11'),
('8', 'Business Development Executive', '5', 'Sales client specialist', '2026-10-11 00:50:11');

-- ------------------------------------------------------------
-- Table structure for `employee_documents`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `employee_documents`;
CREATE TABLE `employee_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `doc_type` enum('CPR','Passport','Visa','Contract','Driving License','Insurance','Certificate','Offer Letter','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `doc_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int(11) DEFAULT '0',
  `file_ext` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `employee_documents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `employee_documents`
INSERT INTO `employee_documents` (`id`, `employee_id`, `doc_type`, `doc_name`, `file_path`, `file_size`, `file_ext`, `issue_date`, `expiry_date`, `notes`, `created_at`) VALUES
('1', '1', 'CPR', 'Ahmed Al-Hussaini CPR Card', 'uploads/docs/cpr_emp001.pdf', '245000', 'pdf', '2022-04-15', '2027-04-15', 'Valid CPR Card', '2026-10-11 00:50:12'),
('2', '1', 'Passport', 'Ahmed Bahraini Passport', 'uploads/docs/passport_emp001.pdf', '312000', 'pdf', '2023-10-12', '2028-10-12', 'Primary Travel Document', '2026-10-11 00:50:12'),
('3', '2', 'CPR', 'Rahul Sharma CPR Smart Card', 'uploads/docs/cpr_emp002.pdf', '198000', 'pdf', '2024-11-05', '2026-11-05', 'Expiring soon in 25 days!', '2026-10-11 00:50:12'),
('4', '2', 'Visa', 'LMRA Work Residence Permit', 'uploads/docs/visa_emp002.pdf', '415000', 'pdf', '2024-11-05', '2026-11-05', 'Renewal requested with LMRA', '2026-10-11 00:50:12'),
('5', '2', 'Passport', 'Indian Passport Booklet', 'uploads/docs/passport_emp002.pdf', '520000', 'pdf', '2017-06-15', '2027-06-15', 'Valid passport', '2026-10-11 00:50:12'),
('6', '4', 'Passport', 'Michael Santos Passport', 'uploads/docs/passport_emp004.pdf', '480000', 'pdf', '2016-11-28', '2026-11-28', 'Expiring in November 2026!', '2026-10-11 00:50:12'),
('7', '4', 'CPR', 'Michael Santos CPR', 'uploads/docs/cpr_emp004.pdf', '210000', 'pdf', '2025-03-05', '2027-03-05', 'Valid Smart Card', '2026-10-11 00:50:12');

-- ------------------------------------------------------------
-- Table structure for `employee_shift_assignments`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `employee_shift_assignments`;
CREATE TABLE `employee_shift_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `shift_id` int(11) NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `shift_id` (`shift_id`),
  CONSTRAINT `employee_shift_assignments_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employee_shift_assignments_ibfk_2` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `employees`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `emp_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('Male','Female','Other') COLLATE utf8mb4_unicode_ci DEFAULT 'Male',
  `dob` date DEFAULT NULL,
  `nationality` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Bahraini',
  `is_gcc_citizen` tinyint(1) DEFAULT '1',
  `cpr_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cpr_expiry` date DEFAULT NULL,
  `passport_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport_expiry` date DEFAULT NULL,
  `visa_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visa_expiry` date DEFAULT NULL,
  `driving_license_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `driving_license_expiry` date DEFAULT NULL,
  `insurance_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `insurance_expiry` date DEFAULT NULL,
  `gosi_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lmra_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `designation_id` int(11) DEFAULT NULL,
  `date_of_joining` date NOT NULL,
  `date_of_leaving` date DEFAULT NULL,
  `employment_type` enum('Full-Time','Part-Time','Contract','Probation') COLLATE utf8mb4_unicode_ci DEFAULT 'Full-Time',
  `status` enum('Active','On Leave','Terminated','Resigned') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `basic_salary` decimal(12,3) NOT NULL DEFAULT '0.000',
  `housing_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `transport_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `car_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `mobile_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `food_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `other_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iban` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `emp_code` (`emp_code`),
  UNIQUE KEY `email` (`email`),
  KEY `department_id` (`department_id`),
  KEY `designation_id` (`designation_id`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`designation_id`) REFERENCES `designations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `employees`
INSERT INTO `employees` (`id`, `emp_code`, `first_name`, `last_name`, `email`, `phone`, `gender`, `dob`, `nationality`, `is_gcc_citizen`, `cpr_no`, `cpr_expiry`, `passport_no`, `passport_expiry`, `visa_no`, `visa_expiry`, `driving_license_no`, `driving_license_expiry`, `insurance_no`, `insurance_expiry`, `gosi_no`, `lmra_no`, `department_id`, `designation_id`, `date_of_joining`, `date_of_leaving`, `employment_type`, `status`, `basic_salary`, `housing_allowance`, `transport_allowance`, `car_allowance`, `mobile_allowance`, `food_allowance`, `other_allowance`, `bank_name`, `iban`, `bank_account_no`, `profile_photo`, `created_at`, `updated_at`) VALUES
('1', 'EMP-001', 'Ahmed', 'Al-Hussaini', 'ahmed.hussaini@alkhaleejtech.bh', '+973 3948 1122', 'Male', '1988-04-15', 'Bahraini', '1', '880415982', '2027-04-15', 'BH-894210', '2028-10-12', 'CITIZEN', '2099-12-31', 'DL-982104', '2026-11-20', 'INS-BH-001', '2027-01-01', 'GOSI-9842110', 'NA-CITIZEN', '1', '1', '2021-02-01', NULL, 'Full-Time', 'Active', '1400.000', '300.000', '100.000', '100.000', '50.000', '0.000', '50.000', 'National Bank of Bahrain (NBB)', 'BH29NBOB00001234567890', '001234567890', NULL, '2026-10-11 00:50:12', '2026-10-11 00:50:12'),
('2', 'EMP-002', 'Rahul', 'Sharma', 'rahul.sharma@alkhaleejtech.bh', '+973 3811 4455', 'Male', '1992-08-22', 'Indian', '0', '920822104', '2026-11-05', 'Z9482019', '2027-06-15', 'LMRA-V-8849102', '2026-11-05', 'DL-448201', '2028-05-10', 'INS-EX-002', '2026-12-31', 'GOSI-4820192', 'LMRA-984210', '2', '3', '2022-06-15', NULL, 'Full-Time', 'Active', '950.000', '200.000', '50.000', '50.000', '30.000', '50.000', '0.000', 'Ahli United Bank (AUB)', 'BH64AUBB00009876543210', '009876543210', NULL, '2026-10-11 00:50:12', '2026-10-11 00:50:12'),
('3', 'EMP-003', 'Fatima', 'Al-Mansoori', 'fatima.mansoori@alkhaleejtech.bh', '+973 3655 7788', 'Female', '1995-11-10', 'Bahraini', '1', '951110482', '2028-11-10', 'BH-774829', '2029-01-20', 'CITIZEN', '2099-12-31', 'DL-559102', '2027-08-14', 'INS-BH-003', '2027-01-01', 'GOSI-5592810', 'NA-CITIZEN', '3', '6', '2023-01-10', NULL, 'Full-Time', 'Active', '750.000', '150.000', '50.000', '0.000', '25.000', '0.000', '0.000', 'Bank of Bahrain and Kuwait (BBK)', 'BH48BBKU00004561237890', '000456123789', NULL, '2026-10-11 00:50:12', '2026-10-11 00:50:12'),
('4', 'EMP-004', 'Michael', 'Santos', 'michael.santos@alkhaleejtech.bh', '+973 3722 9900', 'Male', '1990-03-05', 'Filipino', '0', '900305881', '2027-03-05', 'P5849102B', '2026-11-28', 'LMRA-V-9948201', '2027-03-05', 'DL-772910', '2028-09-12', 'INS-EX-004', '2026-12-31', 'GOSI-7729104', 'LMRA-772910', '4', '7', '2023-08-01', NULL, 'Full-Time', 'Active', '600.000', '150.000', '50.000', '50.000', '20.000', '40.000', '0.000', 'Ithmaar Bank', 'BH12ITHM00007894561230', '000789456123', NULL, '2026-10-11 00:50:12', '2026-10-11 00:50:12'),
('5', 'EMP-005', 'Maryam', 'Al-Doseri', 'maryam.doseri@alkhaleejtech.bh', '+973 3999 1234', 'Female', '1997-07-19', 'Bahraini', '1', '970719882', '2029-07-19', 'BH-991823', '2030-02-14', 'CITIZEN', '2099-12-31', 'DL-994812', '2028-11-20', 'INS-BH-005', '2027-01-01', 'GOSI-9948120', 'NA-CITIZEN', '2', '4', '2024-02-01', NULL, 'Full-Time', 'Active', '800.000', '150.000', '50.000', '0.000', '25.000', '0.000', '0.000', 'BisB (Bahrain Islamic Bank)', 'BH98BISB00008899776655', '000889977665', NULL, '2026-10-11 00:50:12', '2026-10-11 00:50:12');

-- ------------------------------------------------------------
-- Table structure for `holidays`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `holidays`;
CREATE TABLE `holidays` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `holiday_date` date NOT NULL,
  `holiday_year` int(11) NOT NULL,
  `is_recurring` tinyint(1) DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `holidays`
INSERT INTO `holidays` (`id`, `name`, `holiday_date`, `holiday_year`, `is_recurring`, `description`, `created_at`) VALUES
('1', 'New Year\'s Day', '2026-01-01', '2026', '1', 'Public Holiday', '2026-10-11 00:50:11'),
('2', 'Labour Day', '2026-05-01', '2026', '1', 'Worker\'s Day', '2026-10-11 00:50:11'),
('3', 'Eid Al-Fitr Day 1', '2026-03-20', '2026', '0', 'Islamic Holiday', '2026-10-11 00:50:12'),
('4', 'Eid Al-Fitr Day 2', '2026-03-21', '2026', '0', 'Islamic Holiday', '2026-10-11 00:50:12'),
('5', 'Eid Al-Fitr Day 3', '2026-03-22', '2026', '0', 'Islamic Holiday', '2026-10-11 00:50:12'),
('6', 'Arafat Day', '2026-05-27', '2026', '0', 'Islamic Holiday', '2026-10-11 00:50:12'),
('7', 'Eid Al-Adha Day 1', '2026-05-28', '2026', '0', 'Islamic Holiday', '2026-10-11 00:50:12'),
('8', 'Eid Al-Adha Day 2', '2026-05-29', '2026', '0', 'Islamic Holiday', '2026-10-11 00:50:12'),
('9', 'Islamic New Year (Muharram)', '2026-06-17', '2026', '0', 'Islamic Holiday', '2026-10-11 00:50:12'),
('10', 'National Day of Bahrain', '2026-12-16', '2026', '1', 'National Celebration', '2026-10-11 00:50:12'),
('11', 'National Day Holiday', '2026-12-17', '2026', '1', 'National Celebration', '2026-10-11 00:50:12');

-- ------------------------------------------------------------
-- Table structure for `indemnity_calculations`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `indemnity_calculations`;
CREATE TABLE `indemnity_calculations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `calculation_date` date NOT NULL,
  `joining_date` date NOT NULL,
  `exit_date` date NOT NULL,
  `service_years` int(11) NOT NULL DEFAULT '0',
  `service_months` int(11) NOT NULL DEFAULT '0',
  `service_days` int(11) NOT NULL DEFAULT '0',
  `last_basic_salary` decimal(12,3) NOT NULL,
  `tier1_days` decimal(6,2) NOT NULL DEFAULT '0.00',
  `tier1_amount` decimal(12,3) NOT NULL DEFAULT '0.000',
  `tier2_days` decimal(6,2) NOT NULL DEFAULT '0.00',
  `tier2_amount` decimal(12,3) NOT NULL DEFAULT '0.000',
  `total_indemnity` decimal(12,3) NOT NULL DEFAULT '0.000',
  `leave_encashment_amount` decimal(12,3) NOT NULL DEFAULT '0.000',
  `other_dues` decimal(12,3) NOT NULL DEFAULT '0.000',
  `deductions_amount` decimal(12,3) NOT NULL DEFAULT '0.000',
  `final_settlement_amount` decimal(12,3) NOT NULL DEFAULT '0.000',
  `reason` enum('Resignation','Termination','Contract Completion','Retirement','Other') COLLATE utf8mb4_unicode_ci DEFAULT 'Contract Completion',
  `status` enum('Draft','Approved','Paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `indemnity_calculations_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `leave_applications`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `leave_applications`;
CREATE TABLE `leave_applications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` decimal(5,2) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Pending','Approved','Rejected','Cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `leave_type_id` (`leave_type_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `leave_applications_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_applications_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `leave_applications_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `leave_applications`
INSERT INTO `leave_applications` (`id`, `employee_id`, `leave_type_id`, `start_date`, `end_date`, `total_days`, `reason`, `status`, `approved_by`, `approved_at`, `rejection_reason`, `created_at`) VALUES
('1', '3', '1', '2026-10-15', '2026-10-20', '5.00', 'Annual family holiday in Salalah', 'Approved', '1', '2026-10-01 10:30:00', NULL, '2026-10-11 00:50:12'),
('2', '2', '2', '2026-10-25', '2026-10-26', '2.00', 'Dental surgical treatment', 'Pending', NULL, NULL, NULL, '2026-10-11 00:50:12');

-- ------------------------------------------------------------
-- Table structure for `leave_types`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `leave_types`;
CREATE TABLE `leave_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `days_allowed_per_year` int(11) NOT NULL DEFAULT '30',
  `is_paid` tinyint(1) DEFAULT '1',
  `carry_forward` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `leave_types`
INSERT INTO `leave_types` (`id`, `name`, `days_allowed_per_year`, `is_paid`, `carry_forward`, `created_at`) VALUES
('1', 'Annual Leave', '30', '1', '1', '2026-10-11 00:50:11'),
('2', 'Sick Leave', '15', '1', '0', '2026-10-11 00:50:11'),
('3', 'Maternity Leave', '60', '1', '0', '2026-10-11 00:50:11'),
('4', 'Emergency / Casual Leave', '6', '1', '0', '2026-10-11 00:50:11'),
('5', 'Hajj Leave', '14', '1', '0', '2026-10-11 00:50:11'),
('6', 'Unpaid Leave', '30', '0', '0', '2026-10-11 00:50:11');

-- ------------------------------------------------------------
-- Table structure for `loan_repayments`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `loan_repayments`;
CREATE TABLE `loan_repayments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) NOT NULL,
  `payslip_id` int(11) DEFAULT NULL,
  `amount` decimal(12,3) NOT NULL,
  `repayment_date` date NOT NULL,
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Automated payroll deduction',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `loan_id` (`loan_id`),
  KEY `payslip_id` (`payslip_id`),
  CONSTRAINT `loan_repayments_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `loan_repayments_ibfk_2` FOREIGN KEY (`payslip_id`) REFERENCES `payslips` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table structure for `loans`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `loans`;
CREATE TABLE `loans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `loan_title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Personal Salary Advance',
  `loan_amount` decimal(12,3) NOT NULL,
  `monthly_installment` decimal(12,3) NOT NULL,
  `total_installments` int(11) NOT NULL,
  `paid_installments` int(11) NOT NULL DEFAULT '0',
  `remaining_amount` decimal(12,3) NOT NULL,
  `start_month` int(11) NOT NULL,
  `start_year` int(11) NOT NULL,
  `status` enum('Active','Completed','Paused','Cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `loans`
INSERT INTO `loans` (`id`, `employee_id`, `loan_title`, `loan_amount`, `monthly_installment`, `total_installments`, `paid_installments`, `remaining_amount`, `start_month`, `start_year`, `status`, `reason`, `created_at`) VALUES
('1', '2', 'Personal Emergency Advance', '600.000', '100.000', '6', '2', '400.000', '8', '2026', 'Active', 'Medical assistance in home country', '2026-10-11 00:50:12'),
('2', '4', 'Vehicle Purchase Loan', '500.000', '50.000', '10', '1', '450.000', '9', '2026', 'Active', 'Used car purchase', '2026-10-11 00:50:12');

-- ------------------------------------------------------------
-- Table structure for `payroll_periods`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `payroll_periods`;
CREATE TABLE `payroll_periods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Draft','Processing','Approved','Paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `total_gross` decimal(14,3) NOT NULL DEFAULT '0.000',
  `total_deductions` decimal(14,3) NOT NULL DEFAULT '0.000',
  `total_net` decimal(14,3) NOT NULL DEFAULT '0.000',
  `total_employees` int(11) NOT NULL DEFAULT '0',
  `processed_by` int(11) DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_payroll_month_year` (`month`,`year`),
  KEY `processed_by` (`processed_by`),
  CONSTRAINT `payroll_periods_ibfk_1` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `payroll_periods`
INSERT INTO `payroll_periods` (`id`, `month`, `year`, `title`, `start_date`, `end_date`, `status`, `total_gross`, `total_deductions`, `total_net`, `total_employees`, `processed_by`, `processed_at`, `created_at`) VALUES
('1', '10', '2026', 'October 2026 Payroll', '2026-10-01', '2026-10-31', 'Processing', '6281.797', '414.000', '5867.797', '5', '1', '2026-10-11 01:07:17', '2026-10-11 01:07:17');

-- ------------------------------------------------------------
-- Table structure for `payslips`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `payslips`;
CREATE TABLE `payslips` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `payroll_period_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `basic_salary` decimal(12,3) NOT NULL DEFAULT '0.000',
  `housing_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `transport_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `car_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `mobile_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `food_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `other_allowance` decimal(12,3) NOT NULL DEFAULT '0.000',
  `present_days` int(11) NOT NULL DEFAULT '30',
  `absent_days` int(11) NOT NULL DEFAULT '0',
  `leave_days` int(11) NOT NULL DEFAULT '0',
  `ot_hours` decimal(5,2) NOT NULL DEFAULT '0.00',
  `ot_amount` decimal(12,3) NOT NULL DEFAULT '0.000',
  `day_ot_hours` decimal(4,2) NOT NULL DEFAULT '0.00',
  `day_ot_amount` decimal(12,3) NOT NULL DEFAULT '0.000',
  `night_ot_hours` decimal(4,2) NOT NULL DEFAULT '0.00',
  `night_ot_amount` decimal(12,3) NOT NULL DEFAULT '0.000',
  `holiday_ot_hours` decimal(4,2) NOT NULL DEFAULT '0.00',
  `holiday_ot_amount` decimal(12,3) NOT NULL DEFAULT '0.000',
  `leave_salary` decimal(12,3) NOT NULL DEFAULT '0.000',
  `bonus` decimal(12,3) NOT NULL DEFAULT '0.000',
  `total_earnings` decimal(12,3) NOT NULL DEFAULT '0.000',
  `gosi_employee_deduction` decimal(12,3) NOT NULL DEFAULT '0.000',
  `gosi_employer_contribution` decimal(12,3) NOT NULL DEFAULT '0.000',
  `lmra_monthly_fee` decimal(12,3) NOT NULL DEFAULT '0.000',
  `loan_deduction` decimal(12,3) NOT NULL DEFAULT '0.000',
  `absent_deduction` decimal(12,3) NOT NULL DEFAULT '0.000',
  `other_deduction` decimal(12,3) NOT NULL DEFAULT '0.000',
  `total_deductions` decimal(12,3) NOT NULL DEFAULT '0.000',
  `net_salary` decimal(12,3) NOT NULL DEFAULT '0.000',
  `payment_status` enum('Unpaid','Paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Unpaid',
  `payment_method` enum('Bank Transfer / SBP','Cheque','Cash') COLLATE utf8mb4_unicode_ci DEFAULT 'Bank Transfer / SBP',
  `payment_date` date DEFAULT NULL,
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_payslip_period_emp` (`payroll_period_id`,`employee_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `payslips_ibfk_1` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payslips_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `payslips`
INSERT INTO `payslips` (`id`, `payroll_period_id`, `employee_id`, `basic_salary`, `housing_allowance`, `transport_allowance`, `car_allowance`, `mobile_allowance`, `food_allowance`, `other_allowance`, `present_days`, `absent_days`, `leave_days`, `ot_hours`, `ot_amount`, `day_ot_hours`, `day_ot_amount`, `night_ot_hours`, `night_ot_amount`, `holiday_ot_hours`, `holiday_ot_amount`, `leave_salary`, `bonus`, `total_earnings`, `gosi_employee_deduction`, `gosi_employer_contribution`, `lmra_monthly_fee`, `loan_deduction`, `absent_deduction`, `other_deduction`, `total_deductions`, `net_salary`, `payment_status`, `payment_method`, `payment_date`, `remarks`, `created_at`) VALUES
('1', '1', '1', '1400.000', '300.000', '100.000', '100.000', '50.000', '0.000', '50.000', '6', '0', '0', '0.00', '0.000', '0.00', '0.000', '0.00', '0.000', '0.00', '0.000', '0.000', '0.000', '2000.000', '119.000', '204.000', '0.000', '0.000', '0.000', '0.000', '119.000', '1881.000', 'Unpaid', 'Bank Transfer / SBP', NULL, 'Auto-calculated for Oct 2026 (OT: 0 hrs, Absent: 0 days, GOSI: 7%)', '2026-10-11 01:07:17'),
('2', '1', '2', '950.000', '200.000', '50.000', '50.000', '30.000', '50.000', '0.000', '6', '0', '0', '7.50', '37.109', '0.00', '0.000', '0.00', '0.000', '0.00', '0.000', '0.000', '0.000', '1367.109', '9.500', '28.500', '10.000', '100.000', '0.000', '0.000', '109.500', '1257.609', 'Unpaid', 'Bank Transfer / SBP', NULL, 'Auto-calculated for Oct 2026 (OT: 7.5 hrs, Absent: 0 days, GOSI: 1%)', '2026-10-11 01:07:17'),
('3', '1', '3', '750.000', '150.000', '50.000', '0.000', '25.000', '0.000', '0.000', '6', '0', '0', '0.00', '0.000', '0.00', '0.000', '0.00', '0.000', '0.00', '0.000', '0.000', '0.000', '975.000', '63.000', '108.000', '0.000', '0.000', '0.000', '0.000', '63.000', '912.000', 'Unpaid', 'Bank Transfer / SBP', NULL, 'Auto-calculated for Oct 2026 (OT: 0 hrs, Absent: 0 days, GOSI: 7%)', '2026-10-11 01:07:17'),
('4', '1', '4', '600.000', '150.000', '50.000', '50.000', '20.000', '40.000', '0.000', '6', '0', '0', '1.50', '4.688', '0.00', '0.000', '0.00', '0.000', '0.00', '0.000', '0.000', '0.000', '914.688', '6.000', '18.000', '10.000', '50.000', '0.000', '0.000', '56.000', '858.688', 'Unpaid', 'Bank Transfer / SBP', NULL, 'Auto-calculated for Oct 2026 (OT: 1.5 hrs, Absent: 0 days, GOSI: 1%)', '2026-10-11 01:07:17'),
('5', '1', '5', '800.000', '150.000', '50.000', '0.000', '25.000', '0.000', '0.000', '6', '0', '0', '0.00', '0.000', '0.00', '0.000', '0.00', '0.000', '0.00', '0.000', '0.000', '0.000', '1025.000', '66.500', '114.000', '0.000', '0.000', '0.000', '0.000', '66.500', '958.500', 'Unpaid', 'Bank Transfer / SBP', NULL, 'Auto-calculated for Oct 2026 (OT: 0 hrs, Absent: 0 days, GOSI: 7%)', '2026-10-11 01:07:17');

-- ------------------------------------------------------------
-- Table structure for `settings`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Gulf Enterprise HR & Payroll Co.',
  `cr_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'CR-104928-BH',
  `tax_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `country` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Bahrain',
  `country_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BH',
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Asia/Bahrain',
  `date_format` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'd/m/Y',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BHD',
  `currency_symbol` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BD',
  `currency_decimals` int(11) NOT NULL DEFAULT '3',
  `gosi_citizen_emp_rate` decimal(5,2) NOT NULL DEFAULT '7.00',
  `gosi_citizen_comp_rate` decimal(5,2) NOT NULL DEFAULT '12.00',
  `gosi_expat_emp_rate` decimal(5,2) NOT NULL DEFAULT '1.00',
  `gosi_expat_comp_rate` decimal(5,2) NOT NULL DEFAULT '3.00',
  `lmra_monthly_fee` decimal(10,3) NOT NULL DEFAULT '10.000',
  `work_hours_per_day` decimal(4,2) NOT NULL DEFAULT '8.00',
  `work_days_per_month` int(11) NOT NULL DEFAULT '30',
  `weekly_off_days` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Friday,Saturday',
  `ot_normal_multiplier` decimal(4,2) NOT NULL DEFAULT '1.25',
  `ot_night_multiplier` decimal(4,2) NOT NULL DEFAULT '1.50',
  `ot_holiday_multiplier` decimal(4,2) NOT NULL DEFAULT '2.00',
  `indemnity_tier1_max_years` int(11) NOT NULL DEFAULT '3',
  `indemnity_tier1_days_per_year` decimal(5,2) NOT NULL DEFAULT '15.00',
  `indemnity_tier2_days_per_year` decimal(5,2) NOT NULL DEFAULT '30.00',
  `company_address` text COLLATE utf8mb4_unicode_ci,
  `company_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '+973 1700 0000',
  `company_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'hr@gulfenterprise.bh',
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `settings`
INSERT INTO `settings` (`id`, `company_name`, `cr_no`, `tax_number`, `country`, `country_code`, `timezone`, `date_format`, `currency`, `currency_symbol`, `currency_decimals`, `gosi_citizen_emp_rate`, `gosi_citizen_comp_rate`, `gosi_expat_emp_rate`, `gosi_expat_comp_rate`, `lmra_monthly_fee`, `work_hours_per_day`, `work_days_per_month`, `weekly_off_days`, `ot_normal_multiplier`, `ot_night_multiplier`, `ot_holiday_multiplier`, `indemnity_tier1_max_years`, `indemnity_tier1_days_per_year`, `indemnity_tier2_days_per_year`, `company_address`, `company_phone`, `company_email`, `logo_url`, `updated_at`) VALUES
('1', 'SaNDS Lab Middle East W.L.L.', 'CR-181123-1-BH', 'VAT-0000000000', 'Bahrain', 'BH', 'Asia/Bahrain', 'd/m/Y', 'BHD', 'BD', '3', '7.00', '12.00', '1.00', '3.00', '10.000', '8.00', '30', 'Friday,Saturday', '1.25', '1.50', '2.00', '3', '15.00', '30.00', 'Building 450, Road 2810, Block 428, Seef District, Manama, Kingdom of Bahrain', '+973 35 078 079', 'admin@sandslab.com', '', '2026-10-11 13:17:44');

-- ------------------------------------------------------------
-- Table structure for `shift_roster`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `shift_roster`;
CREATE TABLE `shift_roster` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `shift_id` int(11) DEFAULT NULL,
  `is_off_day` tinyint(1) DEFAULT '0',
  `notes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_roster_emp_date` (`employee_id`,`date`),
  KEY `shift_id` (`shift_id`),
  CONSTRAINT `shift_roster_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shift_roster_ibfk_2` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=466 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `shift_roster`
INSERT INTO `shift_roster` (`id`, `employee_id`, `date`, `shift_id`, `is_off_day`, `notes`, `created_at`, `updated_at`) VALUES
('1', '3', '2026-10-01', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('2', '1', '2026-10-01', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('3', '5', '2026-10-01', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('4', '2', '2026-10-01', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('5', '4', '2026-10-01', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('6', '3', '2026-10-02', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('7', '1', '2026-10-02', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('8', '5', '2026-10-02', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('9', '2', '2026-10-02', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('10', '4', '2026-10-02', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('11', '3', '2026-10-03', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:45:08'),
('12', '1', '2026-10-03', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:45:08'),
('13', '5', '2026-10-03', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:45:08'),
('14', '2', '2026-10-03', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:45:08'),
('15', '4', '2026-10-03', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:45:08'),
('16', '3', '2026-10-04', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('17', '1', '2026-10-04', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('18', '5', '2026-10-04', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('19', '2', '2026-10-04', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('20', '4', '2026-10-04', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('21', '3', '2026-10-05', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('22', '1', '2026-10-05', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('23', '5', '2026-10-05', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('24', '2', '2026-10-05', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('25', '4', '2026-10-05', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('26', '3', '2026-10-06', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('27', '1', '2026-10-06', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('28', '5', '2026-10-06', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('29', '2', '2026-10-06', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('30', '4', '2026-10-06', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('31', '3', '2026-10-07', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('32', '1', '2026-10-07', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('33', '5', '2026-10-07', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('34', '2', '2026-10-07', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('35', '4', '2026-10-07', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('36', '3', '2026-10-08', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('37', '1', '2026-10-08', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('38', '5', '2026-10-08', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('39', '2', '2026-10-08', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('40', '4', '2026-10-08', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('41', '3', '2026-10-09', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('42', '1', '2026-10-09', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('43', '5', '2026-10-09', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('44', '2', '2026-10-09', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('45', '4', '2026-10-09', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('46', '3', '2026-10-10', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:45:08'),
('47', '1', '2026-10-10', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:45:08'),
('48', '5', '2026-10-10', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:45:08'),
('49', '2', '2026-10-10', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:45:08'),
('50', '4', '2026-10-10', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:45:08'),
('51', '3', '2026-10-11', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('52', '1', '2026-10-11', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('53', '5', '2026-10-11', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('54', '2', '2026-10-11', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('55', '4', '2026-10-11', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('56', '3', '2026-10-12', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('57', '1', '2026-10-12', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('58', '5', '2026-10-12', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:01', '2026-10-11 12:24:01'),
('59', '2', '2026-10-12', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('60', '4', '2026-10-12', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('61', '3', '2026-10-13', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('62', '1', '2026-10-13', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('63', '5', '2026-10-13', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('64', '2', '2026-10-13', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('65', '4', '2026-10-13', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('66', '3', '2026-10-14', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('67', '1', '2026-10-14', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('68', '5', '2026-10-14', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('69', '2', '2026-10-14', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('70', '4', '2026-10-14', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('71', '3', '2026-10-15', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('72', '1', '2026-10-15', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('73', '5', '2026-10-15', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('74', '2', '2026-10-15', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('75', '4', '2026-10-15', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('76', '3', '2026-10-16', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('77', '1', '2026-10-16', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('78', '5', '2026-10-16', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('79', '2', '2026-10-16', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('80', '4', '2026-10-16', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('81', '3', '2026-10-17', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('82', '1', '2026-10-17', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('83', '5', '2026-10-17', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('84', '2', '2026-10-17', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('85', '4', '2026-10-17', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('86', '3', '2026-10-18', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('87', '1', '2026-10-18', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('88', '5', '2026-10-18', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('89', '2', '2026-10-18', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('90', '4', '2026-10-18', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('91', '3', '2026-10-19', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('92', '1', '2026-10-19', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('93', '5', '2026-10-19', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('94', '2', '2026-10-19', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('95', '4', '2026-10-19', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('96', '3', '2026-10-20', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('97', '1', '2026-10-20', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('98', '5', '2026-10-20', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('99', '2', '2026-10-20', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('100', '4', '2026-10-20', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('101', '3', '2026-10-21', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('102', '1', '2026-10-21', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('103', '5', '2026-10-21', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('104', '2', '2026-10-21', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('105', '4', '2026-10-21', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('106', '3', '2026-10-22', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('107', '1', '2026-10-22', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('108', '5', '2026-10-22', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('109', '2', '2026-10-22', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('110', '4', '2026-10-22', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('111', '3', '2026-10-23', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('112', '1', '2026-10-23', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('113', '5', '2026-10-23', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('114', '2', '2026-10-23', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('115', '4', '2026-10-23', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('116', '3', '2026-10-24', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('117', '1', '2026-10-24', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('118', '5', '2026-10-24', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('119', '2', '2026-10-24', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('120', '4', '2026-10-24', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('121', '3', '2026-10-25', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('122', '1', '2026-10-25', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('123', '5', '2026-10-25', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('124', '2', '2026-10-25', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('125', '4', '2026-10-25', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('126', '3', '2026-10-26', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('127', '1', '2026-10-26', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('128', '5', '2026-10-26', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('129', '2', '2026-10-26', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('130', '4', '2026-10-26', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('131', '3', '2026-10-27', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('132', '1', '2026-10-27', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('133', '5', '2026-10-27', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('134', '2', '2026-10-27', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('135', '4', '2026-10-27', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('136', '3', '2026-10-28', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('137', '1', '2026-10-28', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('138', '5', '2026-10-28', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('139', '2', '2026-10-28', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('140', '4', '2026-10-28', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('141', '3', '2026-10-29', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('142', '1', '2026-10-29', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('143', '5', '2026-10-29', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('144', '2', '2026-10-29', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('145', '4', '2026-10-29', '1', '0', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('146', '3', '2026-10-30', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('147', '1', '2026-10-30', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('148', '5', '2026-10-30', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('149', '2', '2026-10-30', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('150', '4', '2026-10-30', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:24:02'),
('151', '3', '2026-10-31', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('152', '1', '2026-10-31', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('153', '5', '2026-10-31', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('154', '2', '2026-10-31', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08'),
('155', '4', '2026-10-31', NULL, '1', 'Monthly Department Roster Rotation', '2026-10-11 12:24:02', '2026-10-11 12:45:08');

-- ------------------------------------------------------------
-- Table structure for `shifts`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `shifts`;
CREATE TABLE `shifts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shift_type` enum('Standard','Night','Split','Flexible') COLLATE utf8mb4_unicode_ci DEFAULT 'Standard',
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `total_hours` decimal(4,2) NOT NULL DEFAULT '8.00',
  `break_minutes` int(11) NOT NULL DEFAULT '60',
  `grace_late_in` int(11) NOT NULL DEFAULT '15',
  `grace_early_out` int(11) NOT NULL DEFAULT '15',
  `half_day_min_hours` decimal(4,2) NOT NULL DEFAULT '4.00',
  `full_day_min_hours` decimal(4,2) NOT NULL DEFAULT '7.00',
  `is_night_shift` tinyint(1) DEFAULT '0',
  `split_start_time_2` time DEFAULT NULL,
  `split_end_time_2` time DEFAULT NULL,
  `color_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#0ea5e9',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `shifts`
INSERT INTO `shifts` (`id`, `code`, `name`, `shift_type`, `start_time`, `end_time`, `total_hours`, `break_minutes`, `grace_late_in`, `grace_early_out`, `half_day_min_hours`, `full_day_min_hours`, `is_night_shift`, `split_start_time_2`, `split_end_time_2`, `color_code`, `is_active`, `created_at`, `updated_at`) VALUES
('1', 'SH-GEN', 'Morning / General Shift', 'Standard', '08:00:00', '16:00:00', '8.00', '60', '15', '15', '4.00', '7.00', '0', NULL, NULL, '#0ea5e9', '1', '2026-10-11 11:32:51', '2026-10-11 11:32:51'),
('2', 'SH-EVE', 'Evening Shift', 'Standard', '16:00:00', '00:00:00', '8.00', '60', '15', '15', '4.00', '7.00', '0', NULL, NULL, '#f59e0b', '1', '2026-10-11 11:32:51', '2026-10-11 11:32:51'),
('3', 'SH-NGT', 'Night Shift (Bahrain Law Premium)', 'Night', '00:00:00', '08:00:00', '8.00', '60', '15', '15', '4.00', '7.00', '1', NULL, NULL, '#8b5cf6', '1', '2026-10-11 11:32:51', '2026-10-11 11:32:51'),
('4', 'SH-SPL', 'Split Shift (Retail / Catering)', 'Split', '09:00:00', '13:00:00', '8.00', '0', '15', '15', '4.00', '7.00', '0', '17:00:00', '21:00:00', '#ec4899', '1', '2026-10-11 11:32:51', '2026-10-11 11:32:51');

-- ------------------------------------------------------------
-- Table structure for `users`
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) DEFAULT NULL,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','hr','employee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'employee',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `api_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `employee_id` (`employee_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users`
INSERT INTO `users` (`id`, `employee_id`, `username`, `email`, `password_hash`, `role`, `status`, `last_login`, `api_token`, `created_at`, `updated_at`) VALUES
('1', NULL, 'admin', 'admin@alkhaleejtech.bh', '$2y$10$y4hxvz.A5JLxEfYhTgoQTuZumSKvSIsIQj82jxGEUOqJIplCwDPzS', 'admin', 'active', '2026-10-11 13:12:16', '35dcd86ab73ca593f9c66ca3db64e4c61b7b57478ce52e271611a63fd84064f5', '2026-10-11 00:50:12', '2026-10-11 13:12:16'),
('2', '1', 'hr_admin', 'hr@alkhaleejtech.bh', '$2y$10$y4hxvz.A5JLxEfYhTgoQTuZumSKvSIsIQj82jxGEUOqJIplCwDPzS', 'hr', 'active', NULL, NULL, '2026-10-11 00:50:12', '2026-10-11 00:50:12'),
('3', '2', 'emp_rahul', 'rahul.sharma@alkhaleejtech.bh', '$2y$10$y4hxvz.A5JLxEfYhTgoQTuZumSKvSIsIQj82jxGEUOqJIplCwDPzS', 'employee', 'active', '2026-10-11 12:33:13', NULL, '2026-10-11 00:50:12', '2026-10-11 12:34:18'),
('4', '3', 'emp_fatima', 'fatima.mansoori@alkhaleejtech.bh', '$2y$10$y4hxvz.A5JLxEfYhTgoQTuZumSKvSIsIQj82jxGEUOqJIplCwDPzS', 'employee', 'active', NULL, NULL, '2026-10-11 00:50:12', '2026-10-11 00:50:12'),
('5', '4', 'emp_michael', 'michael.santos@alkhaleejtech.bh', '$2y$10$y4hxvz.A5JLxEfYhTgoQTuZumSKvSIsIQj82jxGEUOqJIplCwDPzS', 'employee', 'active', NULL, NULL, '2026-10-11 00:50:12', '2026-10-11 00:50:12'),
('6', '5', 'emp_maryam', 'maryam.doseri@alkhaleejtech.bh', '$2y$10$y4hxvz.A5JLxEfYhTgoQTuZumSKvSIsIQj82jxGEUOqJIplCwDPzS', 'employee', 'active', NULL, NULL, '2026-10-11 00:50:12', '2026-10-11 00:50:12');

SET FOREIGN_KEY_CHECKS = 1;
