<?php
// backend/controllers/PayrollController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Payroll;
use App\Models\Setting;
use App\Models\Employee;
use App\Models\Attendance;
use App\Config\Database;
use PDO;

class PayrollController extends Controller {
    private Payroll $payrollModel;
    private Setting $settingModel;
    private Employee $empModel;
    private Attendance $attModel;
    
    public function __construct() {
        $this->payrollModel = new Payroll();
        $this->settingModel = new Setting();
        $this->empModel = new Employee();
        $this->attModel = new Attendance();
    }
    
    public function periods(): void {
        $periods = $this->payrollModel->getPeriodsList();
        
        // If employee role, mask company-wide aggregates
        if ($this->authUser && $this->authUser['role'] === 'employee') {
            $periods = array_map(function($p) {
                unset($p['total_gross'], $p['total_deductions'], $p['total_net'], $p['total_employees']);
                return $p;
            }, $periods);
        }
        
        $this->successResponse($periods, 'Payroll periods retrieved');
    }
    
    public function periodPayslips(array $params): void {
        $periodId = (int)($params['id'] ?? 0);
        $deptId = !empty($_GET['department_id']) ? (int)$_GET['department_id'] : null;
        $empId = !empty($_GET['employee_id']) ? (int)$_GET['employee_id'] : null;
        
        // If employee role, restrict to own payslips
        if ($this->authUser && $this->authUser['role'] === 'employee') {
            $empId = (int)$this->authUser['employee_id'];
        }
        
        $period = $this->payrollModel->findById($periodId);
        if (!$period) {
            $this->errorResponse('Payroll period not found', 404);
        }
        
        // If employee role, mask company-wide aggregates in period object
        if ($this->authUser && $this->authUser['role'] === 'employee') {
            unset($period['total_gross'], $period['total_deductions'], $period['total_net'], $period['total_employees']);
        }
        
        $payslips = $this->payrollModel->getPayslipsByPeriod($periodId, $deptId, $empId);
        
        $this->successResponse([
            'period' => $period,
            'payslips' => $payslips
        ], 'Period payslips retrieved');
    }
    
    public function singlePayslip(array $params): void {
        $payslipId = (int)($params['id'] ?? 0);
        $payslip = $this->payrollModel->getPayslipDetails($payslipId);
        
        if (!$payslip) {
            $this->errorResponse('Payslip not found', 404);
        }
        
        // If employee role, restrict
        if ($this->authUser && $this->authUser['role'] === 'employee' && (int)$this->authUser['employee_id'] !== (int)$payslip['employee_id']) {
            $this->errorResponse('Unauthorized to view this payslip', 403);
        }
        
        $settings = $this->settingModel->getSettings();
        
        $this->successResponse([
            'payslip' => $payslip,
            'settings' => $settings
        ], 'Payslip details retrieved');
    }
    
    public function calculate(): void {
        $this->requireAdminOrHr();
        $data = $this->getRequestData();
        $month = (int)($data['month'] ?? date('n'));
        $year = (int)($data['year'] ?? date('Y'));
        $scope = $data['scope'] ?? 'all'; // 'all', 'department', 'individual'
        $departmentId = !empty($data['department_id']) ? (int)$data['department_id'] : null;
        $employeeId = !empty($data['employee_id']) ? (int)$data['employee_id'] : null;
        
        $settings = $this->settingModel->getSettings();
        $stdWorkDays = (int)($settings['work_days_per_month'] ?? 30);
        $stdWorkHours = (float)($settings['work_hours_per_day'] ?? 8.00);
        $divisorHours = $stdWorkDays * $stdWorkHours; // 240 hours
        if ($divisorHours <= 0) $divisorHours = 240;
        
        $db = Database::getConnection();
        
        // 1. Find or create Payroll Period
        $periodTitle = date('F Y', mktime(0, 0, 0, $month, 1, $year)) . ' Payroll';
        $startDate = sprintf('%04d-%02d-01', $year, $month);
        $endDate = date('Y-m-t', strtotime($startDate));
        
        $periodStmt = $db->prepare("SELECT * FROM payroll_periods WHERE month = ? AND year = ?");
        $periodStmt->execute([$month, $year]);
        $period = $periodStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$period) {
            $insPeriod = $db->prepare("INSERT INTO payroll_periods (month, year, title, start_date, end_date, status, processed_by, processed_at) VALUES (?, ?, ?, ?, ?, 'Draft', ?, NOW())");
            $insPeriod->execute([$month, $year, $periodTitle, $startDate, $endDate, $this->authUser['id'] ?? null]);
            $periodId = (int)$db->lastInsertId();
        } else {
            $periodId = (int)$period['id'];
        }
        
