<?php
// backend/controllers/LoanController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Loan;
use App\Config\Database;
use PDO;

class LoanController extends Controller {
    private Loan $loanModel;
    
    public function __construct() {
        $this->loanModel = new Loan();
    }
    
    public function index(): void {
        $empId = !empty($_GET['employee_id']) ? (int)$_GET['employee_id'] : null;
        $status = $_GET['status'] ?? null;
        
        if ($this->authUser && $this->authUser['role'] === 'employee') {
            $empId = (int)$this->authUser['employee_id'];
        }
        
        $loans = $this->loanModel->getLoansList($empId, $status);
        $this->successResponse($loans, 'Loans retrieved successfully');
    }
    
    public function store(): void {
        $data = $this->getRequestData();
        $empId = (int)($data['employee_id'] ?? 0);
        $title = trim($data['loan_title'] ?? 'Personal Salary Advance');
        $amount = (float)($data['loan_amount'] ?? 0);
        $monthly = (float)($data['monthly_installment'] ?? 0);
        $installments = (int)($data['total_installments'] ?? 0);
        $startMonth = (int)($data['start_month'] ?? date('n'));
        $startYear = (int)($data['start_year'] ?? date('Y'));
        $reason = $data['reason'] ?? '';
        
        if (empty($empId) || $amount <= 0) {
            $this->errorResponse('Valid Employee ID and Loan Amount are required.');
        }
        
        if ($monthly <= 0 && $installments > 0) {
            $monthly = round($amount / $installments, 3);
        } elseif ($installments <= 0 && $monthly > 0) {
            $installments = (int)ceil($amount / $monthly);
        }
        
        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO loans (employee_id, loan_title, loan_amount, monthly_installment, total_installments, paid_installments, remaining_amount, start_month, start_year, status, reason)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 'Active', ?)
        ");
        $stmt->execute([$empId, $title, $amount, $monthly, $installments, $amount, $startMonth, $startYear, $reason]);
        
        $this->successResponse(['id' => $db->lastInsertId()], 'Loan / Advance approved and registered successfully!', 201);
    }
    
    public function updateStatus(array $params): void {
        $id = (int)($params['id'] ?? 0);
        $data = $this->getRequestData();
        $status = $data['status'] ?? 'Active'; // 'Active', 'Completed', 'Paused', 'Cancelled'
        
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE loans SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        
        $this->successResponse(null, "Loan status updated to $status");
    }
}
