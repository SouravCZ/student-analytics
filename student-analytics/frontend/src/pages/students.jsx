import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    studentId: '', name: '', email: '', rollNumber: '',
    department: '', semester: 1, section: '', phone: ''
  });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students', { headers });
      setStudents(res.data.data);
    } catch (err) { console.log(err); }
  };

  const handleAdd = async () => {
    if (!form.studentId || !form.name || !form.email || !form.rollNumber || !form.department) {
      return setMessage('Please fill all required fields!');
    }
    try {
      await axios.post('http://localhost:5000/api/students', form, { headers });
      setMessage('Student added successfully!');
      setShowForm(false);
      setForm({ studentId: '', name: '', email: '', rollNumber: '', department: '', semester: 1, section: '', phone: '' });
      fetchStudents();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error adding student!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${id}`, { headers });
      fetchStudents();
    } catch (err) { console.log(err); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: 'white', color: '#0f172a', boxSizing: 'border-box'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>◉ Students</h1>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '10px 20px', background: '#2563eb', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '13px',
            fontWeight: '600', cursor: 'pointer'
          }}>
            {showForm ? '✕ Cancel' : '+ Add Student'}
          </button>
        </div>

        {message && (
          <div style={{
            padding: '10px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
            background: message.includes('Error') || message.includes('fill') ? '#fef2f2' : '#f0fdf4',
            color: message.includes('Error') || message.includes('fill') ? '#dc2626' : '#16a34a'
          }}>{message}</div>
        )}

        {/* Add Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '20px' }}>New Student</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[
                { label: 'Student ID *', key: 'studentId', placeholder: 'e.g. STU004' },
                { label: 'Full Name *', key: 'name', placeholder: 'e.g. John Doe' },
                { label: 'Email *', key: 'email', placeholder: 'e.g. john@test.com' },
                { label: 'Roll Number *', key: 'rollNumber', placeholder: 'e.g. CS004' },
                { label: 'Department *', key: 'department', placeholder: 'e.g. Computer Science' },
                { label: 'Section', key: 'section', placeholder: 'e.g. A' },
                { label: 'Phone', key: 'phone', placeholder: 'e.g. 9876543210' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>{label}</label>
                  <input style={inputStyle} placeholder={placeholder} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Semester *</label>
                <select style={inputStyle} value={form.semester} onChange={e => setForm({ ...form, semester: Number(e.target.value) })}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleAdd} style={{
              marginTop: '20px', padding: '10px 24px', background: '#2563eb',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer'
            }}>Add Student →</button>
          </div>
        )}

        {/* Students Table */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>All Students</p>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{students.length} total</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Student ID', 'Name', 'Roll No', 'Department', 'Semester', 'Section', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No students found</td></tr>
              ) : students.map((s, i) => (
                <tr key={s._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>{s.studentId}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{s.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{s.rollNumber}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{s.department}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>Sem {s.semester}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{s.section || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDelete(s._id)} style={{
                      padding: '5px 12px', background: '#fef2f2', color: '#dc2626',
                      border: '1px solid #fecaca', borderRadius: '6px',
                      fontSize: '12px', cursor: 'pointer', fontWeight: '500'
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}