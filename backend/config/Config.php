<?php
// backend/config/Config.php

namespace App\Config;

class Config {
    const DB_HOST = '127.0.0.1';
    const DB_USER = 'root';
    const DB_PASS = 'S@nds1@b';
    const DB_NAME = 'hr_solution_db';
    const DB_PORT = 3306;
    
    const APP_SECRET = 'gulf_hr_secret_key_bahrain_2026_jwt_token_auth';
    const UPLOAD_DIR = __DIR__ . '/../public/uploads/';
    const BASE_URL = 'http://localhost:8000';
    
    public static function setCorsHeaders() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Credentials: true");
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
