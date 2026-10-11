<?php
// backend/controllers/EmployeeController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Document;
use App\Config\Database;
use PDO;

class EmployeeController extends Controller {
    private Employee $employeeModel;
    private Department $deptModel;
    private Document $docModel;
    
    public function __construct() {
        $this->employeeModel = new Employee();
        $this->deptModel = new Department();
        $this->docModel = new Document();
    }
    
    public function index(): void {
        $department = $_GET['department_id'] ?? null;
        $status = $_GET['status'] ?? null;
        $search = $_GET['search'] ?? null;
        
        $employees = $this->employeeModel->getListWithDetails($department, $status, $search);
        $this->successResponse($employees, 'Employees retrieved successfully');
    }
    
    public function show(array $params): void {
        $id = (int)($params['id'] ?? 0);
        
        // If employee role, ensure they only view their own profile unless admin/hr
        if ($this->authUser && $this->authUser['role'] === 'employee' && (int)$this->authUser['employee_id'] !== $id) {
            $this->errorResponse('Unauthorized to view this employee profile', 403);
        }
        
        $employee = $this->employeeModel->getDetailsById($id);
        if (!$employee) {
            $this->errorResponse('Employee not found', 404);
        }
        
        $documents = $this->docModel->getByEmployeeId($id);
        $employee['documents'] = $documents;
        
        $this->successResponse($employee, 'Employee details retrieved');
    }
    
    public function store(): void {
        $data = $this->getRequestData();
        
        // Basic validation
        if (empty($data['first_name']) || empty($data['last_name']) || empty($data['cpr_no'])) {
            $this->errorResponse('First Name, Last Name, and CPR/National ID are required.');
        }
        
        $db = Database::getConnection();
        
        // Generate emp_code if not supplied
        $empCode = trim($data['emp_code'] ?? '');
        if (empty($empCode)) {
            $stmt = $db->query("SELECT MAX(id) as max_id FROM employees");
            $nextId = ((int)($stmt->fetch()['max_id'] ?? 0)) + 1;
            $empCode = sprintf("EMP-%03d", $nextId);
        }
        
        // Process profile photo if base64 provided
        $profilePhoto = !empty($data['profile_photo']) ? $data['profile_photo'] : null;
        if ($profilePhoto && str_starts_with($profilePhoto, 'data:image')) {
            try {
                $uploadDir = __DIR__ . '/../public/uploads/employees';
                if (!is_dir($uploadDir)) {
                    @mkdir($uploadDir, 0777, true);
                }
                if (preg_match('/^data:image\/(\w+);base64,/', $profilePhoto, $type)) {
                    $rawImg = substr($profilePhoto, strpos($profilePhoto, ',') + 1);
                    $decoded = base64_decode($rawImg);
                    if ($decoded !== false) {
                        $ext = strtolower($type[1]) === 'png' ? 'png' : 'jpg';
                        $cleanCpr = preg_replace('/[^0-9A-Za-z]/', '', $data['cpr_no'] ?? 'emp');
                        $filename = 'emp_' . $cleanCpr . '_' . time() . '.' . $ext;
                        $targetPath = $uploadDir . '/' . $filename;
                        if (@file_put_contents($targetPath, $decoded)) {
                            $profilePhoto = '/uploads/employees/' . $filename;
                        }
                    }
                }
            } catch (\Exception $e) {
                // Fallback to retaining base64 string
            }
        }

        // Validate blood group (Optional, but ensures wrong data is never saved)
        $validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        $rawBlood = !empty($data['blood_group']) ? strtoupper(trim($data['blood_group'])) : null;
        $cleanBlood = in_array($rawBlood, $validBloodGroups, true) ? $rawBlood : null;

        $sql = "INSERT INTO employees (
            emp_code, first_name, last_name, email, phone, gender, dob, nationality, is_gcc_citizen,
            cpr_no, cpr_expiry, passport_no, passport_expiry, visa_no, visa_expiry,
            driving_license_no, driving_license_expiry, insurance_no, insurance_expiry, gosi_no, lmra_no,
            department_id, designation_id, date_of_joining, employment_type, status,
            basic_salary, housing_allowance, transport_allowance, car_allowance, mobile_allowance, food_allowance, other_allowance,
            bank_name, iban, bank_account_no, profile_photo, address, blood_group
        ) VALUES (
            :emp_code, :first_name, :last_name, :email, :phone, :gender, :dob, :nationality, :is_gcc_citizen,
            :cpr_no, :cpr_expiry, :passport_no, :passport_expiry, :visa_no, :visa_expiry,
            :driving_license_no, :driving_license_expiry, :insurance_no, :insurance_expiry, :gosi_no, :lmra_no,
            :department_id, :designation_id, :date_of_joining, :employment_type, :status,
            :basic_salary, :housing_allowance, :transport_allowance, :car_allowance, :mobile_allowance, :food_allowance, :other_allowance,
            :bank_name, :iban, :bank_account_no, :profile_photo, :address, :blood_group
        )";
        