        // 2. Fetch Target Employees
        $empSql = "SELECT * FROM employees WHERE status = 'Active'";
        $empParams = [];
        
        if ($scope === 'department' && $departmentId) {
            $empSql .= " AND department_id = ?";
            $empParams[] = $departmentId;
        } elseif ($scope === 'individual' && $employeeId) {
            $empSql .= " AND id = ?";
            $empParams[] = $employeeId;
        }
        
        $empStmt = $db->prepare($empSql);
        $empStmt->execute($empParams);
        $employees = $empStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($employees)) {
            $this->errorResponse('No active employees found for the selected criteria.');
        }
        
        // 3. Process each employee
        $payslipStmt = $db->prepare("
            INSERT INTO payslips (
                payroll_period_id, employee_id, basic_salary, housing_allowance, transport_allowance,
                car_allowance, mobile_allowance, food_allowance, other_allowance, present_days, absent_days,
                leave_days, ot_hours, ot_amount,
                day_ot_hours, day_ot_amount, night_ot_hours, night_ot_amount, holiday_ot_hours, holiday_ot_amount,
                leave_salary, bonus, total_earnings,
                gosi_employee_deduction, gosi_employer_contribution, lmra_monthly_fee,
                loan_deduction, absent_deduction, other_deduction, total_deductions,
                net_salary, payment_status, payment_method, remarks
            ) VALUES (
                :period_id, :employee_id, :basic_salary, :housing_allowance, :transport_allowance,
                :car_allowance, :mobile_allowance, :food_allowance, :other_allowance, :present_days, :absent_days,
                :leave_days, :ot_hours, :ot_amount,
                :day_ot_hours, :day_ot_amount, :night_ot_hours, :night_ot_amount, :holiday_ot_hours, :holiday_ot_amount,
                :leave_salary, :bonus, :total_earnings,
                :gosi_emp, :gosi_comp, :lmra_fee,
                :loan_deduction, :absent_deduction, :other_deduction, :total_deductions,
                :net_salary, 'Unpaid', 'Bank Transfer / SBP', :remarks
            ) ON DUPLICATE KEY UPDATE
                basic_salary = VALUES(basic_salary), housing_allowance = VALUES(housing_allowance),
                transport_allowance = VALUES(transport_allowance), car_allowance = VALUES(car_allowance),
                mobile_allowance = VALUES(mobile_allowance), food_allowance = VALUES(food_allowance),
                other_allowance = VALUES(other_allowance), present_days = VALUES(present_days),
                absent_days = VALUES(absent_days), leave_days = VALUES(leave_days),
                ot_hours = VALUES(ot_hours), ot_amount = VALUES(ot_amount),
                day_ot_hours = VALUES(day_ot_hours), day_ot_amount = VALUES(day_ot_amount),
                night_ot_hours = VALUES(night_ot_hours), night_ot_amount = VALUES(night_ot_amount),
                holiday_ot_hours = VALUES(holiday_ot_hours), holiday_ot_amount = VALUES(holiday_ot_amount),
                leave_salary = VALUES(leave_salary), bonus = VALUES(bonus), total_earnings = VALUES(total_earnings),
                gosi_employee_deduction = VALUES(gosi_employee_deduction),
                gosi_employer_contribution = VALUES(gosi_employer_contribution),
                lmra_monthly_fee = VALUES(lmra_monthly_fee), loan_deduction = VALUES(loan_deduction),
                absent_deduction = VALUES(absent_deduction), other_deduction = VALUES(other_deduction),
                total_deductions = VALUES(total_deductions), net_salary = VALUES(net_salary),
                remarks = VALUES(remarks)
        ");
        
        $processedCount = 0;
        
        foreach ($employees as $emp) {
            $eId = (int)$emp['id'];
            $basic = (float)$emp['basic_salary'];
            $housing = (float)$emp['housing_allowance'];
            $transport = (float)$emp['transport_allowance'];
            $car = (float)$emp['car_allowance'];
            $mobile = (float)$emp['mobile_allowance'];
            $food = (float)$emp['food_allowance'];
            $other = (float)$emp['other_allowance'];
            $isGcc = (int)$emp['is_gcc_citizen'];
            
            // Attendance calculation for month
            $attRecords = $this->attModel->getMonthlySummary($month, $year, $eId);
            $attSummary = !empty($attRecords) ? $attRecords[0] : null;
            
            $presentDays = $attSummary ? (int)$attSummary['present_days'] : $stdWorkDays;
            $absentDays = $attSummary ? (int)$attSummary['absent_days'] : 0;
            $leaveDays = $attSummary ? (int)$attSummary['leave_days'] : 0;
            $otHours = $attSummary ? (float)$attSummary['total_ot_hours'] : 0.00;
            $dayOtHours = $attSummary ? (float)($attSummary['total_day_ot_hours'] ?? 0.00) : 0.00;
            $nightOtHours = $attSummary ? (float)($attSummary['total_night_ot_hours'] ?? 0.00) : 0.00;
            $holidayOtHours = $attSummary ? (float)($attSummary['total_holiday_ot_hours'] ?? 0.00) : 0.00;
            
            if ($otHours > 0 && ($dayOtHours + $nightOtHours + $holidayOtHours) == 0) {
                $dayOtHours = $otHours;
            }
            
            // Hourly base rate for Overtime under Bahrain Labor Law
            $hourlyRate = $basic / $divisorHours;
            $normalOtRate = (float)($settings['ot_normal_multiplier'] ?? 1.25);
            $nightOtRate = (float)($settings['ot_night_multiplier'] ?? 1.50);
            $holidayOtRate = 1.50;
            
            $dayOtAmount = round($dayOtHours * $hourlyRate * $normalOtRate, 3);
            $nightOtAmount = round($nightOtHours * $hourlyRate * $nightOtRate, 3);
            $holidayOtAmount = round($holidayOtHours * $hourlyRate * $holidayOtRate, 3);
            $otAmount = round($dayOtAmount + $nightOtAmount + $holidayOtAmount, 3);
            
            // Absent deduction
            $dailyRate = $basic / $stdWorkDays;
            $absentDeduction = round($absentDays * $dailyRate, 3);
            
            // GOSI Calculation
            // Bahraini/GCC: 7% Emp / 12% Company on (Basic + Housing)
            // Expat: 1% Emp / 3% Company on Basic
            $gosiSubjectSalary = $isGcc ? ($basic + $housing) : $basic;
            $gosiEmpRate = $isGcc ? (float)$settings['gosi_citizen_emp_rate'] : (float)$settings['gosi_expat_emp_rate'];
            $gosiCompRate = $isGcc ? (float)$settings['gosi_citizen_comp_rate'] : (float)$settings['gosi_expat_comp_rate'];
            
            $gosiEmpDeduction = round($gosiSubjectSalary * ($gosiEmpRate / 100), 3);
            $gosiCompContribution = round($gosiSubjectSalary * ($gosiCompRate / 100), 3);
            
            // LMRA Fee (for Expats)
            $lmraFee = (!$isGcc) ? (float)($settings['lmra_monthly_fee'] ?? 10.000) : 0.000;
            
            // Loan / Advance deduction
            $loanStmt = $db->prepare("SELECT * FROM loans WHERE employee_id = ? AND status = 'Active' AND remaining_amount > 0 LIMIT 1");
            $loanStmt->execute([$eId]);
            $activeLoan = $loanStmt->fetch(PDO::FETCH_ASSOC);
            
            $loanDeduction = 0.000;
            if ($activeLoan) {
                $installment = (float)$activeLoan['monthly_installment'];
                $rem = (float)$activeLoan['remaining_amount'];
                $loanDeduction = ($installment > $rem) ? $rem : $installment;
            }
            
            $leaveSalary = 0.000;
            $bonus = 0.000;
            $otherDeduction = 0.000;
            
            $totalEarnings = round($basic + $housing + $transport + $car + $mobile + $food + $other + $otAmount + $leaveSalary + $bonus, 3);
            $totalDeductions = round($gosiEmpDeduction + $loanDeduction + $absentDeduction + $otherDeduction, 3);
            $netSalary = round($totalEarnings - $totalDeductions, 3);
            
            $remarks = sprintf("Auto-calculated for %s (OT: %s hrs [Day: %s, Night: %s, Hol: %s], Absent: %s d, GOSI: %s%%)", 
                date('M Y', strtotime($startDate)), $otHours, $dayOtHours, $nightOtHours, $holidayOtHours, $absentDays, $gosiEmpRate);
                
            $payslipStmt->execute([
                'period_id' => $periodId,
                'employee_id' => $eId,
                'basic_salary' => $basic,
                'housing_allowance' => $housing,
                'transport_allowance' => $transport,
                'car_allowance' => $car,
                'mobile_allowance' => $mobile,
                'food_allowance' => $food,
                'other_allowance' => $other,
                'present_days' => $presentDays,
                'absent_days' => $absentDays,
                'leave_days' => $leaveDays,
                'ot_hours' => $otHours,
                'ot_amount' => $otAmount,
                'day_ot_hours' => $dayOtHours,
                'day_ot_amount' => $dayOtAmount,
                'night_ot_hours' => $nightOtHours,
                'night_ot_amount' => $nightOtAmount,
                'holiday_ot_hours' => $holidayOtHours,
                'holiday_ot_amount' => $holidayOtAmount,
                'leave_salary' => $leaveSalary,
                'bonus' => $bonus,
                'total_earnings' => $totalEarnings,
                'gosi_emp' => $gosiEmpDeduction,
                'gosi_comp' => $gosiCompContribution,
                'lmra_fee' => $lmraFee,
                'loan_deduction' => $loanDeduction,
                'absent_deduction' => $absentDeduction,
                'other_deduction' => $otherDeduction,
                'total_deductions' => $totalDeductions,
                'net_salary' => $netSalary,
                'remarks' => $remarks
            ]);
            
            $processedCount++;
        }
        
        // 4. Update Period Totals
        $totStmt = $db->prepare("
            SELECT 
                COUNT(*) as emp_count,
                COALESCE(SUM(total_earnings), 0) as sum_gross,
                COALESCE(SUM(total_deductions), 0) as sum_deductions,
                COALESCE(SUM(net_salary), 0) as sum_net
            FROM payslips 
            WHERE payroll_period_id = ?
        ");
        $totStmt->execute([$periodId]);
        $totals = $totStmt->fetch(PDO::FETCH_ASSOC);
        
        $updPeriod = $db->prepare("
            UPDATE payroll_periods 
            SET total_gross = ?, total_deductions = ?, total_net = ?, total_employees = ?, status = 'Processing'
            WHERE id = ?
        ");
        $updPeriod->execute([
            $totals['sum_gross'],
            $totals['sum_deductions'],
            $totals['sum_net'],
            $totals['emp_count'],
            $periodId
        ]);
        
        $this->successResponse([
            'period_id' => $periodId,
            'processed_employees' => $processedCount,
            'totals' => $totals
        ], "Payroll calculated successfully for $processedCount employees!");
    }
    
    public function updateStatus(array $params): void {
        $this->requireAdminOrHr();
        $periodId = (int)($params['id'] ?? 0);
        $data = $this->getRequestData();
        $status = $data['status'] ?? 'Approved'; // 'Approved', 'Paid'
        
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE payroll_periods SET status = ?, processed_at = NOW() WHERE id = ?");
        $stmt->execute([$status, $periodId]);
        
        if ($status === 'Paid') {
            $db->prepare("UPDATE payslips SET payment_status = 'Paid', payment_date = CURDATE() WHERE payroll_period_id = ?")->execute([$periodId]);
            
            // Deduct active loan balances for payslips with loan deductions
            $loanPayslips = $db->query("SELECT id, employee_id, loan_deduction FROM payslips WHERE payroll_period_id = $periodId AND loan_deduction > 0")->fetchAll(PDO::FETCH_ASSOC);
            foreach ($loanPayslips as $lp) {
                $loan = $db->query("SELECT id, remaining_amount, paid_installments, total_installments FROM loans WHERE employee_id = {$lp['employee_id']} AND status = 'Active' LIMIT 1")->fetch(PDO::FETCH_ASSOC);
                if ($loan) {
                    $newRem = max(0, (float)$loan['remaining_amount'] - (float)$lp['loan_deduction']);
                    $newPaid = (int)$loan['paid_installments'] + 1;
                    $newStatus = ($newRem <= 0.001 || $newPaid >= (int)$loan['total_installments']) ? 'Completed' : 'Active';
                    
                    $db->prepare("UPDATE loans SET remaining_amount = ?, paid_installments = ?, status = ? WHERE id = ?")->execute([$newRem, $newPaid, $newStatus, $loan['id']]);
                    $db->prepare("INSERT INTO loan_repayments (loan_id, payslip_id, amount, repayment_date, notes) VALUES (?, ?, ?, CURDATE(), 'Payroll monthly deduction')")->execute([$loan['id'], $lp['id'], $lp['loan_deduction']]);
                }
            }
        }
        
        $this->successResponse(null, "Payroll status updated to $status");
    }
}
