import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

export default function Alerts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Priority');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const studentsRes = await axios.get('https://student-analytics-10eb.onrender.com/api/students', { headers });
      const studentList = studentsRes.data.data;
      const results = await Promise.all(
        studentList.map(async (s) => {
          const [attRes, perfRes] = await Promise.all([
            axios.get(`https://student-analytics-10eb.onrender.com/api/attendance/summary/${s._id}`, { headers }),
            axios.get(`https://student-analytics-10eb.onrender.com/api/marks/summary/${s._id}`, { headers })
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
        <Sidebar />

        <main style={{ marginLeft: '256px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope' }}>Alerts</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#131B2E' }}>{user?.name}</p>
                <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>HOD {user?.department}</p>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px' }}>
                {user?.name?.charAt(0)}
              </div>
            </div>
          </header>

          <section style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#191c1e', fontFamily: 'Manrope', letterSpacing: '-0.5px' }}>Student Alerts</h2>
                <p style={{ color: '#737686', fontSize: '14px', marginTop: '4px' }}>Monitoring {alerts.length} students</p>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(186,26,26,0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ba1a1a' }}></div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#ba1a1a' }}>{counts.critical} Critical</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <div style={{ background: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Analyzing student data...</div>
              ) : filtered.map(({ student, alerts: studentAlerts, risk }, i) => (
                <div key={i} className="alert-row" style={{ background: 'white', borderLeft: `4px solid ${borderColor(risk)}`, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'relative' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: borderColor(risk), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                    {student.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <h4 style={{ fontWeight: '700', color: '#191c1e', fontSize: '14px' }}>{student.name}</h4>
                      <p style={{ fontSize: '10px', color: '#737686' }}>{student.rollNumber} · {student.department}</p>
                    </div>
                    <div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '9999px', background: badgeBg(risk), color: badgeColor(risk), fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {studentAlerts[0]?.category}
                      </span>
                      <p style={{ fontSize: '12px', color: '#434655' }}>{studentAlerts[0]?.message}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="alert-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', opacity: 0, transition: 'opacity 0.15s' }}>
                        <button onClick={() => navigate('/reports')} style={{ background: btnBg(risk), color: 'white', fontSize: '10px', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
                          {risk === 'critical' ? 'Action' : risk === 'warning' ? 'Review' : 'Dismiss'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}