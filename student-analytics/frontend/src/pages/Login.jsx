import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Physics', 'Mathematics', 'Chemistry'];

export default function Login() {
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('Student');
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
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
        if (role === 'Admin' && !form.department) return setError('Please select your department!');
        if (!form.name || !form.email || !form.password) return setError('Please fill all fields!');
        await axios.post('http://localhost:5000/api/auth/register', {
          name: form.name, email: form.email, password: form.password,
          role, department: form.department
        });
        setSuccess('Account created! Please sign in.');
        setTab('login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined';}`}</style>

      <div style={{ minHeight: '100vh', background: '#f8f9fb', display: 'flex', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

        {/* Sidebar */}
        <aside style={{ width: '256px', height: '100vh', position: 'fixed', left: 0, top: 0, background: '#131B2E', display: 'flex', flexDirection: 'column', padding: '24px', gap: '32px', zIndex: 50, boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '18px' }}>analytics</span>
              </div>
              <span style={{ color: 'white', fontWeight: '800', fontSize: '18px', fontFamily: 'Manrope' }}>Curator Analytics</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Manrope' }}>Precision & Fluidity</p>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Sign In', icon: 'login', key: 'login' },
              { label: 'Register', icon: 'person_add', key: 'register' }
            ].map(item => (
              <button key={item.key} onClick={() => { setTab(item.key); setError(''); setSuccess(''); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', border: 'none', cursor: 'pointer', borderRadius: '8px',
                background: tab === item.key ? 'rgba(37,99,235,0.2)' : 'transparent',
                color: tab === item.key ? 'white' : '#94a3b8',
                fontSize: '14px', fontWeight: tab === item.key ? '700' : '400',
                fontFamily: 'Manrope', letterSpacing: '0.05em', transition: 'all 0.2s'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.6' }}>
              Access the academic dashboard to monitor performance trends and attendance metrics in real-time.
            </p>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft: '256px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8f9fb' }}>

          {/* Top Bar */}
          <header style={{ position: 'fixed', top: 0, right: 0, left: '256px', zIndex: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', fontFamily: 'Manrope', letterSpacing: '-0.3px' }}>Academic Curator</span>
            <button style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px' }}>Help</button>
          </header>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', marginTop: '64px' }}>
            <div style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'white', borderRadius: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.12)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)' }}>

              {/* Left Brand Panel */}
              <div style={{ background: '#131B2E', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h2 style={{ fontSize: '36px', fontWeight: '700', color: 'white', fontFamily: 'Manrope', lineHeight: '1.2', marginBottom: '16px' }}>
                    Elevate Institutional Insights.
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '280px', lineHeight: '1.6' }}>
                    Precision data visualization for modern academic environments.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
                  {[
                    { icon: 'trending_up', text: 'Real-time Performance Tracking', color: '#68dba9' },
                    { icon: 'calendar_today', text: 'Attendance Pattern Recognition', color: '#b4c5ff' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span className="material-symbols-outlined" style={{ color: item.color, fontSize: '20px' }}>{item.icon}</span>
                      <span style={{ color: 'white', fontSize: '14px' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
                {/* Decorative orbs */}
                <div style={{ position: 'absolute', top: '-96px', right: '-96px', width: '256px', height: '256px', background: 'rgba(0,74,198,0.2)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-96px', left: '-96px', width: '256px', height: '256px', background: 'rgba(0,125,87,0.1)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
              </div>

              {/* Right Form Panel */}
              <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#191c1e', fontFamily: 'Manrope', marginBottom: '8px' }}>
                    {tab === 'login' ? 'Welcome back' : 'Create account'}
                  </h1>
                  <p style={{ color: '#737686', fontFamily: 'Inter' }}>
                    {tab === 'login' ? 'Sign in to your curator dashboard' : 'Register to access your portal'}
                  </p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', background: '#f2f4f6', padding: '6px', borderRadius: '12px', marginBottom: '28px' }}>
                  {['login', 'register'].map(t => (
                    <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }} style={{
                      flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '14px', fontWeight: '600',
                      background: tab === t ? 'white' : 'transparent',
                      color: tab === t ? '#004ac6' : '#737686',
                      boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s'
                    }}>{t === 'login' ? 'Sign In' : 'Register'}</button>
                  ))}
                </div>

                {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
                {success && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Role selector */}
                  {tab === 'register' && (
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737686', marginBottom: '8px' }}>Account Role</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {['Student', 'Admin'].map(r => (
                          <button key={r} onClick={() => setRole(r)} style={{
                            padding: '12px', border: `1.5px solid ${role === r ? '#004ac6' : '#c3c6d7'}`,
                            borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                            background: role === r ? 'rgba(0,74,198,0.05)' : 'white',
                            color: role === r ? '#004ac6' : '#191c1e',
                            transition: 'all 0.2s'
                          }}>{r === 'Admin' ? 'HOD / Admin' : 'Student'}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Name field */}
                  {tab === 'register' && (
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737686', display: 'block', marginBottom: '8px' }}>Full Name</label>
                      <input
                        placeholder="Your full name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        style={{ width: '100%', padding: '14px 16px', background: '#f2f4f6', border: 'none', borderRadius: '12px', fontSize: '14px', outline: 'none', color: '#191c1e', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737686', display: 'block', marginBottom: '8px' }}>Email Address</label>
                    <input
                      type="email"
                      placeholder="curator@institution.edu"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      style={{ width: '100%', padding: '14px 16px', background: '#f2f4f6', border: 'none', borderRadius: '12px', fontSize: '14px', outline: 'none', color: '#191c1e', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737686', display: 'block', marginBottom: '8px' }}>Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      style={{ width: '100%', padding: '14px 16px', background: '#f2f4f6', border: 'none', borderRadius: '12px', fontSize: '14px', outline: 'none', color: '#191c1e', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Department — HOD only */}
                  {tab === 'register' && role === 'Admin' && (
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737686', display: 'block', marginBottom: '8px' }}>Department</label>
                      <select
                        value={form.department}
                        onChange={e => setForm({ ...form, department: e.target.value })}
                        style={{ width: '100%', padding: '14px 16px', background: '#f2f4f6', border: 'none', borderRadius: '12px', fontSize: '14px', outline: 'none', color: '#191c1e', boxSizing: 'border-box' }}
                      >
                        <option value="">Select your department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '16px',
                      background: loading ? '#93c5fd' : 'linear-gradient(135deg, #004ac6, #2563eb)',
                      color: 'white', border: 'none', borderRadius: '12px',
                      fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      boxShadow: '0 8px 20px rgba(0,74,198,0.2)', transition: 'all 0.2s'
                    }}
                  >
                    {loading ? 'Please wait...' : tab === 'login' ? 'Access Dashboard' : 'Create Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}