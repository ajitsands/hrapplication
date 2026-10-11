<?php
// download_bridge.php - Standalone direct download for SaNDSLabCardBridge.zip
require_once __DIR__ . '/backend/controllers/BaseController.php';
require_once __DIR__ . '/backend/controllers/EmployeeController.php';

$ctrl = new \App\Controllers\EmployeeController();
$ctrl->downloadCardBridge();
