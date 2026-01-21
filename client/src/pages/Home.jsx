import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={page}>
      {/* Animated Orbs */}
      <div className="orb delay1" style={orb1}></div>
      <div className="orb delay2" style={orb2}></div>
      <div className="orb delay3" style={orb3}></div>

      {/* Glass Card */}
      <div style={card} className="fadeUp">
        <h1 style={title}>Daily Task Tracker</h1>

        <p style={subtitle}>
          A <span style={highlight}>discipline-first platform</span> to track
          daily progress, consistency, and real learning outcomes.
        </p>

        <div style={features}>
          <span style={pill}>📅 Daily Submissions</span>
          <span style={pill}>🛡 Admin Review</span>
          <span style={pill}>📊 Analytics</span>
          <span style={pill}>🔥 Consistency</span>
        </div>

        <div style={actions}>
          <button
            style={{ ...btn, ...adminBtn }}
            onClick={() => navigate("/login?role=admin")}
          >
            Admin Login →
          </button>

          <button
            style={{ ...btn, ...studentBtn }}
            onClick={() => navigate("/login?role=student")}
          >
            Student Login →
          </button>
        </div>

        <p style={footer}>
          Built for serious learners. Designed for accountability.
        </p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  height: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden"
};

const orb1 = {
  width: 320,
  height: 320,
  background: "#2563eb",
  top: "-80px",
  left: "-60px"
};

const orb2 = {
  width: 380,
  height: 380,
  background: "#22c55e",
  bottom: "-120px",
  right: "-80px"
};

const orb3 = {
  width: 260,
  height: 260,
  background: "#9333ea",
  top: "40%",
  right: "20%"
};

const card = {
  zIndex: 10,
  maxWidth: 640,
  width: "100%",
  padding: "60px 50px",
  borderRadius: 22,
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.75), rgba(2,6,23,0.85))",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
  textAlign: "center"
};

const title = {
  fontSize: "3rem",
  fontWeight: 800,
  color: "#f8fafc",
  marginBottom: 18
};

const subtitle = {
  color: "#cbd5f5",
  fontSize: "1.1rem",
  lineHeight: 1.7,
  marginBottom: 35
};

const highlight = {
  color: "#38bdf8",
  fontWeight: 600
};

const features = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  justifyContent: "center",
  marginBottom: 40
};

const pill = {
  padding: "10px 18px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e5e7eb",
  fontSize: "0.9rem"
};

const actions = {
  display: "flex",
  gap: 20,
  justifyContent: "center",
  flexWrap: "wrap",
  marginBottom: 25
};

const btn = {
  padding: "14px 36px",
  borderRadius: 14,
  fontSize: "1.05rem",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  color: "white"
};

const adminBtn = {
  background: "linear-gradient(135deg, #2563eb, #1e40af)"
};

const studentBtn = {
  background: "linear-gradient(135deg, #22c55e, #15803d)"
};

const footer = {
  color: "#94a3b8",
  fontSize: "0.9rem"
};
