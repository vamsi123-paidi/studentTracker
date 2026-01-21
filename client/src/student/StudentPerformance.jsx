import { useEffect, useState } from "react";
import API from "../services/api";

export default function StudentPerformance() {
  const [performance, setPerformance] = useState(null);

  const fetchPerformance = async () => {
    const res = await API.get("/submissions/my-performance");
    setPerformance(res.data);
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  if (!performance) {
    return (
      <div style={loadingPage}>
        <p style={{ color: "#cbd5f5" }}>Loading performance...</p>
      </div>
    );
  }

  return (
    <div style={page}>
      {/* Floating orbs */}
      <div className="orb delay1" style={orb1}></div>
      <div className="orb delay2" style={orb2}></div>

      <div style={card} className="fadeUp">
        <h1 style={title} className="shimmer-text">
          📊 My Performance
        </h1>

        <p style={subtitle}>
          This reflects your discipline, not your talent.
        </p>

        {/* STATS */}
        <div style={statsGrid}>
          <Stat
            label="Total Days"
            value={performance.totalDays}
            color="#38bdf8"
          />
          <Stat
            label="Submitted"
            value={performance.submittedDays}
            color="#22c55e"
          />
          <Stat
            label="Missed"
            value={performance.missedDays}
            color="#ef4444"
          />
          <Stat
            label="Consistency"
            value={performance.consistency}
            color="#eab308"
            suffix=""
          />
        </div>

        {/* MESSAGE */}
        <div style={messageCard}>
          <p style={message}>
            {performance.consistency >= 80
              ? "🔥 Excellent consistency! Keep the streak alive."
              : performance.consistency >= 50
              ? "⚠️ You’re halfway there. Show up more consistently."
              : "🚨 Discipline needs work. Start showing up daily."}
          </p>
        </div>

        <button
          style={backBtn}
          onClick={() => (window.location.href = "/student/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <p style={footer}>
          Consistency compounds into mastery.
        </p>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

const Stat = ({ label, value, color, suffix }) => (
  <div style={{ ...statCard, borderColor: color }}>
    <p style={statLabel}>{label}</p>
    <h2 style={{ ...statValue, color }}>
      {value}{suffix || ""}
    </h2>
  </div>
);

/* ================= STYLES ================= */

const page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  overflow: "hidden"
};

const loadingPage = {
  minHeight: "100vh",
  background: "#020617",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const orb1 = {
  width: 320,
  height: 320,
  background: "#38bdf8",
  position: "absolute",
  top: "-90px",
  left: "-70px"
};

const orb2 = {
  width: 360,
  height: 360,
  background: "#22c55e",
  position: "absolute",
  bottom: "-120px",
  right: "-80px"
};

const card = {
  zIndex: 10,
  width: "100%",
  maxWidth: 700,
  padding: "55px 45px",
  borderRadius: 22,
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.75), rgba(2,6,23,0.85))",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 40px 120px rgba(0,0,0,0.7)",
  textAlign: "center"
};

const title = {
  fontSize: "2.6rem",
  fontWeight: 800,
  marginBottom: 10
};

const subtitle = {
  color: "#cbd5f5",
  fontSize: "0.95rem",
  marginBottom: 35
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 20,
  marginBottom: 30
};

const statCard = {
  padding: "22px 16px",
  borderRadius: 16,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid",
  textAlign: "center"
};

const statLabel = {
  fontSize: "0.85rem",
  color: "#94a3b8",
  marginBottom: 8
};

const statValue = {
  fontSize: "2rem",
  fontWeight: 800
};

const messageCard = {
  padding: "16px 20px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  marginBottom: 25
};

const message = {
  fontSize: "0.95rem",
  color: "#e5e7eb"
};

const backBtn = {
  padding: "12px 20px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e5e7eb",
  cursor: "pointer"
};

const footer = {
  marginTop: 25,
  fontSize: "0.85rem",
  color: "#94a3b8"
};
