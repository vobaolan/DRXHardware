import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mockProducts = [
  // --- CPU ---
  {
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
    screenshots: [
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80"
    ],
    socket: "LGA1700",
    ramType: "DDR4 / DDR5",
    wattage: 65,
    formFactor: null,
    specs: {
      "Số nhân": "10 (6 P-core + 4 E-core)",
      "Số luồng": "16",
      "Xung nhịp cơ bản": "2.5 GHz",
      "Xung nhịp Turbo": "4.6 GHz",
      "Bộ nhớ đệm Cache": "20MB Intel Smart Cache",
      "Socket": "LGA 1700",
      "Hỗ trợ RAM": "DDR4 3200MHz / DDR5 4800MHz"
    },
    warrantyMonths: 36,
    stockQuantity: 25,
    isFeatured: true,
    isFlashDeal: true
  },
  {
    name: "AMD Ryzen 7 7800X3D (4.2GHz Turbo 5.0GHz, 8 Nhân 16 Luồng, 96MB Cache, AM5)",
    slug: "amd-ryzen-7-7800x3d",
    description: "CPU Gaming nhanh nhất thế giới với công nghệ 3D V-Cache độc quyền từ AMD. Lựa chọn số 1 cho các Game thủ chuyên nghiệp.",
    price: 11990000,
    discountPrice: 10490000,
    costPrice: 9100000,
    category: "CPU",
    brand: "AMD",
    modelCode: "100-100000910WOF",
    coverImage: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80"
    ],
    socket: "AM5",
    ramType: "DDR5",
    wattage: 120,
    formFactor: null,
    specs: {
      "Số nhân": "8",
      "Số luồng": "16",
      "Xung nhịp Turbo": "5.0 GHz",
      "L3 Cache": "96MB 3D V-Cache",
      "Socket": "AM5",
      "Hỗ trợ RAM": "DDR5 5200MHz+"
    },
    warrantyMonths: 36,
    stockQuantity: 15,
    isFeatured: true,
    isFlashDeal: false
  },

  // --- VGA ---
  {
    name: "Card Màn Hình ASUS TUF Gaming GeForce RTX 4060 OC Edition 8GB GDDR6",
    slug: "asus-tuf-gaming-geforce-rtx-4060-oc-8gb",
    description: "VGA ASUS TUF RTX 4060 8GB trang bị công nghệ DLSS 3, Ray Tracing kiến trúc Ada Lovelace, độ bền quân đội TUF Gaming chuẩn bền bỉ.",
    price: 8990000,
    discountPrice: 8290000,
    costPrice: 7400000,
    category: "VGA",
    brand: "ASUS",
    modelCode: "TUF-RTX4060-O8G-GAMING",
    coverImage: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80"
    ],
    socket: null,
    ramType: "GDDR6",
    wattage: 115,
    formFactor: "ATX (2.7 slot)",
    specs: {
      "Dung lượng VRAM": "8GB GDDR6",
      "Băng thông bộ nhớ": "128-bit",
      "Cổng kết nối": "1x HDMI 2.1a, 3x DisplayPort 1.4a",
      "Nguồn đề xuất": "550W",
      "Cổng nguồn phụ": "1x 8-pin"
    },
    warrantyMonths: 36,
    stockQuantity: 20,
    isFeatured: true,
    isFlashDeal: true
  },
  {
    name: "Card Màn Hình MSI GeForce RTX 4070 SUPER 12G VENTUS 2X OC",
    slug: "msi-geforce-rtx-4070-super-12g-ventus-2x-oc",
    description: "Sức mạnh RTX 4070 SUPER đỉnh cao thiết kế 2 quạt tản nhiệt TORX Fan 4.0 tối ưu luồng gió và yên tĩnh.",
    price: 18990000,
    discountPrice: 17490000,
    costPrice: 15800000,
    category: "VGA",
    brand: "MSI",
    modelCode: "RTX 4070 SUPER VENTUS 2X",
    coverImage: "https://images.unsplash.com/photo-1591799265444-d66432b91588?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1591799265444-d66432b91588?w=800&q=80"
    ],
    socket: null,
    ramType: "GDDR6X",
    wattage: 220,
    formFactor: "ATX",
    specs: {
      "Dung lượng VRAM": "12GB GDDR6X",
      "Băng thông bộ nhớ": "192-bit",
      "Cổng nguồn phụ": "1x 16-pin (12VHPWR)",
      "Nguồn đề xuất": "650W"
    },
    warrantyMonths: 36,
    stockQuantity: 10,
    isFeatured: true,
    isFlashDeal: false
  },

  // --- MAINBOARD ---
  {
    name: "Bo Mạch Chủ MSI MAG B760M MORTAR WIFI DDR4 (Socket LGA 1700)",
    slug: "msi-mag-b760m-mortar-wifi-ddr4",
    description: "Mainboard quốc dân B760M Mortar Wifi cho Intel Gen 12, 13, 14. Trang bị tản nhiệt VRM dày dặn, Wifi 6E siêu tốc.",
    price: 4390000,
    discountPrice: 3890000,
    costPrice: 3350000,
    category: "MAINBOARD",
    brand: "MSI",
    modelCode: "MAG B760M MORTAR WIFI DDR4",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"
    ],
    socket: "LGA1700",
    ramType: "DDR4",
    wattage: null,
    formFactor: "Micro-ATX",
    specs: {
      "Chipset": "Intel B760",
      "Socket": "LGA 1700",
      "Chuẩn RAM": "DDR4 Dual Channel (Up to 5333+ MHz OC)",
      "Khe cắm mở rộng": "1x PCIe 5.0 x16",
      "Lưu trữ": "2x M.2 NVMe PCIe 4.0, 4x SATA 6Gb/s",
      "Kết nối mạng": "Realtek 2.5Gbps LAN + Wi-Fi 6E + Bluetooth 5.3"
    },
    warrantyMonths: 36,
    stockQuantity: 18,
    isFeatured: true,
    isFlashDeal: false
  },
  {
    name: "Bo Mạch Chủ Gigabyte B650M AORUS ELITE AX (Socket AM5, DDR5)",
    slug: "gigabyte-b650m-aorus-elite-ax",
    description: "Mainboard AM5 thiết kế cao cấp cho AMD Ryzen 7000/8000/9000 series. Hỗ trợ PCIe 5.0 M.2 và DDR5 EXPO.",
    price: 5490000,
    discountPrice: 4890000,
    costPrice: 4200000,
    category: "MAINBOARD",
    brand: "Gigabyte",
    modelCode: "B650M AORUS ELITE AX",
    coverImage: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&q=80"
    ],
    socket: "AM5",
    ramType: "DDR5",
    wattage: null,
    formFactor: "Micro-ATX",
    specs: {
      "Chipset": "AMD B650",
      "Socket": "AM5",
      "Chuẩn RAM": "DDR5 (Up to 6600MHz EXPO)",
      "Kết nối": "Wi-Fi 6E, Bluetooth 5.2, 2.5G LAN"
    },
    warrantyMonths: 36,
    stockQuantity: 12,
    isFeatured: false,
    isFlashDeal: false
  },

  // --- RAM ---
  {
    name: "RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz Black",
    slug: "corsair-vengeance-rgb-32gb-2x16gb-ddr5-6000mhz",
    description: "RAM DDR5 hiệu năng cực cao tích hợp dải đèn LED RGB linh hoạt hiệu chỉnh qua phần mềm Corsair iCUE.",
    price: 3590000,
    discountPrice: 3190000,
    costPrice: 2700000,
    category: "RAM",
    brand: "Corsair",
    modelCode: "CMH32GX5M2B6000C30",
    coverImage: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80"
    ],
    socket: null,
    ramType: "DDR5",
    wattage: null,
    formFactor: "DIMM",
    specs: {
      "Dung lượng": "32GB (2x 16GB)",
      "Tốc độ Bus": "6000 MHz",
      "Độ trễ Latency": "CL30",
      "Hỗ trợ Profile": "Intel XMP 3.0 & AMD EXPO"
    },
    warrantyMonths: 36,
    stockQuantity: 30,
    isFeatured: true,
    isFlashDeal: true
  },

  // --- STORAGE ---
  {
    name: "Ổ Cứng SSD Samsung 990 PRO 1TB M.2 NVMe PCIe Gen 4.0",
    slug: "samsung-990-pro-1tb-m2-nvme-pcie-gen-4",
    description: "Vua tốc độ SSD Gen 4 với tốc độ đọc 7450MB/s, ghi 6900MB/s. Tối ưu cho xử lý đồ họa 4K và load game cực tức thì.",
    price: 3290000,
    discountPrice: 2890000,
    costPrice: 2450000,
    category: "STORAGE",
    brand: "Samsung",
    modelCode: "MZ-V9P1T0BW",
    coverImage: "https://images.unsplash.com/photo-1597872250970-45d2780e9227?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1597872250970-45d2780e9227?w=800&q=80"
    ],
    socket: null,
    ramType: null,
    wattage: null,
    formFactor: "M.2 2280",
    specs: {
      "Dung lượng": "1TB",
      "Chuẩn giao tiếp": "PCIe Gen 4.0 x4, NVMe 2.0",
      "Tốc độ Đọc": "7450 MB/s",
      "Tốc độ Ghi": "6900 MB/s",
      "Độ bền TBW": "600 TBW"
    },
    warrantyMonths: 60,
    stockQuantity: 40,
    isFeatured: true,
    isFlashDeal: false
  },

  // --- PSU ---
  {
    name: "Nguồn Máy Tính Corsair RM750e 750W 80 Plus Gold ATX 3.0 Fully Modular",
    slug: "corsair-rm750e-750w-80-plus-gold-atx-30",
    description: "Nguồn cao cấp chuẩn ATX 3.0 có sẵn dây 12VHPWR 16-pin cho VGA RTX 40 series. Chuẩn hiệu suất 80 Plus Gold êm ái.",
    price: 2990000,
    discountPrice: 2690000,
    costPrice: 2250000,
    category: "PSU",
    brand: "Corsair",
    modelCode: "CP-9020262-NA",
    coverImage: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80"
    ],
    socket: null,
    ramType: null,
    wattage: 750,
    formFactor: "ATX",
    specs: {
      "Công suất": "750W",
      "Chứng nhận hiệu suất": "80 Plus Gold",
      "Chuẩn dây": "Fully Modular (Tháo rời hoàn toàn)",
      "Chuẩn nguồn": "ATX 3.0 & PCIe 5.0 (Dây 12VHPWR)"
    },
    warrantyMonths: 84,
    stockQuantity: 15,
    isFeatured: false,
    isFlashDeal: false
  },

  // --- CASE ---
  {
    name: "Vỏ Case NZXT H9 Flow All-Black Dual-Chamber Mid-Tower",
    slug: "nzxt-h9-flow-all-black",
    description: "Case bể kính cao cấp mặt kính cường lực liền mạch 2 mặt, luồng gió tối ưu với thiết kế Dual-Chamber cá tính.",
    price: 4390000,
    discountPrice: 3990000,
    costPrice: 3300000,
    category: "CASE",
    brand: "NZXT",
    modelCode: "CM-H91FB-01",
    coverImage: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80"
    ],
    socket: null,
    ramType: null,
    wattage: null,
    formFactor: "ATX, Micro-ATX, Mini-ITX",
    specs: {
      "Loại Case": "Mid-Tower Dual Chamber",
      "Mặt kính": "Kính cường lực kép góc nhìn panorama",
      "Hỗ trợ tản nhiệt nước": "Lên tới 360mm (Nóc + Đáy + Hông)",
      "Quạt đi kèm": "4x 120mm Quiet Airflow Fans"
    },
    warrantyMonths: 24,
    stockQuantity: 10,
    isFeatured: true,
    isFlashDeal: false
  },

  // --- PREBUILT_PC ---
  {
    name: "PC Gaming ODS Venom RTX 4060 (Core i5 13400F | RAM 16GB DDR4 | SSD 500GB | RTX 4060 8GB)",
    slug: "pc-gaming-ods-venom-rtx-4060",
    description: "Bộ PC Gaming gắn sẵn cấu hình tối ưu chi phí cho các tựa game Esport và AAA ở độ phân giải Full HD / 2K max setting.",
    price: 18990000,
    discountPrice: 16990000,
    costPrice: 14500000,
    category: "PREBUILT_PC",
    brand: "ODS Build",
    modelCode: "ODS-GAMING-V4060",
    coverImage: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&q=80"
    ],
    socket: "LGA1700",
    ramType: "DDR4",
    wattage: 650,
    formFactor: "ATX",
    specs: {
      "CPU": "Intel Core i5 13400F (10 Nhân 16 Luồng)",
      "Mainboard": "MSI B760M Mortar Wifi DDR4",
      "RAM": "Kingston Fury Beast RGB 16GB (2x8GB) 3200MHz",
      "VGA": "ASUS TUF RTX 4060 8GB GDDR6",
      "SSD": "Kingston NV2 500GB NVMe M.2",
      "Nguồn": "MSI MAG A650BN 650W 80 Plus Bronze",
      "Case": "Case bể kính Aquarius RGB + 3 quạt LED"
    },
    warrantyMonths: 36,
    stockQuantity: 8,
    isFeatured: true,
    isFlashDeal: true,
    isPrebuilt: true
  }
];

async function main() {
  console.log("🚀 Xóa dữ liệu cũ...");
  await prisma.orderItem.deleteMany({});
  await prisma.productSerial.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});

  console.log("📦 Khởi tạo dữ liệu Linh kiện Máy tính mới...");
  for (const item of mockProducts) {
    const product = await prisma.product.create({
      data: item
    });

    // Tạo sẵn mã Serial mẫu cho mỗi sản phẩm để test hệ thống Bảo hành & Kho
    const serialCount = Math.min(item.stockQuantity, 5);
    for (let i = 1; i <= serialCount; i++) {
      const serialNum = `${item.brand.toUpperCase()}-${item.category}-${Math.floor(100000 + Math.random() * 900000)}`;
      await prisma.productSerial.create({
        data: {
          productId: product.id,
          serialNumber: serialNum,
          status: "AVAILABLE"
        }
      });
    }
  }

  console.log("✅ Khởi tạo thành công Seed Data Linh kiện máy tính!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
