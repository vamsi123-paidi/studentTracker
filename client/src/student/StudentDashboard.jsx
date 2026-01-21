import { useEffect, useState } from "react";
import API from "../services/api";

export default function StudentDashboard() {
  const [url, setUrl] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [todaySubmission, setTodaySubmission] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTodayStatus = async () => {
    const res = await API.get("/submissions/today");
    setTodaySubmission(res.data);
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const submitTask = async () => {
    try {
      setLoading(true);
      await API.post("/submissions/submit", {
        date,
        linkedinUrl: url
      });
      alert("Task submitted successfully 🚀");
      setUrl("");
      fetchTodayStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      {/* Floating orbs */}
      <div className="orb delay1" style={orb1}></div>
      <div className="orb delay2" style={orb2}></div>

      {/* Main Card */}
      <div style={card} className="fadeUp">
        <h1 style={title} className="shimmer-text">
          Student Dashboard
        </h1>

        <p style={subtitle}>
          Stay consistent. Submit daily. Build discipline.
        </p>

        {/* STATUS CARD */}
        {todaySubmission && (
          <div style={statusCard}>
            <span>Status for Today</span>
            <strong
              style={{
                color:
                  todaySubmission.status === "Approved"
                    ? "#22c55e"
                    : todaySubmission.status === "Rejected"
                    ? "#ef4444"
                    : "#eab308"
              }}
            >
              {todaySubmission.status}
            </strong>
          </div>
        )}

        {/* FORM */}
        <div style={form}>
          <label style={label}>Submission Date</label>
          <input
            type="date"
            value={date}
            max={new Date().toISOString().split("T")[0]}
            onChange={e => setDate(e.target.value)}
            style={input}
          />

          <label style={label}>LinkedIn Post URL</label>
          <input
            placeholder="https://www.linkedin.com/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            style={input}
          />

          <button
            style={primaryBtn}
            onClick={submitTask}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Task →"}
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div style={actions}>
          <button
            style={secondaryBtn}
            onClick={() => window.location.href = "/student/history"}
          >
            📜 View History
          </button>

          <button
            style={secondaryBtn}
            onClick={() => window.location.href = "/student/performance"}
          >
            📊 My Performance
          </button>
        </div>

        <p style={footer}>
          Consistency beats motivation. Show up daily.
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
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden"
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
  maxWidth: 520,
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
  fontSize: "2.5rem",
  fontWeight: 800,
  marginBottom: 10
};

const subtitle = {
  color: "#cbd5f5",
  fontSize: "0.95rem",
  marginBottom: 30
};

const statusCard = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding: "14px 18px",
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 25
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  marginBottom: 25
};

const label = {
  textAlign: "left",
  fontSize: "0.85rem",
  color: "#94a3b8"
};

const input = {
  padding: "14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.06)",
  color: "#f8fafc",
  fontSize: "0.95rem",
  outline: "none"
};

const primaryBtn = {
  marginTop: 10,
  padding: "14px",
  borderRadius: 14,
  background: "linear-gradient(135deg, #38bdf8, #2563eb)",
  color: "#fff",
  fontSize: "1.05rem",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  boxShadow: "0 12px 35px rgba(37,99,235,0.5)"
};

const actions = {
  display: "flex",
  gap: 15,
  justifyContent: "center",
  marginTop: 20,
  flexWrap: "wrap"
};

const secondaryBtn = {
  padding: "10px 18px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e5e7eb",
  cursor: "pointer"
};

const footer = {
  marginTop: 30,
  fontSize: "0.85rem",
  color: "#94a3b8"
};
