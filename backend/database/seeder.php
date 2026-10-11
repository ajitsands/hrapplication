<?php
// backend/database/seeder.php

$host = '127.0.0.1';
$user = 'root';
$pass = 'S@nds1@b';
$dbname = 'hr_solution_db';

try {
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    
    // Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$dbname`");
    
    echo "Running Schema Creation...\n";
    $schema = file_get_contents(__DIR__ . '/schema.sql');
    $pdo->exec($schema);
    echo "Schema imported successfully!\n";
    
    // 1. Insert Default Settings
    $stmt = $pdo->prepare("INSERT INTO settings (
        company_name, cr_no, tax_number, country, country_code, timezone, date_format, 
        currency, currency_symbol, currency_decimals, gosi_citizen_emp_rate, gosi_citizen_comp_rate, 
        gosi_expat_emp_rate, gosi_expat_comp_rate, lmra_monthly_fee, work_hours_per_day, 
        work_days_per_month, ot_normal_multiplier, ot_night_multiplier, ot_holiday_multiplier, 
        indemnity_tier1_max_years, indemnity_tier1_days_per_year, indemnity_tier2_days_per_year,
        company_address, company_phone, company_email
    ) VALUES (
        'Al-Khaleej Technologies W.L.L.', 'CR-984210-BH', 'VAT-20094819', 'Bahrain', 'BH', 'Asia/Bahrain', 'd/m/Y',
        'BHD', 'BD', 3, 7.00, 12.00,
        1.00, 3.00, 10.000, 8.00,
        30, 1.25, 1.50, 2.00,
        3, 15.00, 30.00,
        'Building 450, Road 2810, Block 428, Seef District, Manama, Kingdom of Bahrain', '+973 1755 8899', 'admin@alkhaleejtech.bh'
    )");
    $stmt->execute();
    
    // 2. Insert Departments
    $departments = [
        ['Human Resources & Admin', 'HR', 'Manages employee lifecycle, talent, and administration'],
        ['Information Technology', 'IT', 'Software development, infrastructure, and technical support'],
        ['Finance & Accounts', 'FIN', 'Payroll, accounting, financial planning, and audit'],
        ['Operations & Logistics', 'OPS', 'Day-to-day operations and supply chain management'],
        ['Sales & Business Dev', 'SBD', 'Commercial operations, client relations, and growth']
    ];
    $deptStmt = $pdo->prepare("INSERT INTO departments (name, code, description) VALUES (?, ?, ?)");
    foreach ($departments as $dept) {
        $deptStmt->execute($dept);
    }
    
    // 3. Insert Designations
    $designations = [
        ['HR Director', 1, 'Head of HR'],
        ['HR Specialist', 1, 'HR Operations'],
        ['Lead Software Engineer', 2, 'Senior tech architect'],
        ['Full Stack Developer', 2, 'Core engineer'],
        ['Chief Accountant', 3, 'Head of finance'],
        ['Payroll Accountant', 3, 'Handles salary and tax'],
        ['Operations Manager', 4, 'Oversees logistics'],
        ['Business Development Executive', 5, 'Sales client specialist']
    ];
    $desigStmt = $pdo->prepare("INSERT INTO designations (name, department_id, description) VALUES (?, ?, ?)");
    foreach ($designations as $desig) {
        $desigStmt->execute($desig);
    }
    
    // 4. Insert Leave Types
    $leaveTypes = [
        ['Annual Leave', 30, 1, 1],
        ['Sick Leave', 15, 1, 0],
        ['Maternity Leave', 60, 1, 0],
        ['Emergency / Casual Leave', 6, 1, 0],
        ['Hajj Leave', 14, 1, 0],
        ['Unpaid Leave', 30, 0, 0]
    ];
    $ltStmt = $pdo->prepare("INSERT INTO leave_types (name, days_allowed_per_year, is_paid, carry_forward) VALUES (?, ?, ?, ?)");
    foreach ($leaveTypes as $lt) {
        $ltStmt->execute($lt);
    }
    
    // 5. Insert Holidays (Bahrain 2026/2027)
    $holidays = [
        ['New Year\'s Day', '2026-01-01', 2026, 1, 'Public Holiday'],
        ['Labour Day', '2026-05-01', 2026, 1, 'Worker\'s Day'],
        ['Eid Al-Fitr Day 1', '2026-03-20', 2026, 0, 'Islamic Holiday'],
        ['Eid Al-Fitr Day 2', '2026-03-21', 2026, 0, 'Islamic Holiday'],
        ['Eid Al-Fitr Day 3', '2026-03-22', 2026, 0, 'Islamic Holiday'],
        ['Arafat Day', '2026-05-27', 2026, 0, 'Islamic Holiday'],
        ['Eid Al-Adha Day 1', '2026-05-28', 2026, 0, 'Islamic Holiday'],
        ['Eid Al-Adha Day 2', '2026-05-29', 2026, 0, 'Islamic Holiday'],
        ['Islamic New Year (Muharram)', '2026-06-17', 2026, 0, 'Islamic Holiday'],
        ['National Day of Bahrain', '2026-12-16', 2026, 1, 'National Celebration'],
        ['National Day Holiday', '2026-12-17', 2026, 1, 'National Celebration']
    ];
    $holStmt = $pdo->prepare("INSERT INTO holidays (name, holiday_date, holiday_year, is_recurring, description) VALUES (?, ?, ?, ?, ?)");
    foreach ($holidays as $h) {
        $holStmt->execute($h);
    }
    
    // 6. Insert Employees with realistic Bahrain/GCC data & upcoming expiries
    $employees = [
        [
            'emp_code' => 'EMP-001',
            'first_name' => 'Ahmed',
            'last_name' => 'Al-Hussaini',
            'email' => 'ahmed.hussaini@alkhaleejtech.bh',
            'phone' => '+973 3948 1122',
            'gender' => 'Male',
            'dob' => '1988-04-15',
            'nationality' => 'Bahraini',
            'is_gcc_citizen' => 1,
            'cpr_no' => '880415982',
            'cpr_expiry' => '2027-04-15',
            'passport_no' => 'BH-894210',
            'passport_expiry' => '2028-10-12',
            'visa_no' => 'CITIZEN',
            'visa_expiry' => '2099-12-31',
            'driving_license_no' => 'DL-982104',
            'driving_license_expiry' => '2026-11-20', // Alert: ~40 days
            'insurance_no' => 'INS-BH-001',
            'insurance_expiry' => '2027-01-01',
            'gosi_no' => 'GOSI-9842110',
            'lmra_no' => 'NA-CITIZEN',
            'department_id' => 1,
            'designation_id' => 1,
            'date_of_joining' => '2021-02-01',
            'basic_salary' => 1400.000,
            'housing_allowance' => 300.000,
            'transport_allowance' => 100.000,
            'car_allowance' => 100.000,
            'mobile_allowance' => 50.000,
            'food_allowance' => 0.000,
            'other_allowance' => 50.000,
            'bank_name' => 'National Bank of Bahrain (NBB)',
            'iban' => 'BH29NBOB00001234567890',
            'bank_account_no' => '001234567890'
        ],
        [
            'emp_code' => 'EMP-002',
            'first_name' => 'Rahul',
            'last_name' => 'Sharma',
            'email' => 'rahul.sharma@alkhaleejtech.bh',
            'phone' => '+973 3811 4455',
            'gender' => 'Male',
            'dob' => '1992-08-22',
            'nationality' => 'Indian',
            'is_gcc_citizen' => 0,
            'cpr_no' => '920822104',
            'cpr_expiry' => '2026-11-05', // Alert: ~25 days!
            'passport_no' => 'Z9482019',
            'passport_expiry' => '2027-06-15',
            'visa_no' => 'LMRA-V-8849102',
            'visa_expiry' => '2026-11-05', // Alert: ~25 days!
            'driving_license_no' => 'DL-448201',
            'driving_license_expiry' => '2028-05-10',
            'insurance_no' => 'INS-EX-002',
            'insurance_expiry' => '2026-12-31',
            'gosi_no' => 'GOSI-4820192',
            'lmra_no' => 'LMRA-984210',
            'department_id' => 2,
            'designation_id' => 3,
            'date_of_joining' => '2022-06-15',
            'basic_salary' => 950.000,
            'housing_allowance' => 200.000,
            'transport_allowance' => 50.000,
            'car_allowance' => 50.000,
            'mobile_allowance' => 30.000,
            'food_allowance' => 50.000,
            'other_allowance' => 0.000,
            'bank_name' => 'Ahli United Bank (AUB)',
            'iban' => 'BH64AUBB00009876543210',
            'bank_account_no' => '009876543210'
        ],
        [
            'emp_code' => 'EMP-003',
            'first_name' => 'Fatima',
            'last_name' => 'Al-Mansoori',
            'email' => 'fatima.mansoori@alkhaleejtech.bh',
            'phone' => '+973 3655 7788',
            'gender' => 'Female',
            'dob' => '1995-11-10',
            'nationality' => 'Bahraini',
            'is_gcc_citizen' => 1,
            'cpr_no' => '951110482',
            'cpr_expiry' => '2028-11-10',
            'passport_no' => 'BH-774829',
            'passport_expiry' => '2029-01-20',
            'visa_no' => 'CITIZEN',
            'visa_expiry' => '2099-12-31',
            'driving_license_no' => 'DL-559102',
            'driving_license_expiry' => '2027-08-14',
            'insurance_no' => 'INS-BH-003',
            'insurance_expiry' => '2027-01-01',
            'gosi_no' => 'GOSI-5592810',
            'lmra_no' => 'NA-CITIZEN',
            'department_id' => 3,
            'designation_id' => 6,
            'date_of_joining' => '2023-01-10',
            'basic_salary' => 750.000,
            'housing_allowance' => 150.000,
            'transport_allowance' => 50.000,
            'car_allowance' => 0.000,
            'mobile_allowance' => 25.000,
            'food_allowance' => 0.000,
            'other_allowance' => 0.000,
            'bank_name' => 'Bank of Bahrain and Kuwait (BBK)',
            'iban' => 'BH48BBKU00004561237890',
            'bank_account_no' => '000456123789'
        ],
        [
            'emp_code' => 'EMP-004',
            'first_name' => 'Michael',
            'last_name' => 'Santos',
            'email' => 'michael.santos@alkhaleejtech.bh',
            'phone' => '+973 3722 9900',
            'gender' => 'Male',
            'dob' => '1990-03-05',
            'nationality' => 'Filipino',
            'is_gcc_citizen' => 0,
            'cpr_no' => '900305881',
            'cpr_expiry' => '2027-03-05',
            'passport_no' => 'P5849102B',
            'passport_expiry' => '2026-11-28', // Alert: ~48 days!
            'visa_no' => 'LMRA-V-9948201',
            'visa_expiry' => '2027-03-05',
            'driving_license_no' => 'DL-772910',
            'driving_license_expiry' => '2028-09-12',
            'insurance_no' => 'INS-EX-004',
            'insurance_expiry' => '2026-12-31',
            'gosi_no' => 'GOSI-7729104',
            'lmra_no' => 'LMRA-772910',
            'department_id' => 4,
            'designation_id' => 7,
            'date_of_joining' => '2023-08-01',
            'basic_salary' => 600.000,
            'housing_allowance' => 150.000,
            'transport_allowance' => 50.000,
            'car_allowance' => 50.000,
            'mobile_allowance' => 20.000,
            'food_allowance' => 40.000,
            'other_allowance' => 0.000,
            'bank_name' => 'Ithmaar Bank',
            'iban' => 'BH12ITHM00007894561230',
            'bank_account_no' => '000789456123'
        ],
        [
            'emp_code' => 'EMP-005',
            'first_name' => 'Maryam',
            'last_name' => 'Al-Doseri',
            'email' => 'maryam.doseri@alkhaleejtech.bh',
            'phone' => '+973 3999 1234',
            'gender' => 'Female',
            'dob' => '1997-07-19',
            'nationality' => 'Bahraini',
            'is_gcc_citizen' => 1,
            'cpr_no' => '970719882',
            'cpr_expiry' => '2029-07-19',
            'passport_no' => 'BH-991823',
            'passport_expiry' => '2030-02-14',
            'visa_no' => 'CITIZEN',
            'visa_expiry' => '2099-12-31',
            'driving_license_no' => 'DL-994812',
            'driving_license_expiry' => '2028-11-20',
            'insurance_no' => 'INS-BH-005',
            'insurance_expiry' => '2027-01-01',
            'gosi_no' => 'GOSI-9948120',
            'lmra_no' => 'NA-CITIZEN',
            'department_id' => 2,
            'designation_id' => 4,
            'date_of_joining' => '2024-02-01',
            'basic_salary' => 800.000,
            'housing_allowance' => 150.000,
            'transport_allowance' => 50.000,
            'car_allowance' => 0.000,
            'mobile_allowance' => 25.000,
            'food_allowance' => 0.000,
            'other_allowance' => 0.000,
            'bank_name' => 'BisB (Bahrain Islamic Bank)',
            'iban' => 'BH98BISB00008899776655',
            'bank_account_no' => '000889977665'
        ]
    ];
    
    $empSql = "INSERT INTO employees (
        emp_code, first_name, last_name, email, phone, gender, dob, nationality, is_gcc_citizen,
        cpr_no, cpr_expiry, passport_no, passport_expiry, visa_no, visa_expiry,
        driving_license_no, driving_license_expiry, insurance_no, insurance_expiry, gosi_no, lmra_no,
        department_id, designation_id, date_of_joining, basic_salary, housing_allowance,
        transport_allowance, car_allowance, mobile_allowance, food_allowance, other_allowance,
        bank_name, iban, bank_account_no
    ) VALUES (
        :emp_code, :first_name, :last_name, :email, :phone, :gender, :dob, :nationality, :is_gcc_citizen,
        :cpr_no, :cpr_expiry, :passport_no, :passport_expiry, :visa_no, :visa_expiry,
        :driving_license_no, :driving_license_expiry, :insurance_no, :insurance_expiry, :gosi_no, :lmra_no,
        :department_id, :designation_id, :date_of_joining, :basic_salary, :housing_allowance,
        :transport_allowance, :car_allowance, :mobile_allowance, :food_allowance, :other_allowance,
        :bank_name, :iban, :bank_account_no
    )";
    $empStmt = $pdo->prepare($empSql);
    foreach ($employees as $emp) {
        $empStmt->execute($emp);
    }
    
    // 7. Insert Users (Admin, HR, and Employee Logins)
    $passwordHash = password_hash('password123', PASSWORD_BCRYPT);
    
    $users = [
        [null, 'admin', 'admin@alkhaleejtech.bh', $passwordHash, 'admin', 'active'],
        [1, 'hr_admin', 'hr@alkhaleejtech.bh', $passwordHash, 'hr', 'active'],
        [2, 'emp_rahul', 'rahul.sharma@alkhaleejtech.bh', $passwordHash, 'employee', 'active'],
        [3, 'emp_fatima', 'fatima.mansoori@alkhaleejtech.bh', $passwordHash, 'employee', 'active'],
        [4, 'emp_michael', 'michael.santos@alkhaleejtech.bh', $passwordHash, 'employee', 'active'],
        [5, 'emp_maryam', 'maryam.doseri@alkhaleejtech.bh', $passwordHash, 'employee', 'active'],
    ];
    
    $userStmt = $pdo->prepare("INSERT INTO users (employee_id, username, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($users as $u) {
        $userStmt->execute($u);
    }
    
    // 8. Insert Documents for employees
    $docs = [
        [1, 'CPR', 'Ahmed Al-Hussaini CPR Card', 'uploads/docs/cpr_emp001.pdf', 245000, 'pdf', '2022-04-15', '2027-04-15', 'Valid CPR Card'],
        [1, 'Passport', 'Ahmed Bahraini Passport', 'uploads/docs/passport_emp001.pdf', 312000, 'pdf', '2023-10-12', '2028-10-12', 'Primary Travel Document'],
        [2, 'CPR', 'Rahul Sharma CPR Smart Card', 'uploads/docs/cpr_emp002.pdf', 198000, 'pdf', '2024-11-05', '2026-11-05', 'Expiring soon in 25 days!'],
        [2, 'Visa', 'LMRA Work Residence Permit', 'uploads/docs/visa_emp002.pdf', 415000, 'pdf', '2024-11-05', '2026-11-05', 'Renewal requested with LMRA'],
        [2, 'Passport', 'Indian Passport Booklet', 'uploads/docs/passport_emp002.pdf', 520000, 'pdf', '2017-06-15', '2027-06-15', 'Valid passport'],
        [4, 'Passport', 'Michael Santos Passport', 'uploads/docs/passport_emp004.pdf', 480000, 'pdf', '2016-11-28', '2026-11-28', 'Expiring in November 2026!'],
        [4, 'CPR', 'Michael Santos CPR', 'uploads/docs/cpr_emp004.pdf', 210000, 'pdf', '2025-03-05', '2027-03-05', 'Valid Smart Card']
    ];
    $docStmt = $pdo->prepare("INSERT INTO employee_documents (employee_id, doc_type, doc_name, file_path, file_size, file_ext, issue_date, expiry_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($docs as $d) {
        $docStmt->execute($d);
    }
    
    // 9. Insert Sample Active Loan
    $loanStmt = $pdo->prepare("INSERT INTO loans (employee_id, loan_title, loan_amount, monthly_installment, total_installments, paid_installments, remaining_amount, start_month, start_year, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $loanStmt->execute([2, 'Personal Emergency Advance', 600.000, 100.000, 6, 2, 400.000, 8, 2026, 'Active', 'Medical assistance in home country']);
    $loanStmt->execute([4, 'Vehicle Purchase Loan', 500.000, 50.000, 10, 1, 450.000, 9, 2026, 'Active', 'Used car purchase']);
    
    // 10. Insert Attendance for Current / Recent month (e.g. October 2026)
    $attStmt = $pdo->prepare("INSERT INTO attendance (employee_id, date, check_in, check_out, total_hours, status, ot_hours, ot_rate_applied, source, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    // Generate sample attendance records for all employees across several days
    for ($day = 1; $day <= 10; $day++) {
        $dateStr = sprintf("2026-10-%02d", $day);
        $dayOfWeek = date('N', strtotime($dateStr)); // 5 = Friday, 6 = Saturday in Gulf weekend
        
        foreach ([1, 2, 3, 4, 5] as $empId) {
            if ($dayOfWeek == 5 || $dayOfWeek == 6) {
                // Weekend
                $attStmt->execute([$empId, $dateStr, null, null, 0.00, 'Weekend', 0.00, 1.50, 'System', 'Gulf Weekend']);
            } else {
                // Normal work day
                $ot = ($empId == 2 && $day % 2 == 0) ? 2.50 : (($empId == 4 && $day % 3 == 0) ? 1.50 : 0.00);
                $totalH = 8.00 + $ot;
                $checkIn = '08:00:00';
                $checkOut = sprintf("%02d:00:00", 16 + (int)$ot);
                $attStmt->execute([$empId, $dateStr, $checkIn, $checkOut, $totalH, 'Present', $ot, 1.25, 'Biometric CSV', 'Normal Punch']);
            }
        }
    }
    
    // 11. Insert Sample Leave Applications
    $leaveAppStmt = $pdo->prepare("INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approved_by, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $leaveAppStmt->execute([3, 1, '2026-10-15', '2026-10-20', 5.0, 'Annual family holiday in Salalah', 'Approved', 1, '2026-10-01 10:30:00']);
    $leaveAppStmt->execute([2, 2, '2026-10-25', '2026-10-26', 2.0, 'Dental surgical treatment', 'Pending', null, null]);
    
    echo "Seed data inserted successfully!\n";
    echo "Default Admin Login: admin / password123\n";
    echo "Default HR Login: hr_admin / password123\n";
    echo "Default Employee Login: emp_rahul / password123\n";
    
} catch (Exception $e) {
    echo "Seeder Error: " . $e->getMessage() . "\n";
}
