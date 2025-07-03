let cart = [];
let selectedProduct = null;

window.onload = async () => {
  const productGrid = document.getElementById("productGrid");

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

      const viewBtn = card.querySelector("button");
      viewBtn.addEventListener("click", () => {
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
    console.error("Failed to load products", error);
    productGrid.innerHTML = "<p>Error loading products.</p>";
  }
};

document.getElementById("closeModal").onclick = () => {
  document.getElementById("productModal").style.display = "none";
};

function addToCartFromModal() {
  if (selectedProduct) {
    cart.push(selectedProduct);
    document.getElementById("cartCount").textContent = cart.length;
    alert(`${selectedProduct.name} added to cart!`);
  }
}

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

  // Clear cart
  cart = [];
  document.getElementById("cartCount").textContent = "0";
  document.getElementById("cartItems").innerHTML = "";
  document.getElementById("cartTotal").textContent = "0.00";
}

function closeThankYou() {
  document.getElementById("thankYouModal").style.display = "none";
}

document.getElementById("searchBar").addEventListener("input", function (e) {
  const query = e.target.value.toLowerCase();
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach(card => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = name.includes(query) ? "block" : "none";
  });
});
