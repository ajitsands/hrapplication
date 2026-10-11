<?php
// backend/controllers/AttendanceController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Attendance;
use App\Models\Setting;
use App\Models\Shift;
use App\Config\Database;
use PDO;

class AttendanceController extends Controller {
    private Attendance $attModel;
    private Setting $settingModel;
    private Shift $shiftModel;
    
    public function __construct() {
        $this->attModel = new Attendance();
        $this->settingModel = new Setting();
        $this->shiftModel = new Shift();
    }
    
    public function index(): void {
        $month = (int)($_GET['month'] ?? date('n'));
        $year = (int)($_GET['year'] ?? date('Y'));
        $deptId = !empty($_GET['department_id']) ? (int)$_GET['department_id'] : null;
        $empId = !empty($_GET['employee_id']) ? (int)$_GET['employee_id'] : null;
        
        if ($this->authUser && $this->authUser['role'] === 'employee') {
            $empId = (int)$this->authUser['employee_id'];
        }
        
        $records = $this->attModel->getMonthlyRecords($empId, $month, $year, $deptId);
        $summary = $this->attModel->getMonthlySummary($month, $year, $empId);
        
        $this->successResponse([
            'month' => $month,
            'year' => $year,
            'records' => $records,
            'summary' => $summary
        ], 'Attendance records retrieved');
    }
    
    public function mark(): void {
        $data = $this->getRequestData();
        $empId = (int)($data['employee_id'] ?? 0);
        $date = $data['date'] ?? date('Y-m-d');
        $status = $data['status'] ?? 'Present';
        $checkIn = !empty($data['check_in']) ? $data['check_in'] : null;
        $checkOut = !empty($data['check_out']) ? $data['check_out'] : null;
        $manualOt = isset($data['ot_hours']) && is_numeric($data['ot_hours']) ? (float)$data['ot_hours'] : null;
        $notes = $data['notes'] ?? '';
        
        if (empty($empId) || empty($date)) {
            $this->errorResponse('Employee ID and Date are required');
        }
        
        $settings = $this->settingModel->getSettings();
        $metrics = $this->calculateShiftMetrics($empId, $date, $checkIn, $checkOut, $status, $manualOt, $settings);
        
        $db = Database::getConnection();
        $sql = "INSERT INTO attendance (
                    employee_id, date, shift_id, check_in, check_out, total_hours, status,
                    early_in_mins, late_in_mins, early_out_mins,
                    ot_hours, day_ot_hours, night_ot_hours, holiday_ot_hours, ot_rate_applied, source, notes
                ) VALUES (
                    :emp_id, :date, :shift_id, :check_in, :check_out, :total_hours, :status,
                    :early_in_mins, :late_in_mins, :early_out_mins,
                    :ot_hours, :day_ot_hours, :night_ot_hours, :holiday_ot_hours, :ot_rate, 'Manual', :notes
                ) ON DUPLICATE KEY UPDATE 
                    shift_id = VALUES(shift_id), check_in = VALUES(check_in), check_out = VALUES(check_out),
                    total_hours = VALUES(total_hours), status = VALUES(status),
                    early_in_mins = VALUES(early_in_mins), late_in_mins = VALUES(late_in_mins), early_out_mins = VALUES(early_out_mins),
                    ot_hours = VALUES(ot_hours), day_ot_hours = VALUES(day_ot_hours), night_ot_hours = VALUES(night_ot_hours),
                    holiday_ot_hours = VALUES(holiday_ot_hours), ot_rate_applied = VALUES(ot_rate_applied), notes = VALUES(notes)";
                
        $stmt = $db->prepare($sql);
        $stmt->execute([
            'emp_id' => $empId,
            'date' => $date,
            'shift_id' => $metrics['shift_id'],
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'total_hours' => $metrics['total_hours'],
            'status' => $status,
            'early_in_mins' => $metrics['early_in_mins'],
            'late_in_mins' => $metrics['late_in_mins'],
            'early_out_mins' => $metrics['early_out_mins'],
            'ot_hours' => $metrics['ot_hours'],
            'day_ot_hours' => $metrics['day_ot_hours'],
            'night_ot_hours' => $metrics['night_ot_hours'],
            'holiday_ot_hours' => $metrics['holiday_ot_hours'],
            'ot_rate' => $metrics['ot_rate_applied'],
            'notes' => $notes
        ]);
        
