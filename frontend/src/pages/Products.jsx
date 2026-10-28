import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";
import { fetchAllProducts } from "../services/api";
import { fallbackProducts, fmt } from "../services/productsData";

const ITEMS_PER_PAGE = 12;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== "undefined" ? window.innerWidth >= 992 : true));

  // Sync state with URL search params
  const [filters, setFilters] = useState(() => ({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    rating: searchParams.get("rating") || "",
    discount: searchParams.get("discount") || "",
    stock: searchParams.get("stock") === "true",
    sort: searchParams.get("sort") || "featured",
    page: Number(searchParams.get("page")) || 1
  }));

  // Fetch real MySQL products
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchAllProducts();
        if (isMounted && data && data.length) {
          setProducts(data);
        }
      } catch (e) {
        console.warn("Backend not reachable - using local products:", e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Update URL params when filters change
  const updateFilter = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value, page: key === "page" ? value : 1 };
      const params = new URLSearchParams();
      if (next.q) params.set("q", next.q);
      if (next.category) params.set("category", next.category);
      if (next.minPrice) params.set("minPrice", next.minPrice);
      if (next.maxPrice) params.set("maxPrice", next.maxPrice);
      if (next.rating) params.set("rating", next.rating);
      if (next.discount) params.set("discount", next.discount);
      if (next.stock) params.set("stock", "true");
      if (next.sort && next.sort !== "featured") params.set("sort", next.sort);
      if (next.page > 1) params.set("page", String(next.page));
      setSearchParams(params, { replace: true });
      return next;
    });
  };

  const resetFilters = () => {
    setFilters({
      q: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      rating: "",
      discount: "",
      stock: false,
      sort: "featured",
      page: 1
    });
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query
    if (filters.q.trim()) {
      const query = filters.q.trim().toLowerCase();
      list = list.filter((p) => {
        return (
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
        );
      });
    }

    // Category
    if (filters.category) {
      list = list.filter((p) => p.category === filters.category);
    }

    // Price range
    if (filters.minPrice !== "" && Number.isFinite(Number(filters.minPrice))) {
      list = list.filter((p) => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== "" && Number.isFinite(Number(filters.maxPrice))) {
      list = list.filter((p) => p.price <= Number(filters.maxPrice));
    }

    // Rating
    if (filters.rating) {
      list = list.filter((p) => p.rating >= Number(filters.rating));
    }

    // Discount
    if (filters.discount) {
      list = list.filter((p) => (p.pct || 0) >= Number(filters.discount));
    }

    // Stock
    if (filters.stock) {
      list = list.filter((p) => p.inStock && (p.stock == null || p.stock > 0));
    }

    // Sorting
    switch (filters.sort) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id));
        break;
      case "discount":
        list.sort((a, b) => (b.pct || 0) - (a.pct || 0));
        break;
      default:
        list.sort((a, b) => a.id - b.id);
        break;
    }

    return list;
  }, [products, filters]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(filters.page, totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Active chips for display above the grid
  const chips = [];
  if (filters.q) chips.push({ label: `Search: "${filters.q}"`, clear: () => updateFilter("q", "") });
  if (filters.category) chips.push({ label: `Category: ${filters.category}`, clear: () => updateFilter("category", "") });
  if (filters.minPrice || filters.maxPrice) {
    const minText = filters.minPrice ? fmt(filters.minPrice) : "₹0";
    const maxText = filters.maxPrice ? fmt(filters.maxPrice) : "Any";
    chips.push({ label: `Price: ${minText} - ${maxText}`, clear: () => { updateFilter("minPrice", ""); updateFilter("maxPrice", ""); } });
  }
  if (filters.rating) chips.push({ label: `${filters.rating}★ & above`, clear: () => updateFilter("rating", "") });
  if (filters.discount) chips.push({ label: `${filters.discount}% off or more`, clear: () => updateFilter("discount", "") });
  if (filters.stock) chips.push({ label: "In Stock Only", clear: () => updateFilter("stock", false) });

  return (
    <main>
      {/* Page Header */}
      <div className="page-head">
        <div className="container">
          <h1>{filters.category ? `${filters.category} Collection` : "All Products"}</h1>
          <p id="count">
            {totalItems > 0
              ? `Showing ${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of ${totalItems} products`
              : "No products found."}
          </p>
        </div>
      </div>

      {/* Main Shop Container */}
      <div className={`container shop ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
        {/* Filter Sidebar Component */}
        <FilterSidebar
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Catalog Section */}
        <section>
          {/* Toolbar */}
          <div className="toolbar">
            <button
              type="button"
              className={`btn line f-toggle ${sidebarOpen ? "active" : ""}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle filter sidebar"
            >
              <span style={{ fontSize: "1.15rem", lineHeight: 1, marginRight: "4px" }}>☰</span>
              <span>Filters</span>
            </button>

            <label>
              Sort by:{" "}
              <select
                id="sort"
                aria-label="Sort"
                value={filters.sort}
                onChange={(e) => updateFilter("sort", e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="newest">Newest</option>
                <option value="discount">Discount</option>
              </select>
            </label>
          </div>

          {/* Active Filter Chips */}
          {chips.length > 0 && (
            <div className="filter-chips">
              {chips.map((chip, idx) => (
                <span key={idx} className="chip">
                  {chip.label}
                  <button type="button" onClick={chip.clear} aria-label="Remove filter">
                    ✕
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="btn line"
                style={{ minHeight: "28px", padding: "2px 10px", fontSize: "0.78rem" }}
                onClick={resetFilters}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid */}
          {currentItems.length > 0 ? (
            <div className="grid">
              {currentItems.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="empty" style={{ padding: "48px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔍</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>
                No products found
              </h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
                We couldn't find any products matching your selected filters or search query.
              </p>
              <button type="button" className="btn" onClick={resetFilters}>
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pager / Pagination */}
          {totalPages > 1 && (
            <div className="pager">
              <button
                disabled={currentPage === 1}
                style={currentPage === 1 ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                onClick={() => {
                  updateFilter("page", currentPage - 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                aria-label="Previous page"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  className={pNum === currentPage ? "on" : ""}
                  onClick={() => {
                    updateFilter("page", pNum);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {pNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                style={currentPage === totalPages ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                onClick={() => {
                  updateFilter("page", currentPage + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                aria-label="Next page"
              >
                →
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
