import React from "react";
import { Link } from "react-router-dom";

export default function AdminSidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Product Catalog", icon: "🏷️" },
    { id: "add-product", label: "Add New Product", icon: "➕" },
    { id: "orders", label: "Orders & Shipping", icon: "📦" },
    { id: "messages", label: "Customer Inquiries", icon: "💬" },
  ];

  return (
    <>
      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`} aria-label="Admin Navigation">
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-brand" onClick={() => setActiveTab("dashboard")}>
            <span>🛒 ECartline</span>
            <span className="admin-brand-badge">Admin</span>
          </Link>
          {isOpen && (
            <button
              type="button"
              onClick={onClose}
              style={{ background: "none", border: "none", color: "#FFF", fontSize: "1.2rem", cursor: "pointer" }}
            >
              ✕
            </button>
          )}
        </div>

        <nav className="admin-nav">
          <small style={{ padding: "0 14px 6px", fontSize: "0.72rem", color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Store Management
          </small>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.id);
                if (isOpen && onClose) onClose();
              }}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-store-link" title="Open customer storefront in a new tab" target="_blank" rel="noopener noreferrer">
            <span>Storefront Website</span>
            <span>↗</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            zIndex: 1040,
            backdropFilter: "blur(2px)",
          }}
        />
      )}
    </>
  );
}
