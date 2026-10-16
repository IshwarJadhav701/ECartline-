# ECartline - Full-Stack E-Commerce Platform

A dynamic, full-stack e-commerce web application featuring modern responsive UI, RESTful API backend, and MySQL (XAMPP / MariaDB) persistent database.

---

## 🚀 Key Features

* **Complete Product Catalog**: 49 dynamic products across 12 categories with accurate high-res photos and image galleries.
* **Authentication & Authorization**: Secure user registration, login with bcrypt password hashing, and JWT-based session management.
* **Cart & Wishlist**: Real-time synchronized cart and wishlist stored per user in MySQL.
* **Checkout & Orders**: Address management, order placement with auto-generated order IDs, and complete order history.
* **Admin Dashboard**: Real-time product inventory, user management, and order status updates.
* **Contact & Reviews**: Contact form submissions and verified product rating/review system.

---

## 🛠️ Tech Stack

* **Frontend**: Vanilla HTML5, CSS3, JavaScript (Modular ES6 / Fetch API).
* **Backend**: Node.js, Express.js.
* **Database**: MySQL 8 / XAMPP (MariaDB).
* **Security**: JWT authentication, bcryptjs password hashing, parameterized SQL queries.

---

## 📋 Prerequisites

1. [Node.js](https://nodejs.org/) (v16 or higher).
2. [XAMPP](https://www.apachefriends.org/) with MySQL / Apache running.

---

## ⚡ Quick Start (Windows)

### 1. Start XAMPP MySQL
Open **XAMPP Control Panel** and click **Start** next to **MySQL**.

### 2. Configure Environment
Copy `.env.example` in `ECartline/backend/` to `.env`:
```bash
cp ECartline/backend/.env.example ECartline/backend/.env
```
*(Default XAMPP settings `root` with blank password work out of the box).*

### 3. Setup Database & Seed Data
Double-click `setup-database.bat` or run:
```bash
npm run setup
```
*(Alternatively, import `ecartline.sql` directly into phpMyAdmin).*

### 4. Start the Application
Double-click `start-project.bat` or run:
```bash
npm start
```
Open your browser at:
* **Frontend**: `http://localhost:3000` (or `ECartline/index.html`)
* **Admin Portal**: `http://localhost:3000/admin.html`
* **Default Admin Credentials**:
  * **Email**: `admin@ecartline.in`
  * **Password**: `Admin@12345`

---

## 📁 Project Structure

```text
ECartline-with-backend/
├── ECartline/
│   ├── backend/
│   │   ├── config/          # MySQL database connection pool
│   │   ├── db/              # Seed data & database migration scripts
│   │   ├── middleware/      # JWT auth middleware
│   │   ├── routes/          # RESTful endpoints (auth, products, cart, etc.)
│   │   └── server.js        # Express server entry point
│   ├── css/                 # Global styles & responsive layouts
│   ├── js/                  # Client-side API connectors & logic
│   ├── index.html           # Home page
│   ├── products.html        # Catalog & filters
│   ├── checkout.html        # Checkout & address selection
│   ├── admin.html           # Admin dashboard
│   └── ...                  # Cart, orders, wishlist, profile pages
├── ecartline.sql            # Complete database export for phpMyAdmin
├── start-project.bat        # 1-click startup script
├── setup-database.bat       # 1-click database setup script
└── fix-xampp-mysql.bat      # XAMPP MariaDB corruption repair utility
```

---

## 📄 License
This project is open-source and available under the MIT License.
