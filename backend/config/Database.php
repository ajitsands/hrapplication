<?php
// backend/config/Database.php

namespace App\Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;
    
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $configsToTry = [
                // 1. Primary Configured/Detected environment
                [
                    'host' => Config::getDbHost(),
                    'port' => Config::getDbPort(),
                    'db'   => Config::getDbName(),
                    'user' => Config::getDbUser(),
                    'pass' => Config::getDbPass()
                ],
                // 2. Fallback: Localhost default (root / hr_solution_db)
                [
                    'host' => '127.0.0.1',
                    'port' => 3306,
                    'db'   => 'hr_solution_db',
                    'user' => 'root',
                    'pass' => 'S@nds1@b'
                ],
                // 3. Fallback: Production Server default (trackmyteam_hruser / trackmyteam_hrdb)
                [
                    'host' => 'localhost',
                    'port' => 3306,
                    'db'   => 'trackmyteam_hrdb',
                    'user' => 'trackmyteam_hruser',
                    'pass' => 'S@nds1@b'
                ]
            ];

            $lastError = null;

            foreach ($configsToTry as $cfg) {
                try {
                    $dsn = "mysql:host={$cfg['host']};port={$cfg['port']};dbname={$cfg['db']};charset=utf8mb4";
                    self::$instance = new PDO($dsn, $cfg['user'], $cfg['pass'], [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]);
                    return self::$instance;
                } catch (PDOException $e) {
                    $lastError = $e;
                }
            }

            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Database connection error: ' . ($lastError ? $lastError->getMessage() : 'Unable to connect to database')
            ]);
            exit();
        }
        return self::$instance;
    }
}
