import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

export default function Attendance() {
  const { user } = useAuth();
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

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('https://student-analytics-10eb.onrender.com/api/students', { headers });
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
        students.map(s => axios.get(`https://student-analytics-10eb.onrender.com/api/attendance/summary/${s._id}`, { headers }))
      );
      setSummary(students.map((s, i) => ({ name: s.name, rollNumber: s.rollNumber, ...summaries[i].data.data })));
    } catch (err) { console.log(err); }
  };

  const handleSubmit = async () => {
    if (!subject) return setMessage('Please enter a subject!');
    setLoading(true);
    try {
      await Promise.all(
        students.map(s => axios.post('https://student-analytics-10eb.onrender.com/api/attendance', {
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
        <Sidebar />

        <main style={{ marginLeft: '256px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', height: '64px', position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#131B2E', fontFamily: 'Manrope' }}>Attendance</span>
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

          <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Manrope', color: '#191c1e', letterSpacing: '-0.5px' }}>
                  {activeTab === 'mark' ? 'Mark Attendance' : 'Attendance Summary'}
                </h1>
                <p style={{ color: '#737686', marginTop: '4px' }}>{user?.department} Department — {students.length} Students</p>
              </div>
              <div style={{ display: 'flex', background: '#f2f4f6', padding: '4px', borderRadius: '12px' }}>
                {['mark', 'summary'].map(tab => (
                  <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'summary') fetchSummary(); }} style={{
                    padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '700',
                    background: activeTab === tab ? 'white' : 'transparent',
                    color: activeTab === tab ? '#004ac6' : '#737686',
                    boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}>{tab === 'mark' ? 'Mark Attendance' : 'View Summary'}</button>
                ))}
              </div>
            </div>

            {activeTab === 'mark' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Subject</label>
                      <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Data Structures"
                        style={{ width: '100%', background: '#f2f4f6', border: 'none', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Date</label>
                      <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        style={{ width: '100%', background: '#f2f4f6', border: 'none', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ borderTop: '1px solid #e7e8ea', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#737686' }}>Total Students</span>
                        <span style={{ fontSize: '13px', fontWeight: '700' }}>{students.length}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', color: '#737686' }}>Department</span>
                        <span style={{ fontSize: '13px', fontWeight: '700' }}>{user?.department || 'All'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #f2f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e' }}>Student Roster</h3>
                    <button onClick={() => markAll('Present')} style={{ fontSize: '12px', fontWeight: '700', color: '#004ac6', background: 'none', border: 'none', cursor: 'pointer' }}>Mark All Present</button>
                  </div>
                  {message && (
                    <div style={{ padding: '12px 24px', background: message.includes('Error') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') ? '#dc2626' : '#16a34a', fontSize: '13px', fontWeight: '500' }}>{message}</div>
                  )}
                  <div style={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f2f4f6' }}>
                          {['Roll No', 'Student Name', 'Status'].map(h => (
                            <th key={h} style={{ padding: '14px 24px', textAlign: h === 'Status' ? 'right' : 'left', fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {students.length === 0 ? (
                          <tr><td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No students found</td></tr>
                        ) : students.map(s => (
                          <tr key={s._id} style={{ borderTop: '1px solid #edeef0' }}>
                            <td style={{ padding: '16px 24px', fontWeight: '700', color: '#434655', fontSize: '14px' }}>{s.rollNumber}</td>
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
                                        fontSize: '11px', fontWeight: '700',
                                        background: isActive ? cfg.bg : 'transparent',
                                        color: isActive ? cfg.color : '#737686',
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
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#191c1e' }}>{presentCount} Present, {absentCount} Absent, {lateCount} Late</p>
                    <button onClick={handleSubmit} disabled={loading} style={{
                      background: loading ? '#93c5fd' : 'linear-gradient(135deg, #004ac6, #2563eb)',
                      color: 'white', padding: '12px 32px', borderRadius: '12px', border: 'none',
                      fontWeight: '700', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer',
                    }}>{loading ? 'Submitting...' : 'Submit Attendance'}</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f2f4f6' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e' }}>Attendance Summary</h3>
                </div>
                {summary.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No data yet</div>
                ) : summary.map((s, i) => {
                  const pct = parseFloat(s.percentage) || 0;
                  const color = pct >= 75 ? '#006243' : '#ba1a1a';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: i > 0 ? '1px solid #edeef0' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#434655', minWidth: '80px' }}>{s.rollNumber}</span>
                        <span style={{ fontWeight: '500', color: '#191c1e' }}>{s.name}</span>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: '9999px', background: color + '18', color, fontSize: '11px', fontWeight: '700' }}>
                        {pct}% {pct >= 75 ? 'Safe' : 'At Risk'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}