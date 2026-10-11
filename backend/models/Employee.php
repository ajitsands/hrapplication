<?php
// backend/models/Employee.php

namespace App\Models;

use App\Core\Model;
use PDO;

class Employee extends Model {
    protected string $table = 'employees';
    
    public function getListWithDetails(?string $department = null, ?string $status = null, ?string $search = null): array {
        $sql = "
            SELECT e.*, 
                   d.name as department_name, 
                   ds.name as designation_name,
                   DATEDIFF(e.cpr_expiry, CURDATE()) as cpr_days_left,
                   DATEDIFF(e.passport_expiry, CURDATE()) as passport_days_left,
                   DATEDIFF(e.visa_expiry, CURDATE()) as visa_days_left,
                   DATEDIFF(e.driving_license_expiry, CURDATE()) as dl_days_left,
                   DATEDIFF(e.insurance_expiry, CURDATE()) as insurance_days_left
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations ds ON e.designation_id = ds.id
            WHERE 1=1
        ";
        
        $params = [];
        if (!empty($department) && $department !== 'all') {
            $sql .= " AND e.department_id = ?";
            $params[] = $department;
        }
        if (!empty($status) && $status !== 'all') {
            $sql .= " AND e.status = ?";
            $params[] = $status;
        }
        if (!empty($search)) {
            $sql .= " AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.emp_code LIKE ? OR e.cpr_no LIKE ? OR e.passport_no LIKE ? OR e.email LIKE ?)";
            $searchTerm = "%$search%";
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        }
        
        $sql .= " ORDER BY e.id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getDetailsById(int $id): ?array {
        $stmt = $this->db->prepare("
            SELECT e.*, 
                   d.name as department_name, 
                   ds.name as designation_name,
                   DATEDIFF(e.cpr_expiry, CURDATE()) as cpr_days_left,
                   DATEDIFF(e.passport_expiry, CURDATE()) as passport_days_left,
                   DATEDIFF(e.visa_expiry, CURDATE()) as visa_days_left,
                   DATEDIFF(e.driving_license_expiry, CURDATE()) as dl_days_left,
                   DATEDIFF(e.insurance_expiry, CURDATE()) as insurance_days_left
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN designations ds ON e.designation_id = ds.id
            WHERE e.id = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        return $res ?: null;
    }
    
    public function getUpcomingExpiries(int $daysThreshold = 60): array {
        $stmt = $this->db->prepare("
            SELECT id, emp_code, first_name, last_name, email, phone, nationality,
                   cpr_no, cpr_expiry, DATEDIFF(cpr_expiry, CURDATE()) as cpr_days_left,
                   passport_no, passport_expiry, DATEDIFF(passport_expiry, CURDATE()) as passport_days_left,
                   visa_no, visa_expiry, DATEDIFF(visa_expiry, CURDATE()) as visa_days_left,
                   driving_license_no, driving_license_expiry, DATEDIFF(driving_license_expiry, CURDATE()) as dl_days_left,
                   insurance_no, insurance_expiry, DATEDIFF(insurance_expiry, CURDATE()) as insurance_days_left
            FROM employees
            WHERE (cpr_expiry IS NOT NULL AND DATEDIFF(cpr_expiry, CURDATE()) <= :days1 AND DATEDIFF(cpr_expiry, CURDATE()) >= -30)
               OR (passport_expiry IS NOT NULL AND DATEDIFF(passport_expiry, CURDATE()) <= :days2 AND DATEDIFF(passport_expiry, CURDATE()) >= -30)
               OR (visa_expiry IS NOT NULL AND DATEDIFF(visa_expiry, CURDATE()) <= :days3 AND DATEDIFF(visa_expiry, CURDATE()) >= -30 AND is_gcc_citizen = 0)
               OR (driving_license_expiry IS NOT NULL AND DATEDIFF(driving_license_expiry, CURDATE()) <= :days4 AND DATEDIFF(driving_license_expiry, CURDATE()) >= -30)
               OR (insurance_expiry IS NOT NULL AND DATEDIFF(insurance_expiry, CURDATE()) <= :days5 AND DATEDIFF(insurance_expiry, CURDATE()) >= -30)
            ORDER BY cpr_days_left ASC
        ");
        $stmt->execute([
            'days1' => $daysThreshold,
            'days2' => $daysThreshold,
            'days3' => $daysThreshold,
            'days4' => $daysThreshold,
            'days5' => $daysThreshold
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
