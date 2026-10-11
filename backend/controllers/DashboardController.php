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
