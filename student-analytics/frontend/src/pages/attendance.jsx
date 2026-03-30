import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [summary, setSummary] = useState([]);
  const [activeTab, setActiveTab] = useState('mark');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students', { headers });
      setStudents(res.data.data);
      const initial = {};
      res.data.data.forEach(s => initial[s._id] = 'Present');
      setAttendance(initial);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSummary = async () => {
    try {
      const summaries = await Promise.all(
        students.map(s => axios.get(`http://localhost:5000/api/attendance/summary/${s._id}`, { headers }))
      );
      setSummary(students.map((s, i) => ({
        name: s.name,
        rollNumber: s.rollNumber,
        ...summaries[i].data.data
      })));
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    if (!subject) return setMessage('Please enter a subject!');
    try {
      await Promise.all(
        students.map(s => axios.post('http://localhost:5000/api/attendance', {
          studentId: s._id,
          subject,
          date,
          status: attendance[s._id] || 'Present'
        }, { headers }))
      );
      setMessage('Attendance marked successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error marking attendance!');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📅 Attendance</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('mark')}
            className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'mark' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => { setActiveTab('summary'); fetchSummary(); }}
            className={`px-6 py-2 rounded-lg font-medium transition ${activeTab === 'summary' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            View Summary
          </button>
        </div>

        {activeTab === 'mark' && (
          <div className="bg-white rounded-2xl shadow p-6">
            {message && (
              <div className={`px-4 py-3 rounded-lg mb-4 text-sm font-medium ${message.includes('Error') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {message}
              </div>
            )}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Roll No</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} className="border-t">
                    <td className="px-4 py-3 text-sm text-gray-600">{s.rollNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {['Present', 'Absent', 'Late'].map(status => (
                          <button
                            key={status}
                            onClick={() => setAttendance(prev => ({ ...prev, [s._id]: status }))}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                              attendance[s._id] === status
                                ? status === 'Present' ? 'bg-green-500 text-white'
                                  : status === 'Absent' ? 'bg-red-500 text-white'
                                  : 'bg-yellow-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={handleSubmit}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              Submit Attendance
            </button>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Roll No</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Total Classes</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Present</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((s, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-3 text-sm text-gray-600">{s.rollNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600">{s.total}</td>
                    <td className="px-4 py-3 text-gray-600">{s.present}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        s.percentage >= 75 ? 'bg-green-100 text-green-700'
                        : s.percentage >= 50 ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {s.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}