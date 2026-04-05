import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '72px', fontWeight: '800', color: '#e2e8f0', letterSpacing: '-4px', marginBottom: '8px' }}>404</div>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Page not found</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px' }}>The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')} style={{
          padding: '10px 24px', background: '#2563eb', color: 'white',
          border: 'none', borderRadius: '8px', fontSize: '13px',
          fontWeight: '600', cursor: 'pointer'
        }}>Go to Dashboard →</button>
      </div>
    </div>
  );
}