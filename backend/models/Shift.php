<?php
// backend/models/Shift.php

namespace App\Models;

use App\Core\Model;
use PDO;

class Shift extends Model {
    protected string $table = 'shifts';

    public function getAll(bool $activeOnly = false): array {
        $sql = "SELECT * FROM `shifts`";
        if ($activeOnly) {
            $sql .= " WHERE is_active = 1";
        }
        $sql .= " ORDER BY id ASC";
        return $this->db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById(int $id): ?array {
        return $this->findById($id);
    }

    public function getByCode(string $code): ?array {
        $stmt = $this->db->prepare("SELECT * FROM `shifts` WHERE code = ? LIMIT 1");
        $stmt->execute([$code]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        return $res ?: null;
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare("
            INSERT INTO `shifts` (
                code, name, shift_type, start_time, end_time, total_hours, break_minutes,
                grace_late_in, grace_early_out, half_day_min_hours, full_day_min_hours,
                is_night_shift, split_start_time_2, split_end_time_2, color_code, is_active
            ) VALUES (
                :code, :name, :shift_type, :start_time, :end_time, :total_hours, :break_minutes,
                :grace_late_in, :grace_early_out, :half_day_min_hours, :full_day_min_hours,
                :is_night_shift, :split_start_time_2, :split_end_time_2, :color_code, :is_active
            )
        ");
        $stmt->execute([
            'code' => $data['code'],
            'name' => $data['name'],
            'shift_type' => $data['shift_type'] ?? 'Standard',
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'total_hours' => $data['total_hours'] ?? 8.00,
            'break_minutes' => $data['break_minutes'] ?? 60,
            'grace_late_in' => $data['grace_late_in'] ?? 15,
            'grace_early_out' => $data['grace_early_out'] ?? 15,
            'half_day_min_hours' => $data['half_day_min_hours'] ?? 4.00,
            'full_day_min_hours' => $data['full_day_min_hours'] ?? 7.00,
            'is_night_shift' => !empty($data['is_night_shift']) ? 1 : 0,
            'split_start_time_2' => !empty($data['split_start_time_2']) ? $data['split_start_time_2'] : null,
            'split_end_time_2' => !empty($data['split_end_time_2']) ? $data['split_end_time_2'] : null,
            'color_code' => $data['color_code'] ?? '#0ea5e9',
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function updateShift(int $id, array $data): bool {
        $stmt = $this->db->prepare("
            UPDATE `shifts` SET
                code = :code,
                name = :name,
                shift_type = :shift_type,
                start_time = :start_time,
                end_time = :end_time,
                total_hours = :total_hours,
                break_minutes = :break_minutes,
                grace_late_in = :grace_late_in,
                grace_early_out = :grace_early_out,
                half_day_min_hours = :half_day_min_hours,
                full_day_min_hours = :full_day_min_hours,
                is_night_shift = :is_night_shift,
                split_start_time_2 = :split_start_time_2,
                split_end_time_2 = :split_end_time_2,
                color_code = :color_code,
                is_active = :is_active
            WHERE id = :id
        ");
        return $stmt->execute([
            'id' => $id,
            'code' => $data['code'],
            'name' => $data['name'],
            'shift_type' => $data['shift_type'] ?? 'Standard',
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'total_hours' => $data['total_hours'] ?? 8.00,
            'break_minutes' => $data['break_minutes'] ?? 60,
            'grace_late_in' => $data['grace_late_in'] ?? 15,
            'grace_early_out' => $data['grace_early_out'] ?? 15,
            'half_day_min_hours' => $data['half_day_min_hours'] ?? 4.00,
            'full_day_min_hours' => $data['full_day_min_hours'] ?? 7.00,
            'is_night_shift' => !empty($data['is_night_shift']) ? 1 : 0,
            'split_start_time_2' => !empty($data['split_start_time_2']) ? $data['split_start_time_2'] : null,
            'split_end_time_2' => !empty($data['split_end_time_2']) ? $data['split_end_time_2'] : null,
            'color_code' => $data['color_code'] ?? '#0ea5e9',
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1
        ]);
    }

    /**
     * Resolves an employee's effective shift on a specific date.
     * Hierarchy:
     *  1. `shift_roster` (for this employee & date)
     *  2. `employee_shift_assignments` (active on this date)
     *  3. `departments.default_shift_id`
     *  4. System default General Shift
     */
    public function getEffectiveShift(int $employeeId, string $date): ?array {
        // 1. Check Shift Roster
        $rosterStmt = $this->db->prepare("
            SELECT r.shift_id, r.is_off_day, r.notes, s.*
            FROM shift_roster r
            LEFT JOIN shifts s ON r.shift_id = s.id
            WHERE r.employee_id = ? AND r.date = ?
            LIMIT 1
        ");
        $rosterStmt->execute([$employeeId, $date]);
        $roster = $rosterStmt->fetch(PDO::FETCH_ASSOC);

        if ($roster) {
            return [
                'source' => 'roster',
                'is_off_day' => (int)$roster['is_off_day'],
                'shift_id' => $roster['shift_id'] ? (int)$roster['shift_id'] : null,
                'notes' => $roster['notes'],
                'shift' => $roster['shift_id'] ? $roster : null
            ];
        }

        // 2. Check Employee Assignment
        $assignStmt = $this->db->prepare("
            SELECT a.shift_id, s.*
            FROM employee_shift_assignments a
            JOIN shifts s ON a.shift_id = s.id
            WHERE a.employee_id = ? 
              AND a.effective_from <= ? 
              AND (a.effective_to IS NULL OR a.effective_to >= ?)
            ORDER BY a.effective_from DESC, a.id DESC
            LIMIT 1
        ");
        $assignStmt->execute([$employeeId, $date, $date]);
        $assigned = $assignStmt->fetch(PDO::FETCH_ASSOC);

        if ($assigned) {
            return [
                'source' => 'assignment',
                'is_off_day' => 0,
                'shift_id' => (int)$assigned['shift_id'],
                'notes' => 'Assigned Employee Default Shift',
                'shift' => $assigned
            ];
        }

        // 3. Check Department Default Shift
        $deptStmt = $this->db->prepare("
            SELECT d.default_shift_id, s.*
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN shifts s ON d.default_shift_id = s.id
            WHERE e.id = ?
            LIMIT 1
        ");
        $deptStmt->execute([$employeeId]);
        $deptShift = $deptStmt->fetch(PDO::FETCH_ASSOC);

        if ($deptShift && !empty($deptShift['default_shift_id'])) {
            return [
                'source' => 'department_default',
                'is_off_day' => 0,
                'shift_id' => (int)$deptShift['default_shift_id'],
                'notes' => 'Department Default Shift',
                'shift' => $deptShift
            ];
        }

        // 4. Fallback to SH-GEN (General Shift)
        $genStmt = $this->db->query("SELECT * FROM shifts WHERE code = 'SH-GEN' OR is_active = 1 ORDER BY id ASC LIMIT 1");
        $genShift = $genStmt->fetch(PDO::FETCH_ASSOC);

        return [
            'source' => 'system_fallback',
            'is_off_day' => 0,
            'shift_id' => $genShift ? (int)$genShift['id'] : null,
            'notes' => 'Standard General Shift',
            'shift' => $genShift ?: null
        ];
    }
}
