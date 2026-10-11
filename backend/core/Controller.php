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
}
