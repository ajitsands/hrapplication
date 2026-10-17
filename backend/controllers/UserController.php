<?php
// backend/controllers/UserController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\User;
use App\Models\Employee;
use App\Config\Database;
use PDO;

class UserController extends Controller {
    private User $userModel;
    private Employee $employeeModel;
    
    public function __construct() {
        $this->userModel = new User();
        $this->employeeModel = new Employee();
    }
    
    /**
     * List all users with employee details
     */
    public function index(): void {
        $this->requireAdminOrHr();
        
        $role = $_GET['role'] ?? null;
        $status = $_GET['status'] ?? null;
        $search = $_GET['search'] ?? null;
        
        $isSuperAdmin = $this->authUser && in_array($this->authUser['role'], ['super_admin', 'superadmin']);
        $users = $this->userModel->getAllWithDetails($role, $status, $search, $isSuperAdmin);
        
        $this->successResponse($users, 'User accounts retrieved successfully');
    }
    
    /**
     * Get single user details
     */
    public function show(array $params): void {
        $this->requireAdminOrHr();
        
        $id = (int)($params['id'] ?? 0);
        $user = $this->userModel->findById($id);
        
        if (!$user) {
            $this->errorResponse('User account not found', 404);
        }
        
        // Super admin protection: hide from non-superadmin
        $isSuperAdmin = $this->authUser && in_array($this->authUser['role'], ['super_admin', 'superadmin']);
        if ($user['role'] === 'super_admin' && !$isSuperAdmin) {
            $this->errorResponse('User account not found', 404);
        }
        
        unset($user['password_hash'], $user['api_token']);
        $this->successResponse($user, 'User details retrieved');
    }
    
    /**
     * Create a new user account (Admin / Super Admin / HR / Employee)
     */
    public function store(): void {
        $this->requireAdminOrHr();
        $data = $this->getRequestData();
        
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $role = trim($data['role'] ?? 'employee');
        $employeeId = !empty($data['employee_id']) ? (int)$data['employee_id'] : null;
        $status = in_array($data['status'] ?? '', ['active', 'inactive']) ? $data['status'] : 'active';
        $mustChange = !empty($data['must_change_password']) ? 1 : 0;
        
        // Allowed roles
        $isSuperAdmin = $this->authUser && in_array($this->authUser['role'], ['super_admin', 'superadmin']);
        $validRoles = $isSuperAdmin ? ['super_admin', 'admin', 'hr', 'employee'] : ['admin', 'hr', 'employee'];
        if (!in_array($role, $validRoles)) {
            $this->errorResponse('Invalid role specified. Allowed: ' . implode(', ', $validRoles));
        }
        
        // If employee selected, auto-populate username from CPR if username not entered
        if ($employeeId) {
            $emp = $this->employeeModel->findById($employeeId);
            if (!$emp) {
                $this->errorResponse('Selected employee record not found.');
            }
            if (empty($username) && !empty($emp['cpr_no'])) {
                $username = trim($emp['cpr_no']);
            }
            if (empty($email) && !empty($emp['email'])) {
                $email = trim($emp['email']);
            }
        }
        
        if (empty($username)) {
            $this->errorResponse('Username is required.');
        }
        
        if (empty($email)) {
            $email = $username . '@portal.local';
        }
        
        $db = Database::getConnection();
        
        // Check uniqueness of username
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            $this->errorResponse("Username '$username' is already registered. Please choose another username.", 409);
        }
        
