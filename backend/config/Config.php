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
        if (isset($_SERVER['HTTP_ORIGIN'])) {
            header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        } else {
            header("Access-Control-Allow-Origin: *");
        }
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        
        $reqHeaders = $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'] ?? 'Content-Type, Authorization, X-Requested-With, X-Api-Token, X-Auth-Token, Cache-Control, Pragma, Expires, If-Modified-Since, Accept, Origin';
        header("Access-Control-Allow-Headers: {$reqHeaders}");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 86400");
        
        // Strict Anti-Caching Headers for NGINX, FastCGI, Proxies & Browsers
        header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0");
        header("Pragma: no-cache");
        header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
        header("X-Accel-Expires: 0"); // Directs NGINX FastCGI / Proxy Cache to NEVER cache
        header("X-Accel-Buffering: no"); // Disables proxy response buffering delays
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
