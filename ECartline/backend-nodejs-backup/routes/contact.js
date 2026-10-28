const express = require("express");
const db = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");

const router = express.Router();

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// POST /api/contact - Submit customer query
router.post("/", asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || String(name).trim().length < 2) {
    return res.status(400).json({ success: false, message: "Please enter your name" });
  }
  if (!email || !emailOk(String(email).trim())) {
    return res.status(400).json({ success: false, message: "Please enter a valid email address" });
  }
  if (!message || String(message).trim().length < 8) {
    return res.status(400).json({ success: false, message: "Message must be at least 8 characters long" });
  }

  await db.query(
    "INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)",
    [
      String(name).trim(),
      String(email).trim().toLowerCase(),
      phone ? String(phone).trim() : null,
      String(message).trim(),
    ]
  );

  res.status(201).json({
    success: true,
    message: "Thank you for reaching out! Our team will contact you shortly.",
  });
}));

// GET /api/contact - Admin view inquiries
router.get("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const [rows] = await db.query("SELECT * FROM contact_messages ORDER BY created_at DESC");
  res.json({ success: true, count: rows.length, data: rows });
}));

module.exports = router;
