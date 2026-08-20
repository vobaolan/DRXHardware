'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, Gift, Tag, Clock, Sparkles, ArrowRight, 
  Zap, Cpu, Laptop, Monitor, CreditCard, ShieldCheck, Flame, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TabBanner {
  id: string;
  tabTitle: string;
  tabSubtitle: string;
  tabIcon: any;
  badgeTag: string;
  mainTitleText: string;
  highlightText: string;
  vouchers: Array<{
    title: string;
    value: string;
    tag?: string;
  }>;
  specs?: Array<{ label: string; value: string }>;
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
    tabIcon: Sparkles,
    badgeTag: 'ĐỔI MỚI SANG TRANG 2026',
    mainTitleText: 'TƯƠNG LAI VỤT SÁNG',
    highlightText: 'SIÊU SALE TỰA TRƯỜNG • VOUCHER 500K',
    vouchers: [
      { title: 'ĐỔI ĐIỂM NHẬN', value: 'VOUCHER 500K' },
      { title: 'LAPTOP GIẢM ĐẾN', value: '2.5 TR + 🎁 QUÀ' },
      { title: 'HSSV & GIÁO VIÊN', value: 'GIẢM ĐẾN 300K' },
      { title: 'RAM / SSD GIẢM ĐẾN', value: '1.4 TR' },
    ],
    specs: [
      { label: 'QUÀ TẶNG', value: 'Balo Gaming' },
      { label: 'TRỢ GIÁ', value: 'HSSV -300K' }
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
    tabIcon: CreditCard,
    badgeTag: 'HD SAISON 0% LÃI SUẤT',
    mainTitleText: 'SẮM PC CHỈ TỪ 0Đ TRẢ TRƯỚC',
    highlightText: 'DUYỆT HỒ SƠ 15 PHÚT ONLINE',
    vouchers: [
      { title: 'TRẢ TRƯỚC HÔM NAY', value: 'CHỈ 0 ĐỒNG' },
      { title: 'TRỢ GIÁ TRẢ GÓP', value: 'ĐẾN 2.0 TRIỆU' },
      { title: 'LÃI SUẤT ƯU ĐÃI', value: 'CHỈ TỪ 0% - 1.49%' },
      { title: 'THỜI HẠN LINH HOẠT', value: '6 - 24 THÁNG' },
    ],
    specs: [
      { label: 'THỦ TỤC', value: 'CCCD Online' },
      { label: 'DUYỆT HỒ SƠ', value: '15 Phút' }
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
    tabIcon: Cpu,
    badgeTag: 'BUILD PC PREBUILT TỰ ĐỘNG',
    mainTitleText: 'PC GAMING BỂ KÍNH ARGB',
    highlightText: 'CPU 0Đ • RAM GIẢM ĐẾN 57%',
    vouchers: [
      { title: 'MUA COMBO CORE i5', value: 'TẶNG VOUCHER 1TR' },
      { title: 'VGA RTX 4060 SUPER', value: 'GIẢM NGAY 1.5TR' },
      { title: 'MAINBOARD B760M', value: 'TẶNG TẢN KHÍ ARGB' },
      { title: 'NÂNG CẤP DDR5', value: 'GIẢM ĐẾN 57%++' },
    ],
    specs: [
      { label: 'VGA', value: 'RTX 4060 8GB' },
      { label: 'CPU', value: 'Core i5 13400F' }
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
    tabIcon: Monitor,
    badgeTag: 'MÀN HÌNH GAMING 180HZ IPS',
    mainTitleText: 'CHIẾN GAME 2K 240Hz IPS',
    highlightText: 'MUA 1 MÀN HÌNH TẶNG 1 ARM TREO',
    vouchers: [
      { title: 'TẤM NỀN IPS 180Hz', value: 'GIÁ CHỈ 2.990K' },
      { title: 'TẶNG ARM MÀN HÌNH', value: 'TRỊ GIÁ 590K' },
      { title: 'BẢO HÀNH 03 NĂM', value: '1 ĐỔI 1 TẠI NHÀ' },
      { title: 'TRỢ GIÁ TRỰC TIẾP', value: 'ĐẾN 1.0 TRIỆU' },
    ],
    specs: [
      { label: 'TẦN SỐ QUÉT', value: '180Hz - 240Hz' },
      { label: 'ĐỘ PHÂN GIẢI', value: '2K QHD Fast-IPS' }
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
    tabIcon: Laptop,
    badgeTag: 'LAPTOP GAMING MỎNG NHẸ',
    mainTitleText: 'LAPTOP ASUS TUF & MSI',
    highlightText: 'TRỰC TIẾP GIẢM ĐẾN 2.5 TRIỆU',
    vouchers: [
      { title: 'TẶNG BALO GAMING', value: 'TRỊ GIÁ 890K' },
      { title: 'TẶNG CHUỘT KHÔNG DÂY', value: 'TRỊ GIÁ 350K' },
      { title: 'NÂNG CẤP RAM DDR5', value: 'GIẢM 50% GIÁ' },
      { title: 'VOUCHER TRỢ GIÁ', value: 'ĐẾN 2.5 TRIỆU' },
    ],
    specs: [
      { label: 'VGA', value: 'RTX 4050 / 4060' },
      { label: 'QUÀ TẶNG', value: 'Combo 1.2 Triệu' }
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

  // Auto-advance slide every 6.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TIN_HOC_NGOI_SAO_BANNERS.length);
    }, 6500);
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
      className="w-full flex flex-col rounded-3xl overflow-hidden border border-sky-400/30 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-950 transition-all duration-300"
    >
      {/* ─── 1. TOP ULTRA-WIDE HERO BANNER CANVAS (CYBER SKYBLUE SHOWROOM THEME) ─── */}
      <div className="relative min-h-[420px] sm:min-h-[460px] lg:min-h-[500px] w-full overflow-hidden bg-gradient-to-br from-[#0369a1] via-[#0284c7] to-[#0ea5e9] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
        
        {/* Dynamic Background Matrix Grid & Cyber Ambient Glow */}
        <div className="absolute inset-0 tech-grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-300/30 via-transparent to-black/40 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#6EC2F7]/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -right-24 -bottom-24 w-[32rem] h-[32rem] bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* TOP BRAND HEADER ROW & SLIDE CONTROLS */}
        <div className="relative z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* DRX HARDWARE LOGO BADGE (HIGH CONTRAST CYBER GLASS) */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2.5 bg-slate-950/90 backdrop-blur-xl px-4 py-1.5 rounded-full border border-sky-400/40 shadow-lg shadow-sky-950/40 hover:border-sky-300 hover:scale-105 transition-all group" 
              title="Trang chủ DRX HARDWARE"
            >
              <img 
                src="/logo/logo-blue.png" 
                alt="DRX Hardware Logo" 
                className="h-6 w-auto object-contain drop-shadow-[0_0_8px_rgba(110,194,247,0.6)]" 
              />
            </Link>

            {/* EVENT TAG */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-black uppercase text-amber-300 tracking-wider border border-amber-400/40 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
              <span>{activeSlide.badgeTag}</span>
            </div>
          </div>

          {/* ARROW NAVIGATION CONTROLS */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Banner trước"
              className="p-2.5 rounded-full bg-slate-950/70 hover:bg-[#6EC2F7] text-white hover:text-slate-950 border border-white/30 hover:border-[#6EC2F7] transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 stroke-[3]" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Banner tiếp"
              className="p-2.5 rounded-full bg-slate-950/70 hover:bg-[#6EC2F7] text-white hover:text-slate-950 border border-white/30 hover:border-[#6EC2F7] transition-all cursor-pointer shadow-lg backdrop-blur-md active:scale-95"
            >
              <ChevronRight className="h-4 w-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* SLIDE CONTENT AREA (ANIMATED SLIDE DISPLAY) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id + '-slide'}
            initial={{ opacity: 0, x: 25, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -25, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center py-4"
          >
            {/* LEFT COLUMN: 3D HEADLINE, WARRANTY & 4 GOLDEN VIP TICKETS */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              
              {/* SLOGAN HEADLINE */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 font-heading bg-amber-950/60 border border-amber-400/40 px-2.5 py-0.5 rounded-full drop-shadow-md inline-flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span>{activeSlide.badgeTag}</span>
                  </span>
                </div>
                
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] leading-tight">
                  {activeSlide.mainTitleText}
                </h1>

                <div className="flex flex-wrap items-center gap-2.5 mt-2">
                  <span className="text-xs font-bold text-emerald-300 bg-slate-950/70 border border-emerald-400/40 px-3 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeSlide.dateRange}</span>
                  </span>
                </div>
              </div>

              {/* 4 3D GOLDEN VIP COUPON VOUCHERS GRID */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-xl">
                {activeSlide.vouchers.map((v, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="relative bg-gradient-to-br from-[#fffbeb] via-[#fef08a] to-[#eab308] text-slate-950 p-2.5 sm:p-3 rounded-2xl border-2 border-amber-300 shadow-[0_8px_20px_rgba(234,179,8,0.25)] hover:shadow-[0_12px_28px_rgba(234,179,8,0.45)] transition-all flex flex-col justify-between overflow-hidden group cursor-pointer"
                  >
                    {/* Shimmer Light Ray Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                    {/* Left & Right Ticket Notches */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#0284c7] border-r-2 border-amber-400" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#0284c7] border-l-2 border-amber-400" />

                    <div className="px-1.5">
                      <span className="text-[10px] font-extrabold uppercase text-amber-950 tracking-wider font-heading block">
                        {v.title}
                      </span>
                      <span className="text-sm sm:text-base font-black text-rose-600 font-heading tracking-wide uppercase drop-shadow-xs block mt-0.5">
                        {v.value}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ACTION CTA BUTTON (UIVERSE SHIMMER PILL) */}
              <div className="pt-2">
                <Link
                  href={activeSlide.ctaLink}
                  className="uiverse-btn-shimmer inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-white font-heading font-black text-xs uppercase tracking-wider shadow-xl shadow-sky-950/40 hover:shadow-2xl transition-all active:scale-95 cursor-pointer border border-white/40"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
                  <span>{activeSlide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: 3D HARDWARE VISUAL SHOWCASE WITH FLOATING BADGES */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative w-full max-w-md aspect-4/3 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(110,194,247,0.3)] border-2 border-sky-300/40 bg-slate-950/80 backdrop-blur-xl p-2.5 group/img"
              >
                {/* Visual Image */}
                <div className="w-full h-full rounded-2xl overflow-hidden relative">
                  <img
                    src={activeSlide.rightVisualImage}
                    alt={activeSlide.mainTitleText}
                    className="w-full h-full object-cover group-hover/img:scale-108 transition-transform duration-700 brightness-95 group-hover/img:brightness-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                </div>
                
                {/* Floating Live Spec Badges */}
                {activeSlide.specs && activeSlide.specs.length > 0 && (
                  <div className="absolute top-5 right-5 flex flex-col gap-1.5 z-20">
                    {activeSlide.specs.map((sp, i) => (
                      <div key={i} className="bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-sky-400/40 text-[10px] font-black uppercase text-[#6EC2F7] shadow-lg flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-[#6EC2F7]" />
                        <span>{sp.label}: {sp.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Floating Highlight Pill */}
                <div className="absolute bottom-5 left-5 right-5 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-sky-400/30 text-white text-center shadow-2xl">
                  <span className="text-[11px] font-black uppercase text-amber-300 block tracking-wider flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>{activeSlide.highlightText}</span>
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── 2. BOTTOM 5-TAB NAVIGATION BAR (CYBER LIGHT/DARK SYNC) ─── */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 max-w-7xl mx-auto">
          {TIN_HOC_NGOI_SAO_BANNERS.map((banner, idx) => {
            const isActive = currentIndex === idx;
            const TabIcon = banner.tabIcon;
            return (
              <button
                key={banner.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative text-left p-3 rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-sky-50/90 dark:bg-slate-800 border border-sky-300/60 dark:border-sky-500/40 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <TabIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-tight font-heading truncate ${isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {banner.tabTitle}
                  </span>
                </div>
                
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                  {banner.tabSubtitle}
                </span>

                {/* RED / SKYBLUE ACTIVE INDICATOR BAR AT BOTTOM */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-3 right-3 h-1 bg-rose-600 dark:bg-[#6EC2F7] rounded-full shadow-sm"
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
