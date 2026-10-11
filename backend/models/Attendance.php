<?php
// backend/models/Attendance.php

namespace App\Models;

use App\Core\Model;
use PDO;

class Attendance extends Model {
    protected string $table = 'attendance';
    
    public function getMonthlyRecords(?int $employeeId, int $month, int $year, ?int $departmentId = null): array {
        $sql = "
            SELECT a.*, e.emp_code, e.first_name, e.last_name, e.cpr_no, d.name as department_name,
                   s.code as shift_code, s.name as shift_name, s.color_code as shift_color, s.start_time as shift_start, s.end_time as shift_end
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN shifts s ON a.shift_id = s.id
            WHERE MONTH(a.date) = ? AND YEAR(a.date) = ?
        ";
        
        $params = [$month, $year];
        if (!empty($employeeId)) {
            $sql .= " AND a.employee_id = ?";
            $params[] = $employeeId;
        }
        if (!empty($departmentId)) {
            $sql .= " AND e.department_id = ?";
            $params[] = $departmentId;
        }
        
        $sql .= " ORDER BY a.date DESC, e.first_name ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getMonthlySummary(int $month, int $year, ?int $employeeId = null): array {
        $sql = "
            SELECT 
                a.employee_id,
                e.emp_code,
                e.first_name,
                e.last_name,
                e.basic_salary,
                e.is_gcc_citizen,
                SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN a.status = 'Half Day' THEN 1 ELSE 0 END) as half_days,
                SUM(CASE WHEN a.status = 'On Leave' THEN 1 ELSE 0 END) as leave_days,
                SUM(CASE WHEN a.status = 'Holiday' THEN 1 ELSE 0 END) as holiday_days,
                SUM(CASE WHEN a.status = 'Weekend' THEN 1 ELSE 0 END) as weekend_days,
                COALESCE(SUM(a.ot_hours), 0) as total_ot_hours,
                COALESCE(SUM(a.day_ot_hours), 0) as total_day_ot_hours,
                COALESCE(SUM(a.night_ot_hours), 0) as total_night_ot_hours,
                COALESCE(SUM(a.holiday_ot_hours), 0) as total_holiday_ot_hours,
                COALESCE(SUM(a.total_hours), 0) as total_work_hours
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE MONTH(a.date) = ? AND YEAR(a.date) = ?
        ";
        $params = [$month, $year];
        if (!empty($employeeId)) {
            $sql .= " AND a.employee_id = ?";
            $params[] = $employeeId;
        }
        $sql .= " GROUP BY a.employee_id, e.emp_code, e.first_name, e.last_name, e.basic_salary, e.is_gcc_citizen";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
