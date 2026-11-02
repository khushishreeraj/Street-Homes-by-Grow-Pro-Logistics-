const products = [
  { id: 1, name: "Everyday Stoneware Mug", category: "Kitchen", price: 449, tag: "Bestseller", description: "A simple favourite for slow mornings.", image: "https://images.unsplash.com/photo-1514228742587-6b1558f7f93a?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Woven Storage Basket", category: "Organization", price: 799, tag: "Natural pick", description: "A tidy home, with a softer touch.", image: "https://images.unsplash.com/photo-1593085260707-5377ba37f868?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Soft Cotton Cushion", category: "Living", price: 699, tag: "Feel-good", description: "An easy way to make a corner cosy.", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Minimal Table Lamp", category: "Living", price: 1299, tag: "New", description: "A warm glow for your favourite nook.", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Wooden Serving Board", category: "Kitchen", price: 599, tag: "Everyday", description: "From quick breakfasts to little gatherings.", image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Glass Pantry Jars", category: "Organization", price: 899, tag: "Organise", description: "Keep everyday ingredients close at hand.", image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Textured Ceramic Vase", category: "Living", price: 749, tag: "Quiet detail", description: "A little shape and texture for your shelf.", image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Kitchen Linen Set", category: "Kitchen", price: 549, tag: "Useful lovely", description: "Soft, practical linens for daily rituals.", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=700&q=80" }
];

