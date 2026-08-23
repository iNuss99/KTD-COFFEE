// --------------------------------------------------------------------------
// XỬ LÝ THÀNH PHẦN GIAO DIỆN, THÔNG BÁO TOAST & MODAL (UI COMPONENTS & MODALS - KTD-COFFEE)
// Mục đích : Cung cấp các hàm UI dùng chung: load header/footer partial, hiển thị
//            toast thông báo, mở/đóng modal chi tiết sản phẩm, điều khiển drawer mobile.
// Phụ thuộc: products.js (formatMoney), được gọi từ main.js và auth.js
// --------------------------------------------------------------------------

// Khởi tạo lại toàn bộ icon Lucide sau khi DOM được cập nhật động
// (cần gọi sau mỗi lần fetch partial hoặc innerHTML thay đổi)
function refreshLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// ==========================================
// ĐIỀU KHIỂN DRAWER ĐIỀU HƯỚNG MOBILE (MỞ / ĐÓNG PANEL TRÁI)
// ==========================================

// Mở bảng trượt điều hướng mobile từ cạnh trái, khoá cuộn trang body
function openMobileNavDrawer() {
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.classList.add('has-modal-open');
    // Cập nhật khu vực tài khoản trong drawer mỗi lần mở (trạng thái đăng nhập có thể thay đổi)
    if (typeof updateAuthHeaderUI === 'function') updateAuthHeaderUI();
  }
}

// Đóng bảng trượt điều hướng mobile và mở lại cuộn trang body
function closeMobileNavDrawer() {
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.classList.remove('has-modal-open');
  }
}

// Khởi tạo sự kiện header mobile: toggle thanh tìm kiếm, mở/đóng drawer, đánh dấu active link
function initMobileHeaderEvents() {
  const searchToggleBtn = document.getElementById('mobile-search-toggle');
  const mobileSearchBar = document.getElementById('mobile-search-bar');
  if (searchToggleBtn && mobileSearchBar) {
    searchToggleBtn.onclick = (e) => {
      e.stopPropagation(); // Ngăn click lan ra ngoài kích hoạt đóng dropdown
      mobileSearchBar.classList.toggle('active');
      const input = document.getElementById('search-input-mobile');
      // Tự focus vào input khi mở thanh tìm kiếm để UX mượt hơn
      if (input && mobileSearchBar.classList.contains('active')) input.focus();
    };
  }

  const menuToggleBtn = document.getElementById('mobile-menu-toggle');
  const closeNavBtn = document.getElementById('close-mobile-nav-btn');
  const navBackdrop = document.getElementById('mobile-nav-backdrop');

  if (menuToggleBtn) menuToggleBtn.onclick = openMobileNavDrawer;
  if (closeNavBtn) closeNavBtn.onclick = closeMobileNavDrawer;
  if (navBackdrop) navBackdrop.onclick = closeMobileNavDrawer; // Click backdrop → đóng drawer

  // Đóng drawer khi người dùng click vào bất kỳ link nào bên trong
  const drawerLinks = document.querySelectorAll('.mobile-nav-link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeMobileNavDrawer);
  });

  // Đánh dấu link active tương ứng với trang đang mở (so sánh tên file)
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  drawerLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (href === 'index.html' && (currentPath === '' || currentPath === 'index.html'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  if (typeof updateAuthHeaderUI === 'function') updateAuthHeaderUI();
}

// ==========================================
// NẠP PARTIAL HEADER & FOOTER DÙNG CHUNG
// ==========================================

// HÀM 1: Nạp Header dùng chung từ file partial, gán active nav link và khởi tạo mobile events
async function loadHeaderDynamic() {
  try {
    const res = await fetch('partials/header-partial.html');
    if (res.ok) {
      const html = await res.text();
      const placeholder = document.getElementById('header-placeholder');
      if (placeholder) {
        placeholder.outerHTML = html; // Thay thế placeholder bằng HTML header thực
        // Đánh dấu Active link cho trang hiện tại (so sánh href với tên file hiện tại)
        const links = document.querySelectorAll('.header-nav .nav-link');
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href === currentPath || (href === 'index.html' && (currentPath === '' || currentPath === 'index.html'))) {
            link.classList.add('active');
          } else if (href && !href.startsWith('#')) {
            link.classList.remove('active');
          }
        });
        updateCartBadge();       // Hiển thị ngay số lượng giỏ hàng trên badge
        refreshLucideIcons();    // Render lại icon Lucide sau khi HTML được thêm vào
        initMobileHeaderEvents();
      }
    }
  } catch (err) {
    console.warn('Failed to load header dynamically:', err);
  } finally {
    // Luôn khởi tạo mobile events dù fetch thành công hay thất bại
    initMobileHeaderEvents();
  }
}

