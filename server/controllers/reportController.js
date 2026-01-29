const User = require("../models/User");
const Submission = require("../models/Submission");
const XLSX = require("xlsx");

exports.branchWiseReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // All branches
    const branches = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];

    const report = [];

    for (const branch of branches) {
      const students = await User.find({ role: "student", branch });

      const studentIds = students.map(s => s._id.toString());

      const submissions = await Submission.find({
        date,
        studentId: { $in: studentIds }
      });

      const submitted = submissions.length;
      const approved = submissions.filter(s => s.status === "Approved").length;
      const rejected = submissions.filter(s => s.status === "Rejected").length;
      const pending = submissions.filter(s => s.status === "Pending").length;
      const total = students.length;
      const missed = total - submitted;

      report.push({
        Branch: branch,
        Total_Students: total,
        Submitted: submitted,
        Missed: missed,
        Approved: approved,
        Rejected: rejected,
        Pending: pending
      });
    }

    // ✅ Convert JSON → Excel
    const worksheet = XLSX.utils.json_to_sheet(report);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Branch Report");

    const fileBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", `attachment; filename=branch-report-${date}.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    res.send(fileBuffer);

  } catch (err) {
    console.error("Branch Report Error:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};
