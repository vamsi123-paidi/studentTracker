const router = require("express").Router();
const {
  login,
  registerStudent,
  getAllStudents

} = require("../controllers/authController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/register-student", protect, adminOnly, registerStudent);
router.get("/students", protect, adminOnly, getAllStudents);

router.post("/create-admin", async (req, res) => {
  const bcrypt = require("bcryptjs");
  const User = require("../models/User");

  const hashedPassword = await bcrypt.hash("admin@123", 10);

  const admin = await User.create({
    name: "Super Admin",
    email: "admin@gmail.com",
    password: hashedPassword,
    role: "admin"
  });

  res.json({
    message: "Admin created successfully",
    admin
  });
});

module.exports = router;
