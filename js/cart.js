// --------------------------------------------------------------------------
// XỬ LÝ GIỎ HÀNG & LƯU TRỮ TRẠNG THÁI CLIENT (CART & LOCALSTORAGE ENGINE - KTD-COFFEE)
// Mục đích : Quản lý mảng `cart` (thêm, xóa, cập nhật số lượng), đồng bộ
//            LocalStorage và render lại giao diện Cart Drawer sau mỗi thay đổi.
// Phụ thuộc: products.js (FREE_SHIPPING_THRESHOLD, formatMoney), ui.js (showToast)
// --------------------------------------------------------------------------

// Khởi tạo mảng giỏ hàng ngay khi script nạp:
// – Đọc từ LocalStorage nếu đã có dữ liệu lưu trước (ưu tiên tính liên tục)
// – Nếu chưa có hoặc JSON bị hỏng → dùng mảng mặc định có 1 sản phẩm demo
let cart = (() => {
  try {
    const raw = localStorage.getItem('ktd_coffee_cart');
    return raw ? JSON.parse(raw) : [
      {
        id: 'coffee-01',
        title: 'Bạc Xỉu Sữa Dừa Kem Béo',
        size: 'Tiêu chuẩn (Size M)',
        toppings: ['Thêm Kem Cheese Macchiato'],
        unitPrice: 51000,   // Giá đơn vị (đã cộng topping) tại thời điểm thêm vào giỏ
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80'
      }
    ];
  } catch (e) {
    // JSON.parse lỗi (dữ liệu bị hỏng) → trả về giỏ trống, tránh crash app
    return [];
  }
})();

// HÀM 1: Lưu mảng giỏ hàng vào LocalStorage và cập nhật lại giao diện UI
// – Gọi sau mỗi thao tác thêm/xóa/sửa số lượng
function saveCart() {
  localStorage.setItem('ktd_coffee_cart', JSON.stringify(cart));
  renderCart();        // Cập nhật danh sách món trong Cart Drawer
  updateCartBadge();   // Cập nhật số badge trên icon giỏ hàng
}

// HÀM 2: Thêm nhanh sản phẩm mặc định vào giỏ (dành cho nút "Thêm" trên danh sách sản phẩm)
// – Nếu đã tồn tại cùng id + size "Tiêu chuẩn (Size M)" + không topping → tăng quantity
// – Ngược lại → thêm item mới vào cuối mảng
function quickAddToCart(product) {
  const existingIndex = cart.findIndex(item =>
    item.id === product.id &&
    item.size === 'Tiêu chuẩn (Size M)' &&
    (!item.toppings || item.toppings.length === 0)
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      size: 'Tiêu chuẩn (Size M)',
      toppings: [],
      unitPrice: product.price,
      quantity: 1,
      image: product.image
    });
  }

  saveCart();
  showToast(`Đã thêm "${product.title}" vào giỏ hàng!`, 'success');
}

