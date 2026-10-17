<?php
// backend/controllers/DashboardController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Employee;
use App\Models\Document;
use App\Models\Setting;
use App\Config\Database;
use PDO;

class DashboardController extends Controller {
    private Employee $empModel;
    private Document $docModel;
    private Setting $settingModel;
    
    public function __construct() {
        $this->empModel = new Employee();
        $this->docModel = new Document();
        $this->settingModel = new Setting();
    }
    
    public function stats(): void {
        $db = Database::getConnection();
        
        // If employee role, return personal dashboard stats
        if ($this->authUser && $this->authUser['role'] === 'employee') {
            $empId = (int)($this->authUser['employee_id'] ?? 0);
            if ($empId <= 0) {
                $findEmp = $db->prepare("SELECT id FROM employees WHERE email = ? OR cpr_no = ? LIMIT 1");
                $findEmp->execute([$this->authUser['email'] ?? '', $this->authUser['username'] ?? '']);
                $found = $findEmp->fetch(PDO::FETCH_ASSOC);
                if ($found) {
                    $empId = (int)$found['id'];
                }
            }
            
            // Employee personal info
            $empStmt = $db->prepare("SELECT e.*, d.name as department_name, des.name as designation_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN designations des ON e.designation_id = des.id WHERE e.id = ?");
            $empStmt->execute([$empId]);
            $employee = $empStmt->fetch(PDO::FETCH_ASSOC);
            
            // Personal leave stats
            $leaveStmt = $db->prepare("SELECT COUNT(*) as pending_count FROM leave_applications WHERE employee_id = ? AND status = 'Pending'");
            $leaveStmt->execute([$empId]);
            $pendingLeaves = (int)$leaveStmt->fetchColumn();
            
            // Personal active loan
            $loanStmt = $db->prepare("SELECT COALESCE(SUM(remaining_amount), 0) FROM loans WHERE employee_id = ? AND status = 'Active'");
            $loanStmt->execute([$empId]);
            $loanTotal = (float)$loanStmt->fetchColumn();
            
            // Personal attendance this month
            $month = (int)date('n');
            $year = (int)date('Y');
            $attStmt = $db->prepare("SELECT COUNT(*) as present_days, COALESCE(SUM(ot_hours), 0) as total_ot FROM attendance WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ? AND status = 'Present'");
            $attStmt->execute([$empId, $month, $year]);
            $attStats = $attStmt->fetch(PDO::FETCH_ASSOC);
            
            // Personal document expiries (cpr, passport, visa)
            $personalDocs = [];
            if ($employee) {
                $today = new \DateTime();
                foreach (['CPR Card' => 'cpr_expiry', 'Passport' => 'passport_expiry', 'Residence Visa' => 'visa_expiry', 'Driving License' => 'driving_license_expiry'] as $type => $field) {
                    if (!empty($employee[$field])) {
                        $exp = new \DateTime($employee[$field]);
                        $diff = (int)$today->diff($exp)->format("%r%a");
                        if ($diff <= 60) {
                            $personalDocs[] = [
                                'doc_name' => $type,
                                'expiry_date' => $employee[$field],
                                'days_left' => $diff
                            ];
                        }
                    }
                }
            }
            
            $settings = $this->settingModel->getSettings();
            
            $this->successResponse([
                'is_employee' => true,
                'employee' => $employee,
                'pending_leaves_count' => $pendingLeaves,
                'active_loans_total' => $loanTotal,
                'month_present_days' => (int)($attStats['present_days'] ?? 0),
                'month_ot_hours' => (float)($attStats['total_ot'] ?? 0.0),
                'personal_expiries' => $personalDocs,
                'settings' => $settings
            ], 'Employee personal dashboard retrieved');
            return;
        }
        
        // 1. Employee Counts
        $totalEmp = (int)$db->query("SELECT COUNT(*) FROM employees WHERE status = 'Active'")->fetchColumn();
        $gccCitizens = (int)$db->query("SELECT COUNT(*) FROM employees WHERE status = 'Active' AND is_gcc_citizen = 1")->fetchColumn();
        $expats = $totalEmp - $gccCitizens;
        
        // 2. Department Distribution
        $deptStats = $db->query("
            SELECT d.name, COUNT(e.id) as count
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'Active'
            GROUP BY d.id
            ORDER BY count DESC
        ")->fetchAll(PDO::FETCH_ASSOC);
        
        // 3. Document Expiries in next 60 days
        $expiringDocs = $this->empModel->getUpcomingExpiries(60);
        $totalExpiringAlerts = count($expiringDocs);
        
        // 4. Pending Leave Applications
        $pendingLeaves = (int)$db->query("SELECT COUNT(*) FROM leave_applications WHERE status = 'Pending'")->fetchColumn();
        
        // 5. Active Loans Total
        $loanTotal = (float)$db->query("SELECT COALESCE(SUM(remaining_amount), 0) FROM loans WHERE status = 'Active'")->fetchColumn();
        
        // 6. Latest Payroll Run
        $latestPayroll = $db->query("SELECT * FROM payroll_periods ORDER BY year DESC, month DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        
        // 7. Monthly Salary Breakdown
        $monthlySalaryTotal = (float)$db->query("
            SELECT COALESCE(SUM(basic_salary + housing_allowance + transport_allowance + car_allowance + mobile_allowance + food_allowance + other_allowance), 0)
            FROM employees WHERE status = 'Active'
        ")->fetchColumn();
        
        $settings = $this->settingModel->getSettings();
        
        $this->successResponse([
            'total_employees' => $totalEmp,
            'gcc_citizens' => $gccCitizens,
            'expats' => $expats,
            'department_distribution' => $deptStats,
            'expiring_alerts_count' => $totalExpiringAlerts,
            'expiring_items' => array_slice($expiringDocs, 0, 8),
            'pending_leaves_count' => $pendingLeaves,
            'active_loans_total' => $loanTotal,
            'monthly_salary_estimate' => $monthlySalaryTotal,
            'latest_payroll' => $latestPayroll,
            'settings' => $settings
        ], 'Dashboard statistics retrieved');
    }
}
