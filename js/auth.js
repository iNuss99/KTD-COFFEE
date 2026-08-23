/**
 * --------------------------------------------------------------------------
 * MODULE XÁC THỰC VÀ VALIDATE CLIENT-SIDE (AUTH & VALIDATION - KTD-COFFEE)
 * --------------------------------------------------------------------------
 */

const KTD_USERS_KEY = 'ktd_users';
const KTD_CURRENT_USER_KEY = 'ktd_current_user';

// ==========================================
// 1. TRUY XUẤT DỮ LIỆU NGƯỜI DÙNG (LOCALSTORAGE HELPERS)
// ==========================================
// Lấy danh sách tất cả người dùng đã đăng ký từ LocalStorage
function getUsers() {
  try {
    const data = localStorage.getItem(KTD_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Lỗi khi đọc danh sách users từ localStorage:', e);
    return [];
  }
}

// Lưu danh sách người dùng đã cập nhật vào LocalStorage
function saveUsers(users) {
  try {
    localStorage.setItem(KTD_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Lỗi khi lưu danh sách users vào localStorage:', e);
  }
}

// Lấy thông tin tài khoản đang đăng nhập hiện tại (trả về null nếu chưa đăng nhập)
function getCurrentUser() {
  try {
    const data = localStorage.getItem(KTD_CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Lỗi khi đọc current user:', e);
    return null;
  }
}

// Lưu tài khoản đang đăng nhập vào LocalStorage (duy trì session)
function setCurrentUser(user) {
  try {
    localStorage.setItem(KTD_CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Lỗi khi lưu current user:', e);
  }
}

// Xóa session đăng nhập hiện tại khỏi LocalStorage (đăng xuất)
function removeCurrentUser() {
  try {
    localStorage.removeItem(KTD_CURRENT_USER_KEY);
  } catch (e) {
    console.error('Lỗi khi xóa current user:', e);
  }
}

// ==========================================
// 2. KIỂM TRA TÍNH HỢP LỆ DỮ LIỆU (VALIDATION HELPERS)
// ==========================================
// Kiểm tra chuỗi có đúng định dạng email hợp lệ không
function isValidEmail(val) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(val.trim());
}

// Kiểm tra số điện thoại VN hợp lệ: 10 số, đầu 03/05/07/08/09
function isValidPhone(val) {
  const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  return phoneRegex.test(val.trim());
}

// Kiểm tra val là email HOẶC số điện thoại VN hợp lệ (cho phép đăng nhập bằng cả hai)
function isValidEmailOrPhone(val) {
  const trimmed = val.trim();
  if (!trimmed) return false;
  return isValidEmail(trimmed) || isValidPhone(trimmed);
}

// Kiểm tra họ tên hợp lệ: phải có ít nhất 2 ký tự
function isValidFullName(val) {
  return val.trim().length >= 2;
}

// Kiểm tra mật khẩu hợp lệ: phải có ít nhất 6 ký tự
function isValidPassword(val) {
  return val.length >= 6;
}

// ==========================================
// 3. HIỂN THỊ / XÓA LỖI TRƯỜNG NHẬP LIỆU (FIELD ERROR HELPERS)
// ==========================================
// Đánh dấu trường nhập lỗi (is-invalid) và hiển thị nội dung thông báo lỗi
function showFieldError(inputElem, errorElem, message) {
  if (!inputElem || !errorElem) return;
  inputElem.classList.add('is-invalid');
  inputElem.classList.remove('is-valid');
  errorElem.textContent = message;
  errorElem.classList.remove('is-hidden');
}

// Xóa trạng thái lỗi, đánh dấu trường hợp lệ (is-valid) và ẩn thông báo
function clearFieldError(inputElem, errorElem) {
  if (!inputElem || !errorElem) return;
  inputElem.classList.remove('is-invalid');
  inputElem.classList.add('is-valid');
  errorElem.textContent = '';
  errorElem.classList.add('is-hidden');
}

// ==========================================
// 4. ĐIỀU KHIỂN MODAL XÁC THỰC (MỞ / ĐÓNG / CHUYỂN TAB)
// ==========================================
// Mở modal xác thực và chuyển sang tab chỉ định ('login' hoặc 'register')
function openAuthModal(defaultTab = 'login') {
  const authModal = document.getElementById('auth-modal');
  const backdrop = document.getElementById('modal-backdrop');
  if (!authModal || !backdrop) return;

  switchAuthTab(defaultTab);
  authModal.classList.add('active');
  backdrop.classList.add('active');
  document.body.classList.add('has-modal-open');
}

// Đóng modal xác thực; chỉ ẩn backdrop nếu không còn modal/drawer nào khác đang mở
function closeAuthModal() {
  const authModal = document.getElementById('auth-modal');
  const backdrop = document.getElementById('modal-backdrop');
  if (!authModal || !backdrop) return;

  authModal.classList.remove('active');
  
  // Chỉ tắt backdrop nếu cart drawer hoặc các modal khác không active
  const cartDrawer = document.getElementById('cart-drawer');
  const detailModal = document.getElementById('product-detail-modal');
  const checkoutModal = document.getElementById('checkout-modal');
  
  const isOtherActive = (cartDrawer && cartDrawer.classList.contains('active')) ||
                        (detailModal && detailModal.classList.contains('active')) ||
                        (checkoutModal && checkoutModal.classList.contains('active'));

  if (!isOtherActive) {
    backdrop.classList.remove('active');
    document.body.classList.remove('has-modal-open');
  }

  resetAuthForms();
}

// Chuyển đổi tab giữa đăng nhập và đăng ký, cập nhật aria-selected cho accessibility
function switchAuthTab(tabName) {
  const loginTabBtn = document.getElementById('auth-tab-login-btn');
  const regTabBtn = document.getElementById('auth-tab-register-btn');
  const loginPanel = document.getElementById('auth-login-form');
  const regPanel = document.getElementById('auth-register-form');

  if (!loginTabBtn || !regTabBtn || !loginPanel || !regPanel) return;

  if (tabName === 'login') {
    loginTabBtn.classList.add('active');
    loginTabBtn.setAttribute('aria-selected', 'true');
    regTabBtn.classList.remove('active');
    regTabBtn.setAttribute('aria-selected', 'false');
    loginPanel.classList.add('active');
    regPanel.classList.remove('active');
  } else {
    regTabBtn.classList.add('active');
    regTabBtn.setAttribute('aria-selected', 'true');
    loginTabBtn.classList.remove('active');
    loginTabBtn.setAttribute('aria-selected', 'false');
    regPanel.classList.add('active');
    loginPanel.classList.remove('active');
  }
}

// Reset toàn bộ input và xóa trạng thái lỗi/hợp lệ trong modal xác thực
function resetAuthForms() {
  const loginForm = document.getElementById('auth-login-form');
  const regForm = document.getElementById('auth-register-form');
  
  const loginContactErr = document.getElementById('login-contact-err');
  const loginPasswordErr = document.getElementById('login-password-err');
  const regFullnameErr = document.getElementById('reg-fullname-err');
  const regContactErr = document.getElementById('reg-contact-err');
  const regPasswordErr = document.getElementById('reg-password-err');
  const regConfirmErr = document.getElementById('reg-confirm-password-err');

  if (loginForm) loginForm.reset();
  if (regForm) regForm.reset();

  document.querySelectorAll('.auth-modal-card input').forEach(input => {
    input.classList.remove('is-invalid', 'is-valid');
  });

  const errors = [loginContactErr, loginPasswordErr, regFullnameErr, regContactErr, regPasswordErr, regConfirmErr];
  errors.forEach(err => {
    if (err) {
      err.textContent = '';
      err.classList.add('is-hidden');
    }
  });
}

// ==========================================
// 5. XỬ LÝ FORM ĐĂNG KÝ & ĐĂNG NHẬP
// ==========================================
// Validate từng trường form đăng ký; fieldName null → kiểm tra toàn bộ các trường
function validateRegisterField(fieldName) {
  let isValid = true;
  if (fieldName === 'name' || !fieldName) {
    const input = document.getElementById('reg-fullname');
    const err = document.getElementById('reg-fullname-err');
    if (input && err) {
      if (!isValidFullName(input.value)) {
        showFieldError(input, err, 'Họ và tên phải chứa ít nhất 2 ký tự');
        isValid = false;
      } else {
        clearFieldError(input, err);
      }
    }
  }

  if (fieldName === 'contact' || !fieldName) {
    const input = document.getElementById('reg-contact');
    const err = document.getElementById('reg-contact-err');
    if (input && err) {
      const val = input.value.trim();
      if (!val) {
        showFieldError(input, err, 'Vui lòng nhập Email hoặc Số điện thoại');
        isValid = false;
      } else if (!isValidEmailOrPhone(val)) {
        showFieldError(input, err, 'Email hoặc Số điện thoại (10 số VN) không đúng định dạng');
        isValid = false;
      } else {
        clearFieldError(input, err);
      }
    }
  }

  if (fieldName === 'password' || !fieldName) {
    const input = document.getElementById('reg-password');
    const err = document.getElementById('reg-password-err');
    if (input && err) {
      if (!isValidPassword(input.value)) {
        showFieldError(input, err, 'Mật khẩu phải chứa ít nhất 6 ký tự');
        isValid = false;
      } else {
        clearFieldError(input, err);
      }
    }
  }

  if (fieldName === 'confirm' || !fieldName) {
    const passInput = document.getElementById('reg-password');
    const confirmInput = document.getElementById('reg-confirm-password');
    const err = document.getElementById('reg-confirm-password-err');
    if (confirmInput && err && passInput) {
      if (!confirmInput.value) {
        showFieldError(confirmInput, err, 'Vui lòng nhập lại mật khẩu');
        isValid = false;
      } else if (confirmInput.value !== passInput.value) {
        showFieldError(confirmInput, err, 'Mật khẩu nhập lại không trùng khớp');
        isValid = false;
      } else {
        clearFieldError(confirmInput, err);
      }
    }
  }

  return isValid;
}

// Validate từng trường form đăng nhập; fieldName null → kiểm tra toàn bộ
function validateLoginField(fieldName) {
  let isValid = true;
  if (fieldName === 'contact' || !fieldName) {
    const input = document.getElementById('login-contact');
    const err = document.getElementById('login-contact-err');
    if (input && err) {
      if (!input.value.trim()) {
        showFieldError(input, err, 'Vui lòng nhập Email hoặc Số điện thoại');
        isValid = false;
      } else {
        clearFieldError(input, err);
      }
    }
  }

  if (fieldName === 'password' || !fieldName) {
    const input = document.getElementById('login-password');
    const err = document.getElementById('login-password-err');
    if (input && err) {
      if (!input.value) {
        showFieldError(input, err, 'Vui lòng nhập mật khẩu');
        isValid = false;
      } else {
        clearFieldError(input, err);
      }
    }
  }

  return isValid;
}

// Xử lý submit form đăng ký: validate → kiểm tra trùng email/SĐT → tạo tài khoản mới → đăng nhập luôn
function handleRegisterSubmit(e) {
  e.preventDefault();
  const isFormValid = validateRegisterField(null);
  if (!isFormValid) {
    if (typeof showToast === 'function') {
      showToast('Vui lòng kiểm tra lại các thông tin Đăng ký!', 'warning');
    }
    return;
  }

  const nameInput = document.getElementById('reg-fullname');
  const contactInput = document.getElementById('reg-contact');
  const passInput = document.getElementById('reg-password');
  const contactErr = document.getElementById('reg-contact-err');

  const contactVal = contactInput.value.trim().toLowerCase();
  const users = getUsers();

  // Kiểm tra trùng Email / Phone
  const existingUser = users.find(u => u.contact.toLowerCase() === contactVal);
  if (existingUser) {
    showFieldError(contactInput, contactErr, 'Email hoặc Số điện thoại này đã được đăng ký');
    if (typeof showToast === 'function') {
      showToast('Tài khoản đã tồn tại trên hệ thống!', 'error');
    }
    return;
  }

  // Tạo user mới
  const newUser = {
    id: 'user_' + Date.now(),
    name: nameInput.value.trim(),
    contact: contactVal,
    password: passInput.value,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  if (typeof showToast === 'function') {
    showToast(`Đăng ký thành công! Chào mừng ${newUser.name}`, 'success');
  }

  closeAuthModal();
  updateAuthHeaderUI();
  autofillCheckoutForm();
  document.dispatchEvent(new CustomEvent('ktd:auth-changed', { detail: { user: newUser } }));

  const authRedirect = sessionStorage.getItem('ktd_auth_redirect');
  if (authRedirect === 'checkout.html') {
    sessionStorage.removeItem('ktd_auth_redirect');
    if (!window.location.pathname.endsWith('checkout.html')) {
      window.location.href = 'checkout.html';
    }
  }
}

// Xử lý submit form đăng nhập: đối chiếu credentials → cập nhật session → cập nhật giao diện
function handleLoginSubmit(e) {
  e.preventDefault();
  const isFormValid = validateLoginField(null);
  if (!isFormValid) {
    if (typeof showToast === 'function') {
      showToast('Vui lòng nhập đầy đủ Email/SĐT và Mật khẩu!', 'warning');
    }
    return;
  }

  const contactInput = document.getElementById('login-contact');
  const passInput = document.getElementById('login-password');
  const passErr = document.getElementById('login-password-err');

  const contactVal = contactInput.value.trim().toLowerCase();
  const passVal = passInput.value;

  const users = getUsers();
  const foundUser = users.find(u => u.contact.toLowerCase() === contactVal && u.password === passVal);

  if (!foundUser) {
    showFieldError(passInput, passErr, 'Thông tin đăng nhập hoặc mật khẩu không chính xác');
    if (typeof showToast === 'function') {
      showToast('Đăng nhập thất bại. Kiểm tra lại thông tin!', 'error');
    }
    return;
  }

  setCurrentUser(foundUser);

  if (typeof showToast === 'function') {
    showToast(`Đăng nhập thành công! Rất vui được gặp lại ${foundUser.name}`, 'success');
  }

  closeAuthModal();
  updateAuthHeaderUI();
  autofillCheckoutForm();
  document.dispatchEvent(new CustomEvent('ktd:auth-changed', { detail: { user: foundUser } }));

  const authRedirect = sessionStorage.getItem('ktd_auth_redirect');
  if (authRedirect === 'checkout.html') {
    sessionStorage.removeItem('ktd_auth_redirect');
    if (!window.location.pathname.endsWith('checkout.html')) {
      window.location.href = 'checkout.html';
    }
  }
}

// Xử lý đăng xuất: xóa session, cập nhật header UI, phát sự kiện ktd:auth-changed
function handleLogout() {
  removeCurrentUser();
  if (typeof showToast === 'function') {
    showToast('Đã đăng xuất tài khoản thành công!', 'info');
  }
  updateAuthHeaderUI();
  autofillCheckoutForm();
  document.dispatchEvent(new CustomEvent('ktd:auth-changed', { detail: { user: null } }));
}

// ==========================================
// 6. CẬP NHẬT GIAO DIỆN HEADER & TỰ ĐIỀN FORM THANH TOÁN
// ==========================================
// Cập nhật khu vực tài khoản trên header: hiển thị avatar+tên nếu đã đăng nhập, nếu không hiện nút "Tài Khoản"
function updateAuthHeaderUI() {
  const currentUser = getCurrentUser();
  const userArea = document.getElementById('header-user-area');
  const drawerUserArea = document.getElementById('mobile-drawer-account');

  if (userArea) {
    if (currentUser) {
      // Tách lấy tên gọi (từ cuối cùng)
      const nameParts = currentUser.name.trim().split(' ');
      const shortName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : currentUser.name;
      const firstLetter = shortName.charAt(0).toUpperCase();

      userArea.innerHTML = `
        <div class="user-dropdown-wrap" id="user-dropdown-wrap">
          <button type="button" class="user-header-btn" id="user-menu-btn" aria-label="Menu tài khoản" aria-expanded="false">
            <span class="user-avatar-circle">${firstLetter}</span>
            <span class="user-short-name">Chào, ${shortName}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="user-dropdown-menu" id="user-dropdown-menu">
            <div class="user-dropdown-header">
              <div class="user-dropdown-name">${currentUser.name}</div>
              <div class="user-dropdown-email">${currentUser.contact}</div>
            </div>
            <button type="button" class="user-dropdown-item logout-item" id="logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      `;

      // Gắn listener mở dropdown
      const userBtn = document.getElementById('user-menu-btn');
      const dropdownMenu = document.getElementById('user-dropdown-menu');
      const logoutBtn = document.getElementById('logout-btn');

      if (userBtn && dropdownMenu) {
        userBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = dropdownMenu.classList.contains('active');
          dropdownMenu.classList.toggle('active', !isOpen);
          userBtn.setAttribute('aria-expanded', !isOpen);
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          handleLogout();
        });
      }

      // Toggle close khi click ra ngoài
      document.addEventListener('click', function closeDropdownOutside(e) {
        if (dropdownMenu && !userArea.contains(e.target)) {
          dropdownMenu.classList.remove('active');
          if (userBtn) userBtn.setAttribute('aria-expanded', 'false');
        }
      });

    } else {
      // Trạng thái chưa đăng nhập
      userArea.innerHTML = `
        <button type="button" class="auth-header-btn open-auth-btn" id="open-auth-btn" aria-label="Đăng nhập hoặc đăng ký tài khoản">
          <span class="cart-icon-wrap" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </span>
          <span class="cart-btn-label">Tài Khoản</span>
        </button>
      `;

      const openBtn = document.getElementById('open-auth-btn');
      if (openBtn) {
        openBtn.addEventListener('click', () => openAuthModal('login'));
      }
    }
  }

  if (drawerUserArea) {
    if (currentUser) {
      const nameParts = currentUser.name.trim().split(' ');
      const shortName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : currentUser.name;
      const firstLetter = shortName.charAt(0).toUpperCase();

      drawerUserArea.innerHTML = `
        <div class="drawer-account-box">
          <span class="drawer-account-avatar">${firstLetter}</span>
          <div class="drawer-account-info">
            <div class="drawer-account-name">${currentUser.name}</div>
            <div class="drawer-account-email">${currentUser.contact}</div>
          </div>
        </div>
        <button type="button" class="drawer-btn drawer-btn-outline" id="drawer-logout-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Đăng Xuất</span>
        </button>
      `;

      const drawerLogoutBtn = document.getElementById('drawer-logout-btn');
      if (drawerLogoutBtn) {
        drawerLogoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (typeof closeMobileNavDrawer === 'function') closeMobileNavDrawer();
          handleLogout();
        });
      }
    } else {
      drawerUserArea.innerHTML = `
        <button type="button" class="drawer-btn drawer-btn-primary" id="drawer-login-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Đăng Nhập / Đăng Ký</span>
        </button>
      `;

      const drawerLoginBtn = document.getElementById('drawer-login-btn');
      if (drawerLoginBtn) {
        drawerLoginBtn.addEventListener('click', () => {
          if (typeof closeMobileNavDrawer === 'function') closeMobileNavDrawer();
          openAuthModal('login');
        });
      }
    }
  }
}

