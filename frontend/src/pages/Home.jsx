import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchAllProducts } from "../services/api";
import { categories, fallbackProducts } from "../services/productsData";

const u = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const slides = [
  {
    tag: "NEW SEASON",
    title: "Upgrade Your Everyday Life",
    desc: "Explore trending Electronics, Gadgets, Fashion & Home essentials with express delivery.",
    bg: u("1607082348824-0a96f2a4b9da")
  },
  {
    tag: "FLAGSHIP MOBILES",
    title: "Top Flagships at Unbeatable Prices",
    desc: "Samsung Galaxy S24 Ultra, Apple iPhone 16 Pro Max, and premium 5G devices with brand warranty.",
    bg: u("1610945265064-0e34e5519bbf")
  },
  {
    tag: "TRENDING FASHION",
    title: "Fashion Fest is Now Live",
    desc: "Elevate your look with comfortable everyday casuals, watches, and premium footwear.",
    bg: u("1441986300917-64674bd600d8")
  }
];

// Circular category imagery
const catImages = {
  Mobiles: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=180&q=70",
  Electronics: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=180&q=70",
  Fashion: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=180&q=70",
  Footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=180&q=70",
  "Home & Kitchen": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=180&q=70",
  Sports: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=180&q=70",
  Beauty: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=180&q=70",
  Toys: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=180&q=70",
  Furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=180&q=70",
  Outdoor: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=180&q=70",
  Bags: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=180&q=70",
  Accessories: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=180&q=70"
};

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);

  // Fetch real MySQL products from backend
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchAllProducts();
        if (isMounted && data && data.length) {
          setProducts(data);
        }
      } catch (e) {
        console.warn("Using fallback products:", e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Auto-play hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sliced sections
  const topDeals = [...products].sort((a, b) => (b.pct || 0) - (a.pct || 0)).slice(0, 8);
  const mobilesAndTech = products.filter((p) => p.category === "Mobiles" || p.category === "Electronics").slice(0, 8);
  const bestSellers = [...products].sort((a, b) => (b.reviews || 0) - (a.reviews || 0)).slice(0, 8);
  const highestRated = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);

  return (
    <main>
      {/* Hero Carousel */}
      <div id="hero" className="hero">
        {slides.map((s, idx) => (
          <div
            key={idx}
            className={`slide ${idx === currentSlide ? "on" : ""}`}
            style={{ backgroundImage: `url('${s.bg}')` }}
          >
            <div className="container">
              <small>{s.tag}</small>
              <h1>{s.title}</h1>
              <p>{s.desc}</p>
              <Link className="btn alt" to="/products">
                Shop Collection →
              </Link>
            </div>
          </div>
        ))}

        <button
          className="arrow prev"
          aria-label="Previous slide"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        >
          ←
        </button>
        <button
          className="arrow next"
          aria-label="Next slide"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        >
          →
        </button>

        <div className="dots">
          {slides.map((_, idx) => (
            <i
              key={idx}
              className={idx === currentSlide ? "on" : ""}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </div>

      {/* Explore Popular Categories (Circles) */}
      <div className="container cat-slide-section" style={{ margin: "24px auto 32px" }}>
        <div className="cat-slide-head">
          <div className="cat-slide-title-wrap">
            <h2>Explore Popular Categories</h2>
            <span className="cat-slide-sub">Shop trending collections tailored for you</span>
          </div>
          <Link to="/categories" style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.9rem" }}>View All Categories →</Link>
        </div>
        <div className="cat-slide-viewport">
          <div id="cat-circles" className="cat-slide-track">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="cat-slide-item"
                title={`Shop ${cat}`}
              >
                <div className="cat-slide-img-wrap">
                  <img
                    src={catImages[cat] || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=180&q=70"}
                    alt={cat}
                    loading="lazy"
                  />
                </div>
                <span className="cat-slide-name">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1: Today's Top Deals */}
      <section className="container" style={{ marginBottom: "28px" }}>
        <h2 className="sec-title">
          Today's Top Deals
          <Link to="/products?sort=discount">View All →</Link>
        </h2>
        <div className="grid">
          {topDeals.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Section 2: Flagship Mobiles & Gadgets */}
      <section className="container" style={{ marginBottom: "28px" }}>
        <h2 className="sec-title">
          Flagship Mobiles & Tech Gadgets
          <Link to="/products?category=Mobiles">View All →</Link>
        </h2>
        <div className="grid">
          {mobilesAndTech.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Section 3: Best Sellers */}
      <section className="container" style={{ marginBottom: "28px" }}>
        <h2 className="sec-title">
          Customer Favorites & Best Sellers
          <Link to="/products?sort=featured">View All →</Link>
        </h2>
        <div className="grid">
          {bestSellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Section 4: Highest Rated by Customers */}
      <section className="container" style={{ marginBottom: "36px" }}>
        <h2 className="sec-title">
          Highest Rated Products
          <Link to="/products?sort=rating">View All →</Link>
        </h2>
        <div className="grid">
          {highestRated.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Value Trust Highlights */}
      <div className="container" style={{ margin: "48px auto 60px" }}>
        <div className="services" style={{ marginTop: 0 }}>
          <div className="svc">
            <span>⚡</span>
            <div>
              <b>Fast Delivery Across India</b>
              <small>Guaranteed 24-48 hr express dispatch</small>
            </div>
          </div>
          <div className="svc">
            <span>🛡️</span>
            <div>
              <b>100% Genuine Products</b>
              <small>Direct from verified brand sellers</small>
            </div>
          </div>
          <div className="svc">
            <span>💳</span>
            <div>
              <b>Secure 256-Bit Checkout</b>
              <small>UPI, Cards, NetBanking & COD</small>
            </div>
          </div>
          <div className="svc">
            <span>🔄</span>
            <div>
              <b>7-Day Easy Returns</b>
              <small>Quick replacement or full refund</small>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
