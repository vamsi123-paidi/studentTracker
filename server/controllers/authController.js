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

/**
 * GET STUDENT PROFILE
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * UPDATE STUDENT PROFILE
 */
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      rollNo,
      college,
      branch,
      section,
      gender,
      oldPassword,
      newPassword
    } = req.body;

    const user = await User.findById(req.user.id);

    // ✅ Update profile fields
    user.name = name || user.name;
    user.rollNo = rollNo || user.rollNo;
    user.college = college || user.college;
    user.branch = branch || user.branch;
    user.section = section || user.section;
    user.gender = gender || user.gender;

    // ✅ If password fields provided → update password
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      // ✅ Disable force change flag after update
      user.forcePasswordChange = false;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully ✅",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        college: user.college,
        branch: user.branch,
        section: user.section,
        gender: user.gender,
        forcePasswordChange: user.forcePasswordChange
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};


/**
 * CHANGE PASSWORD (STUDENT)
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password" });
  }
};


