require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173", // Vite local
    "https://student-tracker-aw6t.vercel.app" // production frontend
  ],
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
