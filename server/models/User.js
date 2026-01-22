const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "student"],
    default: "student"
  },

  // ✅ STUDENT PROFILE FIELDS (NEW)
  rollNo: {
    type: String,
    default: ""
  },
  college: {
    type: String,
    default: ""
  },
  branch: {
    type: String,
    default: ""
  },
  section: {
    type: String,
    default: ""
  },
  gender: {
    type: String,
    default: ""
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
