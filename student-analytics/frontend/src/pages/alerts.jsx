import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

export default function Alerts() {
  const [students, setStudents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const studentsRes = await axios.get('http://localhost:5000/api/students', { headers });
      const studentList = studentsRes.data.data;
      setStudents(studentList);

      const results = await Promise.all(
        studentList.map(async (s) => {
          const [attRes, perfRes] = await Promise.all([
            axios.get(`http://localhost:5000/api/attendance/summary/${s._id}`, { headers }),
            axios.get(`http://localhost:5000/api/marks/summary/${s._id}`, { headers })
          ]);

          const attendance = parseFloat(attRes.data.data.percentage) || 0;
          const subjects = perfRes.data.data;
          const avgPerf = subjects.length > 0
            ? subjects.reduce((sum, sub) => sum + parseFloat(sub.percentage), 0) / subjects.length
            : null;

          const studentAlerts = [];

          if (attendance < 50) {
            studentAlerts.push({ type: 'critical', category: 'attendance', message: `Attendance critically low at ${attendance}%` });
          } else if (attendance < 75) {
            studentAlerts.push({ type: 'warning', category: 'attendance', message: `Attendance below required 75% — currently ${attendance}%` });
          }

          if (avgPerf !== null && avgPerf < 40) {
            studentAlerts.push({ type: 'critical', category: 'performance', message: `Average performance critically low at ${avgPerf.toFixed(1)}%` });
          } else if (avgPerf !== null && avgPerf < 60) {
            studentAlerts.push({ type: 'warning', category: 'performance', message: `Average performance below 60% — currently ${avgPerf.toFixed(1)}%` });
          }

          if (subjects.length > 0) {
            subjects.forEach(sub => {
              if (parseFloat(sub.percentage) < 40) {
                studentAlerts.push({ type: 'critical', category: 'subject', message: `Failing ${sub.subject} with ${sub.percentage}%` });
              }
            });
          }

          return {
            student: s,
            alerts: studentAlerts,
            attendance,
            avgPerf,
            risk: studentAlerts.some(a => a.type === 'critical') ? 'critical'
              : studentAlerts.some(a => a.type === 'warning') ? 'warning' : 'safe'
          };
        })
      );

      setAlerts(results);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const filtered = alerts.filter(a => filter === 'all' ? true : a.risk === filter);

  const counts = {
    all: alerts.length,
    critical: alerts.filter(a => a.risk === 'critical').length,
    warning: alerts.filter(a => a.risk === 'warning').length,
    safe: alerts.filter(a => a.risk === 'safe').length,
  };

  const riskConfig = {
    critical: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Critical' },
    warning: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Warning' },
    safe: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'Safe' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          🔔 Alerts
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
          Automated early warning system for at-risk students
        </p>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { key: 'all', label: 'Total Students', color: '#2563eb', bg: '#eff6ff' },
            { key: 'critical', label: 'Critical', color: '#dc2626', bg: '#fef2f2' },
            { key: 'warning', label: 'Warning', color: '#d97706', bg: '#fffbeb' },
            { key: 'safe', label: 'Safe', color: '#059669', bg: '#ecfdf5' },
          ].map(({ key, label, color, bg }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              background: filter === key ? color : 'white',
              border: `1px solid ${filter === key ? color : '#f1f5f9'}`,
              borderRadius: '12px', padding: '16px', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.15s'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: filter === key ? 'white' : color }}>{loading ? '...' : counts[key]}</div>
              <div style={{ fontSize: '12px', color: filter === key ? 'rgba(255,255,255,0.8)' : '#94a3b8', marginTop: '2px' }}>{label}</div>
            </button>
          ))}
        </div>

        {/* Alert Cards */}
        {loading ? (
          <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Analyzing student data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '14px', padding: '60px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>No alerts for this category</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(({ student, alerts: studentAlerts, attendance, avgPerf, risk }) => {
              const config = riskConfig[risk];
              return (
                <div key={student._id} style={{
                  background: 'white', borderRadius: '14px',
                  border: `1px solid ${risk === 'safe' ? '#f1f5f9' : config.border}`,
                  overflow: 'hidden'
                }}>
                  {/* Student Header */}
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${risk === 'safe' ? '#f8fafc' : config.border}`, background: risk === 'safe' ? 'white' : config.bg }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: config.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '700' }}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{student.rollNumber} · {student.department}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Attendance</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: attendance < 75 ? '#dc2626' : '#059669' }}>{attendance}%</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Performance</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: avgPerf !== null && avgPerf < 60 ? '#dc2626' : '#059669' }}>
                          {avgPerf !== null ? `${avgPerf.toFixed(1)}%` : 'N/A'}
                        </div>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Alert Messages */}
                  {studentAlerts.length > 0 && (
                    <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {studentAlerts.map((alert, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px' }}>{alert.type === 'critical' ? '🔴' : '🟡'}</span>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>{alert.message}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {risk === 'safe' && (
                    <div style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>✅ No issues detected — student is on track</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}