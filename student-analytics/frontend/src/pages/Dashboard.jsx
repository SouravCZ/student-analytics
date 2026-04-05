import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Students', path: '/students', icon: 'group' },
    { label: 'Attendance', path: '/attendance', icon: 'calendar_today' },
    { label: 'Performance', path: '/performance', icon: 'insights' },
    { label: 'Alerts', path: '/alerts', icon: 'notifications_active' },
    { label: 'Reports', path: '/reports', icon: 'description' },
  ];

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const studentsRes = await axios.get('http://localhost:5000/api/students', { headers });
      const studentList = studentsRes.data.data.filter(s =>
        !user.department || s.department === user.department
      );
      setStudents(studentList);

      const attendanceSummaries = await Promise.all(
        studentList.map(s => axios.get(`http://localhost:5000/api/attendance/summary/${s._id}`, { headers }))
      );
      const attData = studentList.map((s, i) => ({
        name: s.name.split(' ')[0],
        percentage: parseFloat(attendanceSummaries[i].data.data.percentage) || 0,
        student: s
      }));
      setAttendanceData(attData);
      setAtRiskStudents(attData.filter(d => d.percentage < 75));

      const perfSummaries = await Promise.all(
        studentList.map(s => axios.get(`http://localhost:5000/api/marks/summary/${s._id}`, { headers }))
      );
      setPerformanceData(studentList.map((s, i) => {
        const subjects = perfSummaries[i].data.data;
        const avg = subjects.length > 0
          ? (subjects.reduce((sum, sub) => sum + parseFloat(sub.percentage), 0) / subjects.length).toFixed(1) : 0;
        return { name: s.name.split(' ')[0], avg: parseFloat(avg) };
      }));
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const avgAttendance = attendanceData.length > 0
    ? (attendanceData.reduce((s, d) => s + d.percentage, 0) / attendanceData.length).toFixed(1) : 0;
  const avgPerformance = performanceData.length > 0
    ? (performanceData.reduce((s, d) => s + d.avg, 0) / performanceData.length).toFixed(1) : 0;

  const pieData = [
    { name: 'Excellent (>95%)', value: attendanceData.filter(d => d.percentage > 95).length },
    { name: 'Standard (80-95%)', value: attendanceData.filter(d => d.percentage >= 80 && d.percentage <= 95).length },
    { name: 'Critical (<75%)', value: attendanceData.filter(d => d.percentage < 75).length },
  ].filter(d => d.value > 0);
  const PIE_COLORS = ['#006243', '#2563eb', '#ba1a1a'];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined';} .editorial-shadow{box-shadow:0 12px 40px rgba(15,23,42,0.04);}`}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fb', fontFamily: 'Inter, sans-serif' }}>

        {/* Sidebar */}
        <aside style={{ width: '256px', height: '100vh', position: 'fixed', left: 0, top: 0, background: '#131B2E', display: 'flex', flexDirection: 'column', padding: '24px', gap: '8px', zIndex: 50 }}>
          <div style={{ marginBottom: '32px', padding: '0 8px' }}>
            <h1 style={{ color: 'white', fontSize: '18px', fontWeight: '700', fontFamily: 'Manrope', letterSpacing: '-0.3px' }}>Academic Portal</h1>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>HOD Dashboard</p>
            {user?.department && (
              <div style={{ marginTop: '12px', background: 'rgba(37,99,235,0.15)', borderRadius: '8px', padding: '8px 10px' }}>
                <p style={{ color: '#60a5fa', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</p>
                <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>{user.department}</p>
              </div>
            )}
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => {
              const active = window.location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', border: 'none', cursor: 'pointer', borderRadius: '8px',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: active ? 'white' : '#94a3b8',
                  fontSize: '14px', fontWeight: active ? '600' : '400',
                  fontFamily: 'Manrope', transition: 'all 0.2s', textAlign: 'left'
                }}
                  onMouseOver={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseOut={e => !active && (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', cursor: 'pointer', borderRadius: '8px', background: 'transparent', color: '#94a3b8', fontSize: '14px', fontFamily: 'Manrope' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
              Settings
            </button>
            <button onClick={() => { logout(); navigate('/'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', cursor: 'pointer', borderRadius: '8px', background: 'transparent', color: '#94a3b8', fontSize: '14px', fontFamily: 'Manrope' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft: '256px', flex: 1, minHeight: '100vh' }}>

          {/* Top Bar */}
          <header style={{ height: '64px', position: 'sticky', top: 0, zIndex: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: '#f8f9fb', boxSizing: 'border-box' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '480px' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#737686', fontSize: '20px' }}>search</span>
              <input placeholder="Search student metrics or reports..." style={{ width: '100%', background: '#f2f4f6', border: 'none', borderRadius: '9999px', padding: '8px 16px 8px 40px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ color: '#475569', fontSize: '24px' }}>notifications</span>
                {atRiskStudents.length > 0 && <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#ba1a1a', borderRadius: '50%' }}></span>}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '24px', borderLeft: '1px solid #c3c6d7' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#131B2E' }}>{user?.name}</p>
                  <p style={{ fontSize: '10px', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>HOD {user?.department}</p>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {user?.name?.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Manrope', color: '#191c1e', letterSpacing: '-0.5px' }}>Department Overview</h2>
              <p style={{ color: '#737686', marginTop: '4px', fontSize: '14px' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
              {[
                { label: 'Total Students', value: students.length, border: '#004ac6', badge: '+2.4%', badgeColor: '#006243', badgeBg: 'rgba(0,98,67,0.1)', icon: 'trending_up' },
                { label: 'Avg Attendance', value: `${avgAttendance}%`, border: '#006243', badge: 'Stable', badgeColor: '#006243', badgeBg: 'rgba(0,98,67,0.1)', icon: 'check_circle' },
                { label: 'Avg Performance', value: `${avgPerformance}%`, border: '#565e74', badge: 'B+', badgeColor: '#3f465c', badgeBg: '#dae2fd', icon: 'school' },
                { label: 'At Risk', value: atRiskStudents.length, border: '#ba1a1a', badge: 'Urgent', badgeColor: '#ba1a1a', badgeBg: 'rgba(186,26,26,0.1)', icon: 'warning' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '12px', borderLeft: `4px solid ${s.border}`, boxShadow: '0 12px 40px rgba(15,23,42,0.04)' }}>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{s.label}</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e' }}>{loading ? '...' : s.value}</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: s.badgeColor, background: s.badgeBg, padding: '4px 8px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{s.icon}</span>
                      {s.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>

              {/* Attendance Bar Chart */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 12px 40px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e' }}>Attendance by Student</h3>
                    <p style={{ fontSize: '13px', color: '#737686', marginTop: '2px' }}>Individual participation tracking</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip formatter={(val) => [`${val}%`, 'Attendance']} />
                    <Bar dataKey="percentage" fill="#b4c5ff" radius={[4, 4, 0, 0]}
                      onMouseOver={(data, index, e) => e && (e.target.style.fill = '#004ac6')}
                      onMouseOut={(data, index, e) => e && (e.target.style.fill = '#b4c5ff')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Donut Chart */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 12px 40px rgba(15,23,42,0.04)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e', marginBottom: '4px' }}>Attendance Distribution</h3>
                <p style={{ fontSize: '13px', color: '#737686', marginBottom: '24px' }}>Engagement segmentation</p>
                <div style={{ flex: 1 }}>
                  {pieData.length === 0 ? (
                    <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#e1e2e4' }}>donut_large</span>
                      <p style={{ fontSize: '13px', color: '#94a3b8' }}>No data yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value">
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                  {[
                    { label: 'Excellent (>95%)', color: '#006243', value: attendanceData.filter(d => d.percentage > 95).length },
                    { label: 'Standard (80-95%)', color: '#2563eb', value: attendanceData.filter(d => d.percentage >= 80 && d.percentage <= 95).length },
                    { label: 'Critical (<75%)', color: '#ba1a1a', value: attendanceData.filter(d => d.percentage < 75).length },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                        <span style={{ fontSize: '13px', color: '#191c1e' }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#191c1e' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

              {/* Performance Bar Chart */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 12px 40px rgba(15,23,42,0.04)' }}>
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e' }}>Student Performance Matrix</h3>
                  <p style={{ fontSize: '13px', color: '#737686', marginTop: '2px' }}>Average marks percentage per student</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip formatter={(val) => [`${val}%`, 'Performance']} />
                    <Bar dataKey="avg" fill="#004ac6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* At Risk Panel */}
              <div style={{ background: '#f2f4f6', padding: '32px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'Manrope', color: '#191c1e' }}>At-Risk Students</h3>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#ba1a1a', background: 'rgba(186,26,26,0.1)', padding: '2px 8px', borderRadius: '4px' }}>URGENT</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {atRiskStudents.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#006243' }}>check_circle</span>
                      <p style={{ color: '#737686', fontSize: '13px', marginTop: '8px' }}>All students on track!</p>
                    </div>
                  ) : atRiskStudents.slice(0, 3).map((s, i) => (
                    <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #c3c6d720' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#edeef0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#004ac6', fontSize: '14px', flexShrink: 0 }}>
                          {s.student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#191c1e' }}>{s.student.name}</h4>
                          <p style={{ fontSize: '10px', color: '#737686' }}>{s.student.rollNumber}</p>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '700', marginBottom: '4px' }}>
                          <span style={{ color: '#737686', textTransform: 'uppercase' }}>Attendance</span>
                          <span style={{ color: s.percentage < 60 ? '#ba1a1a' : '#565e74' }}>{s.percentage}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#e1e2e4', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s.percentage}%`, background: s.percentage < 60 ? '#ba1a1a' : '#565e74', borderRadius: '9999px' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => navigate('/alerts')} style={{ width: '100%', padding: '12px', fontSize: '11px', fontWeight: '700', color: '#004ac6', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>
                    View All Risk Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* FAB */}
        <button onClick={() => navigate('/students')} style={{ position: 'fixed', bottom: '32px', right: '32px', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #004ac6, #2563eb)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(15,23,42,0.15)', transition: 'all 0.2s' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>add</span>
        </button>
      </div>
    </>
  );
}