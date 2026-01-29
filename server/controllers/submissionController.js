const Submission = require("../models/Submission");
const User = require("../models/User");
const ExcelJS = require("exceljs");

exports.submitTaskByDate = async (req, res) => {
  const studentId = req.user.id;
  const { date, linkedinUrl } = req.body;

  // basic validation
  if (!date || !linkedinUrl) {
    return res.status(400).json({ message: "Date and link required" });
  }

  const today = new Date().toISOString().split("T")[0];

  // ❌ block future dates
  if (date > today) {
    return res.status(400).json({
      message: "Future date submission is not allowed"
    });
  }

  // ❌ block duplicate submission for same date
  const exists = await Submission.findOne({
    studentId,
    date
  });

  if (exists) {
    return res.status(400).json({
      message: "You already submitted for this date"
    });
  }

  const submission = await Submission.create({
    studentId,
    date,
    linkedinUrl,
    status: "Pending"
  });

  res.json({
    message: "Task submitted successfully",
    submission
  });
};


/**
 * STUDENT → GET TODAY STATUS
 */
exports.getTodayStatus = async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const submission = await Submission.findOne({
    studentId: req.user.id,
    date: today
  });

  res.json(submission || null);
};

/**
 * STUDENT → FULL HISTORY (DATE-WISE)
 */
exports.getStudentHistory = async (req, res) => {
  const studentId = req.user.id;

  const history = await Submission.find({ studentId })
    .sort({ date: -1 });

  res.json(history);
};
exports.getMyPerformance = async (req, res) => {
  const studentId = req.user.id;

  const submissions = await Submission.find({ studentId });

  if (submissions.length === 0) {
    return res.json({
      totalDays: 0,
      submittedDays: 0,
      missedDays: 0,
      consistency: "0%"
    });
  }

  const dates = submissions.map(s => s.date).sort();
  const firstDate = new Date(dates[0]);
  const lastDate = new Date(dates[dates.length - 1]);

  const totalDays =
    Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;

  const submittedDays = submissions.length;
  const missedDays = totalDays - submittedDays;

  const consistency =
    ((submittedDays / totalDays) * 100).toFixed(1) + "%";

  res.json({
    totalDays,
    submittedDays,
    missedDays,
    consistency
  });
};



/**
 * ADMIN → GET PENDING SUBMISSIONS (DATE-WISE)
 */
exports.getPendingByDate = async (req, res) => {
  const date = req.query.date; // YYYY-MM-DD
  const data = await Submission.find({ date, status: "Pending" })
    .populate("studentId", "name email");
  res.json(data);
};

/**
 * ADMIN → APPROVE / REJECT SUBMISSION
 */
exports.reviewSubmission = async (req, res) => {
  const { id } = req.params; // submissionId
  const { status, remark } = req.body; // Approved | Rejected

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const updated = await Submission.findByIdAndUpdate(
    id,
    { status, remark: remark || "" },
    { new: true }
  );

  res.json(updated);
};

/**
 * ADMIN → DASHBOARD ANALYTICS (DATE-WISE)
 */
exports.getAdminAnalytics = async (req, res) => {
  const date = req.query.date;

  const totalStudents = await User.countDocuments({ role: "student" });

  const submissions = await Submission.find({ date });

  const submittedCount = submissions.length;
  const pendingCount = submissions.filter(s => s.status === "Pending").length;
  const approvedCount = submissions.filter(s => s.status === "Approved").length;
  const rejectedCount = submissions.filter(s => s.status === "Rejected").length;

  const missingCount = totalStudents - submittedCount;

  res.json({
    totalStudents,
    submittedCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    missingCount
  });
};

exports.getMissedStudents = async (req, res) => {
  const date = req.query.date;

  // all students
  const students = await User.find({ role: "student" }).select("name email");

  // students who submitted
  const submissions = await Submission.find({ date }).select("studentId");

  const submittedIds = submissions.map(s => s.studentId.toString());

  // students who did NOT submit
  const missed = students.filter(
    s => !submittedIds.includes(s._id.toString())
  );

  res.json(missed);
};

exports.getStudentPerformance = async (req, res) => {
  const studentId = req.params.id;

  const submissions = await Submission.find({ studentId });

  if (submissions.length === 0) {
    return res.json({
      totalDays: 0,
      submittedDays: 0,
      missedDays: 0,
      consistency: "0%"
    });
  }

  const dates = submissions.map(s => s.date).sort();
  const firstDate = new Date(dates[0]);
  const lastDate = new Date(dates[dates.length - 1]);

  const diffDays =
    Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;

  const submittedDays = submissions.length;
  const missedDays = diffDays - submittedDays;

  const consistency = ((submittedDays / diffDays) * 100).toFixed(1) + "%";

  res.json({
    totalDays: diffDays,
    submittedDays,
    missedDays,
    consistency
  });
};

/**
 * STUDENT → PROGRESS (Approved / Pending / Rejected)
 */
