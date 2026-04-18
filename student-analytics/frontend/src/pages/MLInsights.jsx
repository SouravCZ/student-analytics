import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const DS_URL = "http://localhost:5001";
const sampleStudents = [
  { student_id: "STU001", name: "Rahul Sharma", attendance_percentage: 55, avg_marks: 38, assignments_submitted: 3, behavior_score: 5 },
  { student_id: "STU002", name: "Priya Das", attendance_percentage: 88, avg_marks: 76, assignments_submitted: 9, behavior_score: 8 },
  { student_id: "STU003", name: "Amit Roy", attendance_percentage: 45, avg_marks: 32, assignments_submitted: 2, behavior_score: 4 },
  { student_id: "STU004", name: "Sneha Paul", attendance_percentage: 92, avg_marks: 85, assignments_submitted: 10, behavior_score: 9 },
  { student_id: "STU005", name: "Raj Kumar", attendance_percentage: 61, avg_marks: 55, assignments_submitted: 6, behavior_score: 6 },
];
const COLORS = ["#ef4444", "#22c55e"];

export default function MLInsights() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [singleForm, setSingleForm] = useState({ attendance_percentage: "", avg_marks: "", assignments_submitted: "", behavior_score: "" });
  const [singleResult, setSingleResult] = useState(null);
  const [activeTab, setActiveTab] = useState("batch");

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { label: "Students", path: "/students", icon: "group" },
    { label: "Attendance", path: "/attendance", icon: "calendar_today" },
    { label: "Performance", path: "/performance", icon: "insights" },
    { label: "Alerts", path: "/alerts", icon: "notifications_active" },
    { label: "Reports", path: "/reports", icon: "description" },
    { label: "ML Insights", path: "/ml-insights", icon: "smart_toy" },
  ];

  const runBatchPredict = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${DS_URL}/predict/batch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sampleStudents) });
      const data = await res.json();
      setResults(data.map((r, i) => ({ ...sampleStudents[i], ...r })));
    } catch (e) { alert("DS Engine not reachable. Make sure Flask is running on port 5001."); }
    setLoading(false);
  };

  const runSinglePredict = async () => {
    try {
      const res = await fetch(`${DS_URL}/predict`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attendance_percentage: parseFloat(singleForm.attendance_percentage), avg_marks: parseFloat(singleForm.avg_marks), assignments_submitted: parseInt(singleForm.assignments_submitted), behavior_score: parseInt(singleForm.behavior_score) }) });
      setSingleResult(await res.json());
    } catch (e) { alert("DS Engine not reachable."); }
  };

  useEffect(() => { runBatchPredict(); }, []);

  const atRiskCount = results.filter(r => r.at_risk === 1).length;
  const safeCount = results.length - atRiskCount;
  const pieData = [{ name: "At Risk", value: atRiskCount }, { name: "Safe", value: safeCount }];
  const barData = results.map(r => ({ name: r.name.split(" ")[0], risk: r.risk_probability }));

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;font-family:'Material Symbols Outlined';}`}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fb", fontFamily: "Inter, sans-serif" }}>

        {/* Sidebar */}
        <aside style={{ width: "256px", height: "100vh", position: "fixed", left: 0, top: 0, background: "#131B2E", display: "flex", flexDirection: "column", padding: "24px", gap: "8px", zIndex: 50 }}>
          <div style={{ marginBottom: "32px", padding: "0 8px" }}>
            <h1 style={{ color: "white", fontSize: "18px", fontWeight: "700", fontFamily: "Manrope" }}>Academic Portal</h1>
            <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>HOD Dashboard</p>
          </div>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
            {navItems.map(item => {
              const active = window.location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => navigate(item.path)} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: "none", cursor: "pointer", borderRadius: "8px", background: active ? "rgba(255,255,255,0.1)" : "transparent", color: active ? "white" : "#94a3b8", fontSize: "14px", fontWeight: active ? "600" : "400", fontFamily: "Manrope", textAlign: "left" }}
                  onMouseOver={e => !active && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseOut={e => !active && (e.currentTarget.style.background = "transparent")}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px" }}>
            <button onClick={() => { logout(); navigate("/"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", border: "none", cursor: "pointer", borderRadius: "8px", background: "transparent", color: "#94a3b8", fontSize: "14px", fontFamily: "Manrope" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>logout</span>Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ marginLeft: "256px", flex: 1, padding: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "Manrope", color: "#191c1e", marginBottom: 4 }}>ML Insights</h1>
          <p style={{ color: "#737686", marginBottom: 24, fontSize: 14 }}>AI-powered at-risk student detection using Random Forest</p>

          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["batch", "single"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, background: activeTab === tab ? "#6366f1" : "#e2e8f0", color: activeTab === tab ? "#fff" : "#475569" }}>
                {tab === "batch" ? "Batch Analysis" : "Single Predict"}
              </button>
            ))}
          </div>

          {activeTab === "batch" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                {[{ label: "Total Analyzed", value: results.length, color: "#6366f1" }, { label: "At Risk", value: atRiskCount, color: "#ef4444" }, { label: "Safe", value: safeCount, color: "#22c55e" }].map(card => (
                  <div key={card.label} style={{ background: "#fff", borderRadius: 12, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>{card.label}</p>
                    <p style={{ fontSize: 32, fontWeight: 700, color: card.color }}>{card.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>Risk Probability per Student</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 12 }} /><Tooltip formatter={(v) => `${v}%`} /><Bar dataKey="risk" name="Risk %" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>Risk Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Legend /></PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#1e293b" }}>Student Risk Report</h3>
                {loading ? <p style={{ color: "#64748b" }}>Analyzing...</p> : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead><tr style={{ borderBottom: "2px solid #f1f5f9" }}>{["Student","Attendance","Marks","Assignments","Behavior","Risk %","Status"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>{h}</th>)}</tr></thead>
                    <tbody>{results.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f8fafc", background: r.at_risk ? "#fff5f5" : "#fff" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1e293b" }}>{r.name}</td>
                        <td style={{ padding: "10px 12px", color: r.attendance_percentage < 60 ? "#ef4444" : "#22c55e" }}>{r.attendance_percentage}%</td>
                        <td style={{ padding: "10px 12px", color: r.avg_marks < 40 ? "#ef4444" : "#22c55e" }}>{r.avg_marks}</td>
                        <td style={{ padding: "10px 12px" }}>{r.assignments_submitted}/10</td>
                        <td style={{ padding: "10px 12px" }}>{r.behavior_score}/10</td>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: r.risk_probability > 50 ? "#ef4444" : "#22c55e" }}>{r.risk_probability}%</td>
                        <td style={{ padding: "10px 12px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: r.at_risk ? "#fee2e2" : "#dcfce7", color: r.at_risk ? "#dc2626" : "#16a34a" }}>{r.status}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {activeTab === "single" && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", maxWidth: 480 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: "#1e293b" }}>Predict Single Student</h3>
              {[{ key: "attendance_percentage", label: "Attendance %", placeholder: "e.g. 75" }, { key: "avg_marks", label: "Average Marks", placeholder: "e.g. 65" }, { key: "assignments_submitted", label: "Assignments Submitted (0-10)", placeholder: "e.g. 7" }, { key: "behavior_score", label: "Behavior Score (1-10)", placeholder: "e.g. 8" }].map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>{field.label}</label>
                  <input type="number" placeholder={field.placeholder} value={singleForm[field.key]} onChange={e => setSingleForm({ ...singleForm, [field.key]: e.target.value })} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <button onClick={runSinglePredict} style={{ width: "100%", padding: "12px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Predict Risk</button>
              {singleResult && (
                <div style={{ marginTop: 20, padding: 20, borderRadius: 10, background: singleResult.at_risk ? "#fff5f5" : "#f0fdf4", border: `2px solid ${singleResult.at_risk ? "#fca5a5" : "#86efac"}` }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: singleResult.at_risk ? "#dc2626" : "#16a34a", marginBottom: 8 }}>{singleResult.status}</p>
                  <p style={{ color: "#475569", fontSize: 14 }}>Risk Probability: <strong>{singleResult.risk_probability}%</strong></p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