// Tự động điền thông tin người dùng vào form thanh toán nếu đã đăng nhập
function autofillCheckoutForm() {
  const currentUser = getCurrentUser();
  const authBanner = document.getElementById('checkout-auth-banner');
  const loggedBanner = document.getElementById('checkout-auth-logged-banner');
  const loggedUserName = document.getElementById('checkout-logged-user-name');
  const loggedUserContact = document.getElementById('checkout-logged-user-contact');

  const nameInput = document.getElementById('page-checkout-name') || document.getElementById('checkout-fullname') || document.getElementById('checkout-name') || document.getElementById('fullname');
  const phoneInput = document.getElementById('page-checkout-phone') || document.getElementById('checkout-phone') || document.getElementById('phone');
  const emailInput = document.getElementById('page-checkout-email') || document.getElementById('checkout-email') || document.getElementById('email');

  if (currentUser) {
    if (authBanner) authBanner.classList.add('is-hidden');
    if (loggedBanner) {
      loggedBanner.classList.remove('is-hidden');
      if (loggedUserName) loggedUserName.textContent = currentUser.name;
      if (loggedUserContact) loggedUserContact.textContent = currentUser.contact;
    }

    if (nameInput && (!nameInput.value || nameInput.value === 'Nguyễn Văn A')) {
      nameInput.value = currentUser.name;
    }
    if (phoneInput && (!phoneInput.value || phoneInput.value === '0987654321')) {
      if (isValidPhone(currentUser.contact)) {
        phoneInput.value = currentUser.contact;
      }
    }
    if (emailInput && (!emailInput.value)) {
      if (isValidEmail(currentUser.contact)) {
        emailInput.value = currentUser.contact;
      }
    }
  } else {
    if (authBanner) authBanner.classList.remove('is-hidden');
    if (loggedBanner) loggedBanner.classList.add('is-hidden');
  }
}

