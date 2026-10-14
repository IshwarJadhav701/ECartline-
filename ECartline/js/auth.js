/* ===== Form validation (login, register, contact) ===== */
const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk = v => /^[6-9]\d{9}$/.test(v);

function setErr(input, msg) {
  const f = input.closest(".field");
  if (!f) return !msg;
  f.classList.toggle("bad", !!msg);
  const errEl = f.querySelector(".err");
  if (errEl) errEl.textContent = msg || "";
  return !msg;
}

function bindForm(id, rules, onOk) {
  const form = document.getElementById(id);
  if (!form) return;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    let ok = true;
    for (const [name, check] of Object.entries(rules)) {
      const inp = form.elements[name];
      if (inp) ok = setErr(inp, check(inp.value.trim(), form)) && ok;
    }
    if (ok) await onOk(form);
  });
}

// Login
bindForm("login-form", {
  id: v => v ? (emailOk(v) || phoneOk(v) ? "" : "Enter a valid email or 10-digit mobile") : "Email or mobile is required",
  password: v => v ? (v.length < 6 ? "Password must be at least 6 characters" : "") : "Password is required"
}, async f => {
  const btn = f.querySelector("button");
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Logging in...";
  try {
    const j = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { id: f.elements.id.value.trim(), password: f.elements.password.value }
    });
    saveSession(j.token, j.user);
    await mergeGuestCart();
    await mergeGuestWishlist();

    showToast("✓ Welcome back, " + j.user.name);
    const redirectUrl = new URLSearchParams(location.search).get("redirect");
    setTimeout(() => {
      location.href = redirectUrl || (j.user.role === "admin" ? "admin.html" : "index.html");
    }, 800);
  } catch (e) {
    showToast(e.message);
    btn.disabled = false;
    btn.textContent = origText;
  }
});

// Register
bindForm("register-form", {
  name: v => v.length < 3 ? "Enter your full name" : "",
  email: v => emailOk(v) ? "" : "Enter a valid email address",
  mobile: v => phoneOk(v) ? "" : "Enter a valid 10-digit mobile number",
  password: v => v.length < 6 ? "Password must be at least 6 characters" : "",
  confirm: (v, f) => v !== f.elements.password.value ? "Passwords do not match" : ""
}, async f => {
  const btn = f.querySelector("button");
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Creating Account...";
  try {
    await apiFetch("/api/auth/register", {
      method: "POST",
      body: {
        name: f.elements.name.value.trim(),
        email: f.elements.email.value.trim(),
        mobile: f.elements.mobile.value.trim(),
        password: f.elements.password.value
      }
    });
    showToast("✓ Account created successfully! Please log in.");
    const redirectUrl = new URLSearchParams(location.search).get("redirect");
    setTimeout(() => {
      location.href = redirectUrl ? `login.html?redirect=${encodeURIComponent(redirectUrl)}` : "login.html";
    }, 1000);
  } catch (e) {
    if (e.field && f.elements[e.field]) setErr(f.elements[e.field], e.message);
    showToast(e.message);
    btn.disabled = false;
    btn.textContent = origText;
  }
});

// Contact
bindForm("contact-form", {
  name: v => v ? "" : "Name is required",
  email: v => emailOk(v) ? "" : "Enter a valid email",
  phone: v => v ? (phoneOk(v) ? "" : "Enter a valid 10-digit phone") : "",
  message: v => v.length >= 8 ? "" : "Message must be at least 8 characters"
}, async f => {
  const btn = f.querySelector("button");
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Sending...";
  try {
    const res = await submitContactMessage({
      name: f.elements.name.value.trim(),
      email: f.elements.email.value.trim(),
      phone: f.elements.phone?.value.trim() || null,
      message: f.elements.message.value.trim()
    });
    f.reset();
    showToast("✓ " + (res.message || "Message sent successfully!"));
  } catch (e) {
    showToast(e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = origText;
  }
});
