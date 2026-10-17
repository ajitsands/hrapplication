<?php
// backend/public/index.php

use App\Config\Config;
use App\Core\Router;
use App\Core\AuthMiddleware;

// Autoloader for App namespace
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/../';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relativeClass = substr($class, $len);
    
    // Map Core, Config, Controllers, Models to lowercase directories
    $parts = explode('\\', $relativeClass);
    if (count($parts) > 1) {
        $parts[0] = strtolower($parts[0]);
    }
    $file = $baseDir . implode('/', $parts) . '.php';
    
    if (file_exists($file)) {
        require_once $file;
    }
});

// Set CORS headers
Config::setCorsHeaders();

// Initialize Router
$router = new Router();

// ==========================================
// 1. AUTH & PUBLIC ROUTES
// ==========================================
$router->post('/api/auth/login', ['App\Controllers\AuthController', 'login']);
$router->post('/api/auth/first-login-setup', ['App\Controllers\AuthController', 'firstLoginSetup']);
$router->get('/api/settings/public', ['App\Controllers\SettingsController', 'get']);
$router->get('/api/system/license-status', ['App\Controllers\VendorController', 'publicStatus']);
$router->post('/api/system/activate-key', ['App\Controllers\VendorController', 'publicActivateKey']);
$router->get('/api/attendance/template', ['App\Controllers\AttendanceController', 'template']);
$router->get('/api/download/card-bridge', ['App\Controllers\EmployeeController', 'downloadCardBridge']);

// ==========================================
// 2. AUTHENTICATED USER ROUTES
// ==========================================
$auth = [AuthMiddleware::class];

// Software Vendor & License Control (Super Admin Exclusive)
$router->get('/api/vendor/license-info', ['App\Controllers\VendorController', 'getLicenseInfo'], $auth);
$router->post('/api/vendor/activate-license', ['App\Controllers\VendorController', 'activateLicense'], $auth);
$router->post('/api/vendor/toggle-suspension', ['App\Controllers\VendorController', 'toggleSuspension'], $auth);
$router->post('/api/vendor/delete-transactional-data', ['App\Controllers\VendorController', 'deleteTransactionalData'], $auth);
$router->post('/api/vendor/change-password', ['App\Controllers\VendorController', 'changePassword'], $auth);

$router->get('/api/auth/profile', ['App\Controllers\AuthController', 'profile'], $auth);
$router->post('/api/auth/change-password', ['App\Controllers\AuthController', 'changePassword'], $auth);
$router->post('/api/auth/logout', ['App\Controllers\AuthController', 'logout'], $auth);

// User & Role Access Management (Admin & Super Admin)
$router->get('/api/users', ['App\Controllers\UserController', 'index'], $auth);
$router->post('/api/users', ['App\Controllers\UserController', 'store'], $auth);
$router->get('/api/users/{id}', ['App\Controllers\UserController', 'show'], $auth);
$router->put('/api/users/{id}', ['App\Controllers\UserController', 'update'], $auth);
$router->put('/api/users/{id}/status', ['App\Controllers\UserController', 'toggleStatus'], $auth);
$router->post('/api/users/{id}/reset-password', ['App\Controllers\UserController', 'resetPassword'], $auth);
$router->delete('/api/users/{id}', ['App\Controllers\UserController', 'destroy'], $auth);
$router->post('/api/employees/{id}/reset-password', ['App\Controllers\UserController', 'resetEmployeePassword'], $auth);

// Dashboard
$router->get('/api/dashboard/stats', ['App\Controllers\DashboardController', 'stats'], $auth);

// Employees
$router->get('/api/employees', ['App\Controllers\EmployeeController', 'index'], $auth);
$router->post('/api/employees', ['App\Controllers\EmployeeController', 'store'], $auth);
$router->get('/api/employees/expiries', ['App\Controllers\EmployeeController', 'expiries'], $auth);
$router->get('/api/employees/departments', ['App\Controllers\EmployeeController', 'departments'], $auth);
$router->post('/api/employees/departments', ['App\Controllers\EmployeeController', 'createDepartment'], $auth);
$router->get('/api/employees/designations', ['App\Controllers\EmployeeController', 'designations'], $auth);
$router->post('/api/employees/designations', ['App\Controllers\EmployeeController', 'createDesignation'], $auth);
$router->get('/api/employees/{id}', ['App\Controllers\EmployeeController', 'show'], $auth);
$router->put('/api/employees/{id}', ['App\Controllers\EmployeeController', 'update'], $auth);
$router->delete('/api/employees/{id}', ['App\Controllers\EmployeeController', 'destroy'], $auth);

