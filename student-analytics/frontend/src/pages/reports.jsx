import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

export default function Reports() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students', { headers });
      setStudents(res.data.data);
    } catch (err) { console.log(err); }
  };

  const generateReport = async (student) => {
    setSelected(student);
    setLoading(true);
    try {
      const [attendanceRes, marksRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/attendance/summary/${student._id}`, { headers }),
        axios.get(`http://localhost:5000/api/marks/summary/${student._id}`, { headers })
      ]);
      setReport({
        attendance: attendanceRes.data.data,
        performance: marksRes.data.data
      });
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const getStatus = (pct) => {
    if (pct >= 75) return { label: 'Good', color: '#059669', bg: '#ecfdf5' };
    if (pct >= 50) return { label: 'Average', color: '#d97706', bg: '#fffbeb' };
    return { label: 'At Risk', color: '#dc2626', bg: '#fef2f2' };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '24px' }}>◧ Reports</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>

          {/* Student list */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Student</p>
            </div>
            {students.map(s => (
              <button key={s._id} onClick={() => generateReport(s)} style={{
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

          {/* Report */}
          <div>
            {!selected && (
              <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>◧</div>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Select a student to generate their report</p>
              </div>
            )}

            {loading && (
              <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '60px', textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>Generating report...</p>
              </div>
            )}

            {selected && report && !loading && (
              <>
                {/* Student Info */}
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '24px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.3px' }}>{selected.name}</h2>
                      <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{selected.department} · Sem {selected.semester} · {selected.rollNumber}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Report generated</div>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', marginTop: '2px' }}>
                        {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '24px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>📅 Attendance Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[
                      { label: 'Total Classes', value: report.attendance.total },
                      { label: 'Present', value: report.attendance.present },
                      { label: 'Attendance %', value: `${report.attendance.percentage}%` }
                    ].map(({ label, value }) => {
                      const status = label === 'Attendance %' ? getStatus(parseFloat(report.attendance.percentage)) : null;
                      return (
                        <div key={label} style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px' }}>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: status ? status.color : '#0f172a', letterSpacing: '-0.5px' }}>{value}</div>
                          {status && (
                            <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: status.bg, color: status.color, marginTop: '6px', display: 'inline-block' }}>{status.label}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Performance Summary */}
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '24px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>📈 Performance Summary</h3>
                  {report.performance.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>No marks data available</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {report.performance.map((p, i) => {
                        const status = getStatus(parseFloat(p.percentage));
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '120px', fontSize: '13px', fontWeight: '500', color: '#0f172a', flexShrink: 0 }}>{p.subject}</div>
                            <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                              <div style={{ height: '100%', width: `${p.percentage}%`, background: status.color, borderRadius: '3px', transition: 'width 0.5s' }}></div>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: status.color, width: '45px', textAlign: 'right' }}>{p.percentage}%</span>
                            <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: status.bg, color: status.color, width: '60px', textAlign: 'center' }}>{status.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}