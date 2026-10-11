<?php
// backend/controllers/ShiftController.php

namespace App\Controllers;

use App\Core\Controller;
use App\Models\Shift;
use App\Models\Roster;
use App\Config\Database;
use PDO;

class ShiftController extends Controller {
    private Shift $shiftModel;
    private Roster $rosterModel;

    public function __construct() {
        $this->shiftModel = new Shift();
        $this->rosterModel = new Roster();
    }

    public function index(): void {
        $activeOnly = !empty($_GET['active_only']);
        $shifts = $this->shiftModel->getAll($activeOnly);
        $this->successResponse($shifts, 'Shifts retrieved successfully');
    }

    public function show(array $params): void {
        $id = (int)($params['id'] ?? 0);
        $shift = $this->shiftModel->getById($id);
        if (!$shift) {
            $this->errorResponse('Shift not found', 404);
        }
        $this->successResponse($shift, 'Shift details retrieved');
    }

    public function store(): void {
        $this->requireAdminOrHr();
        $data = $this->getRequestData();

        if (empty($data['code']) || empty($data['name']) || empty($data['start_time']) || empty($data['end_time'])) {
            $this->errorResponse('Shift code, name, start time, and end time are required');
        }

        $existing = $this->shiftModel->getByCode($data['code']);
        if ($existing) {
            $this->errorResponse('A shift with this code already exists');
        }

        // Calculate standard duration
        $tIn = strtotime('2000-01-01 ' . $data['start_time']);
        $tOut = strtotime('2000-01-01 ' . $data['end_time']);
        if ($tOut <= $tIn) {
            $tOut += 86400; // overnight shift
        }
        $breakMins = (int)($data['break_minutes'] ?? 60);
        $rawHours = round(($tOut - $tIn - ($breakMins * 60)) / 3600, 2);
        if ($rawHours <= 0) $rawHours = 8.00;

        $data['total_hours'] = !empty($data['total_hours']) ? (float)$data['total_hours'] : $rawHours;

        $id = $this->shiftModel->create($data);
        $newShift = $this->shiftModel->getById($id);

        $this->successResponse($newShift, 'Shift created successfully', 201);
    }

    public function update(array $params): void {
        $this->requireAdminOrHr();
        $id = (int)($params['id'] ?? 0);
        $shift = $this->shiftModel->getById($id);
        if (!$shift) {
            $this->errorResponse('Shift not found', 404);
        }

        $data = $this->getRequestData();
        if (empty($data['code']) || empty($data['name']) || empty($data['start_time']) || empty($data['end_time'])) {
            $this->errorResponse('Shift code, name, start time, and end time are required');
        }

        // Check unique code collision
        $existing = $this->shiftModel->getByCode($data['code']);
        if ($existing && (int)$existing['id'] !== $id) {
            $this->errorResponse('Another shift with this code already exists');
        }

        $this->shiftModel->updateShift($id, $data);
        $updated = $this->shiftModel->getById($id);

        $this->successResponse($updated, 'Shift updated successfully');
    }

    public function destroy(array $params): void {
        $this->requireAdminOrHr();
        $id = (int)($params['id'] ?? 0);
        $shift = $this->shiftModel->getById($id);
        if (!$shift) {
            $this->errorResponse('Shift not found', 404);
        }

        // If system default shift (SH-GEN), don't allow hard delete
        if ($shift['code'] === 'SH-GEN') {
            $this->errorResponse('Default General Shift cannot be deleted. You can modify its hours instead.');
        }

        $this->shiftModel->delete($id);
        $this->successResponse(null, 'Shift deleted successfully');
    }

    public function rosterMonthly(): void {
        $month = (int)($_GET['month'] ?? date('n'));
        $year = (int)($_GET['year'] ?? date('Y'));
        $deptId = !empty($_GET['department_id']) ? (int)$_GET['department_id'] : null;
        $empId = !empty($_GET['employee_id']) ? (int)$_GET['employee_id'] : null;

        if ($this->authUser && $this->authUser['role'] === 'employee') {
            $empId = (int)$this->authUser['employee_id'];
        }

        $data = $this->rosterModel->getMonthlyRoster($month, $year, $deptId, $empId);
        $this->successResponse($data, 'Monthly roster retrieved');
    }

    public function saveRosterCell(): void {
        $this->requireAdminOrHr();
        $data = $this->getRequestData();

        $empId = (int)($data['employee_id'] ?? 0);
        $date = $data['date'] ?? null;
        $shiftId = !empty($data['shift_id']) ? (int)$data['shift_id'] : null;
        $isOffDay = !empty($data['is_off_day']);
        $notes = $data['notes'] ?? null;

        if (!$empId || !$date) {
            $this->errorResponse('Employee ID and Date are required');
        }

        $this->rosterModel->setRosterCell($empId, $date, $shiftId, $isOffDay, $notes);
        $this->successResponse(null, 'Roster schedule updated for date ' . $date);
    }

    public function saveRosterBulk(): void {
        $this->requireAdminOrHr();
        $data = $this->getRequestData();

        $empIds = $data['employee_ids'] ?? [];
        $startDate = $data['start_date'] ?? null;
        $endDate = $data['end_date'] ?? null;
        $shiftId = !empty($data['shift_id']) ? (int)$data['shift_id'] : null;
        $isOffDay = !empty($data['is_off_day']);
        $offDaysOfWeek = $data['off_days_of_week'] ?? []; // e.g. [5, 6] for Fri, Sat
        $notes = $data['notes'] ?? 'Bulk Roster Scheduling';

        if (empty($empIds) || !$startDate || !$endDate) {
            $this->errorResponse('Employees, start date, and end date are required');
        }

        $count = $this->rosterModel->bulkAssign($empIds, $startDate, $endDate, $shiftId, $isOffDay, $offDaysOfWeek, $notes);
        $this->successResponse(['assigned_entries' => $count], "Bulk roster successfully applied ($count schedule entries updated).");
    }

    public function getEffectiveShift(): void {
        $empId = (int)($_GET['employee_id'] ?? 0);
        $date = $_GET['date'] ?? date('Y-m-d');

        if (!$empId) {
            $this->errorResponse('Employee ID is required');
        }

        $effective = $this->shiftModel->getEffectiveShift($empId, $date);
        $this->successResponse($effective, 'Effective shift resolved');
    }

    public function getDepartments(): void {
        $db = Database::getConnection();
        $stmt = $db->query("
            SELECT d.id, d.name, d.default_shift_id, s.name as shift_name, s.code as shift_code, s.color_code
            FROM departments d
            LEFT JOIN shifts s ON d.default_shift_id = s.id
            ORDER BY d.name ASC
        ");
        $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->successResponse($departments, 'Department shift configurations retrieved');
    }

    public function updateDepartmentDefault(): void {
        $this->requireAdminOrHr();
        $data = $this->getRequestData();
        $deptId = (int)($data['department_id'] ?? 0);
        $shiftId = !empty($data['shift_id']) ? (int)$data['shift_id'] : null;

        if (!$deptId) {
            $this->errorResponse('Department ID is required');
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE departments SET default_shift_id = ? WHERE id = ?");
        $stmt->execute([$shiftId, $deptId]);

        $this->successResponse(null, 'Department default shift updated');
    }

    private function requireAdminOrHr(): void {
        if ($this->authUser && $this->authUser['role'] === 'employee') {
            $this->errorResponse('Unauthorized. Admin or HR privileges required.', 403);
        }
    }
}
