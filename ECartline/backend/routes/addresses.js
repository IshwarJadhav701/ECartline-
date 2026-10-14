const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");

const router = express.Router();
router.use(requireAuth);

const isId = (v) => /^\d+$/.test(String(v));

// GET /api/addresses - List saved addresses
router.get("/", asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC",
    [req.user.id]
  );
  res.json({ success: true, data: rows });
}));

// POST /api/addresses - Save a new address
router.post("/", asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { fullName, phone, street, city, state, pincode, isDefault = false } = req.body;

  if (!fullName || String(fullName).trim().length < 2) {
    return res.status(400).json({ success: false, message: "Full name is required" });
  }
  if (!phone || !/^[6-9]\d{9}$/.test(String(phone).trim())) {
    return res.status(400).json({ success: false, message: "Valid 10-digit phone number is required" });
  }
  if (!street || String(street).trim().length < 5) {
    return res.status(400).json({ success: false, message: "Street/House details are required" });
  }
  if (!city || !state || !pincode) {
    return res.status(400).json({ success: false, message: "City, state, and pincode are required" });
  }

  // If user has no existing addresses, make this one default automatically
  const [countRows] = await db.query("SELECT COUNT(*) as cnt FROM addresses WHERE user_id = ?", [userId]);
  const shouldBeDefault = isDefault || countRows[0].cnt === 0;

  if (shouldBeDefault) {
    await db.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [userId]);
  }

  const [resInsert] = await db.query(
    `INSERT INTO addresses (user_id, full_name, phone, street, city, state, pincode, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      String(fullName).trim(),
      String(phone).trim(),
      String(street).trim(),
      String(city).trim(),
      String(state).trim(),
      String(pincode).trim(),
      shouldBeDefault ? 1 : 0,
    ]
  );

  const [created] = await db.query("SELECT * FROM addresses WHERE id = ?", [resInsert.insertId]);
  res.status(201).json({ success: true, message: "Address saved", data: created[0] });
}));

// PUT /api/addresses/:id - Update an existing address
router.put("/:id", asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid address ID" });
  const userId = req.user.id;
  const { fullName, phone, street, city, state, pincode, isDefault } = req.body;

  const [existing] = await db.query("SELECT id FROM addresses WHERE id = ? AND user_id = ?", [req.params.id, userId]);
  if (!existing.length) return res.status(404).json({ success: false, message: "Address not found" });

  if (isDefault) {
    await db.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [userId]);
  }

  await db.query(
    `UPDATE addresses
     SET full_name = COALESCE(?, full_name),
         phone = COALESCE(?, phone),
         street = COALESCE(?, street),
         city = COALESCE(?, city),
         state = COALESCE(?, state),
         pincode = COALESCE(?, pincode),
         is_default = COALESCE(?, is_default)
     WHERE id = ? AND user_id = ?`,
    [
      fullName ? String(fullName).trim() : null,
      phone ? String(phone).trim() : null,
      street ? String(street).trim() : null,
      city ? String(city).trim() : null,
      state ? String(state).trim() : null,
      pincode ? String(pincode).trim() : null,
      isDefault !== undefined ? (isDefault ? 1 : 0) : null,
      req.params.id,
      userId,
    ]
  );

  const [updated] = await db.query("SELECT * FROM addresses WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: "Address updated", data: updated[0] });
}));

// DELETE /api/addresses/:id - Delete an address
router.delete("/:id", asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid address ID" });
  const [r] = await db.query("DELETE FROM addresses WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!r.affectedRows) return res.status(404).json({ success: false, message: "Address not found" });

  // If deleted address was default, make the latest one default
  const [remaining] = await db.query("SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1", [req.user.id]);
  if (remaining.length) {
    await db.query("UPDATE addresses SET is_default = TRUE WHERE id = ?", [remaining[0].id]);
  }

  res.json({ success: true, message: "Address deleted" });
}));

// PUT /api/addresses/:id/default - Set as default
router.put("/:id/default", asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid address ID" });
  const userId = req.user.id;
  await db.query("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [userId]);
  const [r] = await db.query("UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?", [req.params.id, userId]);
  if (!r.affectedRows) return res.status(404).json({ success: false, message: "Address not found" });
  res.json({ success: true, message: "Default address updated" });
}));

module.exports = router;
