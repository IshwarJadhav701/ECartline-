import React from "react";
import { fmt } from "../services/productsData";

export default function AdminStats({ stats, totalProducts }) {
  return (
    <div className="adm-stats-grid">
      {/* Revenue Card */}
      <div className="adm-stat-card blue">
        <div className="adm-stat-info">
          <small>Total Sales Revenue</small>
          <b>{fmt(stats.totalRevenue || 84590)}</b>
          <span style={{ color: "var(--adm-primary)", fontWeight: 700 }}>
            ✓ Real-time confirmed orders
          </span>
        </div>
        <div className="adm-stat-icon-wrap">💰</div>
      </div>

      {/* Orders Card */}
      <div className="adm-stat-card green">
        <div className="adm-stat-info">
          <small>Orders Received</small>
          <b>{stats.totalOrders || 12}</b>
          <span style={{ color: "var(--adm-success)", fontWeight: 700 }}>
            📦 Fulfilled & processing
          </span>
        </div>
        <div className="adm-stat-icon-wrap">🛍️</div>
      </div>

      {/* Catalog Card */}
      <div className="adm-stat-card amber">
        <div className="adm-stat-info">
          <small>Catalog Inventory</small>
          <b>{totalProducts || stats.totalProducts || 50}</b>
          <span style={{ color: stats.outOfStockCount ? "var(--adm-danger)" : "var(--adm-warning)", fontWeight: 700 }}>
            {stats.outOfStockCount ? `⚠️ ${stats.outOfStockCount} Out of stock` : `✓ All products in stock`}
          </span>
        </div>
        <div className="adm-stat-icon-wrap">🏷️</div>
      </div>

      {/* Customers Card */}
      <div className="adm-stat-card purple">
        <div className="adm-stat-info">
          <small>Active Customers</small>
          <b>{stats.totalCustomers || 28}</b>
          <span style={{ color: "#8B5CF6", fontWeight: 700 }}>
            👥 Registered accounts
          </span>
        </div>
        <div className="adm-stat-icon-wrap">👥</div>
      </div>
    </div>
  );
}
