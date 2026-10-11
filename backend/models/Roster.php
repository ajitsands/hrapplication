<?php
// backend/models/Roster.php

namespace App\Models;

use App\Core\Model;
use PDO;

class Roster extends Model {
    protected string $table = 'shift_roster';

    /**
     * Get monthly roster matrix for all or filtered employees.
     */
    public function getMonthlyRoster(int $month, int $year, ?int $departmentId = null, ?int $employeeId = null): array {
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $daysInMonth = (int)date('t', strtotime($startDate));
        $endDate = sprintf('%04d-%02d-%02d', $year, $month, $daysInMonth);

        // Fetch employees
        $empSql = "
            SELECT e.id, e.emp_code, e.first_name, e.last_name, e.department_id, 
                   d.name as department_name, d.default_shift_id,
                   s.name as default_shift_name, s.code as default_shift_code, s.color_code as default_shift_color
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN shifts s ON d.default_shift_id = s.id
            WHERE e.status = 'Active'
        ";
        $empParams = [];

        if (!empty($departmentId)) {
            $empSql .= " AND e.department_id = ?";
            $empParams[] = $departmentId;
        }
        if (!empty($employeeId)) {
            $empSql .= " AND e.id = ?";
            $empParams[] = $employeeId;
        }

        $empSql .= " ORDER BY d.name ASC, e.first_name ASC";
        $empStmt = $this->db->prepare($empSql);
        $empStmt->execute($empParams);
        $employees = $empStmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($employees)) {
            return [
                'days_in_month' => $daysInMonth,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'roster' => []
            ];
        }

        $empIds = array_column($employees, 'id');
        $placeholders = implode(',', array_fill(0, count($empIds), '?'));

        // Fetch all roster entries for this month
        $rosterSql = "
            SELECT r.employee_id, r.date, r.shift_id, r.is_off_day, r.notes,
                   s.code as shift_code, s.name as shift_name, s.start_time, s.end_time, s.color_code, s.is_night_shift
            FROM shift_roster r
            LEFT JOIN shifts s ON r.shift_id = s.id
            WHERE r.date BETWEEN ? AND ? AND r.employee_id IN ($placeholders)
        ";
        $rosterParams = array_merge([$startDate, $endDate], $empIds);
        $rosterStmt = $this->db->prepare($rosterSql);
        $rosterStmt->execute($rosterParams);
        $rosterRows = $rosterStmt->fetchAll(PDO::FETCH_ASSOC);

        // Map roster entries by employee_id => date
        $rosterMap = [];
        foreach ($rosterRows as $row) {
            $eId = (int)$row['employee_id'];
            $d = $row['date'];
            $rosterMap[$eId][$d] = $row;
        }

        // Fetch active employee default shift assignments
        $assignSql = "
            SELECT a.employee_id, a.shift_id, s.code as shift_code, s.name as shift_name, s.color_code, s.start_time, s.end_time
            FROM employee_shift_assignments a
            JOIN shifts s ON a.shift_id = s.id
            WHERE a.effective_from <= ? AND (a.effective_to IS NULL OR a.effective_to >= ?)
              AND a.employee_id IN ($placeholders)
            ORDER BY a.effective_from ASC
        ";
        $assignParams = array_merge([$endDate, $startDate], $empIds);
        $assignStmt = $this->db->prepare($assignSql);
        $assignStmt->execute($assignParams);
        $assignRows = $assignStmt->fetchAll(PDO::FETCH_ASSOC);

        $assignMap = [];
        foreach ($assignRows as $a) {
            $assignMap[(int)$a['employee_id']] = $a;
        }

