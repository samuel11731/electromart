let cart = [];
let selectedProduct = null;

// ✅ On Page Load
window.onload = async () => {
  const productGrid = document.getElementById("productGrid");

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (token && username) {
    document.getElementById("userStatus").textContent = `Logged in as ${username}`;
    document.getElementById("loginBtn").textContent = "Logged In";
    document.getElementById("loginBtn").disabled = true;
  }

  try {
    const response = await fetch("https://electromart-backend-hgrv.onrender.com/api/products");
    const products = await response.json();

    products.forEach(product => {
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
    });
  } catch (error) {
    productGrid.innerHTML = "<p>Error loading products.</p>";
  }
};

// ✅ Close Product Modal
document.getElementById("closeModal").onclick = () => {
  document.getElementById("productModal").style.display = "none";
};

// ✅ Add to Cart
function addToCartFromModal() {
  const token = localStorage.getItem("token");
  if (!token) {
    document.getElementById("productModal").style.display = "none";
    showLogin();
    return;
  }

  if (selectedProduct) {
    cart.push(selectedProduct);
    document.getElementById("cartCount").textContent = cart.length;
    alert(`${selectedProduct.name} added to cart!`);
  }
}

// ✅ Show Cart
function showCart() {
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

function checkoutCart() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  document.getElementById("cartModal").style.display = "none";
  document.getElementById("thankYouModal").style.display = "flex";

  cart = [];
  document.getElementById("cartCount").textContent = "0";
  document.getElementById("cartItems").innerHTML = "";
  document.getElementById("cartTotal").textContent = "0.00";
}

function closeThankYou() {
  document.getElementById("thankYouModal").style.display = "none";
}

// ✅ Search
document.getElementById("searchBar").addEventListener("input", function (e) {
  const query = e.target.value.toLowerCase();
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach(card => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = name.includes(query) ? "block" : "none";
  });
});

// ✅ LOGIN
function showLogin() {
  document.getElementById("loginModal").style.display = "flex";
}

function closeLogin() {
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("loginStatus").textContent = "";
}

document.getElementById("loginForm").addEventListener("submit", async function (e) {
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
      statusText.style.color = "green";
      statusText.textContent = "Login successful!";
      document.getElementById("userStatus").textContent = `Logged in as ${data.user.username}`;
      document.getElementById("loginBtn").textContent = "Logged In";
      document.getElementById("loginBtn").disabled = true;
      setTimeout(() => {
        closeLogin();
      }, 1000);
    } else {
      statusText.textContent = "Incorrect login. Create an account to login?";
    }
  } catch (error) {
    statusText.textContent = "Server error.";
  }
});

// ✅ SIGNUP
function showSignup() {
  document.getElementById("signupModal").style.display = "flex";
  closeLogin();
}

function closeSignup() {
  document.getElementById("signupModal").style.display = "none";
  document.getElementById("signupStatus").textContent = "";
}

document.getElementById("signupForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const signupStatus = document.getElementById("signupStatus");

  try {
    const res = await fetch("https://electromart-backend-hgrv.onrender.com/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user.username);
      document.getElementById("userStatus").textContent = `Logged in as ${data.user.username}`;
      document.getElementById("loginBtn").textContent = "Logged In";
      document.getElementById("loginBtn").disabled = true;
      signupStatus.style.color = "green";
      signupStatus.textContent = "Signup successful!";
      setTimeout(() => {
        closeSignup();
      }, 1000);
    } else {
      signupStatus.style.color = "red";
      signupStatus.textContent = data.message || "Signup failed.";
    }
  } catch (err) {
    signupStatus.textContent = "Server error.";
  }
});
