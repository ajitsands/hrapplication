// frontend/src/components/MonthlyAttendanceReport.jsx

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileSpreadsheet,
  Calendar,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  TrendingUp,
  UserCheck,
  Search,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const MonthlyAttendanceReport = () => {
  const { showToast, user, settings } = useAuth();
  const isAdminOrHr = user && (user.role === 'admin' || user.role === 'hr');

  const weeklyOffSetting = settings?.weekly_off_days || 'Friday,Saturday';
  const dayNameToIndex = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  };
  const configuredOffDow = weeklyOffSetting
    .split(',')
    .map((s) => dayNameToIndex[s.trim()])
    .filter((n) => n !== undefined);
  const isWeeklyOff = (dow) => configuredOffDow.includes(dow);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDept, setSelectedDept] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [departments, setDepartments] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tooltip details on hover
  const [hoveredCell, setHoveredCell] = useState(null);

  // Month navigation
  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = { month, year };
      if (selectedDept) params.department_id = selectedDept;

      const [repRes, deptRes] = await Promise.all([
        api.get('/attendance/monthly-report', params),
        api.get('/employees/departments')
      ]);

      if (repRes.success) {
        setReportData(repRes.data);
      }
      if (deptRes.success) {
        setDepartments(deptRes.data || []);
      }
    } catch (err) {
      showToast('Error', 'Failed to load monthly attendance report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year, selectedDept]);

  const sheets = reportData?.sheets || [];
  const daysInMonth = reportData?.days_in_month || 30;

  // Filter sheets by search query
  const filteredSheets = sheets.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const emp = s.employee;
    return (
      emp.first_name?.toLowerCase().includes(q) ||
      emp.last_name?.toLowerCase().includes(q) ||
      emp.emp_code?.toLowerCase().includes(q) ||
      emp.department_name?.toLowerCase().includes(q) ||
      emp.designation_name?.toLowerCase().includes(q)
    );
  });

  // Calculate high level KPI totals
  const totalEmployees = filteredSheets.length;
  const totalWorkHoursAll = filteredSheets.reduce(
    (acc, s) => acc + (parseFloat(s.summary?.total_work_hours) || 0),
    0
  );
  const totalOtHoursAll = filteredSheets.reduce(
    (acc, s) => acc + (parseFloat(s.summary?.total_ot_hours) || 0),
    0
  );
  const avgHoursPerEmp =
    totalEmployees > 0 ? (totalWorkHoursAll / totalEmployees).toFixed(1) : '0.0';

  // Export to CSV Function
  const exportToCsv = () => {
    if (!filteredSheets.length) {
      showToast('Notice', 'No records to export', 'info');
      return;
    }

    const headers = [
      'Emp Code',
      'Employee Name',
      'Department',
      'Designation'
    ];

    for (let d = 1; d <= daysInMonth; d++) {
      headers.push(`Day ${d} In`, `Day ${d} Out`, `Day ${d} OT`);
    }

    headers.push(
      'Total Present Days',
      'Total Absent Days',
      'Total OT Hours',
      'Total Hours Worked (30-Day)'
    );

    const rows = filteredSheets.map((s) => {
      const emp = s.employee;
      const row = [
        emp.emp_code || '',
        `"${emp.first_name} ${emp.last_name}"`,
        `"${emp.department_name || ''}"`,
        `"${emp.designation_name || ''}"`
      ];

      for (let d = 1; d <= daysInMonth; d++) {
        const dayData = s.days?.[d];
        if (dayData && dayData.status === 'Present') {
          row.push(
            dayData.check_in_24 || dayData.check_in || '',
            dayData.check_out_24 || dayData.check_out || '',
            dayData.ot_hours || '0'
          );
        } else if (dayData && dayData.status === 'Weekend') {
          row.push('OFF', 'OFF', dayData.ot_hours || '0');
        } else if (dayData && dayData.status === 'On Leave') {
          row.push('LEAVE', 'LEAVE', '0');
        } else if (dayData && dayData.status === 'Holiday') {
          row.push('HOLIDAY', 'HOLIDAY', dayData.ot_hours || '0');
        } else if (dayData && dayData.status === 'Absent') {
          row.push('ABSENT', 'ABSENT', '0');
        } else {
          row.push('—', '—', '0');
        }
      }

      row.push(
        s.summary?.present_days || 0,
        s.summary?.absent_days || 0,
        s.summary?.total_ot_hours || 0,
        s.summary?.total_work_hours || 0
      );

      return row.join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Attendance_Report_${year}_${String(month).padStart(2, '0')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Success', 'Attendance report CSV exported successfully', 'success');
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. TOP HEADER & FILTER BAR - LUMINOUS EXECUTIVE GRADIENT THEME */}
      <div
        className="card"
        style={{
          padding: '1.35rem 1.65rem',
          background: 'linear-gradient(135deg, #e0f2fe 0%, #eef2ff 35%, #faf5ff 68%, #fce7f3 100%)',
          color: '#0f172a',
          border: '1px solid #c7d2fe',
          boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#4f46e5',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(6px)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid rgba(199, 210, 254, 0.8)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                boxShadow: '0 1px 3px rgba(99, 102, 241, 0.08)'
              }}
            >
              <FileSpreadsheet size={15} color="#6366f1" /> Monthly 1–31 Attendance &amp; Overtime Matrix
            </div>
            <h2
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: '0.35rem 0 0.25rem 0',
                letterSpacing: '-0.02em'
              }}
            >
              Monthly Attendance Report
            </h2>
            <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
              Complete 30-day employee punch record: In-Time, Out-Time, Overtime
              breakdowns, and cumulative work hours compliant with Bahrain Labor Law.
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-sm btn-secondary"
              onClick={exportToCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ffffff',
                color: '#0f172a',
                borderColor: '#cbd5e1',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                fontWeight: 700
              }}
            >
              <Download size={15} color="#0284c7" /> Export CSV
            </button>

            <button
              className="btn btn-sm btn-secondary"
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)',
                color: '#4338ca',
                borderColor: '#c7d2fe',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.08)',
                fontWeight: 700
              }}
            >
              <Printer size={15} color="#6366f1" /> Print Matrix
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(199, 210, 254, 0.7)'
          }}
        >
          {/* Month / Year Navigator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-sm"
              onClick={handlePrevMonth}
              style={{
                padding: '0.35rem 0.65rem',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <div
              style={{
                padding: '0.35rem 0.95rem',
                background: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 800,
                fontSize: '0.92rem',
                minWidth: '150px',
                textAlign: 'center',
                color: '#1e1b4b',
                border: '1px solid #c7d2fe',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.06)'
              }}
            >
              {reportData?.month_title ||
                new Date(year, month - 1).toLocaleString('default', {
                  month: 'long',
                  year: 'numeric'
                })}
            </div>

            <button
              className="btn btn-sm"
              onClick={handleNextMonth}
              style={{
                padding: '0.35rem 0.65rem',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>

            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="form-control"
              style={{
                padding: '0.35rem 0.6rem',
                fontSize: '0.85rem',
                width: 'auto',
                background: '#ffffff',
                color: '#0f172a',
                borderColor: '#cbd5e1'
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString('default', { month: 'short' })}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || year)}
              className="form-control"
              style={{
                padding: '0.35rem 0.6rem',
                fontSize: '0.85rem',
                width: '80px',
                background: '#ffffff',
                color: '#0f172a',
                borderColor: '#cbd5e1'
              }}
            />
          </div>

          {/* Department Filter & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={16} color="#64748b" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="form-control"
                style={{
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.85rem',
                  width: 'auto',
                  background: '#ffffff',
                  color: '#0f172a',
                  borderColor: '#cbd5e1'
                }}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{
                  padding: '0.35rem 0.65rem 0.35rem 1.85rem',
                  fontSize: '0.85rem',
                  width: '180px',
                  background: '#ffffff',
                  color: '#0f172a',
                  borderColor: '#cbd5e1'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI SUMMARY METRICS CARDS */}
      <div className="grid-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Active Staff Monitored</div>
            <div className="stat-value">{totalEmployees}</div>
            <div className="stat-sub">
              <span>Biometric / Shift sync</span>
            </div>
          </div>
          <div className="stat-icon-wrapper">
            <UserCheck size={22} />
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-info">
            <div className="stat-label">Total Month Work Hours</div>
            <div className="stat-value">{totalWorkHoursAll.toFixed(1)} hrs</div>
            <div className="stat-sub">
              <span>Cumulative for {reportData?.month_title || `${month}/${year}`}</span>
            </div>
          </div>
          <div className="stat-icon-wrapper info">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card pink">
          <div className="stat-info">
            <div className="stat-label">Calculated Overtime</div>
            <div className="stat-value" style={{ color: 'var(--accent-pink)' }}>
              {totalOtHoursAll.toFixed(1)} hrs
            </div>
            <div className="stat-sub">
              <span>1.25x Normal • 1.5x Night/Weekend</span>
            </div>
          </div>
          <div className="stat-icon-wrapper pink">
            <Sparkles size={22} />
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-info">
            <div className="stat-label">Avg Hours / Employee</div>
            <div className="stat-value">{avgHoursPerEmp} hrs</div>
            <div className="stat-sub">
              <span>Standard: {settings.work_hours_per_day * settings.work_days_per_month} hrs/mo</span>
            </div>
          </div>
          <div className="stat-icon-wrapper gold">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* 3. LEGEND STRIP */}
      <div
        className="card"
        style={{
          padding: '0.65rem 1rem',
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}
      >
        <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Legend:</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontWeight: 800
            }}
          >
            08:00 - 16:00
          </span>
          <span>Present (In / Out)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              fontWeight: 800
            }}
          >
            +1.5h OT
          </span>
          <span>Overtime Logged</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#64748b',
              fontWeight: 800
            }}
          >
            OFF
          </span>
          <span>Scheduled Rest Day / Weekend</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              color: '#6d28d9',
              fontWeight: 800
            }}
          >
            LVE
          </span>
          <span>Approved Leave</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontWeight: 800
            }}
          >
            ABS
          </span>
          <span>Absent</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              fontWeight: 800
            }}
          >
            Total Hrs Worked
          </span>
          <span>Final 30-Day Cumulative Sum</span>
        </div>
      </div>

      {/* 4. MAIN ATTENDANCE MATRIX TABLE */}
      <div
        className="card"
        style={{
          padding: 0,
          overflowX: 'auto',
          border: '1px solid var(--border-subtle)',
          position: 'relative'
        }}
      >
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e2e8f0',
                borderTopColor: 'var(--primary-color)',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'spin 1s infinite linear'
              }}
            />
            <div style={{ fontWeight: 700 }}>Generating Monthly Attendance Matrix...</div>
          </div>
        ) : filteredSheets.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No employee attendance records found for this period.
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.75rem',
              textAlign: 'center',
              minWidth: `${240 + daysInMonth * 68 + 260}px`
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-subtle)' }}>
                {/* STICKY LEFT EMPLOYEE HEADER */}
                <th
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 4,
                    background: '#f8fafc',
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    minWidth: '220px',
                    width: '220px',
                    borderRight: '2px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontWeight: 800
                  }}
                >
                  Employee &amp; Dept
                </th>

                {/* DAY COLUMNS 1 TO 28/29/30/31 */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const dateObj = new Date(year, month - 1, d);
                  const dow = dateObj.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
                  const isWeekend = isWeeklyOff(dow);
                  const dayLetters = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dow];

                  return (
                    <th
                      key={d}
                      style={{
                        padding: '0.5rem 0.25rem',
                        minWidth: '66px',
                        width: '66px',
                        borderRight: '1px solid #e2e8f0',
                        background: isWeekend ? 'rgba(239, 68, 68, 0.07)' : '#f8fafc',
                        color: isWeekend ? 'var(--danger)' : 'var(--text-primary)'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{d}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, opacity: 0.85 }}>
                        {dayLetters}
                      </div>
                    </th>
                  );
                })}

                {/* FINAL SUMMARY COLUMNS ON THE RIGHT (AS REQUESTED) */}
                <th
                  style={{
                    position: 'sticky',
                    right: 170,
                    zIndex: 3,
                    background: '#f0fdf4',
                    padding: '0.65rem 0.75rem',
                    minWidth: '85px',
                    borderLeft: '2px solid var(--border-subtle)',
                    borderRight: '1px solid #e2e8f0',
                    color: '#166534',
                    fontWeight: 800
                  }}
                >
                  <div>Present</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600 }}>Days</div>
                </th>

                <th
                  style={{
                    position: 'sticky',
                    right: 95,
                    zIndex: 3,
                    background: '#fff1f2',
                    padding: '0.65rem 0.75rem',
                    minWidth: '75px',
                    borderRight: '1px solid #e2e8f0',
                    color: '#9f1239',
                    fontWeight: 800
                  }}
                >
                  <div>Total OT</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600 }}>Hours</div>
                </th>

                <th
                  style={{
                    position: 'sticky',
                    right: 0,
                    zIndex: 4,
                    background: '#eff6ff',
                    padding: '0.65rem 0.85rem',
                    minWidth: '95px',
                    color: '#1e40af',
                    fontWeight: 800,
                    boxShadow: '-3px 0 6px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div>Total Hrs</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600 }}>Worked (30d)</div>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSheets.map((sheet, rIdx) => {
                const emp = sheet.employee;
                const summary = sheet.summary || {};
                const isEven = rIdx % 2 === 0;

                return (
                  <tr
                    key={emp.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: isEven ? '#ffffff' : 'rgba(248, 250, 252, 0.6)'
                    }}
                  >
                    {/* STICKY EMPLOYEE NAME CELL */}
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        background: isEven ? '#ffffff' : '#f8fafc',
                        padding: '0.55rem 0.85rem',
                        textAlign: 'left',
                        borderRight: '2px solid var(--border-subtle)'
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {emp.first_name} {emp.last_name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                          {emp.emp_code}
                        </span>{' '}
                        • {emp.department_name || 'Staff'}
                      </div>
                    </td>

                    {/* DAY CELLS 1 TO 31 */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      const dayData = sheet.days?.[d];
                      const dateObj = new Date(year, month - 1, d);
                      const dow = dateObj.getDay();
                      const isWeekend = isWeeklyOff(dow);

                      if (!dayData) {
                        return (
                          <td
                            key={d}
                            style={{
                              padding: '0.35rem 0.2rem',
                              borderRight: '1px solid #f1f5f9',
                              background: isWeekend ? 'rgba(239, 68, 68, 0.03)' : 'inherit',
                              color: '#cbd5e1'
                            }}
                          >
                            —
                          </td>
                        );
                      }

                      const hasPunch =
                        Boolean(dayData.check_in || dayData.check_in_24) &&
                        dayData.status === 'Present';
                      const otHours = parseFloat(dayData.ot_hours) || 0;
                      const inTime = dayData.check_in_24 || dayData.check_in || '';
                      const outTime = dayData.check_out_24 || dayData.check_out || '';

                      return (
                        <td
                          key={d}
                          style={{
                            padding: '0.35rem 0.2rem',
                            borderRight: '1px solid #f1f5f9',
                            background: isWeekend ? 'rgba(239, 68, 68, 0.03)' : 'inherit',
                            verticalAlign: 'middle'
                          }}
                          title={`Day ${d}: ${dayData.status} ${
                            inTime ? `(${inTime} - ${outTime})` : ''
                          }${otHours > 0 ? ` • ${otHours}h OT` : ''}`}
                        >
                          {hasPunch ? (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1px',
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '4px',
                                padding: '0.2rem 0.25rem',
                                minHeight: '38px',
                                justifyContent: 'center'
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  color: '#15803d',
                                  lineHeight: 1.1,
                                  fontFamily: 'monospace'
                                }}
                              >
                                {inTime}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  color: '#166534',
                                  lineHeight: 1.1,
                                  fontFamily: 'monospace'
                                }}
                              >
                                {outTime || '—'}
                              </div>

                              {otHours > 0 && (
                                <div
                                  style={{
                                    marginTop: '1px',
                                    padding: '0 3px',
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                    borderRadius: '3px',
                                    background: '#fee2e2',
                                    color: '#be123c',
                                    border: '1px solid #fecdd3'
                                  }}
                                >
                                  +{otHours}h OT
                                </div>
                              )}
                            </div>
                          ) : dayData.status === 'Weekend' ? (
                            otHours > 0 && inTime ? (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '1px',
                                  background: '#fff1f2',
                                  border: '1px solid #fecdd3',
                                  borderRadius: '4px',
                                  padding: '0.2rem 0.25rem'
                                }}
                              >
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#be123c' }}>
                                  {inTime}
                                </span>
                                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#be123c' }}>
                                  +{otHours}h OT
                                </span>
                              </div>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.2rem 0.45rem',
                                  borderRadius: '4px',
                                  background: '#f1f5f9',
                                  border: '1px solid #e2e8f0',
                                  color: '#94a3b8',
                                  fontSize: '0.68rem',
                                  fontWeight: 800
                                }}
                              >
                                OFF
                              </span>
                            )
                          ) : dayData.status === 'On Leave' ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.45rem',
                                borderRadius: '4px',
                                background: '#f5f3ff',
                                border: '1px solid #ddd6fe',
                                color: '#7c3aed',
                                fontSize: '0.68rem',
                                fontWeight: 800
                              }}
                            >
                              LVE
                            </span>
                          ) : dayData.status === 'Holiday' ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.45rem',
                                borderRadius: '4px',
                                background: '#fefce8',
                                border: '1px solid #fef08a',
                                color: '#ca8a04',
                                fontSize: '0.68rem',
                                fontWeight: 800
                              }}
                            >
                              HOL
                            </span>
                          ) : dayData.status === 'Absent' ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.45rem',
                                borderRadius: '4px',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                fontSize: '0.68rem',
                                fontWeight: 800
                              }}
                            >
                              ABS
                            </span>
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* RIGHT SUMMARY COLUMNS (EXACT USER REQUIREMENT) */}
                    {/* 1. Present Days */}
                    <td
                      style={{
                        position: 'sticky',
                        right: 170,
                        zIndex: 1,
                        background: isEven ? '#f0fdf4' : '#e6f9ed',
                        padding: '0.55rem 0.5rem',
                        fontWeight: 800,
                        borderLeft: '2px solid var(--border-subtle)',
                        borderRight: '1px solid #e2e8f0',
                        color: '#15803d',
                        fontSize: '0.82rem'
                      }}
                    >
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: '#dcfce7',
                          border: '1px solid #86efac'
                        }}
                      >
                        {summary.present_days || 0}d
                      </span>
                    </td>

                    {/* 2. Total OT Hours */}
                    <td
                      style={{
                        position: 'sticky',
                        right: 95,
                        zIndex: 1,
                        background: isEven ? '#fff1f2' : '#ffe4e6',
                        padding: '0.55rem 0.5rem',
                        fontWeight: 800,
                        borderRight: '1px solid #e2e8f0',
                        color: '#be123c',
                        fontSize: '0.82rem'
                      }}
                    >
                      <span
                        style={{
                          padding: '0.2rem 0.45rem',
                          borderRadius: '4px',
                          background: '#fee2e2',
                          border: '1px solid #fca5a5'
                        }}
                      >
                        {(parseFloat(summary.total_ot_hours) || 0).toFixed(1)}h
                      </span>
                    </td>

                    {/* 3. Final Column: Total hrs Worked based on 30 days */}
                    <td
                      style={{
                        position: 'sticky',
                        right: 0,
                        zIndex: 2,
                        background: isEven ? '#eff6ff' : '#e0f2fe',
                        padding: '0.55rem 0.65rem',
                        fontWeight: 800,
                        color: '#1e40af',
                        fontSize: '0.86rem',
                        boxShadow: '-3px 0 6px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <div
                        style={{
                          padding: '0.25rem 0.55rem',
                          borderRadius: '6px',
                          background: '#dbeafe',
                          border: '1px solid #93c5fd',
                          display: 'inline-block'
                        }}
                      >
                        {(parseFloat(summary.total_work_hours) || 0).toFixed(1)} hrs
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
