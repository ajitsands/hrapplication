<?php
// backend/core/AuthMiddleware.php

namespace App\Core;

use App\Config\Database;
use PDO;

class AuthMiddleware {
    public function handle(): ?array {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            // Check query param for file downloads or API clients
            $token = $_GET['token'] ?? null;
            if (!$token) {
                http_response_code(401);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Unauthorized. Bearer token missing.']);
                exit();
            }
        } else {
            $token = trim($matches[1]);
        }
        
        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT u.*, e.emp_code, e.first_name, e.last_name, e.department_id, e.designation_id, e.cpr_no
            FROM users u
            LEFT JOIN employees e ON u.employee_id = e.id
            WHERE u.api_token = ? AND u.status = 'active'
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Invalid or expired session token. Please log in again.']);
            exit();
        }
        
        return $user;
    }
}
