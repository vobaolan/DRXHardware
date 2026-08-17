'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sparkles, ShieldCheck, Award, ArrowRight, CheckCircle2, Zap, Star, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface SponsorBrand {
  id: string;
  name: string;
  category: string;
  logoText: string;
  subtitle: string;
  description: string;
  warranty: string;
  discountBadge: string;
  accentColor: string;
  bgGradient: string;
  featuredProducts: string[];
}

const SPONSOR_BRANDS: SponsorBrand[] = [
  {
    id: 'asus-rog',
    name: 'ASUS ROG',
    category: 'VGA, Mainboard, Laptop, Màn hình',
    logoText: 'ROG - REPUBLIC OF GAMERS',
    subtitle: 'Đối tác chiến lược linh kiện eSport hàng đầu thế giới',
    description: 'Thương hiệu sản xuất Mainboard, Card màn hình RTX 40 Series, Màn hình 360Hz và Laptop Gaming đỉnh cao với công nghệ tản nhiệt độc quyền.',
    warranty: 'Bảo hành 36 Tháng 1 Đổi 1',
    discountBadge: 'GIẢM ĐẾN 20%',
    accentColor: 'text-rose-500 border-rose-500/40',
    bgGradient: 'from-rose-500/10 via-slate-900 to-slate-950',
    featuredProducts: ['Card RTX 4060 TUF OC', 'Màn hình ROG Swift 360Hz', 'Laptop ROG Strix G16', 'Tản nước ROG Ryujin III'],
  },
  {
    id: 'msi',
    name: 'MSI GAMING',
    category: 'Mainboard, VGA, Nguồn, Case',
    logoText: 'MSI - DRAGON SPIRIT',
    subtitle: 'Chuyên gia bo mạch chủ & card đồ họa quốc dân',
    description: 'Nổi tiếng với các dòng Mainboard MAG Mortar, Card RTX Ventus / Gaming X và nguồn chuẩn ATX 3.0 bền bỉ.',
    warranty: 'Bảo hành 36 Tháng Chính Hãng',
    discountBadge: 'TẶNG VOUCHER 500K',
    accentColor: 'text-red-500 border-red-500/40',
    bgGradient: 'from-red-500/10 via-slate-900 to-slate-950',
    featuredProducts: ['Main MAG B760M Mortar', 'VGA RTX 4070 Super 12G', 'Nguồn A650BN 650W', 'Case Mag Forge'],
  },
  {
    id: 'gigabyte',
    name: 'GIGABYTE AORUS',
    category: 'Mainboard AM5/LGA1700, VGA Aorus',
    logoText: 'GIGABYTE AORUS',
    subtitle: 'Bo mạch chủ và VGA tối ưu hiệu năng ép xung',
    description: 'Trang bị tản nhiệt VRM bọc giáp dày dặn, hỗ trợ chuẩn PCIe 5.0 M.2 và DDR5 EXPO siêu tốc cho dàn PC chơi game cao cấp.',
    warranty: 'Bảo hành 36 Tháng Toàn Quốc',
    discountBadge: 'ƯU ĐÃI ÉP XUNG',
    accentColor: 'text-amber-500 border-amber-500/40',
    bgGradient: 'from-amber-500/10 via-slate-900 to-slate-950',
    featuredProducts: ['Main B650M Aorus Elite', 'VGA RTX 4070 Ti Aorus', 'Main Z790 Aorus Master', 'SSD Aorus Gen4'],
  },
  {
    id: 'corsair',
    name: 'CORSAIR',
    category: 'RAM DDR5, Nguồn PSU, Case, Tản AIO',
    logoText: 'CORSAIR GAMING',
    subtitle: 'Vua hệ sinh thái linh kiện & nguồn 80 Plus Gold',
    description: 'Dẫn đầu thế giới về RAM Vengeance RGB DDR5, Nguồn RMe Series chuẩn ATX 3.0 PCIe 5.0 và phần mềm đồng bộ LED iCUE.',
    warranty: 'Bảo hành 36 - 84 Tháng',
    discountBadge: 'GIẢM ĐẾN 57%++',
    accentColor: 'text-yellow-500 border-yellow-500/40',
    bgGradient: 'from-yellow-500/10 via-slate-900 to-slate-950',
    featuredProducts: ['RAM Vengeance 32GB DDR5', 'Nguồn RM750e 80 Plus Gold', 'Tản AIO iCUE H150i', 'Case 4500X RGB'],
  },
  {
    id: 'nzxt',
    name: 'NZXT',
    category: 'Vỏ Case Bể Kính, Tản Nhiệt Kraken',
    logoText: 'NZXT PURITY & CRAFT',
    subtitle: 'Đỉnh cao thiết kế Case bể kính Panorama 270°',
    description: 'Các mẫu Case NZXT H9 Flow / H6 Flow Dual-Chamber với mặt kính cường lực thiết kế sang trọng cho dân chơi PC chuyên nghiệp.',
    warranty: 'Bảo hành 24 - 72 Tháng',
    discountBadge: 'TẶNG FAN ARGB',
    accentColor: 'text-purple-500 border-purple-500/40',
    bgGradient: 'from-purple-500/10 via-slate-900 to-slate-950',
    featuredProducts: ['Case NZXT H9 Flow Black', 'Tản nước Kraken Elite 360', 'Nguồn NZXT C850 Gold', 'Fan NZXT Duo RGB'],
  },
  {
    id: 'samsung',
    name: 'SAMSUNG',
    category: 'SSD NVMe PCIe 4.0/5.0, Màn Hình',
    logoText: 'SAMSUNG MEMORY & DISPLAY',
    subtitle: 'Vua tốc độ lưu trữ SSD và màn hình Odyssey G4/G7',
    description: 'SSD Samsung 990 PRO với tốc độ đọc 7450MB/s cùng tấm nền màn hình hiển thị sống động chuẩn đồ họa chuyên nghiệp.',
    warranty: 'Bảo hành 60 Tháng (5 Năm)',
    discountBadge: 'GIẢM ĐẾN 25%',
    accentColor: 'text-blue-500 border-blue-500/40',
    bgGradient: 'from-blue-500/10 via-slate-900 to-slate-950',
    featuredProducts: ['SSD 990 PRO 1TB NVMe', 'Màn Odyssey G4 240Hz', 'SSD 980 500GB', 'Màn Hình Curved 32"'],
  },
  {
    id: 'intel',
    name: 'INTEL',
    category: 'Bộ Vi Xử Lý CPU Gen 13 / 14',
    logoText: 'INTEL CORE PROCESSORS',
    subtitle: 'Sức mạnh 10 - 24 nhân xử lý mượt mà mọi tác vụ',
    description: 'CPU Intel Core i5 13400F, i7 14700K và i9 14900K với kiến trúc lai P-Core + E-Core giúp chơi game và render đồ họa vượt trội.',
    warranty: 'Bảo hành 36 Tháng Chính Hãng',
    discountBadge: 'DEAL MÙA HÈ CPU 0Đ',
    accentColor: 'text-cyan-500 border-cyan-500/40',
    bgGradient: 'from-cyan-500/10 via-slate-900 to-slate-950',
    featuredProducts: ['CPU Core i5 13400F', 'CPU Core i7 14700K', 'CPU Core i9 14900K', 'Intel Arc Graphics'],
  },
  {
    id: 'amd',
    name: 'AMD RYZEN',
    category: 'CPU Ryzen 7000 Series 3D V-Cache',
    logoText: 'AMD RYZEN & RADEON',
    subtitle: 'CPU Gaming nhanh nhất hành tinh với 3D V-Cache',
    description: 'AMD Ryzen 7 7800X3D và Ryzen 9 7950X3D mang tới trải nghiệm bứt phá FPS trong các tựa game eSport và AAA đỉnh cao.',
    warranty: 'Bảo hành 36 Tháng Chính Hãng',
    discountBadge: 'GIẢM ĐẾN 1.5 TR',
    accentColor: 'text-orange-500 border-orange-500/40',
    bgGradient: 'from-orange-500/10 via-slate-900 to-slate-950',
    featuredProducts: ['Ryzen 7 7800X3D (AM5)', 'Ryzen 5 7600X', 'Ryzen 9 7950X3D', 'VGA Radeon RX 7800 XT'],
  },
];