        $stmt = $db->prepare($sql);
        $res = $stmt->execute([
            'emp_code' => $empCode,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'gender' => $data['gender'] ?? 'Male',
            'dob' => !empty($data['dob']) ? $data['dob'] : null,
            'nationality' => $data['nationality'] ?? 'Bahraini',
            'is_gcc_citizen' => isset($data['is_gcc_citizen']) ? (int)$data['is_gcc_citizen'] : (strtolower($data['nationality'] ?? '') === 'bahraini' ? 1 : 0),
            'cpr_no' => $data['cpr_no'],
            'cpr_expiry' => !empty($data['cpr_expiry']) ? $data['cpr_expiry'] : null,
            'passport_no' => $data['passport_no'] ?? null,
            'passport_expiry' => !empty($data['passport_expiry']) ? $data['passport_expiry'] : null,
            'visa_no' => $data['visa_no'] ?? null,
            'visa_expiry' => !empty($data['visa_expiry']) ? $data['visa_expiry'] : null,
            'driving_license_no' => $data['driving_license_no'] ?? null,
            'driving_license_expiry' => !empty($data['driving_license_expiry']) ? $data['driving_license_expiry'] : null,
            'insurance_no' => $data['insurance_no'] ?? null,
            'insurance_expiry' => !empty($data['insurance_expiry']) ? $data['insurance_expiry'] : null,
            'gosi_no' => $data['gosi_no'] ?? null,
            'lmra_no' => $data['lmra_no'] ?? null,
            'department_id' => !empty($data['department_id']) ? (int)$data['department_id'] : null,
            'designation_id' => !empty($data['designation_id']) ? (int)$data['designation_id'] : null,
            'date_of_joining' => !empty($data['date_of_joining']) ? $data['date_of_joining'] : date('Y-m-d'),
            'employment_type' => $data['employment_type'] ?? 'Full-Time',
            'status' => $data['status'] ?? 'Active',
            'basic_salary' => (float)($data['basic_salary'] ?? 0),
            'housing_allowance' => (float)($data['housing_allowance'] ?? 0),
            'transport_allowance' => (float)($data['transport_allowance'] ?? 0),
            'car_allowance' => (float)($data['car_allowance'] ?? 0),
            'mobile_allowance' => (float)($data['mobile_allowance'] ?? 0),
            'food_allowance' => (float)($data['food_allowance'] ?? 0),
            'other_allowance' => (float)($data['other_allowance'] ?? 0),
            'bank_name' => $data['bank_name'] ?? null,
            'iban' => $data['iban'] ?? null,
            'bank_account_no' => $data['bank_account_no'] ?? null,
            'profile_photo' => $profilePhoto,
            'address' => $data['address'] ?? null,
            'blood_group' => $cleanBlood,
        ]);
        
        $newId = (int)$db->lastInsertId();
        
        // Auto create employee login if requested
        if (!empty($data['create_user_account'])) {
            $username = strtolower($empCode);
            $rawPass = !empty($data['user_password']) ? $data['user_password'] : 'password123';
            $passHash = password_hash($rawPass, PASSWORD_BCRYPT);
            $userEmail = !empty($data['email']) ? $data['email'] : ($username . '@company.com');
            
            $userStmt = $db->prepare("INSERT INTO users (employee_id, username, email, password_hash, role, status) VALUES (?, ?, ?, ?, 'employee', 'active')");
            $userStmt->execute([$newId, $username, $userEmail, $passHash]);
        }
        
