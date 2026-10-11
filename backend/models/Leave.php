<?php
// backend/models/Leave.php

namespace App\Models;

use App\Core\Model;
use PDO;

class Leave extends Model {
    protected string $table = 'leave_applications';
    
    public function getAllLeaves(?int $employeeId = null, ?string $status = null): array {
        $sql = "
            SELECT la.*, 
                   lt.name as leave_type_name, lt.is_paid,
                   e.emp_code, e.first_name, e.last_name, e.cpr_no,
                   d.name as department_name,
                   u.username as approver_name
            FROM leave_applications la
            JOIN leave_types lt ON la.leave_type_id = lt.id
            JOIN employees e ON la.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN users u ON la.approved_by = u.id
            WHERE 1=1
        ";
        $params = [];
        if (!empty($employeeId)) {
            $sql .= " AND la.employee_id = ?";
            $params[] = $employeeId;
        }
        if (!empty($status) && $status !== 'all') {
            $sql .= " AND la.status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY la.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
