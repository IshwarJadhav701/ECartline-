const express = require("express");
const db = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { asyncHandler, toProduct } = require("../utils/helpers");

const router = express.Router();

const isId = (v) => /^\d+$/.test(String(v));

// Helper: load full order with items
async function getOrderDetails(orderId, userId = null) {
  const where = ["o.id = ?"];
  const params = [orderId];
  if (userId) {
    where.push("o.user_id = ?");
    params.push(userId);
  }

  const [orderRows] = await db.query(
    `SELECT o.*, u.name as customer_name, u.email as customer_email, u.mobile as customer_mobile
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE ${where.join(" AND ")}`,
    params
  );

  if (!orderRows.length) return null;
  const order = orderRows[0];

  const [itemRows] = await db.query(
    `SELECT oi.*, p.category
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?
     ORDER BY oi.id ASC`,
    [orderId]
  );

  order.items = itemRows;
  return order;
}

// POST /api/orders - Place a new order (from cart or custom items)
router.post("/", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { addressId, shippingName, shippingPhone, shippingAddress, paymentMethod = "cod", items: directItems } = req.body;

  let finalShippingName = shippingName ? String(shippingName).trim() : "";
  let finalShippingPhone = shippingPhone ? String(shippingPhone).trim() : "";
  let finalShippingAddress = shippingAddress ? String(shippingAddress).trim() : "";

  // If addressId is provided, pull from saved addresses
  if (addressId && isId(addressId)) {
    const [addrRows] = await db.query(
      "SELECT * FROM addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );
    if (addrRows.length) {
      const a = addrRows[0];
      finalShippingName = a.full_name;
      finalShippingPhone = a.phone;
      finalShippingAddress = `${a.street}, ${a.city}, ${a.state} - ${a.pincode}`;
    }
  }

  if (!finalShippingName || finalShippingName.length < 2) {
    return res.status(400).json({ success: false, message: "Valid delivery recipient name is required" });
  }
  if (!finalShippingPhone || finalShippingPhone.length < 10) {
    return res.status(400).json({ success: false, message: "Valid delivery phone number is required" });
  }
  if (!finalShippingAddress || finalShippingAddress.length < 8) {
    return res.status(400).json({ success: false, message: "Full delivery address is required" });
  }

  const allowedPayments = ["cod", "upi", "card"];
  const method = allowedPayments.includes(paymentMethod) ? paymentMethod : "cod";

  // Gather items: either passed directly or from user's MySQL cart
  let orderItemsToProcess = [];
  if (Array.isArray(directItems) && directItems.length) {
    orderItemsToProcess = directItems;
  } else {
    const [cartRows] = await db.query(
      `SELECT ci.quantity, p.id as product_id, p.name, p.price, p.image, p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`,
      [userId]
    );
    if (!cartRows.length) {
      return res.status(400).json({ success: false, message: "Your cart is empty. Add items before checking out." });
    }
    orderItemsToProcess = cartRows.map((r) => ({
      productId: r.product_id,
      quantity: r.quantity,
    }));
  }

  // Transaction for safe order creation and stock decrement
  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    let subtotal = 0;
    const finalItems = [];

    for (const item of orderItemsToProcess) {
      const pid = item.productId || item.id;
      const qty = Math.max(1, parseInt(item.quantity || item.qty, 10) || 1);

      const [pRows] = await conn.query(
        "SELECT id, name, price, stock, image FROM products WHERE id = ? FOR UPDATE",
        [pid]
      );
      if (!pRows.length) {
        throw new Error(`Product #${pid} was not found.`);
      }
      const prod = pRows[0];
      if (prod.stock < qty) {
        throw new Error(`Insufficient stock for "${prod.name}". Only ${prod.stock} left in stock.`);
      }

      const itemPrice = Number(prod.price);
      subtotal += itemPrice * qty;

      finalItems.push({
        productId: prod.id,
        name: prod.name,
        price: itemPrice,
        image: prod.image,
        quantity: qty,
      });

      // Decrement stock
      await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [qty, prod.id]);
    }

    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const totalAmount = subtotal + deliveryFee;
    const orderNumber = `ECL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentStatus = method === "cod" ? "pending" : "completed";

    // Insert order
    const [orderResult] = await conn.query(
      `INSERT INTO orders
       (order_number, user_id, total_amount, subtotal, delivery_fee, discount, shipping_name, shipping_phone, shipping_address, payment_method, payment_status, order_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        totalAmount,
        subtotal,
        deliveryFee,
        0,
        finalShippingName,
        finalShippingPhone,
        finalShippingAddress,
        method,
        paymentStatus,
        "placed",
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const it of finalItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, it.productId, it.name, it.image, it.quantity, it.price]
      );
    }

    // Clear cart items for this user
    await conn.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);

    await conn.commit();
    conn.release();

    const createdOrder = await getOrderDetails(orderId, userId);
    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: createdOrder,
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    res.status(400).json({ success: false, message: err.message || "Failed to process order" });
  }
}));

