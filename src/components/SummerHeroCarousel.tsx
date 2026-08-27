'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, ChevronRight, Gift, Tag, Clock, Sparkles, ArrowRight, 
  Zap, Cpu, Laptop, Monitor, CreditCard, ShieldCheck, Flame, Award, Percent
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
    icon: any;
    iconColor?: string;
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
      { title: 'ĐỔI ĐIỂM NHẬN', value: 'VOUCHER 500K', icon: Gift, iconColor: 'text-amber-400' },
      { title: 'LAPTOP GAMING', value: 'GIẢM ĐẾN 2.5 TR', icon: Laptop, iconColor: 'text-sky-400' },
      { title: 'HSSV & GIÁO VIÊN', value: 'GIẢM ĐẾN 300K', icon: Award, iconColor: 'text-emerald-400' },
      { title: 'RAM / SSD GEN4', value: 'GIẢM ĐẾN 1.4 TR', icon: Cpu, iconColor: 'text-purple-400' },
    ],
    specs: [
      { label: 'QUÀ TẶNG', value: 'Balo Gaming' },
      { label: 'TRỢ GIÁ', value: 'HSSV -300K' }
    ],
    dateRange: 'Từ ngày 01/08 – 30/09/2026',
    ctaText: 'NHẬN VOUCHER NGAY',
    ctaLink: '/products?category=LAPTOP',
    rightVisualImage: '/images/hero/laptop.jpg',
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
      { title: 'TRẢ TRƯỚC HÔM NAY', value: 'CHỈ 0 ĐỒNG', icon: Zap, iconColor: 'text-amber-400' },
      { title: 'TRỢ GIÁ TRẢ GÓP', value: 'ĐẾN 2.0 TRIỆU', icon: Tag, iconColor: 'text-sky-400' },
      { title: 'LÃI SUẤT ƯU ĐÃI', value: 'CHỈ TỪ 0% - 1.49%', icon: Percent, iconColor: 'text-emerald-400' },
      { title: 'THỜI HẠN LINH HOẠT', value: '6 - 24 THÁNG', icon: Clock, iconColor: 'text-purple-400' },
    ],
    specs: [
      { label: 'THỦ TỤC', value: 'CCCD Online' },
      { label: 'DUYỆT HỒ SƠ', value: '15 Phút' }
    ],
    dateRange: 'Áp dụng toàn bộ hệ thống DRX Hardware',
    ctaText: 'TÍNH LÃI TRẢ GÓP',
    ctaLink: '/checkout',
    rightVisualImage: '/images/hero/tra_gop.jpg',
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
      { title: 'COMBO CORE i5', value: 'TẶNG VOUCHER 1TR', icon: Gift, iconColor: 'text-amber-400' },
      { title: 'VGA RTX 4060 SUPER', value: 'GIẢM NGAY 1.5TR', icon: Zap, iconColor: 'text-sky-400' },
      { title: 'MAINBOARD B760M', value: 'TẶNG TẢN ARGB', icon: Sparkles, iconColor: 'text-emerald-400' },
      { title: 'NÂNG CẤP DDR5', value: 'GIẢM ĐẾN 57%++', icon: Percent, iconColor: 'text-rose-400' },
    ],
    specs: [
      { label: 'VGA', value: 'RTX 4090 24GB' },
      { label: 'TẢN NHIỆT', value: 'Custom Waterloop' }
    ],
    dateRange: 'Bảo hành 1-đổi-1 36 tháng tận nơi',
    ctaText: 'BUILD PC TỰ ĐỘNG',
    ctaLink: '/pc-builder',
    rightVisualImage: '/images/hero/build_pc.jpg',
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
      { title: 'TẤM NỀN FAST-IPS', value: 'GIÁ CHỈ 2.990K', icon: Monitor, iconColor: 'text-sky-400' },
      { title: 'QUÀ TẶNG KÈM', value: 'TẶNG ARM TREO 590K', icon: Gift, iconColor: 'text-amber-400' },
      { title: 'BẢO HÀNH 03 NĂM', value: '1 ĐỔI 1 TẠI NHÀ', icon: ShieldCheck, iconColor: 'text-emerald-400' },
      { title: 'TRỢ GIÁ TRỰC TIẾP', value: 'ĐẾN 1.0 TRIỆU', icon: Tag, iconColor: 'text-purple-400' },
    ],
    specs: [
      { label: 'TẦN SỐ QUÉT', value: '240Hz Gaming' },
      { label: 'ĐỘ PHÂN GIẢI', value: '2K QHD Curved' }
    ],
    dateRange: 'Chính hãng ASUS / MSI / GIGABYTE',
    ctaText: 'SẮM MÀN HÌNH NGAY',
    ctaLink: '/products?category=MONITOR',
    rightVisualImage: '/images/hero/monitor.jpg',
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
      { title: 'QUÀ TẶNG BALO', value: 'TRỊ GIÁ 890K', icon: Gift, iconColor: 'text-amber-400' },
      { title: 'CHUỘT GAMING', value: 'TẶNG KHÔNG DÂY', icon: Sparkles, iconColor: 'text-sky-400' },
      { title: 'NÂNG CẤP RAM DDR5', value: 'GIẢM 50% GIÁ', icon: Percent, iconColor: 'text-emerald-400' },
      { title: 'VOUCHER TRỢ GIÁ', value: 'ĐẾN 2.5 TRIỆU', icon: Tag, iconColor: 'text-rose-400' },
    ],
    specs: [
      { label: 'VGA', value: 'RTX 4060 / 4070' },
      { label: 'QUÀ TẶNG', value: 'Balo ROG 890K' }
    ],
    dateRange: 'Áp dụng cho HSSV & Tân Sinh Viên 2026',
    ctaText: 'CHỌN LAPTOP GAMING',
    ctaLink: '/products?category=LAPTOP',
    rightVisualImage: '/images/hero/laptop.jpg',
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
      className="w-full flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-950 transition-all duration-300"
    >
      {/* ─── 1. TOP HERO BANNER CANVAS ─── */}
      <div className="relative min-h-[440px] sm:min-h-[480px] lg:min-h-[480px] w-full overflow-hidden bg-slate-900 text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
        
        {/* Subtle Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-slate-900 pointer-events-none" />
        
        {/* TOP BRAND HEADER ROW & SLIDE CONTROLS */}
        <div className="relative z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* DRX HARDWARE LOGO BADGE */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 hover:bg-white/20 transition-all"
              title="Trang chủ DRX HARDWARE"
            >
              <img 
                src="/logo/logo-blue.png" 
                alt="DRX Hardware Logo" 
                className="h-5 w-auto object-contain brightness-0 invert" 
              />
            </Link>

            {/* EVENT TAG */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 text-xs font-semibold text-blue-300 border border-blue-500/30">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>{activeSlide.badgeTag}</span>
            </div>
          </div>

          {/* ARROW NAVIGATION CONTROLS */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Banner trước"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Banner tiếp"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* SLIDE CONTENT AREA */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id + '-slide'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative z-20 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-8"
          >
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* SLOGAN HEADLINE */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {activeSlide.mainTitleText}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-slate-300">
                  <span className="flex items-center gap-1.5 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span>{activeSlide.dateRange}</span>
                  </span>
                </div>
              </div>

              {/* 4 INFO CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeSlide.vouchers.map((v, idx) => {
                  const IconComp = v.icon || Sparkles;
                  return (
                    <div
                      key={idx}
                      className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-400">
                          {v.title}
                        </span>
                        <span className="text-base font-bold text-white mt-0.5">
                          {v.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTION CTA BUTTON */}
              <div className="pt-2">
                <Link
                  href={activeSlide.ctaLink}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all active:scale-95"
                >
                  <span>{activeSlide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: VISUAL IMAGE */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-lg aspect-4/3 rounded-2xl overflow-hidden shadow-2xl bg-slate-800">
                <img
                  src={activeSlide.rightVisualImage}
                  alt={activeSlide.mainTitleText}
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Highlight Pill */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
                  <span className="text-sm font-bold text-blue-300 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{activeSlide.highlightText}</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── 2. BOTTOM 5-TAB NAVIGATION BAR ─── */}
      <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 sm:p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 max-w-7xl mx-auto">
          {TIN_HOC_NGOI_SAO_BANNERS.map((banner, idx) => {
            const isActive = currentIndex === idx;
            const TabIcon = banner.tabIcon;
            return (
              <button
                key={banner.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative text-left p-3 rounded-xl transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900/50 shadow-sm'
                    : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border-transparent'
                } border`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <TabIcon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold truncate ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {banner.tabTitle}
                  </span>
                </div>
                
                <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-2">
                  {banner.tabSubtitle}
                </span>

                {/* ACTIVE INDICATOR BAR */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-b-xl"
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