// --------------------------------------------------------------------------
// DỮ LIỆU SẢN PHẨM MẪU (PRODUCTS DATA & DEFAULTS - KTD-COFFEE)
// Mục đích : Chứa mảng PRODUCTS (danh sách thực đơn) và các hằng số cấu hình
//            vận chuyển dùng chung trên toàn ứng dụng.
// Phụ thuộc: Được tham chiếu bởi cart.js, ui.js và main.js
// --------------------------------------------------------------------------

// Danh sách tất cả sản phẩm thuộc thực đơn KTD-COFFEE
// Các danh mục: 'traditional' | 'espresso' | 'coldbrew' | 'tea' | 'pastry'
const PRODUCTS = [
  {
    // ── Cà Phê Truyền Thống ──────────────────────────────────────────────────
    id: 'coffee-01',                  // Mã định danh duy nhất cho sản phẩm
    title: 'Bạc Xỉu Sữa Dừa Kem Béo',
    category: 'traditional',          // Nhóm danh mục để lọc trên trang menu
    price: 39000,                     // Giá hiện tại (VNĐ)
    oldPrice: 49000,                  // Giá gốc trước khi giảm (hiển thị gạch ngang)
    rating: '4.9★ 185+ đánh giá',    // Chuỗi hiển thị trên badge đánh giá
    ratingVal: 4.9,                   // Giá trị số để sắp xếp theo rating
    desc: 'Hạt Robusta Cầu Đất đậm đà kết hợp sữa đặc ngọt thanh, cốt dừa Bến Tre béo ngậy và lớp foam bồng bềnh.',
    image: 'assets/images/bac-xiu.jpg',
    badge: 'Bestseller',              // Nhãn badge hiển thị trên card sản phẩm
    badgeType: 'gold',                // Kiểu màu badge: 'gold' | 'red' | 'green'
    inStock: true,                    // false → ẩn nút "Thêm", hiện overlay "Hết hàng"
    toppings: [                       // Danh sách topping tùy chọn trong modal chi tiết
      { id: 'top-espresso-shot', name: 'Thêm 1 Shot Espresso', price: 10000 },
      { id: 'top-cheese-foam', name: 'Thêm Kem Cheese Macchiato', price: 12000 },
      { id: 'top-coffee-jelly', name: 'Thạch Cà Phê Giòn Dai', price: 8000 },
      { id: 'top-boba-white', name: 'Trân Châu Trắng 3Q', price: 8000 }
    ]
  },
  {
    id: 'coffee-02',
    title: 'Cà Phê Muối Kem Dẻo Xứ Huế',
    category: 'traditional',
    price: 42000,
    oldPrice: 52000,
    rating: '4.9★ 240+ đánh giá',
    ratingVal: 4.9,
    desc: 'Cà phê phin truyền thống hòa quyện cùng lớp kem muối mặn mà, béo mịn độc quyền chuẩn vị cung đình.',
    image: 'assets/images/ca-phe-muoi.jpg',
    badge: 'Đặc Biệt',
    badgeType: 'gold',
    inStock: true,
    toppings: [
      { id: 'top-espresso-shot', name: 'Thêm 1 Shot Espresso', price: 10000 },
      { id: 'top-extra-salt-cream', name: 'Gấp Đôi Kem Muối Béo', price: 12000 },
      { id: 'top-coffee-jelly', name: 'Thạch Cà Phê Giòn Dai', price: 8000 }
    ]
  },
  {
    // ── Espresso Specialty ───────────────────────────────────────────────────
    id: 'espresso-01',
    title: 'Caramel Macchiato Nướng',
    category: 'espresso',
    price: 55000,
    oldPrice: 69000,
    rating: '4.8★ 142+ đánh giá',
    ratingVal: 4.8,
    desc: 'Espresso Arabica nguyên chất thơm lừng, sữa tươi thanh trùng đánh nóng phủ sốt caramel nướng vàng óng.',
    image: 'assets/images/caramel-macchiato.jpg',
    badge: 'Hot Deal',
    badgeType: 'red',
    inStock: true,
    toppings: [
      { id: 'top-espresso-shot', name: 'Thêm 1 Shot Espresso Đậm Gu', price: 10000 },
      { id: 'top-vanilla-syrup', name: 'Thêm Siro Vani Pháp', price: 8000 },
      { id: 'top-oat-milk', name: 'Đổi Sang Sữa Yến Mạch (Oat Milk)', price: 15000 }
    ]
  },
  {
    // ── Cold Brew ────────────────────────────────────────────────────────────
    id: 'coldbrew-01',
    title: 'Cold Brew Cam Sả Vàng Mát Lạnh',
    category: 'coldbrew',
    price: 49000,
    oldPrice: 59000,
    rating: '4.9★ 310+ đánh giá',
    ratingVal: 4.9,
    desc: 'Cà phê Arabica ủ lạnh 18 tiếng chậm rãi, hòa quyện tép cam vàng mọng nước và hương sả tươi sảng khoái.',
    image: 'assets/images/cold-brew.jpg',
    badge: 'Giải Nhiệt',
    badgeType: 'green',
    inStock: true,
    toppings: [
      { id: 'top-orange-slice', name: 'Thêm 2 Lát Cam Vàng Tươi', price: 8000 },
      { id: 'top-aloe-vera', name: 'Thạch Nha Đam Giòn Ngọt', price: 8000 },
      { id: 'top-chia-seed', name: 'Hạt Chia Hữu Cơ', price: 8000 }
    ]
  },
  {
    // ── Trà Thủ Công ─────────────────────────────────────────────────────────
    id: 'tea-01',
    title: 'Trà Đào Cam Sả Thượng Hạng',
    category: 'tea',
    price: 45000,
    oldPrice: 55000,
    rating: '4.8★ 220+ đánh giá',
    ratingVal: 4.8,
    desc: 'Trà đen hảo hạng ủ mới mỗi sáng, miếng đào ngâm giòn ngọt, lát cam vàng thơm ngát và hương sả dịu êm.',
    image: 'assets/images/peach-tea.png',
    badge: 'Thanh Mát',
    badgeType: 'green',
    inStock: true,
    toppings: [
      { id: 'top-peach-pieces', name: 'Thêm 2 Miếng Đào Giòn', price: 10000 },
      { id: 'top-boba-white', name: 'Trân Châu Trắng 3Q', price: 8000 },
      { id: 'top-cheese-foam', name: 'Thêm Lớp Kem Cheese', price: 12000 }
    ]
  },
  {
    // ── Bánh & Tráng Miệng ───────────────────────────────────────────────────
    id: 'pastry-01',
    title: 'Bánh Croissant Bơ Pháp Nướng Giòn',
    category: 'pastry',
    price: 35000,
    oldPrice: 45000,
    rating: '4.9★ 175+ đánh giá',
    ratingVal: 4.9,
    desc: 'Bánh sừng bò ngàn lớp chuẩn Pháp với bơ cao cấp thơm nức, nướng nóng giòn rụm trước khi giao hàng.',
    image: 'assets/images/croissant.jpg',
    badge: 'Món Kèm Chuẩn',
    badgeType: 'gold',
    inStock: true,
    toppings: [
      { id: 'top-chocolate-dip', name: 'Sốt Socola Bỉ Rót Thêm', price: 8000 },
      { id: 'top-almond-flakes', name: 'Hạnh Nhân Lát Rang Bơ', price: 8000 }
    ]
  },
  {
    id: 'espresso-02',
    title: 'Caffe Latte Sữa Tươi Thanh Trùng',
    category: 'espresso',
    price: 49000,
    oldPrice: 59000,
    rating: '4.7★ 95+ đánh giá',
    ratingVal: 4.7,
    desc: 'Sự cân bằng tinh tế giữa 2 shot Espresso đậm đà và sữa tươi Dalat Milk ngọt thanh mịn mượt.',
    image: 'assets/images/latte.jpg',
    badge: 'Mới Ra Mắt',
    badgeType: 'green',
    inStock: true,
    toppings: [
      { id: 'top-espresso-shot', name: 'Thêm 1 Shot Espresso', price: 10000 },
      { id: 'top-vanilla-syrup', name: 'Thêm Siro Vani Tự Nhiên', price: 8000 }
    ]
  },
  {
    id: 'coldbrew-02',
    title: 'Cold Brew Kem Béo Hạt Dẻ Cười (Hết Hàng)',
    category: 'coldbrew',
    price: 59000,
    oldPrice: 69000,
    rating: '4.9★ 88+ đánh giá',
    ratingVal: 4.9,
    desc: 'Cold brew ủ lạnh thượng hạng kết hợp kem hạt dẻ cười rang thơm ngậy phiên bản giới hạn mùa này.',
    image: 'assets/images/cold-brew-hazelnut.jpg',
    badge: 'Giới Hạn',
    badgeType: 'gold',
    inStock: false,  // Hết hàng → nút "Thêm" bị vô hiệu hóa, hiện overlay
    toppings: []     // Không có topping khi hết hàng
  }
];

// ==========================================
// CẤU HÌNH VẬN CHUYỂN & THANH TOÁN
// ==========================================
const FREE_SHIPPING_THRESHOLD = 150000; // Đơn từ 150.000đ trở lên được miễn phí giao hàng
const STANDARD_SHIPPING_FEE = 20000;    // Phí giao hàng tiêu chuẩn khi chưa đủ ngưỡng freeship

// Định dạng số tiền theo chuẩn tiền tệ Việt Nam (ví dụ: 39000 → "39.000đ")
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}
