'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Sparkles, ShieldCheck, Award, ArrowRight, CheckCircle2, Zap, Star, 
  ExternalLink, Layers, Cpu, Box, HardDrive, Monitor, Flame, BadgePercent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SponsorBrand {
  id: string;
  name: string;
  categoryType: 'CORE' | 'COOLING' | 'STORAGE' | 'DISPLAY' | 'ALL';
  categoryDisplay: string;
  partnerTier: string;
  logoSvg: string;
  subtitle: string;
  description: string;
  warranty: string;
  discountBadge: string;
  brandColor: string;
  bgLightGradient: string;
  realHardwareImage: string;
  flagshipImageAlt: string;
  featuredProducts: { name: string; tag: string }[];
}

const SPONSOR_BRANDS: SponsorBrand[] = [
  {
    id: 'asus-rog',
    name: 'ASUS ROG',
    categoryType: 'CORE',
    categoryDisplay: 'Card VGA • Bo Mạch Chủ • Màn Hình • Laptop',
    partnerTier: 'ĐỐI TÁC CHIẾN LƯỢC TIER-1',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg',
    subtitle: 'Biểu tượng tối thượng của game thủ & linh kiện eSport',
    description: 'Dòng sản phẩm ROG Strix & TUF Gaming dẫn đầu thế giới với kiến trúc tản nhiệt quạt Axial-Tech, mạch VRM bọc giáp siêu dày và màn hình Fast IPS 360Hz.',
    warranty: 'Bảo hành 36 Tháng 1 Đổi 1',
    discountBadge: 'GIẢM ĐẾN 25% HÈ',
    brandColor: '#E10600',
    bgLightGradient: 'from-rose-50 via-white to-red-50/40',
    realHardwareImage: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
    flagshipImageAlt: 'Dàn PC Gaming ASUS ROG Strix tản nước RGB đỉnh cao',
    featuredProducts: [
      { name: 'Card RTX 4060 TUF OC 8G', tag: 'Bán chạy' },
      { name: 'Mainboard ROG Strix Z790-F', tag: 'Cao cấp' },
      { name: 'Màn hình ROG Swift 360Hz', tag: 'eSport' },
      { name: 'Tản nhiệt ROG Ryujin III 360', tag: 'Màn LCD' }
    ],
  },
  {
    id: 'msi',
    name: 'MSI GAMING',
    categoryType: 'CORE',
    categoryDisplay: 'Mainboard • Card VGA • Bộ Nguồn • Vỏ Case',
    partnerTier: 'NHÀ PHÂN PHỐI ỦY QUYỀN CHÍNH THỨC',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/MSI_Logo.svg',
    subtitle: 'Linh hồn rồng đỏ – Sức mạnh bo mạch & card đồ họa quốc dân',
    description: 'Bo mạch chủ MAG Tomahawk / Mortar và Card VGA Gaming X Slim trang bị ống đồng dẫn nhiệt Core Pipe, thiết kế PCB 6 lớp đồng 2oz siêu bền.',
    warranty: 'Bảo hành 36 Tháng Chính Hãng',
    discountBadge: 'TẶNG VOUCHER 500K',
    brandColor: '#FF0000',
    bgLightGradient: 'from-red-50 via-white to-slate-50',
    realHardwareImage: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
    flagshipImageAlt: 'Card màn hình MSI Gaming X Trio tản nhiệt Torx Fan 5.0',
    featuredProducts: [
      { name: 'VGA RTX 4070 SUPER Gaming X', tag: 'Khuyên dùng' },
      { name: 'Main MAG B760M Mortar WiFi', tag: 'DDR5' },
      { name: 'Nguồn MSI MAG A750GL ATX3.0', tag: 'Chuẩn PCIe 5' },
      { name: 'Case MSI Gungnir 110R ARGB', tag: 'Kính cường lực' }
    ],
  },
  {
    id: 'gigabyte',
    name: 'GIGABYTE AORUS',
    categoryType: 'CORE',
    categoryDisplay: 'Mainboard AM5 / LGA1700 • VGA Aorus Master',
    partnerTier: 'ĐỐI TÁC CÔNG NGHỆ ÉP XUNG CAO CẤP',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Gigabyte_Technology_logo_20080107.svg',
    subtitle: 'Bo mạch chủ & VGA tối ưu hiệu năng tản nhiệt Windforce',
    description: 'Hệ thống tản nhiệt buồng hơi Vapor Chamber, hỗ trợ PCIe Gen5 x16 bọc giáp PCIe EZ-Latch giúp việc lắp ráp nâng cấp linh kiện trở nên siêu tiện lợi.',
    warranty: 'Bảo hành 36 Tháng Toàn Quốc',
    discountBadge: 'ƯU ĐÃI ÉP XUNG',
    brandColor: '#FF6600',
    bgLightGradient: 'from-amber-50 via-white to-orange-50/40',
    realHardwareImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    flagshipImageAlt: 'Giao diện bo mạch chủ GIGABYTE AORUS Z790 Master cao cấp',
    featuredProducts: [
      { name: 'Main B650M Aorus Elite AX', tag: 'AMD AM5' },
      { name: 'VGA RTX 4070 Ti Super Aorus', tag: 'Màn LCD Edge' },
      { name: 'Main Z790 Aorus Master X', tag: 'Wi-Fi 7' },
      { name: 'SSD Aorus Gen5 10000 2TB', tag: '10000MB/s' }
    ],
  },
  {
    id: 'corsair',
    name: 'CORSAIR',
    categoryType: 'COOLING',
    categoryDisplay: 'RAM DDR5 • Nguồn ATX 3.0 • Tản AIO • Case PC',
    partnerTier: 'ĐỐI TÁC HỆ SINH THÁI iCUE TOÀN CẦU',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Corsair_logo.svg',
    subtitle: 'Đỉnh cao hệ sinh thái linh kiện thông minh iCUE LINK',
    description: 'RAM Dominator Titanium & Vengeance RGB DDR5 ép xung đỉnh cao, kết hợp nguồn RMe Series 80 Plus Gold và chuẩn kết nối đơn dây thông minh iCUE LINK.',
    warranty: 'Bảo hành 36 - 84 Tháng (7 Năm)',
    discountBadge: 'GIẢM ĐẾN 30%',
    brandColor: '#F5D300',
    bgLightGradient: 'from-yellow-50 via-white to-amber-50/30',
    realHardwareImage: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&q=80',
    flagshipImageAlt: 'Hệ thống quạt và tản nhiệt nước Corsair iCUE LINK RGB',
    featuredProducts: [
      { name: 'RAM Vengeance RGB 32GB DDR5', tag: '6000MHz' },
      { name: 'Nguồn Corsair RM850e Gold', tag: 'ATX 3.0' },
      { name: 'Tản AIO iCUE H150i LCD', tag: 'Màn hình IPS' },
      { name: 'Case Corsair 4000D Airflow', tag: 'Siêu thoáng' }
    ],
  },
  {
    id: 'nzxt',
    name: 'NZXT',
    categoryType: 'COOLING',
    categoryDisplay: 'Case Bể Kính Panorama • Tản Nhiệt Kraken LCD',
    partnerTier: 'ĐỐI TÁC THIẾT KẾ SHOWCASE CAO CẤP',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/0/03/NZXT_Logo.svg',
    subtitle: 'Nghệ thuật thiết kế Case bể kính 270° không góc chết',
    description: 'Vỏ máy tính NZXT H9 Flow / H6 Flow thiết kế Dual-Chamber luồng gió độc lập, phối hợp tản nước Kraken Elite với màn hình tròn LCD 2.36 inch hiển thị GIF siêu nét.',
    warranty: 'Bảo hành 24 - 72 Tháng',
    discountBadge: 'TẶNG QUẠT ARGB',
    brandColor: '#8200FF',
    bgLightGradient: 'from-purple-50 via-white to-indigo-50/40',
    realHardwareImage: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
    flagshipImageAlt: 'Vỏ máy tính NZXT H9 Flow mặt kính cường lực trong suốt',
    featuredProducts: [
      { name: 'Case NZXT H9 Flow Black/White', tag: 'Dual-Chamber' },
      { name: 'Tản nước Kraken Elite 360 RGB', tag: 'Màn LCD 60FPS' },
      { name: 'Nguồn NZXT C850 850W Gold', tag: 'Full Module' },
      { name: 'Fan NZXT F120 RGB Duo', tag: '2 Mặt LED' }
    ],
  },
  {
    id: 'samsung',
    name: 'SAMSUNG',
    categoryType: 'STORAGE',
    categoryDisplay: 'Ổ Cứng SSD NVMe PCIe 4.0/5.0 • Màn Hình Odyssey',
    partnerTier: 'ĐẠI LÝ LƯU TRỮ & MÀN HÌNH CHIẾN LƯỢC',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    subtitle: 'Ông vua tốc độ lưu trữ SSD và màn hình Gaming Odyssey',
    description: 'SSD Samsung 990 PRO với chip nhớ V-NAND thế hệ mới đạt tốc độ đọc 7450MB/s, kiểm soát nhiệt độ thông minh Dynamic Thermal Guard.',
    warranty: 'Bảo hành 60 Tháng (5 Năm)',
    discountBadge: 'GIẢM ĐẾN 20%',
    brandColor: '#1428A0',
    bgLightGradient: 'from-blue-50 via-white to-sky-50/40',
    realHardwareImage: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',
    flagshipImageAlt: 'Ổ cứng thể rắn SSD Samsung NVMe M.2 siêu tốc',
    featuredProducts: [
      { name: 'SSD Samsung 990 PRO 1TB / 2TB', tag: '7450MB/s' },
      { name: 'Màn hình Odyssey G4 27" 240Hz', tag: 'Fast IPS' },
      { name: 'SSD Samsung 980 500GB NVMe', tag: 'Giá sinh viên' },
      { name: 'Màn Odyssey OLED G9 49" 240Hz', tag: 'Cong 1800R' }
    ],
  },
  {
    id: 'intel',
    name: 'INTEL',
    categoryType: 'CORE',
    categoryDisplay: 'CPU Intel Core i5 / i7 / i9 Thế Hệ 13 & 14',
    partnerTier: 'NHÀ PHÂN PHỐI VI XỬ LÝ CHÍNH HÃNG',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282020%29.svg',
    subtitle: 'Kiến trúc lai Raptor Lake Refresh bứt phá mọi giới hạn xử lý',
    description: 'Vi xử lý Intel Core i5 13400F, i7 14700K và i9 14900K với xung nhịp Turbo Boost lên tới 6.0GHz, tối ưu tuyệt hảo cho chơi game FPS và render 3D nặng.',
    warranty: 'Bảo hành 36 Tháng 1 Đổi 1',
    discountBadge: 'DEAL MÙA HÈ CPU 0Đ',
    brandColor: '#0068B5',
    bgLightGradient: 'from-sky-50 via-white to-blue-50/40',
    realHardwareImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80',
    flagshipImageAlt: 'Vi xử lý CPU Intel Core thế hệ mới trên socket LGA 1700',
    featuredProducts: [
      { name: 'CPU Intel Core i5 13400F', tag: 'Quốc dân' },
      { name: 'CPU Intel Core i7 14700K', tag: '20 Nhân 28 Luồng' },
      { name: 'CPU Intel Core i9 14900K', tag: 'Turbo 6.0GHz' },
      { name: 'Card Intel Arc A770 16GB', tag: 'Đồ họa AI' }
    ],
  },
  {
    id: 'amd',
    name: 'AMD RYZEN',
    categoryType: 'CORE',
    categoryDisplay: 'CPU Ryzen 7000 / 9000 Series • VGA Radeon RX',
    partnerTier: 'ĐỐI TÁC VI XỬ LÝ GAMING 3D V-CACHE',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg',
    subtitle: 'Vua hiệu năng chơi game eSport với công nghệ bộ nhớ đệm 3D V-Cache',
    description: 'AMD Ryzen 7 7800X3D và 7950X3D thống trị bảng xếp hạng FPS thế giới với bộ nhớ đệm L3 lên tới 128MB, tiêu thụ điện năng siêu tiết kiệm trên socket AM5.',
    warranty: 'Bảo hành 36 Tháng Chính Hãng',
    discountBadge: 'GIẢM ĐẾN 1.5 TRIỆU',
    brandColor: '#ED1C24',
    bgLightGradient: 'from-orange-50 via-white to-red-50/40',
    realHardwareImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    flagshipImageAlt: 'Bo mạch và CPU AMD Ryzen Socket AM5 tiến trình 5nm',
    featuredProducts: [
      { name: 'Ryzen 7 7800X3D 3D V-Cache', tag: 'Top 1 Gaming' },
      { name: 'Ryzen 5 7600X (AM5 DDR5)', tag: 'Hiệu năng cao' },
      { name: 'Ryzen 9 7950X3D 16 Nhân', tag: 'Workstation' },
      { name: 'VGA Radeon RX 7800 XT 16G', tag: 'Gaming 2K' }
    ],
  },
  {
    id: 'lian-li',
    name: 'LIAN LI',
    categoryType: 'COOLING',
    categoryDisplay: 'Vỏ Case O11 Dynamic • Quạt Tản Nhiệt UNI FAN LCD',
    partnerTier: 'ĐỐI TÁC THIẾT KẾ VỎ MÁY TÍNH HÀNG ĐẦU',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Lian_Li_logo.svg',
    subtitle: 'Thước đo tiêu chuẩn vỏ case kính và quạt ghép không dây',
    description: 'Dòng case huyền thoại O11 Dynamic EVO RGB và quạt ghép nối tiếp UNI FAN TL LCD cho phép tùy biến màn hình video và hiệu ứng LED ARGB vô cực.',
    warranty: 'Bảo hành 24 - 36 Tháng',
    discountBadge: 'HOT TREND 2026',
    brandColor: '#00A3E0',
    bgLightGradient: 'from-cyan-50 via-white to-sky-50/40',
    realHardwareImage: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80',
    flagshipImageAlt: 'Vỏ case Lian Li O11 Dynamic EVO với dàn quạt ARGB',
    featuredProducts: [
      { name: 'Case Lian Li O11 Dynamic EVO RGB', tag: 'Bể kính 3 mặt' },
      { name: 'Quạt UNI FAN TL LCD 120 ARGB', tag: 'Màn hình IPS' },
      { name: 'Dây nguồn Strimer Plus V2 24P', tag: 'Đèn LED RGB' },
      { name: 'Tản nước Galahad II Trinity 360', tag: 'Hiệu năng Asetek' }
    ],
  },
  {
    id: 'kingston',
    name: 'KINGSTON FURY',
    categoryType: 'STORAGE',
    categoryDisplay: 'RAM FURY Beast/Renegade RGB • SSD M.2 PCIe 4.0',
    partnerTier: 'ĐỐI TÁC BỘ NHỚ RAM & SSD CHÍNH HÃNG',
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Kingston_Technology_logo.svg',
    subtitle: 'Độ ổn định vượt thời gian cho mọi cấu hình PC Gaming',
    description: 'RAM Kingston FURY Renegade DDR5 với công nghệ đồng bộ ánh sáng hồng ngoại Infrared Sync độc quyền và SSD KC3000 tốc độ đọc ghi 7000MB/s.',
    warranty: 'Bảo hành 36 - 60 Tháng',
    discountBadge: 'GIÁ TẬN GỐC',
    brandColor: '#E4002B',
    bgLightGradient: 'from-rose-50 via-white to-slate-50',
    realHardwareImage: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80',
    flagshipImageAlt: 'Thanh RAM Kingston FURY Renegade RGB DDR5 tản nhiệt kim loại',
    featuredProducts: [
      { name: 'RAM FURY Renegade 32GB DDR5', tag: '6400MHz' },
      { name: 'SSD Kingston KC3000 1TB Gen4', tag: '7000MB/s' },
      { name: 'RAM FURY Beast Black 16GB', tag: 'DDR4 / DDR5' },
      { name: 'SSD Kingston NV2 1TB PCIe 4.0', tag: 'Giá siêu tốt' }
    ],
  },
];

