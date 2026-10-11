<?php
// backend/models/Indemnity.php

namespace App\Models;

use App\Core\Model;
use PDO;

class Indemnity extends Model {
    protected string $table = 'indemnity_calculations';
    
    public function getAllRecords(): array {
        $stmt = $this->db->query("
            SELECT ic.*, 
                   e.emp_code, e.first_name, e.last_name, e.cpr_no, e.nationality,
                   d.name as department_name, des.name as designation_name
            FROM indemnity_calculations ic
            JOIN employees e ON ic.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations des ON e.designation_id = des.id
            ORDER BY ic.id DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
