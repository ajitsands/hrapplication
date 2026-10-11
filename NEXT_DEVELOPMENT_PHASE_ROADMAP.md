# 📋 Next Development Phase Roadmap: Employee Shift Management & Shift-Based Overtime Engine

**Scheduled Resume Time**: In ~8 Hours  
**Target Milestone**: Multi-Shift Scheduling, Shift Rostering, and Shift-Based Overtime Calculation (Bahrain & Gulf Labor Law)

---

## 🎯 Next Phase Requirements & Architecture Plan

### 1. 🕒 Shift Master & Shift Definition
- **Shift Types**:
  - `Morning / General Shift` (e.g., 08:00 AM – 04:00 PM / 8.0 hrs)
  - `Evening Shift` (e.g., 04:00 PM – 12:00 AM / 8.0 hrs)
  - `Night Shift` (e.g., 12:00 AM – 08:00 AM / 8.0 hrs) — automatically flags night overtime premium
  - `Split Shift` (e.g., 09:00 AM – 01:00 PM & 05:00 PM – 09:00 PM)
  - `Custom / Flexible Shift` (configurable by Admin)
- **Shift Configuration Parameters**:
  - `shift_code`, `shift_name`, `start_time`, `end_time`, `total_hours`
  - `break_duration` (minutes)
  - `grace_time_late_in` (e.g., 15 minutes tolerance)
  - `grace_time_early_out` (e.g., 15 minutes tolerance)
  - `is_night_shift` (flag to apply 1.50x Bahrain night overtime multiplier)
  - `half_day_min_hours` (e.g., minimum 4.0 hrs for half-day credit)
  - `full_day_min_hours` (e.g., minimum 7.0 hrs for full-day credit)

---

### 2. 👥 Employee Shift Assignment & Rostering
- **Assignment Levels**:
  - **Department-Wide Default Shift** (e.g., IT Support -> 24/7 Rotational, Admin -> Morning)
  - **Individual Employee Default Shift**
  - **Monthly / Weekly Shift Rostering Calendar** (ability to rotate employees across shifts or schedule days off / rest days)
- **Database Tables to Add**:
  - `shifts` (`id, name, code, start_time, end_time, total_hours, break_minutes, grace_minutes, is_night_shift, ot_rule`)
  - `employee_shift_assignments` (`id, employee_id, shift_id, effective_from, effective_to, is_default`)
  - `shift_roster` (`id, employee_id, date, shift_id, is_off_day, notes`)

---

### 3. ⚙️ Shift-Based Overtime & Attendance Engine
- **Early In / Late Out OT**:
  - Work done before shift start (e.g., Punch in at 07:00 for 08:00 shift -> 1.0 hr Pre-Shift OT).
  - Work done after shift end (e.g., Punch out at 18:30 for 16:00 shift -> 2.5 hrs Post-Shift OT).
- **Shift Duration OT**:
  - `Total Work Hours > Shift Standard Hours` -> excess counted as OT.
- **Night Shift Overtime Differential**:
  - Hours worked between 19:00 (7:00 PM) and 07:00 (7:00 AM) calculated with **1.50x Night Multiplier** under Bahrain Labor Law (Law No. 36/2012, Article 54).
- **Rest Day / Off-Day Shift Work**:
  - When employee punches in on an assigned `is_off_day` or weekend shift -> 1.50x or 2.00x holiday rate applied automatically.

---

### 4. 🖨️ Integration with Existing Modules
- **Biometric CSV Importer**: Auto-matches daily punches against the employee's assigned shift on that date to compute Early In, Late Out, Shift Hours, and OT.
- **Landscape 1-31 Monthly Time-Card**: Displays `Assigned Shift Name / Code` in the employee header strip, along with shift-correlated OT figures.
- **Payroll Engine**: Pulls exact shift-based regular vs night vs holiday overtime for monthly disbursement.

---

## 💾 Current Development State Snapshot
- **Backend**: Pure MVC Core PHP running on `http://127.0.0.1:8000/api`
- **Frontend**: React 19 + Vite (Blue & Pink Luxury Theme) on `http://localhost:3000`
- **Database**: MySQL `hr_solution_db`
- **Modules Active**:
  - Dashboard with GCC KPIs
  - Employee Management & Document Vault (CPR, Visa, Passport expiry radar)
  - Attendance Engine with Live Digital Clock & Biometric CSV Importer
  - 1-31 Landscape Attendance Matrix Sheet Generator & Print Engine
  - Payroll Engine & Official A5 Laser Payslip Generator
  - Bahrain Labor Law Indemnity (EOSB) & Leave Salary Calculator
  - Leaves & Vacation Approvals
  - Loans & Salary Advances (EMI Schedules)
  - Multi-Country Gulf Settings (Bahrain Default)