exports.getStudentProgress = async (req, res) => {
  try {
    const submissions = await Submission.find({
      studentId: req.user.id
    });

    const totalDays = submissions.length;
    const approved = submissions.filter(s => s.status === "Approved").length;
    const rejected = submissions.filter(s => s.status === "Rejected").length;
    const pending = submissions.filter(s => s.status === "Pending").length;

    res.json({
      totalDays,
      approved,
      rejected,
      pending
    });
  } catch (err) {
    console.error("Progress Error:", err);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
};


/**
 * STUDENT → LEADERBOARD
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Submission.aggregate([
      {
        $match: { status: "Approved" }
      },
      {
        $group: {
          _id: "$studentId",
          score: { $sum: 1 }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // OPTIONAL: populate student names (recommended 🔥)
    const populated = await User.populate(leaderboard, {
      path: "_id",
      select: "name email"
    });

    res.json(populated);
  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

exports.getFilteredStudents = async (req, res) => {
  try {
    const { date, college, branch, section } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // 1️⃣ Get students by filters
    let studentQuery = { role: "student" };
    if (college) studentQuery.college = college;
    if (branch) studentQuery.branch = branch;
    if (section) studentQuery.section = section;

    const students = await User.find(studentQuery)
      .select("name email college branch section");

    // 2️⃣ Get submissions for that date
    const submissions = await Submission.find({ date }).populate("studentId");

    // 3️⃣ Map submissions by studentId
    const submissionMap = {};
    submissions.forEach(s => {
      if (s.studentId) {
        submissionMap[s.studentId._id.toString()] = s;
      }
    });

    // 4️⃣ Merge student + submission data
    const result = students.map(student => {
      const submission = submissionMap[student._id.toString()];

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        college: student.college,
        branch: student.branch,
        section: student.section,

        // ✅ task info
        submitted: !!submission,
        status: submission ? submission.status : "Not Submitted",
        linkedinUrl: submission ? submission.linkedinUrl : null
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Filter Error:", err);
    res.status(500).json({ message: "Filter failed" });
  }
};

exports.getBranchAnalytics = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Get all students with branch info
    const students = await User.find({ role: "student" }).select("branch");

    // Group students by branch
    const branchMap = {};
    students.forEach(s => {
      const branch = s.branch || "Unknown";
      if (!branchMap[branch]) branchMap[branch] = { total: 0 };
      branchMap[branch].total++;
    });

    // Get submissions for date
    const submissions = await Submission.find({ date }).populate("studentId");

    submissions.forEach(sub => {
      if (!sub.studentId) return;

      const branch = sub.studentId.branch || "Unknown";

      if (!branchMap[branch]) branchMap[branch] = { total: 0 };

      if (!branchMap[branch].submitted) branchMap[branch].submitted = 0;
      if (!branchMap[branch].approved) branchMap[branch].approved = 0;
      if (!branchMap[branch].pending) branchMap[branch].pending = 0;
      if (!branchMap[branch].rejected) branchMap[branch].rejected = 0;

      branchMap[branch].submitted++;

      if (sub.status === "Approved") branchMap[branch].approved++;
      if (sub.status === "Pending") branchMap[branch].pending++;
      if (sub.status === "Rejected") branchMap[branch].rejected++;
    });

    // Convert object → array
    const result = Object.keys(branchMap).map(branch => {
      const data = branchMap[branch];
      return {
        branch,
        total: data.total || 0,
        submitted: data.submitted || 0,
        missed: (data.total || 0) - (data.submitted || 0),
        approved: data.approved || 0,
        pending: data.pending || 0,
        rejected: data.rejected || 0
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Branch Analytics Error:", err);
    res.status(500).json({ message: "Failed to fetch branch analytics" });
  }
};







exports.downloadBranchReport = async (req, res) => {
  try {
    const { date, branch } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // 1️⃣ Get students (branch filter optional)
    let studentQuery = { role: "student" };
    if (branch && branch !== "all") {
      studentQuery.branch = branch;
    }

    const students = await User.find(studentQuery).select("name rollNo branch");

    // 2️⃣ Get submissions for that date
    const submissions = await Submission.find({ date }).populate("studentId");

    const submittedMap = {};
    submissions.forEach(s => {
      if (s.studentId) {
        submittedMap[s.studentId._id.toString()] = true;
      }
    });

    // 3️⃣ Prepare Excel data
    const reportData = students.map(s => ({
      name: s.name,
      rollNo: s.rollNo || "-",
      branch: s.branch || "-",
      status: submittedMap[s._id.toString()] ? "Done" : "Missed",
      date
    }));

    // 4️⃣ Create Excel file
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Branch Report");

    sheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Roll No", key: "rollNo", width: 15 },
      { header: "Branch", key: "branch", width: 15 },
      { header: "Status", key: "status", width: 12 },
      { header: "Date", key: "date", width: 15 }
    ];

    reportData.forEach(row => sheet.addRow(row));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${branch || "all"}-report-${date}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Excel Error:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

exports.getStudentPerformance = async (req, res) => {
  try {
    const studentId = req.params.id;

    // ✅ get all valid task days (not holidays)
    const taskDays = await TaskDay.find({ isHoliday: false });
    const totalTaskDays = taskDays.length;

    // ✅ student submissions
    const submissions = await Submission.find({ studentId });

    const submittedDays = submissions.length;
    const missedDays = totalTaskDays - submittedDays;

    const consistency =
      totalTaskDays === 0
        ? "0%"
        : ((submittedDays / totalTaskDays) * 100).toFixed(2) + "%";

    res.json({
      totalTaskDays,
      submittedDays,
      missedDays,
      consistency
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Performance error" });
  }
};

exports.searchStudentPerformance = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.json([]);

    // ✅ Search by name / email / rollNo
    const student = await User.findOne({
      role: "student",
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { rollNo: { $regex: q, $options: "i" } }
      ]
    });

    if (!student) return res.json(null);

    // ✅ Performance calculation (simple version)
    const submissions = await Submission.find({ studentId: student._id });

    const totalDays = submissions.length;
    const approved = submissions.filter(s => s.status === "Approved").length;
    const rejected = submissions.filter(s => s.status === "Rejected").length;
    const pending = submissions.filter(s => s.status === "Pending").length;

    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
        branch: student.branch
      },
      performance: {
        totalDays,
        approved,
        rejected,
        pending
      }
    });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};