// GET /api/orders - Get list of orders for logged-in user
router.get("/", requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [orders] = await db.query(
    `SELECT o.*, COUNT(oi.id) as total_items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId]
  );

  // Attach items for each order
  for (const o of orders) {
    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC",
      [o.id]
    );
    o.items = items;
  }

  res.json({ success: true, count: orders.length, data: orders });
}));

// GET /api/orders/:id - Get specific order details
router.get("/:id", requireAuth, asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });
  const isAdmin = req.user.role === "admin";
  const order = await getOrderDetails(req.params.id, isAdmin ? null : req.user.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
  res.json({ success: true, data: order });
}));

// PUT /api/orders/:id/cancel - User cancels order
router.put("/:id/cancel", requireAuth, asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });

  const [rows] = await db.query(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ success: false, message: "Order not found" });

  const order = rows[0];
  if (order.order_status === "cancelled") {
    return res.status(400).json({ success: false, message: "Order is already cancelled" });
  }
  if (["shipped", "delivered"].includes(order.order_status)) {
    return res.status(400).json({ success: false, message: `Cannot cancel order that has already been ${order.order_status}.` });
  }

  // Restore inventory
  const [items] = await db.query("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [order.id]);
  for (const it of items) {
    await db.query("UPDATE products SET stock = stock + ? WHERE id = ?", [it.quantity, it.product_id]);
  }

  await db.query("UPDATE orders SET order_status = 'cancelled' WHERE id = ?", [order.id]);
  res.json({ success: true, message: "Order cancelled successfully" });
}));

// ---------- ADMIN ENDPOINTS ----------

// GET /api/orders/admin/all - Admin gets all orders
router.get("/admin/all", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const [orders] = await db.query(
    `SELECT o.*, u.name as customer_name, u.email as customer_email, u.mobile as customer_mobile,
            COUNT(oi.id) as total_items
     FROM orders o
     JOIN users u ON u.id = o.user_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     GROUP BY o.id
     ORDER BY o.created_at DESC`
  );

  for (const o of orders) {
    const [items] = await db.query("SELECT * FROM order_items WHERE order_id = ?", [o.id]);
    o.items = items;
  }

  res.json({ success: true, count: orders.length, data: orders });
}));

// PUT /api/orders/admin/:id/status - Admin updates order status
router.put("/admin/:id/status", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });
  const { orderStatus, paymentStatus } = req.body;

  const validOrderStatuses = ["placed", "processing", "shipped", "delivered", "cancelled"];
  const validPaymentStatuses = ["pending", "completed", "failed"];

  const updates = [];
  const params = [];

  if (orderStatus && validOrderStatuses.includes(orderStatus)) {
    updates.push("order_status = ?");
    params.push(orderStatus);
  }
  if (paymentStatus && validPaymentStatuses.includes(paymentStatus)) {
    updates.push("payment_status = ?");
    params.push(paymentStatus);
  }

  if (!updates.length) {
    return res.status(400).json({ success: false, message: "Valid orderStatus or paymentStatus is required" });
  }

  params.push(req.params.id);
  const [result] = await db.query(`UPDATE orders SET ${updates.join(", ")} WHERE id = ?`, params);

  if (!result.affectedRows) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, message: "Order status updated successfully" });
}));

module.exports = router;
