let cart = [];
let selectedProduct = null;

window.onload = async () => {
  const productGrid = document.getElementById("productGrid");

  try {
    const response = await fetch("http://localhost:5000/api/products");
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

function addToCartFromModal() {
  if (selectedProduct) {
    cart.push(selectedProduct);
    document.getElementById("cartCount").textContent = cart.length;
    alert(`${selectedProduct.name} added to cart!`);
  }
}

document.getElementById("closeModal").onclick = () => {
  document.getElementById("productModal").style.display = "none";
};

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
  alert("Checkout process started... (we’ll build this in Feature 4)");
}