// HÀM 1B: Nạp Footer dùng chung từ file partial (nếu có placeholder)
async function loadFooterDynamic() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;
  try {
    const res = await fetch('partials/footer-partial.html');
    if (res.ok) {
      const html = await res.text();
      placeholder.outerHTML = html;
      refreshLucideIcons();
    }
  } catch (err) {
    console.warn('Failed to load footer dynamically:', err);
  }
}

// ==========================================
// THÔNG BÁO TOAST
// ==========================================

// HÀM 2: Hiển thị thông báo dạng Toast thả xuống góc trên phải
// @param message {string} - Nội dung thông báo
// @param type    {string} - Loại toast: 'success' | 'warning' | 'error' | 'info'
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status'); // Cho screen reader thông báo

  // Loại bỏ emoji/ký hiệu đặc biệt ở đầu chuỗi để tránh hiển thị trùng với icon SVG
  const cleanMsg = message.replace(/^[✓⚠️✕•\-]+\s*/, '').trim();

  // Chọn icon SVG tương ứng với loại toast
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>`;
  } else if (type === 'warning') {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>`;
  } else if (type === 'error') {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>`;
  } else {
    // type === 'info'
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="8"></line>
      </svg>`;
  }

  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon-wrap" aria-hidden="true">${iconSvg}</span>
      <span class="toast-text">${cleanMsg}</span>
    </div>
    <button type="button" class="toast-close-btn" aria-label="Đóng thông báo">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  // Giới hạn tối đa 3 toast hiển thị cùng lúc → xóa toast cũ nhất nếu vượt quá
  if (toastContainer.children.length >= 3) {
    toastContainer.firstElementChild.remove();
  }

  toastContainer.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close-btn');
  closeBtn.addEventListener('click', () => dismissToast(toast));

  // Tự động biến mất sau 3.2 giây
  setTimeout(() => dismissToast(toast), 3200);
}

// HÀM 3: Ẩn và xóa thẻ Toast khỏi DOM kèm hiệu ứng thu nhỏ (fade + slide up)
function dismissToast(toastEl) {
  if (!toastEl) return;
  toastEl.style.opacity = '0';
  toastEl.style.transform = 'translateY(-12px) scale(0.95)';
  // Chờ animation kết thúc (200ms) rồi mới xóa khỏi DOM
  setTimeout(() => {
    if (toastEl.parentNode) toastEl.remove();
  }, 200);
}

// ==========================================
// MODAL CHI TIẾT SẢN PHẨM
// ==========================================

// Biến trạng thái cho modal chi tiết sản phẩm (chia sẻ với main.js)
let activeDetailProduct = null; // Sản phẩm đang được xem trong modal
let detailQty = 1;              // Số lượng hiện tại trong modal chi tiết
let detailSelectedSize = 'standard'; // Kích cỡ đang chọn: 'standard' | 'large'