        $this->successResponse(['id' => $newId, 'emp_code' => $empCode, 'profile_photo' => $profilePhoto], 'Employee created and onboarded successfully!', 201);
    }
    
    public function update(array $params): void {
        $id = (int)($params['id'] ?? 0);
        $data = $this->getRequestData();
        
        $existing = $this->employeeModel->findById($id);
        if (!$existing) {
            $this->errorResponse('Employee not found', 404);
        }
        
        // Process profile photo if base64 updated
        if (!empty($data['profile_photo']) && str_starts_with($data['profile_photo'], 'data:image')) {
            try {
                $uploadDir = __DIR__ . '/../public/uploads/employees';
                if (!is_dir($uploadDir)) {
                    @mkdir($uploadDir, 0777, true);
                }
                if (preg_match('/^data:image\/(\w+);base64,/', $data['profile_photo'], $type)) {
                    $rawImg = substr($data['profile_photo'], strpos($data['profile_photo'], ',') + 1);
                    $decoded = base64_decode($rawImg);
                    if ($decoded !== false) {
                        $ext = strtolower($type[1]) === 'png' ? 'png' : 'jpg';
                        $cleanCpr = preg_replace('/[^0-9A-Za-z]/', '', $existing['cpr_no'] ?? 'emp');
                        $filename = 'emp_' . $cleanCpr . '_' . time() . '.' . $ext;
                        $targetPath = $uploadDir . '/' . $filename;
                        if (@file_put_contents($targetPath, $decoded)) {
                            $data['profile_photo'] = '/uploads/employees/' . $filename;
                        }
                    }
                }
            } catch (\Exception $e) {}
        }

        // Clean blood group in update
        if (array_key_exists('blood_group', $data)) {
            $validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            $rawBlood = !empty($data['blood_group']) ? strtoupper(trim($data['blood_group'])) : null;
            $data['blood_group'] = in_array($rawBlood, $validBloodGroups, true) ? $rawBlood : null;
        }

        $db = Database::getConnection();
        
        $fields = [
            'first_name', 'last_name', 'email', 'phone', 'gender', 'dob', 'nationality', 'is_gcc_citizen',
            'cpr_no', 'cpr_expiry', 'passport_no', 'passport_expiry', 'visa_no', 'visa_expiry',
            'driving_license_no', 'driving_license_expiry', 'insurance_no', 'insurance_expiry', 'gosi_no', 'lmra_no',
            'department_id', 'designation_id', 'date_of_joining', 'date_of_leaving', 'employment_type', 'status',
            'basic_salary', 'housing_allowance', 'transport_allowance', 'car_allowance', 'mobile_allowance', 'food_allowance', 'other_allowance',
            'bank_name', 'iban', 'bank_account_no', 'profile_photo', 'address', 'blood_group'
        ];
        
        $setClauses = [];
        $execParams = ['id' => $id];
        
        foreach ($fields as $f) {
            if (array_key_exists($f, $data)) {
                $val = $data[$f];
                if (in_array($f, ['dob', 'cpr_expiry', 'passport_expiry', 'visa_expiry', 'driving_license_expiry', 'insurance_expiry', 'date_of_joining', 'date_of_leaving'])) {
                    $val = !empty($val) ? $val : null;
                }
                $setClauses[] = "`$f` = :$f";
                $execParams[$f] = $val;
            }
        }
        
        if (!empty($setClauses)) {
            $sql = "UPDATE employees SET " . implode(', ', $setClauses) . " WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute($execParams);
        }
        
        $this->successResponse(null, 'Employee details updated successfully');
    }
    
    public function destroy(array $params): void {
        $id = (int)($params['id'] ?? 0);
        $this->employeeModel->delete($id);
        $this->successResponse(null, 'Employee deleted successfully');
    }
    
    public function expiries(): void {
        $days = (int)($_GET['days'] ?? 60);
        $expiries = $this->employeeModel->getUpcomingExpiries($days);
        $docExpiries = $this->docModel->getAllUpcomingExpiries($days);
        
        $this->successResponse([
            'employee_expiries' => $expiries,
            'document_expiries' => $docExpiries,
            'threshold_days' => $days
        ], 'Upcoming expiries retrieved');
    }
    
    public function departments(): void {
        $depts = $this->deptModel->getAllWithStats();
        $this->successResponse($depts, 'Departments retrieved');
    }
    
    public function designations(): void {
        $deptId = $_GET['department_id'] ?? null;
        $db = Database::getConnection();
        
        if ($deptId) {
            $stmt = $db->prepare("SELECT d.*, dept.name as department_name FROM designations d LEFT JOIN departments dept ON d.department_id = dept.id WHERE d.department_id = ? ORDER BY d.name ASC");
            $stmt->execute([$deptId]);
        } else {
            $stmt = $db->query("SELECT d.*, dept.name as department_name FROM designations d LEFT JOIN departments dept ON d.department_id = dept.id ORDER BY d.name ASC");
        }
        
        $this->successResponse($stmt->fetchAll(PDO::FETCH_ASSOC), 'Designations retrieved');
    }
    
    public function createDepartment(): void {
        $data = $this->getRequestData();
        if (empty($data['name']) || empty($data['code'])) {
            $this->errorResponse('Department name and code are required');
        }
        
        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO departments (name, code, description) VALUES (?, ?, ?)");
        $stmt->execute([$data['name'], strtoupper($data['code']), $data['description'] ?? '']);
        
        $this->successResponse(['id' => $db->lastInsertId()], 'Department created successfully', 201);
    }
    
    public function createDesignation(): void {
        $data = $this->getRequestData();
        if (empty($data['name']) || empty($data['department_id'])) {
            $this->errorResponse('Designation name and department are required');
        }
        
        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO designations (name, department_id, description) VALUES (?, ?, ?)");
        $stmt->execute([$data['name'], (int)$data['department_id'], $data['description'] ?? '']);
        
        $this->successResponse(['id' => $db->lastInsertId()], 'Designation created successfully', 201);
    }
}
