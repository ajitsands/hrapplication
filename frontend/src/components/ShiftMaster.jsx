// frontend/src/components/ShiftMaster.jsx

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Moon,
  Sun,
  Split,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  HelpCircle
} from 'lucide-react';

export const ShiftMaster = () => {
  const { showToast, user } = useAuth();
  const isAdminOrHr = user && (user.role === 'admin' || user.role === 'hr');

  const [shifts, setShifts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  // Form State
  const initialForm = {
    code: '',
    name: '',
    shift_type: 'Standard',
    start_time: '08:00',
    end_time: '16:00',
    total_hours: 8.0,
    break_minutes: 60,
    grace_late_in: 15,
    grace_early_out: 15,
    half_day_min_hours: 4.0,
    full_day_min_hours: 7.0,
    is_night_shift: 0,
    split_start_time_2: '',
    split_end_time_2: '',
    color_code: '#0ea5e9',
    is_active: 1
  };
  const [form, setForm] = useState(initialForm);

  const colorPresets = [
    { label: 'Cyan Sky', hex: '#0ea5e9' },
    { label: 'Royal Blue', hex: '#2563eb' },
    { label: 'Amber Sun', hex: '#f59e0b' },
    { label: 'Rose Pink', hex: '#ec4899' },
    { label: 'Purple Night', hex: '#8b5cf6' },
    { label: 'Emerald Green', hex: '#10b981' },
    { label: 'Slate Cool', hex: '#64748b' }
  ];

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const [shiftRes, deptRes] = await Promise.all([
        api.get('/shifts'),
        api.get('/shifts/departments')
      ]);

      if (shiftRes.success) {
        setShifts(shiftRes.data || []);
      }
      if (deptRes.success) {
        setDepartments(deptRes.data || []);
      }
    } catch (err) {
      showToast('Error', 'Failed to load shifts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleOpenAdd = () => {
    setEditingShift(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (shift) => {
    setEditingShift(shift);
    setForm({
      code: shift.code,
      name: shift.name,
      shift_type: shift.shift_type || 'Standard',
      start_time: shift.start_time?.slice(0, 5) || '08:00',
      end_time: shift.end_time?.slice(0, 5) || '16:00',
      total_hours: parseFloat(shift.total_hours) || 8.0,
      break_minutes: parseInt(shift.break_minutes) || 60,
      grace_late_in: parseInt(shift.grace_late_in) || 15,
      grace_early_out: parseInt(shift.grace_early_out) || 15,
      half_day_min_hours: parseFloat(shift.half_day_min_hours) || 4.0,
      full_day_min_hours: parseFloat(shift.full_day_min_hours) || 7.0,
      is_night_shift: parseInt(shift.is_night_shift) || 0,
      split_start_time_2: shift.split_start_time_2?.slice(0, 5) || '',
      split_end_time_2: shift.split_end_time_2?.slice(0, 5) || '',
      color_code: shift.color_code || '#0ea5e9',
      is_active: parseInt(shift.is_active) ?? 1
    });
    setIsModalOpen(true);
  };

  // Recalculate duration automatically when start/end/break changes
  useEffect(() => {
    if (form.start_time && form.end_time) {
      const [sH, sM] = form.start_time.split(':').map(Number);
      const [eH, eM] = form.end_time.split(':').map(Number);
      let sMinutes = sH * 60 + sM;
      let eMinutes = eH * 60 + eM;
      if (eMinutes <= sMinutes) {
        eMinutes += 24 * 60; // next day
      }
      let diff = eMinutes - sMinutes - (parseInt(form.break_minutes) || 0);

      // If split shift
      if (form.shift_type === 'Split' && form.split_start_time_2 && form.split_end_time_2) {
        const [s2H, s2M] = form.split_start_time_2.split(':').map(Number);
        const [e2H, e2M] = form.split_end_time_2.split(':').map(Number);
        let s2Mins = s2H * 60 + s2M;
        let e2Mins = e2H * 60 + e2M;
        if (e2Mins <= s2Mins) e2Mins += 24 * 60;
        diff += (e2Mins - s2Mins);
      }

      const calculatedHours = Math.max(0, +(diff / 60).toFixed(2));
      setForm((prev) => ({ ...prev, total_hours: calculatedHours }));
    }
  }, [form.start_time, form.end_time, form.break_minutes, form.shift_type, form.split_start_time_2, form.split_end_time_2]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.name) {
      showToast('Validation Error', 'Shift Code and Name are required', 'warning');
      return;
    }

    try {
      if (editingShift) {
        const res = await api.put(`/shifts/${editingShift.id}`, form);
        if (res.success) {
          showToast('Updated', 'Shift configuration updated successfully', 'success');
          setIsModalOpen(false);
          fetchShifts();
        } else {
          showToast('Error', res.message || 'Update failed', 'error');
        }
      } else {
        const res = await api.post('/shifts', form);
        if (res.success) {
          showToast('Created', 'New shift added successfully', 'success');
          setIsModalOpen(false);
          fetchShifts();
        } else {
          showToast('Error', res.message || 'Failed to create shift', 'error');
        }
      }
    } catch (err) {
      showToast('Error', err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (shift) => {
    if (shift.code === 'SH-GEN') {
      showToast('Action Denied', 'The default General Shift cannot be deleted.', 'warning');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete shift "${shift.name}" (${shift.code})?`)) {
      return;
    }
    try {
      const res = await api.delete(`/shifts/${shift.id}`);
      if (res.success) {
        showToast('Deleted', 'Shift removed successfully', 'success');
        fetchShifts();
      } else {
        showToast('Error', res.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showToast('Error', err.message || 'Delete failed', 'error');
    }
  };

  const handleUpdateDeptDefault = async (deptId, shiftId) => {
    try {
      const res = await api.post('/shifts/departments', {
        department_id: deptId,
        shift_id: shiftId || null
      });
      if (res.success) {
        showToast('Success', 'Department default shift updated', 'success');
        fetchShifts();
      }
    } catch (err) {
      showToast('Error', 'Failed to update department shift', 'error');
    }
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Action & KPI Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Clock size={22} style={{ color: 'var(--primary)' }} />
            Shift Master &amp; Working Time Policies
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Configure operational shifts, grace tolerances, and Bahrain Law Article 54 night multipliers.
          </p>
        </div>

        {isAdminOrHr && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsDeptModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Building size={16} />
              Department Defaults
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleOpenAdd}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Plus size={16} />
              Create Shift
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #0ea5e9' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sun size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Shifts</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{shifts.length}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Moon size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Night Shifts (1.50x OT)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {shifts.filter((s) => s.is_night_shift == 1).length}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #ec4899' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Split size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Split &amp; Flexible Shifts</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {shifts.filter((s) => s.shift_type === 'Split' || s.shift_type === 'Flexible').length}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Covered Departments</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{departments.length}</div>
          </div>
        </div>
      </div>

      {/* Shifts Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {shifts.map((shift) => {
          const isNight = parseInt(shift.is_night_shift) === 1;
          const isSplit = shift.shift_type === 'Split';

          return (
            <div
              key={shift.id}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderTop: `4px solid ${shift.color_code || '#0ea5e9'}`,
                position: 'relative',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        background: `${shift.color_code || '#0ea5e9'}22`,
                        color: shift.color_code || '#0ea5e9',
                        border: `1px solid ${shift.color_code || '#0ea5e9'}44`
                      }}
                    >
                      {shift.code}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-full)',
                        background: '#f1f5f9',
                        color: '#64748b',
                        fontWeight: 700
                      }}
                    >
                      {shift.shift_type}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {shift.name}
                  </h3>
                </div>

                {isAdminOrHr && (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      className="btn-icon"
                      onClick={() => handleOpenEdit(shift)}
                      title="Edit Shift"
                      style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'transparent', cursor: 'pointer' }}
                    >
                      <Edit2 size={15} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    {shift.code !== 'SH-GEN' && (
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(shift)}
                        title="Delete Shift"
                        style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'transparent', cursor: 'pointer' }}
                      >
                        <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Timing Box */}
              <div
                style={{
                  background: 'rgba(248, 250, 252, 0.85)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Shift Window
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                    {formatTimeDisplay(shift.start_time)}
                    <span style={{ color: 'var(--text-muted)' }}>&rarr;</span>
                    {formatTimeDisplay(shift.end_time)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(37, 99, 235, 0.08)',
                      color: 'var(--primary)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                      fontSize: '0.8rem'
                    }}
                  >
                    {shift.total_hours} hrs
                  </span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {shift.break_minutes}m break
                  </div>
                </div>
              </div>

              {/* Split Secondary Window if Applicable */}
              {isSplit && shift.split_start_time_2 && shift.split_end_time_2 && (
                <div
                  style={{
                    background: 'rgba(236, 72, 153, 0.06)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed rgba(236, 72, 153, 0.3)',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#ec4899', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Split size={14} /> Second Session:
                  </span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatTimeDisplay(shift.split_start_time_2)} &rarr; {formatTimeDisplay(shift.split_end_time_2)}
                  </span>
                </div>
              )}

              {/* Grace Tolerances & Rules */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.78rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 700 }}>Grace Late In:</span>
                  <strong style={{ color: 'var(--text-secondary)' }}>{shift.grace_late_in} mins</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem', fontWeight: 700 }}>Grace Early Out:</span>
                  <strong style={{ color: 'var(--text-secondary)' }}>{shift.grace_early_out} mins</strong>
                </div>
              </div>

              {/* Night OT Banner if Flagged */}
              {isNight && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.12) 100%)',
                    color: '#7c3aed',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    border: '1px solid rgba(139, 92, 246, 0.25)'
                  }}
                >
                  <Moon size={14} />
                  <span>Bahrain Art. 54: 1.50x Night OT Premium</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT SHIFT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingShift ? `Edit Shift: ${editingShift.name}` : 'Create New Shift Definition'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Shift Code *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. SH-NGT"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="form-group">
              <label>Shift Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Night Support Shift"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label>Shift Type</label>
              <select
                className="form-control"
                value={form.shift_type}
                onChange={(e) => setForm({ ...form, shift_type: e.target.value })}
              >
                <option value="Standard">Standard Shift</option>
                <option value="Night">Night Shift</option>
                <option value="Split">Split Shift</option>
                <option value="Flexible">Flexible / Custom</option>
              </select>
            </div>

            <div className="form-group">
              <label>Start Time *</label>
              <input
                type="time"
                className="form-control"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time *</label>
              <input
                type="time"
                className="form-control"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Break Time (Mins)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.break_minutes}
                onChange={(e) => setForm({ ...form, break_minutes: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Split Shift Optional Second Session */}
          {form.shift_type === 'Split' && (
            <div
              style={{
                background: 'rgba(236, 72, 153, 0.05)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed #ec4899',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}
            >
              <div className="form-group">
                <label style={{ color: '#be185d' }}>Split Session 2 Start</label>
                <input
                  type="time"
                  className="form-control"
                  value={form.split_start_time_2}
                  onChange={(e) => setForm({ ...form, split_start_time_2: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label style={{ color: '#be185d' }}>Split Session 2 End</label>
                <input
                  type="time"
                  className="form-control"
                  value={form.split_end_time_2}
                  onChange={(e) => setForm({ ...form, split_end_time_2: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Computed Standard Working Hours */}
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Standard Shift Duration (Auto-Calculated):
            </span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>{form.total_hours} Hours</strong>
          </div>

          {/* Grace Tolerances */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Grace Late In (Mins)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.grace_late_in}
                onChange={(e) => setForm({ ...form, grace_late_in: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Grace Early Out (Mins)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.grace_early_out}
                onChange={(e) => setForm({ ...form, grace_early_out: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Half Day Min (Hrs)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                className="form-control"
                value={form.half_day_min_hours}
                onChange={(e) => setForm({ ...form, half_day_min_hours: parseFloat(e.target.value) || 4.0 })}
              />
            </div>
            <div className="form-group">
              <label>Full Day Min (Hrs)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                className="form-control"
                value={form.full_day_min_hours}
                onChange={(e) => setForm({ ...form, full_day_min_hours: parseFloat(e.target.value) || 7.0 })}
              />
            </div>
          </div>

          {/* Bahrain Night Shift Overtime Flag */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <input
              type="checkbox"
              id="is_night_shift_chk"
              checked={form.is_night_shift === 1}
              onChange={(e) => setForm({ ...form, is_night_shift: e.target.checked ? 1 : 0 })}
              style={{ width: '18px', height: '18px', accentColor: '#8b5cf6', cursor: 'pointer' }}
            />
            <label htmlFor="is_night_shift_chk" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Flag as Night Shift (Applies 1.50x Bahrain Labor Law Article 54 Overtime Multiplier)
            </label>
          </div>

          {/* Color Code Swatch Picker */}
          <div className="form-group">
            <label>Badge Color Palette</label>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.35rem' }}>
              {colorPresets.map((c) => (
                <div
                  key={c.hex}
                  onClick={() => setForm({ ...form, color_code: c.hex })}
                  title={c.label}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: c.hex,
                    cursor: 'pointer',
                    border: form.color_code === c.hex ? '3px solid #0f172a' : '2px solid transparent',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.15s ease',
                    transform: form.color_code === c.hex ? 'scale(1.15)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingShift ? 'Save Changes' : 'Create Shift'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DEPARTMENT DEFAULT SHIFTS MODAL */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Department Default Shift Assignments"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Employees without an individual schedule or roster will automatically follow their department's default shift.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {departments.map((dept) => (
              <div
                key={dept.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{dept.name}</strong>
                </div>

                <select
                  className="form-control"
                  style={{ width: '220px', padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                  value={dept.default_shift_id || ''}
                  onChange={(e) => handleUpdateDeptDefault(dept.id, e.target.value)}
                >
                  <option value="">— Select Shift —</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setIsDeptModalOpen(false)}>
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
