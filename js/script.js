// State
let cart = JSON.parse(localStorage.getItem('fearless_cart')) || [];

// Currency
const CURRENCY = 'Rs.';

// Products Data (Prices in LKR)
const products = [
  {
    id: 1,
    name: 'FEARLESS Signature Hoodie',
    price: 8500,
    image: 'assets/hoodie.png',
    category: 'mens'
  },
  {
    id: 2,
    name: 'FEARLESS Heavyweight T-Shirt',
    price: 4500,
    image: 'assets/tshirt.png',
    category: 'mens'
  },
  {
    id: 3,
    name: 'FEARLESS Signature Crop Top',
    price: 3500,
    image: 'assets/womens_top.png',
    category: 'womens'
  },
  {
    id: 4,
    name: 'FEARLESS Oversized Womens Tee',
    price: 4000,
    image: 'assets/tshirt.png',
    category: 'womens'
  },
  {
    id: 5,
    name: 'FEARLESS Essential Cap',
    price: 2500,
    image: 'assets/cap.png',
    category: 'accessories'
  },
  {
    id: 6,
    name: 'FEARLESS Street Shades',
    price: 5500,
    image: 'assets/sunglasses.png',
    category: 'accessories'
  }
];

// Format price in LKR
function formatPrice(amount) {
  return CURRENCY + ' ' + amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  // If on index page
  const productGrid = document.getElementById('productGrid');
  if (productGrid) {
    renderProducts();
  }

  // If on cart page
  const cartItemsContainer = document.getElementById('cartItems');
  if (cartItemsContainer) {
    renderCart();

    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
      method.addEventListener('click', () => {
        paymentMethods.forEach(m => m.classList.remove('active'));
        method.classList.add('active');
      });
    });
  }

  // If on product details page
  const productDetail = document.getElementById('productDetail');
  if (productDetail) {
    renderProductDetail();
  }
});

// Render Products on Home Page
function renderProducts(category = 'all') {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;
  productGrid.innerHTML = '';
  
  const filteredProducts = category === 'all' 
    ? products 
    : products.filter(p => p.category === category);
    
  if (filteredProducts.length === 0) {
    productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No products found in this collection.</p>';
    return;
  }

  filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <a href="product.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}" class="product-img">
      </a>
      <div class="product-info">
        <a href="product.html?id=${product.id}">
          <h3 class="product-name">${product.name}</h3>
        </a>
        <p class="product-price">${formatPrice(product.price)}</p>
        <button class="add-to-cart" onclick="window.location.href='product.html?id=${product.id}'">Select Size</button>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

// Filter collections by category (smooth scroll)
function filterCollection(category) {
  renderProducts(category);
  const shopSection = document.getElementById('shop');
  if (shopSection) {
    shopSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Product Detail Page Logic
function renderProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  const product = products.find(p => p.id === productId);

  if (!product) {
    document.getElementById('productDetail').innerHTML = '<div style="text-align: center; padding: 5rem;"><p>Product not found.</p><a href="index.html" class="btn" style="margin-top: 1rem;">Back to Shop</a></div>';
    return;
  }

  document.getElementById('pdImage').src = product.image;
  document.getElementById('pdName').textContent = product.name;
  document.getElementById('pdPrice').textContent = formatPrice(product.price);

  window.currentProduct = product;
  window.selectedSize = null;

  // Handle sizes display/hiding for accessories
  const sizeSelectionDiv = document.querySelector('.size-selection');
  if (product.category === 'accessories') {
    if (sizeSelectionDiv) sizeSelectionDiv.style.display = 'none';
    window.selectedSize = 'N/A'; // No size needed
  } else {
    if (sizeSelectionDiv) sizeSelectionDiv.style.display = 'block';
  }

  const sizeBtns = document.querySelectorAll('.size-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.selectedSize = btn.dataset.size;
    });
  });
}

// Add to Cart with Size
function addToCartWithSize() {
  if (!window.selectedSize) {
    alert('Please select a size first.');
    return;
  }

  const product = window.currentProduct;
  const cartItemId = `${product.id}-${window.selectedSize}`;
  const existingItem = cart.find(item => item.cartItemId === cartItemId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      cartItemId: cartItemId,
      name: product.name,
      price: product.price,
      image: product.image,
      size: window.selectedSize === 'N/A' ? '' : window.selectedSize,
      quantity: 1
    });
  }

  saveCart();
  updateCartCount();
  alert(`${product.name} added to cart!`);
}

