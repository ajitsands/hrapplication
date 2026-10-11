// frontend/src/pages/Attendance.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { ShiftMaster } from '../components/ShiftMaster';
import { ShiftRosterCalendar } from '../components/ShiftRosterCalendar';
import { MonthlyAttendanceReport } from '../components/MonthlyAttendanceReport';
import {
  Clock,
  UploadCloud,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  Calendar,
  CalendarDays,
  AlertCircle,
  Download,
  Filter,
  Sparkles,
  Zap,
  TrendingUp,
  UserCheck,
  Building,
  Fingerprint,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Attendance = ({ initialSubTab = 'daily' }) => {
  const { formatDate, formatCurrency, showToast, settings } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Digital Clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filters
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedEmp, setSelectedEmp] = useState('');

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isLandscapeModalOpen, setIsLandscapeModalOpen] = useState(false);

  // Landscape Monthly Time-Card Report State
  const [reportScope, setReportScope] = useState('all'); // 'all', 'department', 'individual'
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportDeptId, setReportDeptId] = useState('');
  const [reportEmpId, setReportEmpId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Manual Punch Form
  const [manualForm, setManualForm] = useState({
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    check_in: '08:00',
    check_out: '16:00',
    status: 'Present',
    ot_hours: 0,
    notes: 'Office biometric punch'
  });

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [csvPreview, setCsvPreview] = useState([]);

  // Live clock interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [attRes, empRes, deptRes] = await Promise.all([
        api.get('/attendance', { month, year, employee_id: selectedEmp }),
        api.get('/employees'),
        api.get('/employees/departments')
      ]);

      if (attRes.success) {
        setRecords(attRes.data.records || []);
        setSummary(attRes.data.summary || []);
      }
      if (empRes.success) {
        setEmployees(empRes.data || []);
      }
      if (deptRes.success) {
        setDepartments(deptRes.data || []);
      }
    } catch (err) {
      showToast('Error', 'Failed to load attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year, selectedEmp]);

  // Load Landscape Time-Card Report
  const loadLandscapeReport = async (overrideParams = {}) => {
    try {
      setReportLoading(true);
      const m = overrideParams.month || reportMonth;
      const y = overrideParams.year || reportYear;
      const sc = overrideParams.scope || reportScope;
      const dId = overrideParams.department_id !== undefined ? overrideParams.department_id : reportDeptId;
      const eId = overrideParams.employee_id !== undefined ? overrideParams.employee_id : reportEmpId;

      const res = await api.get('/attendance/monthly-report', {
        month: m,
        year: y,
        scope: sc,
        department_id: dId,
        employee_id: eId
      });

      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      showToast('Error', 'Failed to generate monthly time-card sheets', 'error');
    } finally {
      setReportLoading(false);
    }
  };

  const openLandscapeReportModal = () => {
    setIsLandscapeModalOpen(true);
    loadLandscapeReport();
  };

  // Handle CSV file selection and live preview
  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      setCsvText(text);
      parsePreview(text);
    };
    reader.readAsText(file);
  };

  const parsePreview = (text) => {
    const lines = text.trim().split(/\r\n|\n/);
    const parsed = [];
    lines.slice(0, 15).forEach((line, idx) => {
      if (!line.trim()) return;
      const cols = line.split(',');
      if (idx === 0 && cols[0].toLowerCase().includes('emp')) return; // skip header

      const inTime = cols[2] || '08:00';
      const outTime = cols[3] || '16:00';
      let ot = 0;
      if (cols[5] && !isNaN(cols[5])) {
        ot = parseFloat(cols[5]);
      } else {
        // Auto compute standard > 8h
        const tIn = new Date(`2026-01-01 ${inTime}`);
        const tOut = new Date(`2026-01-01 ${outTime}`);
        if (tOut > tIn) {
          const diffHours = (tOut - tIn) / 3600000;
          if (diffHours > 8) ot = Math.round((diffHours - 8) * 100) / 100;
        }
      }

      parsed.push({
        empCode: cols[0],
        date: cols[1],
        inTime,
        outTime,
        status: cols[4] || 'Present',
        otHours: ot
      });
    });
    setCsvPreview(parsed);
  };

  // Submit CSV Import
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (csvFile) {
        const data = new FormData();
        data.append('csv_file', csvFile);
        res = await api.post('/attendance/import', data);
      } else if (csvText.trim()) {
        res = await api.post('/attendance/import', { csv_text: csvText });
      } else {
        showToast('Error', 'Please select a CSV file or paste punch data', 'error');
        return;
      }

      if (res.success) {
        showToast('Import Complete', res.message, 'success');
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setIsImportModalOpen(false);
        setCsvFile(null);
        setCsvText('');
        setCsvPreview([]);
        fetchData();
      }
    } catch (err) {
      showToast('Import Failed', err.message || 'Error processing CSV', 'error');
    }
  };

  // Submit Manual Mark
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.employee_id) {
      showToast('Error', 'Please select an employee', 'error');
      return;
    }

    try {
      const res = await api.post('/attendance/mark', manualForm);
      if (res.success) {
        showToast('Saved', 'Attendance punch recorded successfully!', 'success');
        setIsManualModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to save attendance', 'error');
    }
  };

  // Columns definition
  const columns = [
    {
      header: 'Employee',
      accessor: 'first_name',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-pill-active)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.825rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
            }}
          >
            {row.first_name[0]}{row.last_name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {row.first_name} {row.last_name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {row.emp_code} • {row.department_name}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Date & Day',
      accessor: 'date',
      sortable: true,
      render: (row) => {
        const d = new Date(row.date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        return (
          <div>
            <div style={{ fontWeight: 700 }}>{formatDate(row.date)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dayName}</div>
          </div>
        );
      }
    },
    {
      header: 'Assigned Shift',
      accessor: 'shift_code',
      render: (row) => {
        const shiftCode = row.shift_code || 'SH-GEN';
        const shiftColor = row.shift_color || '#0ea5e9';
        const lateIn = parseInt(row.late_in_mins || 0);
        const earlyOut = parseInt(row.early_out_mins || 0);
        return (
          <div>
            <span
              style={{
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.72rem',
                fontWeight: 800,
                background: `${shiftColor}22`,
                color: shiftColor,
                border: `1px solid ${shiftColor}44`
              }}
            >
              {shiftCode}
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {row.shift_name || 'General Shift'}
            </div>
            {(lateIn > 0 || earlyOut > 0) && (
              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.2rem' }}>
                {lateIn > 0 && (
                  <span style={{ fontSize: '0.65rem', color: '#b91c1c', background: '#fee2e2', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 700 }}>
                    Late +{lateIn}m
                  </span>
                )}
                {earlyOut > 0 && (
                  <span style={{ fontSize: '0.65rem', color: '#b45309', background: '#fef3c7', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 700 }}>
                    Early -{earlyOut}m
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Biometric Check-In / Out',
      accessor: 'check_in',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.78rem', border: '1px solid #a7f3d0' }}>
            In: {row.check_in ? row.check_in.slice(0, 5) : '—'}
          </span>
          <span style={{ background: '#fdf2f8', color: '#db2777', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.78rem', border: '1px solid #fbcfe8' }}>
            Out: {row.check_out ? row.check_out.slice(0, 5) : '—'}
          </span>
        </div>
      )
    },
    {
      header: 'Work Hours',
      accessor: 'total_hours',
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
          {row.total_hours} hrs
        </span>
      )
    },
    {
      header: 'Overtime (Bahrain Law)',
      accessor: 'ot_hours',
      sortable: true,
      render: (row) => {
        const ot = parseFloat(row.ot_hours || 0);
        const dayOt = parseFloat(row.day_ot_hours || 0);
        const nightOt = parseFloat(row.night_ot_hours || 0);
        const holidayOt = parseFloat(row.holiday_ot_hours || 0);
        return ot > 0 ? (
          <div>
            <span className="badge badge-pink" style={{ fontWeight: 800 }}>
              +{ot} hrs OT
            </span>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
              {nightOt > 0 && <span style={{ color: '#7c3aed', display: 'block', fontWeight: 700 }}>🌙 Night: {nightOt}h (1.50x)</span>}
              {dayOt > 0 && <span style={{ color: '#0284c7', display: 'block' }}>☀️ Day: {dayOt}h (1.25x)</span>}
              {holidayOt > 0 && <span style={{ color: '#b91c1c', display: 'block', fontWeight: 700 }}>🏖️ Hol: {holidayOt}h (1.50x)</span>}
            </div>
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>0.00</span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => {
        let bClass = 'badge-primary';
        if (row.status === 'Present') bClass = 'badge-success';
        if (row.status === 'Absent') bClass = 'badge-danger';
        if (row.status === 'Half Day' || row.status === 'On Leave') bClass = 'badge-warning';
        if (row.status === 'Weekend' || row.status === 'Holiday') bClass = 'badge-info';

        return <span className={`badge ${bClass}`}>{row.status}</span>;
      }
    },
    {
      header: 'Device & Source',
      accessor: 'source',
      render: (row) => (
        <div style={{ fontSize: '0.78rem' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
            <Fingerprint size={11} /> {row.source}
          </span>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {row.notes || 'Biometric Punch Log'}
          </div>
        </div>
      )
    }
  ];

  const totalOTMonth = records.reduce((sum, r) => sum + parseFloat(r.ot_hours || 0), 0);
  const totalWorkHoursMonth = records.reduce((sum, r) => sum + parseFloat(r.total_hours || 0), 0);
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>Attendance, Shifts &amp; Biometric Overtime Engine</h2>
          <p>Multi-shift rostering, punch terminal synchronization, automated Bahrain Labor Law overtime, and leave correlation</p>
        </div>

        <div className="header-action-group">
          <button className="btn btn-gold" onClick={openLandscapeReportModal}>
            <Printer size={16} /> Landscape Monthly Sheet Print
          </button>
          <button className="btn btn-pink" onClick={() => setIsImportModalOpen(true)}>
            <UploadCloud size={16} /> Import Biometric CSV / Excel
          </button>
          <button className="btn btn-primary" onClick={() => setIsManualModalOpen(true)}>
            <Plus size={16} /> Mark Manual Punch
          </button>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS FOR ATTENDANCE & SHIFTS */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap'
        }}
      >
        <button
          className={`btn btn-sm ${activeSubTab === 'daily' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('daily')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
        >
          <Clock size={16} /> Daily Log &amp; Biometrics
        </button>

        <button
          className={`btn btn-sm ${activeSubTab === 'shifts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('shifts')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
        >
          <Sparkles size={16} /> Shift Master &amp; Policies
        </button>

        <button
          className={`btn btn-sm ${activeSubTab === 'roster' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('roster')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
        >
          <CalendarDays size={16} /> Monthly Shift Rostering
        </button>

        <button
          className={`btn btn-sm ${activeSubTab === 'report' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('report')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
        >
          <FileSpreadsheet size={16} /> Monthly Attendance Report
        </button>
      </div>

      {/* VIEW 1: SHIFT MASTER */}
      {activeSubTab === 'shifts' && <ShiftMaster />}

      {/* VIEW 2: SHIFT ROSTERING CALENDAR */}
      {activeSubTab === 'roster' && <ShiftRosterCalendar />}

      {/* VIEW 3: MONTHLY ATTENDANCE MATRIX REPORT (AFTER MONTHLY SHIFT ROSTER) */}
      {activeSubTab === 'report' && <MonthlyAttendanceReport />}

      {/* VIEW 4: DAILY ATTENDANCE & LOGS */}
      {activeSubTab === 'daily' && (
        <>
          {/* NEW ATTRACTIVE HERO SECTION: Digital Clock & Live Punch Hub */}
          <div className="attendance-hero-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fbcfe8' }}>
                  <Zap size={16} /> Bahrain Multi-Shift Tracker &amp; Overtime Engine
                </div>
                <h3 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.35rem', marginBottom: '0.35rem', color: '#ffffff' }}>
                  Automated Overtime &amp; Biometric Attendance Hub
                </h3>
                <p style={{ color: '#e0e7ff', fontSize: '0.9rem', maxWidth: '680px' }}>
                  Punches matched against daily assigned shifts. Excess hours automatically calculated at <strong>1.25x (Day OT)</strong>, <strong>1.50x (Night / Weekend OT)</strong>, or <strong>2.00x (Official Holidays)</strong> as mandated by Bahrain Labor Law (Law No. 36/2012).
                </p>
              </div>

          {/* Live Digital Clock Widget */}
          <div className="clock-display-box">
            <Clock size={32} color="#f472b6" />
            <div>
              <div className="clock-time">
                {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="clock-date">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} • {settings.timezone}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards - Blue & Pink Combination */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Logged Punches</div>
            <div className="stat-value">{records.length}</div>
            <div className="stat-sub">
              <span>{presentCount} Present • {absentCount} Absent</span>
            </div>
          </div>
          <div className="stat-icon-wrapper">
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card pink">
          <div className="stat-info">
            <div className="stat-label">Calculated Overtime</div>
            <div className="stat-value" style={{ color: 'var(--accent-pink)' }}>{totalOTMonth.toFixed(1)} hrs</div>
            <div className="stat-sub">
              <span>Auto-factored in monthly payroll</span>
            </div>
          </div>
          <div className="stat-icon-wrapper pink">
            <Sparkles size={24} />
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-info">
            <div className="stat-label">Total Work Hours</div>
            <div className="stat-value">{totalWorkHoursMonth.toFixed(0)} hrs</div>
            <div className="stat-sub">
              <span>Month {month}/{year} regular work</span>
            </div>
          </div>
          <div className="stat-icon-wrapper info">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-info">
            <div className="stat-label">Active Staff Monitored</div>
            <div className="stat-value">{employees.length}</div>
            <div className="stat-sub">
              <span>Biometric synced</span>
            </div>
          </div>
          <div className="stat-icon-wrapper gold">
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      {/* Bahrain Labor Law Overtime Rules Reference Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(236, 72, 153, 0.05) 100%)', border: '1px solid #fbcfe8' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-pill-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Bahrain Statutory Overtime Multiplier Engine
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Standard formula: Hourly Rate = <code>Basic Salary / ({settings.work_days_per_month} days × {settings.work_hours_per_day} hrs)</code> = <code>Basic / 240</code>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}>
              Normal Day OT: <strong>{settings.ot_normal_multiplier}x</strong>
            </span>
            <span className="badge badge-pink" style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}>
              Weekend OT: <strong>{settings.ot_night_multiplier}x</strong>
            </span>
            <span className="badge badge-gold" style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}>
              Holiday OT: <strong>{settings.ot_holiday_multiplier}x</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Attendance Table */}
      <DataTable
        columns={columns}
        data={records}
        searchPlaceholder="Search punches by employee, date, status, device..."
        extraToolbar={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  {new Date(2026, m - 1, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>

            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
            >
              <option value="">All Employees ({employees.length})</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.emp_code} - {emp.first_name} {emp.last_name}</option>
              ))}
            </select>
          </div>
        }
      />
      </>
      )}

      {/* 1. LANDSCAPE MONTHLY ATTENDANCE TIME-CARD REPORT MODAL (EXACT 1-31 FORMAT) */}
      <Modal
        isOpen={isLandscapeModalOpen}
        onClose={() => setIsLandscapeModalOpen(false)}
        title="Monthly Attendance Landscape Time-Card Printout (1 to 31 Grid)"
        size="lg"
        footer={
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Page Layout: Landscape Format (Auto page-breaks per employee)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsLandscapeModalOpen(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={15} /> Print Landscape Sheets
              </button>
            </div>
          </div>
        }
      >
        <div>
          {/* Controls Bar */}
          <div className="no-print" style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '0.2rem' }}>Month &amp; Year</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <select
                    className="form-control"
                    style={{ width: 'auto', padding: '0.4rem 0.65rem' }}
                    value={reportMonth}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setReportMonth(m);
                      loadLandscapeReport({ month: m });
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {new Date(2026, m - 1, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-control"
                    style={{ width: 'auto', padding: '0.4rem 0.65rem' }}
                    value={reportYear}
                    onChange={(e) => {
                      const y = Number(e.target.value);
                      setReportYear(y);
                      loadLandscapeReport({ year: y });
                    }}
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '0.2rem' }}>Report Scope</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.35rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="rScope"
                      checked={reportScope === 'all'}
                      onChange={() => {
                        setReportScope('all');
                        loadLandscapeReport({ scope: 'all' });
                      }}
                    />
                    <span>All Employees ({employees.length})</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="rScope"
                      checked={reportScope === 'department'}
                      onChange={() => {
                        setReportScope('department');
                        loadLandscapeReport({ scope: 'department' });
                      }}
                    />
                    <span>Department-wise</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="rScope"
                      checked={reportScope === 'individual'}
                      onChange={() => {
                        setReportScope('individual');
                        loadLandscapeReport({ scope: 'individual' });
                      }}
                    />
                    <span>Individual Employee</span>
                  </label>
                </div>
              </div>

              {reportScope === 'department' && (
                <div>
                  <label className="form-label" style={{ marginBottom: '0.2rem' }}>Choose Department</label>
                  <select
                    className="form-control"
                    style={{ width: 'auto', padding: '0.4rem 0.65rem' }}
                    value={reportDeptId}
                    onChange={(e) => {
                      setReportDeptId(e.target.value);
                      loadLandscapeReport({ department_id: e.target.value });
                    }}
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {reportScope === 'individual' && (
                <div>
                  <label className="form-label" style={{ marginBottom: '0.2rem' }}>Choose Employee</label>
                  <select
                    className="form-control"
                    style={{ width: 'auto', padding: '0.4rem 0.65rem' }}
                    value={reportEmpId}
                    onChange={(e) => {
                      setReportEmpId(e.target.value);
                      loadLandscapeReport({ employee_id: e.target.value });
                    }}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.emp_code} - {emp.first_name} {emp.last_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Render All Employee Landscape Sheets */}
          {reportLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s infinite linear' }} />
              <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>Compiling 1-31 Landscape Attendance Sheets...</p>
            </div>
          ) : reportData?.sheets && reportData.sheets.length > 0 ? (
            <div className="attendance-landscape-container">
              {reportData.sheets.map((sheet, sIdx) => {
                const emp = sheet.employee;
                const daysMap = sheet.days;
                const daysInMonth = sheet.days_in_month;
                const dayCols = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                return (
                  <div key={emp.id || sIdx} className="attendance-landscape-sheet">
                    {/* Header Row */}
                    <div className="landscape-sheet-header">
                      <div className="landscape-emp-meta">
                        <h3>Name Of The Employee: {emp.first_name} {emp.last_name}</h3>
                        <p>
                          Code: <strong>{emp.emp_code}</strong> | Dept: <strong>{emp.department_name || 'General'}</strong> | Designation: <strong>{emp.designation_name || 'Staff'}</strong> | CPR: <strong>{emp.cpr_no}</strong> | Shift: <strong style={{ color: 'var(--primary)' }}>[{sheet.assigned_shift_code || 'SH-GEN'}] {sheet.assigned_shift || 'General Shift'}</strong>
                        </p>
                      </div>

                      <div className="landscape-month-meta">
                        <div className="month-pill">
                          For the Month Of : {sheet.month_title}
                        </div>
                      </div>
                    </div>

                    {/* 1 to 31 Day Grid Table */}
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                      <table className="landscape-matrix-table">
                        <thead>
                          <tr>
                            <th className="metric-label-col">Metric / Day</th>
                            {dayCols.map((d) => {
                              const isWe = daysMap[d]?.is_weekend;
                              return (
                                <th key={d} className={`day-header-col ${isWe ? 'weekend-col' : ''}`}>
                                  <div>{d}</div>
                                  <div style={{ fontSize: '0.625rem', opacity: 0.85 }}>{daysMap[d]?.day_name}</div>
                                </th>
                              );
                            })}
                            <th className="total-col">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Row 1: IN Time */}
                          <tr>
                            <td className="metric-label-col in-cell">IN Time</td>
                            {dayCols.map((d) => {
                              const cell = daysMap[d];
                              return (
                                <td key={d} className={`in-cell ${cell?.is_weekend ? 'weekend-cell' : ''}`}>
                                  {cell?.check_in || (cell?.is_weekend ? 'OFF' : '—')}
                                </td>
                              );
                            })}
                            <td className="total-col">{sheet.summary.present_days} Days</td>
                          </tr>

                          {/* Row 2: OUT Time */}
                          <tr>
                            <td className="metric-label-col out-cell">OUT Time</td>
                            {dayCols.map((d) => {
                              const cell = daysMap[d];
                              return (
                                <td key={d} className={`out-cell ${cell?.is_weekend ? 'weekend-cell' : ''}`}>
                                  {cell?.check_out || (cell?.is_weekend ? 'OFF' : '—')}
                                </td>
                              );
                            })}
                            <td className="total-col">{sheet.summary.present_days} Punches</td>
                          </tr>

                          {/* Row 3: Total HRS */}
                          <tr>
                            <td className="metric-label-col hours-cell">Total HRS</td>
                            {dayCols.map((d) => {
                              const cell = daysMap[d];
                              return (
                                <td key={d} className={`hours-cell ${cell?.is_weekend ? 'weekend-cell' : ''}`}>
                                  {cell?.total_hours || '0.00'}
                                </td>
                              );
                            })}
                            <td className="total-col">{sheet.summary.total_work_hours} hrs</td>
                          </tr>

                          {/* Row 4: Total OT */}
                          <tr>
                            <td className="metric-label-col ot-cell">Total OT</td>
                            {dayCols.map((d) => {
                              const cell = daysMap[d];
                              return (
                                <td key={d} className={`ot-cell ${cell?.is_weekend ? 'weekend-cell' : ''}`}>
                                  {cell?.ot_hours || '0.00'}
                                </td>
                              );
                            })}
                            <td className="total-col">{sheet.summary.total_ot_hours} hrs</td>
                          </tr>

                          {/* Row 5: Total Earning of the Day */}
                          <tr>
                            <td className="metric-label-col earn-cell">Total Earning ({settings.currency})</td>
                            {dayCols.map((d) => {
                              const cell = daysMap[d];
                              return (
                                <td key={d} className={`earn-cell ${cell?.is_weekend ? 'weekend-cell' : ''}`}>
                                  {cell?.daily_earning || '—'}
                                </td>
                              );
                            })}
                            <td className="total-col">{formatCurrency(sheet.summary.total_earnings)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Strip */}
                    <div className="landscape-summary-strip">
                      <div className="landscape-summary-item">
                        <span>Present Days:</span>
                        <strong>{sheet.summary.present_days} / {daysInMonth}</strong>
                      </div>
                      <div className="landscape-summary-item">
                        <span>Absent:</span>
                        <strong>{sheet.summary.absent_days} Days</strong>
                      </div>
                      <div className="landscape-summary-item">
                        <span>Total Hours:</span>
                        <strong>{sheet.summary.total_work_hours} hrs</strong>
                      </div>
                      <div className="landscape-summary-item">
                        <span>Total Overtime:</span>
                        <strong style={{ color: 'var(--accent-pink)' }}>{sheet.summary.total_ot_hours} hrs (+{formatCurrency(sheet.summary.total_ot_amount)})</strong>
                        {(parseFloat(sheet.summary.total_day_ot_hours || 0) > 0 || parseFloat(sheet.summary.total_night_ot_hours || 0) > 0 || parseFloat(sheet.summary.total_holiday_ot_hours || 0) > 0) && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                            Day: {sheet.summary.total_day_ot_hours || 0}h • Night: {sheet.summary.total_night_ot_hours || 0}h • Hol: {sheet.summary.total_holiday_ot_hours || 0}h
                          </div>
                        )}
                      </div>
                      <div className="landscape-summary-item">
                        <span>Daily Rate:</span>
                        <strong>{formatCurrency(sheet.summary.daily_rate)}</strong>
                      </div>
                      <div className="landscape-summary-item">
                        <span>Monthly Earning:</span>
                        <strong style={{ color: '#059669', fontSize: '1rem' }}>{formatCurrency(sheet.summary.total_earnings)}</strong>
                      </div>
                    </div>

                    {/* Signatures */}
                    <div className="landscape-sheet-signatures">
                      <div className="sig-block">
                        <div>Timekeeper / Supervisor Signature</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Verified against biometric punch logs</div>
                      </div>
                      <div className="sig-block">
                        <div>Employee Verification Signature</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Hours &amp; Overtime Accepted</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No employee records found for selected criteria.
            </div>
          )}
        </div>
      </Modal>

      {/* 2. BIOMETRIC CSV / EXCEL IMPORT MODAL */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Biometric Punch Attendance CSV / Excel"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(false)}>Cancel</button>
            <button className="btn btn-pink" onClick={handleImportSubmit}>
              <UploadCloud size={15} /> Process &amp; Import Records
            </button>
          </>
        }
      >
        <form onSubmit={handleImportSubmit}>
          <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #fdf2f8 100%)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--primary)' }}>
              Universal Biometric Terminal Integration
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Upload exported CSV files from ZKTeco, Suprema, or facial recognition terminals.
              Required columns: <code>EmpCode/CPR, Date (YYYY-MM-DD), CheckIn (HH:MM), CheckOut (HH:MM), [Status], [OvertimeHours]</code>.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label required">Select CSV / Excel Export File</label>
            <div className="biometric-dropzone">
              <UploadCloud size={36} color="var(--accent-pink)" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Drag &amp; Drop Attendance CSV File Here
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Supports .csv, .txt, .xlsx punch logs
              </div>
              <input
                type="file"
                accept=".csv, .txt, .xlsx"
                className="form-control"
                style={{ marginTop: '0.75rem', cursor: 'pointer' }}
                onChange={handleCsvFileChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Or Paste CSV Text Directly</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="EMP-001,2026-10-01,08:00,18:30,Present,2.5"
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                parsePreview(e.target.value);
              }}
            />
          </div>

          {/* Live Preview */}
          {csvPreview.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-pink)' }}>
                Preview Parsed Records ({csvPreview.length} previewed):
              </h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <table className="data-table" style={{ fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th>Emp Code</th>
                      <th>Date</th>
                      <th>In</th>
                      <th>Out</th>
                      <th>Status</th>
                      <th>Auto OT (Bahrain)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((p, idx) => (
                      <tr key={idx}>
                        <td><strong>{p.empCode}</strong></td>
                        <td>{p.date}</td>
                        <td>{p.inTime}</td>
                        <td>{p.outTime}</td>
                        <td>{p.status}</td>
                        <td>
                          {p.otHours > 0 ? (
                            <span className="badge badge-pink">+{p.otHours} hrs</span>
                          ) : (
                            '0'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* 3. MANUAL PUNCH MODAL */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Mark Manual Attendance Punch"
        size="default"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsManualModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleManualSubmit}>Save Attendance</button>
          </>
        }
      >
        <form onSubmit={handleManualSubmit}>
          <div className="form-group">
            <label className="form-label required">Select Employee</label>
            <select
              className="form-control"
              required
              value={manualForm.employee_id}
              onChange={(e) => setManualForm({ ...manualForm, employee_id: e.target.value })}
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.emp_code} - {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Date</label>
              <input
                type="date"
                className="form-control"
                required
                value={manualForm.date}
                onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-control"
                value={manualForm.status}
                onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="On Leave">On Leave</option>
                <option value="Holiday">Official Holiday</option>
                <option value="Weekend">Weekend</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Check-In Time</label>
              <input
                type="time"
                className="form-control"
                value={manualForm.check_in}
                onChange={(e) => setManualForm({ ...manualForm, check_in: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Check-Out Time</label>
              <input
                type="time"
                className="form-control"
                value={manualForm.check_out}
                onChange={(e) => setManualForm({ ...manualForm, check_out: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Overtime Hours (OT)</label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                value={manualForm.ot_hours}
                onChange={(e) => setManualForm({ ...manualForm, ot_hours: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <input
              type="text"
              className="form-control"
              value={manualForm.notes}
              onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
