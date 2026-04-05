import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Reports() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Students', path: '/students', icon: 'group' },
    { label: 'Attendance', path: '/attendance', icon: 'event_available' },
    { label: 'Performance', path: '/performance', icon: 'trending_up' },
    { label: 'Alerts', path: '/alerts', icon: 'warning' },
    { label: 'Reports', path: '/reports', icon: 'description' },
  ];

  useEffect(() => {
    axios.get('http://localhost:5000/api/students', { headers })
      .then(res => setStudents(res.data.data.filter(s => !user.department || s.department === user.department)));
  }, []);

  const generateReport = async (student) => {
    setSelected(student); setLoading(true);
    try {
      const [attRes, perfRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/attendance/summary/${student._id}`, { headers }),
        axios.get(`http://localhost:5000/api/marks/summary/${student._id}`, { headers })
      ]);
      setReport({ attendance: attRes.data.data, performance: perfRes.data.data });
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const getStatus = (pct) => pct >= 75 ? { label: 'Good', color: '#006243', bg: 'rgba(0,98,67,0.1)' }
    : pct >= 50 ? { label: 'Average', color: '#d97706', bg: 'rgba(217,119,6,0.1)' }
    : { label: 'At Risk', color: '#ba1a1a', bg: 'rgba(186,26,26,0.1)' };

  const getGrade = (pct) => pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'F';

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined';}`}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fb', fontFamily: 'Inter, sans-serif' }}>

        {/* Sidebar */}
        <aside style={{ width: '256px', height: '100vh', position: 'fixed', left: 0, top: 0, background: '#131B2E', display: 'flex', flexDirection: 'column', padding: '24px', gap: '8px', zIndex: 50, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px' }}>analytics</span>
            </div>
            <div>
              <h1 style={{ color: 'white', fontWeight: '800', fontSize: '16px', fontFamily: 'Manrope' }}>Analytics Pro</h1>
              <p style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Academic Management</p>
            </div>
          </div>
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map(item => {
              const active = window.location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 24px',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: active ? 'rgba(37,99,235,0.1)' : 'transparent',
                  borderRight: active ? '4px solid #3b82f6' : '4px solid transparent',
                  color: active ? 'white' : '#94a3b8', fontSize: '14px', fontWeight: '500',
                  transition: 'all 0.2s'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[{ label: 'Settings', icon: 'settings' }, { label: 'Support', icon: 'contact_support' }].map(item => (
              <button key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 24px', border: 'none', cursor: 'pointer', background: 'transparent', color: '#94a3b8', fontSize: '14px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main style={{ marginLeft: '256px', flex: 1, minHeight: '100vh' }}>
          {/* Top Bar */}
          <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px' }}>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#94a3b8' }}>search</span>
              <input placeholder="Search academic records..." style={{ paddingLeft: '36px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', background: '#f2f4f6', border: 'none', borderRadius: '12px', fontSize: '13px', width: '240px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '24px', borderRight: '1px solid #e2e8f0' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', position: 'relative' }}>
                  <span className="material-symbols-outlined">notifications</span>
                  <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#ba1a1a', borderRadius: '50%', border: '2px solid white' }}></span>
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <span className="material-symbols-outlined">help_outline</span>
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{user?.name}</p>
                  <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Senior Registrar</p>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>
                  {user?.name?.charAt(0)}
                </div>
                <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '8px 16px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>Logout</button>
              </div>
            </div>
          </header>

          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Header & Student Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope', letterSpacing: '-0.5px' }}>Academic Performance Report</h2>
                <p style={{ color: '#737686', fontWeight: '500', marginTop: '4px' }}>Detailed overview for {user?.department} Department</p>
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Select Student</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#004ac6', fontSize: '20px' }}>person</span>
                  <select onChange={e => { const s = students.find(st => st._id === e.target.value); if (s) generateReport(s); }}
                    style={{ width: '320px', background: 'white', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: '12px', padding: '12px 40px 12px 48px', fontSize: '14px', fontWeight: '600', color: '#191c1e', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Select a student...</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>)}
                  </select>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px', pointerEvents: 'none' }}>expand_more</span>
                </div>
              </div>
            </div>

            {!selected && (
              <div style={{ background: 'white', borderRadius: '24px', padding: '80px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c3c6d7' }}>description</span>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '12px' }}>Select a student to generate their report</p>
              </div>
            )}

            {loading && (
              <div style={{ background: 'white', borderRadius: '24px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Generating report...</p>
              </div>
            )}

            {selected && report && !loading && (
              <>
                {/* Bento Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>

                  {/* Attendance Circle */}
                  <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                      {(() => { const s = getStatus(parseFloat(report.attendance.percentage)); return (
                        <span style={{ fontSize: '11px', fontWeight: '700', color: s.color, background: s.bg, padding: '4px 12px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                      ); })()}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', alignSelf: 'flex-start', marginBottom: '32px', fontFamily: 'Manrope' }}>Attendance Summary</h3>

                    {/* Circle Gauge */}
                    <div style={{ position: 'relative', width: '192px', height: '192px', marginBottom: '24px' }}>
                      <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle cx="96" cy="96" r="88" fill="transparent" stroke="#f2f4f6" strokeWidth="14" />
                        <circle cx="96" cy="96" r="88" fill="transparent" stroke="#004ac6" strokeWidth="14"
                          strokeDasharray="552.92"
                          strokeDashoffset={552.92 - (552.92 * parseFloat(report.attendance.percentage) / 100)}
                          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s' }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope' }}>{report.attendance.percentage}%</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendance</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
                      {[{ label: 'Present', value: report.attendance.present }, { label: 'Absent', value: report.attendance.total - report.attendance.present }].map((item, i) => (
                        <div key={i} style={{ background: '#f2f4f6', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
                          <p style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</p>
                          <p style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope' }}>{item.value || 0}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Progress Bars */}
                  <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', fontFamily: 'Manrope' }}>Subject Performance</h3>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {[{ color: '#004ac6', label: 'Current' }, { color: '#e1e2e4', label: 'Average' }].map(item => (
                          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#737686' }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {report.performance.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No marks recorded yet</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {report.performance.map((p, i) => {
                          const pct = parseFloat(p.percentage);
                          const color = pct >= 80 ? '#006243' : pct >= 60 ? '#004ac6' : '#ba1a1a';
                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{p.subject}</p>
                                <p style={{ fontSize: '14px', fontWeight: '800', color }}>{pct}% ({getGrade(pct)})</p>
                              </div>
                              <div style={{ height: '12px', background: '#f2f4f6', borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '9999px', transition: 'width 0.8s' }}></div>
                                <div style={{ position: 'absolute', top: 0, left: '75%', height: '100%', width: '2px', borderRight: '2px dashed #c3c6d7' }}></div>
                              </div>
                            </div>
                          );
                        })}
                        <p style={{ fontSize: '12px', color: '#737686', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
                          Dashed lines indicate 75% threshold.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                  {[
                    { icon: 'stars', label: 'Avg Performance', value: `${report.performance.length > 0 ? (report.performance.reduce((a, p) => a + parseFloat(p.percentage), 0) / report.performance.length).toFixed(1) : 0}%`, sub: 'Based on all subjects', iconBg: '#eff6ff', iconColor: '#004ac6' },
                    { icon: 'assignment_turned_in', label: 'Subjects Tracked', value: report.performance.length, sub: 'Total subjects with marks', iconBg: '#ecfdf5', iconColor: '#006243' },
                    { icon: 'bolt', label: 'Total Classes', value: report.attendance.total || 0, sub: 'Classes conducted', iconBg: '#fff7ed', iconColor: '#ea580c' },
                    { icon: 'psychology', label: 'Risk Status', value: parseFloat(report.attendance.percentage) >= 75 ? 'Minimal' : 'At Risk', sub: parseFloat(report.attendance.percentage) >= 75 ? 'No intervention needed' : 'Attendance below 75%', iconBg: '#f5f3ff', iconColor: '#7c3aed' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'}
                      onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
                    >
                      <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor, marginBottom: '16px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{s.icon}</span>
                      </div>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{s.label}</p>
                      <h4 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope', letterSpacing: '-0.5px' }}>{s.value}</h4>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Marks Table */}
                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', fontFamily: 'Manrope' }}>Recent Graded Work</h3>
                    <button style={{ fontSize: '13px', fontWeight: '700', color: '#004ac6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View Transcript <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                    </button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {['Submission Title', 'Category', 'Marks', 'Grade'].map(h => (
                          <th key={h} style={{ paddingBottom: '16px', textAlign: h === 'Grade' ? 'right' : 'left', fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {report.performance.length === 0 ? (
                        <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No records yet</td></tr>
                      ) : report.performance.map((p, i) => {
                        const pct = parseFloat(p.percentage);
                        const { color } = { color: pct >= 80 ? '#006243' : pct >= 60 ? '#004ac6' : '#ba1a1a' };
                        const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'F';
                        const icons = ['functions', 'science', 'history_edu', 'quiz', 'calculate', 'biotech'];
                        const bgs = ['#eff6ff', '#f5f3ff', '#fff7ed', '#f0fdf4', '#fefce8', '#fdf4ff'];
                        const colors = ['#004ac6', '#7c3aed', '#ea580c', '#16a34a', '#ca8a04', '#a21caf'];
                        return (
                          <tr key={i} style={{ borderTop: '1px solid #f8f9fb', transition: 'background 0.15s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(248,249,251,0.5)'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '20px 0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: bgs[i % bgs.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors[i % colors.length] }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icons[i % icons.length]}</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{p.subject}</span>
                              </div>
                            </td>
                            <td style={{ padding: '20px 16px', fontSize: '13px', color: '#64748b' }}>Subject</td>
                            <td style={{ padding: '20px 16px', fontSize: '13px', color: '#64748b' }}>{pct}%</td>
                            <td style={{ padding: '20px 0', textAlign: 'right' }}>
                              <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', background: color + '18', color }}>{grade}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </main>

        {/* FAB */}
        <button style={{ position: 'fixed', bottom: '32px', right: '32px', background: 'linear-gradient(135deg, #004ac6, #2563eb)', color: 'white', padding: '16px 32px', borderRadius: '9999px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 8px 24px rgba(0,74,198,0.3)', transition: 'transform 0.2s', fontWeight: '700', fontFamily: 'Manrope', zIndex: 50 }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span className="material-symbols-outlined">file_download</span>
          Generate PDF Report
        </button>
      </div>
    </>
  );
}