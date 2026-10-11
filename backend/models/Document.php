<?php
// backend/models/Document.php

namespace App\Models;

use App\Core\Model;
use PDO;

class Document extends Model {
    protected string $table = 'employee_documents';
    
    public function getByEmployeeId(int $employeeId): array {
        $stmt = $this->db->prepare("
            SELECT d.*, DATEDIFF(d.expiry_date, CURDATE()) as days_left
            FROM employee_documents d
            WHERE d.employee_id = ?
            ORDER BY d.created_at DESC
        ");
        $stmt->execute([$employeeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getAllUpcomingExpiries(int $days = 60): array {
        $stmt = $this->db->prepare("
            SELECT d.*, 
                   DATEDIFF(d.expiry_date, CURDATE()) as days_left,
                   e.emp_code, e.first_name, e.last_name, e.cpr_no, e.email, e.phone
            FROM employee_documents d
            JOIN employees e ON d.employee_id = e.id
            WHERE d.expiry_date IS NOT NULL 
              AND DATEDIFF(d.expiry_date, CURDATE()) <= ?
              AND DATEDIFF(d.expiry_date, CURDATE()) >= -60
            ORDER BY days_left ASC
        ");
        $stmt->execute([$days]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
