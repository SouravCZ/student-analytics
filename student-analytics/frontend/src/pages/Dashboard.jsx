import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const stats = [
  { label: 'Total Students', value: '0', icon: '👨‍🎓', color: 'bg-blue-500' },
  { label: 'Avg Attendance', value: '0%', icon: '📅', color: 'bg-green-500' },
  { label: 'Avg Performance', value: '0%', icon: '📈', color: 'bg-purple-500' },
  { label: 'At Risk Students', value: '0', icon: '⚠️', color: 'bg-red-500' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-500 mt-1">Here's what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
              <div className={`${stat.color} text-white text-2xl p-4 rounded-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📈 Performance Trend</h3>
            <div className="h-48 flex items-center justify-center text-gray-400">
              Charts coming in Step 8!
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📅 Attendance Overview</h3>
            <div className="h-48 flex items-center justify-center text-gray-400">
              Charts coming in Step 8!
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}