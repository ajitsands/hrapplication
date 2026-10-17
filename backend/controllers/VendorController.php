<?php
// backend/controllers/VendorController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Services\LicenseService;
use App\Config\Database;
use PDO;
use Exception;

class VendorController extends Controller {
    private LicenseService $licenseService;

    public function __construct() {
        $this->licenseService = new LicenseService();
    }

    /**
     * Public system status check for frontend guard
     */
    public function publicStatus(): void {
        $status = $this->licenseService->verifyLocalLicense();
        
        // Check if superadmin is suspended in the users table
        $db = Database::getConnection();
        $superadminSuspended = false;
        try {
            $stmtSa = $db->query("SELECT status FROM users WHERE role IN ('super_admin', 'superadmin') LIMIT 1");
            $saUser = $stmtSa ? $stmtSa->fetch(PDO::FETCH_ASSOC) : null;
            if ($saUser && $saUser['status'] !== 'active') {
                $superadminSuspended = true;
            }
        } catch (Exception $e) {
            // ignore
        }

        $isSuspended = !empty($status['software_suspended']) || $superadminSuspended;
        $isValid = !empty($status['valid']) && !$superadminSuspended;
        $effectiveStatus = $superadminSuspended ? 'suspended' : ($status['status'] ?? 'unknown');
        $effectiveMsg = $superadminSuspended ? 'Super Administrator account is suspended. Key expired. Contact your vendor SaNDS Lab Help Line.' : ($status['message'] ?? '');
        $suspensionReason = $superadminSuspended ? 'Super Administrator access has been suspended. Key expired. Please contact your vendor SaNDS Lab Help Line.' : ($status['suspension_reason'] ?? null);

        $this->successResponse([
            'software_suspended' => $isSuspended,
            'superadmin_suspended' => $superadminSuspended,
            'status' => $effectiveStatus,
            'message' => $effectiveMsg,
            'suspension_reason' => $suspensionReason,
            'valid' => $isValid,
            'license_key_masked' => $status['license_key_masked'] ?? null,
            'days_remaining' => $status['days_remaining'] ?? null,
            'expires_at' => $status['expires_at'] ?? null,
            'customer' => $status['customer'] ?? null,
            'vendor_help_line' => '+973 35078079',
            'vendor_email' => 'support@sandslab.com',
            'vendor_name' => 'SaNDS Lab Middle East W.L.L.'
        ], 'System status retrieved');
    }

