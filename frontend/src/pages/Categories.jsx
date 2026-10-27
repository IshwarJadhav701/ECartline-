import React from "react";
import { Link } from "react-router-dom";
import { categories } from "../services/productsData";

const catData = {
  Mobiles: {
    desc: "Latest 5G smartphones, iPhones, flagship devices & accessories.",
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=75"
  },
  Electronics: {
    desc: "Wireless headphones, smartwatches, Bluetooth speakers, laptops & smart tech.",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=75"
  },
  Fashion: {
    desc: "Men's and women's apparel, casual shirts, denim, ethnic & modern styles.",
    img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=75"
  },
  Footwear: {
    desc: "Running shoes, casual sneakers, formal shoes & comfortable sandals.",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=75"
  },
  "Home & Kitchen": {
    desc: "Premium cookware, electric appliances, dinnerware & home essentials.",
    img: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=75"
  },
  Sports: {
    desc: "Fitness equipment, yoga mats, sports gear & outdoor workout essentials.",
    img: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=75"
  },
  Beauty: {
    desc: "Skincare, haircare, perfumes, grooming kits & organic wellness products.",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=75"
  },
  Toys: {
    desc: "Educational toys, board games, action figures & kids entertainment.",
    img: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=400&q=75"
  },
  Furniture: {
    desc: "Ergonomic office chairs, tables, home decor & modern living room furniture.",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=75"
  },
  Outdoor: {
    desc: "Camping gear, backpacks, travel bags & durable outdoor accessories.",
    img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=75"
  },
  Bags: {
    desc: "Laptop backpacks, travel duffels, leather wallets & stylish handbags.",
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=75"
  },
  Accessories: {
    desc: "Fast chargers, protective phone cases, cables, power banks & screen guards.",
    img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=75"
  }
};

export default function Categories() {
  return (
    <main className="container cat-grid-page" style={{ margin: "28px auto 60px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="sec-title" style={{ margin: 0 }}>
          All Product Categories
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "4px" }}>
          Explore authentic products, verified brands, and top deals across all store departments.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px"
        }}
      >
        {categories.map((cat) => {
          const info = catData[cat] || {
            desc: "Browse authentic products and collections in this department.",
            img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=75"
          };

          return (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
              className="card"
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "transform 0.2s ease, box-shadow 0.2s ease"
              }}
            >
              <div style={{ height: "180px", overflow: "hidden", background: "#f1f5f9" }}>
                <img
                  src={info.img}
                  alt={cat}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem", color: "var(--text-main)" }}>
                  {cat}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: "1.5", margin: "0 0 14px", flex: 1 }}>
                  {info.desc}
                </p>
                <span style={{ color: "var(--primary)", fontWeight: "700", fontSize: "0.85rem" }}>
                  Explore Products →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
