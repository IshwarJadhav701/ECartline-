import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { registerApi } from "../services/api";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk = (v) => /^[6-9]\d{9}$/.test(v);

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = "Enter your full name";
    }
    if (!emailOk(formData.email.trim())) {
      errs.email = "Enter a valid email address";
    }
    if (!phoneOk(formData.mobile.trim())) {
      errs.mobile = "Enter a valid 10-digit mobile number";
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (formData.confirm !== formData.password) {
      errs.confirm = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await registerApi({
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        password: formData.password,
      });

      showToast("✓ Account created successfully! Please log in.", "success");
      const redirect = searchParams.get("redirect");
      setTimeout(() => {
        navigate(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login");
      }, 1000);
    } catch (err) {
      if (err.field) {
        setErrors((prev) => ({ ...prev, [err.field]: err.message }));
      }
      showToast(err.message || "Registration failed", "error");
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h1>Create Account</h1>

        <div className={`field ${errors.name ? "bad" : ""}`}>
          <label htmlFor="n">Full Name</label>
          <input
            id="n"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
          <span className="err">{errors.name || ""}</span>
        </div>

        <div className={`field ${errors.email ? "bad" : ""}`}>
          <label htmlFor="e">Email</label>
          <input
            id="e"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
          <span className="err">{errors.email || ""}</span>
        </div>

        <div className={`field ${errors.mobile ? "bad" : ""}`}>
          <label htmlFor="m">Mobile</label>
          <input
            id="m"
            name="mobile"
            inputMode="numeric"
            maxLength={10}
            value={formData.mobile}
            onChange={handleChange}
            placeholder="9876543210"
          />
          <span className="err">{errors.mobile || ""}</span>
        </div>

        <div className={`field ${errors.password ? "bad" : ""}`}>
          <label htmlFor="p">Password</label>
          <input
            id="p"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
          />
          <span className="err">{errors.password || ""}</span>
        </div>

        <div className={`field ${errors.confirm ? "bad" : ""}`}>
          <label htmlFor="c">Confirm Password</label>
          <input
            id="c"
            name="confirm"
            type="password"
            value={formData.confirm}
            onChange={handleChange}
            placeholder="Repeat your password"
          />
          <span className="err">{errors.confirm || ""}</span>
        </div>

        <button className="btn" type="submit" disabled={loading} style={{ width: "100%", marginTop: "12px" }}>
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p style={{ marginTop: "14px", textAlign: "center" }}>
          Already registered?{" "}
          <Link to={searchParams.get("redirect") ? `/login?redirect=${encodeURIComponent(searchParams.get("redirect"))}` : "/login"}>
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
