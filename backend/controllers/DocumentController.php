<?php
// backend/controllers/DocumentController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Document;
use App\Config\Config;
use App\Config\Database;
use PDO;

class DocumentController extends Controller {
    private Document $docModel;
    
    public function __construct() {
        $this->docModel = new Document();
    }
    
    public function getByEmployee(array $params): void {
        $empId = (int)($params['id'] ?? 0);
        $docs = $this->docModel->getByEmployeeId($empId);
        $this->successResponse($docs, 'Employee documents retrieved');
    }
    
    public function upload(): void {
        $empId = (int)($_POST['employee_id'] ?? 0);
        $docType = $_POST['doc_type'] ?? 'Other';
        $docName = trim($_POST['doc_name'] ?? '');
        $issueDate = !empty($_POST['issue_date']) ? $_POST['issue_date'] : null;
        $expiryDate = !empty($_POST['expiry_date']) ? $_POST['expiry_date'] : null;
        $notes = $_POST['notes'] ?? '';
        
        if (empty($empId) || empty($docName)) {
            $this->errorResponse('Employee ID and Document Name are required.');
        }
        
        $filePath = '';
        $fileSize = 0;
        $fileExt = '';
        
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $file = $_FILES['file'];
            $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $fileSize = $file['size'];
            
            $targetDir = Config::UPLOAD_DIR . 'docs/';
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
            
            $filename = 'doc_' . $empId . '_' . time() . '_' . rand(100, 999) . '.' . $fileExt;
            $destination = $targetDir . $filename;
            
            if (move_uploaded_file($file['tmp_name'], $destination)) {
                $filePath = 'uploads/docs/' . $filename;
            } else {
                $this->errorResponse('Failed to move uploaded file.');
            }
        } else {
            // Check for mock / generated document attachment
            $filePath = 'uploads/docs/doc_' . $empId . '_' . time() . '.pdf';
        }
        
        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO employee_documents (employee_id, doc_type, doc_name, file_path, file_size, file_ext, issue_date, expiry_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$empId, $docType, $docName, $filePath, $fileSize, $fileExt, $issueDate, $expiryDate, $notes]);
        
        $newDocId = (int)$db->lastInsertId();
        
        // Also update the employee table primary expiry if this is CPR, Passport, or Visa
        if ($docType === 'CPR' && $expiryDate) {
            $db->prepare("UPDATE employees SET cpr_expiry = ? WHERE id = ?")->execute([$expiryDate, $empId]);
        } elseif ($docType === 'Passport' && $expiryDate) {
            $db->prepare("UPDATE employees SET passport_expiry = ? WHERE id = ?")->execute([$expiryDate, $empId]);
        } elseif ($docType === 'Visa' && $expiryDate) {
            $db->prepare("UPDATE employees SET visa_expiry = ? WHERE id = ?")->execute([$expiryDate, $empId]);
        } elseif ($docType === 'Driving License' && $expiryDate) {
            $db->prepare("UPDATE employees SET driving_license_expiry = ? WHERE id = ?")->execute([$expiryDate, $empId]);
        } elseif ($docType === 'Insurance' && $expiryDate) {
            $db->prepare("UPDATE employees SET insurance_expiry = ? WHERE id = ?")->execute([$expiryDate, $empId]);
        }
        
        $this->successResponse(['id' => $newDocId, 'file_path' => $filePath], 'Document uploaded and attached successfully!', 201);
    }
    
    public function destroy(array $params): void {
        $id = (int)($params['id'] ?? 0);
        $doc = $this->docModel->findById($id);
        if ($doc) {
            if (!empty($doc['file_path'])) {
                $fullPath = __DIR__ . '/../public/' . $doc['file_path'];
                if (file_exists($fullPath)) {
                    @unlink($fullPath);
                }
            }
            $this->docModel->delete($id);
        }
        $this->successResponse(null, 'Document removed successfully');
    }
}
