'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  ShieldCheck, Award, ArrowRight, Zap, ExternalLink,
  Sparkles, CheckCircle2, ChevronRight, Cpu, HardDrive, Box, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandItem {
  id: string;
  name: string;
  displayName: string;
  desc: string;
  logo: string;
  category: 'CORE' | 'STORAGE' | 'COOLING';
  tier: string;
  warranty: string;
  hotProducts: string[];
  searchQuery: string;
}

const BRAND_LIST: BrandItem[] = [
  {
    id: 'intel',
    name: 'Intel',
    displayName: 'INTEL',
    desc: 'Vi Xử Lý CPU',
    logo: '/logos/brands/intel.svg',
    category: 'CORE',
    tier: 'Đối Tác Phân Phối Cấp 1',
    warranty: 'Bảo hành 36 Tháng 1 Đổi 1',
    hotProducts: ['Core i5 13400F', 'Core i7 14700K', 'Core i9 14900K'],
    searchQuery: 'Intel',
  },
  {
    id: 'amd',
    name: 'AMD',
    displayName: 'AMD',
    desc: 'Ryzen & Radeon',
    logo: '/logos/brands/amd.svg',
    category: 'CORE',
    tier: 'Đối Tác Chiến Lược 3D V-Cache',
    warranty: 'Bảo hành 36 Tháng Chính Hãng',
    hotProducts: ['Ryzen 7 7800X3D', 'Ryzen 5 7600X', 'Radeon RX 7800 XT'],
    searchQuery: 'AMD',
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    displayName: 'NVIDIA',
    desc: 'GeForce RTX',
    logo: '/logos/brands/nvidia.svg',
    category: 'CORE',
    tier: 'Đối Tác Đồ Họa Công Nghệ AI',
    warranty: 'Bảo hành 36 Tháng 1 Đổi 1',
    hotProducts: ['GeForce RTX 4060', 'GeForce RTX 4070 SUPER', 'GeForce RTX 4080 Super'],
    searchQuery: 'RTX',
  },
  {
    id: 'asus',
    name: 'ASUS ROG',
    displayName: 'ASUS ROG',
    desc: 'Bo Mạch & VGA',
    logo: '/logos/brands/asus.svg',
    category: 'CORE',
    tier: 'Đối Tác Chiến Lược Tier-1',
    warranty: 'Bảo hành 36 Tháng Tận Nơi',
    hotProducts: ['ROG Strix Z790-F', 'TUF Gaming RTX 4060', 'ROG Swift 360Hz'],
    searchQuery: 'ASUS',
  },
  {
    id: 'msi',
    name: 'MSI',
    displayName: 'MSI',
    desc: 'Gaming Series',
    logo: '/logos/brands/msi.svg',
    category: 'CORE',
    tier: 'Nhà Phân Phối Ủy Quyền',
    warranty: 'Bảo hành 36 Tháng Chính Hãng',
    hotProducts: ['MAG B760M Mortar', 'VGA RTX 4070 Gaming X', 'Nguồn MAG A750GL'],
    searchQuery: 'MSI',
  },
  {
    id: 'gigabyte',
    name: 'GIGABYTE',
    displayName: 'GIGABYTE',
    desc: 'AORUS Master',
    logo: '/logos/brands/gigabyte.svg',
    category: 'CORE',
    tier: 'Đối Tác Công Nghệ Ép Xung',
    warranty: 'Bảo hành 36 Tháng Toàn Quốc',
    hotProducts: ['B650M Aorus Elite', 'RTX 4070 Ti Super Aorus', 'Z790 Aorus Master'],
    searchQuery: 'Gigabyte',
  },
  {
    id: 'corsair',
    name: 'CORSAIR',
    displayName: 'CORSAIR',
    desc: 'RAM & Tản Nhiệt',
    logo: '/logos/brands/corsair.svg',
    category: 'COOLING',
    tier: 'Đối Tác Hệ Sinh Thái iCUE',
    warranty: 'Bảo hành 36 - 84 Tháng',
    hotProducts: ['Vengeance RGB DDR5', 'Nguồn RM850e Gold', 'Tản AIO H150i LCD'],
    searchQuery: 'Corsair',
  },
  {
    id: 'samsung',
    name: 'SAMSUNG',
    displayName: 'SAMSUNG',
    desc: 'Ổ Cứng SSD M.2',
    logo: '/logos/brands/samsung.svg',
    category: 'STORAGE',
    tier: 'Đại Lý Lưu Trữ Chiến Lược',
    warranty: 'Bảo hành 60 Tháng (5 Năm)',
    hotProducts: ['SSD 990 PRO 1TB / 2TB', 'SSD 980 500GB NVMe', 'Màn Odyssey OLED G9'],
    searchQuery: 'Samsung',
  },
  {
    id: 'kingston',
    name: 'KINGSTON',
    displayName: 'KINGSTON',
    desc: 'FURY Gaming',
    logo: '/logos/brands/kingston.svg',
    category: 'STORAGE',
    tier: 'Đối Tác Bộ Nhớ RAM & SSD',
    warranty: 'Bảo hành 36 - 60 Tháng',
    hotProducts: ['RAM FURY Renegade RGB', 'SSD KC3000 1TB Gen4', 'SSD NV2 PCIe 4.0'],
    searchQuery: 'Kingston',
  },
  {
    id: 'westerndigital',
    name: 'WESTERN DIGITAL',
    displayName: 'WESTERN DIGITAL',
    desc: 'Lưu Trữ Black',
    logo: '/logos/brands/westerndigital.svg',
    category: 'STORAGE',
    tier: 'Đại Lý Lưu Trữ Cao Cấp',
    warranty: 'Bảo hành 36 - 60 Tháng',
    hotProducts: ['WD Black SN850X 1TB', 'WD Blue SN580 1TB', 'HDD WD Black Gaming'],
    searchQuery: 'Western Digital',
  },
  {
    id: 'nzxt',
    name: 'NZXT',
    displayName: 'NZXT',
    desc: 'Kraken & Vỏ Case',
    logo: '/logos/brands/nzxt.svg',
    category: 'COOLING',
    tier: 'Đối Tác Thiết Kế Showcase',
    warranty: 'Bảo hành 24 - 72 Tháng',
    hotProducts: ['Case H9 Flow Dual-Chamber', 'Tản Kraken Elite 360 RGB', 'Fan F120 RGB Duo'],
    searchQuery: 'NZXT',
  },
  {
    id: 'lianli',
    name: 'LIAN LI',
    displayName: 'LIAN LI',
    desc: 'Vỏ Máy & Quạt RGB',
    logo: '/logos/brands/lianli.svg',
    category: 'COOLING',
    tier: 'Đối Tác Case Kính & Fan Ghép',
    warranty: 'Bảo hành 24 - 36 Tháng',
    hotProducts: ['O11 Dynamic EVO RGB', 'Quạt UNI FAN TL LCD', 'Dây Strimer Plus V2'],
    searchQuery: 'Lian Li',
  },
];

