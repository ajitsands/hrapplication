# Gulf Enterprise HR & Payroll Solution (Bahrain & GCC Ready)

An enterprise-grade, lightweight Human Resource Management & Payroll Solution tailored for the **Gulf Region (Kingdom of Bahrain default & customizable for Saudi Arabia, UAE, Kuwait, Qatar, Oman)**.

Built with a **Pure MVC Core PHP backend (zero bloated frameworks, clean routing table, RESTful API architecture ready for future React Native Mobile Apps)** and a **React 19 + Vite frontend featuring an Executive Gulf Theme, Horizontal Top Navigation, and A5 Laser Payslip formatting**.

---

## 🌟 Key Features & Gulf Regional Compliance

### 1. 🇧🇭 Bahrain Labor Law & Multi-Country Gulf Configuration
- **Time Zone & Date Formats**: Default `Asia/Bahrain` (GMT+3), `d/m/Y`.
- **Currency & Precision**: 3 Decimal Places for BHD (`BD 1,250.000`), KWD, OMR; 2 Decimals for SAR, AED, QAR.
- **Quick Regional Presets**: 1-Click switch for Bahrain, Saudi Arabia, UAE, Kuwait, Qatar, and Oman.
- **Social Insurance (GOSI)**:
  - **Bahraini / GCC Citizens**: 7.00% Employee Share / 12.00% Employer Share on Basic + Housing.
  - **Expatriates**: 1.00% Employee Share / 3.00% Employer Share on Basic Salary.
- **LMRA Levy**: Automated 10.000 BHD monthly levy calculation for expatriate staff.
- **Overtime Multipliers (Law No. 36/2012)**:
  - Normal Day Overtime: 1.25x hourly wage.
  - Night / Weekend Overtime: 1.50x hourly wage.
  - Official Holiday Overtime: 2.00x hourly wage.

---

### 2. 👥 Employee Lifecycle & Document Expiry Vault
- **Onboarding Form**: Personal details, CPR/National ID, Passport, Visa/Residence permit, Driving license, Health insurance, GOSI Reg No, LMRA No.
- **Bahrain Salary Structure**: Basic Salary + Housing Allowance (HR) + Transport + Car + Mobile + Food + Other allowances.
- **Attachment Vault & Expiry Radar**:
  - Store Passport copies, Visa copies, CPR copies, Contracts, Certificates.
  - Dynamic countdown badges (e.g. `25 Days Left`) with automatic dashboard alerts for documents expiring in 30/60/90 days.

---

### 3. ⏱️ Attendance & Biometric CSV / Excel Importer
- **Universal Biometric Punch Importer**: Drag-and-drop CSV or paste punch lines directly (`EmpCode, Date, CheckIn, CheckOut, Status, OvertimeHours`).
- **Automatic Overtime Calculation**: Detects shifts exceeding standard 8.0 hours and applies normal vs weekend/holiday multipliers.
- **Manual Punch Register**: Daily check-in/out marking and attendance matrices.

---

### 4. 💰 Payroll Engine & Official A5 Laser Payslips
- **Bulk & Departmental Calculation**: Process payroll for All Employees, Department-wise, or Individuals.
- **Calculation Formula**:
  $$\text{Net Salary} = (\text{Basic} + \text{Allowances} + \text{OT Pay} + \text{Bonus} + \text{Leave Salary}) - (\text{GOSI} + \text{Loan EMI} + \text{Absent Deductions})$$
- **Official A5 Payslip Generator**:
  - Specially formatted for **A5 Paper Laser / Thermal Printing**.
  - Dual signature authorization blocks (Prepared By & Employee Clearance).
  - Net amount displayed in figures and clear currency units.

---

### 5. 📜 Indemnity (EOSB) & Leave Salary Encashment
- **Bahrain Labor Law Statutory Gratuity Formula**:
  - **Tier 1 (First 3 Years)**: 15 days basic salary per year of continuous service.
  - **Tier 2 (After 3 Years)**: 30 days (1 full month) basic salary per year.
  - **Pro-rata exact fractional calculation** for fractional years, months, and days.
- **Leave Encashment (Leave Salary)**: Encashment of unused annual leave days.
- **Printable Final Settlement Certificate**: Official full & final clearance statement.

