<?php
// backend/models/Payroll.php

namespace App\Models;

use App\Core\Model;
use PDO;

class Payroll extends Model {
    protected string $table = 'payroll_periods';
    
    public function getPeriodsList(): array {
        $stmt = $this->db->query("
            SELECT p.*, u.username as processed_by_name
            FROM payroll_periods p
            LEFT JOIN users u ON p.processed_by = u.id
            ORDER BY p.year DESC, p.month DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getPayslipsByPeriod(int $periodId, ?int $departmentId = null, ?int $employeeId = null): array {
        $sql = "
            SELECT ps.*, 
                   e.emp_code, e.first_name, e.last_name, e.cpr_no, e.passport_no, e.is_gcc_citizen,
                   e.bank_name, e.iban, e.bank_account_no,
                   d.name as department_name, 
                   des.name as designation_name
            FROM payslips ps
            JOIN employees e ON ps.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations des ON e.designation_id = des.id
            WHERE ps.payroll_period_id = ?
        ";
        
        $params = [$periodId];
        if (!empty($departmentId)) {
            $sql .= " AND e.department_id = ?";
            $params[] = $departmentId;
        }
        if (!empty($employeeId)) {
            $sql .= " AND ps.employee_id = ?";
            $params[] = $employeeId;
        }
        
        $sql .= " ORDER BY e.emp_code ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getPayslipDetails(int $payslipId): ?array {
        $stmt = $this->db->prepare("
            SELECT ps.*, 
                   p.month, p.year, p.title as period_title, p.start_date as period_start, p.end_date as period_end,
                   e.emp_code, e.first_name, e.last_name, e.email, e.phone, e.cpr_no, e.passport_no,
                   e.nationality, e.is_gcc_citizen, e.date_of_joining, e.gosi_no, e.lmra_no,
                   e.bank_name, e.iban, e.bank_account_no,
                   d.name as department_name, 
                   des.name as designation_name
            FROM payslips ps
            JOIN payroll_periods p ON ps.payroll_period_id = p.id
            JOIN employees e ON ps.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations des ON e.designation_id = des.id
            WHERE ps.id = ?
            LIMIT 1
        ");
        $stmt->execute([$payslipId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
}
