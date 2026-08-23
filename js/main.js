/**
 * ════════════════════════════════════════════════════════════
 * BỘ ĐIỀU KHIỂN CHÍNH (MAIN APPLICATION CONTROLLER) - KTD-COFFEE
 * ════════════════════════════════════════════════════════════
 * Mục đích: Khởi tạo và điều phối toàn bộ tính năng giao diện:
 *   - Hiển thị, lọc và tìm kiếm sản phẩm (product grid)
 *   - Checkout Wizard: modal + trang checkout.html riêng
 *   - Hiệu ứng cuộn (scroll reveal), đếm ngược flash sale
 *   - Carousel đánh giá, animation đếm số, FAQ accordion
 *   - Form liên hệ, đăng ký nhận ưu đãi
 * Phụ thuộc: products.js, cart.js, ui.js, auth.js
 * ════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Load Dynamic Header & Footer
  await loadHeaderDynamic();
  await loadFooterDynamic();

  // Biến trạng thái ứng dụng (khởi tạo với giá trị mặc định)
  let currentCategory = 'all';
  let currentSort = 'default';
  let searchQuery = '';
  let checkoutStep = 1;
  let appliedDiscount = null;
  let selectedPaymentMethod = 'vietqr';
  let currentTrackingStep = 1;
  let trackingInterval = null;
  let revealObserver = null;

  // Tham chiếu các phần tử DOM chính (sản phẩm, tìm kiếm, lọc danh mục)
  const productGrid = document.getElementById('product-grid');
  const categoryPills = document.querySelectorAll('.category-pill');
  const searchInputDesktop = document.getElementById('search-input-desktop');
  const searchInputMobile = document.getElementById('search-input-mobile');
  const mobileSearchToggle = document.getElementById('mobile-search-toggle');
  const mobileSearchBar = document.getElementById('mobile-search-bar');
  const sortBySelect = document.getElementById('sort-by-select');
  const btnProceedCheckout = document.getElementById('btn-proceed-checkout');

  // Tham chiếu Modal chi tiết sản phẩm, Wizard thanh toán và các nút bấm điều hướng bước
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutBackdrop = document.getElementById('checkout-backdrop');
  const closeCheckoutBtn = document.getElementById('close-checkout-btn');
  const checkoutSteps = document.querySelectorAll('.step-indicator');
  const stepBodies = document.querySelectorAll('.checkout-step-body');
  const btnStep1Next = document.getElementById('btn-step1-next');
  const btnStep2Back = document.getElementById('btn-step2-back');
  const btnStep2Next = document.getElementById('btn-step2-next');
  const btnStep3Back = document.getElementById('btn-step3-back');
  const btnStep3Submit = document.getElementById('btn-step3-submit');
  const paymentCards = document.querySelectorAll('.payment-card-option');
  const applyVoucherBtn = document.getElementById('btn-apply-voucher');
  const voucherInput = document.getElementById('voucher-input');

  const detailMinusBtn = document.getElementById('detail-qty-minus');
  const detailPlusBtn = document.getElementById('detail-qty-plus');
  const detailQtyVal = document.getElementById('detail-qty-val');
  const btnDetailAddToCart = document.getElementById('btn-detail-add-to-cart');
  const closeDetailBtn = document.getElementById('close-detail-btn');
  const detailBackdrop = document.getElementById('modal-backdrop');

  // --- 1. PRODUCT GRID RENDERING (Render danh sách thẻ sản phẩm & áp dụng bộ lọc) ---
  function renderProducts() {
    if (!productGrid) return;

    // Lọc sản phẩm theo danh mục đang chọn và từ khóa tìm kiếm
    let filtered = PRODUCTS.filter(item => {
      const matchCat = (currentCategory === 'all' || item.category === currentCategory);
      const matchSearch = searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    // Sắp xếp sản phẩm theo tiêu chí (Giá tăng/giảm, Đánh giá)
    if (currentSort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating-desc') {
      filtered.sort((a, b) => b.ratingVal - a.ratingVal);
    }

    const countDisplay = document.getElementById('product-count-display');
    if (countDisplay) {
      countDisplay.textContent = `Hiển thị ${filtered.length} món thức uống`;
    }

    // Hiển thị giao diện rỗng khi không tìm thấy món ăn
    if (filtered.length === 0) {
      productGrid.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-state-icon"><i data-lucide="search-x" class="empty-state-lucide"></i></div>
          <h3 class="empty-state-title">Không tìm thấy thức uống phù hợp</h3>
          <p class="empty-state-desc">Hãy thử tìm kiếm với từ khóa khác hoặc chuyển danh mục nhé!</p>
          <button type="button" id="btn-reset-filter" class="btn btn-outline btn-sm empty-state-btn">Xem tất cả thức uống</button>
        </div>
      `;
      if (typeof refreshLucideIcons === 'function') refreshLucideIcons();
      document.getElementById('btn-reset-filter')?.addEventListener('click', () => {
        currentCategory = 'all';
        searchQuery = '';
        if (searchInputDesktop) searchInputDesktop.value = '';
        if (searchInputMobile) searchInputMobile.value = '';
        categoryPills.forEach(p => p.classList.toggle('active', p.dataset.category === 'all'));
        renderProducts();
      });
      return;
    }

    // Tạo HTML danh sách card sản phẩm
    productGrid.innerHTML = filtered.map(product => {
      const isOutOfStock = !product.inStock;
      
      // Rút gọn hiển thị rating (VD: "4.9★ 185+ đánh giá" -> "4.9 ★ (185+)")
      let formattedRating = product.rating || '';
      const matchRating = formattedRating.match(/^([\d.]+)\s*★?\s*(?:([\d++]+)\s*đánh giá)?/);
      if (matchRating && matchRating[1]) {
        formattedRating = matchRating[2] ? `${matchRating[1]} ★ (${matchRating[2]})` : `${matchRating[1]} ★`;
      }

      const badgeTypeClass = product.badgeType === 'green' ? 'badge-green' : product.badgeType === 'red' ? 'badge-red' : 'badge-gold';
      const badgeHtml = product.badge ? `
        <span class="product-badge ${badgeTypeClass}" title="${product.badge}">
          ${product.badge}
        </span>
      ` : '';

      return `
        <article class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-id="${product.id}">
          <div class="product-card-top">
            <div class="card-badges">
              <span class="rating-badge">${formattedRating}</span>
              ${badgeHtml}
            </div>

            <img 
              src="${product.image}" 
              alt="${product.title}" 
              class="product-card-image"
              loading="lazy"
              tabindex="0"
              role="button"
              aria-label="Xem chi tiết ${product.title}"
            />

            ${isOutOfStock ? `
              <div class="out-of-stock-overlay">
                <span class="out-of-stock-badge">Hết hàng</span>
              </div>
            ` : ''}
          </div>

          <div class="product-info">
            <h3 class="product-title" tabindex="0" role="button">${product.title}</h3>
            <p class="product-desc" title="${product.desc}">${product.desc}</p>
          </div>

          <div class="product-card-bottom">
            <div class="price-container">
              ${product.oldPrice ? `<span class="old-price">${formatMoney(product.oldPrice)}</span>` : ''}
              <span class="current-price">${formatMoney(product.price)}</span>
            </div>

            <button 
              type="button"
              class="btn-add-cart ${isOutOfStock ? 'disabled' : ''}" 
              data-id="${product.id}"
              aria-label="${isOutOfStock ? 'Thức uống đã hết hàng' : `Thêm ${product.title} vào giỏ hàng`}"
              ${isOutOfStock ? 'disabled' : ''}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>${isOutOfStock ? 'Hết' : 'Thêm'}</span>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Attach sự kiện click cho từng card sản phẩm (mở modal chi tiết và thêm nhanh vào giỏ)
    productGrid.querySelectorAll('.product-card').forEach(card => {
      const productId = card.dataset.id;
      const product = PRODUCTS.find(p => p.id === productId);

      const triggerEls = card.querySelectorAll('.product-card-image, .product-title');
      triggerEls.forEach(el => {
        el.addEventListener('click', () => { if (product) openProductDetail(product); });
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (product) openProductDetail(product);
          }
        });
      });

      const addBtn = card.querySelector('.btn-add-cart');
      if (addBtn && product && product.inStock) {
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          quickAddToCart(product);
        });
      }
    });

    // Hiệu ứng nghiêng 3D khi di chuột lên card (chỉ thiết bị hỗ trợ hover)
    if (window.matchMedia('(hover: hover)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      productGrid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => card.classList.add('tilt-active'));
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px) scale(1.015)`;
        });
        card.addEventListener('mouseleave', () => {
          card.classList.remove('tilt-active');
          card.style.transform = '';
        });
      });
    }

    if (revealObserver) {
      productGrid.querySelectorAll('.product-card').forEach((card, i) => {
        card.removeAttribute('data-animate');
        card.classList.remove('visible');
        card.setAttribute('data-animate', '');
        card.setAttribute('data-animate-delay', String(i % 4 + 1));
        revealObserver.observe(card);
      });
    }

    refreshLucideIcons();
  }

  // --- 2. CATEGORY & SEARCH EVENT LISTENERS (Lắng nghe sự kiện lọc & tìm kiếm) ---
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category || 'all';
      renderProducts();
    });
  });

  if (sortBySelect) {
    sortBySelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  const searchResultsDesktop = document.getElementById('search-results-desktop');
  const searchResultsMobile = document.getElementById('search-results-mobile');

  // Render danh sách gợi ý tìm kiếm (tối đa 5 kết quả) vào dropdown chỉ định
  function renderSearchDropdown(query, targetContainer) {
    if (!targetContainer) return;
    const q = query.trim().toLowerCase();
    if (!q) {
      targetContainer.classList.remove('active');
      targetContainer.innerHTML = '';
      return;
    }

    const matches = PRODUCTS.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    ).slice(0, 5);

    if (matches.length === 0) {
      targetContainer.innerHTML = `<div class="search-no-results">Không tìm thấy món phù hợp với "${query.trim()}"</div>`;
      targetContainer.classList.add('active');
      return;
    }

    const itemsHtml = matches.map(p => `
      <div class="search-result-item" data-id="${p.id}" tabindex="0" role="button">
        <img src="${p.image}" alt="${p.title}" class="search-result-thumb" />
        <div class="search-result-info">
          <div class="search-result-title">${p.title}</div>
          <div class="search-result-price">${formatMoney(p.price)}</div>
        </div>
      </div>
    `).join('');

    const viewAllHtml = `
      <a href="menu.html?search=${encodeURIComponent(query.trim())}" class="search-result-view-all">
        Xem tất cả kết quả cho "${query.trim()}" →
      </a>
    `;

    targetContainer.innerHTML = itemsHtml + viewAllHtml;
    targetContainer.classList.add('active');

    targetContainer.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = item.dataset.id;
        const prod = PRODUCTS.find(p => p.id === pId);
        if (prod) {
          openProductDetail(prod);
          targetContainer.classList.remove('active');
        }
      });
    });
  }

  // Kích hoạt dropdown tìm kiếm cho thanh tìm kiếm desktop hoặc mobile
  function handleSearchInput(query, isDesktop) {
    const container = isDesktop ? searchResultsDesktop : searchResultsMobile;
    renderSearchDropdown(query, container);
  }

  searchInputDesktop?.addEventListener('input', (e) => handleSearchInput(e.target.value, true));
  searchInputMobile?.addEventListener('input', (e) => handleSearchInput(e.target.value, false));

  // Xử lý submit tìm kiếm: chuyển hướng tới menu.html với param ?search=
  const handleSearchSubmit = (inputEl) => {
    const q = inputEl?.value.trim();
    if (q) {
      window.location.href = `menu.html?search=${encodeURIComponent(q)}`;
    }
  };

  searchInputDesktop?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit(searchInputDesktop);
    }
  });

  searchInputMobile?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit(searchInputMobile);
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-search') && !e.target.closest('.mobile-search-bar')) {
      searchResultsDesktop?.classList.remove('active');
      searchResultsMobile?.classList.remove('active');
    }
  });

  if (mobileSearchToggle && mobileSearchBar) {
    mobileSearchToggle.addEventListener('click', () => {
      mobileSearchBar.classList.toggle('active');
      if (mobileSearchBar.classList.contains('active')) {
        searchInputMobile?.focus();
      }
    });
  }

  // Tự động kiểm tra tham số URL ?search= khi khởi chạy
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  if (searchParam) {
    searchQuery = searchParam;
    if (searchInputDesktop) searchInputDesktop.value = searchParam;
    if (searchInputMobile) searchInputMobile.value = searchParam;
    if (productGrid) renderProducts();
  }

  // --- 3. SỰ KIỆN MODAL CHI TIẾT SẢN PHẨM (TÁO, SIZE, TOPPING, THÊM GIỐ) ---
  detailMinusBtn?.addEventListener('click', () => {
    if (detailQty > 1) {
      detailQty -= 1;
      if (detailQtyVal) detailQtyVal.textContent = detailQty;
      updateDetailTotalPrice();
    }
  });

  detailPlusBtn?.addEventListener('click', () => {
    detailQty += 1;
    if (detailQtyVal) detailQtyVal.textContent = detailQty;
    updateDetailTotalPrice();
  });

  btnDetailAddToCart?.addEventListener('click', () => {
    if (!activeDetailProduct) return;
    const detailToppingsContainer = document.getElementById('detail-toppings-container');
    const detailSpecialNotes = document.getElementById('detail-special-notes');

    let unitPrice = activeDetailProduct.price;
    const sizeLabel = detailSelectedSize === 'large' ? 'Cỡ Lớn (Size L) (+12.000đ)' : 'Tiêu Chuẩn (Size M)';
    if (detailSelectedSize === 'large') unitPrice += 12000;

    const toppingsList = [];
    if (detailToppingsContainer) {
      detailToppingsContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(chk => {
        toppingsList.push(chk.value);
        unitPrice += parseInt(chk.dataset.price, 10) || 0;
      });
    }

    cart.push({
      id: activeDetailProduct.id,
      title: activeDetailProduct.title,
      size: sizeLabel,
      toppings: toppingsList,
      note: detailSpecialNotes?.value.trim() || '',
      unitPrice: unitPrice,
      quantity: detailQty,
      image: activeDetailProduct.image
    });

    saveCart();
    closeProductDetail();
    showToast(`Đã thêm ${detailQty}x "${activeDetailProduct.title}" vào giỏ hàng!`, 'success');
  });

  closeDetailBtn?.addEventListener('click', closeProductDetail);
  detailBackdrop?.addEventListener('click', closeProductDetail);

  // --- 4. CHECKOUT WIZARD LOGIC (Quy trình thanh toán 4 bước) ---
  
  // HÀM 4.1: Mở Modal thanh toán Checkout
  function openCheckout() {
    if (cart.length === 0) {
      showToast('Giỏ hàng của bạn đang trống!', 'warning');
      return;
    }
    if (typeof getCurrentUser === 'function' && !getCurrentUser()) {
      showToast('Vui lòng đăng nhập tài khoản để tiến hành thanh toán!', 'warning');
      sessionStorage.setItem('ktd_auth_redirect', 'checkout.html');
      closeCartDrawer();
      if (typeof openAuthModal === 'function') openAuthModal('login');
      return;
    }
    closeCartDrawer();
    setCheckoutStep(1);
    renderOrderSummary();

    if (checkoutModal && checkoutBackdrop) {
      checkoutBackdrop.classList.add('active');
      detailBackdrop.classList.add('active');
      checkoutModal.classList.add('active');
      document.body.classList.add('has-modal-open');
    }
  }

  // HÀM 4.2: Đóng Modal thanh toán Checkout
  function closeCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    const detailBackdrop = document.getElementById('modal-backdrop');
    if (checkoutModal && detailBackdrop) {
      detailBackdrop.classList.remove('active');
      checkoutModal.classList.remove('active');
      document.body.classList.remove('has-modal-open');
      if (trackingInterval) clearInterval(trackingInterval);
    }
  }

  // HÀM 4.3: Chuyển bước trong Checkout Wizard (1: Giao Hàng, 2: Thanh Toán, 3: Xác Nhận, 4: Theo Dõi)
  function setCheckoutStep(step) {
    checkoutStep = step;
    checkoutSteps.forEach(stepEl => {
      const s = parseInt(stepEl.dataset.step, 10);
      stepEl.classList.toggle('active', s === step);
      stepEl.classList.toggle('completed', s < step);
    });
    stepBodies.forEach(body => {
      const s = parseInt(body.dataset.step, 10);
      body.classList.toggle('active', s === step);
    });
  }

  // HÀM 4.4: Tính toán tóm tắt đơn hàng (Tạm tính, Phí ship, Mã giảm giá, Tổng cộng)
  function renderOrderSummary() {
    const summarySubtotalVal = document.getElementById('summary-subtotal-val');
    const summaryShippingVal = document.getElementById('summary-shipping-val');
    const summaryFinalVal = document.getElementById('summary-final-val');
    const orderSummaryList = document.getElementById('order-summary-list');
    const voucherDiscountRow = document.getElementById('voucher-discount-row');
    const voucherDiscountVal = document.getElementById('voucher-discount-val');

    let subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    let shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;

    let discountAmount = 0;
    if (appliedDiscount) {
      if (appliedDiscount.code === 'KTDCOFFEE20' || appliedDiscount.code === 'KTDFOOD20') {
        discountAmount = Math.round(subtotal * 0.2);
      } else if (appliedDiscount.code === 'FREESHIP') {
        shippingFee = 0;
        discountAmount = STANDARD_SHIPPING_FEE;
      }
    }

    const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

    if (orderSummaryList) {
      orderSummaryList.innerHTML = cart.map(item => `
        <div class="order-summary-item">
          <div>
            <strong>${item.quantity}x</strong> ${item.title} 
            <span class="order-summary-item__meta">(${item.size})</span>
          </div>
          <div class="order-summary-item__price">${formatMoney(item.unitPrice * item.quantity)}</div>
        </div>
      `).join('');
    }

    if (summarySubtotalVal) summarySubtotalVal.textContent = formatMoney(subtotal);
    if (summaryShippingVal) {
      summaryShippingVal.textContent = shippingFee === 0 ? 'Miễn phí' : formatMoney(shippingFee);
    }

    if (voucherDiscountRow && voucherDiscountVal) {
      if (discountAmount > 0) {
        voucherDiscountRow.classList.remove('is-hidden');
        voucherDiscountVal.textContent = `-${formatMoney(discountAmount)}`;
      } else {
        voucherDiscountRow.classList.add('is-hidden');
      }
    }

    if (summaryFinalVal) summaryFinalVal.textContent = formatMoney(finalTotal);

    // Cập nhật số tiền và QR code cho các phương thức thanh toán (VietQR, MoMo, ZaloPay, COD)
    const modalVietQrAmount = document.getElementById('modal-vietqr-amount');
    const modalMomoAmount = document.getElementById('modal-momo-amount');
    const modalZaloPayAmount = document.getElementById('modal-zalopay-amount');
    const modalCodAmount = document.getElementById('modal-cod-amount');
    const modalQrImg = document.getElementById('qr-code-img');
    const modalMomoQrImg = document.getElementById('momo-qr-img');
    const modalZaloPayQrImg = document.getElementById('zalopay-qr-img');

    if (modalVietQrAmount) modalVietQrAmount.textContent = formatMoney(finalTotal);
    if (modalMomoAmount) modalMomoAmount.textContent = formatMoney(finalTotal);
    if (modalZaloPayAmount) modalZaloPayAmount.textContent = formatMoney(finalTotal);
    if (modalCodAmount) modalCodAmount.textContent = formatMoney(finalTotal);

    if (modalQrImg) {
      modalQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KTDCOFFEE_ORDER_${Math.round(finalTotal)}`;
    }
    if (modalMomoQrImg) {
      modalMomoQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=2|99|0901234567|DO%20MINH%20KHOA|ktdcoffee@gmail.com|0|0|${Math.round(finalTotal)}|KTD_COFFEE`;
    }
    if (modalZaloPayQrImg) {
      modalZaloPayQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://zalopay.vn/pay?amount=${Math.round(finalTotal)}%26note=KTD_COFFEE`;
    }
  }

  btnStep1Next?.addEventListener('click', () => {
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const addressInput = document.getElementById('checkout-address');

    if (!nameInput?.value.trim()) {
      showToast('Vui lòng nhập họ và tên nhận hàng!', 'error');
      nameInput?.focus();
      return;
    }
    if (!phoneInput?.value.trim() || phoneInput.value.trim().length < 9) {
      showToast('Vui lòng nhập số điện thoại hợp lệ!', 'error');
      phoneInput?.focus();
      return;
    }
    if (!addressInput?.value.trim()) {
      showToast('Vui lòng nhập địa chỉ giao hàng chi tiết!', 'error');
      addressInput?.focus();
      return;
    }

    setCheckoutStep(2);
  });

  paymentCards.forEach(card => {
    card.addEventListener('click', () => {
      paymentCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPaymentMethod = card.dataset.method;

      const vietQrShowcase = document.getElementById('vietqr-showcase');
      const momoShowcase = document.getElementById('momo-showcase');
      const zaloPayShowcase = document.getElementById('zalopay-showcase');
      const codShowcase = document.getElementById('cod-showcase');

      if (vietQrShowcase) vietQrShowcase.classList.toggle('is-hidden', selectedPaymentMethod !== 'vietqr');
      if (momoShowcase) momoShowcase.classList.toggle('is-hidden', selectedPaymentMethod !== 'momo');
      if (zaloPayShowcase) zaloPayShowcase.classList.toggle('is-hidden', selectedPaymentMethod !== 'zalopay');
      if (codShowcase) codShowcase.classList.toggle('is-hidden', selectedPaymentMethod !== 'cod');
    });
  });

  btnStep2Back?.addEventListener('click', () => setCheckoutStep(1));
  btnStep2Next?.addEventListener('click', () => {
    renderOrderSummary();
    setCheckoutStep(3);
  });
  btnStep3Back?.addEventListener('click', () => setCheckoutStep(2));

  applyVoucherBtn?.addEventListener('click', () => {
    const code = voucherInput?.value.trim().toUpperCase();
    if (code === 'KTDCOFFEE20' || code === 'KTDFOOD20') {
      appliedDiscount = { code: 'KTDCOFFEE20', percent: 20 };
      showToast('🎉 Đã áp dụng mã KTDCOFFEE20 (Giảm 20%)!', 'success');
      renderOrderSummary();
    } else if (code === 'FREESHIP') {
      appliedDiscount = { code: 'FREESHIP', freeShipping: true };
      showToast('🎉 Đã áp dụng mã FREESHIP (Miễn phí vận chuyển)!', 'success');
      renderOrderSummary();
    } else {
      showToast('Mã khuyến mãi không hợp lệ hoặc đã hết hạn!', 'error');
    }
  });

  btnStep3Submit?.addEventListener('click', () => {
    setCheckoutStep(4);
    cart = [];
    saveCart();
    showToast('🎉 Đặt hàng thành công! KTD-Coffee đang chuẩn bị thức uống cho bạn.', 'success');
    startOrderTrackingSimulation();
  });

  // Bắt đầu mô phỏng theo dõi đơn hàng real-time (tự động tăng bước mỗi 4.5 giây)
  function startOrderTrackingSimulation() {
    currentTrackingStep = 1;
    updateTrackingUI();

    if (trackingInterval) clearInterval(trackingInterval);
    trackingInterval = setInterval(() => {
      if (currentTrackingStep < 4) {
        currentTrackingStep += 1;
        updateTrackingUI();
      } else {
        clearInterval(trackingInterval);
      }
    }, 4500);
  }

  // Cập nhật trạng thái timeline theo dõi đơn hàng theo bước hiện tại
  function updateTrackingUI() {
    const steps = document.querySelectorAll('.tracking-timeline .timeline-step');
    steps.forEach(stepEl => {
      const s = parseInt(stepEl.dataset.step, 10);
      stepEl.classList.toggle('completed', s < currentTrackingStep);
      stepEl.classList.toggle('active', s === currentTrackingStep);
    });

    if (currentTrackingStep === 4) {
      showToast('🛵 Bác tài đã giao thức uống tới bạn! Chúc bạn thưởng thức ngon miệng!', 'success');
    }
  }

  document.getElementById('btn-simulate-tracking')?.addEventListener('click', () => {
    currentTrackingStep = (currentTrackingStep % 4) + 1;
    updateTrackingUI();
  });

  btnProceedCheckout?.addEventListener('click', (e) => {
    e.preventDefault();
    if (typeof getCurrentUser === 'function' && !getCurrentUser()) {
      showToast('Vui lòng đăng nhập tài khoản để tiến hành thanh toán!', 'warning');
      sessionStorage.setItem('ktd_auth_redirect', 'checkout.html');
      closeCartDrawer();
      if (typeof openAuthModal === 'function') openAuthModal('login');
      return;
    }

    if (window.location.pathname.endsWith('checkout.html')) {
      closeCartDrawer();
    } else {
      window.location.href = 'checkout.html';
    }
  });
  closeCheckoutBtn?.addEventListener('click', closeCheckout);
  checkoutBackdrop?.addEventListener('click', closeCheckout);

  document.querySelectorAll('.sample-address-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const addrInput = document.getElementById('checkout-address');
      if (addrInput) addrInput.value = chip.dataset.address || chip.textContent;
    });
  });

  // Lắng nghe sự kiện mở/đóng Giỏ hàng toàn cục (event delegation – hoạt động trên mọi trang)
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('.open-cart-btn, .cart-header-btn, .floating-cart-btn');
    if (openBtn) {
      e.preventDefault();
      openCartDrawer();
      return;
    }
    const closeBtn = e.target.closest('#close-cart-btn, #cart-backdrop');
    if (closeBtn) {
      e.preventDefault();
      closeCartDrawer();
      return;
    }
  });

  if (!document.getElementById('floating-cart-btn')) {
    const floatBtn = document.createElement('button');
    floatBtn.id = 'floating-cart-btn';
    floatBtn.className = 'floating-cart-btn open-cart-btn';
    floatBtn.setAttribute('aria-label', 'Xem giỏ hàng');
    floatBtn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      <span>Giỏ Hàng</span>
      <span class="floating-cart-badge" id="floating-cart-badge">0</span>
    `;
    document.body.appendChild(floatBtn);
  }

  // --- 5. ACCESSIBILITY BÀN PHÍM & HEADER DÍNH KHI CUỘN TRANG ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      closeProductDetail();
      closeCheckout();
    }
  });

  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  });

  // Khởi chạy lần đầu: render sản phẩm, giỏ hàng và badge số lượng
  renderProducts();
  renderCart();
  updateCartBadge();

  // --- 6. HIỆU ỨNG HIỆN KHI CUỘN TRANG (SCROLL REVEAL OBSERVER) ---
  revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach(el => revealObserver.observe(el));
  productGrid?.querySelectorAll('.product-card').forEach((card, i) => {
    card.setAttribute('data-animate', '');
    card.setAttribute('data-animate-delay', String(i % 4 + 1));
    revealObserver.observe(card);
  });

  // --- 7. BỘ ĐẾM NGƯỢC FLASH SALE ---
  (function initCountdown() {
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');
    if (!hoursEl) return;

    const stored = localStorage.getItem('ktd_flash_end');
    let endTime = stored ? parseInt(stored, 10) : 0;
    if (!stored || endTime < Date.now()) {
      endTime = Date.now() + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000;
      localStorage.setItem('ktd_flash_end', String(endTime));
    }

    const pad = n => String(n).padStart(2, '0');

    function tick() {
      const diff = Math.max(0, endTime - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      hoursEl.textContent = pad(h);
      minutesEl.textContent = pad(m);

      if (secondsEl.textContent !== pad(s)) {
        secondsEl.textContent = pad(s);
        secondsEl.classList.add('tick');
        setTimeout(() => secondsEl.classList.remove('tick'), 120);
      }

      if (diff === 0) {
        localStorage.removeItem('ktd_flash_end');
      }
    }

    tick();
    setInterval(tick, 1000);
  })();

  // --- 8. HOẠT ẢNH ĐẾM SỐ TĂNG DẦN (COUNT-UP ANIMATION) ---
  (function initCountUp() {
    const countEls = document.querySelectorAll('[data-count-up]');
    if (!countEls.length) return;

    const countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.countUp, 10);
        const dur = 1800;
        const start = performance.now();

        (function step(now) {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = Math.floor(eased * target);
          el.textContent = new Intl.NumberFormat('vi-VN').format(current) + '+';
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = new Intl.NumberFormat('vi-VN').format(target) + '+';
        })(start);

        countObserver.unobserve(el);
      });
    }, { threshold: 0.6 });

    countEls.forEach(el => countObserver.observe(el));
  })();

  // --- 9. TESTIMONIALS CAROUSEL (Xử lý cuộn slider đánh giá khách hàng) ---
  (function initTestimonialsCarousel() {
    const track = document.getElementById('testimonials-track');
    const dots = document.querySelectorAll('.testimonial-dot');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    if (!track) return;

    const total = track.children.length; // Tổng số thẻ đánh giá
    let current = 0;
    let timer = null;

    // Xác định số lượng thẻ hiển thị theo kích thước màn hình
    function visibleCount() {
      if (window.innerWidth >= 1280) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function slideWidth() { return 100 / visibleCount(); }

    // Ẩn/hiện dấu chấm phù hợp với số trang thực tế của thiết bị
    function updateDotsVisibility() {
      const max = Math.max(0, total - visibleCount());
      dots.forEach((d, i) => {
        d.style.display = i > max ? 'none' : '';
      });
    }

    // Hàm di chuyển slider tới vị trí chỉ định (Có xoay vòng Infinite Loop)
    function goTo(idx) {
      const max = Math.max(0, total - visibleCount());
      if (idx > max) {
        current = 0; // Quay về đầu khi bấm Next ở trang cuối
      } else if (idx < 0) {
        current = max; // Nhảy sang cuối khi bấm Prev ở trang đầu
      } else {
        current = idx;
      }
      updateDotsVisibility();
      track.style.transform = `translateX(-${current * slideWidth()}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    // Tự động chuyển slide sau mỗi 4.5 giây
    function start() {
      timer = setInterval(() => {
        goTo(current + 1);
      }, 4500);
    }

    function stop() { clearInterval(timer); }

    // Gán sự kiện click nút lùi (Prev <) và tiến (Next >)
    prevBtn?.addEventListener('click', () => { stop(); goTo(current - 1); start(); });
    nextBtn?.addEventListener('click', () => { stop(); goTo(current + 1); start(); });

    // Gán sự kiện click các dấu chấm chuyển slide
    dots.forEach(dot => dot.addEventListener('click', () => {
      stop(); goTo(parseInt(dot.dataset.idx, 10)); start();
    }));

    // Tạm dừng tự động cuộn khi di chuột vào slider
    track.addEventListener('mouseenter', stop);
    track.addEventListener('mouseleave', start);
    window.addEventListener('resize', () => {
      updateDotsVisibility();
      goTo(current);
    });

    updateDotsVisibility();
    goTo(0);
    start();
  })();

  // --- 10. ANIMATION ĐƯỜNG KẾ SECTION "CÁCH THỨC HOẠT ĐỘNG" ---
  (function initHowItWorksLine() {
    const howSection = document.querySelector('.how-section');
    if (!howSection) return;
    const lineObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          howSection.classList.add('line-visible');
          lineObserver.unobserve(howSection);
        }
      });
    }, { threshold: 0.45 });
    lineObserver.observe(howSection);
  })();

  // --- 11. FORM LIÊN HỆ & FAQ ACCORDION ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contact-name');
      const name = nameInput ? nameInput.value.trim() : 'Quý khách';
      showToast(`🎉 Cảm ơn ${name}! KTD-COFFEE đã nhận thông tin và sẽ liên hệ hỗ trợ bạn trong 15 phút.`, 'success');
      contactForm.reset();
    });
  }

  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const faqItem = btn.closest('.faq-item');
      if (!faqItem) return;
      const isAlreadyActive = faqItem.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });

      if (!isAlreadyActive) {
        faqItem.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const promoForm = document.querySelector('.promo-cta-form');
  if (promoForm) {
    promoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = promoForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim() && emailInput.value.includes('@')) {
        showToast('🎉 Đăng ký thành công! Mã giảm 30.000đ (KTDCOFFEE30) đã được gửi tới hòm thư của bạn.', 'success');
        emailInput.value = '';
        emailInput.blur();
      } else {
        showToast('Vui lòng nhập địa chỉ email hợp lệ!', 'warning');
      }
    });
  }

  // --- 12. ENGINE THANH TOÁN RIÊNG CHO TRANG CHECKOUT.HTML ---
  // Khởi tạo toàn bộ luồng thanh toán dành riêng cho trang checkout.html (4 bước)
  function initPageCheckout() {
    const pageCheckoutGrid = document.getElementById('page-checkout-container');
    const pageEmptyCart = document.getElementById('page-empty-cart');
    if (!pageCheckoutGrid || !pageEmptyCart) return;

    let pageCheckoutStep = 1;
    let pageAppliedDiscount = null;
    let pageSelectedPaymentMethod = 'vietqr';
    let pageTrackingStep = 1;
    let pageTrackingInterval = null;

    const pageSteps = document.querySelectorAll('.page-steps-bar .step-indicator');
    const pageStepBodies = document.querySelectorAll('.page-step-body');
    const btnPageStep1Next = document.getElementById('btn-page-step1-next');
    const btnPageStep2Back = document.getElementById('btn-page-step2-back');
    const btnPageStep2Next = document.getElementById('btn-page-step2-next');
    const btnPageStep3Back = document.getElementById('btn-page-step3-back');
    const btnPageStep3Submit = document.getElementById('btn-page-step3-submit');
    const pagePaymentCards = document.querySelectorAll('.payment-card-option[data-page-method]');
    const btnPageApplyVoucher = document.getElementById('btn-page-apply-voucher');
    const pageVoucherInput = document.getElementById('page-voucher-input');

    // Render và tính toán tóm tắt đơn hàng trong sidebar trang checkout.html
    function renderPageCheckout() {
      // Hiển thị trạng thái giỏ trống nếu chưa có sản phẩm và chưa ở bước 4
      if (cart.length === 0 && pageCheckoutStep !== 4) {
        pageEmptyCart.classList.remove('is-hidden');
        pageCheckoutGrid.classList.add('is-hidden');
        return;
      }

      pageEmptyCart.classList.add('is-hidden');
      pageCheckoutGrid.classList.remove('is-hidden');

      let subtotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
      let shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
      let discountAmount = 0;

      if (pageAppliedDiscount) {
        if (pageAppliedDiscount.code === 'KTDCOFFEE20' || pageAppliedDiscount.code === 'KTDFOOD20') {
          discountAmount = Math.round(subtotal * 0.2);
        } else if (pageAppliedDiscount.code === 'FREESHIP') {
          shippingFee = 0;
          discountAmount = STANDARD_SHIPPING_FEE;
        }
      }

      const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

      // Render danh sách món trong sidebar tóm tắt đơn hàng
      const sidebarItemsContainer = document.getElementById('page-cart-items-container');
      if (sidebarItemsContainer) {
        sidebarItemsContainer.innerHTML = cart.map((item) => {
          const itemTotal = item.unitPrice * item.quantity;
          const toppingText = item.toppings && item.toppings.length > 0 ? `+ ${item.toppings.join(', ')}` : '';
          const optionsText = [item.size, toppingText].filter(Boolean).join(' • ');

          return `
            <div class="sidebar-cart-item">
              <img src="${item.image}" alt="${item.title}" class="sidebar-cart-item__thumb" />
              <div class="sidebar-cart-item__details">
                <div class="sidebar-cart-item__title">${item.title}</div>
                <div class="sidebar-cart-item__options">${optionsText}</div>
                <div class="sidebar-cart-item__price">
                  ${item.quantity}x ${formatMoney(item.unitPrice)} = ${formatMoney(itemTotal)}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      // Tính và hiển thị các con số tám tắt đơn hàng trong sidebar
      const pageSidebarSubtotal = document.getElementById('page-sidebar-subtotal');
      const pageSidebarShipping = document.getElementById('page-sidebar-shipping');
      const pageSidebarDiscountRow = document.getElementById('page-sidebar-discount-row');
      const pageSidebarDiscount = document.getElementById('page-sidebar-discount');
      const pageSidebarTotal = document.getElementById('page-sidebar-total');

      if (pageSidebarSubtotal) pageSidebarSubtotal.textContent = formatMoney(subtotal);
      if (pageSidebarShipping) {
        pageSidebarShipping.textContent = shippingFee === 0 ? 'Miễn phí' : formatMoney(shippingFee);
      }

      if (pageSidebarDiscountRow && pageSidebarDiscount) {
        if (discountAmount > 0) {
          pageSidebarDiscountRow.classList.remove('is-hidden');
          pageSidebarDiscount.textContent = `-${formatMoney(discountAmount)}`;
        } else {
          pageSidebarDiscountRow.classList.add('is-hidden');
        }
      }
      if (pageSidebarTotal) pageSidebarTotal.textContent = formatMoney(finalTotal);

      // Thanh tiến trình miễn phí giao hàng trong sidebar
      const pageFreeShippingFill = document.getElementById('page-free-shipping-fill');
      const pageFreeShippingMsg = document.getElementById('page-free-shipping-msg');

      if (pageFreeShippingFill && pageFreeShippingMsg) {
        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
          pageFreeShippingFill.style.width = '100%';
          pageFreeShippingMsg.innerHTML = '🎉 <strong>Chúc mừng!</strong> Bạn đã được Miễn Phí Giao Hàng!';
        } else {
          const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
          const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
          pageFreeShippingFill.style.width = `${percent}%`;
          pageFreeShippingMsg.innerHTML = `Thêm <strong>${formatMoney(remaining)}</strong> để được <strong>Miễn Phí Giao Hàng!</strong>`;
        }
      }

      // Tính tổng tiền cho màn hình xác nhận đơn (Bước 3)
      const pageSummarySubtotalVal = document.getElementById('page-summary-subtotal-val');
      const pageSummaryShippingVal = document.getElementById('page-summary-shipping-val');
      const pageVoucherDiscountRow = document.getElementById('page-voucher-discount-row');
      const pageVoucherDiscountVal = document.getElementById('page-voucher-discount-val');
      const pageSummaryFinalVal = document.getElementById('page-summary-final-val');

      if (pageSummarySubtotalVal) pageSummarySubtotalVal.textContent = formatMoney(subtotal);
      if (pageSummaryShippingVal) {
        pageSummaryShippingVal.textContent = shippingFee === 0 ? 'Miễn phí' : formatMoney(shippingFee);
      }

      if (pageVoucherDiscountRow && pageVoucherDiscountVal) {
        if (discountAmount > 0) {
          pageVoucherDiscountRow.classList.remove('is-hidden');
          pageVoucherDiscountVal.textContent = `-${formatMoney(discountAmount)}`;
        } else {
          pageVoucherDiscountRow.classList.add('is-hidden');
        }
      }

      if (pageSummaryFinalVal) pageSummaryFinalVal.textContent = formatMoney(finalTotal);

      // Cập nhật số tiền và QR code cho các phương thức thanh toán trên trang checkout.html
      const pageVietQrAmount = document.getElementById('page-vietqr-amount');
      const pageMomoAmount = document.getElementById('page-momo-amount');
      const pageZaloPayAmount = document.getElementById('page-zalopay-amount');
      const pageCodAmount = document.getElementById('page-cod-amount');

      if (pageVietQrAmount) pageVietQrAmount.textContent = formatMoney(finalTotal);
      if (pageMomoAmount) pageMomoAmount.textContent = formatMoney(finalTotal);
      if (pageZaloPayAmount) pageZaloPayAmount.textContent = formatMoney(finalTotal);
      if (pageCodAmount) pageCodAmount.textContent = formatMoney(finalTotal);

      const pageQrImg = document.getElementById('page-qr-code-img');
      const pageMomoQrImg = document.getElementById('page-momo-qr-img');
      const pageZaloPayQrImg = document.getElementById('page-zalopay-qr-img');

      if (pageQrImg) {
        pageQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KTDCOFFEE_ORDER_${Math.round(finalTotal)}`;
      }
      if (pageMomoQrImg) {
        pageMomoQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=2|99|0901234567|DO%20MINH%20KHOA|ktdcoffee@gmail.com|0|0|${Math.round(finalTotal)}|KTD_COFFEE`;
      }
      if (pageZaloPayQrImg) {
        pageZaloPayQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://zalopay.vn/pay?amount=${Math.round(finalTotal)}%26note=KTD_COFFEE`;
      }
    }

    // Chuyển bước thanh toán trên trang checkout.html và cuộn mượt lên đầu form
    function setPageCheckoutStep(step) {
      pageCheckoutStep = step;
      pageSteps.forEach(stepEl => {
        const s = parseInt(stepEl.dataset.pageStep, 10);
        stepEl.classList.toggle('completed', s < pageCheckoutStep);
        stepEl.classList.toggle('active', s === pageCheckoutStep);
      });

      pageStepBodies.forEach(body => {
        const s = parseInt(body.dataset.pageStep, 10);
        body.classList.toggle('active', s === pageCheckoutStep);
      });

      renderPageCheckout();
      window.scrollTo({ top: pageCheckoutGrid.offsetTop - 80, behavior: 'smooth' });
    }

    // Bước 1 → Bước 2: Kiểm tra đăng nhập và thông tin giao hàng trước khi tiếp tục
    btnPageStep1Next?.addEventListener('click', () => {
      if (typeof getCurrentUser === 'function' && !getCurrentUser()) {
        showToast('Vui lòng đăng nhập tài khoản để tiến hành thanh toán!', 'warning');
        sessionStorage.setItem('ktd_auth_redirect', 'checkout.html');
        if (typeof openAuthModal === 'function') openAuthModal('login');
        return;
      }

      const nameInput = document.getElementById('page-checkout-name');
      const phoneInput = document.getElementById('page-checkout-phone');
      const addressInput = document.getElementById('page-checkout-address');

      if (!nameInput?.value.trim()) {
        showToast('Vui lòng nhập họ và tên nhận hàng!', 'error');
        nameInput?.focus();
        return;
      }
      if (!phoneInput?.value.trim() || phoneInput.value.trim().length < 9) {
        showToast('Vui lòng nhập số điện thoại hợp lệ!', 'error');
        phoneInput?.focus();
        return;
      }
      if (!addressInput?.value.trim()) {
        showToast('Vui lòng nhập địa chỉ giao hàng chi tiết!', 'error');
        addressInput?.focus();
        return;
      }

      setPageCheckoutStep(2);
    });

    // Chọn phương thức thanh toán và hiển thị panel QR tương ứng
    pagePaymentCards.forEach(card => {
      card.addEventListener('click', () => {
        pagePaymentCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        pageSelectedPaymentMethod = card.dataset.pageMethod;

        const qrShowcase = document.getElementById('page-vietqr-showcase');
        const momoShowcase = document.getElementById('page-momo-showcase');
        const zaloPayShowcase = document.getElementById('page-zalopay-showcase');
        const codShowcase = document.getElementById('page-cod-showcase');

        if (qrShowcase) qrShowcase.classList.toggle('is-hidden', pageSelectedPaymentMethod !== 'vietqr');
        if (momoShowcase) momoShowcase.classList.toggle('is-hidden', pageSelectedPaymentMethod !== 'momo');
        if (zaloPayShowcase) zaloPayShowcase.classList.toggle('is-hidden', pageSelectedPaymentMethod !== 'zalopay');
        if (codShowcase) codShowcase.classList.toggle('is-hidden', pageSelectedPaymentMethod !== 'cod');
      });
    });

    btnPageStep2Back?.addEventListener('click', () => setPageCheckoutStep(1));
    btnPageStep2Next?.addEventListener('click', () => {
      renderPageCheckout();
      setPageCheckoutStep(3);
    });

    btnPageStep3Back?.addEventListener('click', () => setPageCheckoutStep(2));

    // Áp dụng mã khuyến mãi và tính lại tổng đơn hàng
    btnPageApplyVoucher?.addEventListener('click', () => {
      const code = pageVoucherInput?.value.trim().toUpperCase();
      if (code === 'KTDCOFFEE20' || code === 'KTDFOOD20') {
        pageAppliedDiscount = { code: 'KTDCOFFEE20', percent: 20 };
        showToast('🎉 Đã áp dụng mã KTDCOFFEE20 (Giảm 20%)!', 'success');
        renderPageCheckout();
      } else if (code === 'FREESHIP') {
        pageAppliedDiscount = { code: 'FREESHIP', freeShipping: true };
        showToast('🎉 Đã áp dụng mã FREESHIP (Miễn phí vận chuyển)!', 'success');
        renderPageCheckout();
      } else {
        showToast('Mã khuyến mãi không hợp lệ hoặc đã hết hạn!', 'error');
      }
    });

    // Xác nhận đơn hàng (Bước 3 → Bước 4): lưu mã đơn, xóa giỏ, bắt đầu theo dõi
    btnPageStep3Submit?.addEventListener('click', () => {
      if (typeof getCurrentUser === 'function' && !getCurrentUser()) {
        showToast('Vui lòng đăng nhập tài khoản để hoàn tất đơn hàng!', 'warning');
        sessionStorage.setItem('ktd_auth_redirect', 'checkout.html');
        if (typeof openAuthModal === 'function') openAuthModal('login');
        return;
      }

      const orderId = '#KTD-' + Math.floor(1000 + Math.random() * 9000);
      const orderIdEl = document.getElementById('page-order-id-display');
      if (orderIdEl) orderIdEl.textContent = orderId;

      setPageCheckoutStep(4);
      cart = [];
      saveCart();
      showToast('🎉 Đặt hàng thành công! KTD-Coffee đang chuẩn bị thức uống cho bạn.', 'success');
      startPageTrackingSimulation();
    });

    // Bắt đầu mô phỏng theo dõi đơn hàng trên trang checkout.html (tự động tăng bước 4.5s)
    function startPageTrackingSimulation() {
      pageTrackingStep = 1;
      updatePageTrackingUI();

      if (pageTrackingInterval) clearInterval(pageTrackingInterval);
      pageTrackingInterval = setInterval(() => {
        if (pageTrackingStep < 4) {
          pageTrackingStep += 1;
          updatePageTrackingUI();
        } else {
          clearInterval(pageTrackingInterval);
        }
      }, 4500);
    }

    // Cập nhật trạng thái timeline theo dõi đơn hàng trên trang checkout.html
    function updatePageTrackingUI() {
      const steps = document.querySelectorAll('[data-page-track-step]');
      steps.forEach(stepEl => {
        const s = parseInt(stepEl.dataset.pageTrackStep, 10);
        stepEl.classList.toggle('completed', s < pageTrackingStep);
        stepEl.classList.toggle('active', s === pageTrackingStep);
      });

      if (pageTrackingStep === 4) {
        showToast('🛵 Bác tài đã giao thức uống tới bạn! Chúc bạn thưởng thức ngon miệng!', 'success');
      }
    }

    document.getElementById('btn-page-simulate-tracking')?.addEventListener('click', () => {
      pageTrackingStep = (pageTrackingStep % 4) + 1;
      updatePageTrackingUI();
    });

    document.querySelectorAll('.sample-address-chip-page').forEach(chip => {
      chip.addEventListener('click', () => {
        const addrInput = document.getElementById('page-checkout-address');
        if (addrInput) addrInput.value = chip.dataset.address || chip.textContent;
      });
    });

    document.addEventListener('ktd:auth-changed', () => {
      renderPageCheckout();
    });

    // Khởi chạy render lần đầu khi vào trang checkout.html
    renderPageCheckout();
  }

  initPageCheckout();
});
