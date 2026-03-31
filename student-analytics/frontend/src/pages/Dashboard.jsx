import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/students', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStudentCount(res.data.data.length))
      .catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Students', value: studentCount, icon: '◉', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Avg Attendance', value: '—', icon: '◫', color: '#059669', bg: '#ecfdf5' },
    { label: 'Avg Performance', value: '—', icon: '◈', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'At Risk', value: '0', icon: '⚠', color: '#dc2626', bg: '#fef2f2' },
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '14px', padding: '20px',
              border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '14px'
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '18px', color: stat.color }}>{stat.icon}</span>
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart placeholders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[['📈 Performance Trend', 'Charts coming in Step 8'], ['📅 Attendance Overview', 'Charts coming in Step 8']].map(([title, sub]) => (
            <div key={title} style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{title}</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '24px' }}>{sub}</p>
              <div style={{ height: '160px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>Visualization placeholder</span>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}