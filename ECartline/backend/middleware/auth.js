const jwt = require("jsonwebtoken");

// Checks the "Authorization: Bearer <token>" header sent by the frontend.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Please login first" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, iat, exp }
    next();
  } catch {
    res.status(401).json({ success: false, message: "Session expired. Please login again" });
  }
}

// Only admin users can create / edit / delete products.
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
