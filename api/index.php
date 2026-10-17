<?php
// api/index.php - cPanel / Apache / Nginx Production API Gateway

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// CORS Headers
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

// NGINX & Proxy Anti-Caching Directives
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0');
header('Pragma: no-cache');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('X-Accel-Expires: 0');
header('X-Accel-Buffering: no');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../backend/public/index.php';