const CATEGORY_TABS = [
  { id: 'ALL', label: 'Tất Cả Thương Hiệu (12)', icon: Sparkles },
  { id: 'CORE', label: 'CPU • Bo Mạch • VGA (6)', icon: Cpu },
  { id: 'STORAGE', label: 'RAM • Ổ Cứng SSD (3)', icon: HardDrive },
  { id: 'COOLING', label: 'Vỏ Case • Tản Nhiệt (3)', icon: Box },
];

export default function SponsorsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CORE' | 'STORAGE' | 'COOLING'>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);

  const filteredBrands = useMemo(() => {
    if (activeTab === 'ALL') return BRAND_LIST;
    return BRAND_LIST.filter((b) => b.category === activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-300">
      <Header />

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 space-y-12">
        
        {/* ─── 1. HERO TITLE & INTRO BANNER (MATCHING IMAGE 1) ─── */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-xs font-black text-[#0284c7] dark:text-sky-300 uppercase tracking-widest shadow-2xs font-heading">
            <ShieldCheck className="w-4 h-4 text-[#0284c7] dark:text-sky-400" />
            <span>ĐỐI TÁC PHÂN PHỐI ỦY QUYỀN CHÍNH HÃNG</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-slate-900 dark:text-white uppercase tracking-tight">
            TRUNG TÂM BẢO HÀNH ỦY QUYỀN CHÍNH HÃNG
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed">
            DRX Hardware là đối tác phân phối và trạm dịch vụ ủy quyền của các thương hiệu phần cứng hàng đầu thế giới
          </p>
        </div>

        {/* ─── 2. CATEGORY FILTER TABS ─── */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar p-1.5 max-w-2xl mx-auto">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/25 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── 3. 12 BRAND CARDS GRID (EXACT LAYOUT AS IMAGE 1) ─── */}
        <section className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {filteredBrands.map((brand) => {
                const isSelected = selectedBrand?.id === brand.id;
                return (
                  <motion.div
                    key={brand.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div
                      onClick={() => setSelectedBrand(isSelected ? null : brand)}
                      className={`h-full bg-white dark:bg-slate-900 border rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between space-y-3 cursor-pointer transition-all duration-300 group shadow-2xs hover:shadow-lg ${
                        isSelected 
                          ? 'border-[#0284c7] dark:border-sky-500 ring-2 ring-sky-500/20 shadow-md scale-[1.02]' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-[#0284c7] dark:hover:border-sky-500 hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Brand Logo Container */}
                      <div className="h-10 w-full flex items-center justify-center px-2">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="max-h-8 max-w-[100px] object-contain transition-all duration-300 group-hover:scale-108 dark:brightness-0 dark:invert opacity-90 group-hover:opacity-100"
                        />
                      </div>

                      {/* Brand Titles */}
                      <div className="text-center w-full space-y-0.5">
                        <span className="font-heading text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white block tracking-wider group-hover:text-[#0284c7] transition-colors truncate">
                          {brand.displayName}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 font-medium block truncate">
                          {brand.desc}
                        </span>
                      </div>

                      {/* View Products Link */}
                      <Link
                        href={`/products?search=${encodeURIComponent(brand.searchQuery)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-center py-1 px-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 hover:text-[#0284c7] dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-all flex items-center justify-center gap-1 group/btn mt-1"
                      >
                        <span>Sản phẩm</span>
                        <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* ─── 4. SELECTED BRAND EXPANDED DETAIL DRAWER (IF CLICKED) ─── */}
        {selectedBrand && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl shadow-sky-500/5 max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2.5">
                  <img
                    src={selectedBrand.logo}
                    alt={selectedBrand.name}
                    className="max-h-full max-w-full object-contain dark:brightness-0 dark:invert"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                      {selectedBrand.tier}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      • {selectedBrand.desc}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-black text-slate-900 dark:text-white mt-1">
                    Hệ Thống Phân Phối Chính Hãng {selectedBrand.displayName}
                  </h3>
                </div>
              </div>

              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 self-start sm:self-auto">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{selectedBrand.warranty}</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  CÁC DÒNG SẢN PHẨM TIÊU BIỂU:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedBrand.hotProducts.map((prod, pIdx) => (
                    <Link
                      key={pIdx}
                      href={`/products?search=${encodeURIComponent(prod)}`}
                      className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 hover:text-[#0284c7] hover:border-sky-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{prod}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href={`/products?search=${encodeURIComponent(selectedBrand.searchQuery)}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black font-heading uppercase tracking-wider shadow-md shadow-sky-500/25 transition-all shrink-0 hover:scale-105 cursor-pointer"
              >
                <span>Xem Tất Cả Sản Phẩm {selectedBrand.displayName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* ─── 5. CORE TRUST COMMITMENTS ─── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-start gap-4 shadow-2xs">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black font-heading text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                100% Phân Phối Chính Hãng
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                Đầy đủ hóa đơn VAT, tem nhập khẩu chính ngạch và số Serial Number được kích hoạt trực tiếp từ hãng.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-start gap-4 shadow-2xs">
            <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-[#0284c7] shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black font-heading text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Bảo Hành 1 Đổi 1 Tận Nơi
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                Cam kết đổi mới linh kiện tương đương trong 30 ngày đầu nếu phát sinh lỗi phần cứng từ nhà sản xuất.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-start gap-4 shadow-2xs">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black font-heading text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Trợ Giá Build PC Gaming
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                Mức giá chiết khấu đại lý tốt nhất thị trường kèm quà tặng phụ kiện độc quyền từ các hãng đối tác.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 6. CALL TO ACTION BAR ─── */}
        <section className="bg-gradient-to-r from-sky-50 via-white to-blue-50/60 dark:from-slate-900 dark:to-slate-800/80 border border-sky-200 dark:border-slate-700 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-slate-800 text-[#0284c7] flex items-center justify-center mx-auto shadow-2xs">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white uppercase tracking-tight">
            TRA CỨU HẠN BẢO HÀNH LINH KIỆN ĐIỆN TỬ
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Bạn đã mua linh kiện tại DRX Hardware? Chỉ cần nhập mã Serial Number (SN) trên vỏ hộp để kiểm tra thời hạn bảo hành chính hãng và tiến độ bảo trì trực tuyến.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/warranty"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black font-heading uppercase tracking-wider shadow-lg shadow-sky-500/25 transition-all hover:scale-105 cursor-pointer"
            >
              <span>Cổng Tra Cứu Bảo Hành</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-black font-heading uppercase tracking-wider shadow-2xs hover:border-[#0284c7] transition-all hover:scale-105 cursor-pointer"
            >
              <span>Khám Phá Danh Mục Linh Kiện</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