// HÀM 4: Mở Modal xem chi tiết & tùy chỉnh Topping/Size sản phẩm
// @param product {Object} - Object sản phẩm từ mảng PRODUCTS
function openProductDetail(product) {
  const detailModal = document.getElementById('product-detail-modal');
  const detailBackdrop = document.getElementById('modal-backdrop');
  const closeDetailBtn = document.getElementById('close-detail-btn');
  const detailImage = document.getElementById('detail-image');
  const detailTitle = document.getElementById('detail-title');
  const detailRating = document.getElementById('detail-rating');
  const detailDesc = document.getElementById('detail-desc');
  const detailToppingsContainer = document.getElementById('detail-toppings-container');
  const detailQtyVal = document.getElementById('detail-qty-val');
  const detailSpecialNotes = document.getElementById('detail-special-notes');

  if (!detailModal || !detailBackdrop) return;

  // Reset lại trạng thái mỗi lần mở modal mới
  activeDetailProduct = product;
  detailQty = 1;
  detailSelectedSize = 'standard';
  if (detailSpecialNotes) detailSpecialNotes.value = '';

  // Điền thông tin cơ bản của sản phẩm vào modal
  detailImage.src = product.image;
  detailImage.alt = product.title;
  detailTitle.textContent = product.title;
  detailRating.textContent = product.rating;
  detailDesc.textContent = product.desc;
  if (detailQtyVal) detailQtyVal.textContent = '1';

  // Render danh sách checkbox topping (hoặc thông báo nếu không có topping)
  if (product.toppings && product.toppings.length > 0) {
    detailToppingsContainer.innerHTML = product.toppings.map(top => `
      <label class="option-card-item">
        <input type="checkbox" name="topping-opt" value="${top.name}" data-price="${top.price}">
        <div class="option-card-content">
          <div class="option-left">
            <span class="custom-checkbox-indicator" aria-hidden="true"></span>
            <div class="option-text-group">
              <span class="opt-name">${top.name}</span>
            </div>
          </div>
          <span class="opt-price-tag highlight">+${formatMoney(top.price)}</span>
        </div>
      </label>
    `).join('');

    // Mỗi khi tick/bỏ tick topping → tính lại tổng giá
    detailToppingsContainer.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', updateDetailTotalPrice);
    });
  } else {
    detailToppingsContainer.innerHTML = `<div class="empty-toppings-msg">Thức uống này đã chuẩn vị thơm ngon, không cần thêm topping.</div>`;
  }

  // Khởi tạo radio chọn Size (mặc định: standard)
  const sizeRadios = detailModal.querySelectorAll('input[name="product-size"], input[name="detail-size"]');
  sizeRadios.forEach(radio => {
    radio.checked = radio.value === 'standard';
    radio.addEventListener('change', (e) => {
      detailSelectedSize = e.target.value;
      updateDetailTotalPrice(); // Tính lại tổng khi đổi size
    });
  });

  updateDetailTotalPrice(); // Hiển thị giá ban đầu

  detailBackdrop.classList.add('active');
  detailModal.classList.add('active');
  closeDetailBtn?.focus(); // Focus vào nút đóng cho screen reader
  document.body.classList.add('has-modal-open');
}

// HÀM 5: Tính tổng giá tiền tùy chỉnh trong Modal
// Công thức: (Giá gốc + Phụ phí size L + Tổng topping) × Số lượng
function updateDetailTotalPrice() {
  if (!activeDetailProduct) return;
  const detailToppingsContainer = document.getElementById('detail-toppings-container');
  const detailTotalPriceEl = document.getElementById('detail-total-price');

  let base = activeDetailProduct.price;
  if (detailSelectedSize === 'large') {
    base += 12000; // Phụ phí nâng cỡ lên Size L: +12.000đ
  }

  // Cộng giá của tất cả topping đang được chọn (checked)
  let toppingsTotal = 0;
  if (detailToppingsContainer) {
    const checkedToppings = detailToppingsContainer.querySelectorAll('input[type="checkbox"]:checked');
    checkedToppings.forEach(chk => {
      toppingsTotal += parseInt(chk.dataset.price, 10) || 0;
    });
  }

  const total = (base + toppingsTotal) * detailQty;
  if (detailTotalPriceEl) detailTotalPriceEl.textContent = formatMoney(total);
}

// HÀM 6: Đóng Modal chi tiết sản phẩm và gỡ backdrop
function closeProductDetail() {
  const detailModal = document.getElementById('product-detail-modal');
  const detailBackdrop = document.getElementById('modal-backdrop');
  if (!detailModal || !detailBackdrop) return;
  detailBackdrop.classList.remove('active');
  detailModal.classList.remove('active');
  document.body.classList.remove('has-modal-open');
}
