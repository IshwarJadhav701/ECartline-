const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler, toProduct } = require("../utils/helpers");

const router = express.Router();
router.use(requireAuth);

const isId = (v) => /^\d+$/.test(String(v));

// GET /api/wishlist - Get full products in wishlist
router.get("/", asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.* FROM wishlist_items w
     JOIN products p ON p.id = w.product_id
     WHERE w.user_id = ?
     ORDER BY w.id DESC`,
    [req.user.id]
  );
  const ids = rows.map((r) => r.id);
  res.json({ success: true, ids, data: rows.map(toProduct) });
}));

// POST /api/wishlist/:productId - Add item to wishlist
router.post("/:productId", asyncHandler(async (req, res) => {
  const pid = req.params.productId;
  if (!isId(pid)) return res.status(400).json({ success: false, message: "Invalid product ID" });

  await db.query(
    "INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)",
    [req.user.id, pid]
  );

  const [rows] = await db.query("SELECT product_id FROM wishlist_items WHERE user_id = ?", [req.user.id]);
  res.json({ success: true, message: "Added to wishlist", ids: rows.map((r) => r.product_id) });
}));

// DELETE /api/wishlist/:productId - Remove item from wishlist
router.delete("/:productId", asyncHandler(async (req, res) => {
  const pid = req.params.productId;
  if (!isId(pid)) return res.status(400).json({ success: false, message: "Invalid product ID" });

  await db.query(
    "DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?",
    [req.user.id, pid]
  );

  const [rows] = await db.query("SELECT product_id FROM wishlist_items WHERE user_id = ?", [req.user.id]);
  res.json({ success: true, message: "Removed from wishlist", ids: rows.map((r) => r.product_id) });
}));

// POST /api/wishlist/sync - Sync guest localStorage items after login
router.post("/sync", asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.productIds) ? req.body.productIds : [];
  for (const pid of items) {
    if (isId(pid)) {
      await db.query(
        "INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)",
        [req.user.id, pid]
      );
    }
  }

  const [rows] = await db.query(
    `SELECT p.* FROM wishlist_items w
     JOIN products p ON p.id = w.product_id
     WHERE w.user_id = ?
     ORDER BY w.id DESC`,
    [req.user.id]
  );
  const ids = rows.map((r) => r.id);
  res.json({ success: true, ids, data: rows.map(toProduct) });
}));

module.exports = router;
