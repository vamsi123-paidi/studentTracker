import { useState, useEffect } from "react";
import API from "../services/api";
import "./admindashboard.css";

export default function AdminDashboard() {
  const [theme, setTheme] = useState(localStorage.getItem("admin-theme") || "dark");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    college: "",
    branch: "",
    section: "",
    status: ""
  });

  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  /* ================= THEME & UI ================= */
  useEffect(() => {
    document.body.className = `${theme}-theme`;
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

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
      showToast("Filter failed", "error");
    }
  };

  /* ================= ACTIONS ================= */

  const createStudent = async () => {
    try {
      await API.post("/auth/register-student", form);
      showToast("Student created successfully", "success");
      setForm({ name: "", email: "", password: "" });
      setActiveTab("students");
      const res = await API.get("/auth/students");
      setStudents(res.data);
    } catch (err) {
      showToast("Failed to create student", "error");
    }
  };

  const reviewSubmission = async (id, status) => {
    try {
      await API.patch(`/submissions/review/${id}`, { status, remark });
      showToast(`Submission ${status.toLowerCase()}`, "success");
      setRemark("");
      const res = await API.get(`/submissions/pending?date=${reviewDate}`);
      const safe = (res.data || []).filter(p => p.studentId !== null);
      setPending(safe);
    } catch (err) {
      showToast("Failed to review submission", "error");
    }
  };

  const fetchPerformance = async (id, name) => {
    try {
      const res = await API.get(`/submissions/performance/${id}`);
      setPerformance(res.data);
      setSelectedStudent(name);
    } catch (err) {
      showToast("Failed to fetch performance", "error");
    }
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
      showToast("Report downloaded successfully", "success");
    } catch (err) {
      console.error("Download Error:", err);
      showToast("Excel download failed", "error");
    }
  };

  const searchStudent = async () => {
    if (!searchQuery) {
      showToast("Enter name/email/rollno", "warning");
      return;
    }

    try {
      const res = await API.get(`/submissions/search-performance?q=${searchQuery}`);
      setSearchResult(res.data);
      showToast("Student found", "success");
    } catch (err) {
      console.error(err);
      showToast("Search failed", "error");
    }
  };

  const resetStudentPassword = async () => {
    if (!newPassword) {
      showToast("Enter new password", "warning");
      return;
    }

    try {
      await API.patch(`/auth/reset-password/${resetUser._id}`, {
        password: newPassword
      });

      showToast("Password updated successfully", "success");
      setResetUser(null);
      setNewPassword("");
    } catch (err) {
      console.error(err);
      showToast("Reset failed", "error");
    }
  };

  /* ================= CURSOR EFFECT ================= */
  useEffect(() => {
    const glow = document.querySelector(".cursor-glow");
    if (!glow) return;

    const move = (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    };

    const click = () => {
      glow.classList.add("active");
      setTimeout(() => glow.classList.remove("active"), 300);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("click", click);
    
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("click", click);
    };
  }, []);

  /* ================= UI ================= */

  return (
    <div className="admin-layout">
      {/* Enhanced Cursor */}
      <div className="cursor-glow"></div>

      {/* Theme Toggle */}
      <button 
        className="theme-toggle"
        onClick={toggleTheme}
        data-tooltip={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        data-tooltip="Toggle menu"
      >
        {mobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* Toast Notifications */}
      {toast.show && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span className="toast-icon">
              {toast.type === "success" ? "✅" :
               toast.type === "error" ? "❌" :
               toast.type === "warning" ? "⚠️" : "ℹ️"}
            </span>
            <div className="toast-content">
              <div className="toast-title">
                {toast.type === "success" ? "Success" :
                 toast.type === "error" ? "Error" :
                 toast.type === "warning" ? "Warning" : "Info"}
              </div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button 
              className="toast-close"
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileMenuOpen ? "active" : ""}`}>
        <div className="sidebar-content">
          <h2 className="logo">Admin<span className="text-gradient">Panel</span></h2>

          <Nav label="📊 Dashboard" active={activeTab === "dashboard"} onClick={() => {
            setActiveTab("dashboard");
            setMobileMenuOpen(false);
          }} />
          
          <Nav label="👨‍🎓 Create Student" active={activeTab === "create"} onClick={() => {
            setActiveTab("create");
            setMobileMenuOpen(false);
          }} />
          
          <Nav label="👥 Students" active={activeTab === "students"} onClick={() => {
            setActiveTab("students");
            setMobileMenuOpen(false);
          }} />
          
          <Nav label="📝 Review Tasks" active={activeTab === "review"} onClick={() => {
            setActiveTab("review");
            setMobileMenuOpen(false);
          }} />
          
          <Nav label="🔍 Filter Students" active={activeTab === "filter"} onClick={() => {
            setActiveTab("filter");
            setMobileMenuOpen(false);
          }} />
          
          <Nav label="🔎 Search Student" active={activeTab === "search"} onClick={() => {
            setActiveTab("search");
            setMobileMenuOpen(false);
          }} />

          <div className="sidebar-footer">
            <Nav label="🚪 Logout" danger onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }} />
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="content">

        {/* DASHBOARD */}
        {activeTab === "dashboard" && analytics && (
          <>
            <div className="page-header">
              <h1>Admin Overview</h1>
              <p>Monitor student submissions and performance analytics</p>
            </div>

            <div className="filter-bar">
              <input
                type="date"
                value={dashboardDate}
                onChange={e => setDashboardDate(e.target.value)}
                className="input"
              />
            </div>

            <div className="stats-grid">
              <Stat 
                title="Total Students" 
                value={analytics.totalStudents} 
                icon="👥"
              />
              <Stat 
                title="Submitted" 
                value={analytics.submittedCount} 
                icon="📤"
              />
              <Stat 
                title="Pending" 
                value={analytics.pendingCount} 
                icon="⏳"
              />
              <Stat 
                title="Missed" 
                value={analytics.missingCount} 
                icon="❌"
              />
            </div>

            <Card>
              <div className="card-header">
                <h3 className="card-title">📊 Branch-wise Analytics</h3>
                <div className="card-actions">
                  <div className="branch-buttons">
                    {["all", "CSE-A", "CSE-C", "CSD", "CSM", "AIML"].map(b => (
                      <button
                        key={b}
                        onClick={() => setSelectedBranch(b)}
                        className={`branch-button ${selectedBranch === b ? "active" : ""}`}
                      >
                        {b.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button className="btn-primary download-btn" onClick={downloadExcelReport}>
                📥 Download Branch Report
              </button>

              {branchAnalytics.length === 0 ? (
                <Empty 
                  icon="📊" 
                  title="No Branch Data" 
                  text="No branch analytics available for the selected date"
                />
              ) : (
                <div className="table-container">
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
                          <td><span className="badge badge-primary">{b.branch}</span></td>
                          <td><strong>{b.total}</strong></td>
                          <td>{b.submitted}</td>
                          <td><span className="trend-down">{b.missed}</span></td>
                          <td><span className="trend-up">{b.approved}</span></td>
                          <td>{b.pending}</td>
                          <td>{b.rejected}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card>
              <div className="card-header">
                <h3 className="card-title">❌ Missed Students</h3>
              </div>
              {missedStudents.length === 0 ? (
                <Empty 
                  icon="🎉" 
                  title="All Good!" 
                  text="No missed submissions for the selected date"
                />
              ) : (
                <div className="missed-list">
                  {missedStudents.map(s => (
                    <Row key={s._id} left={s.name || "Deleted Student"} right={s.email || "-"} />
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* FILTER */}
        {activeTab === "filter" && (
          <>
            <div className="page-header">
              <h1>🎯 Filter Students</h1>
              <p>Filter students by various criteria and status</p>
            </div>

            <Card>
              <div className="filter-grid">
                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input 
                    type="date" 
                    value={filters.date}
                    onChange={e => setFilters({ ...filters, date: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Branch</label>
                  <input 
                    placeholder="Enter branch"
                    value={filters.branch}
                    onChange={e => setFilters({ ...filters, branch: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Status</label>
                  <select 
                    value={filters.status}
                    onChange={e => setFilters({ ...filters, status: e.target.value })}
                    className="input"
                  >
                    <option value="">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="missed">Missed</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">&nbsp;</label>
                  <button className="btn-primary filter-btn" onClick={fetchFilteredStudents}>
                    🔍 Search
                  </button>
                </div>
              </div>
            </Card>

            <Card>
              <div className="card-header">
                <h3 className="card-title">Filter Results</h3>
                <span className="badge badge-primary">{filteredStudents.length} students</span>
              </div>
              
              {filteredStudents.length === 0 ? (
                <Empty 
                  icon="🚫" 
                  title="No Students Found" 
                  text="Try adjusting your filter criteria"
                />
              ) : (
                <div className="table-container">
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
                        <tr key={s._id} onClick={() => fetchPerformance(s._id, s.name)}>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.email}</td>
                          <td>{s.college || "-"}</td>
                          <td><span className="badge badge-success">{s.branch || "-"}</span></td>
                          <td>{s.section || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

        {/* CREATE STUDENT */}
        {activeTab === "create" && (
          <>
            <div className="page-header">
              <h1>Create Student</h1>
              <p>Add new students to the system</p>
            </div>
            
            <Card>
              <div className="card-header">
                <h3 className="card-title">Student Information</h3>
              </div>
              
              <div className="form-grid">
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <Input 
                    placeholder="Enter student name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <Input 
                    placeholder="Enter student email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                  />
                </div>
                
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <Input 
                    type="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} 
                  />
                </div>
              </div>
              
              <button className="btn-primary create-btn" onClick={createStudent}>
                Create Student
              </button>
            </Card>
          </>
        )}

        {/* STUDENTS */}
        {activeTab === "students" && (
          <>
            <div className="page-header">
              <h1>Students</h1>
              <p>Manage all registered students</p>
            </div>

            <div className="search-bar">
              <div className="input-group">
                <input
                  placeholder="Search student by name or email..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="input"
                />
                <span className="input-icon">🔍</span>
              </div>
            </div>

            <Card>
              <div className="card-header">
                <h3 className="card-title">All Students</h3>
                <span className="badge badge-primary">{students.length} total</span>
              </div>

              <div className="students-list">
                {students.filter(s =>
                  s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                  s.email.toLowerCase().includes(studentSearch.toLowerCase())
                ).map(s => (
                  <div key={s._id} className="student-row">
                    <div className="student-info">
                      <div className="student-avatar">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4>{s.name}</h4>
                        <p>{s.email}</p>
                      </div>
                    </div>
                    <div className="student-actions">
                      <button
                        className="btn-outline view-btn"
                        onClick={() => fetchPerformance(s._id, s.name)}
                        data-tooltip="View Performance"
                      >
                        📊
                      </button>
                      <button
                        className="btn-danger reset-btn"
                        onClick={() => setResetUser(s)}
                        data-tooltip="Reset Password"
                      >
                        🔄 Reset
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {resetUser && (
              <div className="modal-backdrop">
                <div className="modal-box">
                  <div className="modal-header">
                    <h3 className="modal-title">Reset Password</h3>
                    <button 
                      className="modal-close"
                      onClick={() => setResetUser(null)}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="modal-content">
                    <div className="user-info">
                      <div className="user-avatar">
                        {resetUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4>{resetUser.name}</h4>
                        <p>{resetUser.email}</p>
                      </div>
                    </div>
                    
                    <div className="input-group">
                      <label className="input-label">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="input"
                      />
                    </div>
                    
                    <div className="modal-actions">
                      <button className="btn-success" onClick={resetStudentPassword}>
                        Update Password
                      </button>
                      <button className="btn-outline" onClick={() => setResetUser(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {performance && (
              <Card>
                <div className="card-header">
                  <h3 className="card-title">{selectedStudent}'s Performance</h3>
                </div>
                
                <div className="performance-grid">
                  <div className="performance-stat">
                    <div className="stat-icon">📅</div>
                    <div>
                      <h4>{performance.totalDays}</h4>
                      <p>Total Days</p>
                    </div>
                  </div>
                  
                  <div className="performance-stat">
                    <div className="stat-icon">✅</div>
                    <div>
                      <h4>{performance.submittedDays}</h4>
                      <p>Submitted</p>
                    </div>
                  </div>
                  
                  <div className="performance-stat">
                    <div className="stat-icon">❌</div>
                    <div>
                      <h4>{performance.missedDays}</h4>
                      <p>Missed</p>
                    </div>
                  </div>
                  
                  <div className="performance-stat">
                    <div className="stat-icon">📈</div>
                    <div>
                      <h4>{performance.consistency}%</h4>
                      <p>Consistency</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* REVIEW */}
        {activeTab === "review" && (
          <>
            <div className="page-header">
              <h1>Review Submissions</h1>
              <p>Review and approve pending student submissions</p>
            </div>

            <div className="filter-bar">
              <div className="input-group">
                <input
                  type="date"
                  value={reviewDate}
                  onChange={e => setReviewDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <Card>
              <div className="card-header">
                <h3 className="card-title">Pending Reviews</h3>
                <span className="badge badge-warning">{pending.length} pending</span>
              </div>

              {pending.length === 0 ? (
                <Empty 
                  icon="📝" 
                  title="No Pending Submissions" 
                  text="All submissions have been reviewed for the selected date"
                />
              ) : (
                <div className="review-list">
                  {pending.map(p => (
                    <div key={p._id} className="review-card">
                      <div className="review-info">
                        <div className="student-avatar">
                          {p.studentId?.name?.charAt(0).toUpperCase() || "D"}
                        </div>
                        <div>
                          <h4>{p.studentId?.name || "Deleted Student"}</h4>
                          <p>{p.studentId?.email || "-"}</p>
                          <a 
                            href={p.linkedinUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="view-link"
                          >
                            🔗 View Task
                          </a>
                        </div>
                      </div>
                      
                      <div className="review-actions">
                        <div className="input-group">
                          <input
                            placeholder="Add remark..."
                            value={remark}
                            onChange={e => setRemark(e.target.value)}
                            className="input"
                          />
                        </div>
                        
                        <div className="action-buttons">
                          <button 
                            className="btn-success approve-btn"
                            onClick={() => reviewSubmission(p._id, "Approved")}
                            data-tooltip="Approve Submission"
                          >
                            ✅ Approve
                          </button>
                          <button 
                            className="btn-danger reject-btn"
                            onClick={() => reviewSubmission(p._id, "Rejected")}
                            data-tooltip="Reject Submission"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* SEARCH */}
        {activeTab === "search" && (
          <>
            <div className="page-header">
              <h1>🔍 Search Student Performance</h1>
              <p>Search and view detailed student performance metrics</p>
            </div>

            <Card>
              <div className="card-header">
                <h3 className="card-title">Student Search</h3>
              </div>
              
              <div className="search-container">
                <div className="input-group">
                  <input
                    placeholder="Search by Name / Email / Roll No"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input"
                  />
                  <span className="input-icon">🔍</span>
                </div>
                
                <button className="btn-primary search-btn" onClick={searchStudent}>
                  Search Student
                </button>
              </div>
            </Card>

            {!searchResult ? (
              <Empty 
                icon="👤" 
                title="Search for a Student" 
                text="Enter student details to view their performance metrics"
              />
            ) : (
              <Card>
                <div className="card-header">
                  <h3 className="card-title">👤 Student Details</h3>
                  <span className="badge badge-success">Found</span>
                </div>
                
                <div className="student-profile">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      {searchResult.student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4>{searchResult.student.name}</h4>
                      <p>{searchResult.student.email}</p>
                    </div>
                  </div>
                  
                  <div className="profile-details">
                    <div className="detail-item">
                      <span className="detail-label">Roll No:</span>
                      <span className="detail-value">{searchResult.student.rollNo || "-"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Branch:</span>
                      <span className="detail-value badge badge-primary">{searchResult.student.branch || "-"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="performance-section">
                  <h4 className="section-title">📊 Performance Metrics</h4>
                  
                  <div className="metrics-grid">
                    <div className="metric-card">
                      <div className="metric-icon">📅</div>
                      <div className="metric-content">
                        <h5>{searchResult.performance.totalDays}</h5>
                        <p>Total Days</p>
                      </div>
                    </div>
                    
                    <div className="metric-card">
                      <div className="metric-icon">✅</div>
                      <div className="metric-content">
                        <h5>{searchResult.performance.approved}</h5>
                        <p>Approved</p>
                      </div>
                    </div>
                    
                    <div className="metric-card">
                      <div className="metric-icon">⏳</div>
                      <div className="metric-content">
                        <h5>{searchResult.performance.pending}</h5>
                        <p>Pending</p>
                      </div>
                    </div>
                    
                    <div className="metric-card">
                      <div className="metric-icon">❌</div>
                      <div className="metric-content">
                        <h5>{searchResult.performance.rejected}</h5>
                        <p>Rejected</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

      </main>
    </div>
  );
}

/* ================= ENHANCED COMPONENTS ================= */

const Nav = ({ label, active, onClick, danger }) => (
  <div
    onClick={onClick}
    className={`nav-item ${active ? "nav-active" : ""} ${danger ? "nav-danger" : ""}`}
    data-tooltip={label.replace(/[^\w\s]/gi, '')}
  >
    <span className="nav-label">{label}</span>
    {active && <span className="nav-indicator"></span>}
  </div>
);

const Stat = ({ title, value, icon }) => (
  <div className="stat-card hover-lift">
    <div className="stat-card-icon">{icon}</div>
    <div className="stat-card-content">
      <h3>{value}</h3>
      <p>{title}</p>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="section">
    <h3 className="section-title">{title}</h3>
    {children}
  </div>
);

const Card = ({ children }) => (
  <div className="card fade-in">
    {children}
  </div>
);

const Row = ({ left, right }) => (
  <div className="row">
    <span className="row-left">{left}</span>
    <span className="row-right">{right}</span>
  </div>
);

const Input = (props) => (
  <div className="input-wrapper">
    <input {...props} className="input" />
  </div>
);

const Empty = ({ icon = "📊", title, text }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <h4 className="empty-title">{title}</h4>
    <p className="empty-description">{text}</p>
  </div>
);