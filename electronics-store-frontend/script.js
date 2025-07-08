let cart = [];
let selectedProduct = null;
let currentUser = null;

window.onload = async () => {
  const productGrid = document.getElementById("productGrid");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (token && username) {
    currentUser = { username };
    document.getElementById("loginBtn").textContent = `Logged in as ${username}`;
    document.getElementById("logoutBtn").style.display = "inline-block";
    document.getElementById("myOrdersBtn").style.display = "inline-block";
  }

  // ✅ Attach event listeners after DOM is ready
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("signupForm").addEventListener("submit", handleSignup);
  document.getElementById("myOrdersBtn").addEventListener("click", showMyOrders);
  document.getElementById("searchBar").addEventListener("input", handleSearch);
  document.getElementById("closeModal").onclick = () => {
    document.getElementById("productModal").style.display = "none";
  };

  // ✅ Load and display products
  try {
    const response = await fetch("https://electromart-backend-hgrv.onrender.com/api/products");
    if (!response.ok) throw new Error("Failed to load products");
    const products = await response.json();
    products.forEach(renderProductCard);
  } catch (error) {
    console.error("Product load error:", error);
    productGrid.innerHTML = "<p>Failed to load products.</p>";
  }
};

// ✅ Render one product card
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

  card.querySelector("button").addEventListener("click", () => {
    selectedProduct = product;
    document.getElementById("modalImage").src = product.image;
    document.getElementById("modalName").textContent = product.name;
    document.getElementById("modalDescription").textContent = product.description;
    document.getElementById("modalPrice").textContent = product.price;
    document.getElementById("productModal").style.display = "flex";
  });

  productGrid.appendChild(card);
}

// ✅ Search filtering
function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach(card => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = name.includes(query) ? "block" : "none";
  });
}

// ✅ Add to cart
function addToCartFromModal() {
  if (!localStorage.getItem("token")) return showLogin("Please log in before adding to cart.");
  if (selectedProduct) {
    cart.push({ ...selectedProduct, quantity: 1 });
    document.getElementById("cartCount").textContent = cart.length;
    alert(`${selectedProduct.name} added to cart!`);
  }
}

// ✅ Show cart modal
function showCart() {
  if (!localStorage.getItem("token")) return showLogin("Please log in to view your cart.");
  const cartItemsList = document.getElementById("cartItems");
  const cartTotalSpan = document.getElementById("cartTotal");

  cartItemsList.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsList.innerHTML = "<li>Your cart is empty.</li>";
  } else {
    cart.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - $${item.price}`;
      cartItemsList.appendChild(li);
      total += item.price;
    });
  }

  cartTotalSpan.textContent = total.toFixed(2);
  document.getElementById("cartModal").style.display = "flex";
}

function closeCart() {
  document.getElementById("cartModal").style.display = "none";
}

// ✅ Checkout and save order
async function checkoutCart() {
  if (cart.length === 0) return alert("Your cart is empty.");
  const token = localStorage.getItem("token");
  if (!token) return showLogin("Please log in to place your order.");

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  try {
    const res = await fetch("https://electromart-backend-hgrv.onrender.com/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1
        })),
        totalAmount: total
      })
    });

    if (res.ok) {
      alert("✅ Order placed successfully!");
      cart = [];
      document.getElementById("cartCount").textContent = "0";
      document.getElementById("cartItems").innerHTML = "";
      document.getElementById("cartTotal").textContent = "0.00";
      document.getElementById("cartModal").style.display = "none";
      document.getElementById("thankYouModal").style.display = "flex";
    } else {
      const data = await res.json();
      alert(data.error || "Failed to place order.");
    }
  } catch (error) {
    alert("Server error during checkout.");
  }
}

function closeThankYou() {
  document.getElementById("thankYouModal").style.display = "none";
}

// ✅ Show login modal
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

// ✅ Login handler
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
      document.getElementById("loginBtn").textContent = `Logged in as ${data.user.username}`;
      document.getElementById("logoutBtn").style.display = "inline-block";
      document.getElementById("myOrdersBtn").style.display = "inline-block";
      statusText.style.color = "green";
      statusText.textContent = "Login successful!";
      setTimeout(() => closeLogin(), 1000);
    } else {
      statusText.textContent = "Incorrect login. Create an account to login?";
      const signupBtn = document.createElement("button");
      signupBtn.textContent = "Sign Up";
      signupBtn.onclick = () => {
        closeLogin();
        document.getElementById("signupModal").style.display = "flex";
      };
      statusText.appendChild(signupBtn);
    }
  } catch (error) {
    statusText.textContent = "Server error.";
  }
}

// ✅ Signup handler
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
      document.getElementById("loginBtn").textContent = `Logged in as ${username}`;
      document.getElementById("logoutBtn").style.display = "inline-block";
      document.getElementById("myOrdersBtn").style.display = "inline-block";
      statusText.style.color = "green";
      statusText.textContent = "Signup successful!";
      setTimeout(() => closeSignup(), 1000);
    } else {
      statusText.textContent = data.message || "Signup failed.";
    }
  } catch (error) {
    statusText.textContent = "Server error.";
  }
}

// ✅ Show orders
async function showMyOrders() {
  const token = localStorage.getItem("token");
  if (!token) return showLogin("Please log in to view your orders.");

  const orderList = document.getElementById("orderList");
  orderList.innerHTML = "<li>Loading...</li>";
  document.getElementById("ordersModal").style.display = "flex";

  try {
    const res = await fetch("https://electromart-backend-hgrv.onrender.com/api/orders", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orders = await res.json();

    if (Array.isArray(orders) && orders.length > 0) {
      orderList.innerHTML = "";
      orders.forEach(order => {
        const li = document.createElement("li");
        const date = new Date(order.createdAt).toLocaleString();
        li.innerHTML = `<strong>Date:</strong> ${date}<br/><strong>Total:</strong> $${order.totalAmount.toFixed(2)}<br/><strong>Items:</strong> ${order.items.map(i => i.name).join(", ")}`;
        orderList.appendChild(li);
      });
    } else {
      orderList.innerHTML = "<li>No past orders.</li>";
    }
  } catch (error) {
    orderList.innerHTML = "<li>Error fetching orders.</li>";
  }
}

function closeOrdersModal() {
  document.getElementById("ordersModal").style.display = "none";
}

function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  document.getElementById("loginBtn").textContent = "Login";
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("myOrdersBtn").style.display = "none";
  alert("You have been logged out.");
}
