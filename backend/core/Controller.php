<?php
// backend/core/Controller.php

namespace App\Core;

class Controller {
    protected ?array $authUser = null;
    
    public function setAuthUser(?array $user): void {
        $this->authUser = $user;
    }
    
    public function getAuthUser(): ?array {
        return $this->authUser;
    }
    
    protected function jsonResponse($data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0');
        header('Pragma: no-cache');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('X-Accel-Expires: 0'); // Direct NGINX directive to disable FastCGI/Proxy caching
        header('X-Accel-Buffering: no');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
    
    protected function successResponse($data = null, string $message = 'Success', int $statusCode = 200): void {
        $this->jsonResponse([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }
    
    protected function errorResponse(string $message = 'Error', int $statusCode = 400, $errors = null): void {
        $this->jsonResponse([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $statusCode);
    }
    
    protected function getRequestData(): array {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (stripos($contentType, 'application/json') !== false) {
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);
            return is_array($data) ? $data : [];
        }
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
            return array_merge($_POST, $_GET);
        }
        
        return $_GET;
    }

    protected function requireAdminOrHr(): void {
        if ($this->authUser && $this->authUser['role'] === 'employee') {
            $this->errorResponse('Unauthorized. Admin or HR privileges required.', 403);
        }
    }

    protected function requireAdmin(): void {
        if ($this->authUser && $this->authUser['role'] !== 'admin') {
            $this->errorResponse('Unauthorized. System administrator privileges required.', 403);
        }
    }
}