    /**
     * Public software key activation (used by Key Activation Screen)
     */
    public function publicActivateKey(): void {
        $data = $this->getRequestData();

        $licenseKey = trim($data['license_key'] ?? '');
        $domain = trim($data['domain_name'] ?? '');
        $ip = trim($data['ip_address'] ?? '');

        if (empty($licenseKey)) {
            $this->errorResponse('License key is required.');
        }

        try {
            $result = $this->licenseService->activateLicense($licenseKey, $domain ?: null, $ip ?: null);
            $this->successResponse($result, $result['message'] ?? 'Software activated successfully with SaNDS Lab Licensing Server!');
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get detailed license info and transactional stats (Super Admin only)
     */
    public function getLicenseInfo(): void {
        $this->requireSuperAdmin();

        $licenseInfo = $this->licenseService->verifyLocalLicense();
        $dbRecord = $this->licenseService->getLicenseRecord();

        // Transactional tables stats
        $db = Database::getConnection();
        $tables = [
            'attendance' => 'Attendance Records',
            'payslips' => 'Generated Payslips',
            'payroll_periods' => 'Payroll Periods',
            'leave_applications' => 'Leave Requests',
            'loan_repayments' => 'Loan Repayment Records',
            'loans' => 'Employee Loans & Advances',
            'indemnity_calculations' => 'End of Service (EOSB) Calculations'
        ];

        $stats = [];
        $totalTransactionalRows = 0;
        foreach ($tables as $tbl => $label) {
            try {
                $cnt = (int)$db->query("SELECT COUNT(*) FROM `$tbl`")->fetchColumn();
                $stats[$tbl] = [
                    'label' => $label,
                    'count' => $cnt
                ];
                $totalTransactionalRows += $cnt;
            } catch (Exception $e) {
                $stats[$tbl] = ['label' => $label, 'count' => 0];
            }
        }

        // Master records preserved stats
        $masterStats = [
            'employees' => (int)$db->query("SELECT COUNT(*) FROM employees")->fetchColumn(),
            'users' => (int)$db->query("SELECT COUNT(*) FROM users")->fetchColumn(),
            'departments' => (int)$db->query("SELECT COUNT(*) FROM departments")->fetchColumn(),
            'designations' => (int)$db->query("SELECT COUNT(*) FROM designations")->fetchColumn(),
        ];

        // Host server details
        $serverInfo = [
            'php_version' => PHP_VERSION,
            'openssl_version' => OPENSSL_VERSION_TEXT,
            'server_ip' => $_SERVER['SERVER_ADDR'] ?? ($_SERVER['LOCAL_ADDR'] ?? '127.0.0.1'),
            'host' => $_SERVER['HTTP_HOST'] ?? 'localhost',
            'database' => 'MySQL / hr_solution_db'
        ];

        $this->successResponse([
            'license' => $licenseInfo,
            'raw_key' => $dbRecord['license_key'] ?? '',
            'domain' => $dbRecord['license_domain'] ?? ($_SERVER['HTTP_HOST'] ?? 'localhost'),
            'customer' => $dbRecord['license_customer'] ?? ($licenseInfo['customer'] ?? 'Licensed Organization'),
            'software_suspended' => !empty($dbRecord['software_suspended']),
            'suspension_reason' => $dbRecord['software_suspension_reason'] ?? '',
            'stats' => $stats,
            'total_transactional_rows' => $totalTransactionalRows,
            'master_stats' => $masterStats,
            'server_info' => $serverInfo
        ], 'Vendor control details retrieved');
    }

    /**
     * Activate / Update software key from key.sandslab.com
     */
    public function activateLicense(): void {
        $this->requireSuperAdmin();
        $data = $this->getRequestData();

        $licenseKey = trim($data['license_key'] ?? '');
        $domain = trim($data['domain_name'] ?? '');
        $ip = trim($data['ip_address'] ?? '');

        if (empty($licenseKey)) {
            $this->errorResponse('License key is required.');
        }

        try {
            $result = $this->licenseService->activateLicense($licenseKey, $domain ?: null, $ip ?: null);
            $this->successResponse($result, $result['message'] ?? 'Software activated successfully!');
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Toggle software suspension (operational vs. suspended)
     */
    public function toggleSuspension(): void {
        $this->requireSuperAdmin();
        $data = $this->getRequestData();

        $suspended = !empty($data['suspended']);
        $reason = trim($data['reason'] ?? '');

        if ($suspended && empty($reason)) {
            $reason = 'Software access temporarily suspended by vendor (SaNDS Lab). Please contact your administrator or software provider.';
        }

        $ok = $this->licenseService->setSuspension($suspended, $reason);
        if (!$ok) {
            $this->errorResponse('Failed to update software suspension state.');
        }

        $statusMsg = $suspended ? 'Software has been SUSPENDED. All standard users are now locked out.' : 'Software has been RESTORED to operational status.';
        $this->successResponse([
            'software_suspended' => $suspended,
            'reason' => $reason
        ], $statusMsg);
    }

    /**
     * Delete All Transactional Data (Wipe attendance, payroll, leaves, loans, indemnity)
     */
    public function deleteTransactionalData(): void {
        $this->requireSuperAdmin();
        $data = $this->getRequestData();

        $phrase = trim($data['confirmation_phrase'] ?? '');
        $password = $data['password'] ?? '';

        if ($phrase !== 'DELETE ALL TRANSACTIONAL DATA') {
            $this->errorResponse('Invalid confirmation phrase. You must type precisely: DELETE ALL TRANSACTIONAL DATA');
        }

        if (empty($password)) {
            $this->errorResponse('Super Admin password is required to authorize this destructive operation.');
        }

        // Verify superadmin password
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT id, password_hash FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$this->authUser['id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->errorResponse('Super Administrator authentication failed. Incorrect password.', 401);
        }

        // Execute table wipe with foreign keys toggled safely
        try {
            $db->exec("SET FOREIGN_KEY_CHECKS = 0;");

            $tables = [
                'attendance',
                'payslips',
                'payroll_periods',
                'leave_applications',
                'loan_repayments',
                'loans',
                'indemnity_calculations'
            ];

            $clearedTables = [];
            foreach ($tables as $table) {
                $db->exec("TRUNCATE TABLE `$table`");
                $clearedTables[] = $table;
            }

            $db->exec("SET FOREIGN_KEY_CHECKS = 1;");

            $this->successResponse([
                'cleared_tables' => $clearedTables,
                'cleared_at' => date('Y-m-d H:i:s'),
                'master_records_preserved' => true
            ], 'All transactional data (Attendance, Payroll, Payslips, Leaves, Loans, and EOSB) has been wiped successfully. Master employee and system records are preserved.');
        } catch (Exception $e) {
            $db->exec("SET FOREIGN_KEY_CHECKS = 1;");
            $this->errorResponse('Database wipe error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Change Super Admin Password
     */
    public function changePassword(): void {
        $this->requireSuperAdmin();
        $data = $this->getRequestData();

        $newPassword = $data['new_password'] ?? '';
        if (strlen($newPassword) < 6) {
            $this->errorResponse('New password must be at least 6 characters long.');
        }

        $db = Database::getConnection();
        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $stmt = $db->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$newHash, $this->authUser['id']]);

        $this->successResponse(null, 'Super Administrator password updated successfully!');
    }
}