---

### 6. 💳 Loans & Salary Advances
- Register loans with auto-calculated monthly EMI installments.
- Linked directly to monthly payroll for automated deductions and balance reductions.

---

### 7. 🏖️ Leaves & Vacations Management
- Annual Leave, Sick Leave, Maternity Leave, Casual Leave, Hajj Leave, and Unpaid Leave.
- Approval / Rejection workflow with leave balance deductions.

---

## 🏗️ Architecture & Clean MVC Structure

```
hrsolution/
├── backend/                         # Pure Core PHP MVC Backend
│   ├── config/
│   │   ├── Config.php               # CORS & App Constants
│   │   └── Database.php             # PDO Singleton Connection
│   ├── core/
│   │   ├── Router.php               # Pure Routing Table (GET, POST, PUT, DELETE)
│   │   ├── Controller.php           # Base Controller with JSON helpers
│   │   ├── Model.php                # Base Model with PDO queries
│   │   └── AuthMiddleware.php       # Bearer Token Authentication
│   ├── controllers/                 # RESTful API Controllers
│   │   ├── AuthController.php
│   │   ├── EmployeeController.php
│   │   ├── DocumentController.php
│   │   ├── AttendanceController.php
│   │   ├── PayrollController.php
│   │   ├── IndemnityController.php
│   │   ├── LeaveController.php
│   │   ├── LoanController.php
│   │   ├── SettingsController.php
│   │   └── DashboardController.php
│   ├── models/                      # Database Models
│   ├── database/
│   │   ├── schema.sql               # MySQL Database Schema
│   │   └── seeder.php               # Sample GCC Data Seeder
│   └── public/
│       ├── index.php                # Single MVC Entry Point & Routing Table
│       └── uploads/                 # Document & Attachment Vault Storage
│
├── frontend/                        # React + Vite Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI Elements
│   │   │   ├── Navbar.jsx           # Horizontal Top Navigation Menu
│   │   │   ├── DataTable.jsx        # DataTables with search, sort & CSV export
│   │   │   ├── Modal.jsx            # Custom Modal Dialogs (No browser alerts)
│   │   │   └── Toast.jsx            # Animated Toast Notification System
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Page State & Auth Maintenance
│   │   ├── pages/                   # HRMS Views
│   │   │   ├── Login.jsx            # 1-Click Role Login Portal
│   │   │   ├── Dashboard.jsx        # Executive GCC KPI Radar
│   │   │   ├── Employees.jsx        # Onboarding & Document Vault
│   │   │   ├── Attendance.jsx       # Biometric CSV Importer & OT
│   │   │   ├── Payroll.jsx          # Payroll Engine & A5 Payslips
│   │   │   ├── Indemnity.jsx        # Bahrain Labor Law EOSB & Leave Salary
│   │   │   ├── Leaves.jsx           # Leave Approvals
│   │   │   ├── Loans.jsx            # Loan & EMI Schedules
│   │   │   └── Settings.jsx         # Country & Labor Rules
│   │   ├── services/
│   │   │   └── api.js               # REST Client with Token Injection
│   │   ├── index.css                # Executive Gulf Design System & A5 Print CSS
│   │   └── App.jsx
│   └── vite.config.js
```

---

## 🚀 Quick Start Guide

### 1. Database Configuration & Seeding
Ensure MySQL is running on `127.0.0.1:3306` with credentials (`root` / `S@nds1@b`).
Run the database seeder:
```bash
php backend/database/seeder.php
```

### 2. Start PHP Backend Server
```bash
php -S 127.0.0.1:8000 -t backend/public
```

### 3. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🔑 Default Demo User Credentials

| Role | Username | Password | Access Level |
|---|---|---|---|
| **System Administrator** | `admin` | `password123` | Full Access & Regional Settings |
| **HR Operations Admin** | `hr_admin` | `password123` | Payroll, Onboarding, Documents |
| **Employee Self-Service** | `emp_rahul` | `password123` | Profile, Leaves, View A5 Payslips |

---

## 📱 Phase 2 Ready: Mobile App & REST APIs
All backend endpoints are built as stateless RESTful JSON APIs supporting standard `Authorization: Bearer <token>` headers, enabling React Native mobile applications to connect directly without modifying the core backend.
