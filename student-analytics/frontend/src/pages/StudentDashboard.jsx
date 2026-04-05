import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState([]);
  const [summary, setSummary] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { findStudent(); }, []);

  const findStudent = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students', { headers });
      const match = res.data.data.find(s => s.email === user?.email);
      if (match) {
        setStudentId(match._id);
        const [attRes, marksRes, summaryRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/attendance/summary/${match._id}`, { headers }),
          axios.get(`http://localhost:5000/api/marks/student/${match._id}`, { headers }),
          axios.get(`http://localhost:5000/api/marks/summary/${match._id}`, { headers })
        ]);
        setAttendance(attRes.data.data);
        setMarks(marksRes.data.data);
        setSummary(summaryRes.data.data);
      }
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const getGrade = (pct) => {
    if (pct >= 90) return { grade: 'A+', color: '#059669' };
    if (pct >= 80) return { grade: 'A', color: '#2563eb' };
    if (pct >= 70) return { grade: 'B', color: '#7c3aed' };
    if (pct >= 60) return { grade: 'C', color: '#d97706' };
    return { grade: 'F', color: '#dc2626' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #f1f5f9', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: '#2563eb', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>◈</span>
          </div>
          <span style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>StudentAnalytics</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>{user?.name}</p>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Student</p>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '7px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </header>

      <main style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Here's your academic summary</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading your data...</div>
        ) : !studentId ? (
          <div style={{ background: 'white', borderRadius: '14px', padding: '40px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>⚠️ Your student profile hasn't been set up yet.</p>
            <p style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '8px' }}>Please contact your admin to link your account.</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Attendance', value: `${attendance?.percentage || 0}%`, icon: '📅', color: parseFloat(attendance?.percentage) >= 75 ? '#059669' : '#dc2626', bg: parseFloat(attendance?.percentage) >= 75 ? '#ecfdf5' : '#fef2f2' },
                { label: 'Classes Present', value: `${attendance?.present || 0}/${attendance?.total || 0}`, icon: '✅', color: '#2563eb', bg: '#eff6ff' },
                { label: 'Subjects Tracked', value: summary.length, icon: '📚', color: '#7c3aed', bg: '#f5f3ff' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance Warning */}
            {parseFloat(attendance?.percentage) < 75 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>Attendance Below 75%</p>
                  <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>Your attendance is at {attendance?.percentage}%. Please attend more classes to avoid issues.</p>
                </div>
              </div>
            )}

            {/* Performance Chart */}
            {summary.length > 0 && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #f1f5f9', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '20px' }}>📈 Subject Performance</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={summary.map(s => ({ name: s.subject, percentage: parseFloat(s.percentage) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip formatter={(val) => [`${val}%`, 'Score']} />
                    <Bar dataKey="percentage" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Marks Table */}
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>📝 Marks Record</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Subject', 'Exam Type', 'Marks', 'Percentage', 'Grade'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {marks.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No marks recorded yet</td></tr>
                  ) : marks.map((m, i) => {
                    const pct = ((m.marksObtained / m.totalMarks) * 100).toFixed(1);
                    const { grade, color } = getGrade(parseFloat(pct));
                    return (
                      <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{m.subject}</td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>{m.examType}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#0f172a' }}>{m.marksObtained}/{m.totalMarks}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color }}>{pct}%</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: color + '15', color }}>{grade}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}