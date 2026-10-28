// Run once:  npm run setup
// 1) creates database + tables (schema.sql)  2) loads your 41 products  3) creates the admin user
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

(async () => {
  const dbName = (process.env.DB_NAME || "ecartline").replace(/[^A-Za-z0-9_]/g, "");
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
    charset: "utf8mb4",
  });
  try {
    // use the DB name from .env instead of the two first lines of schema.sql
    const tables = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8")
      .split("\n").filter((l) => !/^\s*(CREATE DATABASE|USE)\b/i.test(l)).join("\n");
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; USE \`${dbName}\`;`);
    await conn.query(tables);
    console.log("✓ Database and tables ready");

    const [[{ n }]] = await conn.query("SELECT COUNT(*) AS n FROM products");
    if (n === 0) {
      const list = JSON.parse(fs.readFileSync(path.join(__dirname, "products-seed.json"), "utf8"));
      const rows = list.map((p) => [p.name, p.description, p.price, p.oldPrice, p.image, JSON.stringify(p.images), p.category, p.stock, p.rating, p.reviews]);
      await conn.query("INSERT INTO products (name, description, price, old_price, image, images, category, stock, rating, reviews_count) VALUES ?", [rows]);
      console.log(`✓ Inserted ${rows.length} products`);
    } else {
      console.log(`• Products table already has ${n} rows - skipped seeding`);
    }

    const email = (process.env.ADMIN_EMAIL || "admin@ecartline.in").toLowerCase();
    const [ex] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
    if (!ex.length) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@12345", 10);
      await conn.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')", [process.env.ADMIN_NAME || "ECartline Admin", email, hash]);
      console.log(`✓ Admin user created: ${email}`);
    } else {
      console.log("• Admin user already exists");
    }
  } catch (err) {
    console.error("✗ Setup failed:", err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
