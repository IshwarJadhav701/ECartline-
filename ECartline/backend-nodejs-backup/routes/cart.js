// Cart for LOGGED-IN users, stored in MySQL (table: cart_items). Guests keep using localStorage.
const express = require("express");
const db = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler, toProduct, MAX_QTY_PER_PRODUCT } = require("../utils/helpers");

const router = express.Router();
router.use(requireAuth); // every cart route needs login

const isId = (v) => /^\d+$/.test(String(v));
const toQty = (v, def = 1) => { const n = Number(v === undefined ? def : v); return Number.isInteger(n) && n >= 1 ? n : null; };

async function loadCart(userId) {
  const [rows] = await db.query(
    `SELECT ci.quantity, p.* FROM cart_items ci JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ? ORDER BY ci.id ASC`, [userId]);
  const items = rows.map((r) => ({ productId: r.id, quantity: r.quantity, product: toProduct(r) }));
  return { items, totalItems: items.reduce((s, i) => s + i.quantity, 0) };
}

// Add `qty` of a product (adds to existing quantity), never above stock or 10.
async function addItem(userId, productId, qty) {
  const [rows] = await db.query("SELECT id, stock FROM products WHERE id = ?", [productId]);
  if (!rows.length) return { error: "Product not found", status: 404 };
  const max = Math.min(MAX_QTY_PER_PRODUCT, rows[0].stock);
  if (max < 1) return { error: "This product is out of stock", status: 400 };
  await db.query(
    `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + VALUES(quantity), ?)`,
    [userId, productId, Math.min(qty, max), max]);
  return {};
}

// GET /api/cart
router.get("/", asyncHandler(async (req, res) => {
  res.json({ success: true, data: await loadCart(req.user.id) });
}));

// POST /api/cart   { productId, quantity }   -> add product
router.post("/", asyncHandler(async (req, res) => {
  const qty = toQty(req.body.quantity);
  if (!isId(req.body.productId) || !qty) return res.status(400).json({ success: false, message: "productId and a valid quantity are required" });
  const r = await addItem(req.user.id, Number(req.body.productId), qty);
  if (r.error) return res.status(r.status).json({ success: false, message: r.error });
  res.json({ success: true, message: "Product added to cart", data: await loadCart(req.user.id) });
}));

// POST /api/cart/merge   { items: [{ productId, quantity }] }  -> used right after login to move the guest cart
router.post("/merge", asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items.slice(0, 100) : [];
  for (const it of items) {
    const qty = toQty(it.quantity);
    if (isId(it.productId) && qty) await addItem(req.user.id, Number(it.productId), qty); // bad/out-of-stock rows are skipped
  }
  res.json({ success: true, data: await loadCart(req.user.id) });
}));

// PUT /api/cart/:productId   { quantity }  -> set exact quantity (used by +/- buttons)
router.put("/:productId", asyncHandler(async (req, res) => {
  const qty = toQty(req.body.quantity);
  if (!isId(req.params.productId) || !qty) return res.status(400).json({ success: false, message: "A valid quantity is required" });
  const [p] = await db.query("SELECT stock FROM products WHERE id = ?", [req.params.productId]);
  if (!p.length) return res.status(404).json({ success: false, message: "Product not found" });
  if (p[0].stock <= 0) {
    await db.query("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [req.user.id, req.params.productId]);
    return res.status(400).json({ success: false, message: "This product is currently out of stock and was removed from your cart", data: await loadCart(req.user.id) });
  }
  const max = Math.min(MAX_QTY_PER_PRODUCT, p[0].stock);
  const targetQty = Math.max(1, Math.min(qty, max));
  const [r] = await db.query("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?", [targetQty, req.user.id, req.params.productId]);
  if (!r.affectedRows) return res.status(404).json({ success: false, message: "Product is not in your cart" });
  res.json({ success: true, data: await loadCart(req.user.id) });
}));

// DELETE /api/cart/:productId  -> remove one product
router.delete("/:productId", asyncHandler(async (req, res) => {
  if (!isId(req.params.productId)) return res.status(400).json({ success: false, message: "Invalid product id" });
  await db.query("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [req.user.id, req.params.productId]);
  res.json({ success: true, message: "Product removed", data: await loadCart(req.user.id) });
}));

// DELETE /api/cart  -> empty the cart
router.delete("/", asyncHandler(async (req, res) => {
  await db.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
  res.json({ success: true, message: "Cart cleared", data: await loadCart(req.user.id) });
}));

module.exports = router;
