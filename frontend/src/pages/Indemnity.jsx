// frontend/src/pages/Indemnity.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import {
  Award,
  Calculator,
  Printer,
  FileCheck2,
  Calendar,
  DollarSign,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Indemnity = () => {
  const { formatCurrency, formatDate, showToast, settings } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [pastRecords, setPastRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [exitDate, setExitDate] = useState(new Date().toISOString().slice(0, 10));
  const [unusedLeaveDays, setUnusedLeaveDays] = useState(0);
  const [otherDues, setOtherDues] = useState(0);
  const [manualDeductions, setManualDeductions] = useState(0);
  const [reason, setReason] = useState('Contract Completion');

  // Calculation Result
  const [calcResult, setCalcResult] = useState(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, indRes] = await Promise.all([
        api.get('/employees'),
        api.get('/indemnity')
      ]);

      if (empRes.success) setEmployees(empRes.data);
      if (indRes.success) setPastRecords(indRes.data);
    } catch (err) {
      showToast('Error', 'Failed to load indemnity records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCalculate = async (save = false) => {
    if (!selectedEmpId) {
      showToast('Error', 'Please select an employee to calculate Indemnity / EOSB', 'error');
      return;
    }

    try {
      const res = await api.post('/indemnity/calculate', {
        employee_id: selectedEmpId,
        exit_date: exitDate,
        unused_leave_days: unusedLeaveDays,
        other_dues: otherDues,
        deductions: manualDeductions,
        reason: reason,
        save_record: save
      });

      if (res.success) {
        setCalcResult(res.data);
        if (save) {
          showToast('Settlement Saved', 'End of service settlement recorded!', 'success');
          confetti({ particleCount: 70, spread: 50 });
          fetchData();
        }
      }
    } catch (err) {
      showToast('Calculation Error', err.message || 'Failed to calculate indemnity', 'error');
    }
  };

  const selectedEmployeeObj = employees.find((e) => String(e.id) === String(selectedEmpId));

  const columns = [
    {
      header: 'Employee',
      accessor: 'first_name',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.first_name} {row.last_name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.emp_code} • {row.department_name}</div>
        </div>
      )
    },
    {
      header: 'Service Duration',
      accessor: 'service_years',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>
          {row.service_years}y {row.service_months}m {row.service_days}d
        </span>
      )
    },
    {
      header: 'Last Basic',
      accessor: 'last_basic_salary',
      render: (row) => formatCurrency(row.last_basic_salary)
    },
    {
      header: 'Indemnity Amount',
      accessor: 'total_indemnity',
      render: (row) => <strong style={{ color: 'var(--primary)' }}>{formatCurrency(row.total_indemnity)}</strong>
    },
    {
      header: 'Leave Encashment',
      accessor: 'leave_encashment_amount',
      render: (row) => formatCurrency(row.leave_encashment_amount)
    },
    {
      header: 'Final Settlement',
      accessor: 'final_settlement_amount',
      render: (row) => (
        <span style={{ fontWeight: 900, color: 'var(--success)' }}>
          {formatCurrency(row.final_settlement_amount)}
        </span>
      )
    },
    {
      header: 'Reason / Status',
      accessor: 'reason',
      render: (row) => (
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{row.reason}</div>
          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{row.status}</span>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>Indemnity & End of Service (EOSB) Settlement Engine</h2>
          <p>Bahrain Labor Law standard: 15 days/yr (first 3 years) &amp; 30 days/yr (&gt;3 years) with leave salary encashment</p>
        </div>
      </div>

      {/* Main Grid: Calculator Form + Output Certificate */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left: Interactive Calculation Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Calculator size={18} color="var(--primary)" />
              <span>Gratuity / Indemnity Calculator</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Select Employee</label>
            <select
              className="form-control"
              value={selectedEmpId}
              onChange={(e) => {
                setSelectedEmpId(e.target.value);
                setCalcResult(null);
              }}
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.emp_code} - {emp.first_name} {emp.last_name} ({emp.nationality})
                </option>
              ))}
            </select>
          </div>

          {selectedEmployeeObj && (
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem', fontSize: '0.82rem' }}>
              <div><strong>Joining Date:</strong> {formatDate(selectedEmployeeObj.date_of_joining)}</div>
              <div><strong>Last Basic Salary:</strong> {formatCurrency(selectedEmployeeObj.basic_salary)}</div>
              <div><strong>CPR / National ID:</strong> {selectedEmployeeObj.cpr_no}</div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Exit / Termination Date</label>
              <input
                type="date"
                className="form-control"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Departure Reason</label>
              <select
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="Contract Completion">Contract Completion</option>
                <option value="Resignation">Resignation</option>
                <option value="Termination">Termination by Employer</option>
                <option value="Retirement">Retirement</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Unused Leave Balance (Days)</label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                placeholder="For Leave Salary encashment"
                value={unusedLeaveDays}
                onChange={(e) => setUnusedLeaveDays(parseFloat(e.target.value || 0))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Other Dues / Bonus ({settings.currency})</label>
              <input
                type="number"
                step="0.001"
                className="form-control"
                value={otherDues}
                onChange={(e) => setOtherDues(parseFloat(e.target.value || 0))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Other Deductions / Damages ({settings.currency})</label>
            <input
              type="number"
              step="0.001"
              className="form-control"
              value={manualDeductions}
              onChange={(e) => setManualDeductions(parseFloat(e.target.value || 0))}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleCalculate(false)}>
              <Calculator size={16} /> Compute Gratuity
            </button>
            <button className="btn btn-gold" style={{ flex: 1 }} onClick={() => handleCalculate(true)}>
              <FileCheck2 size={16} /> Save Settlement Record
            </button>
          </div>
        </div>

        {/* Right: Real-Time Bahrain Law Breakdown Certificate */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Award size={18} color="var(--accent-gold)" />
              <span>Bahrain Law Indemnity Statement</span>
            </div>
            {calcResult && (
              <button className="btn btn-secondary btn-sm" onClick={() => setIsCertificateModalOpen(true)}>
                <Printer size={14} /> Print Certificate
              </button>
            )}
          </div>

          {calcResult ? (
            <div style={{ fontSize: '0.875rem' }}>
              {/* Service Details */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Service Period:</span>
                  <strong>{calcResult.service_duration.years} Years, {calcResult.service_duration.months} Months, {calcResult.service_duration.days} Days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Last Basic Wage:</span>
                  <strong>{formatCurrency(calcResult.last_basic_salary)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Daily Basic Rate:</span>
                  <span>{formatCurrency(calcResult.daily_rate)}</span>
                </div>
              </div>

              {/* Tiers Breakdown */}
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem 0.85rem', background: '#f1f5f9', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  Statutory Gratuity Tiers (Law No. 36/2012)
                </div>
                <table className="breakdown-table">
                  <tbody>
                    <tr>
                      <td>
                        Tier 1 (First {calcResult.tier1.max_years} Years @ {calcResult.tier1.rate_days} days/yr):
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{calcResult.tier1.accumulated_days} accumulated days</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(calcResult.tier1.amount)}</td>
                    </tr>
                    <tr>
                      <td>
                        Tier 2 (After {calcResult.tier1.max_years} Years @ {calcResult.tier2.rate_days} days/yr):
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{calcResult.tier2.accumulated_days} accumulated days</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(calcResult.tier2.amount)}</td>
                    </tr>
                    <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                      <td>TOTAL INDEMNITY (EOSB)</td>
                      <td style={{ textAlign: 'right', color: 'var(--primary)' }}>{formatCurrency(calcResult.total_indemnity)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Dues and Deductions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.65rem', background: '#ecfdf5', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>LEAVE SALARY ENCASHMENT</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }}>
                    +{formatCurrency(calcResult.leave_salary_encashment.amount)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#065f46' }}>{calcResult.leave_salary_encashment.unused_leave_days} unused days</div>
                </div>

                <div style={{ padding: '0.65rem', background: '#fef2f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 700 }}>TOTAL DEDUCTIONS</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--danger)' }}>
                    -{formatCurrency(calcResult.deductions.total_deductions)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#991b1b' }}>Loan + Manual dues</div>
                </div>
              </div>

              {/* Net Final Settlement */}
              <div className="payslip-net-box">
                <div className="net-label">FINAL NET SETTLEMENT:</div>
                <div className="net-amount-highlight">{formatCurrency(calcResult.final_settlement_amount)}</div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
              <Award size={48} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
              <p style={{ fontWeight: 600 }}>Select an employee and click "Compute Gratuity" to see detailed statutory breakdown.</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Settlement Records */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileCheck2 size={18} color="var(--primary)" />
            <span>End of Service Settlement Records ({pastRecords.length})</span>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={pastRecords}
          searchPlaceholder="Search past settlements..."
        />
      </div>

      {/* PRINTABLE FINAL SETTLEMENT CERTIFICATE MODAL */}
      <Modal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        title="Final Settlement & Indemnity Certificate"
        size="lg"
        footer={
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
            <button className="btn btn-secondary" onClick={() => setIsCertificateModalOpen(false)}>Close</button>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={15} /> Print Certificate
            </button>
          </div>
        }
      >
        {calcResult && (
          <div className="payslip-a5-container">
            <div className="payslip-header-grid">
              <div className="payslip-company-info">
                <h2>{settings.company_name}</h2>
                <p>{settings.company_address}</p>
                <p>CR No: {settings.cr_no} | Tel: {settings.company_phone}</p>
              </div>
              <div className="payslip-title-badge">
                <h3>FINAL SETTLEMENT</h3>
                <div className="payslip-period-pill">EOSB Certificate</div>
              </div>
            </div>

            <table className="payslip-emp-meta-table">
              <tbody>
                <tr>
                  <td className="meta-label">Employee:</td>
                  <td><strong>{calcResult.employee.first_name} {calcResult.employee.last_name} ({calcResult.employee.emp_code})</strong></td>
                  <td className="meta-label">CPR / National ID:</td>
                  <td>{calcResult.employee.cpr_no}</td>
                </tr>
                <tr>
                  <td className="meta-label">Date of Joining:</td>
                  <td>{formatDate(calcResult.joining_date)}</td>
                  <td className="meta-label">Last Working Day:</td>
                  <td>{formatDate(calcResult.exit_date)}</td>
                </tr>
                <tr>
                  <td className="meta-label">Total Continuous Service:</td>
                  <td><strong>{calcResult.service_duration.years} Years, {calcResult.service_duration.months} Months, {calcResult.service_duration.days} Days</strong></td>
                  <td className="meta-label">Last Basic Salary:</td>
                  <td><strong>{formatCurrency(calcResult.last_basic_salary)}</strong></td>
                </tr>
              </tbody>
            </table>

            <div className="payslip-breakdown-grid">
              <div className="breakdown-box">
                <div className="breakdown-box-title">Indemnity & Accrued Dues</div>
                <table className="breakdown-table">
                  <tbody>
                    <tr>
                      <td>Tier 1 Service ({calcResult.tier1.accumulated_days} days)</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(calcResult.tier1.amount)}</td>
                    </tr>
                    <tr>
                      <td>Tier 2 Service ({calcResult.tier2.accumulated_days} days)</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(calcResult.tier2.amount)}</td>
                    </tr>
                    <tr>
                      <td>Leave Salary Encashment ({calcResult.leave_salary_encashment.unused_leave_days} days)</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(calcResult.leave_salary_encashment.amount)}</td>
                    </tr>
                    {calcResult.other_dues > 0 && (
                      <tr>
                        <td>Other Dues / Bonus</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(calcResult.other_dues)}</td>
                      </tr>
                    )}
                    <tr className="breakdown-total-row">
                      <td><strong>TOTAL ACCRUED DUES</strong></td>
                      <td style={{ textAlign: 'right', color: 'var(--primary)' }}><strong>{formatCurrency(calcResult.total_indemnity + calcResult.leave_salary_encashment.amount + calcResult.other_dues)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="breakdown-box">
                <div className="breakdown-box-title">Deductions & Recoveries</div>
                <table className="breakdown-table">
                  <tbody>
                    <tr>
                      <td>Outstanding Loans / Salary Advances</td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)' }}>-{formatCurrency(calcResult.deductions.loan_outstanding)}</td>
                    </tr>
                    <tr>
                      <td>Notice Period / Other Deductions</td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)' }}>-{formatCurrency(calcResult.deductions.manual_deductions)}</td>
                    </tr>
                    <tr className="breakdown-total-row">
                      <td><strong>TOTAL RECOVERIES</strong></td>
                      <td style={{ textAlign: 'right', color: 'var(--danger)' }}><strong>-{formatCurrency(calcResult.deductions.total_deductions)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="payslip-net-box">
              <div className="net-label">FINAL SETTLEMENT PAYABLE:</div>
              <div className="net-amount-highlight">{formatCurrency(calcResult.final_settlement_amount)}</div>
            </div>

            <div className="payslip-signatures">
              <div className="sig-block">
                <div>Employer Signatory & Stamp</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{settings.company_name}</div>
              </div>
              <div className="sig-block">
                <div>Employee Clearance Signature</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Full & Final Settlement Received</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
