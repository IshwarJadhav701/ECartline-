import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  updateProfile,
  fetchAddresses,
  saveAddress,
  setDefaultAddress,
  deleteAddress,
  changePassword,
} from "../services/api";

export default function Profile() {
  const { user, loginUser, logoutUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("info");

  // Profile Form state
  const [profileName, setProfileName] = useState("");
  const [profileMobile, setProfileMobile] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrForm, setAddrForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Password Form state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=profile");
      return;
    }
    setProfileName(user.name || "");
    setProfileMobile(user.mobile || "");
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const list = await fetchAddresses();
      setAddresses(Array.isArray(list) ? list : []);
    } catch {
      // non-critical error display handled in render
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile({
        name: profileName.trim(),
        mobile: profileMobile.trim(),
      });
      if (res && res.user) {
        loginUser(res.token || localStorage.getItem("ec_token"), res.user);
      }
      showToast("✓ Profile updated successfully", "success");
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      await saveAddress({
        fullName: addrForm.fullName.trim(),
        phone: addrForm.phone.trim(),
        street: addrForm.street.trim(),
        city: addrForm.city.trim(),
        state: addrForm.state.trim(),
        pincode: addrForm.pincode.trim(),
        isDefault: false,
      });
      showToast("✓ Address added", "success");
      setAddrForm({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
      });
      setShowAddressForm(false);
      loadAddresses();
    } catch (err) {
      showToast(err.message || "Failed to add address", "error");
    }
  };

  const handleMakeDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      showToast("✓ Default address updated", "success");
      loadAddresses();
    } catch (err) {
      showToast(err.message || "Failed to update default address", "error");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id);
      showToast("Address deleted", "success");
      loadAddresses();
    } catch (err) {
      showToast(err.message || "Failed to delete address", "error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    if (passwords.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setChangingPass(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      showToast("✓ Password changed successfully!", "success");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showToast(err.message || "Failed to change password", "error");
    } finally {
      setChangingPass(false);
    }
  };

  if (!user) return null;

  const initials = (user.name || "EC")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="container">
      <div className="profile-layout" style={{ margin: "30px 0 60px" }}>
        {/* Left Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-card">
            <div className="avatar-circle">{initials}</div>
            <h2>{user.name}</h2>
            <small>{user.email}</small>
          </div>

          <nav className="profile-nav">
            <button
              className={`p-nav-link ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              👤 Personal Info
            </button>
            <button
              className={`p-nav-link ${activeTab === "addresses" ? "active" : ""}`}
              onClick={() => setActiveTab("addresses")}
            >
              📍 Saved Addresses
            </button>
            <button
              className={`p-nav-link ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              🔒 Password & Security
            </button>
            <Link className="p-nav-link" to="/orders">
              📦 My Orders
            </Link>
            <Link className="p-nav-link" to="/wishlist">
              ♥ My Wishlist
            </Link>
            <button
              className="p-nav-link logout-nav"
              onClick={() => {
                logoutUser();
                showToast("Logged out successfully");
                navigate("/");
              }}
            >
              🚪 Sign Out
            </button>
          </nav>
        </aside>

        {/* Right Content Panels */}
        <section className="profile-content">
          {/* Tab 1: Personal Info */}
          {activeTab === "info" && (
            <div className="p-panel active">
              <h2>Personal Information</h2>
              <form
                className="form-card"
                style={{ maxWidth: "100%", margin: "20px 0", boxShadow: "none" }}
                onSubmit={handleUpdateProfile}
              >
                <div className="field">
                  <label htmlFor="p-name">Full Name</label>
                  <input
                    id="p-name"
                    name="name"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="p-email">Email Address (Registered)</label>
                  <input
                    id="p-email"
                    name="email"
                    disabled
                    value={user.email}
                    style={{ background: "var(--light-bg)", cursor: "not-allowed" }}
                  />
                  <small style={{ color: "var(--muted)" }}>Email cannot be changed once verified.</small>
                </div>
                <div className="field">
                  <label htmlFor="p-mobile">Mobile Number</label>
                  <input
                    id="p-mobile"
                    name="mobile"
                    maxLength={10}
                    inputMode="numeric"
                    value={profileMobile}
                    onChange={(e) => setProfileMobile(e.target.value)}
                  />
                </div>
                <button
                  className="btn"
                  type="submit"
                  disabled={savingProfile}
                  style={{ alignSelf: "flex-start" }}
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Saved Addresses */}
          {activeTab === "addresses" && (
            <div className="p-panel active">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <h2>Saved Delivery Addresses</h2>
                <button
                  className="btn"
                  onClick={() => setShowAddressForm((prev) => !prev)}
                >
                  {showAddressForm ? "✕ Close Form" : "+ Add New Address"}
                </button>
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <form
                  className="form-card"
                  style={{ maxWidth: "100%", margin: "24px 0", boxShadow: "none", borderColor: "var(--primary)" }}
                  onSubmit={handleSaveAddress}
                >
                  <h3>Add Delivery Address</h3>
                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="pa-name">Recipient Name *</label>
                      <input
                        id="pa-name"
                        required
                        placeholder="Full Name"
                        value={addrForm.fullName}
                        onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="pa-phone">Mobile Number *</label>
                      <input
                        id="pa-phone"
                        maxLength={10}
                        inputMode="numeric"
                        required
                        placeholder="10-digit mobile"
                        value={addrForm.phone}
                        onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="pa-street">Street / House / Colony *</label>
                    <input
                      id="pa-street"
                      required
                      placeholder="Complete address"
                      value={addrForm.street}
                      onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                    />
                  </div>
                  <div className="field-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <div className="field">
                      <label htmlFor="pa-city">City *</label>
                      <input
                        id="pa-city"
                        required
                        placeholder="City"
                        value={addrForm.city}
                        onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="pa-state">State *</label>
                      <input
                        id="pa-state"
                        required
                        placeholder="State"
                        value={addrForm.state}
                        onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="pa-pin">Pincode *</label>
                      <input
                        id="pa-pin"
                        maxLength={6}
                        inputMode="numeric"
                        required
                        placeholder="Pincode"
                        value={addrForm.pincode}
                        onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                    <button type="submit" className="btn">
                      Save Address
                    </button>
                    <button
                      type="button"
                      className="btn line"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="addresses-grid" style={{ marginTop: "20px" }}>
                {loadingAddresses ? (
                  <div className="skel" style={{ height: "120px" }} />
                ) : addresses.length === 0 ? (
                  <p style={{ color: "var(--muted)", gridColumn: "1/-1" }}>
                    No addresses saved yet. Click "+ Add New Address" above to add one.
                  </p>
                ) : (
                  addresses.map((a) => (
                    <div key={a.id} className="addr-card">
                      <div className="addr-details">
                        <b>
                          {a.full_name}{" "}
                          {a.is_default ? (
                            <span className="badge" style={{ position: "static", fontSize: "0.7rem", padding: "2px 7px" }}>
                              DEFAULT
                            </span>
                          ) : null}
                        </b>
                        <p>{a.street}, {a.city}, {a.state} - {a.pincode}</p>
                        <small>📞 Phone: {a.phone}</small>
                        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                          {!a.is_default && (
                            <button
                              className="btn line"
                              style={{ minHeight: "34px", padding: "0 10px", fontSize: "0.8rem" }}
                              onClick={() => handleMakeDefault(a.id)}
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            className="btn line"
                            style={{ minHeight: "34px", padding: "0 10px", fontSize: "0.8rem", color: "#c00", borderColor: "#c00" }}
                            onClick={() => handleDeleteAddress(a.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Security */}
          {activeTab === "security" && (
            <div className="p-panel active">
              <h2>Change Password</h2>
              <form
                className="form-card"
                style={{ maxWidth: "480px", margin: "20px 0", boxShadow: "none" }}
                onSubmit={handleChangePassword}
              >
                <div className="field">
                  <label htmlFor="cp-cur">Current Password</label>
                  <input
                    id="cp-cur"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="cp-new">New Password (at least 6 characters)</label>
                  <input
                    id="cp-new"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="cp-conf">Confirm New Password</label>
                  <input
                    id="cp-conf"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  />
                </div>
                <button
                  className="btn"
                  type="submit"
                  disabled={changingPass}
                  style={{ width: "100%" }}
                >
                  {changingPass ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
