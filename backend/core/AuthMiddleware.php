<?php
// backend/core/AuthMiddleware.php

namespace App\Core;

use App\Config\Database;
use PDO;

class AuthMiddleware {
    public function handle(): ?array {
        $token = null;

        // 1. Direct Server environment variables (Apache / FastCGI / PHP-FPM)
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] 
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] 
            ?? '';

        // 2. Fallback to header functions
        $allHeaders = function_exists('apache_request_headers') 
            ? apache_request_headers() 
            : (function_exists('getallheaders') ? getallheaders() : []);

        if (empty($authHeader) && !empty($allHeaders)) {
            foreach ($allHeaders as $key => $val) {
                if (strtolower($key) === 'authorization') {
                    $authHeader = $val;
                    break;
                }
            }
        }

        // 3. Extract Bearer token if Authorization header present
        if (!empty($authHeader) && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = trim($matches[1]);
        }

        // 4. Custom header fallback (X-Api-Token or X-Auth-Token)
        if (!$token) {
            $customHeader = $_SERVER['HTTP_X_API_TOKEN'] 
                ?? $_SERVER['HTTP_X_AUTH_TOKEN'] 
                ?? null;

            if (!$customHeader && !empty($allHeaders)) {
                foreach ($allHeaders as $key => $val) {
                    if (in_array(strtolower($key), ['x-api-token', 'x-auth-token'])) {
                        $customHeader = $val;
                        break;
                    }
                }
            }
            if (!empty($customHeader)) {
                $token = trim($customHeader);
            }
        }

        // 5. Query param or POST parameter fallback
        if (!$token) {
            $token = $_GET['token'] ?? $_POST['token'] ?? $_REQUEST['token'] ?? null;
        }

        if (!$token) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Unauthorized. Bearer token missing.']);
            exit();
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
