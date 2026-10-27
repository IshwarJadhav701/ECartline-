import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import { submitContactMessage } from "../services/api";

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk = (v) => /^[6-9]\d{9}$/.test(v);

export default function Contact() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Name is required";
    }
    if (!emailOk(formData.email.trim())) {
      errs.email = "Enter a valid email";
    }
    if (formData.phone.trim() && !phoneOk(formData.phone.trim())) {
      errs.phone = "Enter a valid 10-digit phone";
    }
    if (!formData.message.trim() || formData.message.trim().length < 8) {
      errs.message = "Message must be at least 8 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
      });
      showToast("✓ Message sent successfully! We will get back to you shortly.", "success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      showToast(err.message || "Failed to send message", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container">
      <div style={{ margin: "36px 0 60px" }}>
        <div className="cols" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start", gap: "40px" }}>
          <div>
            <h1 style={{ marginBottom: "16px" }}>Contact Us</h1>
            <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
              Have questions about your order, products, or feedback? Send us a message and our team will get in touch with you.
            </p>
            <div style={{ lineHeight: "2.2", fontSize: "1.05rem" }}>
              <p>📧 <b>Email:</b> support@ecartline.in</p>
              <p>📞 <b>Toll-Free:</b> 1800-000-0000</p>
              <p>📍 <b>Address:</b> Pune, Maharashtra, India</p>
              <p>🕘 <b>Operating Hours:</b> Mon–Sat, 9:00 AM – 8:00 PM</p>
            </div>
          </div>

          <form id="contact-form" onSubmit={handleSubmit} noValidate className="form-card" style={{ maxWidth: "100%", margin: 0 }}>
            <div className={`field ${errors.name ? "bad" : ""}`}>
              <label htmlFor="a">Name *</label>
              <input
                id="a"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
              <span className="err">{errors.name || ""}</span>
            </div>

            <div className={`field ${errors.email ? "bad" : ""}`}>
              <label htmlFor="b">Email *</label>
              <input
                id="b"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
              />
              <span className="err">{errors.email || ""}</span>
            </div>

            <div className={`field ${errors.phone ? "bad" : ""}`}>
              <label htmlFor="c2">Phone (Optional)</label>
              <input
                id="c2"
                name="phone"
                maxLength={10}
                inputMode="numeric"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
              />
              <span className="err">{errors.phone || ""}</span>
            </div>

            <div className={`field ${errors.message ? "bad" : ""}`}>
              <label htmlFor="d">Message *</label>
              <textarea
                id="d"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you today?"
              />
              <span className="err">{errors.message || ""}</span>
            </div>

            <button className="btn" type="submit" disabled={submitting} style={{ marginTop: "8px" }}>
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
