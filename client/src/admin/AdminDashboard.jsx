import { useState, useEffect } from "react";
import API from "../services/api";
import "./admindashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [students, setStudents] = useState([]);
  const [pending, setPending] = useState([]);
  const [missedStudents, setMissedStudents] = useState([]);

  const [analytics, setAnalytics] = useState(null);
  const [branchAnalytics, setBranchAnalytics] = useState([]);

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    college: "",
    branch: "",
    section: "",
    status: ""
  });

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");

  /* ================= DATA ================= */

  useEffect(() => {
    API.get("/auth/students").then(res => setStudents(res.data || []));
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") {
      API.get(`/submissions/analytics?date=${dashboardDate}`)
        .then(res => setAnalytics(res.data));

      API.get(`/submissions/missed?date=${dashboardDate}`)
        .then(res => setMissedStudents(res.data || []));

      API.get(`/submissions/branch-analytics?date=${dashboardDate}`)
        .then(res => setBranchAnalytics(res.data || []));
    }
  }, [activeTab, dashboardDate]);

  useEffect(() => {
    if (activeTab === "review") {
      API.get(`/submissions/pending?date=${reviewDate}`)
        .then(res => {
          const safe = (res.data || []).filter(p => p.studentId !== null);
          setPending(safe);
        });
    }
  }, [activeTab, reviewDate]);

  /* ================= FILTER API ================= */

  const fetchFilteredStudents = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await API.get(`/submissions/filter-students?${query}`);
      setFilteredStudents(res.data || []);
    } catch (err) {
      console.error("Filter Error:", err);
      alert("Filter failed ❌");
    }
  };

  /* ================= ACTIONS ================= */

  const createStudent = async () => {
    await API.post("/auth/register-student", form);
    alert("Student created ✅");
    setForm({ name: "", email: "", password: "" });
    setActiveTab("students");
    const res = await API.get("/auth/students");
    setStudents(res.data);
  };

  const reviewSubmission = async (id, status) => {
    await API.patch(`/submissions/review/${id}`, { status, remark });
    setRemark("");
    const res = await API.get(`/submissions/pending?date=${reviewDate}`);
    const safe = (res.data || []).filter(p => p.studentId !== null);
    setPending(safe);
  };

  const fetchPerformance = async (id, name) => {
    const res = await API.get(`/submissions/performance/${id}`);
    setPerformance(res.data);
    setSelectedStudent(name);
  };

  const downloadExcelReport = async () => {
    try {
      const res = await API.get(
        `/submissions/branch-report?date=${dashboardDate}&branch=${selectedBranch}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${selectedBranch}-report-${dashboardDate}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download Error:", err);
      alert("Excel download failed ❌");
    }
  };

  const searchStudent = async () => {
    if (!searchQuery) return alert("Enter name/email/rollno");

    try {
      const res = await API.get(`/submissions/search-performance?q=${searchQuery}`);
      setSearchResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Search failed ❌");
    }
  };

  useEffect(() => {
    const glow = document.querySelector(".cursor-glow");

    const move = (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* ================= UI ================= */

  return (
    <div className="admin-layout">
      {/* futuristic background layers */}
      <div className="ai-grid"></div>
      <div className="particles"></div>
      <div className="cursor-glow"></div>


      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="logo">Admin Panel</h2>

        <Nav label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
        <Nav label="Create Student" active={activeTab === "create"} onClick={() => setActiveTab("create")} />
        <Nav label="Students" active={activeTab === "students"} onClick={() => setActiveTab("students")} />
        <Nav label="Review Tasks" active={activeTab === "review"} onClick={() => setActiveTab("review")} />
        <Nav label="Filter Students" active={activeTab === "filter"} onClick={() => setActiveTab("filter")} />
        <Nav label="Search Student" active={activeTab === "search"} onClick={() => setActiveTab("search")} />

        <div style={{ marginTop: "auto" }}>
          <Nav label="Logout" danger onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }} />
        </div>
      </aside>

      {/* CONTENT */}
      <main className="content">

        {/* DASHBOARD */}
        {activeTab === "dashboard" && analytics && (
          <>
            <h1>Admin Overview</h1>

            <input
              type="date"
              value={dashboardDate}
              onChange={e => setDashboardDate(e.target.value)}
              className="input"
              style={{ maxWidth: 200, marginBottom: 10 }}
            />

            <div className="stats-grid">
              <Stat title="Total Students" value={analytics.totalStudents} />
              <Stat title="Submitted" value={analytics.submittedCount} />
              <Stat title="Pending" value={analytics.pendingCount} />
              <Stat title="Missed" value={analytics.missingCount} />
            </div>

            <Section title="📊 Branch-wise Analytics">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                {["all", "CSE-A", "CSE-C", "CSD", "CSM", "AIML"].map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBranch(b)}
                    className="btn-primary"
                    style={{
                      background: selectedBranch === b ? "#2563eb" : "#020617",
                      border: "1px solid #1e293b"
                    }}
                  >
                    {b.toUpperCase()}
                  </button>
                ))}
              </div>

              <button className="btn-primary" onClick={downloadExcelReport}>
                📥 Download Branch Report
              </button>

              <Card>
                {branchAnalytics.length === 0 ? (
                  <Empty text="No branch data available" />
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Branch</th>
                        <th>Total</th>
                        <th>Submitted</th>
                        <th>Missed</th>
                        <th>Approved</th>
                        <th>Pending</th>
                        <th>Rejected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branchAnalytics.map((b, index) => (
                        <tr key={index}>
                          <td>{b.branch}</td>
                          <td>{b.total}</td>
                          <td>{b.submitted}</td>
                          <td>{b.missed}</td>
                          <td>{b.approved}</td>
                          <td>{b.pending}</td>
                          <td>{b.rejected}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </Section>

            <Section title="❌ Missed Students">
              {missedStudents.length === 0
                ? <Empty text="No missed submissions 🎉" />
                : missedStudents.map(s => (
                  <Row key={s._id} left={s.name || "Deleted"} right={s.email || "-"} />
                ))
              }
            </Section>
          </>
        )}

        {/* FILTER */}
        {activeTab === "filter" && (
          <>
            <h1>🎯 Filter Students</h1>

            <Card>
              <div className="filter-grid">
                <input type="date" value={filters.date}
                  onChange={e => setFilters({ ...filters, date: e.target.value })}
                  className="input"
                />

                <input placeholder="Branch" value={filters.branch}
                  onChange={e => setFilters({ ...filters, branch: e.target.value })}
                  className="input"
                />

                <select value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                  className="input"
                >
                  <option value="">All</option>
                  <option value="submitted">Submitted</option>
                  <option value="missed">Missed</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Pending">Pending</option>
                </select>

                <button className="btn-primary" onClick={fetchFilteredStudents}>
                  🔍 Search
                </button>
              </div>
            </Card>

            <Card>
              {filteredStudents.length === 0 ? (
                <Empty text="No students found 🚫" />
              ) : (
                <table className="table">
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
          </>
        )}

        {/* CREATE STUDENT */}
        {activeTab === "create" && (
          <>
            <h1>Create Student</h1>
            <Card>
              <Input placeholder="Name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
              <button className="btn-primary" onClick={createStudent}>
                Create Student
              </button>
            </Card>
          </>
        )}

        {/* STUDENTS */}
        {activeTab === "students" && (
          <>
            <h1>Students</h1>
            <Card>
              {students.map(s => (
                <Row
                  key={s._id}
                  left={`${s.name} (${s.email})`}
                />
              ))}
            </Card>

            {performance && (
              <Card>
                <h3>{selectedStudent}</h3>
                <p>Total Days: {performance.totalDays}</p>
                <p>Submitted: {performance.submittedDays}</p>
                <p>Missed: {performance.missedDays}</p>
                <p>Consistency: {performance.consistency}</p>
              </Card>
            )}
          </>
        )}

        {/* REVIEW */}
        {activeTab === "review" && (
          <>
            <h1>Review Submissions</h1>

            <input
              type="date"
              value={reviewDate}
              onChange={e => setReviewDate(e.target.value)}
              className="input"
              style={{ maxWidth: 200 }}
            />

            <Card>
              {pending.length === 0 && <Empty text="No pending submissions" />}

              {pending.map(p => (
                <div key={p._id} className="review-row">
                  <div>
                    <b>{p.studentId?.name || "Deleted Student"}</b>
                    <p>{p.studentId?.email || "-"}</p>
                    <a href={p.linkedinUrl} target="_blank" rel="noreferrer">View Task</a>
                  </div>
                  <div>
                    <Input placeholder="Remark" value={remark}
                      onChange={e => setRemark(e.target.value)} />
                    <button className="btn-success"
                      onClick={() => reviewSubmission(p._id, "Approved")}>
                      Approve
                    </button>
                    <button className="btn-danger"
                      onClick={() => reviewSubmission(p._id, "Rejected")}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          </>
        )}

        {/* SEARCH */}
        {activeTab === "search" && (
          <>
            <h1>🔍 Search Student Performance</h1>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                placeholder="Search by Name / Email / Roll No"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input"
              />
              <button className="btn-primary" onClick={searchStudent}>
                Search
              </button>
            </div>

            {!searchResult && <Empty text="No student searched yet" />}

            {searchResult && (
              <Card>
                <h3>👤 Student Details</h3>
                <p><b>Name:</b> {searchResult.student.name}</p>
                <p><b>Email:</b> {searchResult.student.email}</p>
                <p><b>Roll No:</b> {searchResult.student.rollNo || "-"}</p>
                <p><b>Branch:</b> {searchResult.student.branch || "-"}</p>

                <h3>📊 Performance</h3>
                <p>Total Days: {searchResult.performance.totalDays}</p>
                <p>Approved: {searchResult.performance.approved}</p>
                <p>Pending: {searchResult.performance.pending}</p>
                <p>Rejected: {searchResult.performance.rejected}</p>
              </Card>
            )}
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
    className={`nav-item ${active ? "nav-active" : ""} ${danger ? "nav-danger" : ""}`}
  >
    {label}
  </div>
);

const Stat = ({ title, value }) => (
  <div className="stat-card">
    <p>{title}</p>
    <h2>{value}</h2>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ marginTop: 30 }}>
    <h3>{title}</h3>
    {children}
  </div>
);

const Card = ({ children }) => <div className="card">{children}</div>;
const Row = ({ left, right }) => <div className="row"><span>{left}</span><span>{right}</span></div>;
const Input = props => <input {...props} className="input" />;
const Empty = ({ text }) => <p style={{ textAlign: "center", color: "#94a3b8" }}>{text}</p>;