export default function SponsorsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredBrands = selectedCategory === 'ALL'
    ? SPONSOR_BRANDS
    : SPONSOR_BRANDS.filter(b => b.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased tech-grid-pattern">
      <Header />

      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-12">
        {/* ─── HERO BANNER ─── */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-[#0d111d] via-[#111827] to-[#090d16] p-8 sm:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/20 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 text-xs font-black text-amber-400 uppercase tracking-widest font-heading">
              <Sparkles className="h-4 w-4" />
              <span>ĐỐI TÁC THƯƠNG HIỆU & HÃNG TÀI TRỢ CHÍNH HÃNG</span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wider text-white">
              CÁC THƯƠNG HIỆU CÔNG NGHỆ HÀNG ĐẦU TẠI <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-orange-400 bg-clip-text text-transparent">ODSSTORE.COM</span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              ODSSTORE.COM tự hào là đại lý phân phối ủy quyền chính thức từ các tập đoàn công nghệ hàng đầu thế giới: ASUS ROG, MSI, GIGABYTE, CORSAIR, NZXT, SAMSUNG, INTEL, AMD... Tất cả sản phẩm linh kiện cam kết 100% chính hãng, bảo hành 1 đổi 1 tận nơi.
            </p>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2.5 bg-slate-900/80 border border-white/10 p-3 rounded-2xl">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-xs font-extrabold text-slate-200">100% CHÍNH HÃNG</span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-900/80 border border-white/10 p-3 rounded-2xl">
                <Award className="h-5 w-5 text-amber-400 shrink-0" />
                <span className="text-xs font-extrabold text-slate-200">BẢO HÀNH 36 THÁNG</span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-900/80 border border-white/10 p-3 rounded-2xl col-span-2 sm:col-span-1">
                <Zap className="h-5 w-5 text-cyan-400 shrink-0" />
                <span className="text-xs font-extrabold text-slate-200">GIÁ TỐT NHẤT THỊ TRƯỜNG</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BRAND FILTER CATEGORIES ─── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
              <span>DANH SÁCH THƯƠNG HIỆU HÀNG ĐẦU</span>
            </h2>
          </div>

          {/* SPONSOR BRAND CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBrands.map((brand) => (
              <motion.div
                key={brand.id}
                whileHover={{ y: -4 }}
                className={`rounded-3xl border ${brand.accentColor} bg-gradient-to-br ${brand.bgGradient} p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group`}
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-0.5">
                        {brand.category}
                      </span>
                      <h3 className="font-heading text-2xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                        {brand.name}
                      </h3>
                    </div>

                    <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase px-3 py-1 rounded-full shrink-0">
                      {brand.discountBadge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {brand.description}
                  </p>

                  {/* FEATURED PRODUCTS LIST */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Sản phẩm tiêu biểu của hãng:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {brand.featuredProducts.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 bg-slate-900/90 border border-white/10 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-200"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CARD FOOTER */}
                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between relative z-10">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{brand.warranty}</span>
                  </span>

                  <Link
                    href={`/products?search=${encodeURIComponent(brand.name)}`}
                    className="inline-flex items-center gap-1.5 bg-white text-slate-950 hover:bg-amber-400 font-heading font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md group-hover:scale-105"
                  >
                    <span>Xem Sản Phẩm</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
