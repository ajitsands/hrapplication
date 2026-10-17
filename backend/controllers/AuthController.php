<?php
// backend/controllers/AuthController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\User;
use App\Config\Database;
use PDO;
use Exception;

class AuthController extends Controller {
    private User $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    public function login(): void {
        $data = $this->getRequestData();
        $username = trim($data['username'] ?? '');
        $password = trim($data['password'] ?? '');
        
        if (empty($username) || empty($password)) {
            $this->errorResponse('Please provide both username and password.');
        }
        
        $user = $this->userModel->findByUsernameOrEmail($username);
        if (!$user) {
            $this->errorResponse('Invalid credentials or user does not exist.', 401);
        }
        
        if ($user['status'] !== 'active') {
            if (in_array($user['role'], ['super_admin', 'superadmin'])) {
                $this->errorResponse('Superadmin account has been suspended. Key expired or deactivated. Please contact your vendor SaNDS Lab Help Line (+973 35078079).', 423, [
                    'software_suspended' => true,
                    'superadmin_suspended' => true,
                    'vendor_help_line' => '+973 35078079'
                ]);
            }
            $this->errorResponse('This user account is currently deactivated. Please contact your system administrator.', 403);
        }
        
        if (!password_verify($password, $user['password_hash'])) {
            $this->errorResponse('Invalid credentials. Please check your username/CPR and password.', 401);
        }
        
        // Software License & Suspension Check (Super Admin can always log in to manage licenses)
        if (!in_array($user['role'], ['super_admin', 'superadmin'])) {
            $db = Database::getConnection();
            
            // Check if superadmin is suspended
            $stmtSa = $db->query("SELECT status FROM users WHERE role IN ('super_admin', 'superadmin') LIMIT 1");
            $saUser = $stmtSa ? $stmtSa->fetch(PDO::FETCH_ASSOC) : null;
            $superadminSuspended = ($saUser && $saUser['status'] !== 'active');

            $licService = new \App\Services\LicenseService();
            $licStatus = $licService->verifyLocalLicense();

            if ($superadminSuspended || !empty($licStatus['software_suspended'])) {
                $msg = 'Software access suspended. Key expired. Please contact your vendor SaNDS Lab Help Line (+973 35078079).';
                if (!empty($licStatus['suspension_reason'])) {
                    $msg = $licStatus['suspension_reason'];
                }
                $this->errorResponse($msg, 423, [
                    'software_suspended' => true,
                    'status' => 'suspended',
                    'superadmin_suspended' => $superadminSuspended,
                    'vendor_help_line' => '+973 35078079'
                ]);
            }

            if (!$licStatus['valid']) {
                $licState = $licStatus['status'] ?? 'unlicensed';
                if ($licState === 'unlicensed') {
                    $this->errorResponse('Software License Key is not added. Software key must be added and authenticated before accessing the application.', 423, [
                        'license_required' => true,
                        'status' => 'unlicensed',
                        'message' => 'Software License Key is not added. Please add and authenticate key.',
                        'vendor_help_line' => '+973 35078079'
                    ]);
                } else if ($licState === 'expired') {
                    $this->errorResponse('Software License Key has expired. Key expired - Contact your Vendor SaNDS Lab Help Line (+973 35078079).', 423, [
                        'license_required' => true,
                        'status' => 'expired',
                        'message' => 'Software License Key expired. Contact your vendor SaNDS Lab Help Line.',
                        'vendor_help_line' => '+973 35078079'
                    ]);
                } else {
                    $this->errorResponse($licStatus['message'] ?: 'Software License Key is invalid. Key expired - Contact your Vendor SaNDS Lab Help Line.', 423, [
                        'license_required' => true,
                        'status' => $licState,
                        'vendor_help_line' => '+973 35078079'
                    ]);
                }
            }
        }
        
        // Generate secure API session token
        $token = bin2hex(random_bytes(32));
        
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE users SET api_token = ?, last_login = NOW() WHERE id = ?");
        $stmt->execute([$token, $user['id']]);
        
        // Remove password hash from response
        unset($user['password_hash']);
        $user['api_token'] = $token;
        $user['must_change_password'] = (bool)($user['must_change_password'] ?? 0);
        
        $this->successResponse([
            'token' => $token,
            'user' => $user,
            'must_change_password' => $user['must_change_password']
        ], 'Login successful! Welcome back.');
    }
    
    public function profile(): void {
        if (!$this->authUser) {
            $this->errorResponse('Unauthorized', 401);
        }
        
        unset($this->authUser['password_hash']);
        $this->authUser['must_change_password'] = (bool)($this->authUser['must_change_password'] ?? 0);
        $this->successResponse($this->authUser, 'User profile retrieved');
    }
    
    /**
     * Change password for logged-in user
     */
    public function changePassword(): void {
        if (!$this->authUser) {
            $this->errorResponse('Unauthorized. Please log in first.', 401);
        }
        
        $data = $this->getRequestData();
        $currentPassword = trim($data['current_password'] ?? '');
        $newPassword = trim($data['new_password'] ?? '');
        
        if (empty($newPassword)) {
            $this->errorResponse('New password is required.');
        }
        
        if (strlen($newPassword) < 6) {
            $this->errorResponse('New password must be at least 6 characters.');
        }
        
        $db = Database::getConnection();
        
        // Fetch current user with password_hash
        $stmt = $db->prepare("SELECT id, password_hash, must_change_password FROM users WHERE id = ?");
        $stmt->execute([$this->authUser['id']]);
        $user = $stmt->fetch();
        
        if (!$user) {
            $this->errorResponse('User not found', 404);
        }
        
        // If not forced change, verify current password
        if (!$user['must_change_password'] && !empty($currentPassword)) {
            if (!password_verify($currentPassword, $user['password_hash'])) {
                $this->errorResponse('Current password is incorrect.', 400);
            }
        }
        
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $updateStmt = $db->prepare("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?");
        $updateStmt->execute([$newHash, $this->authUser['id']]);
        
        $this->successResponse(null, 'Password updated successfully! Your account is now secured.');
    }
    
    /**
     * First-time employee password setup using CPR number
     */
    public function firstLoginSetup(): void {
        $data = $this->getRequestData();
        $cpr = trim($data['cpr_no'] ?? '');
        $newPassword = trim($data['new_password'] ?? '');
        
        if (empty($cpr) || empty($newPassword)) {
            $this->errorResponse('Both CPR number and new password are required.');
        }
        
        if (strlen($newPassword) < 6) {
            $this->errorResponse('Password must be at least 6 characters long.');
        }
        
        $user = $this->userModel->findByCpr($cpr);
        if (!$user) {
            $this->errorResponse('No employee account was found matching this CPR number. Please contact HR.', 404);
        }
        
        if ($user['status'] !== 'active') {
            $this->errorResponse('This user account is currently inactive. Please contact HR.', 403);
        }
        
        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $token = bin2hex(random_bytes(32));
        
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE users SET password_hash = ?, must_change_password = 0, api_token = ?, last_login = NOW() WHERE id = ?");
        $stmt->execute([$newHash, $token, $user['id']]);
        
        unset($user['password_hash']);
        $user['api_token'] = $token;
        $user['must_change_password'] = false;
        
        $this->successResponse([
            'token' => $token,
            'user' => $user
        ], 'Password created successfully! Welcome to the portal.');
    }
    
    public function logout(): void {
        if ($this->authUser) {
            $db = Database::getConnection();
            $stmt = $db->prepare("UPDATE users SET api_token = NULL WHERE id = ?");
            $stmt->execute([$this->authUser['id']]);
        }
        $this->successResponse(null, 'Logged out successfully');
    }
}