        // Check uniqueness of email
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $this->errorResponse("Email address '$email' is already in use by another account.", 409);
        }
        
        // Check if employee already has a user account
        if ($employeeId) {
            $stmt = $db->prepare("SELECT id FROM users WHERE employee_id = ? LIMIT 1");
            $stmt->execute([$employeeId]);
            if ($stmt->fetch()) {
                $this->errorResponse("Selected employee already has an active portal user account.", 409);
            }
        }
        
        // Determine initial password
        $rawPassword = trim($data['password'] ?? '');
        if (empty($rawPassword)) {
            if ($employeeId && !empty($emp['cpr_no'])) {
                $rawPassword = trim($emp['cpr_no']);
                $mustChange = 1; // Require password change on first login
            } else {
                $rawPassword = 'Password@123';
                $mustChange = 1;
            }
        }
        
        $passwordHash = password_hash($rawPassword, PASSWORD_BCRYPT);
        
        $insertStmt = $db->prepare("
            INSERT INTO users (employee_id, username, email, password_hash, role, status, must_change_password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $insertStmt->execute([$employeeId, $username, $email, $passwordHash, $role, $status, $mustChange]);
        $newId = (int)$db->lastInsertId();
        
        $createdUser = $this->userModel->findById($newId);
        unset($createdUser['password_hash'], $createdUser['api_token']);
        
        $this->successResponse([
            'user' => $createdUser,
            'initial_password' => $rawPassword,
            'must_change_password' => (bool)$mustChange
        ], 'User account created successfully!', 201);
    }
    
    /**
     * Update user details (username, email, role, status, employee link)
     */
    public function update(array $params): void {
        $this->requireAdminOrHr();
        $id = (int)($params['id'] ?? 0);
        $data = $this->getRequestData();
        
        $user = $this->userModel->findById($id);
        if (!$user) {
            $this->errorResponse('User account not found', 404);
        }
        
        $isSuperAdmin = $this->authUser && in_array($this->authUser['role'], ['super_admin', 'superadmin']);
        if ($user['role'] === 'super_admin' && !$isSuperAdmin) {
            $this->errorResponse('Unauthorized. Super Administrator accounts cannot be modified by regular administrators.', 403);
        }
        
        $username = trim($data['username'] ?? $user['username']);
        $email = trim($data['email'] ?? $user['email']);
        $role = trim($data['role'] ?? $user['role']);
        $status = in_array($data['status'] ?? '', ['active', 'inactive']) ? $data['status'] : $user['status'];
        $employeeId = array_key_exists('employee_id', $data) ? (!empty($data['employee_id']) ? (int)$data['employee_id'] : null) : $user['employee_id'];
        
        // Self-protection: Current user cannot deactivate self or demote own role
        if ($this->authUser && (int)$this->authUser['id'] === $id) {
            if ($status === 'inactive') {
                $this->errorResponse('Security Violation: You cannot deactivate your own active session account.');
            }
            if ($role === 'employee' && in_array($this->authUser['role'], ['admin', 'super_admin'])) {
                $this->errorResponse('Security Violation: You cannot demote your own administrator privileges.');
            }
        }
        
        $validRoles = $isSuperAdmin ? ['super_admin', 'admin', 'hr', 'employee'] : ['admin', 'hr', 'employee'];
        if (!in_array($role, $validRoles)) {
            $this->errorResponse('Invalid role specified.');
        }
        
        $db = Database::getConnection();
        
        // Check uniqueness of username (excluding self)
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1");
        $stmt->execute([$username, $id]);
        if ($stmt->fetch()) {
            $this->errorResponse("Username '$username' is already taken by another account.", 409);
        }
        
        // Check uniqueness of email (excluding self)
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
        $stmt->execute([$email, $id]);
        if ($stmt->fetch()) {
            $this->errorResponse("Email '$email' is already in use by another account.", 409);
        }
        
        // Update user
        $stmt = $db->prepare("
            UPDATE users 
            SET username = ?, email = ?, role = ?, status = ?, employee_id = ?
            WHERE id = ?
        ");
        $stmt->execute([$username, $email, $role, $status, $employeeId, $id]);
        
        $updated = $this->userModel->findById($id);
        unset($updated['password_hash'], $updated['api_token']);
        
        $this->successResponse($updated, 'User account updated successfully!');
    }
    
    /**
     * Activate or Deactivate User
     */
    public function toggleStatus(array $params): void {
        $this->requireAdminOrHr();
        $id = (int)($params['id'] ?? 0);
        
        $user = $this->userModel->findById($id);
        if (!$user) {
            $this->errorResponse('User account not found', 404);
        }

        if ($user['role'] === 'super_admin') {
            $this->errorResponse('Unauthorized. Super Administrator / Software Vendor accounts cannot be deactivated.', 403);
        }
        
        if ($this->authUser && (int)$this->authUser['id'] === $id) {
            $this->errorResponse('Security Violation: You cannot deactivate your own active user account.');
        }
        
        $newStatus = ($user['status'] === 'active') ? 'inactive' : 'active';
        
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE users SET status = ?, api_token = IF(? = 'inactive', NULL, api_token) WHERE id = ?");
        $stmt->execute([$newStatus, $newStatus, $id]);
        
        $action = $newStatus === 'active' ? 'activated' : 'deactivated';
        $this->successResponse(['status' => $newStatus], "User account {$user['username']} has been {$action}.");
    }
    
    /**
     * Reset user password (custom, CPR-based, or auto-generated)
     */
    public function resetPassword(array $params): void {
        $this->requireAdminOrHr();
        $id = (int)($params['id'] ?? 0);
        $data = $this->getRequestData();
        
        $user = $this->userModel->findById($id);
        if (!$user) {
            $this->errorResponse('User account not found', 404);
        }

        $isSuperAdmin = $this->authUser && in_array($this->authUser['role'], ['super_admin', 'superadmin']);
        if ($user['role'] === 'super_admin' && !$isSuperAdmin) {
            $this->errorResponse('Unauthorized. Super Administrator passwords can only be changed by the Super Administrator.', 403);
        }
        
        $newPassword = trim($data['password'] ?? '');
        $resetToCpr = !empty($data['reset_to_cpr']);
        $requireChange = isset($data['require_change']) ? (int)$data['require_change'] : 1;
        
        if ($resetToCpr) {
            if (!$user['employee_id']) {
                $this->errorResponse('Cannot reset to CPR: This user is not linked to an employee record.');
            }
            $emp = $this->employeeModel->findById((int)$user['employee_id']);
            if (!$emp || empty($emp['cpr_no'])) {
                $this->errorResponse('Employee CPR number not found in profile.');
            }
            $newPassword = trim($emp['cpr_no']);
            $requireChange = 1;
        }
        
        if (empty($newPassword)) {
            $this->errorResponse('Please specify a new password or select CPR reset.');
        }
        
        if (strlen($newPassword) < 6) {
            $this->errorResponse('Password must be at least 6 characters long.');
        }
        
        $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);
        
        $db = Database::getConnection();
        // Invalidate active session tokens so user must log in with new password
        $stmt = $db->prepare("UPDATE users SET password_hash = ?, must_change_password = ?, api_token = NULL WHERE id = ?");
        $stmt->execute([$passwordHash, $requireChange, $id]);
        
        $this->successResponse([
            'user_id' => $id,
            'username' => $user['username'],
            'must_change_password' => (bool)$requireChange
        ], "Password for {$user['username']} has been reset successfully!");
    }
    
    /**
     * Delete user account
     */
    public function destroy(array $params): void {
        $this->requireAdminOrHr();
        $id = (int)($params['id'] ?? 0);
        
        $user = $this->userModel->findById($id);
        if (!$user) {
            $this->errorResponse('User account not found', 404);
        }

        if ($user['role'] === 'super_admin') {
            $this->errorResponse('Unauthorized. Super Administrator / Software Vendor accounts cannot be deleted.', 403);
        }
        
        if ($this->authUser && (int)$this->authUser['id'] === $id) {
            $this->errorResponse('Security Violation: You cannot delete your own active administrator account.');
        }
        
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        
        $this->successResponse(null, "User account '{$user['username']}' deleted successfully.");
    }
    
    /**
     * Direct employee password reset endpoint (by employee ID)
     */
    public function resetEmployeePassword(array $params): void {
        $this->requireAdminOrHr();
        $empId = (int)($params['id'] ?? 0);
        $data = $this->getRequestData();
        
        $emp = $this->employeeModel->findById($empId);
        if (!$emp) {
            $this->errorResponse('Employee record not found', 404);
        }
        
        $db = Database::getConnection();
        $user = $this->userModel->findByEmployeeId($empId);
        
        $rawPassword = trim($data['password'] ?? '');
        $resetToCpr = !empty($data['reset_to_cpr']);
        $requireChange = isset($data['require_change']) ? (int)$data['require_change'] : 1;
        
        if ($resetToCpr || empty($rawPassword)) {
            $cpr = trim($emp['cpr_no'] ?? '');
            if (empty($cpr)) {
                $this->errorResponse('Employee CPR number is missing in records.');
            }
            $rawPassword = $cpr;
            $requireChange = 1;
        }
        
        $passwordHash = password_hash($rawPassword, PASSWORD_BCRYPT);
        
        if ($user) {
            // Update existing user
            $stmt = $db->prepare("UPDATE users SET password_hash = ?, must_change_password = ?, api_token = NULL WHERE id = ?");
            $stmt->execute([$passwordHash, $requireChange, $user['id']]);
            $username = $user['username'];
        } else {
            // Create user for employee using CPR as username
            $username = trim($emp['cpr_no']);
            $email = !empty($emp['email']) ? trim($emp['email']) : ($username . '@portal.local');
            
            // Check if username taken
            $chk = $db->prepare("SELECT id FROM users WHERE username = ?");
            $chk->execute([$username]);
            if ($chk->fetch()) {
                $username = strtolower($emp['emp_code'] ?? ('emp_' . $empId));
            }
            
            $stmt = $db->prepare("
                INSERT INTO users (employee_id, username, email, password_hash, role, status, must_change_password)
                VALUES (?, ?, ?, ?, 'employee', 'active', ?)
            ");
            $stmt->execute([$empId, $username, $email, $passwordHash, $requireChange]);
        }
        
        $this->successResponse([
            'employee_id' => $empId,
            'username' => $username,
            'must_change_password' => (bool)$requireChange
        ], "Login credentials for {$emp['first_name']} {$emp['last_name']} updated successfully!");
    }
}
