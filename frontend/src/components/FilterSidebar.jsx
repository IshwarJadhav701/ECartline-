import React, { useState } from "react";
import { Link } from "react-router-dom";
import { categories, fmt } from "../services/productsData";

export default function FilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  isOpen,
  onClose
}) {
  const [collapsedSections, setCollapsedSections] = useState({
    category: false,
    price: false,
    rating: false,
    discount: false,
    stock: false
  });

  const [customMin, setCustomMin] = useState(filters.minPrice || "");
  const [customMax, setCustomMax] = useState(filters.maxPrice || "");

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategorySelect = (cat) => {
    // If clicking already selected category, toggle off
    if (filters.category === cat) {
      onFilterChange("category", "");
    } else {
      onFilterChange("category", cat);
    }
  };

  const handlePricePreset = (val) => {
    if (!val) {
      onFilterChange("minPrice", "");
      onFilterChange("maxPrice", "");
      setCustomMin("");
      setCustomMax("");
    } else {
      const [min, max] = val.split("-");
      onFilterChange("minPrice", min);
      onFilterChange("maxPrice", max);
      setCustomMin("");
      setCustomMax("");
    }
  };

  const handleApplyCustomPrice = (e) => {
    e.preventDefault();
    onFilterChange("minPrice", customMin ? String(Math.max(0, Number(customMin))) : "");
    onFilterChange("maxPrice", customMax ? String(Math.max(0, Number(customMax))) : "");
  };

  // Determine active filter chips
  const activeChips = [];
  if (filters.q) {
    activeChips.push({ label: `Search: "${filters.q}"`, clear: () => onFilterChange("q", "") });
  }
  if (filters.category) {
    activeChips.push({ label: `Category: ${filters.category}`, clear: () => onFilterChange("category", "") });
  }
  if (filters.minPrice || filters.maxPrice) {
    const minText = filters.minPrice ? fmt(filters.minPrice) : "₹0";
    const maxText = filters.maxPrice ? fmt(filters.maxPrice) : "Any";
    activeChips.push({
      label: `Price: ${minText} - ${maxText}`,
      clear: () => {
        onFilterChange("minPrice", "");
        onFilterChange("maxPrice", "");
        setCustomMin("");
        setCustomMax("");
      }
    });
  }
  if (filters.rating) {
    activeChips.push({ label: `${filters.rating}★ & above`, clear: () => onFilterChange("rating", "") });
  }
  if (filters.discount) {
    activeChips.push({ label: `${filters.discount}% off or more`, clear: () => onFilterChange("discount", "") });
  }
  if (filters.stock) {
    activeChips.push({ label: "In Stock Only", clear: () => onFilterChange("stock", false) });
  }

  const pricePresetValue =
    filters.minPrice === "" && filters.maxPrice === ""
      ? ""
      : filters.minPrice === "0" && filters.maxPrice === "999"
      ? "0-999"
      : filters.minPrice === "1000" && filters.maxPrice === "5000"
      ? "1000-5000"
      : filters.minPrice === "5000" && filters.maxPrice === "20000"
      ? "5000-20000"
      : filters.minPrice === "20000" && filters.maxPrice === "60000"
      ? "20000-60000"
      : filters.minPrice === "60000" && filters.maxPrice === "99999999"
      ? "60000-99999999"
      : "custom";

  return (
    <>
      <aside className={`filters ${isOpen ? "show" : ""}`} aria-label="Filters">
        {/* Top Control Bar */}
        <div className="sidebar-top-bar">
          <div className="sidebar-top-title">
            <span>⚡ Categories & Filters</span>
          </div>
          <button
            type="button"
            className="sidebar-hide-btn"
            title="Close sidebar"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Selected Filters Box */}
        {activeChips.length > 0 && (
          <div className="sidebar-selected-box show">
            <div className="sidebar-selected-header">
              <span>Active Filters</span>
              <button type="button" className="sidebar-clear-all-link" onClick={onResetFilters}>
                Clear All
              </button>
            </div>
            <div className="sidebar-selected-chips">
              {activeChips.map((chip, i) => (
                <span key={i} className="sidebar-chip">
                  {chip.label}
                  <button type="button" onClick={chip.clear} aria-label="Remove filter">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div className={`filter-group ${collapsedSections.category ? "collapsed" : ""}`}>
          <div
            className="filter-head"
            role="button"
            tabIndex={0}
            onClick={() => toggleSection("category")}
          >
            <span>Categories</span>
            <span className="filter-chevron">{collapsedSections.category ? "▸" : "▾"}</span>
          </div>
          {!collapsedSections.category && (
            <div className="filter-body">
              <div className="cat-filter-list" role="listbox" aria-label="Product categories">
                {/* All Categories Option */}
                <div
                  className={`filter-cat-row ${!filters.category ? "active" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCategorySelect("")}
                >
                  <span className="cat-name">All Categories</span>
                  {!filters.category && <span className="cat-check" aria-hidden="true">✓</span>}
                </div>

                {/* Specific Category Rows */}
                {categories.map((cat) => {
                  const isActive = filters.category === cat;
                  return (
                    <div
                      key={cat}
                      className={`filter-cat-row ${isActive ? "active" : ""}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCategorySelect(cat)}
                    >
                      <span className="cat-name">{cat}</span>
                      {isActive && <span className="cat-check" aria-hidden="true">✓</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <Link
                  to="/categories"
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    background: "#F1F5F9",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    color: "var(--primary)",
                    fontWeight: 700,
                    textDecoration: "none"
                  }}
                >
                  View All Categories Page →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Price Range Section */}
        <div className={`filter-group ${collapsedSections.price ? "collapsed" : ""}`}>
          <div
            className="filter-head"
            role="button"
            tabIndex={0}
            onClick={() => toggleSection("price")}
          >
            <span>Price Range</span>
            <span className="filter-chevron">{collapsedSections.price ? "▸" : "▾"}</span>
          </div>
          {!collapsedSections.price && (
            <div className="filter-body">
              <label>
                <input
                  type="radio"
                  name="price_preset"
                  value=""
                  checked={pricePresetValue === ""}
                  onChange={() => handlePricePreset("")}
                />
                Any Price
              </label>
              <label>
                <input
                  type="radio"
                  name="price_preset"
                  value="0-999"
                  checked={pricePresetValue === "0-999"}
                  onChange={() => handlePricePreset("0-999")}
                />
                Under ₹1,000
              </label>
              <label>
                <input
                  type="radio"
                  name="price_preset"
                  value="1000-5000"
                  checked={pricePresetValue === "1000-5000"}
                  onChange={() => handlePricePreset("1000-5000")}
                />
                ₹1,000 - ₹5,000
              </label>
              <label>
                <input
                  type="radio"
                  name="price_preset"
                  value="5000-20000"
                  checked={pricePresetValue === "5000-20000"}
                  onChange={() => handlePricePreset("5000-20000")}
                />
                ₹5,000 - ₹20,000
              </label>
              <label>
                <input
                  type="radio"
                  name="price_preset"
                  value="20000-60000"
                  checked={pricePresetValue === "20000-60000"}
                  onChange={() => handlePricePreset("20000-60000")}
                />
                ₹20,000 - ₹60,000
              </label>
              <label>
                <input
                  type="radio"
                  name="price_preset"
                  value="60000-99999999"
                  checked={pricePresetValue === "60000-99999999"}
                  onChange={() => handlePricePreset("60000-99999999")}
                />
                Above ₹60,000
              </label>

              {/* Custom Min / Max Inputs */}
              <form className="price-range-inputs" onSubmit={handleApplyCustomPrice}>
                <input
                  type="number"
                  placeholder="Min ₹"
                  min="0"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  min="0"
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                />
                <button type="submit">Go</button>
              </form>
            </div>
          )}
        </div>

        {/* Customer Rating Section */}
        <div className={`filter-group ${collapsedSections.rating ? "collapsed" : ""}`}>
          <div
            className="filter-head"
            role="button"
            tabIndex={0}
            onClick={() => toggleSection("rating")}
          >
            <span>Customer Rating</span>
            <span className="filter-chevron">{collapsedSections.rating ? "▸" : "▾"}</span>
          </div>
          {!collapsedSections.rating && (
            <div className="filter-body">
              <label>
                <input
                  type="radio"
                  name="rating"
                  value=""
                  checked={filters.rating === ""}
                  onChange={() => onFilterChange("rating", "")}
                />
                Any Rating
              </label>
              <label>
                <input
                  type="radio"
                  name="rating"
                  value="4"
                  checked={filters.rating === "4"}
                  onChange={() => onFilterChange("rating", "4")}
                />
                4★ & above
              </label>
              <label>
                <input
                  type="radio"
                  name="rating"
                  value="3"
                  checked={filters.rating === "3"}
                  onChange={() => onFilterChange("rating", "3")}
                />
                3★ & above
              </label>
            </div>
          )}
        </div>

        {/* Discount Section */}
        <div className={`filter-group ${collapsedSections.discount ? "collapsed" : ""}`}>
          <div
            className="filter-head"
            role="button"
            tabIndex={0}
            onClick={() => toggleSection("discount")}
          >
            <span>Discount</span>
            <span className="filter-chevron">{collapsedSections.discount ? "▸" : "▾"}</span>
          </div>
          {!collapsedSections.discount && (
            <div className="filter-body">
              <label>
                <input
                  type="radio"
                  name="discount"
                  value=""
                  checked={filters.discount === ""}
                  onChange={() => onFilterChange("discount", "")}
                />
                All Discounts
              </label>
              <label>
                <input
                  type="radio"
                  name="discount"
                  value="10"
                  checked={filters.discount === "10"}
                  onChange={() => onFilterChange("discount", "10")}
                />
                10% & more
              </label>
              <label>
                <input
                  type="radio"
                  name="discount"
                  value="20"
                  checked={filters.discount === "20"}
                  onChange={() => onFilterChange("discount", "20")}
                />
                20% & more
              </label>
              <label>
                <input
                  type="radio"
                  name="discount"
                  value="30"
                  checked={filters.discount === "30"}
                  onChange={() => onFilterChange("discount", "30")}
                />
                30% & more
              </label>
              <label>
                <input
                  type="radio"
                  name="discount"
                  value="50"
                  checked={filters.discount === "50"}
                  onChange={() => onFilterChange("discount", "50")}
                />
                50% & more
              </label>
            </div>
          )}
        </div>

        {/* Availability Section */}
        <div className={`filter-group ${collapsedSections.stock ? "collapsed" : ""}`}>
          <div
            className="filter-head"
            role="button"
            tabIndex={0}
            onClick={() => toggleSection("stock")}
          >
            <span>Availability</span>
            <span className="filter-chevron">{collapsedSections.stock ? "▸" : "▾"}</span>
          </div>
          {!collapsedSections.stock && (
            <div className="filter-body">
              <label>
                <input
                  type="checkbox"
                  name="stock"
                  checked={Boolean(filters.stock)}
                  onChange={(e) => onFilterChange("stock", e.target.checked)}
                />
                In stock only
              </label>
            </div>
          )}
        </div>

        {/* Clear All Filters Button */}
        <button
          type="button"
          className="btn line"
          style={{ width: "100%", marginTop: "16px" }}
          onClick={onResetFilters}
        >
          Clear All Filters
        </button>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && <div className="sidebar-backdrop show" onClick={onClose} />}
    </>
  );
}
