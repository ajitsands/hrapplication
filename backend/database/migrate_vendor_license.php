<?php
// backend/database/migrate_vendor_license.php

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/Config.php';

use App\Config\Database;

try {
    $db = Database::getConnection();
    echo "Connected to database successfully.\n";

    // 1. Add license columns to `settings` table
    $columns = [
        'license_key' => "VARCHAR(255) NULL DEFAULT NULL",
        'license_token' => "LONGTEXT NULL DEFAULT NULL",
        'license_public_key' => "TEXT NULL DEFAULT NULL",
        'license_status' => "VARCHAR(50) NOT NULL DEFAULT 'unlicensed'",
        'license_expires_at' => "DATETIME NULL DEFAULT NULL",
        'license_domain' => "VARCHAR(150) NULL DEFAULT NULL",
        'license_customer' => "VARCHAR(150) NULL DEFAULT NULL",
        'license_last_checked' => "DATETIME NULL DEFAULT NULL",
        'software_suspended' => "TINYINT(1) NOT NULL DEFAULT 0",
        'software_suspension_reason' => "TEXT NULL DEFAULT NULL"
    ];

    $existingColsStmt = $db->query("SHOW COLUMNS FROM settings");
    $existingCols = $existingColsStmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($columns as $col => $definition) {
        if (!in_array($col, $existingCols)) {
            $sql = "ALTER TABLE settings ADD COLUMN `$col` $definition";
            $db->exec($sql);
            echo "Added column `settings`.`$col`\n";
        } else {
            echo "Column `settings`.`$col` already exists.\n";
        }
    }

    // 2. Ensure superadmin user exists: superadmin@sandslab.com / S@nds1@b
    $stmt = $db->prepare("SELECT id, username, email, role, password_hash FROM users WHERE username = 'superadmin@sandslab.com' OR email = 'superadmin@sandslab.com' LIMIT 1");
    $stmt->execute();
    $superadmin = $stmt->fetch(PDO::FETCH_ASSOC);

    $defaultHash = password_hash('S@nds1@b', PASSWORD_DEFAULT);

    if (!$superadmin) {
        $insertStmt = $db->prepare("
            INSERT INTO users (username, email, password_hash, role, status, must_change_password)
            VALUES ('superadmin@sandslab.com', 'superadmin@sandslab.com', ?, 'super_admin', 'active', 0)
        ");
        $insertStmt->execute([$defaultHash]);
        echo "Created superadmin user: superadmin@sandslab.com (Role: super_admin)\n";
    } else {
        // Ensure role is super_admin and status is active
        $updateStmt = $db->prepare("UPDATE users SET role = 'super_admin', status = 'active' WHERE id = ?");
        $updateStmt->execute([$superadmin['id']]);
        echo "Superadmin user exists (ID: {$superadmin['id']}). Verified role = 'super_admin', status = 'active'.\n";
    }

    echo "Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration Error: " . $e->getMessage() . "\n";
    exit(1);
}
