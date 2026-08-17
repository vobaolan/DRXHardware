export interface HardwareProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  category: 'CPU' | 'VGA' | 'MAINBOARD' | 'RAM' | 'STORAGE' | 'PSU' | 'CASE' | 'COOLING' | 'MONITOR' | 'GEAR' | 'LAPTOP' | 'LAPTOP_GAMING' | 'PREBUILT_PC';
  brand: string;
  modelCode?: string;
  coverImage: string;
  screenshots: string[];
  socket?: string;
  ramType?: string;
  wattage?: number;
  formFactor?: string;
  specs: Record<string, string>;
  warrantyMonths: number;
  stockQuantity: number;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isPrebuilt?: boolean;
}

export const INITIAL_PRODUCTS: HardwareProduct[] = [
  // ─── 1. CPU (BỘ VI XỬ LÝ) ───
  {
    id: "prod-cpu-13400f",
    name: "Intel Core i5 13400F (Up To 4.6GHz, 10 Nhân 16 Luồng, 20MB Cache, LGA 1700)",
    slug: "intel-core-i5-13400f",
    description: "Bộ vi xử lý Intel Core i5 13400F hiệu năng cao chuyên dụng cho PC Gaming và Đồ Họa tầm trung. 10 Nhân 16 Luồng mang lại trải nghiệm mượt mà.",
    price: 4990000,
    discountPrice: 4490000,
    costPrice: 3900000,
    category: "CPU",
    brand: "Intel",
    modelCode: "BX8071513400F",
    coverImage: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80"],
    socket: "LGA1700",
    ramType: "DDR4 / DDR5",
    wattage: 65,
    specs: {
      "Số nhân": "10 (6 P-core + 4 E-core)",
      "Số luồng": "16",
      "Xung nhịp Turbo": "4.6 GHz",
      "Socket": "LGA 1700"
    },
    warrantyMonths: 36,
    stockQuantity: 25,
    isFeatured: true,
    isFlashDeal: true
  },
  {
    id: "prod-cpu-7800x3d",
    name: "AMD Ryzen 7 7800X3D (4.2GHz Turbo 5.0GHz, 8 Nhân 16 Luồng, 96MB Cache, AM5)",
    slug: "amd-ryzen-7-7800x3d",
    description: "CPU Gaming nhanh nhất thế giới với công nghệ 3D V-Cache độc quyền từ AMD.",
    price: 11990000,
    discountPrice: 10490000,
    costPrice: 9100000,
    category: "CPU",
    brand: "AMD",
    modelCode: "100-100000910WOF",
    coverImage: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80"],
    socket: "AM5",
    ramType: "DDR5",
    wattage: 120,
    specs: {
      "Số nhân": "8",
      "Số luồng": "16",
      "Cache": "96MB 3D V-Cache",
      "Socket": "AM5"
    },
    warrantyMonths: 36,
    stockQuantity: 15,
    isFeatured: true
  },

  // ─── 2. VGA (CARD MÀN HÌNH) ───
  {
    id: "prod-vga-rtx4060",
    name: "Card Màn Hình ASUS TUF Gaming GeForce RTX 4060 OC Edition 8GB GDDR6",
    slug: "asus-tuf-gaming-geforce-rtx-4060-oc-8gb",
    description: "VGA ASUS TUF RTX 4060 8GB trang bị DLSS 3, Ray Tracing kiến trúc Ada Lovelace.",
    price: 8990000,
    discountPrice: 8290000,
    costPrice: 7400000,
    category: "VGA",
    brand: "ASUS",
    modelCode: "TUF-RTX4060-O8G-GAMING",
    coverImage: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80"],
    ramType: "GDDR6",
    wattage: 115,
    specs: {
      "VRAM": "8GB GDDR6",
      "Băng thông": "128-bit",
      "Nguồn đề xuất": "550W"
    },
    warrantyMonths: 36,
    stockQuantity: 20,
    isFeatured: true,
    isFlashDeal: true
  },
  {
    id: "prod-vga-4070super",
    name: "Card Màn Hình MSI GeForce RTX 4070 SUPER 12G VENTUS 2X OC",
    slug: "msi-geforce-rtx-4070-super-12g-ventus-2x-oc",
    description: "Sức mạnh RTX 4070 SUPER đỉnh cao với tản nhiệt TORX Fan 4.0 mượt mà.",
    price: 18990000,
    discountPrice: 17490000,
    costPrice: 15800000,
    category: "VGA",
    brand: "MSI",
    modelCode: "RTX 4070 SUPER VENTUS 2X",
    coverImage: "https://images.unsplash.com/photo-1591799265444-d66432b91588?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1591799265444-d66432b91588?w=800&q=80"],
    ramType: "GDDR6X",
    wattage: 220,
    specs: {
      "VRAM": "12GB GDDR6X",
      "Băng thông": "192-bit",
      "Nguồn đề xuất": "650W"
    },
    warrantyMonths: 36,
    stockQuantity: 10,
    isFeatured: true
  },

  // ─── 3. MAINBOARD (BO MẠCH CHỦ) ───
  {
    id: "prod-main-b760m",
    name: "Bo Mạch Chủ MSI MAG B760M MORTAR WIFI DDR4 (Socket LGA 1700)",
    slug: "msi-mag-b760m-mortar-wifi-ddr4",
    description: "Mainboard B760M Mortar Wifi cho Intel Gen 12, 13, 14. Tản nhiệt VRM dày dặn, Wifi 6E.",
    price: 4390000,
    discountPrice: 3890000,
    costPrice: 3350000,
    category: "MAINBOARD",
    brand: "MSI",
    modelCode: "MAG B760M MORTAR WIFI DDR4",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"],
    socket: "LGA1700",
    ramType: "DDR4",
    specs: {
      "Chipset": "Intel B760",
      "Socket": "LGA 1700",
      "RAM": "DDR4 Dual Channel",
      "Mạng": "Wi-Fi 6E + 2.5Gbps LAN"
    },
    warrantyMonths: 36,
    stockQuantity: 18,
    isFeatured: true
  },
  {
    id: "prod-main-b650m",
    name: "Bo Mạch Chủ Gigabyte B650M AORUS ELITE AX (Socket AM5, DDR5)",
    slug: "gigabyte-b650m-aorus-elite-ax",
    description: "Mainboard AM5 thiết kế cao cấp cho AMD Ryzen 7000/8000 series.",
    price: 5490000,
    discountPrice: 4890000,
    costPrice: 4200000,
    category: "MAINBOARD",
    brand: "Gigabyte",
    modelCode: "B650M AORUS ELITE AX",
    coverImage: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80"],
    socket: "AM5",
    ramType: "DDR5",
    specs: {
      "Chipset": "AMD B650",
      "Socket": "AM5",
      "RAM": "DDR5 EXPO"
    },
    warrantyMonths: 36,
    stockQuantity: 12
  },

  // ─── 4. RAM & STORAGE ───
  {
    id: "prod-ram-corsair32gb",
    name: "RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz Black",
    slug: "corsair-vengeance-rgb-32gb-2x16gb-ddr5-6000mhz",
    description: "RAM DDR5 hiệu năng cao tích hợp dải đèn LED RGB linh hoạt hiệu chỉnh iCUE.",
    price: 3590000,
    discountPrice: 3190000,
    costPrice: 2700000,
    category: "RAM",
    brand: "Corsair",
    modelCode: "CMH32GX5M2B6000C30",
    coverImage: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80"],
    ramType: "DDR5",
    specs: {
      "Dung lượng": "32GB (2x16GB)",
      "Tốc độ Bus": "6000 MHz",
      "Latency": "CL30"
    },
    warrantyMonths: 36,
    stockQuantity: 30,
    isFeatured: true
  },
  {
    id: "prod-ssd-samsung990pro",
    name: "Ổ Cứng SSD Samsung 990 PRO 1TB M.2 NVMe PCIe Gen 4.0",
    slug: "samsung-990-pro-1tb-m2-nvme-pcie-gen-4",
    description: "Vua tốc độ SSD Gen 4 với tốc độ đọc 7450MB/s, ghi 6900MB/s.",
    price: 3290000,
    discountPrice: 2890000,
    costPrice: 2450000,
    category: "STORAGE",
    brand: "Samsung",
    modelCode: "MZ-V9P1T0BW",
    coverImage: "https://images.unsplash.com/photo-1597872250970-45d2780e9227?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1597872250970-45d2780e9227?w=800&q=80"],
    specs: {
      "Dung lượng": "1TB",
      "Tốc độ Đọc": "7450 MB/s",
      "Tốc độ Ghi": "6900 MB/s"
    },
    warrantyMonths: 60,
    stockQuantity: 40,
    isFeatured: true
  },

  // ─── 5. CASE, COOLING, PSU ───
  {
    id: "prod-case-nzxth9",
    name: "Vỏ Case NZXT H9 Flow All-Black Dual-Chamber Mid-Tower",
    slug: "nzxt-h9-flow-all-black",
    description: "Case bể kính cao cấp mặt kính cường lực liền mạch 2 mặt, luồng gió tối ưu Dual-Chamber.",
    price: 4390000,
    discountPrice: 3990000,
    costPrice: 3300000,
    category: "CASE",
    brand: "NZXT",
    modelCode: "CM-H91FB-01",
    coverImage: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80"],
    specs: {
      "Loại Case": "Mid-Tower Dual Chamber",
      "Kính": "Kính cường lực Panorama 270°"
    },
    warrantyMonths: 24,
    stockQuantity: 10,
    isFeatured: true
  },
  {
    id: "prod-psu-corsair750w",
    name: "Nguồn Máy Tính Corsair RM750e 750W 80 Plus Gold ATX 3.0 Fully Modular",
    slug: "corsair-rm750e-750w-80-plus-gold-atx-30",
    description: "Nguồn chuẩn ATX 3.0 trang bị cáp 12VHPWR 16-pin cho VGA RTX 40 Series. 80 Plus Gold.",
    price: 2990000,
    discountPrice: 2690000,
    costPrice: 2250000,
    category: "PSU",
    brand: "Corsair",
    modelCode: "CP-9020262-NA",
    coverImage: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80"],
    wattage: 750,
    specs: {
      "Công suất": "750W",
      "Hiệu suất": "80 Plus Gold",
      "Chuẩn": "ATX 3.0 PCIe 5.0"
    },
    warrantyMonths: 84,
    stockQuantity: 15
  },
  {
    id: "prod-cooling-ryujin3",
    name: "Tản Nhiệt Nước AIO ASUS ROG Ryujin III 360 ARGB Màn Hình LCD 3.5 Inch",
    slug: "asus-rog-ryujin-iii-360-argb",
    description: "Vua tản nhiệt nước AIO trang bị bơm Asetek Gen 8, màn hình LCD 3.5 inch hiển thị thông số PC.",
    price: 8990000,
    discountPrice: 7990000,
    costPrice: 6800000,
    category: "COOLING",
    brand: "ASUS",
    modelCode: "ROG RYUJIN III 360 ARGB",
    coverImage: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80"],
    specs: {
      "Kích thước": "Radiator 360mm",
      "Quạt": "3x Fan 120mm ARGB Magnetic",
      "Màn hình": "LCD 3.5 inch Full Color"
    },
    warrantyMonths: 72,
    stockQuantity: 8,
    isFeatured: true
  },
  {
    id: "prod-cooling-leopard",
    name: "Quạt Tản Nhiệt PC Leopard Galaxy S1 | Fan Lẻ 120mm, ARGB, Sync Main",
    slug: "quat-tan-nhiet-pc-leopard-galaxy-s1-120mm-argb",
    description: "Fan case 120mm ARGB hiệu ứng LED nhiều dải màu siêu mượt, khả năng sync mainboard vô cùng êm ái.",
    price: 109000,
    discountPrice: 68000,
    costPrice: 40000,
    category: "COOLING",
    brand: "Leopard",
    coverImage: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80"],
    specs: {
      "Kích thước": "120mm x 120mm x 25mm",
      "Đèn LED": "ARGB 5V 3-Pin Sync",
      "Tốc độ": "1200 RPM ± 10%"
    },
    warrantyMonths: 12,
    stockQuantity: 120,
    isFeatured: true
  },

  // ─── 6. GAMING GEAR (BÀN PHÍM, CHUỘT, TAI NGHE, BÀN GHẾ) ───
  {
    id: "prod-gear-akko3068b",
    name: "Bàn Phím Cơ Akko 3068B Plus Multi-Modes RGB (Hot-Swap, Wireless 2.4G/Bluetooth)",
    slug: "ban-phim-co-akko-3068b-plus-multi-modes-rgb",
    description: "Phím cơ layout 65% nhỏ gọn kết nối 3 chế độ (Dây / 2.4Ghz / Bluetooth 5.0) trang bị Switch CS Jelly độc quyền.",
    price: 1890000,
    discountPrice: 1590000,
    costPrice: 1200000,
    category: "GEAR",
    brand: "Akko",
    modelCode: "Akko 3068B Plus",
    coverImage: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"],
    specs: {
      "Layout": "65% (68 phím)",
      "Kết nối": "Bluetooth 5.0 / 2.4Ghz / Type-C",
      "Switch": "Akko CS Jelly Pink / Purple (Hot-swap)"
    },
    warrantyMonths: 12,
    stockQuantity: 35,
    isFeatured: true
  },
  {
    id: "prod-gear-razerdeathadder",
    name: "Chuột Gaming Không Dây Razer DeathAdder V3 Pro Wireless Black (63g, 30K DPI)",
    slug: "chuot-gaming-razer-deathadder-v3-pro-wireless-black",
    description: "Chuột Gaming eSport siêu nhẹ chỉ 63g, cảm biến Optical Focus Pro 30K DPI nhanh nhất hành tinh.",
    price: 3890000,
    discountPrice: 3390000,
    costPrice: 2800000,
    category: "GEAR",
    brand: "Razer",
    coverImage: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80"],
    specs: {
      "Trọng lượng": "63 grams",
      "Mắt đọc": "Focus Pro 30K Optical Sensor",
      "Thời lượng Pin": "Lên đến 90 giờ"
    },
    warrantyMonths: 24,
    stockQuantity: 22,
    isFeatured: true
  },
  {
    id: "prod-gear-hyperxcloud2",
    name: "Tai Nghe Gaming HyperX Cloud II Wireless 7.1 Surround Red",
    slug: "tai-nghe-gaming-hyperx-cloud-ii-wireless-71-surround",
    description: "Huyền thoại tai nghe Gaming Cloud II phiên bản không dây 2.4GHz pin 30 giờ, đệm tai mút ký ức êm ái.",
    price: 3490000,
    discountPrice: 2990000,
    costPrice: 2400000,
    category: "GEAR",
    brand: "HyperX",
    coverImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80"],
    specs: {
      "Âm thanh": "Giả lập 7.1 Surround",
      "Kết nối": "Wireless 2.4GHz USB Dongle",
      "Micro": "Khử ồn Noise-cancelling có thể tháo rời"
    },
    warrantyMonths: 24,
    stockQuantity: 18,
    isFeatured: true
  },
  {
    id: "prod-gear-sihoom57",
    name: "Ghế Công Thái Học Ergonomic Sihoo M57 Grey (Khung Kim Loại, Lưới Thoáng Khí)",
    slug: "ghe-cong-thai-hoc-ergonomic-sihoo-m57-grey",
    description: "Ghế công thái học Sihoo M57 chống đau lưng cho dân văn phòng và Game thủ ngồi làm việc lâu dài.",
    price: 4590000,
    discountPrice: 3890000,
    costPrice: 3100000,
    category: "GEAR",
    brand: "Sihoo",
    coverImage: "https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&q=80"],
    specs: {
      "Chất liệu": "Lưới Vân Rồng thoáng khí 100%",
      "Tựa lưng": "Điều chỉnh 2D ngả lưng 126°",
      "Kê tay": "Đa chiều 3D nâng hạ"
    },
    warrantyMonths: 36,
    stockQuantity: 14
  },

  // ─── 7. MONITOR (MÀN HÌNH) ───
  {
    id: "prod-monitor-asus360",
    name: "Màn Hình Gaming ASUS ROG Swift PG27AQN 27 inch 2K QHD 360Hz Fast IPS 1ms",
    slug: "man-hinh-gaming-asus-rog-swift-pg27aqn-27-inch-2k-360hz",
    description: "Màn hình Gaming 360Hz độ phân giải 2K nhanh nhất thế giới. Tích hợp NVIDIA G-Sync & Reflex Analyzer.",
    price: 24990000,
    discountPrice: 22990000,
    costPrice: 19500000,
    category: "MONITOR",
    brand: "ASUS",
    modelCode: "PG27AQN",
    coverImage: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"],
    specs: {
      "Kích thước": "27 inch",
      "Độ phân giải": "2K QHD (2560 x 1440)",
      "Tần số quét": "360Hz",
      "Tấm nền": "Ultrafast IPS (1ms GtG)"
    },
    warrantyMonths: 36,
    stockQuantity: 6,
    isFeatured: true,
    isFlashDeal: true
  },
  {
    id: "prod-monitor-lg27",
    name: "Màn Hình Gaming LG UltraGear 27GP850-B 27 inch 2K QHD 180Hz Nano IPS 1ms",
    slug: "man-hinh-lg-ultragear-27gp850-b-27-inch-2k-180hz-nano-ips",
    description: "Màn hình 2K IPS màu sắc chuẩn đồ họa DCI-P3 98%, tần số quét ép xung 180Hz siêu mượt.",
    price: 9990000,
    discountPrice: 8490000,
    costPrice: 7200000,
    category: "MONITOR",
    brand: "LG",
    coverImage: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"],
    specs: {
      "Kích thước": "27 inch",
      "Độ phân giải": "2K QHD (2560 x 1440)",
      "Tần số quét": "180Hz (OC)",
      "Màu sắc": "Nano IPS 98% DCI-P3"
    },
    warrantyMonths: 24,
    stockQuantity: 16,
    isFeatured: true
  },
  {
    id: "prod-monitor-samsungg4",
    name: "Màn Hình Gaming Samsung Odyssey G4 LS25BG400 25 inch FHD IPS 240Hz 1ms",
    slug: "man-hinh-gaming-samsung-odyssey-g4-25-inch-240hz-ips",
    description: "Màn hình chiến Game Esport 240Hz thiết kế chân đế nâng hạ xoay dọc linh hoạt 90 độ.",
    price: 5490000,
    discountPrice: 3390000,
    costPrice: 2900000,
    category: "MONITOR",
    brand: "Samsung",
    coverImage: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"],
    specs: {
      "Kích thước": "25 inch",
      "Độ phân giải": "Full HD (1920 x 1080)",
      "Tần số quét": "240Hz",
      "Tấm nền": "IPS 1ms"
    },
    warrantyMonths: 24,
    stockQuantity: 25
  },

  // ─── 8. LAPTOP & LAPTOP GAMING ───
  {
    id: "prod-laptop-rogstrixg16",
    name: "Laptop Gaming ASUS ROG Strix G16 G614JV (Core i7 13650HX, RAM 16GB, SSD 512GB, RTX 4060 8GB, 16 inch 165Hz)",
    slug: "laptop-gaming-asus-rog-strix-g16-rtx-4060",
    description: "Quái thú Laptop Gaming cấu hình đỉnh cao trang bị card RTX 4060 8GB TGP 140W max công suất.",
    price: 36990000,
    discountPrice: 33990000,
    costPrice: 29500000,
    category: "LAPTOP_GAMING",
    brand: "ASUS",
    modelCode: "G614JV-N3090W",
    coverImage: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80"],
    specs: {
      "CPU": "Intel Core i7 13650HX (14 Nhân 20 Luồng)",
      "VGA": "NVIDIA GeForce RTX 4060 8GB (TGP 140W)",
      "RAM": "16GB DDR5 4800MHz",
      "Màn hình": "16 inch FHD+ IPS 165Hz 100% sRGB"
    },
    warrantyMonths: 24,
    stockQuantity: 10,
    isFeatured: true,
    isFlashDeal: true
  },
  {
    id: "prod-laptop-lenovoloq15",
    name: "Laptop Gaming Lenovo LOQ 15ARP10E (Ryzen 5 7535HS, RAM 16GB DDR5, SSD 512GB, RTX 3050 6GB, 15.6 inch 144Hz)",
    slug: "laptop-gaming-lenovo-loq-15arp10e-rtx-3050",
    description: "Laptop Gaming quốc dân cấu hình tối ưu tầm trung với bàn phím gõ đỉnh cao đặc trưng Lenovo.",
    price: 24990000,
    discountPrice: 21590000,
    costPrice: 18900000,
    category: "LAPTOP_GAMING",
    brand: "Lenovo",
    coverImage: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80"],
    specs: {
      "CPU": "AMD Ryzen 5 7535HS",
      "VGA": "NVIDIA GeForce RTX 3050 6GB GDDR6",
      "RAM": "16GB DDR5",
      "Màn hình": "15.6 inch FHD IPS 144Hz"
    },
    warrantyMonths: 24,
    stockQuantity: 15,
    isFeatured: true
  },
  {
    id: "prod-laptop-asusvivobook",
    name: "Laptop ASUS Vivobook 14 X1404VAP (Core i5 120U, RAM 16GB DDR4, SSD 512GB, 14 inch FHD IPS)",
    slug: "laptop-asus-vivobook-14-x1404vap-core-i5-120u",
    description: "Laptop văn phòng mỏng nhẹ pin trâu chuẩn doanh nhân, bản lề mở phẳng 180 độ độc đáo.",
    price: 17590000,
    discountPrice: 15790000,
    costPrice: 13800000,
    category: "LAPTOP",
    brand: "ASUS",
    coverImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"],
    specs: {
      "CPU": "Intel Core i5 120U",
      "RAM": "16GB DDR4 Onboard",
      "Ổ cứng": "SSD 512GB NVMe M.2",
      "Trọng lượng": "1.4 kg siêu mỏng nhẹ"
    },
    warrantyMonths: 24,
    stockQuantity: 20
  },

  // ─── 9. PREBUILT_PC (PC NGUYÊN BỘ) ───
  {
    id: "prod-pc-venom4060",
    name: "PC Gaming ODS Venom RTX 4060 (Core i5 13400F | RAM 16GB DDR4 | SSD 500GB | RTX 4060 8GB)",
    slug: "pc-gaming-ods-venom-rtx-4060",
    description: "Bộ PC Gaming gắn sẵn cấu hình tối ưu chi phí cho Esport và AAA mượt mà.",
    price: 18990000,
    discountPrice: 16990000,
    costPrice: 14500000,
    category: "PREBUILT_PC",
    brand: "ODS Build",
    modelCode: "ODS-GAMING-V4060",
    coverImage: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80",
    screenshots: ["https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80"],
    socket: "LGA1700",
    ramType: "DDR4",
    wattage: 650,
    specs: {
      "CPU": "Intel Core i5 13400F",
      "Mainboard": "MSI B760M Mortar Wifi",
      "RAM": "Kingston Fury 16GB 3200MHz",
      "VGA": "ASUS TUF RTX 4060 8GB"
    },
    warrantyMonths: 36,
    stockQuantity: 8,
    isFeatured: true,
    isFlashDeal: true,
    isPrebuilt: true
  }
];

export const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  CPU: { label: "Bộ vi xử lý CPU", icon: "Cpu" },
  VGA: { label: "Card màn hình VGA", icon: "MonitorPlay" },
  MAINBOARD: { label: "Bo mạch chủ Mainboard", icon: "CircuitBoard" },
  RAM: { label: "Bộ nhớ RAM", icon: "MemoryStick" },
  STORAGE: { label: "Ổ cứng SSD / HDD", icon: "HardDrive" },
  PSU: { label: "Nguồn PSU", icon: "Zap" },
  CASE: { label: "Vỏ Case máy tính", icon: "Box" },
  COOLING: { label: "Tản nhiệt CPU", icon: "Fan" },
  MONITOR: { label: "Màn hình máy tính", icon: "Monitor" },
  GEAR: { label: "Gaming Gear", icon: "Gamepad2" },
  LAPTOP: { label: "Laptop Văn Phòng", icon: "Laptop" },
  LAPTOP_GAMING: { label: "Laptop Gaming", icon: "Gamepad2" },
  PREBUILT_PC: { label: "PC Gắn Sẵn Đạt Chuẩn", icon: "PcCase" }
};
