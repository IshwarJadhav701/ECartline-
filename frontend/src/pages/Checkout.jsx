import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fetchAddresses, saveAddress, placeOrder, fetchAllProducts } from "../services/api";
import { fallbackProducts, fmt } from "../services/productsData";

export default function Checkout() {
  const { cart, cartCount, clearCart, calculateTotals } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState(fallbackProducts);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);

  // New address form fields
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || "",
    phone: user?.mobile || "",
    street: "",
    city: "",
    state: "",
    pincode: localStorage.getItem("ec_pincode") || "411001"
  });

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout");
      return;
    }
    if (cart.length === 0) {
      navigate("/cart");
      return;
    }
  }, [isAuthenticated, cart.length, navigate]);

  // Load products & addresses
  useEffect(() => {
    (async () => {
      try {
        const prodData = await fetchAllProducts();
        if (prodData && prodData.length) setProducts(prodData);
      } catch {}

      try {
        const addrList = await fetchAddresses();
        if (Array.isArray(addrList) && addrList.length) {
          setAddresses(addrList);
          const def = addrList.find((a) => a.isDefault || a.is_default) || addrList[0];
          if (def) setSelectedAddressId(def.id);
        } else {
          setShowNewAddressForm(true);
        }
      } catch {
        setShowNewAddressForm(true);
      }
    })();
  }, []);

  const totals = calculateTotals(products);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.phone || !newAddr.street || !newAddr.city || !newAddr.state || !newAddr.pincode) {
      showToast("Please fill in all address fields.");
      return;
    }

    try {
      const payload = {
        fullName: newAddr.fullName.trim(),
        full_name: newAddr.fullName.trim(),
        phone: newAddr.phone.trim(),
        street: newAddr.street.trim(),
        city: newAddr.city.trim(),
        state: newAddr.state.trim(),
        pincode: newAddr.pincode.trim(),
        isDefault: true,
        is_default: true
      };
      const saved = await saveAddress(payload);
      const updatedList = await fetchAddresses();
      setAddresses(updatedList);
      setSelectedAddressId(saved?.id || (updatedList.length ? updatedList[0].id : null));
      setShowNewAddressForm(false);
      showToast("✓ Delivery address saved successfully!");
    } catch (err) {
      showToast(err.message || "Failed to save address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && !showNewAddressForm) {
      showToast("Please select or add a delivery address.");
      return;
    }

    const selectedAddr = addresses.find((a) => a.id === selectedAddressId) || newAddr;
    const recipientName = selectedAddr.fullName || selectedAddr.full_name || user?.name || "";
    const recipientPhone = selectedAddr.phone || user?.mobile || "";
    const formattedAddress = [selectedAddr.street, selectedAddr.city, selectedAddr.state, selectedAddr.pincode].filter(Boolean).join(", ");

    if (!selectedAddr.street || !selectedAddr.city) {
      showToast("Please provide a valid delivery address.");
      return;
    }

    setPlacingOrder(true);
    try {
      const orderPayload = {
        addressId: selectedAddr.id || undefined,
        shippingName: recipientName,
        shippingPhone: recipientPhone,
        shippingAddress: formattedAddress,
        paymentMethod: paymentMethod.toLowerCase(),
        items: cart.map((item) => {
          const p = products.find((x) => x.id === item.id);
          return {
            productId: item.id,
            quantity: item.qty,
            price: p ? p.price : 0
          };
        }),
        subtotal: totals.subtotal,
        deliveryFee: totals.delivery,
        totalAmount: totals.total
      };

      await placeOrder(orderPayload);
      await clearCart();
      showToast("🎉 Order placed successfully! Thank you for shopping with ECartline.");
      navigate("/orders");
    } catch (err) {
      showToast(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <main className="container" style={{ margin: "28px auto 60px" }}>
      <h1 className="sec-title" style={{ marginBottom: "24px" }}>
        Secure Checkout
      </h1>

      <div className="checkout-layout">
        {/* Left Column: Multi-Step Flow */}
        <div className="checkout-steps">
          {/* Step 1: Delivery Address */}
          <section className="checkout-step" style={{ background: "#FFFFFF", padding: "24px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", marginBottom: "20px" }}>
            <div className="step-hdr" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span className="step-num" style={{ background: "var(--primary)", color: "#FFFFFF", width: "28px", height: "28px", borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: "800", fontSize: "0.9rem" }}>
                1
              </span>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Select Delivery Address</h2>
            </div>

            {/* Existing Saved Addresses */}
            {addresses.length > 0 && !showNewAddressForm && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "14px",
                      borderRadius: "var(--r-sm)",
                      border: selectedAddressId === addr.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                      background: selectedAddressId === addr.id ? "var(--primary-light)" : "#FFFFFF",
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="radio"
                      name="delivery_address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      style={{ marginTop: "3px" }}
                    />
                    <div style={{ fontSize: "0.92rem", lineHeight: "1.5" }}>
                      <b>{addr.fullName || addr.full_name}</b> • <span>{addr.phone}</span>
                      <p style={{ margin: "4px 0 0", color: "var(--text-body)" }}>
                        {addr.street}, {addr.city}, {addr.state} - <b>{addr.pincode}</b>
                      </p>
                      {(addr.isDefault || addr.is_default) && (
                        <span style={{ display: "inline-block", marginTop: "4px", fontSize: "0.72rem", background: "#E2E8F0", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                          DEFAULT
                        </span>
                      )}
                    </div>
                  </label>
                ))}

                <button
                  type="button"
                  className="btn line"
                  style={{ alignSelf: "flex-start", marginTop: "8px" }}
                  onClick={() => setShowNewAddressForm(true)}
                >
                  + Add New Address
                </button>
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleSaveAddress} style={{ marginTop: "12px" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>Add New Delivery Address</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>
                      10-Digit Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>
                    Flat, House no., Building, Street *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>
                      City / District *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pune"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maharashtra"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 411001"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" className="btn">
                    Save & Use Address
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      className="btn line"
                      onClick={() => setShowNewAddressForm(false)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* Step 2: Payment Method */}
          <section className="checkout-step" style={{ background: "#FFFFFF", padding: "24px", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
            <div className="step-hdr" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span className="step-num" style={{ background: "var(--primary)", color: "#FFFFFF", width: "28px", height: "28px", borderRadius: "50%", display: "grid", placeItems: "center", fontWeight: "800", fontSize: "0.9rem" }}>
                2
              </span>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Select Payment Method</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px",
                  borderRadius: "var(--r-sm)",
                  border: paymentMethod === "COD" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: paymentMethod === "COD" ? "var(--primary-light)" : "#FFFFFF",
                  cursor: "pointer"
                }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <div>
                  <b>Cash on Delivery (COD)</b>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>Pay digitally or cash when your order arrives at your doorstep.</p>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px",
                  borderRadius: "var(--r-sm)",
                  border: paymentMethod === "UPI" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: paymentMethod === "UPI" ? "var(--primary-light)" : "#FFFFFF",
                  cursor: "pointer"
                }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={() => setPaymentMethod("UPI")}
                />
                <div>
                  <b>UPI / QR Code (Instant)</b>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>Google Pay, PhonePe, Paytm, BHIM UPI.</p>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px",
                  borderRadius: "var(--r-sm)",
                  border: paymentMethod === "Card" ? "2px solid var(--primary)" : "1px solid var(--border)",
                  background: paymentMethod === "Card" ? "var(--primary-light)" : "#FFFFFF",
                  cursor: "pointer"
                }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="Card"
                  checked={paymentMethod === "Card"}
                  onChange={() => setPaymentMethod("Card")}
                />
                <div>
                  <b>Credit / Debit Card</b>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>Visa, Mastercard, RuPay, Maestro.</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Price Review */}
        <div className="checkout-summary" style={{ position: "sticky", top: "90px" }}>
          <div style={{ background: "#FFFFFF", padding: "20px", borderRadius: "var(--r-md)", border: "1px solid var(--border)", boxShadow: "var(--sh-sm)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "16px", textTransform: "uppercase" }}>
              Order Summary
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.92rem", color: "var(--text-body)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Items Subtotal ({cartCount})</span>
                <span>{fmt(totals.subtotal)}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--discount-green)", fontWeight: "600" }}>
                <span>Discount Savings</span>
                <span>− {fmt(totals.discount)}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Delivery Charges</span>
                <span>
                  {totals.delivery === 0 ? (
                    <b style={{ color: "var(--discount-green)" }}>FREE</b>
                  ) : (
                    fmt(totals.delivery)
                  )}
                </span>
              </div>

              <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "8px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)" }}>
                <span>Total Amount</span>
                <span>{fmt(totals.total)}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn alt"
              disabled={placingOrder}
              style={{ width: "100%", marginTop: "20px", padding: "14px", fontSize: "1.05rem" }}
              onClick={handlePlaceOrder}
            >
              {placingOrder ? "Placing Order..." : "Confirm & Place Order →"}
            </button>

            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              🔒 100% Safe and Secure Order Processing
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
