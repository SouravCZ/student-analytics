import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Alerts() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Priority');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const studentsRes = await axios.get('http://localhost:5000/api/students', { headers });
      const studentList = studentsRes.data.data;

      const results = await Promise.all(
        studentList.map(async (s) => {
          const [attRes, perfRes] = await Promise.all([
            axios.get(`http://localhost:5000/api/attendance/summary/${s._id}`, { headers }),
            axios.get(`http://localhost:5000/api/marks/summary/${s._id}`, { headers })
          ]);
          const attendance = parseFloat(attRes.data.data.percentage) || 0;
          const subjects = perfRes.data.data;
          const avgPerf = subjects.length > 0
            ? subjects.reduce((sum, sub) => sum + parseFloat(sub.percentage), 0) / subjects.length : null;

          const studentAlerts = [];
          if (attendance < 50) studentAlerts.push({ type: 'critical', message: `Attendance critically low at ${attendance}%`, category: 'Attendance Warning', time: '2h ago' });
          else if (attendance < 75) studentAlerts.push({ type: 'warning', message: `Attendance below 75% — currently ${attendance}%`, category: 'Attendance Warning', time: '5h ago' });
          if (avgPerf !== null && avgPerf < 40) studentAlerts.push({ type: 'critical', message: `Average performance critically low at ${avgPerf.toFixed(1)}%`, category: 'Academic Probation Risk', time: '30m ago' });
          else if (avgPerf !== null && avgPerf < 60) studentAlerts.push({ type: 'warning', message: `Average performance below 60% — currently ${avgPerf.toFixed(1)}%`, category: 'Grade Decline', time: '8h ago' });
          if (studentAlerts.length === 0) studentAlerts.push({ type: 'safe', message: 'Attendance and performance are on track.', category: 'Improvement', time: '1d ago' });

          return { student: s, alerts: studentAlerts, attendance, avgPerf, risk: studentAlerts.some(a => a.type === 'critical') ? 'critical' : studentAlerts.some(a => a.type === 'warning') ? 'warning' : 'safe' };
        })
      );
      setAlerts(results);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Students', path: '/students', icon: 'group' },
    { label: 'Attendance', path: '/attendance', icon: 'event_available' },
    { label: 'Performance', path: '/performance', icon: 'trending_up' },
    { label: 'Alerts', path: '/alerts', icon: 'warning' },
    { label: 'Reports', path: '/reports', icon: 'description' },
  ];

  const counts = {
    critical: alerts.filter(a => a.risk === 'critical').length,
    warning: alerts.filter(a => a.risk === 'warning').length,
    safe: alerts.filter(a => a.risk === 'safe').length,
  };

  const filtered = filter === 'Priority'
    ? [...alerts].sort((a, b) => (a.risk === 'critical' ? -1 : b.risk === 'critical' ? 1 : 0))
    : filter === 'Pending' ? alerts.filter(a => a.risk !== 'safe')
    : alerts.filter(a => a.risk === 'safe');

  const borderColor = (risk) => risk === 'critical' ? '#ba1a1a' : risk === 'warning' ? '#f59e0b' : '#c3c6d7';
  const badgeBg = (risk) => risk === 'critical' ? 'rgba(186,26,26,0.1)' : risk === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(0,98,67,0.1)';
  const badgeColor = (risk) => risk === 'critical' ? '#ba1a1a' : risk === 'warning' ? '#92400e' : '#006243';
  const btnBg = (risk) => risk === 'critical' ? '#ba1a1a' : risk === 'warning' ? '#f59e0b' : '#006243';

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined';} .alert-row:hover .alert-actions{opacity:1!important;}`}</style>

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
  {/* same nav as Reports.jsx */}
          <nav style={{ flex: 1 }}>
            {navItems.map(item => {
              const active = window.location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 24px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: active ? 'rgba(37,99,235,0.1)' : 'transparent',
                  borderRight: active ? '4px solid #3b82f6' : '4px solid transparent',
                  color: active ? 'white' : '#94a3b8', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: active ? '#3b82f6' : '#94a3b8' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            {[{ label: 'Settings', icon: 'settings' }, { label: 'Support', icon: 'contact_support' }].map(item => (
              <button key={item.label} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', border: 'none', cursor: 'pointer', background: 'transparent', color: '#94a3b8', fontSize: '14px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main style={{ marginLeft: '256px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* TopBar */}
          <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope' }}>Academic Curator</span>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8' }}>search</span>
                <input placeholder="Search alerts..." style={{ paddingLeft: '36px', paddingRight: '16px', paddingTop: '6px', paddingBottom: '6px', background: '#f2f4f6', border: 'none', borderRadius: '9999px', fontSize: '13px', width: '240px', outline: 'none' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="material-symbols-outlined" style={{ color: '#64748b', cursor: 'pointer' }}>notifications</span>
              <span className="material-symbols-outlined" style={{ color: '#64748b', cursor: 'pointer' }}>help_outline</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px' }}>{user?.name?.charAt(0)}</div>
              <button onClick={() => { logout(); navigate('/'); }} style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
            </div>
          </header>

          <section style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#191c1e', fontFamily: 'Manrope', letterSpacing: '-0.5px' }}>Student Alerts</h2>
                <p style={{ color: '#737686', fontWeight: '500', fontSize: '14px', marginTop: '4px' }}>Monitoring {alerts.length} students across all departments</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#f2f4f6', padding: '4px', borderRadius: '12px', display: 'flex' }}>
                  {['Priority', 'Pending', 'Resolved'].map(tab => (
                    <button key={tab} onClick={() => setFilter(tab)} style={{
                      padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '600',
                      background: filter === tab ? 'white' : 'transparent',
                      color: filter === tab ? '#004ac6' : '#565e74',
                      boxShadow: filter === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                    }}>{tab}</button>
                  ))}
                </div>
                <button style={{ background: '#004ac6', color: 'white', padding: '10px 16px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>mail</span> Bulk Notify
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div style={{ background: 'white', border: '1px solid #c3c6d7', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              {['Faculty', 'Department', 'Year'].map(label => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <select style={{ background: '#f2f4f6', border: 'none', borderRadius: '8px', fontSize: '13px', padding: '6px 10px', outline: 'none' }}>
                    <option>All {label}s</option>
                  </select>
                </div>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(186,26,26,0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(186,26,26,0.2)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ba1a1a' }}></div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#ba1a1a' }}>{counts.critical} Critical</span>
              </div>
            </div>

            {/* Bulk Action Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase' }}>Select All</span>
                </label>
                <div style={{ width: '1px', height: '16px', background: '#c3c6d7' }}></div>
                {['Archive Selected', 'Mark Resolved'].map(action => (
                  <button key={action} style={{ fontSize: '10px', fontWeight: '700', color: '#565e74', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>{action}</button>
                ))}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#737686' }}>Showing {filtered.length} of {alerts.length} alerts</span>
            </div>

            {/* Alert Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Analyzing student data...</div>
              ) : filtered.map(({ student, alerts: studentAlerts, attendance, risk }, i) => (
                <div key={i} className="alert-row" style={{ background: 'white', borderLeft: `4px solid ${borderColor(risk)}`, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative', transition: 'background 0.15s' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: borderColor(risk), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                    {student.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <h4 style={{ fontWeight: '700', color: '#191c1e', fontSize: '14px' }}>{student.name}</h4>
                      <p style={{ fontSize: '10px', color: '#737686', fontWeight: '500' }}>{student.rollNumber} • {student.department}</p>
                    </div>
                    <div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '9999px', background: badgeBg(risk), color: badgeColor(risk), fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {studentAlerts[0]?.category}
                      </span>
                      <p style={{ fontSize: '12px', color: '#434655' }}>{studentAlerts[0]?.message}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', color: '#737686', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginBottom: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>schedule</span>
                        {studentAlerts[0]?.time}
                      </span>
                      <div className="alert-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', opacity: 0, transition: 'opacity 0.15s' }}>
                        <button onClick={() => navigate('/reports')} style={{ background: btnBg(risk), color: 'white', fontSize: '10px', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
                          {risk === 'critical' ? 'Action' : risk === 'warning' ? 'Review' : 'Dismiss'}
                        </button>
                        <button style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #c3c6d7', background: 'white', cursor: 'pointer' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#565e74' }}>more_vert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f2f4f6', padding: '4px', borderRadius: '12px' }}>
                {['chevron_left', '1', '2', '3', 'chevron_right'].map((item, i) => (
                  <button key={i} style={{
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: item === '1' ? 'white' : 'transparent',
                    color: item === '1' ? '#004ac6' : '#565e74',
                    fontSize: '12px', fontWeight: item === '1' ? '700' : '500',
                    boxShadow: item === '1' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                  }}>
                    {['chevron_left', 'chevron_right'].includes(item)
                      ? <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{item}</span>
                      : item}
                  </button>
                ))}
              </nav>
            </div>

          </section>

          {/* Footer */}
          <footer style={{ marginTop: 'auto', padding: '24px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Student Analytics System v1.0 • Mini Project</span>
            <div style={{ display: 'flex', gap: '24px' }}>
              {['Data Privacy', 'System Status', 'Log History'].map(link => (
                <a key={link} href="#" style={{ fontSize: '11px', fontWeight: '700', color: '#737686', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{link}</a>
              ))}
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}