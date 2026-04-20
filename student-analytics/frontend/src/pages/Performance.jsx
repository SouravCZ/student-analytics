import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Sidebar from '../components/Sidebar';

export default function Performance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [marks, setMarks] = useState([]);
  const [summary, setSummary] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [activeTab, setActiveTab] = useState('add');
  const [form, setForm] = useState({ subject: '', examType: 'MidTerm', marksObtained: '', totalMarks: '', semester: 3 });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('https://student-analytics-10eb.onrender.com/api/students', { headers });
      const list = res.data.data.filter(s => !user.department || s.department === user.department);
      setStudents(list);
      if (list.length > 0) selectStudent(list[0]);
    } catch (err) { console.log(err); }
  };

  const selectStudent = async (student) => {
    setSelected(student);
    setMarks([]); setSummary([]); setAttendance(null);
    try {
      const [marksRes, summaryRes, attRes] = await Promise.all([
        axios.get(`https://student-analytics-10eb.onrender.com/api/marks/student/${student._id}`, { headers }),
        axios.get(`https://student-analytics-10eb.onrender.com/api/marks/summary/${student._id}`, { headers }),
        axios.get(`https://student-analytics-10eb.onrender.com/api/attendance/summary/${student._id}`, { headers }),
      ]);
      setMarks(marksRes.data.data);
      setSummary(summaryRes.data.data);
      setAttendance(attRes.data.data);
    } catch (err) { console.log(err); }
  };

  const handleAddMarks = async () => {
    if (!selected || !form.subject || !form.marksObtained || !form.totalMarks) return setMessage('Please fill all fields!');
    setLoading(true);
    try {
      await axios.post('https://student-analytics-10eb.onrender.com/api/marks', {
        studentId: selected._id, ...form,
        marksObtained: Number(form.marksObtained),
        totalMarks: Number(form.totalMarks)
      }, { headers });
      setMessage('Marks added successfully!');
      selectStudent(selected);
      setForm({ subject: '', examType: 'MidTerm', marksObtained: '', totalMarks: '', semester: 3 });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error adding marks!'); }
    finally { setLoading(false); }
  };

  const getGrade = (pct) => {
    if (pct >= 90) return { grade: 'A+', color: '#006243' };
    if (pct >= 80) return { grade: 'A', color: '#004ac6' };
    if (pct >= 70) return { grade: 'B', color: '#7c3aed' };
    if (pct >= 60) return { grade: 'C', color: '#d97706' };
    return { grade: 'F', color: '#ba1a1a' };
  };

  const avgPerf = summary.length > 0
    ? (summary.reduce((s, d) => s + parseFloat(d.percentage), 0) / summary.length).toFixed(1) : 0;

  const isAtRisk = parseFloat(attendance?.percentage) < 75 || parseFloat(avgPerf) < 60;

  const inputStyle = {
    width: '100%', background: '#f2f4f6', border: 'none', borderRadius: '12px',
    padding: '16px', fontSize: '14px', outline: 'none', color: '#191c1e', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif'
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined';} .no-scrollbar::-webkit-scrollbar{display:none;}`}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fb', fontFamily: 'Inter, sans-serif' }}>

        <Sidebar />

        {/* Main */}
        <main style={{ flex: 1, marginLeft: '256px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* Top Bar */}
          <header style={{ width: '100%', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', background: 'white', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 40, boxSizing: 'border-box' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#131B2E', fontFamily: 'Manrope' }}>Performance</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#191c1e' }}>{user?.name}</p>
                <p style={{ fontSize: '10px', color: '#737686', fontWeight: '700', textTransform: 'uppercase' }}>HOD {user?.department}</p>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' }}>
                {user?.name?.charAt(0)}
              </div>
            </div>
          </header>

          {/* Content Area - Split Layout */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

            {/* Left: Student List */}
            <section style={{ width: '280px', minWidth: '280px', background: 'white', display: 'flex', flexDirection: 'column', borderRight: '1px solid #edeef0' }}>
              <div style={{ padding: '24px 24px 8px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#191c1e', fontFamily: 'Manrope', marginBottom: '4px' }}>Student Roster</h2>
                <p style={{ fontSize: '13px', color: '#737686' }}>{user?.department} — {students.length} students</p>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }} className="no-scrollbar">
                {students.map(s => {
                  const active = selected?._id === s._id;
                  const initials = s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <button key={s._id} onClick={() => selectStudent(s)} style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                      borderRadius: '12px', border: `1px solid ${active ? 'rgba(37,99,235,0.1)' : 'transparent'}`,
                      background: active ? 'rgba(37,99,235,0.05)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%'
                    }}
                      onMouseOver={e => !active && (e.currentTarget.style.background = '#f2f4f6')}
                      onMouseOut={e => !active && (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: active ? '#dbe1ff' : '#edeef0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: active ? '#004ac6' : '#565e74', fontSize: '13px', flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#191c1e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                        <p style={{ fontSize: '11px', color: '#737686', fontWeight: '500', marginTop: '2px' }}>{s.rollNumber}</p>
                      </div>
                      {active && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#004ac6', flexShrink: 0 }}>chevron_right</span>}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Right: Content */}
            <section style={{ flex: 1, overflowY: 'auto', background: '#f8f9fb' }} className="no-scrollbar">
              {selected ? (
                <>
                  <div style={{ background: 'white', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', borderBottom: '1px solid #edeef0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'linear-gradient(135deg, #004ac6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '24px', fontFamily: 'Manrope', flexShrink: 0 }}>
                        {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#191c1e', fontFamily: 'Manrope', letterSpacing: '-0.5px' }}>{selected.name}</h1>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
                          {[
                            { icon: 'school', text: selected.department },
                            { icon: 'fingerprint', text: selected.rollNumber },
                            { icon: 'calendar_today', text: `Semester ${selected.semester}` },
                          ].map((item, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#737686', fontWeight: '500' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{item.icon}</span>
                              {item.text}
                            </span>
                          ))}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: isAtRisk ? '#ba1a1a' : '#006243', background: isAtRisk ? 'rgba(186,26,26,0.1)' : 'rgba(0,98,67,0.1)', padding: '2px 10px', borderRadius: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{isAtRisk ? 'warning' : 'verified'}</span>
                            {isAtRisk ? 'At Risk' : 'On Track'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '0 32px', background: 'white', borderBottom: '1px solid #edeef0' }}>
                    <div style={{ display: 'flex', gap: '40px' }}>
                      {['add', 'records', 'summary'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                          padding: '16px 0', border: 'none', background: 'none', cursor: 'pointer',
                          fontSize: '14px', fontWeight: activeTab === tab ? '700' : '600',
                          color: activeTab === tab ? '#004ac6' : '#737686',
                          borderBottom: activeTab === tab ? '2px solid #004ac6' : '2px solid transparent',
                          transition: 'all 0.2s'
                        }}>{tab === 'add' ? 'Add Marks' : tab === 'records' ? 'Records' : 'Summary'}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '32px' }}>
                    {activeTab === 'add' && (
                      <>
                        <div style={{ maxWidth: '800px', background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#191c1e', fontFamily: 'Manrope', marginBottom: '24px' }}>Mark Entry Portal</h3>
                          {message && (
                            <div style={{ padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', background: message.includes('Error') || message.includes('fill') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') || message.includes('fill') ? '#dc2626' : '#16a34a' }}>
                              {message}
                            </div>
                          )}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {[
                              { label: 'Subject Name', key: 'subject', type: 'text', placeholder: 'e.g. Distributed Systems' },
                              { label: 'Marks Obtained', key: 'marksObtained', type: 'number', placeholder: '00' },
                              { label: 'Total Marks', key: 'totalMarks', type: 'number', placeholder: '100' },
                            ].map(({ label, key, type, placeholder }) => (
                              <div key={key}>
                                <label style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737686', display: 'block', marginBottom: '8px' }}>{label}</label>
                                <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                              </div>
                            ))}
                            <div>
                              <label style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737686', display: 'block', marginBottom: '8px' }}>Exam Type</label>
                              <select value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })} style={inputStyle}>
                                {['Assignment', 'MidTerm', 'Final', 'Quiz'].map(t => <option key={t}>{t}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737686', display: 'block', marginBottom: '8px' }}>Semester</label>
                              <select value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })} style={inputStyle}>
                                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                              </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                              <button onClick={handleAddMarks} disabled={loading} style={{
                                padding: '16px 48px', background: loading ? '#93c5fd' : 'linear-gradient(135deg, #004ac6, #2563eb)',
                                color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px',
                                fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
                              }}>
                                {loading ? 'Submitting...' : 'Submit Performance Record'}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '800px' }}>
                          {[
                            { label: 'Current Attendance', value: `${attendance?.percentage || 0}%`, sub: attendance?.percentage >= 75 ? '▲ On Track' : '▼ Below 75%', subColor: attendance?.percentage >= 75 ? '#006243' : '#ba1a1a', bar: parseFloat(attendance?.percentage) || 0, barColor: parseFloat(attendance?.percentage) >= 75 ? '#006243' : '#ba1a1a' },
                            { label: 'Subjects Tracked', value: summary.length, sub: `${marks.length} total records`, subColor: '#737686', bar: Math.min(summary.length * 10, 100), barColor: '#004ac6' },
                            { label: 'Avg Performance', value: `${avgPerf}%`, sub: avgPerf >= 60 ? 'Good Standing' : 'Needs Improvement', subColor: avgPerf >= 60 ? '#006243' : '#ba1a1a', bar: parseFloat(avgPerf), barColor: parseFloat(avgPerf) >= 60 ? '#2563eb' : '#ba1a1a' },
                          ].map((w, i) => (
                            <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                              <p style={{ fontSize: '12px', fontWeight: '700', color: '#737686', marginBottom: '16px' }}>{w.label}</p>
                              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '36px', fontWeight: '800', color: '#191c1e', fontFamily: 'Manrope' }}>{w.value}</span>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: w.subColor, paddingBottom: '6px' }}>{w.sub}</span>
                              </div>
                              <div style={{ height: '6px', background: '#e1e2e4', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${w.bar}%`, background: w.barColor, borderRadius: '9999px' }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {activeTab === 'records' && (
                      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #edeef0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e' }}>Marks Records</h3>
                          <span style={{ fontSize: '12px', color: '#737686' }}>{marks.length} total entries</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#f2f4f6' }}>
                              {['Subject', 'Exam Type', 'Marks', 'Total', 'Percentage', 'Grade'].map(h => (
                                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {marks.length === 0 ? (
                              <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No records yet — add marks above</td></tr>
                            ) : marks.map((m, i) => {
                              const pct = ((m.marksObtained / m.totalMarks) * 100).toFixed(1);
                              const { grade, color } = getGrade(parseFloat(pct));
                              return (
                                <tr key={i} style={{ borderTop: '1px solid #edeef0' }}
                                  onMouseOver={e => e.currentTarget.style.background = '#f8f9fb'}
                                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '600', color: '#191c1e' }}>{m.subject}</td>
                                  <td style={{ padding: '14px 20px', fontSize: '12px', color: '#737686' }}>{m.examType}</td>
                                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#191c1e' }}>{m.marksObtained}</td>
                                  <td style={{ padding: '14px 20px', fontSize: '14px', color: '#737686' }}>{m.totalMarks}</td>
                                  <td style={{ padding: '14px 20px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color }}>{pct}%</span>
                                  </td>
                                  <td style={{ padding: '14px 20px' }}>
                                    <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', background: color + '18', color }}>{grade}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === 'summary' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {summary.length === 0 ? (
                          <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No data yet — add marks first!</div>
                        ) : (
                          <>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                              <h3 style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e', marginBottom: '16px' }}>Performance Radar</h3>
                              <ResponsiveContainer width="100%" height={280}>
                                <RadarChart data={summary.map(s => ({ subject: s.subject.slice(0, 8), score: parseFloat(s.percentage) }))}>
                                  <PolarGrid stroke="#f1f5f9" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#737686' }} />
                                  <Radar name="Performance" dataKey="score" stroke="#004ac6" fill="#004ac6" fillOpacity={0.15} strokeWidth={2} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                              {summary.map((s, i) => {
                                const { grade, color } = getGrade(parseFloat(s.percentage));
                                return (
                                  <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderTop: `3px solid ${color}` }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#191c1e', marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subject}</div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>
                                      <span style={{ fontSize: '32px', fontWeight: '800', color, fontFamily: 'Manrope' }}>{parseFloat(s.percentage).toFixed(1)}%</span>
                                      <span style={{ fontSize: '22px', fontWeight: '800', color: color + '80', fontFamily: 'Manrope' }}>{grade}</span>
                                    </div>
                                    <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${s.percentage}%`, background: color, borderRadius: '9999px' }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', padding: '60px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#c3c6d7' }}>analytics</span>
                  <p style={{ color: '#94a3b8', fontSize: '14px' }}>Select a student to view performance</p>
                </div>
              )}
            </section>
          </div>
        </main>

        <button style={{ position: 'fixed', bottom: '32px', right: '32px', width: '56px', height: '56px', background: '#131B2E', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 50 }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span className="material-symbols-outlined">support_agent</span>
        </button>
      </div>
    </>
  );
}