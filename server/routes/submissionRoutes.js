const router = require("express").Router();
const { protect, adminOnly, studentOnly } = require("../middleware/authMiddleware");

const {
  submitTaskByDate,
  getTodayStatus,
  getPendingByDate,
  reviewSubmission,
  getStudentHistory,
  getAdminAnalytics,
  getMissedStudents,
  getStudentPerformance,
  getMyPerformance,
  getStudentProgress,
  getLeaderboard,
  getBranchAnalytics,
  getFilteredStudents ,
  downloadBranchReport,
  searchStudentPerformance
  
} = require("../controllers/submissionController");
router.get("/branch-report", protect, adminOnly, downloadBranchReport);
router.get("/search-performance", protect, adminOnly, searchStudentPerformance);

router.post("/submit", protect, studentOnly, submitTaskByDate);
router.get("/today", protect, getTodayStatus);
router.get("/history", protect, getStudentHistory);
router.get("/my-performance", protect, getMyPerformance);
router.get("/progress", protect, getStudentProgress);
router.get("/leaderboard", protect, getLeaderboard);
router.get("/filter-students", protect, adminOnly, getFilteredStudents);
router.get("/branch-analytics", protect, adminOnly, getBranchAnalytics);

router.get("/pending", protect, adminOnly, getPendingByDate);
router.patch("/review/:id", protect, adminOnly, reviewSubmission);
router.get("/analytics", protect, adminOnly, getAdminAnalytics);
router.get("/missed", protect, adminOnly, getMissedStudents);
router.get("/performance/:id", protect, adminOnly, getStudentPerformance);

module.exports = router;
