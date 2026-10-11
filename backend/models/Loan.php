<?php
// backend/models/Loan.php

namespace App\Models;

use App\Core\Model;
use PDO;

class Loan extends Model {
    protected string $table = 'loans';
    
    public function getLoansList(?int $employeeId = null, ?string $status = null): array {
        $sql = "
            SELECT l.*, 
                   e.emp_code, e.first_name, e.last_name, e.cpr_no, e.basic_salary,
                   d.name as department_name
            FROM loans l
            JOIN employees e ON l.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE 1=1
        ";
        $params = [];
        if (!empty($employeeId)) {
            $sql .= " AND l.employee_id = ?";
            $params[] = $employeeId;
        }
        if (!empty($status) && $status !== 'all') {
            $sql .= " AND l.status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY l.id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
