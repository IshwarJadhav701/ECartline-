const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/helpers");

const router = express.Router();
const isId = (v) => /^\d+$/.test(String(v));

// GET /api/reviews/product/:productId - Get all reviews for a product
router.get("/product/:productId", asyncHandler(async (req, res) => {
  const pid = req.params.productId;
  if (!isId(pid)) return res.status(400).json({ success: false, message: "Invalid product ID" });

  const [reviews] = await db.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name, u.id as user_id
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC`,
    [pid]
  );

  // Breakdown summary
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  reviews.forEach((r) => {
    if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
    sum += r.rating;
  });
  const avg = reviews.length ? (sum / reviews.length).toFixed(1) : "0.0";

  res.json({
    success: true,
    count: reviews.length,
    averageRating: Number(avg),
    breakdown,
    data: reviews,
  });
}));

// POST /api/reviews/product/:productId - Submit or update a review
router.post("/product/:productId", requireAuth, asyncHandler(async (req, res) => {
  const pid = req.params.productId;
  if (!isId(pid)) return res.status(400).json({ success: false, message: "Invalid product ID" });

  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be a whole number between 1 and 5" });
  }

  // Check product exists
  const [prod] = await db.query("SELECT id FROM products WHERE id = ?", [pid]);
  if (!prod.length) return res.status(404).json({ success: false, message: "Product not found" });

  // Insert or update review
  await db.query(
    `INSERT INTO reviews (user_id, product_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), created_at = CURRENT_TIMESTAMP`,
    [req.user.id, pid, rating, comment]
  );

  // Recalculate average and count for products table
  const [calc] = await db.query(
    "SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE product_id = ?",
    [pid]
  );
  const newRating = calc[0].avg_rating ? Number(Number(calc[0].avg_rating).toFixed(1)) : 0;
  const newCount = calc[0].cnt || 0;

  await db.query(
    "UPDATE products SET rating = ?, reviews_count = ? WHERE id = ?",
    [newRating, newCount, pid]
  );

  res.status(201).json({
    success: true,
    message: "Thank you! Your review has been saved.",
    rating: newRating,
    reviewsCount: newCount,
  });
}));

module.exports = router;
