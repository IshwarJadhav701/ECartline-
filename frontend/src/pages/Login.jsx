import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { loginApi } from "../services/api";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk = (v) => /^[6-9]\d{9}$/.test(v);

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const { showToast } = useToast();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fillAdmin = () => {
    setId("admin@ecartline.in");
    setPassword("Admin@12345");
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    const trimmedId = id.trim();
    if (!trimmedId) {
      errs.id = "Email or mobile is required";
    } else if (!emailOk(trimmedId) && !phoneOk(trimmedId)) {
      errs.id = "Enter a valid email or 10-digit mobile";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await loginApi({
        id: id.trim(),
        password: password,
      });

      loginUser(res.token, res.user);
      showToast(`✓ Welcome back, ${res.user.name}`, "success");

      const redirect = searchParams.get("redirect");
      setTimeout(() => {
        if (redirect) {
          navigate(redirect.startsWith("/") ? redirect : `/${redirect}`);
        } else if (res.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 500);
    } catch (err) {
      showToast(err.message || "Login failed", "error");
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h1>Login</h1>

        <div className={`field ${errors.id ? "bad" : ""}`}>
          <label htmlFor="id">Email / Mobile</label>
          <input
            id="id"
            name="id"
            autoComplete="username"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              if (errors.id) setErrors({ ...errors, id: null });
            }}
          />
          <span className="err">{errors.id || ""}</span>
        </div>

        <div className={`field ${errors.password ? "bad" : ""}`}>
          <label htmlFor="pw">Password</label>
          <input
            id="pw"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
          />
          <span className="err">{errors.password || ""}</span>
        </div>

        <div className="between">
          <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />{" "}
            Remember me
          </label>
          <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact store support or an administrator to reset your password."); }}>
            Forgot password?
          </a>
        </div>

        <button className="btn" type="submit" disabled={loading} style={{ width: "100%", marginTop: "12px" }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ marginTop: "14px", textAlign: "center" }}>
          Don't have an account?{" "}
          <Link to={searchParams.get("redirect") ? `/register?redirect=${encodeURIComponent(searchParams.get("redirect"))}` : "/register"}>
            Create Account
          </Link>
        </p>

        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "#F8FAFC",
            border: "1px dashed var(--border)",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "0.85rem",
          }}
        >
          <span style={{ color: "var(--muted)" }}>Store Admin Demo?</span>
          <button
            type="button"
            onClick={fillAdmin}
            style={{
              marginLeft: "6px",
              background: "none",
              border: "none",
              color: "var(--primary)",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            ⚡ Fill Admin Login
          </button>
        </div>
      </form>
    </main>
  );
}
