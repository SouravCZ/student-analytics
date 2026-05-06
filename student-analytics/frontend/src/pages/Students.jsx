import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Physics', 'Mathematics', 'Chemistry'];
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Students() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [form, setForm] = useState({ studentId: '', name: '', email: '', rollNumber: '', department: user?.department || '', semester: 1, section: '', phone: '' });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Students', path: '/students', icon: 'group' },
    { label: 'Attendance', path: '/attendance', icon: 'calendar_today' },
    { label: 'Performance', path: '/performance', icon: 'analytics' },
    { label: 'Alerts', path: '/alerts', icon: 'warning' },
    { label: 'Reports', path: '/reports', icon: 'description' },
    { label: 'ML Insights', path: '/ml-insights', icon: 'smart_toy' },
  ];

  useEffect(() => { fetchStudents(); fetchRegisteredUsers(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API}/api/students`, { headers });
      setStudents(res.data.data.filter(s => !user.department || s.department === user.department));
    } catch (err) { console.log(err); }
  };

  const fetchRegisteredUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/auth/users`, { headers });
      setRegisteredUsers(res.data.data || []);
    } catch (err) { console.log(err); }
  };

  const handleAdd = async () => {
    if (!form.studentId || !form.name || !form.email || !form.rollNumber || !form.department)
      return setMessage('Fill all required fields!');
    try {
      setMessage('Adding student, please wait...');
      await axios.post(`${API}/api/students`, form, { headers });
      setMessage('Student added successfully!');
      setShowModal(false);
      setForm({ studentId: '', name: '', email: '', rollNumber: '', department: user?.department || '', semester: 1, section: '', phone: '' });
      await fetchStudents();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error adding student!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await axios.delete(`${API}/api/students/${id}`, { headers });
    fetchStudents();
  };

  const inputStyle = { width: '100%', background: '#f2f4f6', border: 'none', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined';} .row-hover:hover{background:rgba(242,244,246,0.5)!important;} .action-btn{opacity:0;transition:opacity 0.2s;} .row-hover:hover .action-btn{opacity:1;}`}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fb', fontFamily: 'Inter, sans-serif' }}>

        {/* Sidebar */}
        <aside style={{ width: '256px', height: '100vh', position: 'fixed', left: 0, top: 0, background: '#131B2E', display: 'flex', flexDirection: 'column', padding: '24px', zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>analytics</span>
            </div>
            <div>
              <h1 style={{ color: 'white', fontWeight: '900', fontSize: '16px', fontFamily: 'Manrope' }}>HOD Analytics</h1>
              <p style={{ color: '#64748b', fontSize: '11px' }}>Department Portal</p>
            </div>
          </div>
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => {
              const active = window.location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  border: 'none', cursor: 'pointer', borderRadius: '8px', textAlign: 'left',
                  background: active ? 'rgba(37,99,235,0.2)' : 'transparent',
                  color: active ? 'white' : '#94a3b8', fontSize: '14px', fontWeight: active ? '700' : '400',
                  fontFamily: 'Inter', transition: 'all 0.2s',
                }}
                  onMouseOver={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  onMouseOut={e => !active && (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', cursor: 'pointer', borderRadius: '8px', background: 'transparent', color: '#94a3b8', fontSize: '14px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>help</span> Help Center
            </button>
            <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', cursor: 'pointer', borderRadius: '8px', background: 'transparent', color: '#ba1a1a', fontSize: '14px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span> Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft: '256px', flex: 1, height: '100vh', overflowY: 'auto' }}>

          {/* Top Bar */}
          <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px' }}>search</span>
              <input placeholder="Search students, departments, or IDs..." style={{ width: '100%', background: '#f2f4f6', border: 'none', borderRadius: '12px', padding: '10px 16px 10px 44px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button style={{ position: 'relative', padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '8px' }}>
                <span className="material-symbols-outlined">notifications</span>
                <span style={{ position: 'absolute', top: '8px', right: '8px', width: '7px', height: '7px', background: '#ba1a1a', borderRadius: '50%', border: '2px solid white' }}></span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{user?.name}</p>
                  <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Head of Department</p>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #004ac6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px', boxShadow: '0 2px 8px rgba(0,74,198,0.3)' }}>
                  {user?.name?.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Manrope', color: '#0f172a', letterSpacing: '-0.5px' }}>Student Registry</h2>
                <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>Manage and monitor {user?.department || 'all'} department student records.</p>
              </div>
              <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #004ac6, #2563eb)', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(0,74,198,0.25)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span> Add Student
              </button>
            </div>

            {message && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', background: message.includes('Error') || message.includes('Fill') ? '#fef2f2' : message.includes('wait') ? '#fffbeb' : '#f0fdf4', color: message.includes('Error') || message.includes('Fill') ? '#dc2626' : message.includes('wait') ? '#d97706' : '#16a34a', border: `1px solid ${message.includes('Error') || message.includes('Fill') ? '#fca5a5' : message.includes('wait') ? '#fcd34d' : '#86efac'}` }}>
                {message}
              </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {[
                { label: 'Total Enrolled', value: students.length, icon: 'groups', color: '#004ac6', bg: '#eff6ff' },
                { label: 'Registered Users', value: registeredUsers.length, icon: 'how_to_reg', color: '#7c3aed', bg: '#f5f3ff' },
                { label: 'Active This Sem', value: `${students.length > 0 ? '100' : '0'}%`, icon: 'verified_user', color: '#006243', bg: '#ecfdf5' },
                { label: 'At Risk', value: '—', icon: 'priority_high', color: '#ba1a1a', bg: '#fef2f2' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{s.icon}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                    <p style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'Manrope', color: '#0f172a', marginTop: '2px' }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '0' }}>
              {[
                { key: 'students', label: 'Student Registry', count: students.length, icon: 'group' },
                { key: 'users', label: 'Registered Users', count: registeredUsers.length, icon: 'how_to_reg' },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                  border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                  background: 'transparent', borderBottom: activeTab === tab.key ? '2px solid #004ac6' : '2px solid transparent',
                  color: activeTab === tab.key ? '#004ac6' : '#64748b', marginBottom: '-2px', borderRadius: '8px 8px 0 0',
                  transition: 'all 0.2s'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
                  {tab.label}
                  <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', background: activeTab === tab.key ? '#dae2fd' : '#f1f5f9', color: activeTab === tab.key ? '#004ac6' : '#94a3b8' }}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Student Registry Table */}
            {activeTab === 'students' && (
              <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'Manrope', color: '#0f172a' }}>Master Registry</h3>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Showing {students.length} students</p>
                  </div>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>file_download</span> Export CSV
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '14px 24px', textAlign: 'left', width: '40px' }}><input type="checkbox" /></th>
                        {['Student ID', 'Full Name', 'Department', 'Status', 'Section', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '14px 24px', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr><td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>group_off</span>
                          No students found. Add your first student.
                        </td></tr>
                      ) : students.map((s) => (
                        <tr key={s._id} className="row-hover" style={{ borderTop: '1px solid #f8fafc', transition: 'background 0.15s' }}>
                          <td style={{ padding: '16px 24px' }}><input type="checkbox" /></td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: '#004ac6', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>#{s.studentId}</span>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #dae2fd, #eff6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#004ac6', flexShrink: 0 }}>
                                {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{s.name}</p>
                                <p style={{ fontSize: '11px', color: '#94a3b8' }}>{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{s.department}</p>
                            <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Sem {s.semester}</p>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#ecfdf5', color: '#006243', border: '1px solid #d1fae5' }}>Active</span>
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '13px', color: '#475569' }}>{s.section || '—'}</td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <div className="action-btn" style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                              <button style={{ padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#eff6ff', color: '#004ac6' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                              </button>
                              <button onClick={() => handleDelete(s._id)} style={{ padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#fef2f2', color: '#ba1a1a' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>Showing 1 to {students.length} of {students.length} entries</p>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['chevron_left', 'chevron_right'].map(icon => (
                      <button key={icon} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Registered Users Table */}
            {activeTab === 'users' && (
              <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'Manrope', color: '#0f172a' }}>Registered Users</h3>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Students who have self-registered via the public portal</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f3ff', padding: '6px 14px', borderRadius: '9999px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#7c3aed' }}>info</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed' }}>Use this to add them to the Student Registry</span>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['User', 'Email', 'Role', 'Department', 'Registered On', 'Action'].map(h => (
                        <th key={h} style={{ padding: '14px 24px', textAlign: h === 'Action' ? 'right' : 'left', fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsers.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>how_to_reg</span>
                        No users have registered yet
                      </td></tr>
                    ) : registeredUsers.map((u, i) => (
                      <tr key={i} className="row-hover" style={{ borderTop: '1px solid #f8fafc' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: u.role === 'admin' ? '#dae2fd' : '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: u.role === 'admin' ? '#004ac6' : '#7c3aed', flexShrink: 0 }}>
                              {u.name?.charAt(0)}
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{u.name}</p>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>{u.email}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', background: u.role === 'admin' ? '#dae2fd' : '#f5f3ff', color: u.role === 'admin' ? '#004ac6' : '#7c3aed', textTransform: 'capitalize' }}>{u.role}</span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>{u.department || '—'}</td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: '#94a3b8' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          {u.role !== 'admin' && (
                            <button onClick={() => {
                              setForm(f => ({ ...f, name: u.name, email: u.email, department: u.department || '' }));
                              setShowModal(true);
                              setActiveTab('students');
                            }} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#004ac6', color: 'white', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span> Add to Registry
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* Add Student Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '640px', borderRadius: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #004ac6, #2563eb)' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Manrope', color: 'white' }}>Add New Student</h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Fill in the student details to register them in the portal.</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ padding: '8px', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', borderRadius: '8px', color: 'white' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {[
                    { label: 'Student ID *', key: 'studentId', placeholder: 'e.g. STU004' },
                    { label: 'Full Name *', key: 'name', placeholder: 'e.g. John Doe' },
                    { label: 'Email *', key: 'email', placeholder: 'john@university.edu', type: 'email' },
                    { label: 'Roll Number *', key: 'rollNumber', placeholder: 'e.g. CS-24-004' },
                    { label: 'Section', key: 'section', placeholder: 'A, B, or C' },
                    { label: 'Phone', key: 'phone', placeholder: '+91 9876543210' },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>{label}</label>
                      <input type={type || 'text'} placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Department *</label>
                    <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={inputStyle}>
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Semester *</label>
                    <select value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })} style={inputStyle}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
                {message && <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: message.includes('wait') ? '#fffbeb' : '#fef2f2', color: message.includes('wait') ? '#d97706' : '#dc2626', fontWeight: '600' }}>{message}</div>}
              </div>
              <div style={{ padding: '16px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#475569' }}>Cancel</button>
                <button onClick={handleAdd} style={{ padding: '12px 32px', borderRadius: '10px', background: 'linear-gradient(135deg, #004ac6, #2563eb)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,74,198,0.25)' }}>Save Student</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}