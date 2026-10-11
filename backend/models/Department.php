<?php
// backend/models/Department.php

namespace App\Models;

use App\Core\Model;
use PDO;

class Department extends Model {
    protected string $table = 'departments';
    
    public function getAllWithStats(): array {
        $stmt = $this->db->query("
            SELECT d.*, 
                   COUNT(DISTINCT e.id) as total_employees,
                   COUNT(DISTINCT des.id) as total_designations,
                   COALESCE(SUM(e.basic_salary + e.housing_allowance + e.transport_allowance), 0) as total_payroll_cost
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'Active'
            LEFT JOIN designations des ON d.id = des.department_id
            GROUP BY d.id
            ORDER BY d.name ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