// Documents & Attachments
$router->get('/api/documents/employee/{id}', ['App\Controllers\DocumentController', 'getByEmployee'], $auth);
$router->post('/api/documents/upload', ['App\Controllers\DocumentController', 'upload'], $auth);
$router->delete('/api/documents/{id}', ['App\Controllers\DocumentController', 'destroy'], $auth);

// Attendance & Biometric CSV
$router->get('/api/attendance', ['App\Controllers\AttendanceController', 'index'], $auth);
$router->get('/api/attendance/monthly-report', ['App\Controllers\AttendanceController', 'monthlyReport'], $auth);
$router->get('/api/attendance/batches', ['App\Controllers\AttendanceController', 'getBatches'], $auth);
$router->delete('/api/attendance/batches/{id}', ['App\Controllers\AttendanceController', 'deleteBatch'], $auth);
$router->post('/api/attendance/mark', ['App\Controllers\AttendanceController', 'mark'], $auth);
$router->post('/api/attendance/import', ['App\Controllers\AttendanceController', 'importCsv'], $auth);

// Shift Master & Monthly Rostering
$router->get('/api/shifts', ['App\Controllers\ShiftController', 'index'], $auth);
$router->post('/api/shifts', ['App\Controllers\ShiftController', 'store'], $auth);
$router->get('/api/shifts/departments', ['App\Controllers\ShiftController', 'getDepartments'], $auth);
$router->post('/api/shifts/departments', ['App\Controllers\ShiftController', 'updateDepartmentDefault'], $auth);
$router->get('/api/shifts/roster', ['App\Controllers\ShiftController', 'rosterMonthly'], $auth);
$router->post('/api/shifts/roster/cell', ['App\Controllers\ShiftController', 'saveRosterCell'], $auth);
$router->post('/api/shifts/roster/bulk', ['App\Controllers\ShiftController', 'saveRosterBulk'], $auth);
$router->get('/api/shifts/effective', ['App\Controllers\ShiftController', 'getEffectiveShift'], $auth);
$router->get('/api/shifts/{id}', ['App\Controllers\ShiftController', 'show'], $auth);
$router->put('/api/shifts/{id}', ['App\Controllers\ShiftController', 'update'], $auth);
$router->delete('/api/shifts/{id}', ['App\Controllers\ShiftController', 'destroy'], $auth);

// Payroll & Payslips (A5 ready)
$router->get('/api/payroll/periods', ['App\Controllers\PayrollController', 'periods'], $auth);
$router->get('/api/payroll/periods/{id}/payslips', ['App\Controllers\PayrollController', 'periodPayslips'], $auth);
$router->post('/api/payroll/calculate', ['App\Controllers\PayrollController', 'calculate'], $auth);
$router->put('/api/payroll/periods/{id}/status', ['App\Controllers\PayrollController', 'updateStatus'], $auth);
$router->get('/api/payroll/payslips/{id}', ['App\Controllers\PayrollController', 'singlePayslip'], $auth);

// Indemnity / End of Service (EOSB) & Leave Salary
$router->get('/api/indemnity', ['App\Controllers\IndemnityController', 'index'], $auth);
$router->post('/api/indemnity/calculate', ['App\Controllers\IndemnityController', 'calculate'], $auth);

// Leaves
$router->get('/api/leaves', ['App\Controllers\LeaveController', 'index'], $auth);
$router->post('/api/leaves/apply', ['App\Controllers\LeaveController', 'apply'], $auth);
$router->put('/api/leaves/{id}/status', ['App\Controllers\LeaveController', 'updateStatus'], $auth);
$router->get('/api/leaves/types', ['App\Controllers\LeaveController', 'types'], $auth);

// Loans & Advances
$router->get('/api/loans', ['App\Controllers\LoanController', 'index'], $auth);
$router->post('/api/loans', ['App\Controllers\LoanController', 'store'], $auth);
$router->put('/api/loans/{id}/status', ['App\Controllers\LoanController', 'updateStatus'], $auth);

// Settings & Holidays
$router->get('/api/settings', ['App\Controllers\SettingsController', 'get'], $auth);
$router->put('/api/settings', ['App\Controllers\SettingsController', 'update'], $auth);
$router->get('/api/settings/holidays', ['App\Controllers\SettingsController', 'holidays'], $auth);
$router->post('/api/settings/holidays', ['App\Controllers\SettingsController', 'addHoliday'], $auth);

// Dispatch Request
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$router->dispatch($requestUri, $requestMethod);