        $this->successResponse($metrics, 'Attendance marked successfully');
    }
    
    public function importCsv(): void {
        $settings = $this->settingModel->getSettings();
        $db = Database::getConnection();
        
        // Cache employee mapping
        $empStmt = $db->query("SELECT id, emp_code, cpr_no FROM employees");
        $empCodeMap = [];
        $cprMap = [];
        while ($row = $empStmt->fetch(PDO::FETCH_ASSOC)) {
            $empCodeMap[strtoupper(trim($row['emp_code']))] = (int)$row['id'];
            $cprMap[trim($row['cpr_no'])] = (int)$row['id'];
        }
        
        $lines = [];
        if (isset($_FILES['csv_file']) && $_FILES['csv_file']['error'] === UPLOAD_ERR_OK) {
            $content = file_get_contents($_FILES['csv_file']['tmp_name']);
            $lines = preg_split("/\r\n|\n|\r/", trim($content));
        } else {
            $data = $this->getRequestData();
            if (!empty($data['csv_text'])) {
                $lines = preg_split("/\r\n|\n|\r/", trim($data['csv_text']));
            }
        }
        
        if (empty($lines)) {
            $this->errorResponse('No CSV file or data provided.');
        }
        
        $importedCount = 0;
        
        $stmt = $db->prepare("
            INSERT INTO attendance (
                employee_id, date, shift_id, check_in, check_out, total_hours, status,
                early_in_mins, late_in_mins, early_out_mins,
                ot_hours, day_ot_hours, night_ot_hours, holiday_ot_hours, ot_rate_applied, source, notes
            ) VALUES (
                :emp_id, :date, :shift_id, :check_in, :check_out, :total_hours, :status,
                :early_in_mins, :late_in_mins, :early_out_mins,
                :ot_hours, :day_ot_hours, :night_ot_hours, :holiday_ot_hours, :ot_rate, 'Biometric CSV Import', :notes
            ) ON DUPLICATE KEY UPDATE 
                shift_id = VALUES(shift_id), check_in = VALUES(check_in), check_out = VALUES(check_out),
                total_hours = VALUES(total_hours), status = VALUES(status),
                early_in_mins = VALUES(early_in_mins), late_in_mins = VALUES(late_in_mins), early_out_mins = VALUES(early_out_mins),
                ot_hours = VALUES(ot_hours), day_ot_hours = VALUES(day_ot_hours), night_ot_hours = VALUES(night_ot_hours),
                holiday_ot_hours = VALUES(holiday_ot_hours), ot_rate_applied = VALUES(ot_rate_applied), source = 'Biometric CSV Import'
        ");
        
        foreach ($lines as $idx => $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            $cols = str_getcsv($line);
            if ($idx === 0 && (stripos($cols[0], 'emp') !== false || stripos($cols[0], 'code') !== false || stripos($cols[0], 'cpr') !== false)) {
                continue;
            }
            
            $empIdentifier = trim($cols[0] ?? '');
            $date = trim($cols[1] ?? date('Y-m-d'));
            $checkIn = !empty($cols[2]) ? trim($cols[2]) : null;
            $checkOut = !empty($cols[3]) ? trim($cols[3]) : null;
            $status = !empty($cols[4]) ? trim($cols[4]) : 'Present';
            $manualOt = isset($cols[5]) && is_numeric($cols[5]) ? (float)$cols[5] : null;
            
            $empId = $empCodeMap[strtoupper($empIdentifier)] ?? ($cprMap[$empIdentifier] ?? null);
            if (!$empId && is_numeric($empIdentifier)) {
                $empId = (int)$empIdentifier;
            }
            
            if (!$empId) {
                continue;
            }
            
            // Format time if single digit or formatted as HH:MM
            if ($checkIn && strlen($checkIn) === 5) $checkIn .= ':00';
            if ($checkOut && strlen($checkOut) === 5) $checkOut .= ':00';
            
            $formattedDate = date('Y-m-d', strtotime($date));
            $metrics = $this->calculateShiftMetrics($empId, $formattedDate, $checkIn, $checkOut, $status, $manualOt, $settings);
            
            $stmt->execute([
                'emp_id' => $empId,
                'date' => $formattedDate,
                'shift_id' => $metrics['shift_id'],
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'total_hours' => $metrics['total_hours'],
                'status' => $status,
                'early_in_mins' => $metrics['early_in_mins'],
                'late_in_mins' => $metrics['late_in_mins'],
                'early_out_mins' => $metrics['early_out_mins'],
                'ot_hours' => $metrics['ot_hours'],
                'day_ot_hours' => $metrics['day_ot_hours'],
                'night_ot_hours' => $metrics['night_ot_hours'],
                'holiday_ot_hours' => $metrics['holiday_ot_hours'],
                'ot_rate' => $metrics['ot_rate_applied'],
                'notes' => 'Imported via biometric punch CSV (Matched with ' . ($metrics['shift_info']['name'] ?? 'General Shift') . ')'
            ]);
            
            $importedCount++;
        }
        
        $this->successResponse([
            'imported_records' => $importedCount
        ], "Biometric Attendance CSV successfully processed ($importedCount records imported/updated with shift overtime).");
    }
    
    public function monthlyReport(): void {
        $month = (int)($_GET['month'] ?? date('n'));
        $year = (int)($_GET['year'] ?? date('Y'));
        $scope = $_GET['scope'] ?? 'all';
        $empId = !empty($_GET['employee_id']) ? (int)$_GET['employee_id'] : null;
        $deptId = !empty($_GET['department_id']) ? (int)$_GET['department_id'] : null;
        
        if ($this->authUser && $this->authUser['role'] === 'employee') {
            $empId = (int)$this->authUser['employee_id'];
            $scope = 'individual';
        }
        
        $settings = $this->settingModel->getSettings();
        $stdWorkDays = (int)($settings['work_days_per_month'] ?? 30);
        $stdWorkHours = (float)($settings['work_hours_per_day'] ?? 8.00);
        $divisorHours = $stdWorkDays * $stdWorkHours;
        if ($divisorHours <= 0) $divisorHours = 240;
        
        $db = Database::getConnection();
        
        // Fetch target employees
        $empSql = "SELECT e.*, d.name as department_name, ds.name as designation_name,
                          d.default_shift_id, s.name as default_shift_name, s.code as default_shift_code
                   FROM employees e
                   LEFT JOIN departments d ON e.department_id = d.id
                   LEFT JOIN designations ds ON e.designation_id = ds.id
                   LEFT JOIN shifts s ON d.default_shift_id = s.id
                   WHERE e.status = 'Active'";
        $empParams = [];
        
        if ($empId) {
            $empSql .= " AND e.id = ?";
            $empParams[] = $empId;
        } elseif ($deptId) {
            $empSql .= " AND e.department_id = ?";
            $empParams[] = $deptId;
        }
        
        $empSql .= " ORDER BY e.emp_code ASC";
        $empStmt = $db->prepare($empSql);
        $empStmt->execute($empParams);
        $employees = $empStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $daysInMonth = (int)date('t', mktime(0, 0, 0, $month, 1, $year));
        
        // Fetch all attendance records with shift join
        $attStmt = $db->prepare("
            SELECT a.*, s.code as shift_code, s.name as shift_name, s.color_code as shift_color
            FROM attendance a 
            LEFT JOIN shifts s ON a.shift_id = s.id
            WHERE MONTH(a.date) = ? AND YEAR(a.date) = ?
        ");
        $attStmt->execute([$month, $year]);
        $allAtt = $attStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $attMap = [];
        foreach ($allAtt as $att) {
            $dayNum = (int)date('j', strtotime($att['date']));
            $attMap[$att['employee_id']][$dayNum] = $att;
        }
        
        $sheets = [];
        
        foreach ($employees as $emp) {
            $eId = (int)$emp['id'];
            $basic = (float)$emp['basic_salary'];
            $dailyBaseRate = $basic / $stdWorkDays;
            $hourlyBaseRate = $basic / $divisorHours;
            
            $daysData = [];
            $totalPresent = 0;
            $totalAbsent = 0;
            $totalWeekend = 0;
            $totalLeave = 0;
            $totalHoliday = 0;
            $totalHours = 0.00;
            $totalOtHours = 0.00;
            $totalDayOtHours = 0.00;
            $totalNightOtHours = 0.00;
            $totalHolidayOtHours = 0.00;
            $totalOtAmount = 0.000;
            $totalDailyEarnings = 0.000;
            
            for ($d = 1; $d <= $daysInMonth; $d++) {
                $dateStr = sprintf("%04d-%02d-%02d", $year, $month, $d);
                $dow = date('N', strtotime($dateStr));
                $dayName = date('D', strtotime($dateStr));
                $weeklyOffSetting = $settings['weekly_off_days'] ?? 'Friday,Saturday';
                $isWeekend = $this->isWeeklyOffDay($dateStr, $weeklyOffSetting);
                
                $record = $attMap[$eId][$d] ?? null;
                
                $checkIn = '';
                $checkOut = '';
                $dayHours = 0.00;
                $dayOt = 0.00;
                $shiftCode = $emp['default_shift_code'] ?? 'SH-GEN';
                $status = $isWeekend ? 'Weekend' : 'Absent';
                $dailyEarning = 0.000;
                
                if ($record) {
                    $checkIn = !empty($record['check_in']) ? date('g:i A', strtotime($record['check_in'])) : '';
                    $checkOut = !empty($record['check_out']) ? date('g:i A', strtotime($record['check_out'])) : '';
                    $checkIn24 = !empty($record['check_in']) ? date('H:i', strtotime($record['check_in'])) : '';
                    $checkOut24 = !empty($record['check_out']) ? date('H:i', strtotime($record['check_out'])) : '';
                    $dayHours = (float)$record['total_hours'];
                    $dayOt = (float)$record['ot_hours'];
                    $dayOtHours = (float)($record['day_ot_hours'] ?? 0.00);
                    $nightOtHours = (float)($record['night_ot_hours'] ?? 0.00);
                    $holidayOtHours = (float)($record['holiday_ot_hours'] ?? 0.00);
                    $shiftCode = $record['shift_code'] ?? ($emp['default_shift_code'] ?? 'SH-GEN');
                    $status = $record['status'];
                    
                    // Multipliers
                    $dayOtRate = (float)($settings['ot_normal_multiplier'] ?? 1.25);
                    $nightOtRate = (float)($settings['ot_night_multiplier'] ?? 1.50);
                    $holidayOtRate = 1.50;
                    
                    $otEarn = ($dayOtHours * $hourlyBaseRate * $dayOtRate) +
                              ($nightOtHours * $hourlyBaseRate * $nightOtRate) +
                              ($holidayOtHours * $hourlyBaseRate * $holidayOtRate);
                    
                    if ($otEarn == 0 && $dayOt > 0) {
                        $otEarn = $dayOt * $hourlyBaseRate * (float)$record['ot_rate_applied'];
                    }
                    
                    if ($status === 'Present') {
                        $totalPresent++;
                        $dailyEarning = $dailyBaseRate + $otEarn;
                    } elseif ($status === 'Half Day') {
                        $dailyEarning = ($dailyBaseRate * 0.5) + $otEarn;
                    } elseif ($status === 'On Leave') {
                        $totalLeave++;
                        $dailyEarning = $dailyBaseRate;
                    } elseif ($status === 'Holiday') {
                        $totalHoliday++;
                        $dailyEarning = $dailyBaseRate + $otEarn;
                    } elseif ($status === 'Weekend') {
                        $totalWeekend++;
                        $dailyEarning = $otEarn;
                    } elseif ($status === 'Absent') {
                        $totalAbsent++;
                    }
                    
                    $totalHours += $dayHours;
                    $totalOtHours += $dayOt;
                    $totalDayOtHours += $dayOtHours;
                    $totalNightOtHours += $nightOtHours;
                    $totalHolidayOtHours += $holidayOtHours;
                    $totalOtAmount += $otEarn;
                    $totalDailyEarnings += $dailyEarning;
                } else {
                    if ($isWeekend) {
                        $totalWeekend++;
                        $status = 'Weekend';
                    } else {
                        $status = '—';
                    }
                }
                
                $daysData[$d] = [
                    'day' => $d,
                    'date' => $dateStr,
                    'day_name' => $dayName,
                    'is_weekend' => $isWeekend,
                    'shift_code' => $shiftCode,
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                    'check_in_24' => $checkIn24 ?? '',
                    'check_out_24' => $checkOut24 ?? '',
                    'total_hours' => $dayHours > 0 ? sprintf("%.2f", $dayHours) : '',
                    'ot_hours' => $dayOt > 0 ? sprintf("%.2f", $dayOt) : '',
                    'status' => $status,
                    'daily_earning' => $dailyEarning > 0 ? sprintf("%.3f", $dailyEarning) : ''
                ];
            }
            
            $sheets[] = [
                'employee' => $emp,
                'month' => $month,
                'year' => $year,
                'month_title' => date('F Y', mktime(0, 0, 0, $month, 1, $year)),
                'assigned_shift' => $emp['default_shift_name'] ?? 'Morning / General Shift (08:00 - 16:00)',
                'assigned_shift_code' => $emp['default_shift_code'] ?? 'SH-GEN',
                'days_in_month' => $daysInMonth,
                'days' => $daysData,
                'summary' => [
                    'present_days' => $totalPresent,
                    'absent_days' => $totalAbsent,
                    'leave_days' => $totalLeave,
                    'weekend_days' => $totalWeekend,
                    'holiday_days' => $totalHoliday,
                    'total_work_hours' => round($totalHours, 2),
                    'total_ot_hours' => round($totalOtHours, 2),
                    'total_day_ot_hours' => round($totalDayOtHours, 2),
                    'total_night_ot_hours' => round($totalNightOtHours, 2),
                    'total_holiday_ot_hours' => round($totalHolidayOtHours, 2),
                    'total_ot_amount' => round($totalOtAmount, 3),
                    'basic_salary' => $basic,
                    'daily_rate' => round($dailyBaseRate, 3),
                    'hourly_rate' => round($hourlyBaseRate, 3),
                    'total_earnings' => round($totalDailyEarnings, 3)
                ]
            ];
        }
        
        $this->successResponse([
            'month' => $month,
            'year' => $year,
            'month_title' => date('F Y', mktime(0, 0, 0, $month, 1, $year)),
            'days_in_month' => $daysInMonth,
            'sheets' => $sheets
        ], 'Monthly attendance printout sheets generated successfully');
    }

    /**
     * Calculates shift match, grace period deviations, and categorized overtime (Day vs Night vs Holiday).
     */
    private function calculateShiftMetrics(int $empId, string $date, ?string $checkIn, ?string $checkOut, string $status, ?float $manualOt, array $settings): array {
        $effective = $this->shiftModel->getEffectiveShift($empId, $date);
        $shift = $effective['shift'] ?? null;
        $isOffDay = !empty($effective['is_off_day']);
        
        $stdHours = $shift ? (float)$shift['total_hours'] : (float)($settings['work_hours_per_day'] ?? 8.00);
        $normalOtRate = (float)($settings['ot_normal_multiplier'] ?? 1.25);
        $nightOtRate = (float)($settings['ot_night_multiplier'] ?? 1.50);
        $weekendOtRate = (float)($settings['ot_night_multiplier'] ?? 1.50);
        
        $totalHours = 0.00;
        $earlyInMins = 0;
        $lateInMins = 0;
        $earlyOutMins = 0;
        $otHours = 0.00;
        $dayOtHours = 0.00;
        $nightOtHours = 0.00;
        $holidayOtHours = 0.00;
        $otRateApplied = $normalOtRate;
        
        if ($checkIn && $checkOut) {
            $tIn = strtotime($date . ' ' . $checkIn);
            $tOut = strtotime($date . ' ' . $checkOut);
            if ($tOut <= $tIn) {
                $tOut += 86400; // overnight punch
            }
            $totalHours = round(($tOut - $tIn) / 3600, 2);
            
            // Grace time check against shift
            if ($shift && !empty($shift['start_time'])) {
                $shiftStart = strtotime($date . ' ' . $shift['start_time']);
                $graceLate = (int)($shift['grace_late_in'] ?? 15);
                
                if ($tIn < $shiftStart) {
                    $earlyInMins = (int)round(($shiftStart - $tIn) / 60);
                } elseif ($tIn > $shiftStart) {
                    $lateDiff = (int)round(($tIn - $shiftStart) / 60);
                    if ($lateDiff > $graceLate) {
                        $lateInMins = $lateDiff;
                    }
                }
            }
            
            if ($shift && !empty($shift['end_time'])) {
                $shiftEnd = strtotime($date . ' ' . $shift['end_time']);
                if ($shiftEnd <= strtotime($date . ' ' . $shift['start_time'])) {
                    $shiftEnd += 86400; // crosses midnight
                }
                $graceEarly = (int)($shift['grace_early_out'] ?? 15);
                
                if ($tOut < $shiftEnd) {
                    $earlyDiff = (int)round(($shiftEnd - $tOut) / 60);
                    if ($earlyDiff > $graceEarly) {
                        $earlyOutMins = $earlyDiff;
                    }
                }
            }
        } elseif ($status === 'Present') {
            $totalHours = $stdHours;
        }
        
        // Overtime classification (check against configured weekly off days)
        $weeklyOffSetting = $settings['weekly_off_days'] ?? 'Friday,Saturday';
        $isWeekend = $this->isWeeklyOffDay($date, $weeklyOffSetting);
        
        if ($isOffDay || $isWeekend || $status === 'Holiday') {
            $holidayOtHours = $totalHours;
            $otHours = $totalHours;
            $otRateApplied = $weekendOtRate;
        } else {
            $calculatedOt = max(0, round($totalHours - $stdHours, 2));
            $otHours = ($manualOt !== null) ? $manualOt : $calculatedOt;
            
            if ($otHours > 0) {
                if ($shift && !empty($shift['is_night_shift'])) {
                    $nightOtHours = $otHours;
                    $dayOtHours = 0.00;
                    $otRateApplied = $nightOtRate;
                } else {
                    // Check if punch-out occurred in Night window (19:00 - 07:00)
                    $nightWindowStart = strtotime($date . ' 19:00:00');
                    if (isset($tOut) && $tOut > $nightWindowStart) {
                        $nightSecs = $tOut - $nightWindowStart;
                        $potentialNightOt = round($nightSecs / 3600, 2);
                        $nightOtHours = min($otHours, $potentialNightOt);
                        $dayOtHours = round($otHours - $nightOtHours, 2);
                        $otRateApplied = $nightOtHours > $dayOtHours ? $nightOtRate : $normalOtRate;
                    } else {
                        $dayOtHours = $otHours;
                        $otRateApplied = $normalOtRate;
                    }
                }
            }
        }
        
        return [
            'shift_id' => $shift ? (int)$shift['id'] : null,
            'total_hours' => $totalHours,
            'early_in_mins' => $earlyInMins,
            'late_in_mins' => $lateInMins,
            'early_out_mins' => $earlyOutMins,
            'ot_hours' => $otHours,
            'day_ot_hours' => $dayOtHours,
            'night_ot_hours' => $nightOtHours,
            'holiday_ot_hours' => $holidayOtHours,
            'ot_rate_applied' => $otRateApplied,
            'shift_info' => $shift
        ];
    }

    /**
     * Checks if a given date falls on a configured weekly off day (e.g. 'Friday,Saturday' or 'Friday' or 'Saturday,Sunday').
     */
    private function isWeeklyOffDay(string $date, string $weeklyOffDaysSetting): bool {
        $dow = (int)date('N', strtotime($date)); // 1=Monday ... 7=Sunday
        $dayName = date('l', strtotime($date)); // 'Friday', 'Saturday', etc.
        
        $offDays = array_map('trim', explode(',', $weeklyOffDaysSetting));
        $dayMap = [
            'Monday' => 1, 'Tuesday' => 2, 'Wednesday' => 3, 'Thursday' => 4,
            'Friday' => 5, 'Saturday' => 6, 'Sunday' => 7
        ];
        
        foreach ($offDays as $od) {
            if (is_numeric($od) && (int)$od === $dow) return true;
            if (strcasecmp($od, $dayName) === 0) return true;
            if (isset($dayMap[$od]) && $dayMap[$od] === $dow) return true;
        }
        return false;
    }

    public function template(): void {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="biometric_attendance_template.csv"');
        
        echo "EmpCode,Date,CheckIn,CheckOut,Status,OvertimeHours\n";
        echo "EMP-001,2026-10-01,08:00,16:00,Present,0\n";
        echo "EMP-002,2026-10-01,08:00,18:30,Present,2.5\n";
        echo "EMP-003,2026-10-01,08:00,16:00,Present,0\n";
        echo "EMP-004,2026-10-01,08:00,17:30,Present,1.5\n";
        echo "EMP-005,2026-10-01,08:00,16:00,Present,0\n";
        exit();
    }
}
