'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Gift, Tag, Clock, Sparkles, ArrowRight, Zap, Cpu, Laptop, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TabBanner {
  id: string;
  tabTitle: string;
  tabSubtitle: string;
  badgeTag: string;
  mainTitleText: string;
  highlightText: string;
  vouchers: Array<{
    title: string;
    value: string;
    tag?: string;
  }>;
  dateRange: string;
  ctaText: string;
  ctaLink: string;
  rightVisualImage: string;
}

const TIN_HOC_NGOI_SAO_BANNERS: TabBanner[] = [
  {
    id: 'banner-back-to-school',
    tabTitle: 'BACK TO SCHOOL',
    tabSubtitle: 'Đổi điểm nhận voucher đến 500.000đ!!',
    badgeTag: 'ĐỔI MỚI SANG TRANG',
    mainTitleText: 'TƯƠNG LAI VỤT SÁNG',
    highlightText: 'SIÊU SALE TỰA TRƯỜNG 2026',
    vouchers: [
      { title: 'ĐỐI ĐIỂM NHẬN', value: 'VOUCHER 500K' },
      { title: 'LAPTOP GIẢM ĐẾN', value: '2.5 TR + 🎁 QUÀ' },
      { title: 'HSSV & GIÁO VIÊN', value: 'GIẢM ĐẾN 300K' },
      { title: 'RAM / SSD GIẢM ĐẾN', value: '1.4 TR' },
    ],
    dateRange: 'Từ ngày 01/08 – 30/09/2026',
    ctaText: 'NHẬN VOUCHER NGAY',
    ctaLink: '/products?category=LAPTOP',
    rightVisualImage: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'banner-tra-gop',
    tabTitle: 'TRẢ GÓP PC LAPTOP',
    tabSubtitle: 'Trả trước 0Đ, trợ giá đến 2 triệu!!!',
    badgeTag: 'HD SAISON 0% LÃI SUẤT',
    mainTitleText: 'SẮM PC CHỈ TỪ 0Đ TRẢ TRƯỚC',
    highlightText: 'DUYỆT HỒ SƠ 15 PHÚT ONLINE',
    vouchers: [
      { title: 'TRẢ TRƯỚC HÔM NAY', value: 'CHỈ 0 ĐỒNG' },
      { title: 'TRỢ GIÁ TRẢ GÓP', value: 'ĐẾN 2.0 TRIỆU' },
      { title: 'LÃI SUẤT ƯU ĐÃI', value: 'CHỈ TỪ 0% - 1.49%' },
      { title: 'THỜI HẠN LINH HOẠT', value: '6 - 24 THÁNG' },
    ],
    dateRange: 'Áp dụng toàn bộ hệ thống DRX Hardware',
    ctaText: 'TÍNH LÃI TRẢ GÓP',
    ctaLink: '/checkout',
    rightVisualImage: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'banner-build-pc',
    tabTitle: 'KHUYẾN MÃI BUILD PC',
    tabSubtitle: 'CPU chỉ 0Đ, Ram giảm đến 57%++',
    badgeTag: 'BUILD PC PREBUILT TỰ ĐỘNG',
    mainTitleText: 'PC GAMING VỚI BỂ KÍNH ARGB',
    highlightText: 'CPU 0Đ • RAM GIẢM ĐẾN 57%',
    vouchers: [
      { title: 'MUA COMBO CORE i5', value: 'TẶNG VOUCHER 1TR' },
      { title: 'VGA RTX 4060 SUPER', value: 'GIẢM NGAY 1.5TR' },
      { title: 'MAINBOARD B760M', value: 'TẶNG TẢN KHÍ ARGB' },
      { title: 'NÂNG CẤP DĐR5', value: 'GIẢM ĐẾN 57%++' },
    ],
    dateRange: 'Bảo hành 1-đổi-1 36 tháng tận nơi',
    ctaText: 'BUILD PC TỰ ĐỘNG',
    ctaLink: '/pc-builder',
    rightVisualImage: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'banner-man-hinh',
    tabTitle: 'MÀN HÌNH GAMING',
    tabSubtitle: 'Mua 1 tặng 1, trợ giá đến 1 triệu!!',
    badgeTag: 'MÀN HÌNH GAMING 180HZ IPS',
    mainTitleText: 'CHIẾN GAME SIÊU MƯỢT 2K 240Hz',
    highlightText: 'MUA 1 MÀN HÌNH TẶNG 1 ARM GIÁ TEO',
    vouchers: [
      { title: 'TẤM NỀN IPS 180Hz', value: 'GIÁ CHỈ 2.990K' },
      { title: 'TẶNG ARM MÀN HÌNH', value: 'TRỊ GIÁ 590K' },
      { title: 'BẢO HÀNH 03 NĂM', value: '1 ĐỔI 1 TẠI NHÀ' },
      { title: 'TRỢ GIÁ TRỰC TIẾP', value: 'ĐẾN 1.0 TRIỆU' },
    ],
    dateRange: 'Chính hãng ASUS / MSI / GIGABYTE',
    ctaText: 'SẮM MÀN HÌNH NGAY',
    ctaLink: '/products?category=MONITOR',
    rightVisualImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'banner-laptop',
    tabTitle: 'KHUYẾN MÃI LAPTOP',
    tabSubtitle: 'Trợ giá đến 2.5 triệu + Quà tặng!!',
    badgeTag: 'LAPTOP GAMING MỎNG NHẸ',
    mainTitleText: 'LAPTOP ASUS TUF & MSI KATANA',
    highlightText: 'TRỰC TIẾP GIẢM ĐẾN 2.5 TRIỆU',
    vouchers: [
      { title: 'TẶNG BALO GAMING', value: 'TRỊ GIÁ 890K' },
      { title: 'TẶNG CHUỘT KHÔNG DÂY', value: 'TRỊ GIÁ 350K' },
      { title: 'NÂNG CẤP RAM DDR5', value: 'GIẢM 50% GIÁ' },
      { title: 'VOUCHER TRỢ GIÁ', value: 'ĐẾN 2.5 TRIỆU' },
    ],
    dateRange: 'Áp dụng cho HSSV & Tân Sinh Viên 2026',
    ctaText: 'CHỌN LAPTOP GAMING',
    ctaLink: '/products?category=LAPTOP',
    rightVisualImage: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=900&auto=format&fit=crop&q=80',
  },
];

