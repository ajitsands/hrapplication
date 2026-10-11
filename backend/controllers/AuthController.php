<?php
// backend/controllers/AuthController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\User;
use App\Config\Database;
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
            $this->errorResponse('This user account is currently deactivated. Please contact HR.', 403);
        }
        
        if (!password_verify($password, $user['password_hash'])) {
            $this->errorResponse('Invalid credentials. Please check your password.', 401);
        }
        
        // Generate secure API session token
        $token = bin2hex(random_bytes(32));
        
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE users SET api_token = ?, last_login = NOW() WHERE id = ?");
        $stmt->execute([$token, $user['id']]);
        
        // Remove password hash from response
        unset($user['password_hash']);
        $user['api_token'] = $token;
        
        $this->successResponse([
            'token' => $token,
            'user' => $user
        ], 'Login successful! Welcome back.');
    }
    
    public function profile(): void {
        if (!$this->authUser) {
            $this->errorResponse('Unauthorized', 401);
        }
        
        unset($this->authUser['password_hash']);
        $this->successResponse($this->authUser, 'User profile retrieved');
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
