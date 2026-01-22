import { useState, useEffect } from "react";
import API from "../services/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [students, setStudents] = useState([]);
  const [pending, setPending] = useState([]);
  const [missedStudents, setMissedStudents] = useState([]);

  const [analytics, setAnalytics] = useState(null);
  const [dashboardDate, setDashboardDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [performance, setPerformance] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [reviewDate, setReviewDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [remark, setRemark] = useState("");

  /* ================= FILTER STATES ================= */
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    college: "",
    branch: "",
    section: "",
    status: ""
  });

  const [filteredStudents, setFilteredStudents] = useState([]);

  /* ================= DATA ================= */

  useEffect(() => {
    API.get("/auth/students").then(res => setStudents(res.data));
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") {
      API.get(`/submissions/analytics?date=${dashboardDate}`)
        .then(res => setAnalytics(res.data));

      API.get(`/submissions/missed?date=${dashboardDate}`)
        .then(res => setMissedStudents(res.data));
    }
  }, [activeTab, dashboardDate]);

  useEffect(() => {
    if (activeTab === "review") {
      API.get(`/submissions/pending?date=${reviewDate}`)
        .then(res => setPending(res.data));
    }
  }, [activeTab, reviewDate]);

  /* ================= FILTER API ================= */

  const fetchFilteredStudents = async () => {
    const query = new URLSearchParams(filters).toString();
    const res = await API.get(`/submissions/filter?${query}`);
    setFilteredStudents(res.data);
  };

  /* ================= ACTIONS ================= */

  const createStudent = async () => {
    await API.post("/auth/register-student", form);
    alert("Student created");
    setForm({ name: "", email: "", password: "" });
    setActiveTab("students");
    const res = await API.get("/auth/students");
    setStudents(res.data);
  };

  const reviewSubmission = async (id, status) => {
    await API.patch(`/submissions/review/${id}`, { status, remark });
    setRemark("");
    const res = await API.get(`/submissions/pending?date=${reviewDate}`);
    setPending(res.data);
  };

  const fetchPerformance = async (id, name) => {
    const res = await API.get(`/submissions/performance/${id}`);
    setPerformance(res.data);
    setSelectedStudent(name);
  };

  /* ================= UI ================= */

  return (
    <div style={layout}>
      {/* SIDEBAR */}
      <aside style={sidebar}>
        <h2 style={logo}>Admin Panel</h2>

        <Nav label="Dashboard" active={activeTab==="dashboard"} onClick={()=>setActiveTab("dashboard")} />
        <Nav label="Create Student" active={activeTab==="create"} onClick={()=>setActiveTab("create")} />
        <Nav label="Students" active={activeTab==="students"} onClick={()=>setActiveTab("students")} />
        <Nav label="Review Tasks" active={activeTab==="review"} onClick={()=>setActiveTab("review")} />

        <div style={{ marginTop: "auto" }}>
          <Nav label="Logout" danger onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }} />
        </div>
      </aside>

      {/* CONTENT */}
      <main style={content}>

        {/* ================= DASHBOARD ================= */}
        {activeTab === "dashboard" && analytics && (
          <>
            <h1 style={pageTitle}>Admin Overview</h1>
            <p style={pageDesc}>Track submissions, discipline, and attendance.</p>

            <input
              type="date"
              value={dashboardDate}
              onChange={e => setDashboardDate(e.target.value)}
              style={datePicker}
            />

            <div style={cards}>
              <Stat title="Total Students" value={analytics.totalStudents} />
              <Stat title="Submitted" value={analytics.submittedCount} green />
              <Stat title="Pending" value={analytics.pendingCount} yellow />
              <Stat title="Missed" value={analytics.missingCount} red />
            </div>

            {/* ================= FILTER SECTION ================= */}
            <Section title="🎯 Advanced Filters">

              <div style={filterGrid}>
                <input
                  type="date"
                  value={filters.date}
                  onChange={e => setFilters({ ...filters, date: e.target.value })}
                  style={input}
                />

                <input
                  placeholder="College"
                  value={filters.college}
                  onChange={e => setFilters({ ...filters, college: e.target.value })}
                  style={input}
                />

                <input
                  placeholder="Branch"
                  value={filters.branch}
                  onChange={e => setFilters({ ...filters, branch: e.target.value })}
                  style={input}
                />

                <input
                  placeholder="Section"
                  value={filters.section}
                  onChange={e => setFilters({ ...filters, section: e.target.value })}
                  style={input}
                />

                <select
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                  style={input}
                >
                  <option value="">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="missed">Missed</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Pending">Pending</option>
                </select>

                <button style={primaryBtn} onClick={fetchFilteredStudents}>
                  🔍 Apply Filter
                </button>
              </div>

              <Card>
                {filteredStudents.length === 0 ? (
                  <Empty text="No students found with selected filters" />
                ) : (
                  <table style={table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>College</th>
                        <th>Branch</th>
                        <th>Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map(s => (
                        <tr key={s._id}>
                          <td>{s.name}</td>
                          <td>{s.email}</td>
                          <td>{s.college || "-"}</td>
                          <td>{s.branch || "-"}</td>
                          <td>{s.section || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </Section>

            {/* ================= MISSED STUDENTS ================= */}
            <Section title="❌ Missed Students">
              {missedStudents.length === 0
                ? <Empty text="No missed submissions 🎉" />
                : missedStudents.map(s => (
                  <Row key={s._id} left={s.name} right={s.email} />
                ))
              }
            </Section>
          </>
        )}

        {/* ================= CREATE STUDENT ================= */}
        {activeTab === "create" && (
          <>
            <h1 style={pageTitle}>Create Student</h1>
            <Card>
              <Input placeholder="Name" value={form.name}
                onChange={e=>setForm({...form,name:e.target.value})} />
              <Input placeholder="Email" value={form.email}
                onChange={e=>setForm({...form,email:e.target.value})} />
              <Input placeholder="Password" value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})} />
              <button style={primaryBtn} onClick={createStudent}>
                Create Student
              </button>
            </Card>
          </>
        )}

        {/* ================= STUDENTS ================= */}
        {activeTab === "students" && (
          <>
            <h1 style={pageTitle}>Students</h1>
            <Card>
              {students.map(s => (
                <Row
                  key={s._id}
                  left={`${s.name} (${s.email})`}
                  right={
                    <button style={linkBtn}
                      onClick={() => fetchPerformance(s._id, s.name)}>
                      View Performance
                    </button>
                  }
                />
              ))}
            </Card>

            {performance && (
              <Card>
                <h3>📊 {selectedStudent}</h3>
                <p>Total Days: {performance.totalDays}</p>
                <p>Submitted: {performance.submittedDays}</p>
                <p>Missed: {performance.missedDays}</p>
                <p>Consistency: {performance.consistency}</p>
              </Card>
            )}
          </>
        )}

        {/* ================= REVIEW ================= */}
        {activeTab === "review" && (
          <>
            <h1 style={pageTitle}>Review Submissions</h1>

            <input
              type="date"
              value={reviewDate}
              onChange={e => setReviewDate(e.target.value)}
              style={datePicker}
            />

            <Card>
              {pending.map(p => (
                <div key={p._id} style={reviewRow}>
                  <div>
                    <b>{p.studentId.name}</b>
                    <p>{p.studentId.email}</p>
                    <a href={p.linkedinUrl} target="_blank">View Task</a>
                  </div>
                  <div>
                    <Input placeholder="Remark" value={remark}
                      onChange={e=>setRemark(e.target.value)} />
                    <button style={approveBtn}
                      onClick={()=>reviewSubmission(p._id,"Approved")}>
                      Approve
                    </button>
                    <button style={rejectBtn}
                      onClick={()=>reviewSubmission(p._id,"Rejected")}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

/* ================= COMPONENTS ================= */

const Nav = ({ label, active, onClick, danger }) => (
  <div
    onClick={onClick}
    style={{
      padding: "12px 16px",
      borderRadius: 10,
      marginBottom: 8,
      cursor: "pointer",
      background: active ? "#1e293b" : "transparent",
      color: danger ? "#f87171" : "#e5e7eb",
      fontWeight: 500
    }}
  >
    {label}
  </div>
);

const Stat = ({ title, value, green, yellow, red }) => (
  <div style={{
    ...statCard,
    borderColor: green ? "#22c55e" : yellow ? "#eab308" : red ? "#ef4444" : "#334155"
  }}>
    <p>{title}</p>
    <h2>{value}</h2>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ marginTop: 30 }}>
    <h3>{title}</h3>
    <Card>{children}</Card>
  </div>
);

const Card = ({ children }) => <div style={card}>{children}</div>;
const Row = ({ left, right }) => <div style={row}><span>{left}</span><span>{right}</span></div>;
const Input = props => <input {...props} style={input} />;
const Empty = ({ text }) => <p style={{ textAlign: "center", color: "#94a3b8" }}>{text}</p>;

/* ================= STYLES ================= */

const layout = { display: "flex", height: "100vh", background: "#020617", color: "#f8fafc" };
const sidebar = { width: 240, borderRight: "1px solid #1e293b", padding: 20, display: "flex", flexDirection: "column" };
const logo = { marginBottom: 20 };
const content = { flex: 1, padding: 40, overflowY: "auto" };
const pageTitle = { fontSize: "2rem", marginBottom: 6 };
const pageDesc = { color: "#94a3b8", marginBottom: 20 };
const cards = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 };
const statCard = { padding: 20, borderRadius: 14, border: "1px solid", background: "rgba(15,23,42,0.6)" };
const card = { background: "rgba(15,23,42,0.7)", padding: 20, borderRadius: 16, marginTop: 15 };
const row = { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1e293b" };
const input = { padding: 10, borderRadius: 10, border: "1px solid #334155", background: "#020617", color: "#fff" };
const datePicker = input;
const primaryBtn = { padding: "12px 18px", borderRadius: 10, background: "#2563eb", border: "none", color: "#fff", fontWeight: 600 };
const linkBtn = { background: "none", border: "none", color: "#38bdf8", cursor: "pointer" };
const approveBtn = { background: "#22c55e", border: "none", padding: "8px 12px", borderRadius: 8, marginRight: 6 };
const rejectBtn = { background: "#ef4444", border: "none", padding: "8px 12px", borderRadius: 8 };
const reviewRow = { display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 15 };
const filterGrid = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 15 };
const table = { width: "100%", borderCollapse: "collapse", marginTop: 10 };
