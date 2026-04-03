import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const studentsRes = await axios.get('http://localhost:5000/api/students', { headers });
      const studentList = studentsRes.data.data;
      setStudents(studentList);

      // Fetch attendance summary for each student
      const attendanceSummaries = await Promise.all(
        studentList.map(s => axios.get(`http://localhost:5000/api/attendance/summary/${s._id}`, { headers }))
      );
      setAttendanceData(studentList.map((s, i) => ({
        name: s.name.split(' ')[0],
        percentage: parseFloat(attendanceSummaries[i].data.data.percentage) || 0
      })));

      // Fetch performance summary for each student
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
    ? (attendanceData.reduce((s, d) => s + d.percentage, 0) / attendanceData.length).toFixed(1)
    : 0;

  const avgPerformance = performanceData.length > 0
    ? (performanceData.reduce((s, d) => s + d.avg, 0) / performanceData.length).toFixed(1)
    : 0;

  const atRisk = attendanceData.filter(d => d.percentage < 75).length;

  const pieData = [
    { name: 'Good (≥75%)', value: attendanceData.filter(d => d.percentage >= 75).length },
    { name: 'Average (50-74%)', value: attendanceData.filter(d => d.percentage >= 50 && d.percentage < 75).length },
    { name: 'At Risk (<50%)', value: attendanceData.filter(d => d.percentage < 50).length },
  ].filter(d => d.value > 0);

  const PIE_COLORS = ['#059669', '#d97706', '#dc2626'];

  const stats = [
    { label: 'Total Students', value: students.length, icon: '◉', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: '◫', color: '#059669', bg: '#ecfdf5' },
    { label: 'Avg Performance', value: `${avgPerformance}%`, icon: '◈', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'At Risk', value: atRisk, icon: '⚠', color: '#dc2626', bg: '#fef2f2' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Good morning, {user?.name} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '18px', color: stat.color }}>{stat.icon}</span>
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>
                  {loading ? '...' : stat.value}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Attendance Bar Chart */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>📅 Attendance by Student</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Overall attendance percentage</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip formatter={(val) => [`${val}%`, 'Attendance']} />
                <Bar dataKey="percentage" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Bar Chart */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>📈 Performance by Student</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Average marks percentage</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip formatter={(val) => [`${val}%`, 'Performance']} />
                <Bar dataKey="avg" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Pie Chart */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>🎯 Attendance Distribution</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Student risk breakdown</p>
            {pieData.length === 0 ? (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* At Risk Table */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>⚠️ At Risk Students</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Attendance below 75%</p>
            {attendanceData.filter(d => d.percentage < 75).length === 0 ? (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                  <p style={{ color: '#94a3b8', fontSize: '13px' }}>All students are on track!</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {attendanceData.filter(d => d.percentage < 75).map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fef2f2', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{s.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#dc2626' }}>{s.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}