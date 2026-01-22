const router = require("express").Router();

const {
  login,
  registerStudent,
  getAllStudents,
  getProfile,
  updateProfile,
  changePassword
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// AUTH
router.post("/login", login);

// ADMIN
router.post("/register-student", protect, adminOnly, registerStudent);
router.get("/students", protect, adminOnly, getAllStudents);

// STUDENT PROFILE
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// PASSWORD CHANGE
router.put("/change-password", protect, changePassword);

module.exports = router;
