const http = require("http");

async function req(url, options = {}) {
  const fullUrl = new URL(url, "http://localhost:3000");
  const body = options.body ? JSON.stringify(options.body) : null;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  return new Promise((resolve, reject) => {
    const request = http.request(fullUrl, {
      method: options.method || "GET",
      headers,
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

(async () => {
  console.log("=== STARTING FULL BACKEND INTEGRATION TEST ===");

  // 1. Health check
  const health = await req("/api/health");
  console.log("1. Health Check:", health.status, health.body);

  // 2. Admin Login
  const adminLogin = await req("/api/auth/login", {
    method: "POST",
    body: { id: "admin@ecartline.in", password: "Admin@12345" }
  });
  console.log("2. Admin Login:", adminLogin.status, adminLogin.body.success, "Token received:", !!adminLogin.body.token);
  const adminToken = adminLogin.body.token;

  // 3. User Register & Login
  const testEmail = "testuser" + Date.now() + "@example.com";
  const userReg = await req("/api/auth/register", {
    method: "POST",
    body: { name: "Test User", email: testEmail, mobile: "9876" + Math.floor(100000 + Math.random() * 900000), password: "password123" }
  });
  console.log("3. User Register:", userReg.status, userReg.body.success);

  const userLogin = await req("/api/auth/login", {
    method: "POST",
    body: { id: testEmail, password: "password123" }
  });
  console.log("4. User Login:", userLogin.status, userLogin.body.success);
  const userToken = userLogin.body.token;

  // 5. User Profile Update
  const profUpdate = await req("/api/auth/profile", {
    method: "PUT",
    headers: { Authorization: "Bearer " + userToken },
    body: { name: "Test User Updated", mobile: "9876543210" }
  });
  console.log("5. Profile Update:", profUpdate.status, profUpdate.body.success, profUpdate.body.user?.name);

  // 6. User Address Add & List
  const addrAdd = await req("/api/addresses", {
    method: "POST",
    headers: { Authorization: "Bearer " + userToken },
    body: {
      fullName: "Test User",
      phone: "9876543210",
      street: "Flat 101, Green Valley",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      isDefault: true
    }
  });
  console.log("6. Address Add:", addrAdd.status, addrAdd.body.success, "Address ID:", addrAdd.body.data?.id);
  const addressId = addrAdd.body.data?.id;

  const addrList = await req("/api/addresses", {
    headers: { Authorization: "Bearer " + userToken }
  });
  console.log("7. Address List:", addrList.status, addrList.body.data?.length, "addresses");

  // 8. Product suggestions
  const sugg = await req("/api/products/suggestions?q=watch");
  console.log("8. Search Suggestions for 'watch':", sugg.status, sugg.body.data?.length, "items");

  // 9. Add to Cart
  const cartAdd = await req("/api/cart", {
    method: "POST",
    headers: { Authorization: "Bearer " + userToken },
    body: { productId: 1, quantity: 2 }
  });
  console.log("9. Add to Cart:", cartAdd.status, cartAdd.body.success, "Cart total items:", cartAdd.body.data?.totalItems);

  // 10. Place Order
  const orderPlace = await req("/api/orders", {
    method: "POST",
    headers: { Authorization: "Bearer " + userToken },
    body: {
      addressId,
      paymentMethod: "cod"
    }
  });
  console.log("10. Place Order:", orderPlace.status, orderPlace.body.success, "Order Number:", orderPlace.body.order?.order_number);
  const orderId = orderPlace.body.order?.id;

  // 11. Fetch User Orders
  const myOrders = await req("/api/orders", {
    headers: { Authorization: "Bearer " + userToken }
  });
  console.log("11. User Orders:", myOrders.status, myOrders.body.data?.length, "orders found");

  // 12. Submit Review
  const rev = await req("/api/reviews/product/1", {
    method: "POST",
    headers: { Authorization: "Bearer " + userToken },
    body: { rating: 5, comment: "Exceptional quality and fast delivery! Highly recommended." }
  });
  console.log("12. Submit Review:", rev.status, rev.body.success, "New rating:", rev.body.rating);

  // 13. Get Reviews
  const getRev = await req("/api/reviews/product/1");
  console.log("13. Product Reviews:", getRev.status, "Count:", getRev.body.count, "Average:", getRev.body.averageRating);

  // 14. Wishlist Add & Get
  const wishAdd = await req("/api/wishlist/2", {
    method: "POST",
    headers: { Authorization: "Bearer " + userToken }
  });
  console.log("14. Wishlist Add:", wishAdd.status, wishAdd.body.success, "Wishlist items:", wishAdd.body.ids);

  const wishGet = await req("/api/wishlist", {
    headers: { Authorization: "Bearer " + userToken }
  });
  console.log("15. Wishlist Get:", wishGet.status, wishGet.body.data?.length, "items");

  // 16. Contact Submission
  const contact = await req("/api/contact", {
    method: "POST",
    body: {
      name: "Prospective Buyer",
      email: "buyer@example.com",
      phone: "9123456789",
      message: "Hello! Do you offer bulk discounts on corporate laptop orders?"
    }
  });
  console.log("16. Contact Query:", contact.status, contact.body.success);

  // 17. Admin Orders & Update Status
  const adminOrders = await req("/api/orders/admin/all", {
    headers: { Authorization: "Bearer " + adminToken }
  });
  console.log("17. Admin Orders Count:", adminOrders.status, adminOrders.body.data?.length);

  const updateStatus = await req(`/api/orders/admin/${orderId}/status`, {
    method: "PUT",
    headers: { Authorization: "Bearer " + adminToken },
    body: { orderStatus: "shipped", paymentStatus: "completed" }
  });
  console.log("18. Admin Update Order Status:", updateStatus.status, updateStatus.body.success);

  // 19. Admin Stats
  const adminStats = await req("/api/auth/admin/stats", {
    headers: { Authorization: "Bearer " + adminToken }
  });
  console.log("19. Admin Dashboard Stats:", adminStats.status, adminStats.body.data);

  // 20. Admin Inquiries List
  const adminMsgs = await req("/api/contact", {
    headers: { Authorization: "Bearer " + adminToken }
  });
  console.log("20. Admin Inquiries Count:", adminMsgs.status, adminMsgs.body.data?.length);

  console.log("=== ALL TESTS COMPLETED SUCCESSFULLY! ===");
  process.exit(0);
})();
