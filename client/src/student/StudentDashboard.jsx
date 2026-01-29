import { useEffect, useState } from "react";
import API from "../services/api";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("task");

  /* ================= TASK ================= */
  const [url, setUrl] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [todaySubmission, setTodaySubmission] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= PROFILE ================= */
  const [profile, setProfile] = useState({
    name: "",
    rollNo: "",
    college: "",
    branch: "",
    section: "",
    gender: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    forcePasswordChange: false
  });

  /* ================= PROGRESS ================= */
  const [progress, setProgress] = useState(null);

  /* ================= LEADERBOARD ================= */
  const [leaderboard, setLeaderboard] = useState([]);

  /* ================= FETCH DATA ================= */

  const fetchTodayStatus = async () => {
    const res = await API.get("/submissions/today");
    setTodaySubmission(res.data);
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      setProfile(prev => ({ ...prev, ...res.data }));
    } catch { }
  };

  const fetchProgress = async () => {
    const res = await API.get("/submissions/progress");
    setProgress(res.data);
  };

  const fetchLeaderboard = async () => {
    const res = await API.get("/submissions/leaderboard");
    setLeaderboard(res.data);
  };

  useEffect(() => {
    fetchTodayStatus();
    fetchProfile();
  }, []);

  /* ================= FORCE PASSWORD CHANGE ================= */
  useEffect(() => {
    if (profile.forcePasswordChange) {
      setActiveTab("profile");
    }
  }, [profile.forcePasswordChange]);

  /* ================= TASK SUBMIT ================= */

  const submitTask = async () => {
    try {
      setLoading(true);
      await API.post("/submissions/submit", { date, linkedinUrl: url });
      alert("Task submitted successfully 🚀");
      setUrl("");
      fetchTodayStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PASSWORD STRENGTH ================= */

  const getPasswordStrength = password => {
    if (!password) return "";
    if (password.length < 6) return "Weak ❌";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return "Strong 💪";
    return "Medium ⚠️";
  };

  /* ================= PROFILE COMPLETION ================= */

  const calculateProfileCompletion = () => {
    const fields = ["name", "rollNo", "college", "branch", "section", "gender"];
    const filled = fields.filter(f => profile[f]).length;
    return Math.round((filled / fields.length) * 100);
  };

  /* ================= UPDATE PROFILE + PASSWORD ================= */

  const updateProfile = async () => {
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      return alert("New password and confirm password do not match ❌");
    }

    try {
      const res = await API.put("/auth/profile", profile);

      alert(res.data.message);

      setProfile(prev => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        forcePasswordChange: res.data.user?.forcePasswordChange
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Error updating profile");
    }
  };

  /* ================= AVATAR LETTER ================= */

  const avatarLetter = profile.name ? profile.name.charAt(0).toUpperCase() : "S";

  return (
    <div style={layout}>
      {/* SIDEBAR */}
      <div style={sidebar}>
        <div style={avatarBox}>
          <div style={avatar}>{avatarLetter}</div>
          <p style={{ marginTop: 8 }}>{profile.name || "Student"}</p>
        </div>

        <button style={navBtn(activeTab === "task")} onClick={() => setActiveTab("task")}>
          📝 Daily Task
        </button>

        <button style={navBtn(activeTab === "profile")} onClick={() => setActiveTab("profile")}>
          👤 My Profile
        </button>

        <button
          style={navBtn(activeTab === "progress")}
          onClick={() => {
            setActiveTab("progress");
            fetchProgress();
          }}
        >
          📊 Progress
        </button>

        <button
          style={navBtn(activeTab === "leaderboard")}
          onClick={() => {
            setActiveTab("leaderboard");
            fetchLeaderboard();
          }}
        >
          🏆 Leaderboard
        </button>

        <button
          style={{ ...navBtn(false), marginTop: 20, color: "#f87171" }}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* CONTENT */}
      <div style={content}>
        {/* ================= TASK ================= */}
        {activeTab === "task" && (
          <div style={card}>
            <h2>Daily Task Submission</h2>

            {todaySubmission && (
              <div style={statusCard}>
                <span>Status Today</span>
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

            <label style={label}>Date</label>
            <input type="date" value={date} max={new Date().toISOString().split("T")[0]} onChange={e => setDate(e.target.value)} style={input} />

            <label style={label}>LinkedIn Post URL</label>
            <input placeholder="https://www.linkedin.com/..." value={url} onChange={e => setUrl(e.target.value)} style={input} />

            <button style={primaryBtn} onClick={submitTask} disabled={loading}>
              {loading ? "Submitting..." : "Submit Task"}
            </button>
          </div>
        )}

        {/* ================= PROFILE ================= */}
        {activeTab === "profile" && (
          <div style={card}>
            <h2>👤 My Profile</h2>

            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
              Profile Completion: {calculateProfileCompletion()}%
            </p>
            <div style={progressBar}>
              <div style={{ ...progressFill, width: `${calculateProfileCompletion()}%` }}></div>
            </div>

            {profile.forcePasswordChange && (
              <div style={warningBox}>
                ⚠️ You must change your password before continuing.
              </div>
            )}

            <input placeholder="Full Name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} style={input} />
            <input placeholder="Roll Number" value={profile.rollNo} onChange={e => setProfile({ ...profile, rollNo: e.target.value })} style={input} />
            <input placeholder="College" value={profile.college} onChange={e => setProfile({ ...profile, college: e.target.value })} style={input} />
            <label style={label}>Branch</label>
            <select
              value={profile.branch}
              onChange={e => setProfile({ ...profile, branch: e.target.value })}
              style={input}
            >
              <option value="">Select Branch</option>
              <option value="CSE-A">CSE-A</option>
              <option value="CSE-C">CSE-C</option>
              <option value="AIML">AIML</option>
              <option value="CSM">CSM</option>
              <option value="CSD">CSD</option>
            </select>

            <input placeholder="Section" value={profile.section} onChange={e => setProfile({ ...profile, section: e.target.value })} style={input} />

            <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })} style={input}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <hr style={{ margin: "20px 0", borderColor: "#334155" }} />

            <h3>🔐 Change Password</h3>

            <input type="password" placeholder="Old Password" value={profile.oldPassword} onChange={e => setProfile({ ...profile, oldPassword: e.target.value })} style={input} />
            <input type="password" placeholder="New Password" value={profile.newPassword} onChange={e => setProfile({ ...profile, newPassword: e.target.value })} style={input} />
            <input type="password" placeholder="Confirm Password" value={profile.confirmPassword} onChange={e => setProfile({ ...profile, confirmPassword: e.target.value })} style={input} />

            {profile.newPassword && (
              <p style={{ fontSize: "0.85rem" }}>
                Strength: <b>{getPasswordStrength(profile.newPassword)}</b>
              </p>
            )}

            <button style={primaryBtn} onClick={updateProfile}>
              Save Changes
            </button>
          </div>
        )}

        {/* ================= PROGRESS ================= */}
        {activeTab === "progress" && progress && (
          <div style={card}>
            <h2>📊 My Progress</h2>

            <div style={statsGrid}>
              <div style={statBox}><h3>{progress.totalDays}</h3><p>Total</p></div>
              <div style={{ ...statBox, color: "#22c55e" }}><h3>{progress.approved}</h3><p>Approved</p></div>
              <div style={{ ...statBox, color: "#eab308" }}><h3>{progress.pending}</h3><p>Pending</p></div>
              <div style={{ ...statBox, color: "#ef4444" }}><h3>{progress.rejected}</h3><p>Rejected</p></div>
            </div>
          </div>
        )}

        {/* ================= LEADERBOARD ================= */}
        {/* ================= LEADERBOARD ================= */}
        {activeTab === "leaderboard" && (
          <div style={card}>
            <h2>🏆 Leaderboard</h2>

            <table style={table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: 16, color: "#94a3b8" }}>
                      No leaderboard data yet 🚀
                    </td>
                  </tr>
                )}

                {leaderboard.map((item, index) => (
                  <tr
                    key={item._id._id}
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
                      borderRadius: 14,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.35)"
                    }}
                  >
                    <td style={{ padding: 12, fontWeight: "bold" }}>
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </td>
                    <td style={{ padding: 12 }}>{item._id?.name}</td>
                    <td style={{ padding: 12, color: "#94a3b8" }}>{item._id?.email}</td>
                    <td style={{ padding: 12, fontWeight: "bold", color: "#38bdf8" }}>
                      {item.score}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  );
}

