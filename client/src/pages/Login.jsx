import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

export default function Login() {
  const [params] = useSearchParams();
  const roleFromUI = params.get("role"); // admin | student

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);

      const res = await API.post("/auth/login", { email, password });

      if (res.data.role !== roleFromUI) {
        alert("Unauthorized role");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      window.location =
        res.data.role === "admin"
          ? "/admin/dashboard"
          : "/student/dashboard";
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      {/* Animated Orbs */}
      <div className="orb delay1" style={orb1}></div>
      <div className="orb delay2" style={orb2}></div>

      {/* Glass Login Card */}
      <div style={card} className="fadeUp">
        <h1 className="shimmer-text" style={title}>
          {roleFromUI === "admin" ? "Admin Login" : "Student Login"}
        </h1>

        <p style={subtitle}>
          Secure access to your dashboard and performance data
        </p>

        <div style={inputGroup}>
          <input
            style={input}
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            style={input}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button
          style={button}
          onClick={login}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login →"}
        </button>

        <p style={footer}>
          Role-based • Secure • Real-time tracking
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
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  overflow: "hidden"
};

const orb1 = {
  width: 320,
  height: 320,
  background: "#2563eb",
  position: "absolute",
  top: "-100px",
  left: "-80px"
};

const orb2 = {
  width: 380,
  height: 380,
  background: "#22c55e",
  position: "absolute",
  bottom: "-120px",
  right: "-90px"
};

const card = {
  zIndex: 10,
  width: "100%",
  maxWidth: 420,
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
  marginBottom: 12,
  letterSpacing: "-0.5px"
};

const subtitle = {
  color: "#cbd5f5",
  fontSize: "0.95rem",
  marginBottom: 30
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
  marginBottom: 30
};

const input = {
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.06)",
  color: "#f8fafc",
  fontSize: "1rem",
  outline: "none",
  transition: "all 0.3s ease"
};

const button = {
  width: "100%",
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

const footer = {
  marginTop: 25,
  fontSize: "0.85rem",
  color: "#94a3b8"
};
