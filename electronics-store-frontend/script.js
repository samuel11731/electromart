// 👇 Entire code remains the same, only showAdminOrders() is updated

// (Same declarations and setup)
let cart = [];
let selectedProduct = null;
let currentUser = null;
let isAdmin = false;

window.onload = async () => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  isAdmin = localStorage.getItem("isAdmin") === "true";

  if (token && username) {
    currentUser = { username };
    document.getElementById("loginBtn").textContent = `Logged in as ${username}`;
    document.getElementById("logoutBtn").style.display = "inline-block";
    document.getElementById("myOrdersBtn").style.display = "inline-block";
    if (isAdmin) {
      document.getElementById("adminBtn").style.display = "inline-block";
    }
  }

  // Event listeners
  document.getElementById("loginBtn").addEventListener("click", () => showLogin());
  document.getElementById("logoutBtn").addEventListener("click", logoutUser);
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("signupForm").addEventListener("submit", handleSignup);
  document.getElementById("myOrdersBtn").addEventListener("click", showMyOrders);
  document.getElementById("adminBtn").addEventListener("click", showAdminOrders);
  document.getElementById("searchBar").addEventListener("input", handleSearch);
  document.getElementById("closeModal").onclick = () => {
    document.getElementById("productModal").style.display = "none";
  };

  try {
    const res = await fetch("https://electromart-backend-hgrv.onrender.com/api/products");
    const products = await res.json();
    products.forEach(renderProductCard);
  } catch (err) {
    document.getElementById("productGrid").innerHTML = "<p>Failed to load products.</p>";
  }
};

function renderProductCard(product) {
  const productGrid = document.getElementById("productGrid");
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" />
    <h3>${product.name}</h3>
    <p>$${product.price}</p>
    <button>View</button>
  `;
  card.querySelector("button").onclick = () => {
    selectedProduct = product;
    document.getElementById("modalImage").src = product.image;
    document.getElementById("modalName").textContent = product.name;
    document.getElementById("modalDescription").textContent = product.description;
    document.getElementById("modalPrice").textContent = product.price;
    document.getElementById("productModal").style.display = "flex";
  };
  productGrid.appendChild(card);
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll(".product-card").forEach(card => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = name.includes(query) ? "block" : "none";
  });
}

function addToCartFromModal() {
  if (!localStorage.getItem("token")) return showLogin("Please log in first.");
  if (selectedProduct) {
    cart.push({ ...selectedProduct, quantity: 1 });
    document.getElementById("cartCount").textContent = cart.length;
    alert(`${selectedProduct.name} added to cart!`);
  }
}

function showCart() {
  if (!localStorage.getItem("token")) return showLogin("Please log in to view cart.");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  cartItems.innerHTML = "";
  let total = 0;
  if (cart.length === 0) {
    cartItems.innerHTML = "<li>Your cart is empty.</li>";
  } else {
    cart.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - $${item.price}`;
      cartItems.appendChild(li);
      total += item.price;
    });
  }
  cartTotal.textContent = total.toFixed(2);
  document.getElementById("cartModal").style.display = "flex";
}

function closeCart() {
  document.getElementById("cartModal").style.display = "none";
}

async function checkoutCart() {
  const token = localStorage.getItem("token");
  if (!token) return showLogin("Please log in to checkout.");
  if (cart.length === 0) return alert("Your cart is empty.");

  const total = cart.reduce((sum, i) => sum + i.price, 0);
  try {
    const res = await fetch("https://electromart-backend-hgrv.onrender.com/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart.map(i => ({
          productId: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity || 1
        })),
        totalAmount: total
      })
    });

    if (res.ok) {
      alert("✅ Order placed!");
      cart = [];
      document.getElementById("cartCount").textContent = "0";
      document.getElementById("cartItems").innerHTML = "";
      document.getElementById("cartTotal").textContent = "0.00";
      document.getElementById("cartModal").style.display = "none";
      document.getElementById("thankYouModal").style.display = "flex";
    } else {
      alert("Failed to place order.");
    }
  } catch {
    alert("Server error during checkout.");
  }
}

function closeThankYou() {
  document.getElementById("thankYouModal").style.display = "none";
}