const $ = (selector) => document.querySelector(selector);
const productGrid = $("#productGrid");
const cartKey = "streetHomesCart";
const wishlistKey = "streetHomesWishlist";
let activeCategory = "All";
let searchTerm = "";
let sortMode = "featured";
let cart = readStorage(cartKey, []);
let wishlist = readStorage(wishlistKey, []);
let toastTimer;

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}
function saveStorage() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
}
function money(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}
function getVisibleProducts() {
  let visible = products.filter(product => {
    const categoryMatch = activeCategory === "All" || product.category === activeCategory;
    const searchMatch = `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(searchTerm);
    return categoryMatch && searchMatch;
  });
  if (sortMode === "low") visible.sort((a, b) => a.price - b.price);
  if (sortMode === "high") visible.sort((a, b) => b.price - a.price);
  return visible;
}
function renderProducts() {
  const visible = getVisibleProducts();
  productGrid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-tag">${product.tag}</span>
        <button class="wish-button ${wishlist.includes(product.id) ? "is-saved" : ""}" data-wish="${product.id}" aria-label="${wishlist.includes(product.id) ? "Remove from" : "Add to"} wishlist">${wishlist.includes(product.id) ? "♥" : "♡"}</button>
        <button class="quick-add" data-add="${product.id}">＋ Add to bag</button>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <div class="product-name-row"><h3 class="product-name">${product.name}</h3><span class="product-price">${money(product.price)}</span></div>
        <p class="product-desc">${product.description}</p>
      </div>
    </article>
  `).join("");
  $("#emptyState").hidden = visible.length > 0;
}
function addToCart(id) {
  const item = cart.find(entry => entry.id === id);
  if (item) item.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveStorage();
  renderCart();
  showToast("Added to your bag ♡");
}
function changeQuantity(id, change) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
  saveStorage();
  renderCart();
}
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveStorage();
  renderCart();
}
function cartTotal() {
  return cart.reduce((sum, item) => {
    const product = products.find(product => product.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}
function renderCart() {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  $("#cartCount").textContent = totalQuantity;
  $("#drawerCount").textContent = `(${totalQuantity})`;
  $("#cartSubtotal").textContent = money(cartTotal());
  $("#checkoutTotal").textContent = money(cartTotal());
  $("#cartItems").innerHTML = cart.map(item => {
    const product = products.find(product => product.id === item.id);
    if (!product) return "";
    return `<div class="cart-row">
      <img src="${product.image}" alt="${product.name}">
      <div><h3>${product.name}</h3><p>${money(product.price)}</p>
        <div class="quantity-control">
          <button data-quantity="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-quantity="${product.id}" data-change="1" aria-label="Increase quantity">＋</button>
        </div>
      </div>
      <div><span class="cart-row-price">${money(product.price * item.quantity)}</span><button class="remove-item" data-remove="${product.id}">Remove</button></div>
    </div>`;
  }).join("");
  const empty = cart.length === 0;
  $("#cartEmpty").hidden = !empty;
  $("#cartFooter").hidden = empty;
  $("#cartItems").hidden = empty;
}
function openCart() {
  $("#overlay").classList.add("visible");
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  $("#overlay").classList.remove("visible");
  $("#cartDrawer").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function openCheckout() {
  closeCart();
  $("#checkoutModal").classList.add("visible");
  $("#checkoutModal").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeCheckout() {
  $("#checkoutModal").classList.remove("visible");
  $("#checkoutModal").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$("#categoryFilters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.toggle("active", chip.dataset.category === activeCategory));
  renderProducts();
});
document.querySelectorAll(".collection-card").forEach(card => {
  card.addEventListener("click", () => {
    activeCategory = card.dataset.category;
    document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.toggle("active", chip.dataset.category === activeCategory));
    renderProducts();
    $("#shop").scrollIntoView({ behavior: "smooth" });
  });
});
$("#searchInput").addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});
$("#sortSelect").addEventListener("change", event => {
  sortMode = event.target.value;
  renderProducts();
});
productGrid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const wishButton = event.target.closest("[data-wish]");
  if (addButton) addToCart(Number(addButton.dataset.add));
  if (wishButton) {
    const id = Number(wishButton.dataset.wish);
    wishlist = wishlist.includes(id) ? wishlist.filter(item => item !== id) : [...wishlist, id];
    saveStorage();
    renderProducts();
    showToast(wishlist.includes(id) ? "Saved to your wishlist ♡" : "Removed from wishlist");
  }
});
$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
$("#continueShopping").addEventListener("click", closeCart);
$("#cartItems").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) changeQuantity(Number(quantityButton.dataset.quantity), Number(quantityButton.dataset.change));
  if (removeButton) removeFromCart(Number(removeButton.dataset.remove));
});
$("#checkoutOpen").addEventListener("click", openCheckout);
$("#checkoutClose").addEventListener("click", closeCheckout);
$("#checkoutModal").addEventListener("click", event => {
  if (event.target === $("#checkoutModal")) closeCheckout();
});
$("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();
  if (cart.length === 0) return;
  closeCheckout();
  cart = [];
  saveStorage();
  renderCart();
  event.target.reset();
  showToast("Demo order complete — thank you for exploring Street Homes!");
});
$("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();
  event.target.reset();
  showToast("Thanks for joining the Street Homes list!");
});
$("#wishlistShortcut").addEventListener("click", () => {
  activeCategory = "All";
  searchTerm = "";
  $("#searchInput").value = "";
  $("#categoryFilters").querySelectorAll(".filter-chip").forEach(chip => chip.classList.toggle("active", chip.dataset.category === "All"));
  productGrid.innerHTML = products.filter(product => wishlist.includes(product.id)).map(product => `
    <article class="product-card"><div class="product-image"><img src="${product.image}" alt="${product.name}"><span class="product-tag">Your wishlist</span><button class="wish-button is-saved" data-wish="${product.id}" aria-label="Remove from wishlist">♥</button><button class="quick-add" data-add="${product.id}">＋ Add to bag</button></div><div class="product-info"><p class="product-category">${product.category}</p><div class="product-name-row"><h3 class="product-name">${product.name}</h3><span class="product-price">${money(product.price)}</span></div><p class="product-desc">${product.description}</p></div></article>
  `).join("");
  $("#emptyState").hidden = wishlist.length > 0;
  $("#emptyState").textContent = "Your wishlist is empty for now. Tap a heart on a product to save it.";
  $("#shop").scrollIntoView({ behavior: "smooth" });
});
$("#menuToggle").addEventListener("click", () => {
  const open = $("#mainNav").classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
});
$("#mainNav").addEventListener("click", event => {
  if (event.target.closest("a")) {
    $("#mainNav").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeCheckout();
  }
});

$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
