import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      if (tab === 'login') {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email: form.email, password: form.password });
        if (res.data.success) {
          login(res.data.user, res.data.token);
          navigate(res.data.user.role === 'Admin' ? '/dashboard' : '/student-dashboard');
        }
      } else {
        await axios.post('http://localhost:5000/api/auth/register', { name: form.name, email: form.email, password: form.password, role: 'Student' });
        setSuccess('Account created! Please login.');
        setTab('login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', outline: 'none',
    background: 'white', color: '#0f172a', boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '44px', height: '44px', background: '#2563eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ color: 'white', fontSize: '20px' }}>◈</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>StudentAnalytics</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Academic Management System</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }} style={{
              flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', textTransform: 'capitalize',
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? '#0f172a' : '#64748b',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}>{t === 'login' ? 'Sign In' : 'Register'}</button>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
          {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tab === 'register' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Full Name</label>
                <input style={inputStyle} placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            )}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Email</label>
              <input style={inputStyle} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Password</label>
              <input style={inputStyle} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <button onClick={handleSubmit} disabled={loading} style={{
              width: '100%', padding: '12px', background: loading ? '#93c5fd' : '#2563eb',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px',
              fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px'
            }}>
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </div>

          {tab === 'login' && (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '20px' }}>
              Admin: admin@test.com / 123456
            </p>
          )}
        </div>
      </div>
    </div>
  );
}