<?php
require_once 'e:/hrsolution/backend/config/Config.php';
require_once 'e:/hrsolution/backend/config/Database.php';

$db = App\Config\Database::getConnection();

// 1. Create attendance_batches table
$db->exec("
CREATE TABLE IF NOT EXISTS attendance_batches (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    batch_name VARCHAR(150) NOT NULL,
    batch_code VARCHAR(60) NOT NULL,
    imported_at DATETIME NOT NULL,
    record_count INT(11) NOT NULL DEFAULT 0,
    file_name VARCHAR(255) NULL,
    imported_by VARCHAR(100) NULL,
    notes TEXT NULL,
    status ENUM('active', 'deleted') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_batch_code (batch_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

echo "attendance_batches table created/verified.\n";

// 2. Check and add batch_id column to attendance table
$stmt = $db->query("SHOW COLUMNS FROM attendance LIKE 'batch_id'");
$col = $stmt->fetch();
if (!$col) {
    $db->exec("ALTER TABLE attendance ADD COLUMN batch_id INT(11) NULL AFTER source, ADD INDEX idx_batch_id (batch_id)");
    echo "batch_id column added to attendance table.\n";
} else {
    echo "batch_id column already exists in attendance table.\n";
}
