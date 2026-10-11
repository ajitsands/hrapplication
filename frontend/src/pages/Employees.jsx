// frontend/src/pages/Employees.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import {
  Users,
  UserPlus,
  FileText,
  Edit,
  Trash2,
  Paperclip,
  Upload,
  AlertTriangle,
  CheckCircle,
  Eye,
  Plus,
  ShieldAlert,
  Building,
  CreditCard,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Employees = () => {
  const { formatCurrency, formatDate, showToast, confirmAction, settings } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [employeeDocs, setEmployeeDocs] = useState([]);
  const [docLoading, setDocLoading] = useState(false);

  // Form State for Onboarding / Edit
  const initialForm = {
    emp_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    nationality: 'Bahraini',
    is_gcc_citizen: 1,
    cpr_no: '',
    cpr_expiry: '',
    passport_no: '',
    passport_expiry: '',
    visa_no: '',
    visa_expiry: '',
    driving_license_no: '',
    driving_license_expiry: '',
    insurance_no: '',
    insurance_expiry: '',
    gosi_no: '',
    lmra_no: '',
    department_id: '',
    designation_id: '',
    date_of_joining: new Date().toISOString().slice(0, 10),
    employment_type: 'Full-Time',
    status: 'Active',
    basic_salary: 0,
    housing_allowance: 0,
    transport_allowance: 0,
    car_allowance: 0,
    mobile_allowance: 0,
    food_allowance: 0,
    other_allowance: 0,
    bank_name: 'National Bank of Bahrain (NBB)',
    iban: '',
    bank_account_no: '',
    create_user_account: true,
    user_password: 'password123'
  };

  const [formData, setFormData] = useState(initialForm);

  // Document Upload State
  const [docForm, setDocForm] = useState({
    doc_type: 'CPR',
    doc_name: '',
    issue_date: '',
    expiry_date: '',
    notes: '',
    file: null
  });

  // Department creation state
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes, desigRes] = await Promise.all([
        api.get('/employees', { department_id: selectedDept, status: selectedStatus }),
        api.get('/employees/departments'),
        api.get('/employees/designations')
      ]);

      if (empRes.success) setEmployees(empRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (desigRes.success) setDesignations(desigRes.data);
    } catch (err) {
      showToast('Error', 'Failed to fetch employee records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept, selectedStatus]);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;

    if (name === 'nationality') {
      const isGcc = value.toLowerCase() === 'bahraini' || value.toLowerCase() === 'saudi' || value.toLowerCase() === 'emirati' || value.toLowerCase() === 'kuwaiti' || value.toLowerCase() === 'omani' || value.toLowerCase() === 'qatari';
      setFormData((prev) => ({ ...prev, [name]: val, is_gcc_citizen: isGcc ? 1 : 0 }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const calculateGross = (f) => {
    return (
      parseFloat(f.basic_salary || 0) +
      parseFloat(f.housing_allowance || 0) +
      parseFloat(f.transport_allowance || 0) +
      parseFloat(f.car_allowance || 0) +
      parseFloat(f.mobile_allowance || 0) +
      parseFloat(f.food_allowance || 0) +
      parseFloat(f.other_allowance || 0)
    );
  };

  // Open Onboard Modal
  const openOnboardModal = () => {
    setCurrentEmployee(null);
    setFormData({
      ...initialForm,
      department_id: departments.length > 0 ? departments[0].id : '',
      designation_id: designations.length > 0 ? designations[0].id : ''
    });
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (emp) => {
    setCurrentEmployee(emp);
    setFormData({
      ...emp,
      basic_salary: parseFloat(emp.basic_salary || 0),
      housing_allowance: parseFloat(emp.housing_allowance || 0),
      transport_allowance: parseFloat(emp.transport_allowance || 0),
      car_allowance: parseFloat(emp.car_allowance || 0),
      mobile_allowance: parseFloat(emp.mobile_allowance || 0),
      food_allowance: parseFloat(emp.food_allowance || 0),
      other_allowance: parseFloat(emp.other_allowance || 0),
      create_user_account: false
    });
    setIsFormModalOpen(true);
  };

  // Submit Onboarding / Update Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (!formData.first_name || !formData.last_name || !formData.cpr_no) {
        showToast('Validation Error', 'First Name, Last Name, and CPR/National ID are mandatory.', 'error');
        return;
      }

      if (currentEmployee) {
        // Update
        const res = await api.put(`/employees/${currentEmployee.id}`, formData);
        if (res.success) {
          showToast('Updated', 'Employee records successfully updated!', 'success');
          setIsFormModalOpen(false);
          fetchData();
        }
      } else {
        // Create Onboard
        const res = await api.post('/employees', formData);
        if (res.success) {
          showToast('Success', `Employee ${formData.first_name} onboarded successfully!`, 'success');
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          setIsFormModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to save employee details', 'error');
    }
  };

  // Delete Employee
  const handleDeleteEmployee = (emp) => {
    confirmAction({
      title: 'Delete Employee Record?',
      message: `Are you sure you want to delete ${emp.first_name} ${emp.last_name} (${emp.emp_code})? This will also remove associated documents, attendance, and payroll records.`,
      confirmText: 'Yes, Delete',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await api.delete(`/employees/${emp.id}`);
          if (res.success) {
            showToast('Deleted', 'Employee removed successfully.', 'info');
            fetchData();
          }
        } catch (err) {
          showToast('Error', err.message || 'Failed to delete employee', 'error');
        }
      }
    });
  };

  // Open Document Vault
  const openDocVault = async (emp) => {
    setCurrentEmployee(emp);
    setIsDocModalOpen(true);
    setDocForm({
      doc_type: 'Passport',
      doc_name: `${emp.first_name} Document`,
      issue_date: '',
      expiry_date: '',
      notes: '',
      file: null
    });
    fetchEmployeeDocs(emp.id);
  };

  const fetchEmployeeDocs = async (empId) => {
    try {
      setDocLoading(true);
      const res = await api.get(`/documents/employee/${empId}`);
      if (res.success) {
        setEmployeeDocs(res.data);
      }
    } catch (err) {
      showToast('Error', 'Failed to fetch employee documents', 'error');
    } finally {
      setDocLoading(false);
    }
  };

  // Upload Document
  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docForm.doc_name) {
      showToast('Error', 'Please enter a document name.', 'error');
      return;
    }

    try {
      const data = new FormData();
      data.append('employee_id', currentEmployee.id);
      data.append('doc_type', docForm.doc_type);
      data.append('doc_name', docForm.doc_name);
      data.append('issue_date', docForm.issue_date);
      data.append('expiry_date', docForm.expiry_date);
      data.append('notes', docForm.notes);
      if (docForm.file) {
        data.append('file', docForm.file);
      }

      const res = await api.post('/documents/upload', data);
      if (res.success) {
        showToast('Attached', 'Document successfully uploaded and attached!', 'success');
        fetchEmployeeDocs(currentEmployee.id);
        fetchData();
        setDocForm({
          doc_type: 'CPR',
          doc_name: '',
          issue_date: '',
          expiry_date: '',
          notes: '',
          file: null
        });
      }
    } catch (err) {
      showToast('Upload Error', err.message || 'Failed to upload document', 'error');
    }
  };

  // Delete Document
  const handleDeleteDoc = async (docId) => {
    try {
      const res = await api.delete(`/documents/${docId}`);
      if (res.success) {
        showToast('Removed', 'Document removed from vault', 'info');
        fetchEmployeeDocs(currentEmployee.id);
        fetchData();
      }
    } catch (err) {
      showToast('Error', 'Failed to remove document', 'error');
    }
  };

  // Open Profile Modal
  const openProfileView = (emp) => {
    setCurrentEmployee(emp);
    setIsProfileModalOpen(true);
  };

  // Save new department
  const handleSaveDept = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/employees/departments', newDept);
      if (res.success) {
        showToast('Success', `Department ${newDept.name} created!`, 'success');
        setIsDeptModalOpen(false);
        setNewDept({ name: '', code: '', description: '' });
        fetchData();
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to create department', 'error');
    }
  };

  // Columns definition for DataTable
  const columns = [
    {
      header: 'Code / Name',
      accessor: 'emp_code',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: row.is_gcc_citizen ? 'var(--accent-gold-light)' : 'var(--primary-light)',
              color: row.is_gcc_citizen ? 'var(--accent-gold)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            {row.first_name[0]}{row.last_name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {row.first_name} {row.last_name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {row.emp_code} • {row.nationality}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'CPR / Expiry',
      accessor: 'cpr_no',
      sortable: true,
      render: (row) => {
        const days = row.cpr_days_left;
        const isUrgent = days !== null && days <= 30;
        const isWarning = days !== null && days <= 60;

        return (
          <div>
            <div style={{ fontWeight: 600 }}>{row.cpr_no}</div>
            {row.cpr_expiry ? (
              <div style={{ fontSize: '0.75rem' }}>
                <span className={`badge ${isUrgent ? 'badge-expiry-urgent' : isWarning ? 'badge-expiry-warning' : 'badge-expiry-safe'}`}>
                  {formatDate(row.cpr_expiry)} ({days}d)
                </span>
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No expiry</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Passport / Visa Expiry',
      accessor: 'passport_no',
      render: (row) => {
        const pDays = row.passport_days_left;
        const vDays = row.visa_days_left;

        return (
          <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
            <div>
              <strong>Passport:</strong> {row.passport_no || 'N/A'}{' '}
              {row.passport_expiry && (
                <span className={`badge ${pDays <= 30 ? 'badge-danger' : pDays <= 60 ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                  {formatDate(row.passport_expiry)}
                </span>
              )}
            </div>
            <div>
              <strong>Visa/LMRA:</strong> {row.is_gcc_citizen ? 'Citizen Exempt' : (row.visa_no || 'Pending')}{' '}
              {!row.is_gcc_citizen && row.visa_expiry && (
                <span className={`badge ${vDays <= 30 ? 'badge-danger' : vDays <= 60 ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.65rem' }}>
                  {formatDate(row.visa_expiry)}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Dept & Designation',
      accessor: 'department_name',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.department_name || 'General'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.designation_name || 'Staff'}</div>
        </div>
      )
    },
    {
      header: 'Gross Salary (BHD)',
      accessor: 'basic_salary',
      sortable: true,
      render: (row) => {
        const gross = calculateGross(row);
        return (
          <div>
            <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(gross)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Basic: {formatCurrency(row.basic_salary)}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => (
        <span className={`badge ${row.status === 'Active' ? 'badge-success' : row.status === 'On Leave' ? 'badge-warning' : 'badge-danger'}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => openProfileView(row)} title="View Profile">
            <Eye size={14} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => openDocVault(row)} title="Document & Attachment Vault">
            <Paperclip size={14} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => openEditModal(row)} title="Edit Employee">
            <Edit size={14} />
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEmployee(row)} title="Delete Employee">
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h2>Employee Directory & Onboarding</h2>
          <p>Comprehensive profile management, Gulf identification expiries, allowances, and attachment vault</p>
        </div>

        <div className="header-action-group">
          <button className="btn btn-secondary" onClick={() => setIsDeptModalOpen(true)}>
            <Building size={16} /> Add Department
          </button>
          <button className="btn btn-primary" onClick={openOnboardModal}>
            <UserPlus size={16} /> Onboard New Employee
          </button>
        </div>
      </div>

      {/* Main Employee Table */}
      <DataTable
        columns={columns}
        data={employees}
        searchPlaceholder="Search by CPR, Passport, Name, Code, Email..."
        extraToolbar={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Resigned">Resigned</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        }
      />

      {/* 1. ONBOARDING & EDIT EMPLOYEE MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={currentEmployee ? `Edit Employee Details: ${currentEmployee.first_name} ${currentEmployee.last_name}` : 'Onboard New Employee (Bahrain / Gulf Compliant)'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmitForm}>
              {currentEmployee ? 'Save Changes' : 'Complete Onboarding'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm}>
          {/* Section 1: Basic Information */}
          <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '1rem' }}>
              <Users size={18} /> 1. Personal & Contact Details
            </h4>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">First Name</label>
              <input type="text" name="first_name" className="form-control" required value={formData.first_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label required">Last Name</label>
              <input type="text" name="last_name" className="form-control" required value={formData.last_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Employee Code</label>
              <input type="text" name="emp_code" className="form-control" placeholder="Auto-generated if blank (e.g. EMP-006)" value={formData.emp_code} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number (Bahrain / Gulf)</label>
              <input type="text" name="phone" className="form-control" placeholder="+973 3900 0000" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nationality</label>
              <input type="text" name="nationality" className="form-control" placeholder="Bahraini, Indian, Filipino, Saudi, etc." value={formData.nationality} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Citizen / GCC Status</label>
              <select name="is_gcc_citizen" className="form-control" value={formData.is_gcc_citizen} onChange={handleChange}>
                <option value={1}>Bahraini / GCC Citizen (GOSI Citizen Rate: {settings.gosi_citizen_emp_rate}%)</option>
                <option value={0}>Expatriate (GOSI Expat Rate: {settings.gosi_expat_emp_rate}% + LMRA)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" name="dob" className="form-control" value={formData.dob || ''} onChange={handleChange} />
            </div>
          </div>

          {/* Section 2: Identification & Document Expiry Tracking */}
          <div style={{ margin: '1.25rem 0 0.75rem 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', fontSize: '1rem' }}>
              <CreditCard size={18} /> 2. Identification Numbers & Expiry Dates (Auto-Reminders)
            </h4>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">CPR / National ID No</label>
              <input type="text" name="cpr_no" className="form-control" required placeholder="e.g. 880415982" value={formData.cpr_no} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">CPR Expiry Date</label>
              <input type="date" name="cpr_expiry" className="form-control" value={formData.cpr_expiry || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">GOSI Number</label>
              <input type="text" name="gosi_no" className="form-control" placeholder="GOSI-984210" value={formData.gosi_no} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Passport Number</label>
              <input type="text" name="passport_no" className="form-control" placeholder="Passport Booklet No" value={formData.passport_no} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Passport Expiry Date</label>
              <input type="date" name="passport_expiry" className="form-control" value={formData.passport_expiry || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">LMRA Number / Work Permit</label>
              <input type="text" name="lmra_no" className="form-control" placeholder="LMRA Permit No" value={formData.lmra_no} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Visa / Residence Permit No</label>
              <input type="text" name="visa_no" className="form-control" placeholder="Residence Sticker / EVisa" value={formData.visa_no} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Visa Expiry Date</label>
              <input type="date" name="visa_expiry" className="form-control" value={formData.visa_expiry || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Driving License Expiry</label>
              <input type="date" name="driving_license_expiry" className="form-control" value={formData.driving_license_expiry || ''} onChange={handleChange} />
            </div>
          </div>

          {/* Section 3: Employment & Position */}
          <div style={{ margin: '1.25rem 0 0.75rem 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '1rem' }}>
              <Briefcase size={18} /> 3. Department, Designation & Joining
            </h4>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select name="department_id" className="form-control" value={formData.department_id} onChange={handleChange}>
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <select name="designation_id" className="form-control" value={formData.designation_id} onChange={handleChange}>
                <option value="">Select Designation</option>
                {designations.map((des) => (
                  <option key={des.id} value={des.id}>{des.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Joining</label>
              <input type="date" name="date_of_joining" className="form-control" required value={formData.date_of_joining} onChange={handleChange} />
            </div>
          </div>

          {/* Section 4: Bahrain Salary Structure & Gulf Allowances */}
          <div style={{ margin: '1.25rem 0 0.75rem 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--success)', fontSize: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} /> 4. Salary Structure ({settings.currency || 'BHD'})
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 800 }}>
                Total Gross: {formatCurrency(calculateGross(formData))}
              </span>
            </h4>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Basic Salary ({settings.currency})</label>
              <input type="number" step="0.001" name="basic_salary" className="form-control" required value={formData.basic_salary} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Housing Allowance (HR)</label>
              <input type="number" step="0.001" name="housing_allowance" className="form-control" value={formData.housing_allowance} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Transport Allowance</label>
              <input type="number" step="0.001" name="transport_allowance" className="form-control" value={formData.transport_allowance} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Car Allowance</label>
              <input type="number" step="0.001" name="car_allowance" className="form-control" value={formData.car_allowance} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Phone Allowance</label>
              <input type="number" step="0.001" name="mobile_allowance" className="form-control" value={formData.mobile_allowance} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Food Allowance</label>
              <input type="number" step="0.001" name="food_allowance" className="form-control" value={formData.food_allowance} onChange={handleChange} />
            </div>
          </div>

          {/* Section 5: Banking & Portal Login */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input type="text" name="bank_name" className="form-control" placeholder="NBB, BBK, AUB, etc." value={formData.bank_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">IBAN Number</label>
              <input type="text" name="iban" className="form-control" placeholder="BH29NBOB..." value={formData.iban} onChange={handleChange} />
            </div>
          </div>

          {!currentEmployee && (
            <div style={{ marginTop: '1rem', padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" name="create_user_account" checked={formData.create_user_account} onChange={handleChange} />
                <span>Create employee self-service login account (Username will be Employee Code)</span>
              </label>
            </div>
          )}
        </form>
      </Modal>

      {/* 2. DOCUMENT & ATTACHMENT VAULT MODAL */}
      <Modal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title={`Attachment & Document Vault: ${currentEmployee?.first_name} ${currentEmployee?.last_name} (${currentEmployee?.emp_code})`}
        size="lg"
      >
        <div>
          {/* Upload Document Form */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Upload size={16} /> Upload New Attachment (Passport, CPR, Visa, Contract, Certificates)
            </h4>
            <form onSubmit={handleUploadDoc}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Document Category</label>
                  <select
                    className="form-control"
                    value={docForm.doc_type}
                    onChange={(e) => setDocForm({ ...docForm, doc_type: e.target.value })}
                  >
                    <option value="CPR">CPR / National ID</option>
                    <option value="Passport">Passport Copy</option>
                    <option value="Visa">LMRA Residence Visa</option>
                    <option value="Contract">Employment Contract</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Insurance">Health Insurance Card</option>
                    <option value="Certificate">Degree / Professional Certificate</option>
                    <option value="Offer Letter">Offer Letter</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Document Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Scanned Passport Bio Page"
                    value={docForm.doc_name}
                    onChange={(e) => setDocForm({ ...docForm, doc_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date (For Auto Reminder)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={docForm.expiry_date}
                    onChange={(e) => setDocForm({ ...docForm, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Upload File (PDF / Images)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setDocForm({ ...docForm, file: e.target.files[0] })}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Upload size={14} /> Attach & Save
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Existing Documents List */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Attached Documents ({employeeDocs.length})</h4>
          
          {docLoading ? (
            <p>Loading documents...</p>
          ) : employeeDocs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {employeeDocs.map((doc) => {
                const days = doc.days_left;
                const isUrgent = days !== null && days <= 30;
                const isWarning = days !== null && days <= 60;

                return (
                  <div
                    key={doc.id}
                    style={{
                      padding: '0.75rem 1rem',
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={22} color="var(--primary)" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{doc.doc_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Category: <strong>{doc.doc_type}</strong> • Uploaded: {formatDate(doc.created_at)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {doc.expiry_date ? (
                        <span className={`badge ${isUrgent ? 'badge-expiry-urgent' : isWarning ? 'badge-expiry-warning' : 'badge-expiry-safe'}`}>
                          Expiry: {formatDate(doc.expiry_date)} ({days}d)
                        </span>
                      ) : (
                        <span className="badge badge-info">No Expiry</span>
                      )}

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteDoc(doc.id)}
                        title="Remove document"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No attachments uploaded for this employee yet.
            </div>
          )}
        </div>
      </Modal>

      {/* 3. PROFILE VIEW MODAL */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={`Employee Profile: ${currentEmployee?.first_name} ${currentEmployee?.last_name}`}
        size="lg"
      >
        {currentEmployee && (
          <div>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                {currentEmployee.first_name[0]}{currentEmployee.last_name[0]}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  {currentEmployee.first_name} {currentEmployee.last_name}
                </h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {currentEmployee.emp_code} • {currentEmployee.designation_name} ({currentEmployee.department_name})
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 700 }}>Gulf Identification</h4>
                <p><strong>CPR / National ID:</strong> {currentEmployee.cpr_no} (Exp: {formatDate(currentEmployee.cpr_expiry)})</p>
                <p><strong>Passport No:</strong> {currentEmployee.passport_no || 'N/A'} (Exp: {formatDate(currentEmployee.passport_expiry)})</p>
                <p><strong>LMRA Visa No:</strong> {currentEmployee.visa_no || 'N/A'} (Exp: {formatDate(currentEmployee.visa_expiry)})</p>
                <p><strong>GOSI Reg No:</strong> {currentEmployee.gosi_no || 'N/A'}</p>
                <p><strong>Nationality:</strong> {currentEmployee.nationality} ({currentEmployee.is_gcc_citizen ? 'GCC Citizen' : 'Expat'})</p>
              </div>

              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontWeight: 700 }}>Salary & Bank Structure</h4>
                <p><strong>Basic Salary:</strong> {formatCurrency(currentEmployee.basic_salary)}</p>
                <p><strong>Housing Allowance:</strong> {formatCurrency(currentEmployee.housing_allowance)}</p>
                <p><strong>Transport Allowance:</strong> {formatCurrency(currentEmployee.transport_allowance)}</p>
                <p><strong>Total Gross Monthly:</strong> <strong>{formatCurrency(calculateGross(currentEmployee))}</strong></p>
                <p><strong>Bank:</strong> {currentEmployee.bank_name || 'N/A'} ({currentEmployee.iban || 'No IBAN'})</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 4. ADD DEPARTMENT MODAL */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Create New Department"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsDeptModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveDept}>Create</button>
          </>
        }
      >
        <form onSubmit={handleSaveDept}>
          <div className="form-group">
            <label className="form-label required">Department Name</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Legal & Compliance"
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label required">Department Code</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. LEG"
              value={newDept.code}
              onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={newDept.description}
              onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
