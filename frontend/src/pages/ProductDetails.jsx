import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProduct, fetchReviews, submitReview, getToken } from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { fallbackProducts, fmt, FALLBACK_IMAGE } from "../services/productsData";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState(() => localStorage.getItem("ec_pincode") || "411001");
  const [pincodeMsg, setPincodeMsg] = useState("✓ Free Delivery by Tomorrow");

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load product details
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const prod = await fetchProduct(id);
        if (isMounted && prod) {
          setProduct(prod);
        }
      } catch {
        // Fallback to local products
        const local = fallbackProducts.find((p) => String(p.id) === String(id));
        if (isMounted) setProduct(local || null);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  // Load product reviews
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetchReviews(id);
        if (res && Array.isArray(res.data)) {
          setReviews(res.data);
        }
      } catch {
        setReviews([]);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="container" style={{ padding: "80px 16px", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>⏳</div>
        <h2>Loading product details...</h2>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container" style={{ padding: "80px 16px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🛍️</div>
        <h2>Product not found</h2>
        <p style={{ color: "var(--text-muted)", margin: "12px 0 24px" }}>
          The product you are looking for may have been removed or is unavailable.
        </p>
        <Link className="btn" to="/products">
          Browse All Products
        </Link>
      </main>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const maxStock = Math.min(10, product.stock ?? 10);
  const inStock = product.inStock !== false && (product.stock == null || product.stock > 0);
  const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image || FALLBACK_IMAGE];

  const handlePincodeCheck = () => {
    if (/^\d{6}$/.test(pincode.trim())) {
      setPincodeMsg("✓ Delivery available! Free delivery by Tomorrow");
      showToast(`Pincode ${pincode} verified for express delivery.`);
    } else {
      setPincodeMsg("✕ Please enter a valid 6-digit Indian pincode.");
    }
  };

  const handleBuyNow = async () => {
    const ok = await addToCart(product, quantity);
    if (ok) {
      navigate("/checkout");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast("Please enter a comment for your review.");
      return;
    }

    setSubmittingReview(true);
    try {
      await submitReview(product.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        reviewerName: reviewName.trim() || undefined
      });
      showToast("✓ Thank you! Your review has been submitted.");
      setReviewComment("");
      setReviewName("");

      // Refresh reviews list
      const updated = await fetchReviews(product.id);
      if (updated && Array.isArray(updated.data)) {
        setReviews(updated.data);
      }
    } catch (err) {
      showToast(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (score) => {
    const full = Math.floor(score || 0);
    return "★".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
  };

  return (
    <main className="container">
      {/* Breadcrumb Navigation */}
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "20px 0 16px" }}>
        <Link to="/" style={{ color: "var(--text-muted)" }}>Home</Link> &gt;{" "}
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} style={{ color: "var(--text-muted)" }}>
          {product.category}
        </Link>{" "}
        &gt; <b>{product.name}</b>
      </div>

      {/* Main Product Layout */}
      <div className="detail" id="detail">
        {/* Left Column: Image Gallery */}
        <div className="detail-left">
          <div className="main-img">
            <img
              id="main"
              src={images[activeImageIndex] || FALLBACK_IMAGE}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_IMAGE;
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  className={idx === activeImageIndex ? "on" : ""}
                  alt={`${product.name} view ${idx + 1}`}
                  onClick={() => setActiveImageIndex(idx)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Actions */}
        <div className="detail-right">
          <h1>{product.name}</h1>

          {/* Ratings & Reviews summary */}
          <div className="stars" style={{ marginBottom: "8px" }}>
            <span style={{ color: "var(--star-gold)" }}>{renderStars(product.rating)}</span>
            <small style={{ fontSize: "0.9rem", fontWeight: "600", marginLeft: "6px" }}>
              {product.rating} · {product.reviews ? Number(product.reviews).toLocaleString("en-IN") : 0} customer ratings
            </small>
          </div>

          {/* Pricing */}
          <div className="big">
            {fmt(product.price)}{" "}
            {product.oldPrice && product.oldPrice > product.price && <s>{fmt(product.oldPrice)}</s>}{" "}
            {product.discount && <em>{product.discount}</em>}
          </div>

          {product.oldPrice && product.oldPrice > product.price && (
            <div style={{ fontSize: "0.88rem", color: "var(--discount-green)", fontWeight: "700", marginBottom: "12px" }}>
              You save {fmt(product.oldPrice - product.price)} ({product.discount})
            </div>
          )}

          {/* Stock Indicator */}
          <p style={{ color: inStock ? "var(--primary)" : "#DC2626", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
            {inStock ? `✓ In Stock (${product.stock ?? 15} available)` : "✖ Temporarily Out of Stock"}
          </p>

          {/* Offers Box */}
          <div className="offers-card">
            <h4>⚡ Available Offers & Deals</h4>
            <ul>
              <li><b>Bank Offer:</b> 5% Unlimited Cashback on Axis Bank Credit Cards.</li>
              <li><b>Special Price:</b> Extra ₹1,000 instant discount on orders above ₹15,000.</li>
              <li><b>No Cost EMI:</b> Avail No Cost EMI on select credit cards.</li>
              <li><b>Partner Offer:</b> Free 12-month extended brand warranty registration.</li>
            </ul>
          </div>

          {/* Pincode Availability Checker */}
          <div className="pincode-box">
            <span>📍 Delivery to:</span>
            <input
              type="text"
              id="detail-pin-input"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={6}
              inputMode="numeric"
            />
            <button
              className="btn line"
              type="button"
              id="check-pin-btn"
              style={{ minHeight: "36px", padding: "0 14px" }}
              onClick={handlePincodeCheck}
            >
              Check
            </button>
            <span id="pin-status" style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "700" }}>
              {pincodeMsg}
            </span>
          </div>

          {/* Description */}
          <p style={{ margin: "16px 0", lineHeight: "1.7", color: "var(--text-body)", fontSize: "0.98rem" }}>
            {product.description}
          </p>

          {/* Quantity Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
            <span style={{ fontWeight: "700", fontSize: "0.92rem" }}>Quantity:</span>
            <div className="qty">
              <button
                type="button"
                disabled={!inStock || quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span id="qty-val">{quantity}</span>
              <button
                type="button"
                disabled={!inStock || quantity >= maxStock}
                onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <small style={{ color: "var(--text-muted)" }}>(Max {maxStock} per order)</small>
          </div>

          {/* Action Buttons */}
          <div className="row-btns">
            <button
              type="button"
              className="btn"
              disabled={!inStock}
              onClick={() => addToCart(product, quantity)}
            >
              🛒 Add to Cart
            </button>
            <button
              type="button"
              className="btn alt"
              disabled={!inStock}
              onClick={handleBuyNow}
            >
              ⚡ Buy Now
            </button>
            <button
              type="button"
              className="btn line heart-btn"
              onClick={() => toggleWishlist(product.id)}
            >
              {isFavorited ? "♥ In Wishlist" : "♡ Add to Wishlist"}
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="box" style={{ marginTop: "20px" }}>
            🚚 <b>Doorstep Delivery:</b> Free express delivery on orders over ₹499.<br />
            ↩️ <b>Return Policy:</b> 7-day hassle-free replacement or return.<br />
            🛡️ <b>Warranty:</b> 100% Original Brand Guarantee with manufacturer warranty.
          </div>

          {/* Specifications Table */}
          <h3 style={{ marginTop: "24px" }}>Product Specifications</h3>
          <table className="spec">
            <tbody>
              <tr><td>Product Name</td><td>{product.name}</td></tr>
              <tr><td>Brand / Manufacturer</td><td>{product.name.split(" ")[0]}</td></tr>
              <tr><td>Category</td><td>{product.category}</td></tr>
              <tr><td>Availability</td><td>{inStock ? `In Stock (${product.stock ?? 15} units)` : "Out of Stock"}</td></tr>
              <tr><td>Warranty Period</td><td>1 Year Official Brand Warranty</td></tr>
              <tr><td>Payment Modes</td><td>Cash on Delivery (COD), UPI, Credit & Debit Cards</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section style={{ margin: "48px 0 60px" }}>
        <h2 className="sec-title" style={{ marginBottom: "20px" }}>
          Customer Reviews & Ratings
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Reviews List */}
          <div>
            <h3>Recent Verified Reviews ({reviews.length})</h3>
            {reviews.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
                {reviews.map((rev, i) => (
                  <div
                    key={rev.id || i}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--r-md)",
                      padding: "16px",
                      boxShadow: "var(--sh-sm)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <b>{rev.reviewerName || "Verified Buyer"}</b>
                      <span style={{ color: "var(--star-gold)" }}>{renderStars(rev.rating)}</span>
                    </div>
                    <p style={{ color: "var(--text-body)", fontSize: "0.92rem", margin: 0, lineHeight: "1.5" }}>
                      {rev.comment}
                    </p>
                    {rev.createdAt && (
                      <small style={{ color: "var(--text-muted)", display: "block", marginTop: "8px" }}>
                        Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                      </small>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>
                No customer reviews yet. Be the first to review this product!
              </p>
            )}
          </div>

          {/* Submit a Review Form */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              padding: "20px",
              boxShadow: "var(--sh-sm)"
            }}
          >
            <h3>Write a Customer Review</h3>
            <form onSubmit={handleReviewSubmit} style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "700", fontSize: "0.88rem", marginBottom: "4px" }}>
                  Rating (1 to 5 Stars):
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.6rem",
                        cursor: "pointer",
                        color: star <= reviewRating ? "var(--star-gold)" : "#CBD5E1"
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "700", fontSize: "0.88rem", marginBottom: "4px" }}>
                  Your Name (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "700", fontSize: "0.88rem", marginBottom: "4px" }}>
                  Your Review / Experience:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details of your experience, product quality, battery life, performance..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}
                />
              </div>

              <button
                type="submit"
                className="btn"
                disabled={submittingReview}
                style={{ alignSelf: "flex-start", marginTop: "6px" }}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
