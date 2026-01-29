const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { branchWiseReport } = require("../controllers/reportController");

router.get("/branch-report", protect, adminOnly, branchWiseReport);

module.exports = router;
