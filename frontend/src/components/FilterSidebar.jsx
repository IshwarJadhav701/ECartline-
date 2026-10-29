import React, { useState, useEffect, forwardRef } from "react";
import { Link } from "react-router-dom";
import { categories, fmt } from "../services/productsData";

const FilterSidebar = forwardRef(function FilterSidebar(
  {
    filters,
    onFilterChange,
    onResetFilters,
    isOpen,
    onClose
  },
  ref
) {
  // Accordion section visibility state - distinctly named to avoid any collision with filter values
  const [collapsedGroups, setCollapsedGroups] = useState({
    category: false,
    price: false,
    rating: false,
    discount: false,
    stock: false
  });

  const [customMin, setCustomMin] = useState(filters.minPrice || "");
  const [customMax, setCustomMax] = useState(filters.maxPrice || "");

  // Keep custom price inputs synchronized when filters change externally or reset
  useEffect(() => {
    setCustomMin(filters.minPrice || "");
    setCustomMax(filters.maxPrice || "");
  }, [filters.minPrice, filters.maxPrice]);

  const toggleGroup = (groupKey, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleCategorySelect = (cat, e) => {
    if (e) e.stopPropagation();
    // Toggle off if already selected, otherwise set category
    if (filters.category === cat) {
      onFilterChange("category", "");
    } else {
      onFilterChange("category", cat);
    }
  };

  const handlePricePreset = (val, e) => {
    if (e) e.stopPropagation();
    if (!val) {
      onFilterChange("minPrice", "");
      onFilterChange("maxPrice", "");
      setCustomMin("");
      setCustomMax("");
    } else {
      const [min, max] = val.split("-");
      onFilterChange("minPrice", min);
      onFilterChange("maxPrice", max);
      setCustomMin(min);
      setCustomMax(max);
    }
  };

  const handleApplyCustomPrice = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const minVal = customMin ? String(Math.max(0, Number(customMin))) : "";
    const maxVal = customMax ? String(Math.max(0, Number(customMax))) : "";
    onFilterChange("minPrice", minVal);
    onFilterChange("maxPrice", maxVal);
  };

  // Determine active filter chips
  const activeChips = [];
  if (filters.q) {
    activeChips.push({
      label: `Search: "${filters.q}"`,
      clear: (e) => {
        if (e) e.stopPropagation();
        onFilterChange("q", "");
      }
    });
  }
  if (filters.category) {
    activeChips.push({
      label: `Category: ${filters.category}`,
      clear: (e) => {
        if (e) e.stopPropagation();
        onFilterChange("category", "");
      }
    });
  }
  if (filters.minPrice || filters.maxPrice) {
    const minText = filters.minPrice ? fmt(filters.minPrice) : "₹0";
    const maxText = filters.maxPrice ? fmt(filters.maxPrice) : "Any";
    activeChips.push({
      label: `Price: ${minText} - ${maxText}`,
      clear: (e) => {
        if (e) e.stopPropagation();
        onFilterChange("minPrice", "");
        onFilterChange("maxPrice", "");
        setCustomMin("");
        setCustomMax("");
      }
    });
  }
  if (filters.rating) {
    activeChips.push({
      label: `${filters.rating}★ & above`,
      clear: (e) => {
        if (e) e.stopPropagation();
        onFilterChange("rating", "");
      }
    });
  }
  if (filters.discount) {
    activeChips.push({
      label: `${filters.discount}% off or more`,
      clear: (e) => {
        if (e) e.stopPropagation();
        onFilterChange("discount", "");
      }
    });
  }
  if (filters.stock) {
    activeChips.push({
      label: "In Stock Only",
      clear: (e) => {
        if (e) e.stopPropagation();
        onFilterChange("stock", false);
      }
    });
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
    <aside
      ref={ref}
      className={`filters ${isOpen ? "show" : ""}`}
      aria-label="Product filters"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Top Control Bar */}
      <div className="sidebar-top-bar" onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-top-title">
          <span>⚡ Categories & Filters</span>
        </div>
        <button
          type="button"
          className="sidebar-hide-btn"
          title="Close sidebar"
          aria-label="Close filters panel"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ✕
        </button>
      </div>

      {/* Selected Filters Box */}
      {activeChips.length > 0 && (
        <div className="sidebar-selected-box show" onClick={(e) => e.stopPropagation()}>
          <div className="sidebar-selected-header">
            <span>Active Filters</span>
            <button
              type="button"
              className="sidebar-clear-all-link"
              onClick={(e) => {
                e.stopPropagation();
                onResetFilters();
              }}
            >
              Clear All
            </button>
          </div>
          <div className="sidebar-selected-chips">
            {activeChips.map((chip, i) => (
              <span key={i} className="sidebar-chip">
                {chip.label}
                <button
                  type="button"
                  onClick={chip.clear}
                  aria-label="Remove filter"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className={`filter-group ${collapsedGroups.category ? "collapsed" : ""}`}>
        <div
          className="filter-head"
          role="button"
          tabIndex={0}
          aria-expanded={!collapsedGroups.category}
          onClick={(e) => toggleGroup("category", e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              toggleGroup("category", e);
            }
          }}
        >
          <span>Categories</span>
          <span className="filter-chevron">{collapsedGroups.category ? "▸" : "▾"}</span>
        </div>
        {!collapsedGroups.category && (
          <div className="filter-body">
            <div className="cat-filter-list" role="listbox" aria-label="Product categories">
              {/* All Categories Option */}
              <div
                className={`filter-cat-row ${!filters.category ? "active" : ""}`}
                role="button"
                tabIndex={0}
                onClick={(e) => handleCategorySelect("", e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCategorySelect("", e);
                  }
                }}
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
                    onClick={(e) => handleCategorySelect(cat, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleCategorySelect(cat, e);
                      }
                    }}
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
                onClick={(e) => e.stopPropagation()}
              >
                View All Categories Page →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className={`filter-group ${collapsedGroups.price ? "collapsed" : ""}`}>
        <div
          className="filter-head"
          role="button"
          tabIndex={0}
          aria-expanded={!collapsedGroups.price}
          onClick={(e) => toggleGroup("price", e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              toggleGroup("price", e);
            }
          }}
        >
          <span>Price Range</span>
          <span className="filter-chevron">{collapsedGroups.price ? "▸" : "▾"}</span>
        </div>
        {!collapsedGroups.price && (
          <div className="filter-body">
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="price_preset"
                value=""
                checked={pricePresetValue === ""}
                onChange={(e) => handlePricePreset("", e)}
                onClick={(e) => e.stopPropagation()}
              />
              Any Price
            </label>
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="price_preset"
                value="0-999"
                checked={pricePresetValue === "0-999"}
                onChange={(e) => handlePricePreset("0-999", e)}
                onClick={(e) => e.stopPropagation()}
              />
              Under ₹1,000
            </label>
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="price_preset"
                value="1000-5000"
                checked={pricePresetValue === "1000-5000"}
                onChange={(e) => handlePricePreset("1000-5000", e)}
                onClick={(e) => e.stopPropagation()}
              />
              ₹1,000 - ₹5,000
            </label>
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="price_preset"
                value="5000-20000"
                checked={pricePresetValue === "5000-20000"}
                onChange={(e) => handlePricePreset("5000-20000", e)}
                onClick={(e) => e.stopPropagation()}
              />
              ₹5,000 - ₹20,000
            </label>
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="price_preset"
                value="20000-60000"
                checked={pricePresetValue === "20000-60000"}
                onChange={(e) => handlePricePreset("20000-60000", e)}
                onClick={(e) => e.stopPropagation()}
              />
              ₹20,000 - ₹60,000
            </label>
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="price_preset"
                value="60000-99999999"
                checked={pricePresetValue === "60000-99999999"}
                onChange={(e) => handlePricePreset("60000-99999999", e)}
                onClick={(e) => e.stopPropagation()}
              />
              Above ₹60,000
            </label>

            {/* Custom Min / Max Inputs */}
            <form className="price-range-inputs" onSubmit={handleApplyCustomPrice} onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                placeholder="Min ₹"
                min="0"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="number"
                placeholder="Max ₹"
                min="0"
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <button type="submit" onClick={(e) => e.stopPropagation()}>Go</button>
            </form>
          </div>
        )}
      </div>

      {/* Customer Rating Section */}
      <div className={`filter-group ${collapsedGroups.rating ? "collapsed" : ""}`}>
        <div
          className="filter-head"
          role="button"
          tabIndex={0}
          aria-expanded={!collapsedGroups.rating}
          onClick={(e) => toggleGroup("rating", e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              toggleGroup("rating", e);
            }
          }}
        >
          <span>Customer Rating</span>
          <span className="filter-chevron">{collapsedGroups.rating ? "▸" : "▾"}</span>
        </div>
        {!collapsedGroups.rating && (
          <div className="filter-body">
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="rating"
                value=""
                checked={filters.rating === ""}
                onChange={(e) => {
                  e.stopPropagation();
                  onFilterChange("rating", "");
                }}
                onClick={(e) => e.stopPropagation()}
              />
              Any Rating
            </label>
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="rating"
                value="4"
                checked={filters.rating === "4"}
                onChange={(e) => {
                  e.stopPropagation();
                  onFilterChange("rating", "4");
                }}
                onClick={(e) => e.stopPropagation()}
              />
              4★ & above
            </label>
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="rating"
                value="3"
                checked={filters.rating === "3"}
                onChange={(e) => {
                  e.stopPropagation();
                  onFilterChange("rating", "3");
                }}
                onClick={(e) => e.stopPropagation()}
              />
              3★ & above
            </label>
          </div>
        )}
      </div>

      {/* Discount Section */}
      <div className={`filter-group ${collapsedGroups.discount ? "collapsed" : ""}`}>
        <div
          className="filter-head"
          role="button"
          tabIndex={0}
          aria-expanded={!collapsedGroups.discount}
          onClick={(e) => toggleGroup("discount", e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              toggleGroup("discount", e);
            }
          }}
        >
          <span>Discount</span>
          <span className="filter-chevron">{collapsedGroups.discount ? "▸" : "▾"}</span>
        </div>
        {!collapsedGroups.discount && (
          <div className="filter-body">
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="discount"
                value=""
                checked={filters.discount === ""}
                onChange={(e) => {
                  e.stopPropagation();
                  onFilterChange("discount", "");
                }}
                onClick={(e) => e.stopPropagation()}
              />
              All Discounts
            </label>
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="discount"
                value="10"
                checked={filters.discount === "10"}
                onChange={(e) => {
                  e.stopPropagation();
                  onFilterChange("discount", "10");
                }}
                onClick={(e) => e.stopPropagation()}
              />
              10% & more
            </label>
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="discount"
                value="20"
                checked={filters.discount === "20"}
                onChange={(e) => {
                  e.stopPropagation();
                  onFilterChange("discount", "20");
                }}
                onClick={(e) => e.stopPropagation()}
              />
              20% & more
            </label>
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="discount"
                value="30"
                checked={filters.discount === "30"}
                onChange={(e) => {
                  e.stopPropagation();
                  onFilterChange("discount", "30");
                }}
                onClick={(e) => e.stopPropagation()}
              />
              30% & more
            </label>
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="radio"
                name="discount"
                value="50"
                checked={filters.discount === "50"}
                onChange={(e) => {
                  e.stopPropagation();
                  onFilterChange("discount", "50");
                }}
                onClick={(e) => e.stopPropagation()}
              />
              50% & more
            </label>
          </div>
        )}
      </div>

      {/* Availability Section */}
      <div className={`filter-group ${collapsedGroups.stock ? "collapsed" : ""}`}>
        <div
          className="filter-head"
          role="button"
          tabIndex={0}
          aria-expanded={!collapsedGroups.stock}
          onClick={(e) => toggleGroup("stock", e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              toggleGroup("stock", e);
            }
          }}
        >
          <span>Availability</span>
          <span className="filter-chevron">{collapsedGroups.stock ? "▸" : "▾"}</span>
        </div>
        {!collapsedGroups.stock && (
          <div className="filter-body">
            <label onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                name="stock"
                checked={Boolean(filters.stock)}
                onChange={(e) => {
                  e.stopPropagation();
                  onFilterChange("stock", e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
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
        onClick={(e) => {
          e.stopPropagation();
          onResetFilters();
        }}
      >
        Clear All Filters
      </button>
    </aside>
  );
});

export default FilterSidebar;