const CATEGORY_TABS = [
  { id: 'ALL', label: 'Tất Cả Thương Hiệu', icon: Sparkles },
  { id: 'CORE', label: 'Bo Mạch & Card VGA', icon: Cpu },
  { id: 'COOLING', label: 'Case & Tản Nhiệt', icon: Box },
  { id: 'STORAGE', label: 'RAM & Ổ Cứng SSD', icon: HardDrive },
];

export default function SponsorsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CORE' | 'COOLING' | 'STORAGE'>('ALL');

  const filteredBrands = useMemo(() => {
    if (activeTab === 'ALL') return SPONSOR_BRANDS;
    return SPONSOR_BRANDS.filter((b) => b.categoryType === activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased tech-grid-pattern transition-colors duration-300">
      <Header />

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 space-y-12">
        
        {/* ─── 1. HERO SHOWROOM BANNER (CLEAN LIGHT THEME) ─── */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-[#071930] dark:to-slate-950 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0284c7]/10 dark:bg-[#0284c7]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 px-4 py-1.5 text-xs font-black text-[#0284c7] dark:text-sky-300 uppercase tracking-widest font-heading shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-[#0284c7]" />
              <span>TRUNG TÂM PHÂN PHỐI ỦY QUYỀN CHÍNH HÃNG VIỆT NAM</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
              CÁC THƯƠNG HIỆU PHẦN CỨNG HÀNG ĐẦU TẠI{' '}
              <span className="bg-gradient-to-r from-[#0284c7] via-sky-600 to-blue-600 bg-clip-text text-transparent">
                DRX HARDWARE
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              DRX Hardware là đối tác phân phối ủy quyền cấp 1 (Tier-1 Partner) trực tiếp từ các tập đoàn công nghệ hàng đầu thế giới: ASUS ROG, MSI, GIGABYTE, CORSAIR, NZXT, SAMSUNG, INTEL, AMD, LIAN LI, KINGSTON. Mọi linh kiện xuất kho đều nguyên seal, bảo hành 1 đổi 1 tận nơi 36 tháng.
            </p>

            {/* 3 CORE TRUST BADGES */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="flex items-center gap-3 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">100% CHÍNH HÃNG</span>
                  <span className="text-[10px] text-slate-500 font-medium">Hóa đơn VAT & Tem nhà phân phối</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#0284c7]">
                  <Award className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">BẢO HÀNH 36 THÁNG</span>
                  <span className="text-[10px] text-slate-500 font-medium">1 Đổi 1 trong 30 ngày đầu</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                  <Zap className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">GIÁ TẬN GỐC</span>
                  <span className="text-[10px] text-slate-500 font-medium">Trợ giá build PC tốt nhất</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. CATEGORY FILTER CAPSULE TABS ─── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-[#0284c7] font-black uppercase tracking-widest block mb-1">
                AUTHORIZED HARDWARE ECOSYSTEM
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
                <span>HỆ THỐNG ĐỐI TÁC THƯƠNG HIỆU CHIẾN LƯỢC</span>
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              {CATEGORY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── 3. SPONSOR BRAND CARDS GRID WITH REAL HARDWARE PHOTOS ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredBrands.map((brand) => (
                <motion.div
                  key={brand.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-sky-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Section */}
                  <div className="p-6 sm:p-7 space-y-5">
                    {/* Header: Logo, Name, Tier Badge, Promotion */}
                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                            {brand.partnerTier}
                          </span>
                        </div>
                        <h3 className="font-heading text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-[#0284c7] transition-colors">
                          {brand.name}
                        </h3>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                          {brand.categoryDisplay}
                        </span>
                      </div>

                      <span className="bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 text-xs font-black uppercase px-3.5 py-1.5 rounded-2xl shrink-0 shadow-2xs">
                        {brand.discountBadge}
                      </span>
                    </div>

                    {/* REAL HARDWARE IMAGE SHOWCASE BANNER */}
                    <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner group/img">
                      <img
                        src={brand.realHardwareImage}
                        alt={brand.flagshipImageAlt}
                        className="w-full h-full object-cover group-hover/img:scale-108 transition-transform duration-700 brightness-95 group-hover/img:brightness-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

                      {/* Floating Bottom Subtitle */}
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
                        <p className="text-xs font-extrabold text-white line-clamp-1 drop-shadow-md">
                          {brand.subtitle}
                        </p>
                        <span className="text-[10px] text-slate-300 font-light line-clamp-1 mt-0.5">
                          {brand.flagshipImageAlt}
                        </span>
                      </div>
                    </div>

                    {/* Brand Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                      {brand.description}
                    </p>

                    {/* FEATURED FLAGSHIP PRODUCTS PILLS */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        SẢN PHẨM TIÊU BIỂU CỦA HÃNG:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {brand.featuredProducts.map((prod, pIdx) => (
                          <Link
                            key={pIdx}
                            href={`/products?search=${encodeURIComponent(prod.name)}`}
                            className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-sky-50 hover:text-[#0284c7] hover:border-sky-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-2xs cursor-pointer group/pill"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>{prod.name}</span>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-900 text-slate-500 group-hover/pill:text-[#0284c7] border border-slate-200 dark:border-slate-800">
                              {prod.tag}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Bar */}
                  <div className="bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 p-5 sm:px-7 flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span>{brand.warranty}</span>
                    </span>

                    <Link
                      href={`/products?search=${encodeURIComponent(brand.name)}`}
                      className="inline-flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-heading font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md shadow-sky-500/20 group-hover:scale-105 cursor-pointer"
                    >
                      <span>Xem Sản Phẩm {brand.name}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* ─── 4. OFFICIAL VERIFICATION TRUST SECTION ─── */}
        <section className="bg-gradient-to-r from-sky-50 via-white to-blue-50/60 dark:from-slate-900 dark:to-slate-800 border border-sky-200 dark:border-slate-700 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-slate-800 text-[#0284c7] flex items-center justify-center mx-auto shadow-2xs">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white uppercase tracking-tight">
            QUYỀN LỢI KHI MUA HÀNG CHÍNH HÃNG TẠI DRX HARDWARE
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Nói không với hàng xách tay trôi nổi, hàng trâu cày qua sửa chữa. Mọi sản phẩm tại DRX Hardware đều được bảo vệ bởi chính sách 1 đổi 1 tức thì, hỗ trợ kích hoạt bảo hành điện tử chính hãng từ ngày mua.
          </p>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/warranty"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-black font-heading uppercase tracking-wider shadow-sm hover:opacity-90 transition-all"
            >
              <span>Cổng Tra Cứu Bảo Hành Điện Tử</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black font-heading uppercase tracking-wider shadow-lg shadow-sky-500/25 transition-all"
            >
              <span>Khám Phá Toàn Bộ Kho Linh Kiện</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}