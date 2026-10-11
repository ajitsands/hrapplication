<?php
// backend/database/add_weekly_off_days.php

require_once __DIR__ . '/../config/Config.php';
require_once __DIR__ . '/../config/Database.php';

use App\Config\Database;

try {
    $db = Database::getConnection();
    $stmt = $db->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'settings' AND COLUMN_NAME = 'weekly_off_days'");
    $stmt->execute();
    $exists = (int)$stmt->fetchColumn() > 0;

    if (!$exists) {
        $db->exec("ALTER TABLE `settings` ADD COLUMN `weekly_off_days` VARCHAR(100) NOT NULL DEFAULT 'Friday,Saturday' AFTER `work_days_per_month`");
        echo "✓ Added weekly_off_days column to settings\n";
    } else {
        echo "✓ weekly_off_days column already exists\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
