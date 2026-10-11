<?php
// backend/database/add_employee_photo_cpr_columns.php

require_once __DIR__ . '/../config/Config.php';
require_once __DIR__ . '/../config/Database.php';

use App\Config\Database;

try {
    $db = Database::getConnection();
    $stmt = $db->query("DESCRIBE employees");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $columnNames = array_column($columns, 'Field');
    echo "Current employees columns:\n" . implode(", ", $columnNames) . "\n\n";

    if (!in_array('profile_photo', $columnNames)) {
        $db->exec("ALTER TABLE `employees` ADD COLUMN `profile_photo` LONGTEXT NULL AFTER `bank_account_no`");
        echo "✓ Added profile_photo (LONGTEXT) column to employees\n";
    } else {
        // If it's VARCHAR(255), upgrade to LONGTEXT so base64 data URLs from CPR reader can be stored if direct upload is used
        $db->exec("ALTER TABLE `employees` MODIFY COLUMN `profile_photo` LONGTEXT NULL");
        echo "✓ profile_photo column verified/modified to LONGTEXT\n";
    }

    // Check if card_reader_data or cpr_blood_group or address exists, optionally
    if (!in_array('blood_group', $columnNames)) {
        $db->exec("ALTER TABLE `employees` ADD COLUMN `blood_group` VARCHAR(10) NULL AFTER `nationality`");
        echo "✓ Added blood_group column to employees\n";
    }
    if (!in_array('address', $columnNames)) {
        $db->exec("ALTER TABLE `employees` ADD COLUMN `address` TEXT NULL AFTER `phone`");
        echo "✓ Added address column to employees\n";
    }

    echo "Employees schema updated successfully!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
