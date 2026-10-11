<?php
// backend/models/User.php

namespace App\Models;

use App\Core\Model;
use PDO;

class User extends Model {
    protected string $table = 'users';
    
    public function findByUsernameOrEmail(string $identifier): ?array {
        $stmt = $this->db->prepare("
            SELECT u.*, e.emp_code, e.first_name, e.last_name, e.cpr_no, e.email as emp_email,
                   e.basic_salary, e.is_gcc_citizen, d.name as department_name, des.name as designation_name
            FROM users u
            LEFT JOIN employees e ON u.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations des ON e.designation_id = des.id
            WHERE u.username = :ident OR u.email = :ident2
            LIMIT 1
        ");
        $stmt->execute(['ident' => $identifier, 'ident2' => $identifier]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
}
