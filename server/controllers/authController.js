const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * LOGIN (Admin & Student)
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

  res.json({
    token,
    role: user.role
  });
};

/**
 * ADMIN → CREATE STUDENT
 */
exports.registerStudent = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Student already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const student = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "student"
  });

  res.json({
    message: "Student created successfully",
    student: {
      id: student._id,
      name: student.name,
      email: student.email
    }
  });
};

exports.getAllStudents = async (req, res) => {
  const students = await User.find({ role: "student" })
    .select("-password");

  res.json(students);
};