// HÀM 3: Render danh sách thức uống trong Giỏ hàng (Cart Drawer) & Tính thanh tiến trình Freeship
function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const emptyCartState = document.getElementById('empty-cart-state');
  const btnProceedCheckout = document.getElementById('btn-proceed-checkout');
  const cartSubtotalEl = document.getElementById('cart-subtotal-price');
  const cartTotalEl = document.getElementById('cart-total-price');
  const freeShippingFill = document.getElementById('free-shipping-fill');
  const freeShippingMsg = document.getElementById('free-shipping-msg');

  if (!cartItemsContainer || !emptyCartState) return;

  // Chuyển đổi trạng thái hiển thị: giỏ trống ↔ có sản phẩm
  if (cart.length === 0) {
    cartItemsContainer.classList.add('is-hidden');
    emptyCartState.classList.remove('is-hidden');
    if (btnProceedCheckout) {
      btnProceedCheckout.disabled = true;
      btnProceedCheckout.classList.add('is-disabled');
    }
  } else {
    cartItemsContainer.classList.remove('is-hidden');
    emptyCartState.classList.add('is-hidden');
    if (btnProceedCheckout) {
      btnProceedCheckout.disabled = false;
      btnProceedCheckout.classList.remove('is-disabled');
    }
  }

  let subtotal = 0;

  // Tạo HTML danh sách từng món trong giỏ
  cartItemsContainer.innerHTML = cart.map((item, index) => {
    const itemTotal = item.unitPrice * item.quantity;
    subtotal += itemTotal;

    // Ghép chuỗi mô tả size + topping (ví dụ: "Size M • + Kem Cheese")
    const toppingText = item.toppings && item.toppings.length > 0 ? `+ ${item.toppings.join(', ')}` : '';
    const sizeAndOptions = [item.size, toppingText].filter(Boolean).join(' • ');

    return `
      <div class="cart-item" data-index="${index}">
        <img src="${item.image}" alt="${item.title}" class="cart-item-thumb" />
        <div class="cart-item-details">
          <div class="cart-item-name">${item.title}</div>
          <div class="cart-item-options">${sizeAndOptions}</div>
          <div class="cart-item-price">${formatMoney(itemTotal)}</div>
        </div>

        <div class="qty-controller">
          <button type="button" class="qty-btn btn-cart-minus" data-index="${index}" aria-label="Giảm số lượng">-</button>
          <span class="qty-val">${item.quantity}</span>
          <button type="button" class="qty-btn btn-cart-plus" data-index="${index}" aria-label="Tăng số lượng">+</button>
        </div>

        <button type="button" class="remove-item-btn" data-index="${index}" aria-label="Xóa ${item.title} khỏi giỏ hàng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
  }).join('');

  // Gán sự kiện nút giảm: quantity > 1 → giảm 1; quantity = 1 → xóa khỏi giỏ
  cartItemsContainer.querySelectorAll('.btn-cart-minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      if (cart[idx].quantity > 1) {
        cart[idx].quantity -= 1;
      } else {
        cart.splice(idx, 1);
        showToast('Đã xóa thức uống khỏi giỏ hàng', 'warning');
      }
      saveCart();
    });
  });

  // Gán sự kiện nút tăng số lượng
  cartItemsContainer.querySelectorAll('.btn-cart-plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      cart[idx].quantity += 1;
      saveCart();
    });
  });

  // Gán sự kiện nút xóa trực tiếp (icon thùng rác)
  cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      cart.splice(idx, 1);
      saveCart();
      showToast('Đã xóa thức uống khỏi giỏ hàng', 'warning');
    });
  });

  // Cập nhật hiển thị tạm tính & tổng tiền (hiện tại chưa tính phí ship trong drawer)
  if (cartSubtotalEl) cartSubtotalEl.textContent = formatMoney(subtotal);
  if (cartTotalEl) cartTotalEl.textContent = formatMoney(subtotal);

  // Thanh tiến trình freeship: tính % đã đạt trên ngưỡng FREE_SHIPPING_THRESHOLD (150.000đ)
  if (freeShippingFill && freeShippingMsg) {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      freeShippingFill.style.width = '100%';
      freeShippingMsg.innerHTML = '🎉 <strong>Chúc mừng!</strong> Bạn đã được Miễn Phí Giao Hàng!';
    } else {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      freeShippingFill.style.width = `${percent}%`;
      freeShippingMsg.innerHTML = `Thêm <strong>${formatMoney(remaining)}</strong> để được <strong>Miễn Phí Giao Hàng!</strong>`;
    }
  }
}

// HÀM 4: Cập nhật số lượng món hiển thị trên Badge icon Giỏ hàng (kèm hiệu ứng nảy bounce)
// – Tổng quantity của toàn bộ item trong giỏ (không phải số loại sản phẩm)
function updateCartBadge() {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  // Cập nhật tất cả badge (header + floating button) cùng lúc
  const allBadges = document.querySelectorAll('#cart-count-badge, .cart-badge, .floating-cart-badge, #floating-cart-badge');
  allBadges.forEach(badge => {
    badge.textContent = totalItems;
    // Trick reset animation: xóa class → force reflow → thêm lại để bounce chạy lại
    badge.classList.remove('bounce');
    void badge.offsetWidth;
    badge.classList.add('bounce');
  });
}

// HÀM 5: Mở bảng trượt Giỏ hàng (Cart Drawer) từ cạnh phải
// – Render lại nội dung giỏ mỗi lần mở để đảm bảo đồng bộ
function openCartDrawer() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const closeCartBtn = document.getElementById('close-cart-btn');
  if (!cartDrawer || !cartBackdrop) return;
  renderCart();
  cartBackdrop.classList.add('active');
  cartDrawer.classList.add('active');
  cartDrawer.setAttribute('aria-hidden', 'false');
  closeCartBtn?.focus(); // Chuyển focus vào nút đóng để hỗ trợ screen reader
  document.body.classList.add('has-modal-open'); // Khóa cuộn trang body
}

// HÀM 6: Đóng bảng trượt Giỏ hàng (Cart Drawer)
function closeCartDrawer() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  if (!cartDrawer || !cartBackdrop) return;
  cartBackdrop.classList.remove('active');
  cartDrawer.classList.remove('active');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('has-modal-open'); // Mở lại cuộn trang body
}
