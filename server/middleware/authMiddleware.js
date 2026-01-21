const jwt = require("jsonwebtoken");

/* ================= AUTH PROTECT ================= */
exports.protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/* ================= ADMIN ONLY ================= */
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

/* ================= STUDENT ONLY (OPTIONAL BUT RECOMMENDED) ================= */
exports.studentOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
};
