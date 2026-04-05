import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Physics', 'Mathematics', 'Chemistry'];

export default function Students() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
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
  ];

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    const res = await axios.get('http://localhost:5000/api/students', { headers });
    setStudents(res.data.data.filter(s => !user.department || s.department === user.department));
  };

  const handleAdd = async () => {
    if (!form.studentId || !form.name || !form.email || !form.rollNumber || !form.department) return setMessage('Fill all required fields!');
    try {
      await axios.post('http://localhost:5000/api/students', form, { headers });
      setMessage('Student added!'); setShowModal(false);
      setForm({ studentId: '', name: '', email: '', rollNumber: '', department: user?.department || '', semester: 1, section: '', phone: '' });
      fetchStudents();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage(err.response?.data?.message || 'Error!'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await axios.delete(`http://localhost:5000/api/students/${id}`, { headers });
    fetchStudents();
  };

  const atRisk = students.length; // placeholder
  const inputStyle = { width: '100%', background: '#f2f4f6', border: 'none', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined';} .group:hover .group-action{opacity:1!important;}`}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fb', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>

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
                  transform: active ? 'translateX(4px)' : 'none'
                }}
                  onMouseOver={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
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
        <main style={{ marginLeft: '256px', flex: 1, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* Top Bar */}
          <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(195,198,215,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#737686', fontSize: '20px' }}>search</span>
              <input placeholder="Search students, departments, or IDs..." style={{ width: '100%', background: '#f2f4f6', border: '2px solid transparent', borderRadius: '16px', padding: '12px 80px 12px 48px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button style={{ position: 'relative', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#5c647a', borderRadius: '12px' }}>
                <span className="material-symbols-outlined">notifications</span>
                <span style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', background: '#ba1a1a', borderRadius: '50%', border: '2px solid white' }}></span>
              </button>
              <button style={{ padding: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#5c647a', borderRadius: '12px' }}>
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid rgba(195,198,215,0.3)' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{user?.name}</p>
                  <p style={{ fontSize: '11px', color: '#737686' }}>Head of Department</p>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' }}>
                  {user?.name?.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1600px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Manrope', color: '#191c1e', letterSpacing: '-0.5px' }}>Student Registry</h2>
                <p style={{ color: '#737686', fontWeight: '500', marginTop: '4px' }}>Manage and monitor {user?.department} department student records.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ background: '#f2f4f6', color: '#434655', border: '1px solid rgba(195,198,215,0.5)', padding: '12px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>inventory_2</span> Batch Actions
                </button>
                <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg, #004ac6, #2563eb)', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,74,198,0.2)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span> ADD STUDENT
                </button>
              </div>
            </div>

            {message && <div style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '13px', background: message.includes('Error') || message.includes('Fill') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') || message.includes('Fill') ? '#dc2626' : '#16a34a' }}>{message}</div>}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { label: 'Total Enrolled', value: students.length, icon: 'groups', color: '#004ac6', bg: 'rgba(0,74,198,0.05)' },
                { label: 'Active This Sem', value: `${students.length > 0 ? '100' : '0'}%`, icon: 'verified_user', color: '#006243', bg: 'rgba(0,98,67,0.05)' },
                { label: 'At Risk Status', value: '—', icon: 'priority_high', color: '#ba1a1a', bg: 'rgba(186,26,26,0.05)' },
                { label: 'New Registrations', value: students.length, icon: 'trending_up', color: '#004ac6', bg: 'rgba(0,74,198,0.05)' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid transparent', transition: 'border 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = s.color + '20'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{s.icon}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '600', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
                    <p style={{ fontSize: '22px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e', marginTop: '2px' }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(195,198,215,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #f2f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e' }}>Master Registry</h3>
                  <div style={{ width: '1px', height: '16px', background: '#c3c6d7' }}></div>
                  <span style={{ fontSize: '13px', color: '#737686' }}>Showing {students.length} students</span>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f2f4f6', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#434655' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>file_download</span> Export CSV
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(242,244,246,0.3)' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left', width: '40px' }}><input type="checkbox" /></th>
                      {['Student ID', 'Full Name', 'Department', 'Status', 'Section', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '16px 24px', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No students found</td></tr>
                    ) : students.map((s, i) => (
                      <tr key={s._id} className="group" style={{ borderTop: '1px solid #f2f4f6', transition: 'background 0.15s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(242,244,246,0.3)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px 24px' }}><input type="checkbox" /></td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: '#004ac6' }}>#{s.studentId}</span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dae2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#004ac6', flexShrink: 0 }}>
                              {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: '13px', fontWeight: '700', color: '#191c1e' }}>{s.name}</p>
                              <p style={{ fontSize: '11px', color: '#737686' }}>{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: '#191c1e' }}>{s.department}</p>
                          <p style={{ fontSize: '10px', color: '#737686', fontWeight: '700', textTransform: 'uppercase' }}>Sem {s.semester}</p>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(0,98,67,0.1)', color: '#006243', border: '1px solid rgba(0,98,67,0.2)' }}>On Track</span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '500', color: '#191c1e' }}>{s.section || '—'}</td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div className="group-action" style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', opacity: 0, transition: 'opacity 0.2s' }}>
                            <button style={{ padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent', color: '#737686' }}
                              onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,74,198,0.1)'; e.currentTarget.style.color = '#004ac6'; }}
                              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#737686'; }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                            </button>
                            <button onClick={() => handleDelete(s._id)} style={{ padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent', color: '#737686' }}
                              onMouseOver={e => { e.currentTarget.style.background = 'rgba(186,26,26,0.1)'; e.currentTarget.style.color = '#ba1a1a'; }}
                              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#737686'; }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f2f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                <p style={{ fontSize: '12px', color: '#737686' }}>Showing 1 to {students.length} of {students.length} entries</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {['first_page', 'chevron_left'].map(icon => (
                    <button key={icon} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#737686' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
                    </button>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f2f4f6', borderRadius: '8px', padding: '2px' }}>
                    <button style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#004ac6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>1</button>
                  </div>
                  {['chevron_right', 'last_page'].map(icon => (
                    <button key={icon} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#737686' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(19,27,46,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '640px', borderRadius: '16px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #f2f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Manrope', color: '#191c1e' }}>Add New Student</h2>
                  <p style={{ fontSize: '13px', color: '#737686', marginTop: '2px' }}>Fill in the student details to register them.</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', color: '#737686' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {[
                    { label: 'Student ID *', key: 'studentId', placeholder: 'STU004' },
                    { label: 'Full Name *', key: 'name', placeholder: 'John Doe' },
                    { label: 'Email *', key: 'email', placeholder: 'john@university.edu', type: 'email' },
                    { label: 'Roll Number *', key: 'rollNumber', placeholder: 'CS-24-004' },
                    { label: 'Section', key: 'section', placeholder: 'A, B, or C' },
                    { label: 'Phone', key: 'phone', placeholder: '+91 9876543210' },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>{label}</label>
                      <input type={type || 'text'} placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Department *</label>
                    <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={inputStyle}>
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Semester *</label>
                    <select value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })} style={inputStyle}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
                {message && <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: '#fef2f2', color: '#dc2626' }}>{message}</div>}
              </div>
              <div style={{ padding: '16px 32px', background: '#f2f4f6', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#434655' }}>CANCEL</button>
                <button onClick={handleAdd} style={{ padding: '12px 32px', borderRadius: '12px', background: '#004ac6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,74,198,0.2)' }}>SAVE STUDENT</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}