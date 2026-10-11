<?php
// backend/controllers/LeaveController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Leave;
use App\Config\Database;
use PDO;

class LeaveController extends Controller {
    private Leave $leaveModel;
    
    public function __construct() {
        $this->leaveModel = new Leave();
    }
    
    public function index(): void {
        $empId = !empty($_GET['employee_id']) ? (int)$_GET['employee_id'] : null;
        $status = $_GET['status'] ?? null;
        
        if ($this->authUser && $this->authUser['role'] === 'employee') {
            $empId = (int)$this->authUser['employee_id'];
        }
        
        $leaves = $this->leaveModel->getAllLeaves($empId, $status);
        $this->successResponse($leaves, 'Leave applications retrieved');
    }
    
    public function apply(): void {
        $data = $this->getRequestData();
        
        $empId = (int)($data['employee_id'] ?? 0);
        if ($this->authUser && $this->authUser['role'] === 'employee') {
            $empId = (int)$this->authUser['employee_id'];
        }
        
        $leaveTypeId = (int)($data['leave_type_id'] ?? 1);
        $startDate = $data['start_date'] ?? '';
        $endDate = $data['end_date'] ?? '';
        $reason = trim($data['reason'] ?? '');
        
        if (empty($empId) || empty($startDate) || empty($endDate) || empty($reason)) {
            $this->errorResponse('Please fill all required fields: Employee, Dates, and Reason.');
        }
        
        $t1 = strtotime($startDate);
        $t2 = strtotime($endDate);
        if ($t2 < $t1) {
            $this->errorResponse('End date cannot be earlier than start date.');
        }
        
        $days = (float)($data['total_days'] ?? round(($t2 - $t1) / 86400 + 1, 1));
        
        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO leave_applications (employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Pending')
        ");
        $stmt->execute([$empId, $leaveTypeId, $startDate, $endDate, $days, $reason]);
        
        $this->successResponse(['id' => $db->lastInsertId()], 'Leave application submitted successfully!', 201);
    }
    
    public function updateStatus(array $params): void {
        $id = (int)($params['id'] ?? 0);
        $data = $this->getRequestData();
        $status = $data['status'] ?? 'Approved'; // 'Approved', 'Rejected'
        $rejectionReason = $data['rejection_reason'] ?? null;
        
        $db = Database::getConnection();
        $stmt = $db->prepare("
            UPDATE leave_applications 
            SET status = ?, approved_by = ?, approved_at = NOW(), rejection_reason = ?
            WHERE id = ?
        ");
        $stmt->execute([$status, $this->authUser['id'] ?? null, $rejectionReason, $id]);
        
        $this->successResponse(null, "Leave application has been $status");
    }
    
    public function types(): void {
        $db = Database::getConnection();
        $types = $db->query("SELECT * FROM leave_types ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
        $this->successResponse($types, 'Leave types retrieved');
    }
}
