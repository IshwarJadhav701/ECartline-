-- =====================================================================
-- ECartline - complete database (structure + 41 products)
-- Works on MySQL 8 AND on XAMPP (MariaDB). Import it in phpMyAdmin or Workbench.
-- NOTE: users and cart_items tables are created EMPTY (register on the site to add users).
-- =====================================================================

-- ECartline database. Run this in MySQL Workbench OR use:  npm run setup
CREATE DATABASE IF NOT EXISTS ecartline CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecartline;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  mobile      VARCHAR(15)  UNIQUE,
  password    VARCHAR(255) NOT NULL,              -- bcrypt hash, never plain text
  role        ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  description    TEXT,
  price          DECIMAL(10,2) NOT NULL,
  image          VARCHAR(500),
  category       VARCHAR(100) NOT NULL,
  stock          INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- extra columns so your existing product cards keep working exactly as before:
  old_price      DECIMAL(10,2) NULL,              -- strike-through price + "% OFF" badge
  images         JSON NULL,                       -- gallery images on the details page
  rating         DECIMAL(2,1) NOT NULL DEFAULT 0, -- stars on the card
  reviews_count  INT NOT NULL DEFAULT 0,
  INDEX idx_products_category (category)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product (user_id, product_id),   -- one row per product per user
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS addresses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  full_name   VARCHAR(100) NOT NULL,
  phone       VARCHAR(15) NOT NULL,
  street      VARCHAR(255) NOT NULL,
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL,
  pincode     VARCHAR(10) NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  order_number     VARCHAR(30) NOT NULL UNIQUE,
  user_id          INT NOT NULL,
  total_amount     DECIMAL(10,2) NOT NULL,
  subtotal         DECIMAL(10,2) NOT NULL,
  delivery_fee     DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount         DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_name    VARCHAR(100) NOT NULL,
  shipping_phone   VARCHAR(15) NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method   ENUM('cod','upi','card') NOT NULL DEFAULT 'cod',
  payment_status   ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
  order_status     ENUM('placed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'placed',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  product_id    INT NOT NULL,
  product_name  VARCHAR(200) NOT NULL,
  product_image VARCHAR(500),
  quantity      INT NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  product_id  INT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_wishlist (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  product_id  INT NOT NULL,
  rating      INT NOT NULL,
  comment     TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_product_review (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  phone       VARCHAR(15),
  message     TEXT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Products (ids 1-41 fixed, so a re-import will show a duplicate-key error instead of duplicating)
-- ---------------------------------------------------------------------
INSERT INTO products (id, name, description, price, old_price, image, images, category, stock, rating, reviews_count) VALUES
(1, 'Noise ColorFit Pro 4 Smartwatch', 'Bright AMOLED display smart watch with Bluetooth calling, 100+ sports modes and 7-day battery.', 1299, 2099, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=70"]', 'Electronics', 17, 4.4, 8765),
(2, 'boAt Rockerz 450 Headphones', 'Wireless over-ear headphones with 40mm drivers and up to 15 hours playback.', 1499, 3990, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=70"]', 'Electronics', 24, 4.3, 52310),
(3, 'JBL Flip Bluetooth Speaker', 'Portable waterproof speaker with powerful bass and 12 hours of playtime.', 7999, 9999, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=70"]', 'Electronics', 31, 4.6, 12450),
(4, 'HP 15 Laptop 8GB/512GB', 'Thin and light laptop for work and study with fast SSD storage.', 42990, 52000, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=70"]', 'Electronics', 38, 4.2, 3210),
(5, 'Redmi Note 13 5G', '6.67-inch AMOLED display, 108MP camera and all-day battery life.', 16999, 21999, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=70"]', 'Mobiles', 45, 4.3, 21876),
(6, 'Samsung Galaxy M35 5G', 'Super AMOLED screen with 6000mAh battery and 50MP triple camera.', 18999, 24999, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=70"]', 'Mobiles', 12, 4.4, 9840),
(7, 'realme Narzo 70 5G', '120Hz display, Dimensity chipset and fast charging smartphone.', 12999, 16999, 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=70"]', 'Mobiles', 19, 4.2, 15620),
(8, 'OnePlus Nord CE4', 'Snapdragon processor, 100W charging and smooth fluid display.', 24999, 26999, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=70"]', 'Mobiles', 26, 4.5, 7420),
(9, 'Men''s Cotton Casual Shirt', 'Breathable regular-fit cotton shirt for everyday wear.', 799, 1599, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=70"]', 'Fashion', 15, 4.1, 6540),
(10, 'Women''s Floral Kurti', 'Soft rayon kurti with elegant floral print and comfortable fit.', 649, 1299, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=70"]', 'Fashion', 40, 4.2, 11230),
(11, 'Slim Fit Stretch Denim Jeans', 'Stretchable denim jeans with a modern slim fit.', 1199, 2499, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=70"]', 'Fashion', 47, 4, 9870),
(12, 'Classic Analog Watch for Men', 'Stainless steel strap watch with a premium dial and water resistance.', 2499, 4999, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=600&q=70"]', 'Fashion', 14, 4.4, 4320),
(13, 'Pro Running Shoes', 'Lightweight cushioned running shoes with breathable mesh.', 2199, 3999, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1551107696-a4b085a6d91a?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=600&q=70"]', 'Footwear', 21, 4.3, 18760),
(14, 'Casual White Sneakers', 'Everyday sneakers with durable sole and clean minimalist look.', 1499, 2999, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=70"]', 'Footwear', 28, 4.1, 13400),
(15, 'Leather Formal Shoes', 'Genuine leather formal shoes with comfortable insole.', 2799, 4499, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=70"]', 'Footwear', 35, 4.2, 5210),
(16, 'Non-Stick Cookware Set (5 pcs)', 'Induction-friendly non-stick cookware set with cool-touch handles.', 1899, 3499, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1584990347449-74d1a5113941?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=70"]', 'Home & Kitchen', 42, 4.3, 14320),
(17, 'Mixer Grinder 750W', 'Powerful 3-jar mixer grinder for wet and dry grinding.', 3299, 4999, 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=70"]', 'Home & Kitchen', 49, 4.4, 28900),
(18, 'Digital Air Fryer 4L', 'Cook crispy food with up to 90% less oil using rapid air technology.', 4999, 8999, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=70"]', 'Home & Kitchen', 18, 4.5, 16780),
(19, 'Cotton Double Bedsheet Set', 'Soft 144 TC cotton bedsheet with two pillow covers.', 699, 1499, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=70"]', 'Home & Kitchen', 23, 4.1, 22100),
(20, 'Anti-Skid Yoga Mat 6mm', 'Extra thick eco-friendly yoga mat with carry strap.', 599, 1299, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=70"]', 'Sports', 30, 4.4, 19450),
(21, 'Kashmir Willow Cricket Bat', 'Well-balanced full size cricket bat for leather ball play.', 2999, 4500, 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=600&q=70"]', 'Sports', 37, 4.2, 2310),
(22, 'Adjustable Dumbbell Set 20kg', 'Home gym adjustable dumbbells with anti-slip grip.', 3499, 5999, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=70"]', 'Sports', 44, 4.3, 6780),
(23, 'Training Football Size 5', 'Durable machine-stitched football for practice and matches.', 799, 1299, 'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=70"]', 'Sports', 11, 4, 5430),
(24, 'Vitamin C Face Serum 30ml', 'Brightening serum for glowing and even-toned skin.', 499, 899, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1608248597359-5735b5a2bfbc?auto=format&fit=crop&w=600&q=70"]', 'Beauty', 18, 4.3, 34560),
(25, 'Matte Lipstick Combo (Set of 6)', 'Long-lasting creamy matte lipsticks in trending shades.', 699, 1399, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=70"]', 'Beauty', 25, 4.1, 12980),
(26, 'Professional Hair Dryer 2000W', 'Fast-drying hair dryer with cool shot and 3 heat settings.', 1299, 2499, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1585751119414-ef2636f8aede?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=70"]', 'Beauty', 32, 4.2, 8760),
(27, 'Building Blocks Set 500 pcs', 'Creative colourful blocks to build and learn for kids 5+.', 899, 1799, 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1558060370-d644479cb6e7?auto=format&fit=crop&w=600&q=70"]', 'Toys', 22, 4.5, 9870),
(28, 'Remote Control Racing Car', 'Rechargeable high-speed RC car with sturdy suspension.', 1499, 2999, 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1558060370-d644479cb6e7?auto=format&fit=crop&w=600&q=70"]', 'Toys', 46, 4.1, 6540),
(29, 'Family Board Game Collection', 'Fun board games set for family evenings and parties.', 599, 999, 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1632501641765-e568d28b0015?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=70"]', 'Toys', 13, 4.4, 4120),
(30, 'Ergonomic Office Chair', 'Mesh back chair with lumbar support and adjustable height.', 6999, 12999, 'https://images.unsplash.com/photo-1580481077195-c22ae249911e?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1580481077195-c22ae249911e?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1589584649628-b80753a47990?auto=format&fit=crop&w=600&q=70"]', 'Furniture', 20, 4.3, 7890),
(31, 'Wooden Study Table', 'Sturdy engineered wood study desk with storage shelf.', 5499, 8999, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=70"]', 'Furniture', 27, 4.2, 3450),
(32, '3-Seater Fabric Sofa', 'Comfortable modern sofa with high-density foam cushions.', 18999, 29999, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1493663284031-b7e3aefcf1b7?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=70"]', 'Furniture', 34, 4.4, 1890),
(33, '2-Person Camping Tent', 'Waterproof, easy set-up tent for trekking and weekend camping.', 3499, 5999, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1445308394109-4ec2920981b1?auto=format&fit=crop&w=600&q=70"]', 'Outdoor', 41, 4.3, 5670),
(34, 'Trekking Backpack 60L', 'Rain-cover included rucksack with padded straps for long treks.', 2499, 4499, 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=70"]', 'Outdoor', 48, 4.4, 8120),
(35, 'Insulated Sleeping Bag', 'Warm lightweight sleeping bag for cool outdoor nights.', 1599, 2999, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=70"]', 'Outdoor', 15, 4.1, 3240),
(36, 'Laptop Backpack 30L', 'Water-resistant backpack with USB port and padded laptop sleeve.', 999, 2199, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=70"]', 'Bags', 25, 4.4, 45670),
(37, 'Travel Duffle Bag', 'Spacious duffle with shoe compartment and shoulder strap.', 1799, 3299, 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=70"]', 'Bags', 29, 4.2, 9870),
(38, 'Casual Sling Bag', 'Compact crossbody sling bag for daily essentials.', 599, 1199, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=70"]', 'Bags', 36, 4, 7650),
(39, 'Polarized Sunglasses', 'UV400 polarized sunglasses with lightweight frame.', 899, 1999, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=70"]', 'Accessories', 43, 4.3, 15430),
(40, 'Genuine Leather Wallet', 'Slim RFID-safe wallet with multiple card slots.', 499, 999, 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=600&q=70"]', 'Accessories', 10, 4.2, 21340),
(41, 'Digital Sports Wrist Watch', 'Water-resistant digital watch with stopwatch and backlight.', 1199, 2299, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=70', '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=70","https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=70"]', 'Accessories', 17, 4.1, 6780);

-- ---------------------------------------------------------------------
-- Default Admin Account: login with admin@ecartline.in / Admin@12345
-- ---------------------------------------------------------------------
INSERT INTO users (id, name, email, mobile, password, role) VALUES
(1, 'ECartline Admin', 'admin@ecartline.in', '9999999999', '$2a$10$3tyHE/EoGO.p7ab6Np8fauXJM3g3khUJsBNWEYt0OC885RckwkA92', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';

