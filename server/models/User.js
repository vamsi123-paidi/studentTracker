const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true
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

    // ================= STUDENT PROFILE =================

    rollNo: {
      type: String,
      default: "",
      trim: true
    },

    college: {
      type: String,
      default: "",
      trim: true
    },

    branch: {
      type: String,
      default: "",
      trim: true
    },

    section: {
      type: String,
      default: "",
      trim: true
    },

    gender: {
      type: String,
      default: "",
      trim: true
    }

  },
  {
    timestamps: true
  }
);

/* ================= INDEXES ================= */

userSchema.index({ college: 1 });
userSchema.index({ branch: 1 });

module.exports = mongoose.model("User", userSchema);