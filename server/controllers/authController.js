const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * LOGIN (Admin & Student)
 */
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      role: user.role
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Login failed"
    });
  }
};

/**
 * ADMIN → CREATE STUDENT
 */
exports.registerStudent = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      college,
      branch,
      section,
      rollNo,
      gender
    } = req.body;

    const existing = await User.findOne({
      email: email.toLowerCase()
    });

    if (existing) {
      return res.status(400).json({
        message: "Student already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await User.create({

      name,
      email: email.toLowerCase(),
      password: hashedPassword,

      role: "student",

      // ================= PROFILE =================

      college,
      branch,
      section,
      rollNo,
      gender
    });

    res.json({

      message: "Student created successfully",

      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        college: student.college,
        branch: student.branch,
        section: student.section,
        rollNo: student.rollNo
      }
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to create student"
    });
  }
};

/**
 * GET ALL STUDENTS
 */
exports.getAllStudents = async (req, res) => {

  try {

    const { college } = req.query;

    let filter = {
      role: "student"
    };

    // ================= FILTER BY COLLEGE =================

    if (
      college &&
      college !== "All Colleges"
    ) {
      filter.college = college;
    }

    const students = await User.find(filter)
      .select("-password");

    res.json(students);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch students"
    });
  }
};

/**
 * GET STUDENT PROFILE
 */
exports.getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id)
      .select("-password");

    res.json(user);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch profile"
    });
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

    // ================= UPDATE PROFILE =================

    user.name = name || user.name;
    user.gender = gender || user.gender;

    // ================= PASSWORD UPDATE =================

    if (oldPassword && newPassword) {

      const isMatch = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (!isMatch) {
        return res.status(400).json({
          message: "Old password is incorrect"
        });
      }

      const hashedPassword = await bcrypt.hash(
        newPassword,
        10
      );

      user.password = hashedPassword;

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

    res.status(500).json({
      message: "Failed to update profile"
    });
  }
};

/**
 * CHANGE PASSWORD (STUDENT)
 */
exports.changePassword = async (req, res) => {

  try {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect"
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    res.json({
      message: "Password updated successfully ✅"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to change password"
    });
  }
};

/**
 * ADMIN → RESET STUDENT PASSWORD
 */
exports.resetStudentPassword = async (req, res) => {

  try {

    const { password } = req.body;

    const { id } = req.params;

    if (!password) {
      return res.status(400).json({
        message: "Password required"
      });
    }

    const hashed = await bcrypt.hash(
      password,
      10
    );

    await User.findByIdAndUpdate(id, {
      password: hashed
    });

    res.json({
      message: "Password reset successfully ✅"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Reset failed"
    });
  }
};