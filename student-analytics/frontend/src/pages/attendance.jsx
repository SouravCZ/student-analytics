import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Attendance() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [summary, setSummary] = useState([]);
  const [activeTab, setActiveTab] = useState('mark');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Students', path: '/students', icon: 'groups' },
    { label: 'Attendance', path: '/attendance', icon: 'calendar_today' },
    { label: 'Performance', path: '/performance', icon: 'monitoring' },
    { label: 'Alerts', path: '/alerts', icon: 'notifications_active' },
    { label: 'Reports', path: '/reports', icon: 'description' },
  ];

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students', { headers });
      const studentList = res.data.data.filter(s => !user.department || s.department === user.department);
      setStudents(studentList);
      const initial = {};
      studentList.forEach(s => initial[s._id] = 'Present');
      setAttendance(initial);
    } catch (err) { console.log(err); }
  };

  const fetchSummary = async () => {
    try {
      const summaries = await Promise.all(
        students.map(s => axios.get(`http://localhost:5000/api/attendance/summary/${s._id}`, { headers }))
      );
      setSummary(students.map((s, i) => ({
        name: s.name, rollNumber: s.rollNumber,
        ...summaries[i].data.data
      })));
    } catch (err) { console.log(err); }
  };

  const handleSubmit = async () => {
    if (!subject) return setMessage('Please enter a subject!');
    setLoading(true);
    try {
      await Promise.all(
        students.map(s => axios.post('http://localhost:5000/api/attendance', {
          studentId: s._id, subject, date, status: attendance[s._id] || 'Present'
        }, { headers }))
      );
      setMessage('Attendance submitted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error submitting attendance!'); }
    finally { setLoading(false); }
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => updated[s._id] = status);
    setAttendance(updated);
  };

  const statusConfig = {
    Present: { bg: '#006243', color: 'white' },
    Absent: { bg: '#ba1a1a', color: 'white' },
    Late: { bg: '#f59e0b', color: 'white' },
  };

  const presentCount = Object.values(attendance).filter(v => v === 'Present').length;
  const absentCount = Object.values(attendance).filter(v => v === 'Absent').length;
  const lateCount = Object.values(attendance).filter(v => v === 'Late').length;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined';}`}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fb', fontFamily: 'Inter, sans-serif' }}>

        {/* Sidebar */}
        <aside style={{ width: '256px', height: '100vh', background: '#131B2E', display: 'flex', flexDirection: 'column', padding: '24px', position: 'sticky', top: 0, flexShrink: 0 }}>
          <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>school</span>
            </div>
            <div>
              <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '700', fontFamily: 'Manrope', letterSpacing: '-0.3px' }}>Curator Admin</h2>
              <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '500' }}>Academic Insights</p>
            </div>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map(item => {
              const active = window.location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', border: 'none', cursor: 'pointer', borderRadius: '12px',
                  background: active ? 'rgba(37,99,235,0.2)' : 'transparent',
                  borderLeft: active ? '4px solid #3b82f6' : '4px solid transparent',
                  color: active ? 'white' : '#94a3b8',
                  fontSize: '14px', fontWeight: active ? '700' : '600',
                  fontFamily: 'Manrope', transition: 'all 0.2s', textAlign: 'left'
                }}
                  onMouseOver={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseOut={e => !active && (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 8px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', border: '2px solid rgba(59,130,246,0.3)', flexShrink: 0 }}>
              {user?.name?.charAt(0)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ color: '#64748b', fontSize: '11px' }}>HOD {user?.department}</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Top Bar */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', height: '64px', position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#131B2E', fontFamily: 'Manrope' }}>Academic Curator</span>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f2f4f6', padding: '6px 16px', borderRadius: '9999px', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#737686', fontSize: '16px' }}>search</span>
                <input placeholder="Search students..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', width: '200px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <span className="material-symbols-outlined">help_outline</span>
              </button>
              <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </header>

          <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box' }}>

            {/* Page Header & Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'Manrope', color: '#191c1e', letterSpacing: '-1px' }}>
                  {activeTab === 'mark' ? 'Mark Attendance' : 'Attendance Summary'}
                </h1>
                <p style={{ color: '#737686', marginTop: '4px', fontWeight: '500' }}>
                  {user?.department} Department — {students.length} Students
                </p>
              </div>
              <div style={{ display: 'flex', background: '#f2f4f6', padding: '4px', borderRadius: '12px' }}>
                {['mark', 'summary'].map(tab => (
                  <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'summary') fetchSummary(); }} style={{
                    padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '700',
                    background: activeTab === tab ? 'white' : 'transparent',
                    color: activeTab === tab ? '#004ac6' : '#737686',
                    boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s'
                  }}>{tab === 'mark' ? 'Mark Attendance' : 'View Summary'}</button>
                ))}
              </div>
            </div>

            {/* Mark Attendance Tab */}
            {activeTab === 'mark' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>

                {/* Left Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Current Subject</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                          placeholder="e.g. Data Structures"
                          style={{ width: '100%', background: '#f2f4f6', border: 'none', borderRadius: '8px', padding: '12px 40px 12px 16px', fontSize: '14px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                        />
                        <span className="material-symbols-outlined" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#737686', fontSize: '18px' }}>book</span>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Session Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={{ width: '100%', background: '#f2f4f6', border: 'none', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ borderTop: '1px solid #e7e8ea', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#737686' }}>Total Students</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#191c1e' }}>{students.length}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#737686' }}>Department</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#191c1e' }}>{user?.department || 'All'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,74,198,0.05)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #004ac6' }}>
                    <h4 style={{ color: '#004ac6', fontWeight: '700', fontSize: '13px', marginBottom: '8px' }}>Instructional Note</h4>
                    <p style={{ fontSize: '12px', color: '#434655', lineHeight: '1.6' }}>
                      Marking students as 'Late' automatically flags them if cumulative attendance falls below 80%.
                    </p>
                  </div>
                </div>

                {/* Right Table */}
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #f2f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e' }}>Student Roster</h3>
                    <button onClick={() => markAll('Present')} style={{ fontSize: '12px', fontWeight: '700', color: '#004ac6', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Mark All Present
                    </button>
                  </div>

                  {message && (
                    <div style={{ padding: '12px 24px', background: message.includes('Error') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') ? '#dc2626' : '#16a34a', fontSize: '13px', fontWeight: '500' }}>
                      {message}
                    </div>
                  )}

                  <div style={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f2f4f6' }}>
                          {['Roll No', 'Student Name', 'Status Selection'].map(h => (
                            <th key={h} style={{ padding: '14px 24px', textAlign: h === 'Status Selection' ? 'right' : 'left', fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {students.length === 0 ? (
                          <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No students found for your department</td></tr>
                        ) : students.map(s => (
                          <tr key={s._id} style={{ borderTop: '1px solid #edeef0', transition: 'background 0.15s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(242,244,246,0.3)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '16px 24px', fontFamily: 'Manrope', fontWeight: '700', color: '#434655', fontSize: '14px' }}>{s.rollNumber}</td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dae2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#5c647a', flexShrink: 0 }}>
                                  {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: '600', color: '#191c1e', fontSize: '14px' }}>{s.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ display: 'inline-flex', padding: '4px', background: '#f2f4f6', borderRadius: '8px', gap: '2px' }}>
                                  {['Present', 'Absent', 'Late'].map(status => {
                                    const isActive = attendance[s._id] === status;
                                    const cfg = statusConfig[status];
                                    return (
                                      <button key={status} onClick={() => setAttendance(prev => ({ ...prev, [s._id]: status }))} style={{
                                        padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                        fontSize: '11px', fontWeight: '700', transition: 'all 0.15s',
                                        background: isActive ? cfg.bg : 'transparent',
                                        color: isActive ? cfg.color : '#737686',
                                        boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                      }}>{status}</button>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ padding: '20px 32px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: 'rgba(242,244,246,0.3)', gap: '24px', borderTop: '1px solid #f2f4f6' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submission Preview</p>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#191c1e', marginTop: '2px' }}>
                        {presentCount} Present, {absentCount} Absent, {lateCount} Late
                      </p>
                    </div>
                    <button onClick={handleSubmit} disabled={loading} style={{
                      background: loading ? '#93c5fd' : 'linear-gradient(135deg, #004ac6, #2563eb)',
                      color: 'white', padding: '12px 32px', borderRadius: '12px',
                      border: 'none', fontWeight: '700', fontSize: '13px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      boxShadow: '0 4px 12px rgba(0,74,198,0.25)', transition: 'all 0.2s'
                    }}>
                      {loading ? 'Submitting...' : 'Submit Attendance'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #f2f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e' }}>Performance Snapshot</h3>
                      <p style={{ fontSize: '12px', color: '#737686', marginTop: '2px' }}>Historical attendance data by student</p>
                    </div>
                    <span className="material-symbols-outlined" style={{ color: '#737686' }}>history</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {summary.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No data yet</div>
                    ) : summary.map((s, i) => {
                      const pct = parseFloat(s.percentage) || 0;
                      const status = pct >= 90 ? { label: 'Safe', color: '#006243', bg: 'rgba(0,98,67,0.1)' }
                        : pct >= 80 ? { label: 'Watch', color: '#d97706', bg: 'rgba(217,119,6,0.1)' }
                        : { label: 'At-Risk', color: '#ba1a1a', bg: 'rgba(186,26,26,0.1)' };
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: i > 0 ? '1px solid #edeef0' : 'none', transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = '#f2f4f6'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#434655', fontFamily: 'Manrope', minWidth: '80px' }}>{s.rollNumber}</span>
                            <span style={{ fontWeight: '500', color: '#191c1e', fontSize: '14px' }}>{s.name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                            {[{ label: 'Total', value: s.total }, { label: 'Present', value: s.present }].map(item => (
                              <div key={item.label} style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '10px', color: '#737686', fontWeight: '700', textTransform: 'uppercase' }}>{item.label}</p>
                                <p style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px' }}>{item.value}</p>
                              </div>
                            ))}
                            <span style={{ padding: '4px 12px', borderRadius: '9999px', background: status.bg, color: status.color, fontSize: '11px', fontWeight: '700' }}>
                              {pct}% {status.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Class Health Card */}
                <div style={{ background: '#131B2E', color: 'white', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ color: '#60a5fa', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Class Health</p>
                    <h4 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Manrope', lineHeight: '1.2' }}>
                      Average Presence {summary.length > 0
                        ? (summary.reduce((acc, s) => acc + parseFloat(s.percentage || 0), 0) / summary.length).toFixed(1)
                        : 0}%
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '16px', lineHeight: '1.7' }}>
                      Real-time attendance tracking for {user?.department} department.
                    </p>
                  </div>
                  <div style={{ marginTop: '32px', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      <span>Target Attendance</span><span>75%</span>
                    </div>
                    <div style={{ width: '100%', background: '#1e293b', height: '8px', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '9999px', background: '#2563eb',
                        width: summary.length > 0 ? `${Math.min((summary.reduce((acc, s) => acc + parseFloat(s.percentage || 0), 0) / summary.length), 100)}%` : '0%',
                        transition: 'width 0.5s'
                      }}></div>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', right: '-48px', bottom: '-48px', width: '192px', height: '192px', background: 'rgba(37,99,235,0.1)', borderRadius: '50%', filter: 'blur(48px)' }}></div>
                </div>
              </div>
            )}

            {/* Footer */}
            <footer style={{ borderTop: '1px solid #f2f4f6', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#737686', fontSize: '12px' }}>
              <p>© 2024 Academic Curator. All educational data encrypted.</p>
              <div style={{ display: 'flex', gap: '24px' }}>
                {['Privacy Policy', 'Support Portal'].map(link => (
                  <a key={link} href="#" style={{ color: '#737686', textDecoration: 'none', fontWeight: '500' }}
                    onMouseOver={e => e.target.style.color = '#004ac6'}
                    onMouseOut={e => e.target.style.color = '#737686'}
                  >{link}</a>
                ))}
              </div>
            </footer>
          </div>
        </main>
      </div>
    </>
  );
}