<?php
// backend/controllers/SettingsController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Setting;
use App\Config\Database;
use PDO;

class SettingsController extends Controller {
    private Setting $settingModel;
    
    public function __construct() {
        $this->settingModel = new Setting();
    }
    
    public function get(): void {
        $settings = $this->settingModel->getSettings();
        $this->successResponse($settings, 'Settings retrieved');
    }
    
    public function update(): void {
        $data = $this->getRequestData();
        $this->settingModel->updateSettings($data);
        $updated = $this->settingModel->getSettings();
        $this->successResponse($updated, 'System settings updated successfully!');
    }
    
    public function holidays(): void {
        $year = (int)($_GET['year'] ?? date('Y'));
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM holidays WHERE holiday_year = ? OR is_recurring = 1 ORDER BY holiday_date ASC");
        $stmt->execute([$year]);
        $holidays = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->successResponse($holidays, 'Holidays list retrieved');
    }
    
    public function addHoliday(): void {
        $data = $this->getRequestData();
        if (empty($data['name']) || empty($data['holiday_date'])) {
            $this->errorResponse('Holiday name and date are required');
        }
        
        $year = (int)date('Y', strtotime($data['holiday_date']));
        $isRec = !empty($data['is_recurring']) ? 1 : 0;
        
        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO holidays (name, holiday_date, holiday_year, is_recurring, description) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['holiday_date'], $year, $isRec, $data['description'] ?? '']);
        
        $this->successResponse(['id' => $db->lastInsertId()], 'Holiday added successfully', 201);
    }
}
