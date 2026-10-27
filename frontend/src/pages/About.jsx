import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="container">
      <div style={{ margin: "36px 0 60px" }}>
        <div className="prose">
          <h1>About ECartline</h1>
          <p>
            ECartline is a modern Indian online marketplace designed to bring you the best selection of curated products at honest prices. Our tagline says it all: <b>Smart products. Better everyday.</b>
          </p>
          <h2>Our Mission</h2>
          <p>
            To make high quality, reliable, and innovative everyday products affordable and accessible to every household across India, paired with lightning-fast delivery and transparent service.
          </p>
        </div>

        <h2 className="sec-title" style={{ marginTop: "48px" }}>Why Shop With Us</h2>
        <div className="cols" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
          <div className="card" style={{ padding: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px" }}>🚚</span>
            <h3 style={{ margin: "0 0 8px" }}>Fast Delivery</h3>
            <p style={{ color: "var(--muted)", margin: 0 }}>Quick and reliable dispatch to over 19,000 pincodes across India.</p>
          </div>
          <div className="card" style={{ padding: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px" }}>🔒</span>
            <h3 style={{ margin: "0 0 8px" }}>Secure Payments</h3>
            <p style={{ color: "var(--muted)", margin: 0 }}>All transactions protected with industry-standard encryption, UPI, cards, and COD.</p>
          </div>
          <div className="card" style={{ padding: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px" }}>↩️</span>
            <h3 style={{ margin: "0 0 8px" }}>Easy Returns</h3>
            <p style={{ color: "var(--muted)", margin: 0 }}>7-day hassle-free return and replacement policy on eligible items.</p>
          </div>
          <div className="card" style={{ padding: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px" }}>🎧</span>
            <h3 style={{ margin: "0 0 8px" }}>Customer Support</h3>
            <p style={{ color: "var(--muted)", margin: 0 }}>Dedicated customer assistance available 6 days a week via phone and email.</p>
          </div>
        </div>

        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <Link className="btn" to="/products">
            Start Shopping Now
          </Link>
        </div>
      </div>
    </main>
  );
}
