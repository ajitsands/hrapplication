// frontend/src/components/ShiftRosterCalendar.jsx

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import {
  CalendarDays,
  Filter,
  CheckCircle2,
  Users,
  Building,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  Download
} from 'lucide-react';

export const ShiftRosterCalendar = () => {
  const { showToast, user, settings } = useAuth();
  const isAdminOrHr = user && (user.role === 'admin' || user.role === 'hr');

  const weeklyOffSetting = settings?.weekly_off_days || 'Friday,Saturday';
  const dayNameToIndex = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
  const dayNameToIso = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
  const configuredOffDow = weeklyOffSetting.split(',').map((s) => dayNameToIndex[s.trim()]).filter((n) => n !== undefined);
  const isWeeklyOff = (dow) => configuredOffDow.includes(dow);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDept, setSelectedDept] = useState('');
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [rosterData, setRosterData] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState(31);
  const [loading, setLoading] = useState(true);

  // Cell Single Edit Modal
  const [isCellModalOpen, setIsCellModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState(null);

  // Bulk Scheduler Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    department_id: '',
    employee_ids: [],
    start_date: '',
    end_date: '',
    shift_id: '',
    is_off_day: false,
    auto_weekends_off: true,
    notes: 'Monthly Department Roster Rotation'
  });

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const [rosterRes, shiftRes, deptRes] = await Promise.all([
        api.get('/shifts/roster', { month, year, department_id: selectedDept }),
        api.get('/shifts', { active_only: 1 }),
        api.get('/employees/departments')
      ]);

      if (rosterRes.success) {
        setRosterData(rosterRes.data.roster || []);
        setDaysInMonth(rosterRes.data.days_in_month || 31);
      }
      if (shiftRes.success) {
        setShifts(shiftRes.data || []);
      }
      if (deptRes.success) {
        setDepartments(deptRes.data || []);
      }
    } catch (err) {
      showToast('Error', 'Failed to load shift roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [month, year, selectedDept]);

  // Handle month prev/next navigation
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

  // Open single cell edit
  const handleCellClick = (emp, dayNum, dayEntry) => {
    if (!isAdminOrHr) return;
    setActiveCell({
      employee: emp,
      dayNum,
      dayEntry,
      shift_id: dayEntry.shift_id || '',
      is_off_day: !!dayEntry.is_off_day,
      notes: dayEntry.notes || ''
    });
    setIsCellModalOpen(true);
  };

  const handleSaveCell = async (e) => {
    e.preventDefault();
    if (!activeCell) return;

    try {
      const res = await api.post('/shifts/roster/cell', {
        employee_id: activeCell.employee.id,
        date: activeCell.dayEntry.date,
        shift_id: activeCell.is_off_day ? null : activeCell.shift_id || null,
        is_off_day: activeCell.is_off_day ? 1 : 0,
        notes: activeCell.notes
      });

      if (res.success) {
        showToast('Updated', `Roster updated for ${activeCell.employee.first_name} on Day ${activeCell.dayNum}`, 'success');
        setIsCellModalOpen(false);
        fetchRoster();
      } else {
        showToast('Error', res.message || 'Update failed', 'error');
      }
    } catch (err) {
      showToast('Error', err.message || 'Update failed', 'error');
    }
  };

  // Open Bulk Scheduler
  const handleOpenBulk = () => {
    const sDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const eDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    const allEmpIds = rosterData.map((r) => r.employee.id);

    setBulkForm({
      department_id: selectedDept || '',
      employee_ids: allEmpIds,
      start_date: sDate,
      end_date: eDate,
      shift_id: shifts[0]?.id || '',
      is_off_day: false,
      auto_weekends_off: true,
      notes: 'Monthly Department Roster Rotation'
    });
    setIsBulkModalOpen(true);
  };

  const downloadAttendanceTemplate = () => {
    let csvContent = 'Employee Code,Date,Check In,Check Out,Status,Manual OT Hours\r\n';
    const today = new Date().toISOString().slice(0, 10);
    
    if (rosterData && rosterData.length > 0) {
      rosterData.forEach((emp, i) => {
        const inTime = i % 2 === 0 ? '08:00' : '08:30';
        const outTime = i % 2 === 0 ? '16:00' : '17:30';
        const ot = i % 2 === 0 ? '0' : '1.0';
        csvContent += `${emp.emp_code},${today},${inTime},${outTime},Present,${ot}\r\n`;
      });
    } else {
      csvContent += `EMP-001,${today},08:00,16:00,Present,0\r\n`;
      csvContent += `EMP-002,${today},08:00,18:30,Present,2.5\r\n`;
      csvContent += `EMP-003,${today},08:15,16:15,Present,0\r\n`;
      csvContent += `EMP-004,${today},08:00,16:00,Present,0\r\n`;
      csvContent += `EMP-005,${today},00:00,00:00,Absent,0\r\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Biometric_Attendance_Template_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Success', 'Biometric attendance CSV template downloaded', 'success');
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulkForm.start_date || !bulkForm.end_date || bulkForm.employee_ids.length === 0) {
      showToast('Validation Error', 'Please select date range and target employees', 'warning');
      return;
    }

    try {
      const offDaysOfWeek = bulkForm.auto_weekends_off
        ? weeklyOffSetting.split(',').map((s) => dayNameToIso[s.trim()]).filter(Boolean)
        : [];
      const res = await api.post('/shifts/roster/bulk', {
        employee_ids: bulkForm.employee_ids,
        start_date: bulkForm.start_date,
        end_date: bulkForm.end_date,
        shift_id: bulkForm.is_off_day ? null : bulkForm.shift_id || null,
        is_off_day: bulkForm.is_off_day ? 1 : 0,
        off_days_of_week: offDaysOfWeek,
        notes: bulkForm.notes
      });

      if (res.success) {
        showToast('Bulk Roster Applied', res.message || 'Roster successfully applied', 'success');
        setIsBulkModalOpen(false);
        fetchRoster();
      } else {
        showToast('Error', res.message || 'Bulk assignment failed', 'error');
      }
    } catch (err) {
      showToast('Error', err.message || 'Bulk assignment failed', 'error');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Filter & Control Strip */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Month / Year Navigator */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              className="btn-icon"
              onClick={handlePrevMonth}
              title="Previous Month"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: '130px', textAlign: 'center', color: 'var(--text-primary)' }}>
              {monthNames[month - 1]} {year}
            </span>
            <button
              className="btn-icon"
              onClick={handleNextMonth}
              title="Next Month"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-control"
              style={{ width: '200px', fontSize: '0.85rem' }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isAdminOrHr && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleOpenBulk}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Layers size={15} />
              Bulk Shift Scheduler
            </button>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={downloadAttendanceTemplate}
            title="Download CSV Attendance Template pre-filled with staff codes"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}
          >
            <Download size={15} />
            Download CSV Template
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchRoster}
            title="Refresh Roster Grid"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCcw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* Shifts Legend Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '0.5rem 1rem',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem'
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Shift Legend:</span>
        {shifts.map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: s.color_code || '#0ea5e9'
              }}
            />
            <strong style={{ color: 'var(--text-primary)' }}>{s.code}:</strong> {s.name} ({s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)})
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#94a3b8' }} />
          <strong style={{ color: '#64748b' }}>OFF:</strong> Scheduled Rest Day
        </div>
      </div>

      {/* Monthly Roster Matrix Table */}
      <div
        className="card"
        style={{
          padding: '0',
          overflowX: 'auto',
          border: '1px solid var(--border-subtle)',
          position: 'relative'
        }}
      >
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading Monthly Shift Roster...
          </div>
        ) : rosterData.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No active employees found for the selected department.
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.78rem',
              textAlign: 'center'
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border-subtle)' }}>
                {/* Sticky Left Employee Header */}
                <th
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                    background: '#f8fafc',
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    minWidth: '220px',
                    borderRight: '2px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontWeight: 800
                  }}
                >
                  Employee &amp; Dept
                </th>

                {/* Day Columns 1 to 31 */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const dateObj = new Date(year, month - 1, d);
                  const dow = dateObj.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
                  const isWeekend = isWeeklyOff(dow);
                  const dayLetters = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dow];

                  return (
                    <th
                      key={d}
                      style={{
                        padding: '0.5rem 0.35rem',
                        minWidth: '38px',
                        borderRight: '1px solid #e2e8f0',
                        background: isWeekend ? 'rgba(239, 68, 68, 0.06)' : '#f8fafc',
                        color: isWeekend ? 'var(--danger)' : 'var(--text-primary)'
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>{d}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, opacity: 0.8 }}>{dayLetters}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {rosterData.map((row, rIdx) => {
                const emp = row.employee;

                return (
                  <tr
                    key={emp.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: rIdx % 2 === 0 ? '#ffffff' : 'rgba(248, 250, 252, 0.5)'
                    }}
                  >
                    {/* Sticky Employee Name Cell */}
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        background: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        padding: '0.65rem 1rem',
                        textAlign: 'left',
                        borderRight: '2px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                        {emp.first_name} {emp.last_name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span>{emp.emp_code}</span>
                        <span>&bull;</span>
                        <span>{emp.department_name}</span>
                      </div>
                    </td>

                    {/* Day Cells */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                      const entry = row.days[d] || {};
                      const dateObj = new Date(year, month - 1, d);
                      const isWeekend = isWeeklyOff(dateObj.getDay());
                      const isOff = !!entry.is_off_day;

                      return (
                        <td
                          key={d}
                          onClick={() => handleCellClick(emp, d, entry)}
                          title={`${emp.first_name} - Day ${d}: ${isOff ? 'REST DAY' : entry.shift_name || 'General Shift'}`}
                          style={{
                            padding: '0.35rem 0.2rem',
                            borderRight: '1px solid #e2e8f0',
                            background: isWeekend ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                            cursor: isAdminOrHr ? 'pointer' : 'default',
                            userSelect: 'none'
                          }}
                        >
                          <div
                            style={{
                              padding: '0.25rem 0.15rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              background: isOff ? '#f1f5f9' : `${entry.color_code || '#0ea5e9'}22`,
                              color: isOff ? '#64748b' : entry.color_code || '#0ea5e9',
                              border: `1px solid ${isOff ? '#cbd5e1' : `${entry.color_code || '#0ea5e9'}55`}`,
                              transition: 'transform 0.1s ease',
                              minHeight: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {isOff ? 'OFF' : entry.shift_code ? entry.shift_code.replace('SH-', '') : 'GEN'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* SINGLE CELL QUICK EDIT MODAL */}
      <Modal
        isOpen={isCellModalOpen}
        onClose={() => setIsCellModalOpen(false)}
        title={activeCell ? `Schedule Shift: ${activeCell.employee.first_name} ${activeCell.employee.last_name}` : 'Schedule Shift'}
        size="sm"
      >
        {activeCell && (
          <form onSubmit={handleSaveCell} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <div><strong>Date:</strong> {activeCell.dayEntry.date} (Day {activeCell.dayNum})</div>
              <div><strong>Department:</strong> {activeCell.employee.department_name}</div>
            </div>

            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: activeCell.is_off_day ? 'rgba(100, 116, 139, 0.12)' : '#f8fafc',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <input
                type="checkbox"
                id="is_off_day_cell"
                checked={activeCell.is_off_day}
                onChange={(e) => setActiveCell({ ...activeCell, is_off_day: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#64748b', cursor: 'pointer' }}
              />
              <label htmlFor="is_off_day_cell" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                Mark as Rest Day / Day Off (OFF)
              </label>
            </div>

            {!activeCell.is_off_day && (
              <div className="form-group">
                <label>Assigned Shift *</label>
                <select
                  className="form-control"
                  value={activeCell.shift_id}
                  onChange={(e) => setActiveCell({ ...activeCell, shift_id: e.target.value })}
                  required
                >
                  <option value="">— Select Shift —</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name} ({s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Roster Notes (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Swapped with Rahul"
                value={activeCell.notes}
                onChange={(e) => setActiveCell({ ...activeCell, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsCellModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Apply Schedule
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* BULK ROSTER SCHEDULER MODAL */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Shift & Roster Scheduler"
        size="md"
      >
        <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', marginTop: '-0.25rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Need biometric CSV template with staff codes?</span>
            <button
              type="button"
              className="btn btn-xs btn-outline-primary"
              onClick={downloadAttendanceTemplate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.25rem 0.6rem', fontWeight: 700 }}
            >
              <Download size={12} /> Download CSV Template
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Assign a recurring shift rotation or mark rest days across date ranges for entire departments or groups.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Effective Start Date *</label>
              <input
                type="date"
                className="form-control"
                value={bulkForm.start_date}
                onChange={(e) => setBulkForm({ ...bulkForm, start_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Effective End Date *</label>
              <input
                type="date"
                className="form-control"
                value={bulkForm.end_date}
                onChange={(e) => setBulkForm({ ...bulkForm, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: bulkForm.is_off_day ? 'rgba(100, 116, 139, 0.12)' : '#f8fafc',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <input
              type="checkbox"
              id="bulk_is_off_day"
              checked={bulkForm.is_off_day}
              onChange={(e) => setBulkForm({ ...bulkForm, is_off_day: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#64748b', cursor: 'pointer' }}
            />
            <label htmlFor="bulk_is_off_day" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
              Mark entire range as Scheduled Rest Days (Days Off)
            </label>
          </div>

          {!bulkForm.is_off_day && (
            <div className="form-group">
              <label>Shift to Assign *</label>
              <select
                className="form-control"
                value={bulkForm.shift_id}
                onChange={(e) => setBulkForm({ ...bulkForm, shift_id: e.target.value })}
                required
              >
                <option value="">— Select Shift —</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name} ({s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Auto Friday/Saturday Off */}
          {!bulkForm.is_off_day && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <input
                type="checkbox"
                id="auto_weekends"
                checked={bulkForm.auto_weekends_off}
                onChange={(e) => setBulkForm({ ...bulkForm, auto_weekends_off: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#ef4444', cursor: 'pointer' }}
              />
              <label htmlFor="auto_weekends" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#b91c1c', margin: 0 }}>
                Automatically preserve configured rest days ({weeklyOffSetting}) as Rest Days (OFF)
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Execute Bulk Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