        // Combine into daily grid
        $result = [];
        foreach ($employees as $emp) {
            $eId = (int)$emp['id'];
            $dailySchedule = [];

            for ($day = 1; $day <= $daysInMonth; $day++) {
                $curDate = sprintf('%04d-%02d-%02d', $year, $month, $day);
                $dow = (int)date('N', strtotime($curDate)); // 1=Mon ... 5=Fri, 6=Sat, 7=Sun

                if (isset($rosterMap[$eId][$curDate])) {
                    $entry = $rosterMap[$eId][$curDate];
                    $dailySchedule[$day] = [
                        'date' => $curDate,
                        'is_off_day' => (int)$entry['is_off_day'],
                        'shift_id' => $entry['shift_id'] ? (int)$entry['shift_id'] : null,
                        'shift_code' => $entry['shift_code'] ?? null,
                        'shift_name' => $entry['shift_name'] ?? null,
                        'color_code' => $entry['color_code'] ?? '#64748b',
                        'is_night_shift' => (int)($entry['is_night_shift'] ?? 0),
                        'source' => 'roster',
                        'notes' => $entry['notes']
                    ];
                } elseif (isset($assignMap[$eId])) {
                    $a = $assignMap[$eId];
                    $dailySchedule[$day] = [
                        'date' => $curDate,
                        'is_off_day' => 0,
                        'shift_id' => (int)$a['shift_id'],
                        'shift_code' => $a['shift_code'],
                        'shift_name' => $a['shift_name'],
                        'color_code' => $a['color_code'],
                        'is_night_shift' => 0,
                        'source' => 'assignment',
                        'notes' => null
                    ];
                } elseif (!empty($emp['default_shift_id'])) {
                    $dailySchedule[$day] = [
                        'date' => $curDate,
                        'is_off_day' => 0,
                        'shift_id' => (int)$emp['default_shift_id'],
                        'shift_code' => $emp['default_shift_code'] ?? 'SH-GEN',
                        'shift_name' => $emp['default_shift_name'] ?? 'General Shift',
                        'color_code' => $emp['default_shift_color'] ?? '#0ea5e9',
                        'is_night_shift' => 0,
                        'source' => 'department_default',
                        'notes' => null
                    ];
                } else {
                    $dailySchedule[$day] = [
                        'date' => $curDate,
                        'is_off_day' => 0,
                        'shift_id' => null,
                        'shift_code' => 'SH-GEN',
                        'shift_name' => 'General Shift',
                        'color_code' => '#0ea5e9',
                        'is_night_shift' => 0,
                        'source' => 'fallback',
                        'notes' => null
                    ];
                }
            }

            $result[] = [
                'employee' => $emp,
                'days' => $dailySchedule
            ];
        }

        return [
            'month' => $month,
            'year' => $year,
            'days_in_month' => $daysInMonth,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'roster' => $result
        ];
    }

    /**
     * Set a single day roster entry for an employee.
     */
    public function setRosterCell(int $employeeId, string $date, ?int $shiftId, bool $isOffDay = false, ?string $notes = null): bool {
        $stmt = $this->db->prepare("
            INSERT INTO shift_roster (employee_id, date, shift_id, is_off_day, notes)
            VALUES (:emp_id, :date, :shift_id, :is_off_day, :notes)
            ON DUPLICATE KEY UPDATE
            shift_id = VALUES(shift_id),
            is_off_day = VALUES(is_off_day),
            notes = VALUES(notes)
        ");
        return $stmt->execute([
            'emp_id' => $employeeId,
            'date' => $date,
            'shift_id' => $shiftId,
            'is_off_day' => $isOffDay ? 1 : 0,
            'notes' => $notes
        ]);
    }

    /**
     * Bulk assign shift or off-day for multiple employees across a date range.
     */
    public function bulkAssign(array $employeeIds, string $startDate, string $endDate, ?int $shiftId, bool $isOffDay = false, array $offDaysOfWeek = [], ?string $notes = null): int {
        if (empty($employeeIds)) return 0;

        $start = strtotime($startDate);
        $end = strtotime($endDate);
        if ($start > $end) return 0;

        $count = 0;
        $stmt = $this->db->prepare("
            INSERT INTO shift_roster (employee_id, date, shift_id, is_off_day, notes)
            VALUES (:emp_id, :date, :shift_id, :is_off_day, :notes)
            ON DUPLICATE KEY UPDATE
            shift_id = VALUES(shift_id),
            is_off_day = VALUES(is_off_day),
            notes = VALUES(notes)
        ");

        for ($cur = $start; $cur <= $end; $cur += 86400) {
            $curDate = date('Y-m-d', $cur);
            $dow = (int)date('N', $cur); // 1 = Mon ... 7 = Sun

            $dayOff = $isOffDay || in_array($dow, $offDaysOfWeek);
            $effectiveShiftId = $dayOff ? null : $shiftId;

            foreach ($employeeIds as $empId) {
                $stmt->execute([
                    'emp_id' => (int)$empId,
                    'date' => $curDate,
                    'shift_id' => $effectiveShiftId,
                    'is_off_day' => $dayOff ? 1 : 0,
                    'notes' => $notes
                ]);
                $count++;
            }
        }

        return $count;
    }
}