/* ================= FIXED PREMIUM THEME ================= */

const layout = {
  display: "grid",
  gridTemplateColumns: "260px minmax(0, 1fr)", // ✅ prevents overflow
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #0b1220 0%, #020617 40%, #000 100%)",
  color: "#e5e7eb",
  overflowX: "hidden" // ✅ global fix
};

const sidebar = {
  background: "linear-gradient(180deg, rgba(2,6,23,0.95), rgba(2,6,23,1))",
  borderRight: "1px solid rgba(255,255,255,0.06)",
  padding: "20px 16px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  position: "sticky",
  top: 0,
  height: "100vh"
};

const content = {
  padding: "22px",
  display: "flex",
  flexDirection: "column",
  gap: 20,
  overflowX: "hidden",
  width: "100%",
  boxSizing: "border-box" // ✅ important
};

const card = {
  width: "100%",
  maxWidth: "100%", // ✅ prevents overflow
  background: "linear-gradient(180deg, rgba(15,23,42,0.85), rgba(2,6,23,0.95))",
  backdropFilter: "blur(16px)",
  borderRadius: 16,
  padding: "18px 20px",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
  transition: "0.25s ease",
  boxSizing: "border-box"
};

const avatarBox = {
  textAlign: "center",
  marginBottom: 12,
  paddingBottom: 12,
  borderBottom: "1px solid rgba(255,255,255,0.05)"
};

