const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  linkedinUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  remark: { type: String, default: "" }
});

module.exports = mongoose.model("Submission", submissionSchema);