function showLogin(error = "") {
  document.getElementById("loginModal").style.display = "flex";
  document.getElementById("loginStatus").textContent = error;
}

function closeLogin() {
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("loginStatus").textContent = "";
}

function closeSignup() {
  document.getElementById("signupModal").style.display = "none";
  document.getElementById("signupStatus").textContent = "";
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const statusText = document.getElementById("loginStatus");

  try {
    const res = await fetch("https://electromart-backend-hgrv.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("isAdmin", data.user.isAdmin);
      isAdmin = data.user.isAdmin;

      document.getElementById("loginBtn").textContent = `Logged in as ${data.user.username}`;
      document.getElementById("logoutBtn").style.display = "inline-block";
      document.getElementById("myOrdersBtn").style.display = "inline-block";
      if (data.user.isAdmin) {
        document.getElementById("adminBtn").style.display = "inline-block";
      }
      statusText.style.color = "green";
      statusText.textContent = "Login successful!";
      setTimeout(() => closeLogin(), 1000);
    } else {
      statusText.textContent = data.message || "Login failed.";
    }
  } catch {
    statusText.textContent = "Server error.";
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const statusText = document.getElementById("signupStatus");

  try {
    const res = await fetch("https://electromart-backend-hgrv.onrender.com/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      localStorage.setItem("isAdmin", false);
      document.getElementById("loginBtn").textContent = `Logged in as ${username}`;
      document.getElementById("logoutBtn").style.display = "inline-block";
      document.getElementById("myOrdersBtn").style.display = "inline-block";
      document.getElementById("adminBtn").style.display = "none";
      statusText.style.color = "green";
      statusText.textContent = "Signup successful!";
      setTimeout(() => closeSignup(), 1000);
    } else {
      statusText.textContent = data.message || "Signup failed.";
    }
  } catch {
    statusText.textContent = "Server error.";
  }
}

async function showMyOrders() {
  const token = localStorage.getItem("token");
  if (!token) return showLogin("Please log in to view your orders.");
  const list = document.getElementById("orderList");
  list.innerHTML = "Loading...";
  document.getElementById("ordersModal").style.display = "flex";

  try {
    const res = await fetch("https://electromart-backend-hgrv.onrender.com/api/orders", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const orders = await res.json();
    list.innerHTML = "";
    if (orders.length === 0) list.innerHTML = "<li>No past orders.</li>";
    else orders.forEach(order => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${new Date(order.createdAt).toLocaleString()}</strong><br>$${order.totalAmount} – ${order.items.map(i => i.name).join(", ")}`;
      list.appendChild(li);
    });
  } catch {
    list.innerHTML = "<li>Error fetching orders.</li>";
  }
}

async function showAdminOrders() {
  const token = localStorage.getItem("token");
  if (!token) return alert("Login as admin required");

  const adminOrderList = document.getElementById("adminOrderList");
  adminOrderList.innerHTML = "<li>Loading admin orders...</li>";
  document.getElementById("adminOrdersModal").style.display = "flex";

  try {
    const res = await fetch("https://electromart-backend-hgrv.onrender.com/api/orders/admin", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      adminOrderList.innerHTML = data.map(order => `
        <li>
          <strong>${new Date(order.createdAt).toLocaleString()}</strong><br/>
          User: ${order.user?.username || "N/A"}<br/>
          Email: ${order.user?.email || "N/A"}<br/>
          Total: $${order.totalAmount}<br/>
          Items: ${order.items.map(i => i.name).join(", ")}
        </li>
      `).join("");
    } else {
      adminOrderList.innerHTML = "<li>No admin orders found.</li>";
    }
  } catch (err) {
    adminOrderList.innerHTML = "<li>Failed to load admin orders.</li>";
  }
}

function closeAdminOrders() {
  document.getElementById("adminOrdersModal").style.display = "none";
}

function closeOrdersModal() {
  document.getElementById("ordersModal").style.display = "none";
}

function closeAdminOrdersModal() {
  document.getElementById("adminOrdersModal").style.display = "none";
}

function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("isAdmin");
  document.getElementById("loginBtn").textContent = "Login";
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("myOrdersBtn").style.display = "none";
  document.getElementById("adminBtn").style.display = "none";
  alert("You have been logged out.");
}