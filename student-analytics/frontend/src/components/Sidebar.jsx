import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Students', path: '/students', icon: '👨‍🎓' },
  { label: 'Attendance', path: '/attendance', icon: '📅' },
  { label: 'Performance', path: '/performance', icon: '📈' },
  { label: 'Reports', path: '/reports', icon: '📋' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-64 min-h-screen bg-blue-900 text-white flex flex-col">
      <div className="p-6 border-b border-blue-700">
        <h2 className="text-xl font-bold">📚 Student Analytics</h2>
        <p className="text-blue-300 text-sm mt-1">{user?.role}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition duration-200
              ${location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-blue-800'}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <div className="text-sm text-blue-300 mb-3">{user?.name}</div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}