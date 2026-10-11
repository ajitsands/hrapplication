<?php
// backend/controllers/IndemnityController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Indemnity;
use App\Models\Setting;
use App\Models\Employee;
use App\Config\Database;
use DateTime;
use PDO;

class IndemnityController extends Controller {
    private Indemnity $indemnityModel;
    private Setting $settingModel;
    private Employee $empModel;
    
    public function __construct() {
        $this->indemnityModel = new Indemnity();
        $this->settingModel = new Setting();
        $this->empModel = new Employee();
    }
    
    public function index(): void {
        $records = $this->indemnityModel->getAllRecords();
        $this->successResponse($records, 'Indemnity calculations retrieved');
    }
    
    public function calculate(): void {
        $data = $this->getRequestData();
        $empId = (int)($data['employee_id'] ?? 0);
        $exitDateStr = !empty($data['exit_date']) ? $data['exit_date'] : date('Y-m-d');
        $unusedLeaveDays = (float)($data['unused_leave_days'] ?? 0);
        $otherDues = (float)($data['other_dues'] ?? 0);
        $deductions = (float)($data['deductions'] ?? 0);
        $reason = $data['reason'] ?? 'Contract Completion';
        $saveRecord = !empty($data['save_record']);
        
        $emp = $this->empModel->findById($empId);
        if (!$emp) {
            $this->errorResponse('Employee not found', 404);
        }
        
        $settings = $this->settingModel->getSettings();
        $tier1MaxYears = (int)($settings['indemnity_tier1_max_years'] ?? 3);
        $tier1Days = (float)($settings['indemnity_tier1_days_per_year'] ?? 15.00); // 15 days
        $tier2Days = (float)($settings['indemnity_tier2_days_per_year'] ?? 30.00); // 30 days
        
        $joinDate = new DateTime($emp['date_of_joining']);
        $exitDate = new DateTime($exitDateStr);
        
        if ($exitDate < $joinDate) {
            $this->errorResponse('Exit date cannot be earlier than Date of Joining.');
        }
        
        $diff = $joinDate->diff($exitDate);
        $serviceYears = $diff->y;
        $serviceMonths = $diff->m;
        $serviceDays = $diff->d;
        $totalDays = $diff->days;
        
        $basicSalary = (float)$emp['basic_salary'];
        $dailyBasic = $basicSalary / 30; // standard 30-day month in Bahrain
        
        // Exact fractional service in years
        $exactServiceYears = $serviceYears + ($serviceMonths / 12) + ($serviceDays / 365.25);
        
        $tier1Amount = 0.000;
        $tier2Amount = 0.000;
        $tier1DaysCount = 0.00;
        $tier2DaysCount = 0.00;
        
        if ($exactServiceYears <= $tier1MaxYears) {
            $tier1DaysCount = round($exactServiceYears * $tier1Days, 2);
            $tier1Amount = round($tier1DaysCount * $dailyBasic, 3);
        } else {
            $tier1DaysCount = round($tier1MaxYears * $tier1Days, 2);
            $tier1Amount = round($tier1DaysCount * $dailyBasic, 3);
            
            $tier2Years = $exactServiceYears - $tier1MaxYears;
            $tier2DaysCount = round($tier2Years * $tier2Days, 2);
            $tier2Amount = round($tier2DaysCount * $dailyBasic, 3);
        }
        
        $totalIndemnity = round($tier1Amount + $tier2Amount, 3);
        $leaveEncashment = round($unusedLeaveDays * $dailyBasic, 3);
        
        // Check active loan balance if any
        $db = Database::getConnection();
        $loanStmt = $db->prepare("SELECT remaining_amount FROM loans WHERE employee_id = ? AND status = 'Active'");
        $loanStmt->execute([$empId]);
        $activeLoan = $loanStmt->fetch(PDO::FETCH_ASSOC);
        $loanOutstanding = $activeLoan ? (float)$activeLoan['remaining_amount'] : 0.000;
        
        $totalDeductions = round($deductions + $loanOutstanding, 3);
        $finalSettlement = round($totalIndemnity + $leaveEncashment + $otherDues - $totalDeductions, 3);
        
        $result = [
            'employee' => $emp,
            'calculation_date' => date('Y-m-d'),
            'joining_date' => $emp['date_of_joining'],
            'exit_date' => $exitDateStr,
            'service_duration' => [
                'years' => $serviceYears,
                'months' => $serviceMonths,
                'days' => $serviceDays,
                'total_days' => $totalDays,
                'exact_years_decimal' => round($exactServiceYears, 3)
            ],
            'last_basic_salary' => $basicSalary,
            'daily_rate' => round($dailyBasic, 3),
            'tier1' => [
                'max_years' => $tier1MaxYears,
                'rate_days' => $tier1Days,
                'accumulated_days' => $tier1DaysCount,
                'amount' => $tier1Amount
            ],
            'tier2' => [
                'rate_days' => $tier2Days,
                'accumulated_days' => $tier2DaysCount,
                'amount' => $tier2Amount
            ],
            'total_indemnity' => $totalIndemnity,
            'leave_salary_encashment' => [
                'unused_leave_days' => $unusedLeaveDays,
                'amount' => $leaveEncashment
            ],
            'other_dues' => $otherDues,
            'deductions' => [
                'manual_deductions' => $deductions,
                'loan_outstanding' => $loanOutstanding,
                'total_deductions' => $totalDeductions
            ],
            'final_settlement_amount' => $finalSettlement,
            'reason' => $reason
        ];
        
        if ($saveRecord) {
            $insStmt = $db->prepare("
                INSERT INTO indemnity_calculations (
                    employee_id, calculation_date, joining_date, exit_date, service_years, service_months, service_days,
                    last_basic_salary, tier1_days, tier1_amount, tier2_days, tier2_amount, total_indemnity,
                    leave_encashment_amount, other_dues, deductions_amount, final_settlement_amount, reason, status, notes
                ) VALUES (
                    :emp_id, CURDATE(), :join_date, :exit_date, :s_years, :s_months, :s_days,
                    :basic, :t1_days, :t1_amt, :t2_days, :t2_amt, :tot_ind,
                    :leave_amt, :other_dues, :tot_ded, :final_settle, :reason, 'Approved', :notes
                )
            ");
            $insStmt->execute([
                'emp_id' => $empId,
                'join_date' => $emp['date_of_joining'],
                'exit_date' => $exitDateStr,
                's_years' => $serviceYears,
                's_months' => $serviceMonths,
                's_days' => $serviceDays,
                'basic' => $basicSalary,
                't1_days' => $tier1DaysCount,
                't1_amt' => $tier1Amount,
                't2_days' => $tier2DaysCount,
                't2_amt' => $tier2Amount,
                'tot_ind' => $totalIndemnity,
                'leave_amt' => $leaveEncashment,
                'other_dues' => $otherDues,
                'tot_ded' => $totalDeductions,
                'final_settle' => $finalSettlement,
                'reason' => $reason,
                'notes' => $data['notes'] ?? 'Calculated as per Bahrain Labor Law EOSB formula'
            ]);
            $result['saved_id'] = $db->lastInsertId();
        }
        
        $this->successResponse($result, 'Indemnity / EOSB calculated successfully!');
    }
}
