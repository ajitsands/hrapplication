<?php
// backend/models/User.php

namespace App\Models;

use App\Core\Model;
use PDO;

class User extends Model {
    protected string $table = 'users';
    
    public function findByUsernameOrEmail(string $identifier): ?array {
        $cleanIdent = trim($identifier);
        $stmt = $this->db->prepare("
            SELECT u.*, e.emp_code, e.first_name, e.last_name, e.cpr_no, e.email as emp_email,
                   e.basic_salary, e.is_gcc_citizen, d.name as department_name, des.name as designation_name
            FROM users u
            LEFT JOIN employees e ON u.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations des ON e.designation_id = des.id
            WHERE u.username = :ident 
               OR u.email = :ident2 
               OR e.cpr_no = :ident3 
               OR REPLACE(e.cpr_no, '-', '') = :ident4
            LIMIT 1
        ");
        $stmt->execute([
            'ident' => $cleanIdent,
            'ident2' => $cleanIdent,
            'ident3' => $cleanIdent,
            'ident4' => str_replace(['-', ' '], '', $cleanIdent)
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function getAllWithDetails(?string $role = null, ?string $status = null, ?string $search = null, bool $includeSuperAdmin = false): array {
        $sql = "
            SELECT u.id, u.employee_id, u.username, u.email, u.role, u.status, u.must_change_password,
                   u.last_login, u.created_at, u.updated_at,
                   e.emp_code, e.first_name, e.last_name, e.cpr_no, e.phone as emp_phone,
                   e.profile_photo, d.name as department_name, des.name as designation_name
            FROM users u
            LEFT JOIN employees e ON u.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations des ON e.designation_id = des.id
            WHERE 1=1
        ";
        $params = [];

        if (!$includeSuperAdmin) {
            $sql .= " AND u.role != 'super_admin'";
        }

        if (!empty($role) && $role !== 'all' && $role !== 'undefined') {
            $sql .= " AND u.role = :role";
            $params['role'] = $role;
        }

        if (!empty($status) && $status !== 'all' && $status !== 'undefined') {
            $sql .= " AND u.status = :status";
            $params['status'] = $status;
        }

        if (!empty($search) && $search !== 'undefined') {
            $sql .= " AND (u.username LIKE :q1 OR u.email LIKE :q2 OR e.first_name LIKE :q3 OR e.last_name LIKE :q4 OR e.emp_code LIKE :q5 OR e.cpr_no LIKE :q6)";
            $qVal = "%$search%";
            $params['q1'] = $qVal;
            $params['q2'] = $qVal;
            $params['q3'] = $qVal;
            $params['q4'] = $qVal;
            $params['q5'] = $qVal;
            $params['q6'] = $qVal;
        }

        $sql .= " ORDER BY FIELD(u.role, 'super_admin', 'admin', 'hr', 'employee'), u.id ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByEmployeeId(int $employeeId): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE employee_id = ? LIMIT 1");
        $stmt->execute([$employeeId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function findByCpr(string $cpr): ?array {
        $cleanCpr = trim($cpr);
        $stmt = $this->db->prepare("
            SELECT u.*, e.emp_code, e.first_name, e.last_name, e.cpr_no
            FROM users u
            JOIN employees e ON u.employee_id = e.id
            WHERE e.cpr_no = ? OR REPLACE(e.cpr_no, '-', '') = ? OR u.username = ?
            LIMIT 1
        ");
        $stmt->execute([$cleanCpr, str_replace(['-', ' '], '', $cleanCpr), $cleanCpr]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
}
