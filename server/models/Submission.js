const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    date: {
      type: String,
      required: true
    }, // YYYY-MM-DD

    linkedinUrl: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },

    remark: {
      type: String,
      default: "",
      trim: true
    }

  },
  {
    timestamps: true
  }
);

submissionSchema.index({ date: 1 });
submissionSchema.index({ studentId: 1 });

module.exports = mongoose.model("Submission", submissionSchema);