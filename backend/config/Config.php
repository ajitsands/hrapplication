<?php
// backend/config/Config.php

namespace App\Config;

class Config {
    // Default / Local Development Fallbacks
    const DB_HOST = '127.0.0.1';
    const DB_USER = 'root';
    const DB_PASS = 'S@nds1@b';
    const DB_NAME = 'hr_solution_db';
    const DB_PORT = 3306;
    
    const APP_SECRET = 'gulf_hr_secret_key_bahrain_2026_jwt_token_auth';
    const UPLOAD_DIR = __DIR__ . '/../public/uploads/';
    const BASE_URL = 'http://localhost:8000';

    public static function getDbHost(): string {
        return self::getLocalSetting('DB_HOST') ?? (getenv('DB_HOST') ?: self::DB_HOST);
    }

    public static function getDbUser(): string {
        return self::getLocalSetting('DB_USER') ?? (getenv('DB_USER') ?: self::DB_USER);
    }

    public static function getDbPass(): string {
        return self::getLocalSetting('DB_PASS') ?? (getenv('DB_PASS') !== false ? getenv('DB_PASS') : self::DB_PASS);
    }

    public static function getDbName(): string {
        return self::getLocalSetting('DB_NAME') ?? (getenv('DB_NAME') ?: self::DB_NAME);
    }

    public static function getDbPort(): int {
        return (int)(self::getLocalSetting('DB_PORT') ?? (getenv('DB_PORT') ?: self::DB_PORT));
    }

    private static function getLocalSetting(string $key): ?string {
        $localConfigFile = __DIR__ . '/db_config.php';
        if (file_exists($localConfigFile)) {
            $config = include $localConfigFile;
            if (is_array($config) && array_key_exists($key, $config)) {
                return (string)$config[$key];
            }
        }
        return null;
    }
    
    public static function setCorsHeaders() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Api-Token, X-Auth-Token");
        header("Access-Control-Allow-Credentials: true");
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