// Update Cart Count Badge in navbar
function updateCartCount() {
  const countElements = document.querySelectorAll('.cart-count');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  countElements.forEach(el => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? 'block' : 'none';
  });
}

// Save Cart to LocalStorage
function saveCart() {
  localStorage.setItem('fearless_cart', JSON.stringify(cart));
}

// Render Cart items on cart.html page
function renderCart() {
  const cartItemsContainer = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart-msg">
        <p>Your cart is empty.</p>
        <a href="index.html" class="btn" style="margin-top: 1rem;">Shop Now</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatPrice(0);
    if (totalEl) totalEl.textContent = formatPrice(0);
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.cursor = 'not-allowed';
    }
    return;
  }

  cartItemsContainer.innerHTML = '';
  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.price * item.quantity;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <h3 class="cart-item-title">${item.name}</h3>
        <p class="cart-item-price">${formatPrice(item.price)} ${item.size ? '<span style="color: var(--text-color); margin-left: 10px; font-weight: bold;">Size: ' + item.size + '</span>' : ''}</p>
      </div>
      <div class="cart-item-actions">
        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
        <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
      </div>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  const shipping = subtotal > 0 ? 350 : 0;
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  const shippingEl = document.getElementById('shipping');
  if (shippingEl) shippingEl.textContent = shipping > 0 ? formatPrice(350) : formatPrice(0);

  if (totalEl) totalEl.textContent = formatPrice(subtotal + shipping);

  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.cursor = 'pointer';
  }
}

// Update Quantity in cart
function updateQuantity(index, change) {
  if (cart[index].quantity + change > 0) {
    cart[index].quantity += change;
  } else {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartCount();
  renderCart();
}

// Remove item from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  renderCart();
}

// Checkout Function (Visa/Mastercard via Stripe)
function processCheckout() {
  if (cart.length === 0) return;

  const activeMethod = document.querySelector('.payment-method.active');
  const method = activeMethod ? activeMethod.dataset.method : 'credit-card';

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.textContent = 'Processing...';
    checkoutBtn.disabled = true;
  }

  // Compile order description in LKR
  const orderDetails = cart.map(item => `${item.name} (Size: ${item.size || 'N/A'}) x ${item.quantity} - ${formatPrice(item.price * item.quantity)}`).join('\n');
  const totalAmount = document.getElementById('total').textContent;

  // 1. Construct email order confirmation
  const subject = encodeURIComponent(`New FEARLESS Order Submission`);
  const body = encodeURIComponent(`Hi FEARLESS,\n\nI want to place the following order:\n\n${orderDetails}\n\nTotal: ${totalAmount}\nShipping: Rs. 350.00\n\nPayment Method: ${method === 'credit-card' ? 'Visa/Mastercard' : 'Bank Transfer'}`);
  
  // 2. Open email client to send details
  window.location.href = `mailto:ceybrews@gmail.com?subject=${subject}&body=${body}`;

  // 3. Open payment page
  if (method === 'credit-card') {
    setTimeout(() => {
      window.open("https://checkout.stripe.com/pay/acct_1TVPFO14iE2Rk0CD", "_blank");
      
      cart = [];
      saveCart();
      updateCartCount();
      renderCart();
      alert("Order sent! Stripe payment page opened in new tab.");
    }, 1000);
  } else {
    setTimeout(() => {
      cart = [];
      saveCart();
      updateCartCount();
      renderCart();
      alert("Order sent to ceybrews@gmail.com! Please complete bank transfer to confirm.");
    }, 1000);
  }
}

// Send Email via mailto for contact form
function sendEmail() {
  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const message = document.getElementById('contactMessage').value;

  if (!name || !email || !message) {
    alert('Please fill out all the fields before sending.');
    return;
  }

  const subject = encodeURIComponent(`New Message from ${name} via FEARLESS Website`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

  window.location.href = `mailto:ceybrews@gmail.com?subject=${subject}&body=${body}`;
}
