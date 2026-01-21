const router = require("express").Router();
const { protect, adminOnly ,studentOnly} = require("../middleware/authMiddleware");
const {
  submitTaskByDate,
  getTodayStatus,
  getPendingByDate,
  reviewSubmission,
  getStudentHistory,
  getAdminAnalytics,
  getMissedStudents,
  getStudentPerformance,
  getMyPerformance
} = require("../controllers/submissionController");

router.post("/submit", protect,studentOnly, submitTaskByDate);
router.get("/today", protect, getTodayStatus);
router.get("/history", protect, getStudentHistory);
router.get("/my-performance", protect, getMyPerformance);


// ADMIN
router.get("/pending", protect, adminOnly, getPendingByDate);
router.patch("/review/:id", protect, adminOnly, reviewSubmission);
router.get("/analytics", protect, adminOnly, getAdminAnalytics);
router.get("/missed", protect, adminOnly, getMissedStudents);
router.get(
  "/performance/:id",
  protect,
  adminOnly,
  getStudentPerformance
);



module.exports = router;
