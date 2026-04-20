import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('https://student-analytics-10eb.onrender.com/api/students', { headers })
      .then(res => setStudents(res.data.data.filter(s => !user.department || s.department === user.department)));
  }, []);

  const generateReport = async (student) => {
    setSelected(student); setLoading(true);
    try {
      const [attRes, perfRes] = await Promise.all([
        axios.get(`https://student-analytics-10eb.onrender.com/api/attendance/summary/${student._id}`, { headers }),
        axios.get(`https://student-analytics-10eb.onrender.com/api/marks/summary/${student._id}`, { headers })
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
        <Sidebar />

        <main style={{ marginLeft: '256px', flex: 1, minHeight: '100vh' }}>
          <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '64px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope' }}>Reports</span>
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

          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope', letterSpacing: '-0.5px' }}>Academic Performance Report</h2>
                <p style={{ color: '#737686', marginTop: '4px' }}>Detailed overview for {user?.department} Department</p>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                  <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', alignSelf: 'flex-start', marginBottom: '24px', fontFamily: 'Manrope' }}>Attendance Summary</h3>
                    <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '24px' }}>
                      <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f2f4f6" strokeWidth="12" />
                        <circle cx="80" cy="80" r="70" fill="transparent" stroke="#004ac6" strokeWidth="12"
                          strokeDasharray="439.82"
                          strokeDashoffset={439.82 - (439.82 * parseFloat(report.attendance.percentage) / 100)}
                          strokeLinecap="round" />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope' }}>{report.attendance.percentage}%</span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase' }}>Attendance</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}>
                      {[{ label: 'Present', value: report.attendance.present }, { label: 'Absent', value: (report.attendance.total || 0) - (report.attendance.present || 0) }].map((item, i) => (
                        <div key={i} style={{ background: '#f2f4f6', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                          <p style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</p>
                          <p style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope' }}>{item.value || 0}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', fontFamily: 'Manrope', marginBottom: '24px' }}>Subject Performance</h3>
                    {report.performance.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No marks recorded yet</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {report.performance.map((p, i) => {
                          const pct = parseFloat(p.percentage);
                          const color = pct >= 80 ? '#006243' : pct >= 60 ? '#004ac6' : '#ba1a1a';
                          return (
                            <div key={i}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{p.subject}</p>
                                <p style={{ fontSize: '14px', fontWeight: '800', color }}>{pct}% ({getGrade(pct)})</p>
                              </div>
                              <div style={{ height: '10px', background: '#f2f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '9999px' }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                  {[
                    { icon: 'stars', label: 'Avg Performance', value: `${report.performance.length > 0 ? (report.performance.reduce((a, p) => a + parseFloat(p.percentage), 0) / report.performance.length).toFixed(1) : 0}%`, iconBg: '#eff6ff', iconColor: '#004ac6' },
                    { icon: 'assignment_turned_in', label: 'Subjects Tracked', value: report.performance.length, iconBg: '#ecfdf5', iconColor: '#006243' },
                    { icon: 'bolt', label: 'Total Classes', value: report.attendance.total || 0, iconBg: '#fff7ed', iconColor: '#ea580c' },
                    { icon: 'psychology', label: 'Risk Status', value: parseFloat(report.attendance.percentage) >= 75 ? 'Minimal' : 'At Risk', iconBg: '#f5f3ff', iconColor: '#7c3aed' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor, marginBottom: '16px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{s.icon}</span>
                      </div>
                      <p style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{s.label}</p>
                      <h4 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope' }}>{s.value}</h4>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}