const avatar = {
  width: 58,
  height: 58,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #38bdf8, #6366f1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.6rem",
  fontWeight: "bold",
  margin: "0 auto",
  boxShadow: "0 10px 30px rgba(99,102,241,0.4)"
};

const navBtn = active => ({
  padding: "10px 13px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.04)",
  background: active
    ? "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(99,102,241,0.25))"
    : "transparent",
  color: active ? "#f8fafc" : "#9ca3af",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "0.92rem",
  fontWeight: 500,
  transition: "0.2s ease",
  width: "100%" // ✅ prevents overflow
});

const statusCard = {
  width: "100%",
  background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0))",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  padding: "10px 14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
  boxShadow: "0 8px 22px rgba(0,0,0,0.35)",
  boxSizing: "border-box"
};

const label = {
  fontSize: "0.78rem",
  color: "#9ca3af",
  marginTop: 8
};

const input = {
  width: "100%",
  padding: "10px 12px",
  marginTop: 6,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(2,6,23,0.95)",
  color: "#f9fafb",
  outline: "none",
  transition: "0.2s ease",
  boxSizing: "border-box" // ✅ prevents cutting
};

const primaryBtn = {
  marginTop: 12,
  padding: "10px 18px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #38bdf8, #6366f1)",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
  letterSpacing: "0.3px",
  boxShadow: "0 10px 28px rgba(99,102,241,0.45)",
  transition: "0.2s ease",
  width: "fit-content" // ✅ prevents overflow
};

const progressBar = {
  width: "100%",
  height: 8,
  background: "rgba(255,255,255,0.07)",
  borderRadius: 20,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  marginBottom: 8
};

const progressFill = {
  height: "100%",
  background: "linear-gradient(90deg, #38bdf8, #22c55e)",
  transition: "0.4s ease"
};

const warningBox = {
  width: "100%",
  background: "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.05))",
  border: "1px solid rgba(239,68,68,0.45)",
  color: "#f87171",
  padding: "10px 12px",
  borderRadius: 10,
  marginBottom: 10,
  fontSize: "0.8rem",
  boxSizing: "border-box"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", // ✅ responsive grid
  gap: 14,
  marginTop: 10,
  width: "100%"
};

const statBox = {
  padding: 14,
  borderRadius: 14,
  background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))",
  textAlign: "center",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 10px 26px rgba(0,0,0,0.4)",
  transition: "0.2s ease",
  width: "100%",
  boxSizing: "border-box"
};

const table = {
  width: "100%",
  marginTop: 12,
  borderCollapse: "separate",
  borderSpacing: "0 6px",
  fontSize: "0.9rem",
  color: "#e5e7eb",
  tableLayout: "fixed", // ✅ prevents overflow
  wordBreak: "break-word"
};


