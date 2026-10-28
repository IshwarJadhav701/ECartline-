const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");

const router = express.Router();
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk = (v) => /^[6-9]\d{9}$/.test(v);

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, mobile: u.mobile, role: u.role });
const makeToken = (u) =>
  jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/register  { name, email, mobile, password }
router.post("/register", asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const mobile = String(req.body.mobile || "").trim();
  const password = String(req.body.password || "");

  if (name.length < 3) return res.status(400).json({ success: false, field: "name", message: "Enter your full name" });
  if (!emailOk(email)) return res.status(400).json({ success: false, field: "email", message: "Enter a valid email address" });
  if (!phoneOk(mobile)) return res.status(400).json({ success: false, field: "mobile", message: "Enter a valid 10-digit mobile number" });
  if (password.length < 6) return res.status(400).json({ success: false, field: "password", message: "Password must be at least 6 characters" });

  const [dup] = await db.query("SELECT email, mobile FROM users WHERE email = ? OR mobile = ?", [email, mobile]);
  if (dup.length) {
    const emailTaken = dup.some((d) => d.email === email);
    return res.status(409).json({
      success: false,
      field: emailTaken ? "email" : "mobile",
      message: emailTaken ? "This email is already registered. Please login." : "This mobile number is already registered.",
    });
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    const [r] = await db.query("INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)", [name, email, mobile, hash]);
    res.status(201).json({ success: true, message: "Account created", user: { id: r.insertId, name, email, mobile, role: "customer" } });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ success: false, field: "email", message: "This email or mobile is already registered." });
    throw err;
  }
}));

// POST /api/auth/login  { id: "email or mobile", password }
router.post("/login", asyncHandler(async (req, res) => {
  const id = String(req.body.id || req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!id || !password) return res.status(400).json({ success: false, message: "Email/mobile and password are required" });

  const [rows] = await db.query("SELECT * FROM users WHERE email = ? OR mobile = ? LIMIT 1", [id, id]);
  const user = rows[0];
  // same message for "no such user" and "wrong password" so nobody can guess which emails exist
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: "Invalid email/mobile or password" });
  }
  res.json({ success: true, message: "Login successful", token: makeToken(user), user: publicUser(user) });
}));

// GET /api/auth/me  (needs token)
router.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const [rows] = await db.query("SELECT id, name, email, mobile, role FROM users WHERE id = ?", [req.user.id]);
  if (!rows.length) return res.status(401).json({ success: false, message: "User no longer exists" });
  res.json({ success: true, user: rows[0] });
}));

// PUT /api/auth/profile - Update profile details
router.put("/profile", requireAuth, asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const mobile = String(req.body.mobile || "").trim();

  if (name.length < 3) return res.status(400).json({ success: false, message: "Full name must be at least 3 characters" });
  if (mobile && !phoneOk(mobile)) return res.status(400).json({ success: false, message: "Enter a valid 10-digit mobile number" });

  if (mobile) {
    const [dup] = await db.query("SELECT id FROM users WHERE mobile = ? AND id != ?", [mobile, req.user.id]);
    if (dup.length) return res.status(409).json({ success: false, message: "This mobile number is already in use by another account" });
  }

  await db.query("UPDATE users SET name = ?, mobile = ? WHERE id = ?", [name, mobile || null, req.user.id]);
  const [rows] = await db.query("SELECT id, name, email, mobile, role FROM users WHERE id = ?", [req.user.id]);
  res.json({ success: true, message: "Profile updated successfully", user: rows[0] });
}));

// PUT /api/auth/change-password - Change account password
router.put("/change-password", requireAuth, asyncHandler(async (req, res) => {
  const currentPassword = String(req.body.currentPassword || "");
  const newPassword = String(req.body.newPassword || "");

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Current and new password are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
  }

  const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: "User not found" });

  const valid = await bcrypt.compare(currentPassword, rows[0].password);
  if (!valid) {
    return res.status(400).json({ success: false, message: "Current password is incorrect" });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE users SET password = ? WHERE id = ?", [hash, req.user.id]);
  res.json({ success: true, message: "Password updated successfully" });
}));

// GET /api/auth/admin/stats - Overview metrics for admin dashboard
router.get("/admin/stats", requireAuth, asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin access required" });

  const [[userCount]] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
  const [[prodCount]] = await db.query("SELECT COUNT(*) as count FROM products");
  const [[orderCount]] = await db.query("SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as totalRevenue FROM orders WHERE order_status != 'cancelled'");
  const [[outOfStock]] = await db.query("SELECT COUNT(*) as count FROM products WHERE stock <= 0");
  const [[lowStock]] = await db.query("SELECT COUNT(*) as count FROM products WHERE stock > 0 AND stock <= 5");
  const [statusBreakdown] = await db.query("SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status");
  const [recentOrders] = await db.query(
    `SELECT o.id, o.order_number, o.total_amount, o.order_status, o.created_at, u.name as customer_name
     FROM orders o JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC LIMIT 5`
  );

  res.json({
    success: true,
    data: {
      totalCustomers: userCount.count,
      totalProducts: prodCount.count,
      totalOrders: orderCount.count,
      totalRevenue: Number(orderCount.totalRevenue),
      outOfStockCount: outOfStock.count,
      lowStockCount: lowStock.count,
      statusBreakdown,
      recentOrders,
    },
  });
}));

module.exports = router;

