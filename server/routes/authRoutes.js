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


module.exports = router;