// ==========================================
// 7. KHỞI TẠO MODULE & GẮN SỰ KIỆN
// ==========================================
// Gắn toàn bộ sự kiện cho modal xác thực: tab switching, form submit, real-time validation
function initAuthEvents() {
  // Cập nhật giao diện Header theo trạng thái lưu sẵn
  updateAuthHeaderUI();
  autofillCheckoutForm();

  // Tab switching
  const loginTabBtn = document.getElementById('auth-tab-login-btn');
  const regTabBtn = document.getElementById('auth-tab-register-btn');
  const switchToReg = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');
  const closeAuthBtn = document.getElementById('close-auth-modal-btn');
  const checkoutLoginBtn = document.getElementById('btn-checkout-login-now');

  if (loginTabBtn) loginTabBtn.addEventListener('click', () => switchAuthTab('login'));
  if (regTabBtn) regTabBtn.addEventListener('click', () => switchAuthTab('register'));
  if (switchToReg) switchToReg.addEventListener('click', () => switchAuthTab('register'));
  if (switchToLogin) switchToLogin.addEventListener('click', () => switchAuthTab('login'));
  if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeAuthModal);
  if (checkoutLoginBtn) checkoutLoginBtn.addEventListener('click', () => openAuthModal('login'));

  // Forms submit
  const regForm = document.getElementById('auth-register-form');
  const loginForm = document.getElementById('auth-login-form');

  if (regForm) regForm.addEventListener('submit', handleRegisterSubmit);
  if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

  // Real-time Inline Validation Listener
  const regName = document.getElementById('reg-fullname');
  const regContact = document.getElementById('reg-contact');
  const regPass = document.getElementById('reg-password');
  const regConfirm = document.getElementById('reg-confirm-password');

  if (regName) {
    regName.addEventListener('input', () => validateRegisterField('name'));
    regName.addEventListener('blur', () => validateRegisterField('name'));
  }
  if (regContact) {
    regContact.addEventListener('input', () => validateRegisterField('contact'));
    regContact.addEventListener('blur', () => validateRegisterField('contact'));
  }
  if (regPass) {
    regPass.addEventListener('input', () => {
      validateRegisterField('password');
      if (regConfirm && regConfirm.value) validateRegisterField('confirm');
    });
    regPass.addEventListener('blur', () => validateRegisterField('password'));
  }
  if (regConfirm) {
    regConfirm.addEventListener('input', () => validateRegisterField('confirm'));
    regConfirm.addEventListener('blur', () => validateRegisterField('confirm'));
  }

  const loginContact = document.getElementById('login-contact');
  const loginPass = document.getElementById('login-password');

  if (loginContact) {
    loginContact.addEventListener('input', () => validateLoginField('contact'));
    loginContact.addEventListener('blur', () => validateLoginField('contact'));
  }
  if (loginPass) {
    loginPass.addEventListener('input', () => validateLoginField('password'));
    loginPass.addEventListener('blur', () => validateLoginField('password'));
  }
}

// Khởi chạy module khi DOM đã tải xong
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthEvents);
} else {
  initAuthEvents();
}
