const express = require("express");
const db = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { asyncHandler, toProduct } = require("../utils/helpers");

const router = express.Router();

const SORTS = {
  newest: "created_at DESC, id DESC",
  price_asc: "price ASC",
  price_desc: "price DESC",
  rating: "rating DESC",
  featured: "id ASC",
};
const isId = (v) => /^\d+$/.test(String(v));

// Reads + validates product fields from the request body. `partial` = for PUT (only given fields).
function readBody(body, partial = false) {
  const out = {};
  const errors = [];
  const has = (k) => body[k] !== undefined;

  if (!partial || has("name")) {
    const v = String(body.name ?? "").trim();
    if (!v) errors.push("name is required"); else out.name = v;
  }
  if (!partial || has("category")) {
    const v = String(body.category ?? "").trim();
    if (!v) errors.push("category is required"); else out.category = v;
  }
  if (!partial || has("price")) {
    const v = Number(body.price);
    if (body.price === undefined || body.price === "" || !Number.isFinite(v) || v < 0) errors.push("price must be a number >= 0"); else out.price = v;
  }
  if (has("stock") || !partial) {
    const v = body.stock === undefined ? 0 : Number(body.stock);
    if (!Number.isInteger(v) || v < 0) errors.push("stock must be a whole number >= 0"); else out.stock = v;
  }
  if (has("description")) out.description = String(body.description ?? "");
  if (has("image")) out.image = String(body.image ?? "");
  if (has("oldPrice")) {
    const v = body.oldPrice === null || body.oldPrice === "" ? null : Number(body.oldPrice);
    if (v !== null && (!Number.isFinite(v) || v < 0)) errors.push("oldPrice must be a number >= 0"); else out.old_price = v;
  }
  if (has("images")) {
    if (!Array.isArray(body.images)) errors.push("images must be an array of URLs"); else out.images = JSON.stringify(body.images.map(String));
  }
  if (has("rating")) {
    const v = Number(body.rating);
    if (!Number.isFinite(v) || v < 0 || v > 5) errors.push("rating must be between 0 and 5"); else out.rating = v;
  }
  if (has("reviews")) {
    const v = Number(body.reviews);
    if (!Number.isInteger(v) || v < 0) errors.push("reviews must be a whole number >= 0"); else out.reviews_count = v;
  }
  return { out, errors };
}

// GET /api/products/suggestions?q= - Fast search autocompletion
router.get("/suggestions", asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q || q.length < 2) return res.json({ success: true, data: [] });

  const like = `%${q}%`;
  const [rows] = await db.query(
    "SELECT id, name, category, price, image, rating FROM products WHERE name LIKE ? OR category LIKE ? ORDER BY rating DESC, id ASC LIMIT 6",
    [like, like]
  );
  res.json({ success: true, data: rows.map(toProduct) });
}));

// GET /api/products?q=&category=&sort=&limit=&page=&minPrice=&maxPrice=&minRating=&inStock=
router.get("/", asyncHandler(async (req, res) => {
  const where = [];
  const params = [];

  if (req.query.category) {
    where.push("category = ?");
    params.push(String(req.query.category));
  }
  if (req.query.q) {
    where.push("(name LIKE ? OR description LIKE ? OR category LIKE ?)");
    const like = `%${String(req.query.q).trim()}%`;
    params.push(like, like, like);
  }
  if (req.query.minPrice !== undefined && req.query.minPrice !== "") {
    where.push("price >= ?");
    params.push(Number(req.query.minPrice) || 0);
  }
  if (req.query.maxPrice !== undefined && req.query.maxPrice !== "") {
    where.push("price <= ?");
    params.push(Number(req.query.maxPrice) || 9999999);
  }
  if (req.query.minRating) {
    where.push("rating >= ?");
    params.push(Number(req.query.minRating) || 0);
  }
  if (req.query.minDiscount) {
    const disc = Number(req.query.minDiscount);
    if (disc > 0) {
      where.push("old_price IS NOT NULL AND old_price > price AND ROUND((old_price - price) / old_price * 100) >= ?");
      params.push(disc);
    }
  }
  if (req.query.inStock === "true" || req.query.inStock === "1") {
    where.push("stock > 0");
  }

  const order = SORTS[req.query.sort] || SORTS.featured;
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const [countRows] = await db.query(
    `SELECT COUNT(*) as total FROM products ${where.length ? "WHERE " + where.join(" AND ") : ""}`,
    params
  );
  const total = countRows[0]?.total || 0;

  const [rows] = await db.query(
    `SELECT * FROM products ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );
  res.json({ success: true, count: rows.length, total, page, limit, data: rows.map(toProduct) });
}));

// GET /api/products/:id
router.get("/:id", asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product id" });
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, data: toProduct(rows[0]) });
}));

// POST /api/products   (admin)
router.post("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { out, errors } = readBody(req.body, false);
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(", ") });
  const cols = Object.keys(out);
  const [r] = await db.query(`INSERT INTO products (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`, cols.map((c) => out[c]));
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [r.insertId]);
  res.status(201).json({ success: true, message: "Product created", data: toProduct(rows[0]) });
}));

// PUT /api/products/:id   (admin) - send only the fields you want to change
router.put("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product id" });
  const { out, errors } = readBody(req.body, true);
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(", ") });
  const cols = Object.keys(out);
  if (!cols.length) return res.status(400).json({ success: false, message: "Nothing to update" });

  const [r] = await db.query(`UPDATE products SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE id = ?`, [...cols.map((c) => out[c]), req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ success: false, message: "Product not found" });
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
  res.json({ success: true, message: "Product updated", data: toProduct(rows[0]) });
}));

// DELETE /api/products/:id   (admin)
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product id" });
  const [r] = await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, message: "Product deleted" });
}));

module.exports = router;
