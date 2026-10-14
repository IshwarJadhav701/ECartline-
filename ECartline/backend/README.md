# ECartline Full-Stack E-Commerce (Node.js + Express + MySQL)

A dynamic e-commerce web application featuring modern aesthetics, transaction-safe order placement, real-time tracking, customer reviews, address management, and an interactive Admin Dashboard.

---

## 🚀 Setup & Installation

1. Make sure **Node.js (v18+)** and **MySQL (or XAMPP / MariaDB)** are running.
2. In the `backend` folder, verify `.env`:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=ecartline
   JWT_SECRET=ecartline_kahihi_lamb_random_text_2026_xyz
   ADMIN_NAME=ECartline Admin
   ADMIN_EMAIL=admin@ecartline.in
   ADMIN_PASSWORD=Admin@12345
   ```
3. Initialize the database and seed the 41 products + default administrator:
   ```bash
   npm run setup
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open **http://localhost:3000** in your web browser.

To run the automated end-to-end integration test suite:
```bash
node test-suite.js
```

---

## 🌟 Key Features Added

- **Secure Checkout Flow ([checkout.html](file:///c:/Users/Eazyfixit/Downloads/ECartline-with-backend/ECartline/checkout.html))**:
  - Saved delivery address selection + instant address addition.
  - Multiple payment options (Cash on Delivery, UPI / QR, Credit/Debit Cards).
  - Transaction-safe inventory decrement and cart clearing upon order placement.
- **My Orders & Real-time Tracking ([orders.html](file:///c:/Users/Eazyfixit/Downloads/ECartline-with-backend/ECartline/orders.html))**:
  - Visual timeline (`Placed` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`).
  - Order details, item thumbnails, pricing breakdown, and customer cancellation support.
- **User Profile & Address Management ([profile.html](file:///c:/Users/Eazyfixit/Downloads/ECartline-with-backend/ECartline/profile.html))**:
  - Update personal info (Name, Mobile).
  - Change password securely with bcrypt verification.
  - Manage saved delivery addresses (Add, Edit, Set Default, Delete).
- **Admin Dashboard ([admin.html](file:///c:/Users/Eazyfixit/Downloads/ECartline-with-backend/ECartline/admin.html))**:
  - Key business metrics: Total Revenue, Total Orders, Product Catalog count, Customer count.
  - Orders management table: live order status dropdown (Placed, Processing, Shipped, Delivered, Cancelled).
  - Product catalog CRUD: Add new products with modal, edit existing products, quick stock adjustment, delete products.
  - Customer contact inquiries viewer.
- **Customer Ratings & Reviews ([product-details.html](file:///c:/Users/Eazyfixit/Downloads/ECartline-with-backend/ECartline/product-details.html))**:
  - Real customer reviews display with star ratings and comments.
  - Interactive star rating picker and review submission for authenticated users with automatic recalculation of product ratings.
- **Header & Search UX**:
  - User account dropdown with greeting, quick links, and a functional **Sign Out** button.
  - Live search debounced auto-complete suggestions popup.
  - Persistent Wishlist synchronized with MySQL.

---

## 📡 REST API Reference

### Authentication & Profile (`/api/auth`)
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Sign in (returns JWT token and user info)
- `GET /api/auth/me` - Current authenticated user
- `PUT /api/auth/profile` - Update profile name and mobile
- `PUT /api/auth/change-password` - Verify current password and set new password
- `GET /api/auth/admin/stats` - Overview statistics for admin dashboard

### Products & Search (`/api/products`)
- `GET /api/products` - Search and filter products with SQL queries (`q`, `category`, `minPrice`, `maxPrice`, `minRating`, `inStock`, `sort`)
- `GET /api/products/suggestions?q=` - Fast search auto-completion
- `GET /api/products/:id` - Single product details
- `POST /api/products` - (Admin) Create product
- `PUT /api/products/:id` - (Admin) Update product
- `DELETE /api/products/:id` - (Admin) Delete product

### Orders (`/api/orders`)
- `POST /api/orders` - Place order (from cart or items, validates stock with transaction)
- `GET /api/orders` - Logged-in user's orders
- `GET /api/orders/:id` - Order details with items
- `PUT /api/orders/:id/cancel` - Cancel placed order (restores inventory)
- `GET /api/orders/admin/all` - (Admin) View all store orders
- `PUT /api/orders/admin/:id/status` - (Admin) Update order and payment status

### Addresses (`/api/addresses`)
- `GET /api/addresses` - List saved delivery addresses
- `POST /api/addresses` - Add new delivery address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `PUT /api/addresses/:id/default` - Set address as default

### Reviews (`/api/reviews`)
- `GET /api/reviews/product/:productId` - Get product reviews and rating breakdown
- `POST /api/reviews/product/:productId` - Submit or update review

### Wishlist (`/api/wishlist`)
- `GET /api/wishlist` - Get wishlist items
- `POST /api/wishlist/:productId` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist
- `POST /api/wishlist/sync` - Merge guest wishlist on login

### Inquiries (`/api/contact`)
- `POST /api/contact` - Submit contact inquiry
- `GET /api/contact` - (Admin) View inquiries
