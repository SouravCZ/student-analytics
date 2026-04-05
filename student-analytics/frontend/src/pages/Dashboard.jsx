import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = window.location.pathname;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Students', path: '/students', icon: 'group' },
    { label: 'Attendance', path: '/attendance', icon: 'event_available' },
    { label: 'Performance', path: '/performance', icon: 'trending_up' },
    { label: 'Alerts', path: '/alerts', icon: 'warning' },
    { label: 'Reports', path: '/reports', icon: 'description' },
  ];

  return (
    <aside style={{
      width: '256px', height: '100vh', position: 'fixed', left: 0, top: 0,
      background: '#131B2E', display: 'flex', flexDirection: 'column',
      padding: '32px 0', zIndex: 50, overflowY: 'auto'
    }}>
      <div style={{ padding: '0 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #004ac6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', fontSize: '18px' }}>◈</span>
        </div>
        <div>
          <h1 style={{ color: 'white', fontSize: '16px', fontWeight: '800', lineHeight: 1.2 }}>Analytics Pro</h1>
          <p style={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '700' }}>Academic Management</p>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 0' }}>
        {navItems.map(item => {
          const active = location === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 24px', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: active ? 'rgba(37,99,235,0.1)' : 'transparent',
              borderRight: active ? '4px solid #3b82f6' : '4px solid transparent',
              color: active ? 'white' : '#94a3b8',
              fontSize: '14px', fontWeight: '500', transition: 'all 0.2s'
            }}
              onMouseOver={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseOut={e => !active && (e.currentTarget.style.background = 'transparent')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: active ? '#3b82f6' : '#94a3b8' }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
        {[{ label: 'Settings', icon: 'settings' }, { label: 'Support', icon: 'contact_support' }].map(item => (
          <button key={item.label} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 24px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#94a3b8', fontSize: '14px', fontWeight: '500'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
};

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

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const studentsRes = await axios.get('http://localhost:5000/api/students', { headers });
      const studentList = studentsRes.data.data;
      setStudents(studentList);

      const attendanceSummaries = await Promise.all(
        studentList.map(s => axios.get(`http://localhost:5000/api/attendance/summary/${s._id}`, { headers }))
      );
      const attData = studentList.map((s, i) => ({
        name: s.name.split(' ')[0],
        percentage: parseFloat(attendanceSummaries[i].data.data.percentage) || 0,
        fullData: attendanceSummaries[i].data.data,
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
          ? (subjects.reduce((sum, sub) => sum + parseFloat(sub.percentage), 0) / subjects.length).toFixed(1)
          : 0;
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
  const PIE_COLORS = ['#006243', '#004ac6', '#ba1a1a'];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; font-family: 'Material Symbols Outlined'; }`}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fb', fontFamily: 'Inter, sans-serif' }}>
        <Sidebar />

        <main style={{ marginLeft: '256px', flex: 1 }}>
          {/* Top Bar */}
          <header style={{
            position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px', height: '64px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope' }}>Academic Curator</span>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#94a3b8' }}>search</span>
                <input placeholder="Search student records..." style={{
                  paddingLeft: '36px', paddingRight: '16px', paddingTop: '6px', paddingBottom: '6px',
                  background: '#f2f4f6', border: 'none', borderRadius: '9999px',
                  fontSize: '13px', width: '240px', outline: 'none'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <span className="material-symbols-outlined" style={{ color: '#64748b', cursor: 'pointer' }}>notifications</span>
              <span className="material-symbols-outlined" style={{ color: '#64748b', cursor: 'pointer' }}>help_outline</span>
              <div style={{ width: '1px', height: '32px', background: '#e2e8f0' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{user?.name}</p>
                  <p style={{ fontSize: '10px', color: '#64748b' }}>{user?.role}</p>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>
                  {user?.name?.charAt(0)}
                </div>
                <button onClick={() => { logout(); navigate('/'); }} style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
              </div>
            </div>
          </header>

          {/* Body */}
          <div style={{ padding: '32px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope', letterSpacing: '-0.5px' }}>Institutional Overview</h2>
                <p style={{ color: '#737686', marginTop: '4px', fontWeight: '500', fontSize: '14px' }}>Real-time academic performance & engagement metrics</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span> Last 30 Days
                </button>
                <button style={{ padding: '8px 24px', background: 'linear-gradient(135deg, #004ac6, #2563eb)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Export Report
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
              {[
                { label: 'Total Students', value: loading ? '...' : students.length, icon: 'group', border: '#004ac6', iconBg: 'rgba(0,74,198,0.1)', iconColor: '#004ac6', badge: '+12%', badgeColor: '#006243' },
                { label: 'Avg Attendance', value: loading ? '...' : `${avgAttendance}%`, icon: 'calendar_month', border: '#60a5fa', iconBg: '#dbeafe', iconColor: '#2563eb', badge: '-2.4%', badgeColor: '#ba1a1a' },
                { label: 'Avg Performance', value: loading ? '...' : `${avgPerformance}%`, icon: 'auto_graph', border: '#006243', iconBg: 'rgba(0,98,67,0.1)', iconColor: '#006243', badge: 'Stable', badgeColor: '#006243' },
                { label: 'At Risk', value: loading ? '...' : atRiskStudents.length, icon: 'warning', border: '#ba1a1a', iconBg: 'rgba(186,26,26,0.1)', iconColor: '#ba1a1a', badge: 'High', badgeColor: '#ba1a1a' },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 12px 40px rgba(15,23,42,0.06)', borderLeft: `4px solid ${stat.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span className="material-symbols-outlined" style={{ padding: '8px', background: stat.iconBg, color: stat.iconColor, borderRadius: '8px', fontSize: '20px' }}>{stat.icon}</span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: stat.badgeColor, padding: '2px 8px', background: stat.badgeColor + '18', borderRadius: '9999px' }}>{stat.badge}</span>
                  </div>
                  <h3 style={{ fontSize: '10px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{stat.label}</h3>
                  <p style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope', letterSpacing: '-1px' }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Bar Chart */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 12px 40px rgba(15,23,42,0.06)', height: '400px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', fontFamily: 'Manrope' }}>Attendance by Student</h3>
                    <p style={{ fontSize: '13px', color: '#737686' }}>Individual participation percentage tracking</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#004ac6' }}></div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Attendance %</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <Tooltip formatter={(val) => [`${val}%`, 'Attendance']} />
                      <Bar dataKey="percentage" fill="#004ac6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 12px 40px rgba(15,23,42,0.06)', height: '400px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', fontFamily: 'Manrope', marginBottom: '4px' }}>Attendance Distribution</h3>
                <p style={{ fontSize: '13px', color: '#737686', marginBottom: '24px' }}>Cohort health segmentation</p>
                <div style={{ flex: 1 }}>
                  {pieData.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#e2e8f0' }}>donut_large</span>
                      <p style={{ fontSize: '13px', color: '#94a3b8' }}>No data yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="45%" outerRadius={80} innerRadius={50} dataKey="value">
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* At Risk Panel */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 12px 40px rgba(15,23,42,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', fontFamily: 'Manrope', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>report</span>
                    At-Risk Students
                  </h3>
                  <p style={{ fontSize: '13px', color: '#737686', fontWeight: '500' }}>
                    {atRiskStudents.length > 0 ? `Immediate intervention required for ${atRiskStudents.length} students` : 'All students are on track!'}
                  </p>
                </div>
                <button onClick={() => navigate('/alerts')} style={{ fontSize: '13px', fontWeight: '700', color: '#004ac6', background: 'none', border: 'none', cursor: 'pointer' }}>View All Alerts</button>
              </div>

              <div style={{ padding: '16px', background: 'rgba(242,244,246,0.3)' }}>
                {atRiskStudents.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#006243' }}>check_circle</span>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>All students are on track!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {atRiskStudents.slice(0, 3).map((s, i) => (
                      <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid rgba(186,26,26,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ba1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                            {s.student.name.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{s.student.name}</h4>
                            <p style={{ fontSize: '11px', color: '#737686' }}>{s.student.rollNumber}</p>
                          </div>
                          <div style={{ background: 'rgba(186,26,26,0.1)', color: '#ba1a1a', padding: '4px 8px', borderRadius: '6px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_down</span>
                          </div>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#737686', textTransform: 'uppercase', marginBottom: '4px' }}>
                            <span>Attendance</span>
                            <span style={{ color: '#ba1a1a' }}>{s.percentage}%</span>
                          </div>
                          <div style={{ height: '6px', background: '#e1e2e4', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${s.percentage}%`, background: '#ba1a1a', borderRadius: '9999px' }}></div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => navigate('/reports')} style={{ flex: 1, padding: '8px', background: '#f2f4f6', color: '#191c1e', fontSize: '12px', fontWeight: '700', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Details</button>
                          <button style={{ padding: '8px 12px', background: 'rgba(0,74,198,0.1)', color: '#004ac6', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}