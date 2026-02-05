const router = require("express").Router();

const {
  login,
  registerStudent,
  getAllStudents,
  getProfile,
  updateProfile,
  changePassword,
  resetStudentPassword
} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// AUTH
router.post("/login", login);

// ADMIN
router.post("/register-student", protect, adminOnly, registerStudent);
router.get("/students", protect, adminOnly, getAllStudents);
router.patch("/reset-password/:id", protect, adminOnly, resetStudentPassword);

// STUDENT PROFILE
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/create-admin", async (req, res) => {
  const bcrypt = require("bcryptjs");
  const User = require("../models/User");

  const hashed = await bcrypt.hash("admin@123", 10);

  const admin = await User.create({
    name: "Admin",
    email: "admin@gmail.com",
    password: hashed,
    role: "admin"
  });

  res.json(admin);
});

// PASSWORD CHANGE
router.put("/change-password", protect, changePassword);

module.exports = router;
