import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        navigate('/dashboard');
      } else {
        setError('Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      
      {/* Left decorative panel */}
      <div style={{
        display: 'none',
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '42%',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #2563eb 100%)',
        padding: '60px',
        flexDirection: 'column', justifyContent: 'space-between'
      }} className="lg:flex">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '80px' }}>
            <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '16px' }}>◈</span>
            </div>
            <span style={{ color: 'white', fontWeight: '600', fontSize: '16px', letterSpacing: '-0.3px' }}>StudentAnalytics</span>
          </div>
          <h2 style={{ color: 'white', fontSize: '40px', fontWeight: '700', lineHeight: '1.2', letterSpacing: '-1px', marginBottom: '20px' }}>
            Track. Analyze.<br />Improve.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.7', maxWidth: '340px' }}>
            A unified platform to monitor student attendance, academic performance, and early intervention alerts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '40px' }}>
          {[['98%', 'Accuracy'], ['3x', 'Faster Reports'], ['500+', 'Students']].map(([val, label]) => (
            <div key={label}>
              <div style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>{val}</div>
              <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Login form */}
      <div style={{ width: '100%', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }} className="lg:mr-[10%]">
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
            <div style={{ width: '28px', height: '28px', background: '#2563eb', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: '14px' }}>◈</span>
            </div>
            <span style={{ fontWeight: '600', fontSize: '15px', color: '#0f172a' }}>StudentAnalytics</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '8px' }}>Welcome back</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Sign in to your account to continue</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
                borderRadius: '10px', fontSize: '14px', outline: 'none',
                background: 'white', color: '#0f172a', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
                borderRadius: '10px', fontSize: '14px', outline: 'none',
                background: 'white', color: '#0f172a', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: loading ? '#93c5fd' : '#2563eb',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px',
              fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px', transition: 'background 0.2s', letterSpacing: '-0.1px'
            }}
            onMouseOver={e => !loading && (e.target.style.background = '#1d4ed8')}
            onMouseOut={e => !loading && (e.target.style.background = '#2563eb')}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '32px' }}>
          Default: admin@test.com / 123456
        </p>
      </div>
    </div>
  );
}