export const SummerHeroCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlide = TIN_HOC_NGOI_SAO_BANNERS[currentIndex];

  // Auto-advance slide every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TIN_HOC_NGOI_SAO_BANNERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TIN_HOC_NGOI_SAO_BANNERS.length) % TIN_HOC_NGOI_SAO_BANNERS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TIN_HOC_NGOI_SAO_BANNERS.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full flex flex-col rounded-3xl overflow-hidden border border-sky-300/40 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950 transition-all duration-300"
    >
      {/* ─── 1. TOP ULTRA-WIDE HERO BANNER CANVAS (SKYBLUE #6EC2F7 THEME) ─── */}
      <div className="relative min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] w-full overflow-hidden bg-gradient-to-r from-[#0284c7] via-[#6EC2F7] to-[#0369a1] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
        
        {/* Subtle Background Mesh & Dynamic Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-200/30 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        {/* TOP BRAND HEADER ROW & ARROWS */}
        <div className="relative z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* DRX HARDWARE LOGO BADGE */}
            <Link href="/" className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md hover:scale-105 transition-transform" title="Trang chủ DRX HARDWARE">
              <img src="/logo/logo-blue.png" alt="DRX Hardware Logo" className="h-6 w-auto object-contain" />
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase text-white tracking-wider border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              {activeSlide.badgeTag}
            </span>
          </div>

          {/* ARROW NAVIGATION CONTROLS */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Banner trước"
              className="p-2.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-sky-700 border border-white/40 transition-all cursor-pointer shadow-md backdrop-blur-md active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 stroke-[3]" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Banner tiếp"
              className="p-2.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-sky-700 border border-white/40 transition-all cursor-pointer shadow-md backdrop-blur-md active:scale-95"
            >
              <ChevronRight className="h-4 w-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* SLIDE CONTENT AREA (ANIMATED SLIDE DISPLAY) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id + '-slide'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center py-4"
          >
            {/* LEFT COLUMN: 3D TEXT SLOGAN & 4 GOLDEN COUPON CARDS GRID */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* SLOGAN HEADLINE */}
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-yellow-300 font-heading block mb-1 drop-shadow-md">
                  {activeSlide.badgeTag}
                </span>
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight drop-shadow-lg leading-tight">
                  {activeSlide.mainTitleText}
                </h1>
                <p className="text-xs font-bold text-sky-100 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{activeSlide.dateRange}</span>
                </p>
              </div>

              {/* 4 GOLDEN COUPON VOUCHERS GRID (REFERENCE IMAGE 2 STYLE) */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-xl">
                {activeSlide.vouchers.map((v, idx) => (
                  <div
                    key={idx}
                    className="relative bg-gradient-to-r from-[#fef08a] via-[#fde047] to-[#eab308] text-slate-900 p-2.5 sm:p-3 rounded-xl border-2 border-dashed border-amber-600/40 shadow-lg shadow-yellow-500/20 hover:scale-[1.02] transition-transform flex flex-col justify-between"
                  >
                    {/* Ticket notch left & right */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-sky-600 border-r border-amber-600/40" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-sky-600 border-l border-amber-600/40" />

                    <span className="text-[10px] font-extrabold uppercase text-slate-800 tracking-tight block">
                      {v.title}
                    </span>
                    <span className="text-sm sm:text-base font-black text-rose-600 font-heading tracking-wide uppercase drop-shadow-xs block mt-0.5">
                      {v.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* ACTION CTA BUTTON */}
              <div className="pt-1">
                <Link
                  href={activeSlide.ctaLink}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-yellow-300 text-sky-900 font-heading font-black text-xs uppercase tracking-wider shadow-xl shadow-sky-950/30 transition-all active:scale-95 cursor-pointer border border-white"
                >
                  <Zap className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span>{activeSlide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: 3D HARDWARE VISUAL SHOWCASE */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="relative w-full max-w-md aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/40 bg-white/10 backdrop-blur-md p-2 group/img"
              >
                <img
                  src={activeSlide.rightVisualImage}
                  alt={activeSlide.mainTitleText}
                  className="w-full h-full object-cover rounded-xl group-hover/img:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Highlight Pill */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-white/20 text-white text-center shadow-lg">
                  <span className="text-[10px] font-extrabold uppercase text-yellow-300 block tracking-wider">
                    ⚡ {activeSlide.highlightText}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── 2. BOTTOM 5-TAB NAVIGATION BAR (REFERENCE IMAGE 2 STYLE) ─── */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-w-7xl mx-auto">
          {TIN_HOC_NGOI_SAO_BANNERS.map((banner, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={banner.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative text-left p-2.5 rounded-xl transition-all cursor-pointer flex flex-col justify-center ${
                  isActive
                    ? 'bg-sky-50 dark:bg-slate-800 text-sky-900 dark:text-sky-200 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black uppercase tracking-tight font-heading ${isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {banner.tabTitle}
                  </span>
                </div>
                <span className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {banner.tabSubtitle}
                </span>

                {/* RED/SKYBLUE ACTIVE INDICATOR BAR AT BOTTOM */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-2 right-2 h-1 bg-rose-600 dark:bg-[#6EC2F7] rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SummerHeroCarousel;
