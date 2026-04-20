import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { label: "Students", path: "/students", icon: "group" },
  { label: "Attendance", path: "/attendance", icon: "calendar_today" },
  { label: "Performance", path: "/performance", icon: "insights" },
  { label: "Alerts", path: "/alerts", icon: "notifications_active" },
  { label: "Reports", path: "/reports", icon: "description" },
  { label: "ML Insights", path: "/ml-insights", icon: "smart_toy" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <aside style={{
      width: "256px", height: "100vh", position: "fixed", left: 0, top: 0,
      background: "#131B2E", display: "flex", flexDirection: "column",
      padding: "24px", gap: "8px", zIndex: 50
    }}>
      <div style={{ marginBottom: "32px", padding: "0 8px" }}>
        <h1 style={{ color: "white", fontSize: "18px", fontWeight: "700", fontFamily: "Manrope", letterSpacing: "-0.3px" }}>
          Academic Portal
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>HOD Dashboard</p>
        {user?.department && (
          <div style={{ marginTop: "12px", background: "rgba(37,99,235,0.15)", borderRadius: "8px", padding: "8px 10px" }}>
            <p style={{ color: "#60a5fa", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Department</p>
            <p style={{ color: "white", fontSize: "13px", fontWeight: "600", marginTop: "2px" }}>{user.department}</p>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map(item => {
          const active = window.location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", border: "none", cursor: "pointer", borderRadius: "8px",
              background: active ? "rgba(255,255,255,0.1)" : "transparent",
              color: active ? "white" : "#94a3b8",
              fontSize: "14px", fontWeight: active ? "600" : "400",
              fontFamily: "Manrope", textAlign: "left", transition: "all 0.2s"
            }}
              onMouseOver={e => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseOut={e => !active && (e.currentTarget.style.background = "transparent")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ padding: "8px 16px", marginBottom: "4px" }}>
          <p style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>{user?.name}</p>
          <p style={{ color: "#60a5fa", fontSize: "11px", marginTop: "2px" }}>{user?.role?.toUpperCase()}</p>
        </div>
        <button onClick={() => { logout(); navigate("/"); }} style={{
          width: "100%", display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 16px", border: "none", cursor: "pointer", borderRadius: "8px",
          background: "transparent", color: "#94a3b8", fontSize: "14px", fontFamily: "Manrope"
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>logout</span>Logout
        </button>
      </div>
    </aside>
  );
}