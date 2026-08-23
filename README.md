# ☕ KTD-COFFEE — Specialty Coffee & Bakery E-Commerce Platform

> **Hệ Thống Website Thương Mại Điện Tử Đặt Cà Phê Mộc & Trà Thủ Công Trực Tuyến Hiện Đại, Tối Ưu Trải Nghiệm Người Dùng (UI/UX) & Chuẩn SEO / WCAG AA**

---

## 📌 Mục Lục

- [1. Tổng Quan Dự Án](#1-tổng-quan-dự-án)
- [2. Điểm Nổi Bật \& Triết Lý Thiết Kế (UI/UX)](#2-điểm-nổi-bật--triết-lý-thiết-kế-uiux)
- [3. Kiến Trúc \& Công Nghệ Sử Dụng](#3-kiến-trúc--công-nghệ-sử-dụng)
- [4. Cấu Trúc Thư Mục Dự Án](#4-cấu-trúc-thư-mục-dự-án)
- [5. Chi Tiết Các Trang \& Tính Năng Hệ Thống](#5-chi-tiết-các-trang--tính-năng-hệ-thống)
  - [5.1. Trang Chủ (`index.html`)](#51-trang-chủ-indexhtml)
  - [5.2. Trang Thực Đơn (`menu.html`)](#52-trang-thực-đơn-menuhtml)
  - [5.3. Trang Giới Thiệu (`about.html`)](#53-trang-giới-thiệu-abouthtml)
  - [5.4. Trang Liên Hệ (`contact.html`)](#54-trang-liên-hệ-contacthtml)
  - [5.5. Trang Thanh Toán Độc Lập (`checkout.html`)](#55-trang-thanh-toán-độc-lập-checkouthtml)
  - [5.6. Các Modal \& Drawer Dùng Chung](#56-các-modal--drawer-dùng-chung)
- [6. Quản Lý Trạng Thái (State) \& Dữ Liệu Client](#6-quản-lý-trạng-thái-state--dữ-liệu-client)
  - [6.1. Cấu Trúc Sản Phẩm (`PRODUCTS`)](#61-cấu-trúc-sản-phẩm-products)
  - [6.2. Quản Lý Giỏ Hàng (`ktd_coffee_cart`)](#62-quản-lý-giỏ-hàng-ktd_coffee_cart)
  - [6.3. Hệ Thống Xác Thực Tài Khoản (`ktd_users` \& `ktd_current_user`)](#63-hệ-thống-xác-thực-tài-khoản-ktd_users--ktd_current_user)
  - [6.4. Danh Sách Mã Khuyến Mãi Hỗ Trợ](#64-danh-sách-mã-khuyến-mãi-hỗ-trợ)
- [7. Design System \& Bảng Màu Thương Hiệu](#7-design-system--bảng-màu-thương-hiệu)
- [8. Hướng Dẫn Cài Đặt \& Chạy Local Server](#8-hướng-dẫn-cài-đặt--chạy-local-server)
- [9. Bộ Tiêu Chuẩn Chất Lượng \& Accessibility (WCAG AA)](#9-bộ-tiêu-chuẩn-chất-lượng--accessibility-wcag-aa)
- [10. Thông Tin Bản Quyền](#10-thông-tin-bản-quyền)

---

## 🌟 1. Tổng Quan Dự Án

**KTD-COFFEE** là một nền tảng web thương mại điện tử chuyên biệt cho chuỗi cà phê rang mộc cao cấp và trà thủ công chuẩn vị Việt (Specialty Coffee & Bakery). Website cung cấp giải pháp đặt hàng trực tuyến toàn diện:
- Khám phá thức uống hạt Arabica & Robusta Cầu Đất nguyên chất.
- Tùy biến linh hoạt kích cỡ (Size M / L), Topping (Kem Cheese Macchiato, Shot Espresso, Thạch cà phê, Trân châu 3Q...) và ghi chú mức đường/đá.
- Quản lý giỏ hàng thông minh với thanh tiến trình Miễn Phí Giao Hàng (Freeship bar).
- Xác thực người dùng Client-Side (Đăng nhập / Đăng ký) với tính năng duy trì phiên làm việc và tự động điền form checkout.
- Quy trình thanh toán 4 bước trực quan (VietQR tự động tạo mã QR, MoMo, ZaloPay, COD) kèm mô phỏng theo dõi tiến trình pha chế & giao hàng hỏa tốc trong 15 phút.

### Thông Tin Thương Hiệu
- **Thương hiệu:** KTD-COFFEE (Đậm Vị Cà Phê Mộc - Khởi Nguồn Cảm Hứng).
- **Đối tượng sử dụng:** Giới trẻ, nhân viên văn phòng, người yêu thích cà phê rang mộc nguyên chất và đồ uống thanh mát.
- **Ngôn ngữ:** Tiếng Việt (100% chuẩn mã hóa UTF-8 sạch, hiển thị chính xác mọi dấu thanh).

---

## 💎 2. Điểm Nổi Bật & Triết Lý Thiết Kế (UI/UX)

1. **Hiệu Ứng Điện Ảnh (Cinematic Hero Showcase):**
   - Video nền độ phân giải cao quay cận cảnh pha chế espresso kết hợp lớp phủ Gradient chuyển màu mềm mại, làm nổi bật thông tin thương hiệu và các nút kêu gọi hành động (CTA).
2. **Glassmorphism & Micro-Interactions:**
   - Sticky Header với hiệu ứng kính mờ (`backdrop-filter: blur(12px)`).
   - Thẻ sản phẩm với hiệu ứng đổ bóng đa tầng (Elevation Depth), phóng to khi di chuột (Hover Lift) và hiệu ứng nghiêng 3D (3D Tilt effect).
3. **Giỏ Hàng Trượt (Slide-over Cart Drawer) & Free Shipping Tracker:**
   - Mở nhanh từ thanh điều hướng header hoặc nút trôi nổi (Floating Cart Button).
   - Thanh tiến trình tính toán tự động số tiền còn thiếu để đạt mốc **Miễn Phí Giao Hàng** (Ngưỡng mặc định: `150.000đ`).
4. **Modal Tùy Biến Thức Uống (Drink Customizer):**
   - Lựa chọn kích cỡ (Size M 350ml / Size L 500ml +12.000đ), chọn nhiều topping cùng lúc, nhập ghi chú đặc biệt cho Barista. Giá tiền tự động tính toán và cập nhật theo thời gian thực.
5. **Quy Trình Thanh Toán 4 Bước (Checkout Wizard):**
   - **Bước 1:** Nhập thông tin nhận hàng (Họ tên, SĐT, Địa chỉ).
   - **Bước 2:** Chọn phương thức thanh toán (VietQR tự động tạo mã QR theo giá trị đơn, MoMo, ZaloPay, Tiền mặt COD).
   - **Bước 3:** Áp dụng mã Voucher (`KTDCOFFEE20`, `FREESHIP`) và rà soát đơn hàng.
   - **Bước 4:** Màn hình xác nhận thành công với mã vận đơn tự động (`#KTD-XXXX`) và dòng thời gian (timeline) theo dõi 4 giai đoạn giao hàng 15 phút.
6. **Module Xác Thực & Validate Client-Side (Client-Side Auth Engine):**
   - Modal 2 tab mượt mà (Đăng nhập / Đăng ký) dùng chung backdrop.
   - Lưu trữ danh sách tài khoản (`ktd_users`) và tài khoản hiện tại (`ktd_current_user`) trong `localStorage`.
   - Kiểm tra dữ liệu Real-time Inline (Email, Số điện thoại Việt Nam 10 số, Họ tên >= 2 ký tự, Mật khẩu >= 6 ký tự).
   - Tự động thay đổi nút Header thành Avatar + "Chào, [Tên]" kèm menu Đăng xuất khi đã đăng nhập.
7. **Instant Search & Live Filter:**
   - Khung tìm kiếm gợi ý sản phẩm tức thì (Instant Dropdown) ngay khi gõ từ khóa trên Header desktop & mobile.
   - Bộ lọc 6 danh mục kết hợp với sắp xếp giá (Tăng/Giảm) và đánh giá sao.
8. **Mobile Navigation Left Drawer & Touch Targets (WCAG AA):**
   - Hamburger Menu trượt từ bên trái (`#mobile-nav-drawer`) cho màn hình di động (< 1024px).
   - Kích thước Touch Target tối thiểu 44px x 44px cho mọi phần tử tương tác trên thiết bị cảm ứng.

---

## 🛠️ 3. Kiến Trúc & Công Nghệ Sử Dụng

Dự án được xây dựng theo chuẩn **Vanilla Web Standard** hiện đại, tối ưu tốc độ tải trang và không phụ thuộc vào các framework bên ngoài:

- **HTML5 Semantic & Accessibility (WCAG AA):** Sử dụng các thẻ cấu trúc chuẩn (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<aside>`, `<footer>`), nhãn ẩn, và thuộc tính ARIA (`aria-expanded`, `aria-hidden`, `aria-selected`, `aria-live`).
- **CSS3 Pure (Modular 7-1 Pattern):** Kiến trúc CSS chia nhỏ theo mô-đun (`css/base/`, `css/components/`, `css/pages/`) được nạp qua `css/style.css`. Sử dụng CSS Custom Properties (Variables), Flexbox, CSS Grid, Media Queries đa điểm ngắt.
- **Vanilla JavaScript (ES6+ Modular):** Phân tách logic theo vai trò (`products.js`, `cart.js`, `auth.js`, `ui.js`, `main.js`), giao tiếp qua Custom Events (`ktd:auth-changed`), bất đồng bộ (`async/await`, `fetch`), LocalStorage API, và IntersectionObserver API.
- **Typography System:**
  - Font tiêu đề: `Plus Jakarta Sans` (Hiện đại, khỏe khoắn).
  - Font nội dung: `Be Vietnam Pro` (Tối ưu hiển thị Tiếng Việt).
- **Bộ Mã Hóa File:** Chuẩn UTF-8 sạch trên tất cả các file nguồn.

---

## 📁 4. Cấu Trúc Thư Mục Dự Án

```text
KTD-COFFEE - Prototype/
├── index.html              # Trang chủ: Hero Video, Bestsellers, Cam kết, Carousel Đánh giá, FAQ
├── menu.html               # Trang thực đơn: 6 danh mục, Live Search, Sắp xếp giá & Đánh giá
├── about.html              # Trang giới thiệu: Câu chuyện hạt Cầu Đất, Nông trại, Đội ngũ Barista
├── contact.html            # Trang liên hệ: Form nhắn tin, Danh sách 3 chi nhánh (HN, HCM, ĐN), FAQ
├── checkout.html           # Trang thanh toán riêng biệt (Checkout 4 bước & Quản lý giỏ hàng)
├── README.md               # Tài liệu tổng quan & hướng dẫn kỹ thuật dự án
├── partials/               # Các tệp HTML thành phần dùng chung
│   ├── header-partial.html # Header động được nạp bằng fetch()
│   └── footer-partial.html # Footer động được nạp bằng fetch()
├── css/                    # Hệ thống thiết kế CSS (Mô-đun hóa 7-1 Pattern)
│   ├── base/               # Cấu hình nền tảng & biến giao diện
│   │   ├── variables.css   # Biến CSS: Màu sắc, Typography, Shadow, Spacing
│   │   ├── base.css        # CSS Reset, Typography base, Keyframe animations
│   │   └── state.css       # Các lớp trạng thái dùng chung (.is-hidden, .active...)
│   ├── components/         # Các linh kiện UI tái sử dụng
│   │   ├── header.css      # Sticky Header glassmorphism & Navigation
│   │   ├── footer.css      # Footer thông tin & Newsletter form
│   │   ├── card.css        # Product card, Tilt effect, Badges
│   │   ├── modal.css       # Cart drawer, Drink customizer modal, Auth modal & Mobile Nav drawer
│   │   ├── form.css        # Form inputs, Step indicators, Payment cards
│   │   └── toast.css       # Toast notifications engine
│   ├── pages/              # Kiểu dáng riêng cho từng trang cụ thể
│   │   ├── home.css        # Hero Section, Flash Sale, Testimonials carousel
│   │   ├── menu.css        # Category pills, Filter bar, Grid layout
│   │   ├── about.css       # Story section, Values, Barista profiles
│   │   ├── contact.css     # Contact form, Branch cards, FAQ accordion
│   │   └── checkout.css    # Layout trang checkout.html độc lập
│   └── style.css           # Entry point nạp toàn bộ CSS qua @import
├── js/                     # Mã nguồn xử lý JavaScript
│   ├── products.js         # Dữ liệu 8 thức uống mẫu (PRODUCTS) & helper formatMoney()
│   ├── cart.js             # Engine giỏ hàng (cartStore, LocalStorage, Freeship bar)
│   ├── auth.js             # Module Xác thực Client-Side (Signup, Login, Logout, Validation)
│   ├── ui.js               # UI Helpers (Toast, Product detail modal, Dynamic Header/Footer, Mobile drawer)
│   └── main.js             # Controller chính (Product grid, Search/Filter, Checkout Wizard, Animations)
└── assets/                 # Tài nguyên đa phương tiện
    ├── images/             # Hình ảnh logo, đồ uống & trang trí (.svg, .png)
    └── videos/             # Video ẩm thực chất lượng cao (.mp4)
        └── buger01.mp4     # Video pha chế làm nền cho Hero Section
```

---

## 📄 5. Chi Tiết Các Trang & Tính Năng Hệ Thống

### 5.1. Trang Chủ (`index.html`)
- **Header Glassmorphic:** Tự động nạp qua `loadHeaderDynamic()`, hỗ trợ tự động đánh dấu link active cho trang hiện tại.
- **Hero Video Showcase:** Video pha chế espresso chất lượng cao, dòng thông điệp *"Đậm Vị Cà Phê Mộc - Khởi Nguồn Cảm Hứng"* và nút chuyển nhanh tới thực đơn.
- **Trust Badges (4 Cam kết):** 100% Cà Phê Rang Mộc, Giao Hỏa Tốc 15 Phút, Barista Chuyên Nghiệp SCA, Bao Bì Sinh Thái 100%.
- **Flash Sale & Bestseller Grid:** Hiển thị danh sách thức uống bán chạy kèm đồng hồ đếm ngược Flash Sale (`initCountdown`).
- **How It Works (Quy trình 3 bước):** Chọn thức uống $\rightarrow$ Barista chiết xuất tươi $\rightarrow$ Giao ly giữ nhiệt 15 phút.
- **Social Proof Counter:** Animation đếm số tăng dần khi cuộn trang (1.000.000+ Ly cà phê, 99.6% Giao đúng hẹn, 15 Chi nhánh).
- **Testimonials Carousel:** Slider 6 đánh giá khách hàng với nút Prev/Next, chấm chỉ số (Dots) và cơ chế tự động xoay vòng.
- **Newsletter Box:** Đăng ký email nhận mã giảm giá `KTDCOFFEE30` (30.000đ).

### 5.2. Trang Thực Đơn (`menu.html`)
- **Thanh danh mục (6 Danh mục):** Tất Cả, Cà Phê Truyền Thống (`traditional`), Espresso & Specialty (`espresso`), Cold Brew Ủ Lạnh (`coldbrew`), Trà Trái Cây & Sữa (`tea`), Bánh & Tráng Miệng (`pastry`).
- **Bộ lọc & Sắp xếp:** Sắp xếp theo Giá tăng dần (`price-asc`), Giá giảm dần (`price-desc`), Đánh giá cao nhất (`rating-desc`).
- **Live Search Input:** Tự động lọc sản phẩm trên giao diện và hiển thị dropdown kết quả nhanh khi nhập từ khóa. Hỗ trợ truyền tham số tìm kiếm qua URL `menu.html?search=...`.

### 5.3. Trang Giới Thiệu (`about.html`)
- Giới thiệu hành trình hạt cà phê Arabica & Robusta Cầu Đất ở độ cao 1.500m.
- Quy trình rang mộc mẻ nhỏ (Small-batch artisan roast) bảo toàn lượng dầu thơm tự nhiên.
- Hồ sơ đội ngũ Head Baristas đạt chứng chỉ SCA quốc tế và Q-Graders nếm thử.

### 5.4. Trang Liên Hệ (`contact.html`)
- **Form gửi thắc mắc / Đặt tiệc cà phê:** Tích hợp kiểm tra dữ liệu và thông báo Toast xác nhận thành công.
- **Danh sách 3 chi nhánh trung tâm:** TP. Hồ Chí Minh, Hà Nội, Đà Nẵng (Hiển thị địa chỉ, giờ mở cửa, hotline).
- **FAQ Accordion:** Giải đáp các câu hỏi thường gặp về độ giữ nhiệt/lạnh, hóa đơn VAT và thời gian giao hàng.

### 5.5. Trang Thanh Toán Độc Lập (`checkout.html`)
- Cung cấp giao diện thanh toán dạng trang độc lập bên cạnh Modal Checkout.
- Tóm tắt danh sách món trong đơn, phí vận chuyển và tiến trình Freeship bar.
- Cho phép áp dụng các mã giảm giá, lựa chọn phương thức thanh toán VietQR / MoMo / ZaloPay / COD và theo dõi hành trình đơn hàng real-time.

### 5.6. Các Modal & Drawer Dùng Chung
- **Slide-over Cart Drawer (`#cart-drawer`):** Hiển thị danh sách món đã chọn, điều chỉnh số lượng (+/-), xóa món, và tính toán số tiền còn thiếu để được miễn phí giao hàng.
- **Drink Customizer Modal (`#product-detail-modal`):** Cho phép chọn Size (Size M / Size L +12.000đ), tích chọn topping, nhập ghi chú cho Barista và xem tổng tiền tức thì.
- **Auth Modal (`#auth-modal`):** Chuyển đổi 2 tab Đăng nhập / Đăng ký, hiển thị thông báo lỗi trực tiếp bên dưới các ô input (Inline Validation).
- **Mobile Nav Left Drawer (`#mobile-nav-drawer`):** Trượt mượt từ bên trái màn hình di động, tích hợp tìm kiếm nhanh, các liên kết điều hướng và khu vực tài khoản người dùng.

---

## 📊 6. Quản Lý Trạng Thái (State) & Dữ Liệu Client

### 6.1. Cấu Trúc Sản Phẩm (`PRODUCTS`)
Dữ liệu sản phẩm được lưu trữ tại `js/products.js`:
```javascript
{
  id: 'coffee-01',
  title: 'Bạc Xỉu Sữa Dừa Kem Béo',
  category: 'traditional',
  price: 39000,
  oldPrice: 49000,
  rating: '4.9★ 185+ đánh giá',
  ratingVal: 4.9,
  desc: 'Hạt Robusta Cầu Đất đậm đà kết hợp sữa đặc ngọt thanh, cốt dừa Bến Tre béo ngậy và lớp foam bồng bềnh.',
  image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
  badge: 'Bestseller',
  badgeType: 'gold',
  inStock: true,
  toppings: [
    { id: 'top-espresso-shot', name: 'Thêm 1 Shot Espresso', price: 10000 },
    { id: 'top-cheese-foam', name: 'Thêm Kem Cheese Macchiato', price: 12000 },
    { id: 'top-coffee-jelly', name: 'Thạch Cà Phê Giòn Dai', price: 8000 },
    { id: 'top-boba-white', name: 'Trân Châu Trắng 3Q', price: 8000 }
  ]
}
```

### 6.2. Quản Lý Giỏ Hàng (`ktd_coffee_cart`)
- Mảng `cart` được lưu tự động vào `localStorage` dưới key `ktd_coffee_cart`.
- Hằng số cấu hình: `FREE_SHIPPING_THRESHOLD = 150000` (150.000đ) và `STANDARD_SHIPPING_FEE = 20000` (20.000đ).
- Helper `formatMoney(amount)` hỗ trợ chuyển đổi số nguyên thành chuỗi tiền tệ chuẩn Việt Nam (ví dụ: `39000` $\rightarrow$ `"39.000đ"`).

### 6.3. Hệ Thống Xác Thực Tài Khoản (`ktd_users` & `ktd_current_user`)
- Danh sách tài khoản người dùng đăng ký lưu trữ tại key `ktd_users`.
- Phiên làm việc của tài khoản hiện tại được duy trì tại key `ktd_current_user`.
- Sự kiện tùy biến `ktd:auth-changed` phát ra trên `document` giúp đồng bộ giao diện Header và tự động điền form checkout (`autofillCheckoutForm`).

### 6.4. Danh Sách Mã Khuyến Mãi Hỗ Trợ
- `KTDCOFFEE20` / `KTDFOOD20`: Giảm 20% trên tổng giá trị các món trong đơn hàng.
- `FREESHIP`: Miễn 100% phí giao hàng (Trị giá 20.000đ).
- `KTDCOFFEE30`: Giảm 30.000đ cho thành viên đăng ký bản tin.

---

## 🎨 7. Design System & Bảng Màu Thương Hiệu

Tất cả các biến thiết kế được tập trung tại `css/base/variables.css`:

```css
:root {
  /* Brand Color Palette */
  --color-primary: #C86A2B;          /* Nâu hổ phách ấm cho buttons, badges, CTAs */
  --color-primary-hover: #A8521C;    /* Nâu đậm khi hover */
  --color-primary-light: #FDF3E8;    /* Nền hổ phách nhạt cho chips, icons */
  --color-gold: #E58E26;             /* Vàng Caramel điểm nhấn */
  --color-success: #1E8E5A;          /* Xanh Matcha cho trạng thái hoàn thành / Freeship */

  /* Neutral & Surfaces */
  --color-bg: #FAF6F0;               /* Tone kem sữa ấm dịu mắt */
  --color-card: #FFFFFF;             /* Nền thẻ nội dung */
  --color-border: #EFE7DC;           /* Viền mềm mại */
  --color-text-primary: #2A1B14;     /* Chữ nâu cà phê sẫm (Tương phản WCAG AAA 14:1) */
  --color-text-secondary: #6E5D53;   /* Chú thích màu nâu khói */
}
```

---

## 🚀 8. Hướng Dẫn Cài Đặt & Chạy Local Server

Vì ứng dụng được phát triển bằng chuẩn **Vanilla Web Standard** (HTML/CSS/JS thuần), bạn không cần cài đặt các công cụ biên dịch phức tạp:

### Cách 1: Chạy Bằng Live Server (Khuyên Dùng)
Để tính năng nạp partials (`partials/header-partial.html` & `partials/footer-partial.html`) thông qua `fetch()` hoạt động mượt mà không bị chặn CORS cục bộ:
1. Mở thư mục dự án `KTD-COFFEE - Prototype` trong **VS Code**.
2. Cài đặt Extension **Live Server**.
3. Nhấp chuột phải vào `index.html` và chọn **Open with Live Server**.

### Cách 2: Khởi Chạy Python HTTP Server
Mở terminal tại thư mục gốc của dự án và chạy câu lệnh:
```bash
python -m http.server 8000
```
Sau đó truy cập địa chỉ: `http://localhost:8000` trên trình duyệt web.

---

## 🏆 9. Bộ Tiêu Chuẩn Chất Lượng & Accessibility (WCAG AA)

| Tiêu chuẩn | Đánh giá | Chi tiết triển khai |
| :--- | :---: | :--- |
| **Mã hóa UTF-8** | ⭐⭐⭐⭐⭐ | 100% tiếng Việt chuẩn UTF-8, không lỗi font, hiển thị sắc nét dấu thanh và icon. |
| **Giao diện UI** | ⭐⭐⭐⭐⭐ | Phong cách hiện đại, màu sắc hài hòa, hiệu ứng kính mờ glassmorphism và video hero điện ảnh. |
| **Trải nghiệm UX** | ⭐⭐⭐⭐⭐ | Tùy biến size & topping linh hoạt, giỏ hàng tự động lưu LocalStorage, wizard thanh toán 4 bước. |
| **Accessibility (WCAG AA)** | ⭐⭐⭐⭐⭐ | Độ tương phản chữ $\ge 4.5:1$, nhãn `<label>`, thuộc tính ARIA (`aria-modal`, `aria-expanded`), hỗ trợ phím ESC. |
| **Touch Targets (Mobile)** | ⭐⭐⭐⭐⭐ | Đạt kích thước tương tác tối thiểu $44\text{px} \times 44\text{px}$ cho tất cả các nút bấm di động. |
| **Tương thích Responsive** | ⭐⭐⭐⭐⭐ | Tương thích mượt mà từ thiết bị di động nhỏ ($360\text{px}$) đến màn hình máy tính cao cấp ($4\text{K}$). |

---

## 📜 10. Thông Tin Bản Quyền

© 2026 **KTD-COFFEE** — Specialty Coffee & Bakery E-Commerce Platform. All Rights Reserved.
