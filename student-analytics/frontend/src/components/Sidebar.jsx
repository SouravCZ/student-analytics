import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '▣' },
  { label: 'Students', path: '/students', icon: '◉' },
  { label: 'Attendance', path: '/attendance', icon: '◫' },
  { label: 'Performance', path: '/performance', icon: '◈' },
  { label: 'Reports', path: '/reports', icon: '◧' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{
      width: '220px', minHeight: '100vh', background: '#0f172a',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      borderRight: '1px solid #1e293b'
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: '#2563eb', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '14px' }}>◈</span>
          </div>
          <span style={{ color: 'white', fontWeight: '600', fontSize: '14px', letterSpacing: '-0.3px' }}>StudentAnalytics</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <p style={{ color: '#475569', fontSize: '11px', fontWeight: '600', letterSpacing: '0.8px', padding: '0 8px', marginBottom: '8px', textTransform: 'uppercase' }}>Menu</p>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%', textAlign: 'left', padding: '9px 12px',
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px',
                background: active ? '#1e3a5f' : 'transparent',
                color: active ? '#60a5fa' : '#94a3b8',
                fontSize: '13.5px', fontWeight: active ? '600' : '400',
                transition: 'all 0.15s'
              }}
              onMouseOver={e => !active && (e.currentTarget.style.background = '#1e293b')}
              onMouseOut={e => !active && (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: '13px' }}>{item.icon}</span>
              {item.label}
              {active && <span style={{ marginLeft: 'auto', width: '5px', height: '5px', borderRadius: '50%', background: '#2563eb' }}></span>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #1e293b' }}>
        <div style={{ padding: '10px 12px', background: '#1e293b', borderRadius: '8px', marginBottom: '8px' }}>
          <div style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>{user?.name}</div>
          <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>{user?.role}</div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '8px', background: 'transparent',
            color: '#ef4444', border: '1px solid #1e293b', borderRadius: '8px',
            fontSize: '13px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s'
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#450a0a'; e.currentTarget.style.borderColor = '#ef4444'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#1e293b'; }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}