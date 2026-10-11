<?php
// backend/config/Database.php

namespace App\Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;
    
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            try {
                $dsn = "mysql:host=" . Config::DB_HOST . ";port=" . Config::DB_PORT . ";dbname=" . Config::DB_NAME . ";charset=utf8mb4";
                self::$instance = new PDO($dsn, Config::DB_USER, Config::DB_PASS, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'message' => 'Database connection error: ' . $e->getMessage()
                ]);
                exit();
            }
        }
        return self::$instance;
    }
}
