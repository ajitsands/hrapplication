<?php
// backend/database/migrate_shifts.php

require_once __DIR__ . '/../config/Config.php';
require_once __DIR__ . '/../config/Database.php';

use App\Config\Database;

try {
    $db = Database::getConnection();
    echo "Connected to database successfully.\n";

    // 1. Run migration_shifts.sql
    $sql = file_get_contents(__DIR__ . '/migration_shifts.sql');
    $db->exec($sql);
    echo "✓ Created/Verified tables: shifts, employee_shift_assignments, shift_roster\n";

    // Helper to check if column exists
    $columnExists = function($table, $column) use ($db) {
        $stmt = $db->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?");
        $stmt->execute([$table, $column]);
        return (int)$stmt->fetchColumn() > 0;
    };

    // 2. Alter departments table
    if (!$columnExists('departments', 'default_shift_id')) {
        $db->exec("ALTER TABLE `departments` ADD COLUMN `default_shift_id` INT NULL AFTER `description`");
        $db->exec("ALTER TABLE `departments` ADD CONSTRAINT `fk_dept_default_shift` FOREIGN KEY (`default_shift_id`) REFERENCES `shifts`(`id`) ON DELETE SET NULL");
        echo "✓ Added default_shift_id to departments\n";
    }

    // 3. Alter attendance table
    $attColumns = [
        'shift_id' => "INT NULL AFTER `date`",
        'early_in_mins' => "INT NOT NULL DEFAULT 0 AFTER `check_out`",
        'late_in_mins' => "INT NOT NULL DEFAULT 0 AFTER `early_in_mins`",
        'early_out_mins' => "INT NOT NULL DEFAULT 0 AFTER `late_in_mins`",
        'day_ot_hours' => "DECIMAL(4,2) NOT NULL DEFAULT 0.00 AFTER `ot_hours`",
        'night_ot_hours' => "DECIMAL(4,2) NOT NULL DEFAULT 0.00 AFTER `day_ot_hours`",
        'holiday_ot_hours' => "DECIMAL(4,2) NOT NULL DEFAULT 0.00 AFTER `night_ot_hours`"
    ];

    foreach ($attColumns as $col => $def) {
        if (!$columnExists('attendance', $col)) {
            $db->exec("ALTER TABLE `attendance` ADD COLUMN `$col` $def");
            echo "✓ Added $col to attendance\n";
        }
    }

    // Add foreign key for shift_id in attendance if not exists
    try {
        $db->exec("ALTER TABLE `attendance` ADD CONSTRAINT `fk_attendance_shift` FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON DELETE SET NULL");
    } catch (\Exception $e) {
        // FK might already exist, safe to ignore
    }

    // 4. Alter payslips table
    $payslipColumns = [
        'day_ot_hours' => "DECIMAL(4,2) NOT NULL DEFAULT 0.00 AFTER `ot_amount`",
        'day_ot_amount' => "DECIMAL(12,3) NOT NULL DEFAULT 0.000 AFTER `day_ot_hours`",
        'night_ot_hours' => "DECIMAL(4,2) NOT NULL DEFAULT 0.00 AFTER `day_ot_amount`",
        'night_ot_amount' => "DECIMAL(12,3) NOT NULL DEFAULT 0.000 AFTER `night_ot_hours`",
        'holiday_ot_hours' => "DECIMAL(4,2) NOT NULL DEFAULT 0.00 AFTER `night_ot_amount`",
        'holiday_ot_amount' => "DECIMAL(12,3) NOT NULL DEFAULT 0.000 AFTER `holiday_ot_hours`"
    ];

    foreach ($payslipColumns as $col => $def) {
        if (!$columnExists('payslips', $col)) {
            $db->exec("ALTER TABLE `payslips` ADD COLUMN `$col` $def");
            echo "✓ Added $col to payslips\n";
        }
    }

    // 5. Seed Default Shifts
    $defaultShifts = [
        [
            'code' => 'SH-GEN',
            'name' => 'Morning / General Shift',
            'shift_type' => 'Standard',
            'start_time' => '08:00:00',
            'end_time' => '16:00:00',
            'total_hours' => 8.00,
            'break_minutes' => 60,
            'grace_late_in' => 15,
            'grace_early_out' => 15,
            'half_day_min_hours' => 4.00,
            'full_day_min_hours' => 7.00,
            'is_night_shift' => 0,
            'split_start_time_2' => null,
            'split_end_time_2' => null,
            'color_code' => '#0ea5e9'
        ],
        [
            'code' => 'SH-EVE',
            'name' => 'Evening Shift',
            'shift_type' => 'Standard',
            'start_time' => '16:00:00',
            'end_time' => '00:00:00',
            'total_hours' => 8.00,
            'break_minutes' => 60,
            'grace_late_in' => 15,
            'grace_early_out' => 15,
            'half_day_min_hours' => 4.00,
            'full_day_min_hours' => 7.00,
            'is_night_shift' => 0,
            'split_start_time_2' => null,
            'split_end_time_2' => null,
            'color_code' => '#f59e0b'
        ],
        [
            'code' => 'SH-NGT',
            'name' => 'Night Shift (Bahrain Law Premium)',
            'shift_type' => 'Night',
            'start_time' => '00:00:00',
            'end_time' => '08:00:00',
            'total_hours' => 8.00,
            'break_minutes' => 60,
            'grace_late_in' => 15,
            'grace_early_out' => 15,
            'half_day_min_hours' => 4.00,
            'full_day_min_hours' => 7.00,
            'is_night_shift' => 1,
            'split_start_time_2' => null,
            'split_end_time_2' => null,
            'color_code' => '#8b5cf6'
        ],
        [
            'code' => 'SH-SPL',
            'name' => 'Split Shift (Retail / Catering)',
            'shift_type' => 'Split',
            'start_time' => '09:00:00',
            'end_time' => '13:00:00',
            'total_hours' => 8.00,
            'break_minutes' => 0,
            'grace_late_in' => 15,
            'grace_early_out' => 15,
            'half_day_min_hours' => 4.00,
            'full_day_min_hours' => 7.00,
            'is_night_shift' => 0,
            'split_start_time_2' => '17:00:00',
            'split_end_time_2' => '21:00:00',
            'color_code' => '#ec4899'
        ]
    ];

    $shiftStmt = $db->prepare("
        INSERT INTO `shifts` (
            code, name, shift_type, start_time, end_time, total_hours, break_minutes,
            grace_late_in, grace_early_out, half_day_min_hours, full_day_min_hours,
            is_night_shift, split_start_time_2, split_end_time_2, color_code
        ) VALUES (
            :code, :name, :shift_type, :start_time, :end_time, :total_hours, :break_minutes,
            :grace_late_in, :grace_early_out, :half_day_min_hours, :full_day_min_hours,
            :is_night_shift, :split_start_time_2, :split_end_time_2, :color_code
        ) ON DUPLICATE KEY UPDATE
            name = VALUES(name), shift_type = VALUES(shift_type), start_time = VALUES(start_time),
            end_time = VALUES(end_time), total_hours = VALUES(total_hours), break_minutes = VALUES(break_minutes),
            grace_late_in = VALUES(grace_late_in), grace_early_out = VALUES(grace_early_out),
            is_night_shift = VALUES(is_night_shift), color_code = VALUES(color_code)
    ");

    foreach ($defaultShifts as $s) {
        $shiftStmt->execute($s);
    }
    echo "✓ Seeded 4 default shifts (Morning, Evening, Night, Split)\n";

    // 6. Set default shift for departments (General Shift)
    $genShift = $db->query("SELECT id FROM shifts WHERE code = 'SH-GEN'")->fetch();
    if ($genShift) {
        $db->exec("UPDATE departments SET default_shift_id = " . (int)$genShift['id'] . " WHERE default_shift_id IS NULL");
        echo "✓ Assigned SH-GEN as default shift for all existing departments\n";
    }

    echo "\n🎉 Migration completed successfully!\n";
} catch (\Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
