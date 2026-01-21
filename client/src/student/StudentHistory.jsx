import { useEffect, useState } from "react";
import API from "../services/api";

export default function StudentHistory() {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    const res = await API.get("/submissions/history");
    setHistory(res.data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div style={page}>
      {/* Floating orbs */}
      <div className="orb delay1" style={orb1}></div>
      <div className="orb delay2" style={orb2}></div>

      <div style={card} className="fadeUp">
        <h1 style={title} className="shimmer-text">
          My Submission History
        </h1>

        <p style={subtitle}>
          Your consistency over time — every day matters.
        </p>

        <button
          style={backBtn}
          onClick={() => (window.location.href = "/student/dashboard")}
        >
          ← Back to Dashboard
        </button>

        {/* HISTORY LIST */}
        <div style={{ marginTop: 30 }}>
          {history.length === 0 && (
            <p style={emptyText}>No submissions yet. Start today 🚀</p>
          )}

          {history.map(item => (
            <div key={item._id} style={historyCard}>
              <div style={left}>
                <span style={date}>{item.date}</span>
                <span
                  style={{
                    ...status,
                    color:
                      item.status === "Approved"
                        ? "#22c55e"
                        : item.status === "Rejected"
                        ? "#ef4444"
                        : "#eab308"
                  }}
                >
                  {item.status}
                </span>
              </div>

              <div style={right}>
                <a
                  href={item.linkedinUrl}
                  target="_blank"
                  style={link}
                >
                  🔗 View LinkedIn Post
                </a>

                <p style={remark}>
                  {item.remark ? `💬 ${item.remark}` : "💬 No remarks"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p style={footer}>
          Discipline compounds. Keep showing up.
        </p>
      </div>
    </div>
  );
}

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

const orb1 = {
  width: 300,
  height: 300,
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
  maxWidth: 720,
  padding: "55px 45px",
  borderRadius: 22,
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.75), rgba(2,6,23,0.85))",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 40px 120px rgba(0,0,0,0.7)"
};

const title = {
  fontSize: "2.5rem",
  fontWeight: 800,
  marginBottom: 10,
  textAlign: "center"
};

const subtitle = {
  color: "#cbd5f5",
  fontSize: "0.95rem",
  marginBottom: 25,
  textAlign: "center"
};

const backBtn = {
  padding: "10px 18px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e5e7eb",
  cursor: "pointer"
};

const historyCard = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  padding: "18px 20px",
  borderRadius: 16,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  marginBottom: 16
};

const left = {
  display: "flex",
  flexDirection: "column",
  gap: 6
};

const right = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  alignItems: "flex-end"
};

const date = {
  fontSize: "0.85rem",
  color: "#94a3b8"
};

const status = {
  fontSize: "1rem",
  fontWeight: 700
};

const link = {
  color: "#38bdf8",
  textDecoration: "none",
  fontSize: "0.9rem"
};

const remark = {
  fontSize: "0.85rem",
  color: "#cbd5f5",
  maxWidth: 320,
  textAlign: "right"
};

const emptyText = {
  textAlign: "center",
  color: "#94a3b8",
  marginTop: 40
};

const footer = {
  marginTop: 30,
  textAlign: "center",
  fontSize: "0.85rem",
  color: "#94a3b8"
};
