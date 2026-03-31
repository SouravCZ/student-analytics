import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

export default function Performance() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [marks, setMarks] = useState([]);
  const [summary, setSummary] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [form, setForm] = useState({ subject: '', examType: 'MidTerm', marksObtained: '', totalMarks: '', semester: 1 });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students', { headers });
      setStudents(res.data.data);
      if (res.data.data.length > 0) selectStudent(res.data.data[0]);
    } catch (err) { console.log(err); }
  };

  const selectStudent = async (student) => {
    setSelected(student);
    try {
      const [marksRes, summaryRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/marks/student/${student._id}`, { headers }),
        axios.get(`http://localhost:5000/api/marks/summary/${student._id}`, { headers })
      ]);
      setMarks(marksRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (err) { console.log(err); }
  };

  const handleAddMarks = async () => {
    if (!selected || !form.subject || !form.marksObtained || !form.totalMarks) {
      return setMessage('Please fill all fields!');
    }
    try {
      await axios.post('http://localhost:5000/api/marks', {
        studentId: selected._id,
        ...form,
        marksObtained: Number(form.marksObtained),
        totalMarks: Number(form.totalMarks)
      }, { headers });
      setMessage('Marks added successfully!');
      selectStudent(selected);
      setForm({ subject: '', examType: 'MidTerm', marksObtained: '', totalMarks: '', semester: 1 });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error adding marks!'); }
  };

  const getGrade = (pct) => {
    if (pct >= 90) return { grade: 'A+', color: '#059669' };
    if (pct >= 80) return { grade: 'A', color: '#2563eb' };
    if (pct >= 70) return { grade: 'B', color: '#7c3aed' };
    if (pct >= 60) return { grade: 'C', color: '#d97706' };
    return { grade: 'F', color: '#dc2626' };
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: 'white', color: '#0f172a', boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '24px' }}>
          📈 Performance
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>

          {/* Student list */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Students</p>
            </div>
            {students.map(s => (
              <button key={s._id} onClick={() => selectStudent(s)} style={{
                width: '100%', textAlign: 'left', padding: '12px 16px',
                border: 'none', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
                background: selected?._id === s._id ? '#eff6ff' : 'white',
                transition: 'background 0.15s'
              }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: selected?._id === s._id ? '#2563eb' : '#0f172a' }}>{s.name}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{s.rollNumber}</div>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div>
            {selected && (
              <>
                {/* Selected student header */}
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{selected.name}</h2>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{selected.department} · Semester {selected.semester} · {selected.rollNumber}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['add', 'records', 'summary'].map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        fontSize: '12px', fontWeight: '500', textTransform: 'capitalize',
                        background: activeTab === tab ? '#0f172a' : '#f1f5f9',
                        color: activeTab === tab ? 'white' : '#64748b',
                        transition: 'all 0.15s'
                      }}>{tab}</button>
                    ))}
                  </div>
                </div>

                {/* Add Marks Tab */}
                {activeTab === 'add' && (
                  <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '20px' }}>Add Marks</h3>
                    {message && (
                      <div style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', background: message.includes('Error') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') ? '#dc2626' : '#16a34a' }}>
                        {message}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Subject</label>
                        <input style={inputStyle} placeholder="e.g. Mathematics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Exam Type</label>
                        <select style={inputStyle} value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })}>
                          {['Assignment', 'MidTerm', 'Final', 'Quiz'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Marks Obtained</label>
                        <input style={inputStyle} type="number" placeholder="e.g. 85" value={form.marksObtained} onChange={e => setForm({ ...form, marksObtained: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Total Marks</label>
                        <input style={inputStyle} type="number" placeholder="e.g. 100" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Semester</label>
                        <input style={inputStyle} type="number" min="1" max="8" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} />
                      </div>
                    </div>
                    <button onClick={handleAddMarks} style={{
                      marginTop: '20px', padding: '10px 24px', background: '#2563eb',
                      color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px',
                      fontWeight: '600', cursor: 'pointer'
                    }}>Add Marks →</button>
                  </div>
                )}

                {/* Records Tab */}
                {activeTab === 'records' && (
                  <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          {['Subject', 'Exam Type', 'Marks', 'Total', 'Percentage'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {marks.length === 0 ? (
                          <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No records found</td></tr>
                        ) : marks.map((m, i) => {
                          const pct = ((m.marksObtained / m.totalMarks) * 100).toFixed(1);
                          const { grade, color } = getGrade(pct);
                          return (
                            <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{m.subject}</td>
                              <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>{m.examType}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#0f172a' }}>{m.marksObtained}</td>
                              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{m.totalMarks}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: color + '15', color }}>{pct}% · {grade}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Summary Tab */}
                {activeTab === 'summary' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {summary.length === 0 ? (
                      <div style={{ gridColumn: '1/-1', background: 'white', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', border: '1px solid #f1f5f9' }}>No data yet — add marks first!</div>
                    ) : summary.map((s, i) => {
                      const { grade, color } = getGrade(s.percentage);
                      return (
                        <div key={i} style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '20px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>{s.subject}</div>
                          <div style={{ fontSize: '32px', fontWeight: '700', color, letterSpacing: '-1px' }}>{s.percentage}%</div>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: color + '80', marginTop: '2px' }}>{grade}</div>
                          <div style={{ marginTop: '12px', height: '4px', background: '#f1f5f9', borderRadius: '2px' }}>
                            <div style={{ height: '100%', width: `${s.percentage}%`, background: color, borderRadius: '2px', transition: 'width 0.5s' }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}