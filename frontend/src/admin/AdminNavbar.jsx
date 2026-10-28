import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AdminNavbar({ activeTab, onToggleSidebar, onAddProductClick }) {
  const { user, logoutUser } = useAuth();
  const { showToast } = useToast();

  const tabTitles = {
    dashboard: "Executive Overview & Analytics",
    products: "Products Catalog Management",
    "add-product": "Add New Store Product",
    orders: "Customer Orders & Tracking",
    messages: "Customer Inquiries & Messages",
  };

  const handleSignOut = () => {
    logoutUser();
    showToast("Signed out of Admin Portal", "info");
  };

  return (
    <header className="admin-navbar">
      <div className="admin-nav-left">
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div className="admin-breadcrumbs">
          <span>{tabTitles[activeTab] || "Admin Control Center"}</span>
        </div>
      </div>

      <div className="admin-nav-right">
        {activeTab !== "add-product" && (
          <button
            type="button"
            className="btn"
            style={{ minHeight: "36px", padding: "0 14px", fontSize: "0.85rem" }}
            onClick={onAddProductClick}
          >
            + New Product
          </button>
        )}

        <div className="admin-user-pill">
          <div className="admin-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="admin-user-info">
            <span className="admin-user-name">{user?.email || "admin@ecartline.in"}</span>
            <span className="admin-user-role">Super Admin</span>
          </div>
        </div>

        <button
          type="button"
          className="btn line"
          style={{ minHeight: "36px", padding: "0 12px", fontSize: "0.85rem", color: "#DC2626", borderColor: "#FECDD3" }}
          onClick={handleSignOut}
          title="Sign out of Admin Portal"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
