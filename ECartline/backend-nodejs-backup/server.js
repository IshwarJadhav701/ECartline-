const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config(); // fallback
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

if (!process.env.JWT_SECRET) {
  console.error("✗ JWT_SECRET is missing. Copy .env.example to .env and set it.");
  process.exit(1);
}

const app = express();
const FRONTEND = path.join(__dirname, ".."); // your existing ECartline folder (index.html, css/, js/)

app.use(cors(process.env.CORS_ORIGIN ? { origin: process.env.CORS_ORIGIN.split(",").map((s) => s.trim()) } : {}));
app.use(express.json({ limit: "100kb" }));

// ---------- REST API ----------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/addresses", require("./routes/addresses"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/contact", require("./routes/contact"));
app.get("/api/health", async (req, res) => {
  try { await db.query("SELECT 1"); res.json({ success: true, status: "ok", database: "connected" }); }
  catch (e) { res.status(500).json({ success: false, status: "error", message: "Database connection failed" }); }
});
app.use("/api", (req, res) => res.status(404).json({ success: false, message: "API route not found" }));

// ---------- Serve frontend assets & pages ----------
app.use("/css", express.static(path.join(FRONTEND, "css")));
app.use("/js", express.static(path.join(FRONTEND, "js")));
app.use("/assets", express.static(path.join(FRONTEND, "assets")));
app.get("/", (req, res) => res.sendFile(path.join(FRONTEND, "index.html")));
app.get("/:page", (req, res, next) => {
  const page = req.params.page;
  const file = path.join(FRONTEND, page);
  if (/^[a-z0-9-]+\.html$/i.test(page) && fs.existsSync(file)) return res.sendFile(file);
  next();
});

// ---------- Errors ----------
app.use((req, res) => res.status(404).send("Page not found"));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === "entity.parse.failed") return res.status(400).json({ success: false, message: "Invalid JSON" });
  res.status(500).json({ success: false, message: "Something went wrong on the server" });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`ECartline running at http://localhost:${PORT}`));
