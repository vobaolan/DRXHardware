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
  themeColor: string;
  vouchers: Array<{
    title: string;
    value: string;
    icon: any;
  }>;
  dateRange: string;
  ctaText: string;
  ctaLink: string;
  rightVisualImage: string;
}

const HERO_BANNERS: TabBanner[] = [
  {
    id: 'banner-back-to-school',
    tabTitle: 'BACK TO SCHOOL',
    tabSubtitle: 'Đổi điểm nhận voucher đến 500.000đ!!',
    tabIcon: Sparkles,
    badgeTag: 'ĐỔI MỚI SANG TRANG 2026',
    mainTitleText: 'TƯƠNG LAI VỤT SÁNG',
    highlightText: 'SIÊU SALE TỰA TRƯỜNG • VOUCHER ĐẾN 500.000Đ',
    themeColor: '#0284c7',
    vouchers: [
      { title: 'ĐỔI ĐIỂM NHẬN', value: 'VOUCHER 500K', icon: Gift },
      { title: 'LAPTOP GAMING', value: 'GIẢM ĐẾN 2.5 TR', icon: Laptop },
      { title: 'HSSV & GIÁO VIÊN', value: 'GIẢM ĐẾN 300K', icon: Award },
      { title: 'RAM / SSD GEN4', value: 'GIẢM ĐẾN 1.4 TR', icon: Cpu },
    ],
    dateRange: 'Từ ngày 01/08 – 30/09/2026',
    ctaText: 'NHẬN VOUCHER NGAY',
    ctaLink: '/products?category=LAPTOP_GAMING',
    rightVisualImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&q=85',
  },
  {
    id: 'banner-tra-gop',
    tabTitle: 'TRẢ GÓP PC LAPTOP',
    tabSubtitle: 'Trả trước 0Đ, trợ giá đến 2 triệu!!!',
    tabIcon: CreditCard,
    badgeTag: 'HD SAISON 0% LÃI SUẤT',
    mainTitleText: 'SẮM PC CHỈ TỪ 0Đ TRẢ TRƯỚC',
    highlightText: 'DUYỆT HỒ SƠ 15 PHÚT ONLINE • LÃI SUẤT 0%',
    themeColor: '#10b981',
    vouchers: [
      { title: 'TRẢ TRƯỚC HÔM NAY', value: 'CHỈ 0 ĐỒNG', icon: Zap },
      { title: 'TRỢ GIÁ TRẢ GÓP', value: 'ĐẾN 2.0 TRIỆU', icon: Tag },
      { title: 'LÃI SUẤT ƯU ĐÃI', value: 'CHỈ TỪ 0% - 1.49%', icon: Percent },
      { title: 'THỜI HẠN LINH HOẠT', value: '6 - 24 THÁNG', icon: Clock },
    ],
    dateRange: 'Áp dụng toàn bộ hệ thống DRX Hardware',
    ctaText: 'TÍNH LÃI TRẢ GÓP',
    ctaLink: '/policies/guide',
    rightVisualImage: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=1600&q=85',
  },
  {
    id: 'banner-build-pc',
    tabTitle: 'KHUYẾN MÃI BUILD PC',
    tabSubtitle: 'CPU chỉ 0Đ, Ram giảm đến 57%++',
    tabIcon: Cpu,
    badgeTag: 'DRX BUILD TỰ ĐỘNG THÔNG MINH',
    mainTitleText: 'PC GAMING BỂ KÍNH ARGB',
    highlightText: 'TRỢ GIÁ CPU 0Đ • RAM DDR5 GIẢM ĐẾN 57%',
    themeColor: '#f59e0b',
    vouchers: [
      { title: 'COMBO CORE i5/i7', value: 'TẶNG VOUCHER 1TR', icon: Gift },
      { title: 'VGA RTX 4060 SUPER', value: 'GIẢM NGAY 1.5TR', icon: Zap },
      { title: 'MAINBOARD B760M', value: 'TẶNG TẢN ARGB', icon: Sparkles },
      { title: 'NÂNG CẤP DDR5', value: 'GIẢM ĐẾN 57%++', icon: Percent },
    ],
    dateRange: 'Bảo hành 1-đổi-1 36 tháng tận nơi',
    ctaText: 'TỰ PHỐI DRX BUILD',
    ctaLink: '/pc-builder',
    rightVisualImage: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1600&q=85',
  },
  {
    id: 'banner-man-hinh',
    tabTitle: 'MÀN HÌNH GAMING',
    tabSubtitle: 'Mua 1 tặng 1, trợ giá đến 1 triệu!!',
    tabIcon: Monitor,
    badgeTag: 'MÀN HÌNH GAMING 180HZ - 240HZ IPS',
    mainTitleText: 'CHIẾN GAME 2K 240Hz IPS',
    highlightText: 'MUA 1 MÀN HÌNH TẶNG 1 ARM TREO 590K',
    themeColor: '#38bdf8',
    vouchers: [
      { title: 'TẤM NỀN FAST-IPS', value: 'GIÁ CHỈ 2.990K', icon: Monitor },
      { title: 'QUÀ TẶNG KÈM', value: 'TẶNG ARM TREO 590K', icon: Gift },
      { title: 'BẢO HÀNH 03 NĂM', value: '1 ĐỔI 1 TẠI NHÀ', icon: ShieldCheck },
      { title: 'TRỢ GIÁ TRỰC TIẾP', value: 'ĐẾN 1.0 TRIỆU', icon: Tag },
    ],
    dateRange: 'Chính hãng ASUS / MSI / GIGABYTE / SAMSUNG',
    ctaText: 'SẮM MÀN HÌNH NGAY',
    ctaLink: '/products?category=MONITOR',
    rightVisualImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1600&q=85',
  },
  {
    id: 'banner-laptop',
    tabTitle: 'KHUYẾN MÃI LAPTOP',
    tabSubtitle: 'Trợ giá đến 2.5 triệu + Quà tặng!!',
    tabIcon: Laptop,
    badgeTag: 'LAPTOP GAMING MỎNG NHẸ',
    mainTitleText: 'LAPTOP ASUS TUF & MSI',
    highlightText: 'TRỰC TIẾP GIẢM ĐẾN 2.5 TRIỆU + BALO ROG',
    themeColor: '#a855f7',
    vouchers: [
      { title: 'QUÀ TẶNG BALO', value: 'TRỊ GIÁ 890K', icon: Gift },
      { title: 'CHUỘT GAMING', value: 'TẶNG KHÔNG DÂY', icon: Sparkles },
      { title: 'NÂNG CẤP RAM DDR5', value: 'GIẢM 50% GIÁ', icon: Percent },
      { title: 'VOUCHER TRỢ GIÁ', value: 'ĐẾN 2.5 TRIỆU', icon: Tag },
    ],
    dateRange: 'Áp dụng cho HSSV & Tân Sinh Viên 2026',
    ctaText: 'CHỌN LAPTOP GAMING',
    ctaLink: '/products?category=LAPTOP_GAMING',
    rightVisualImage: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1600&q=85',
  },
];

export const SummerHeroCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlide = HERO_BANNERS[currentIndex];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_BANNERS.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full flex flex-col bg-white dark:bg-[#090d16] rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-md dark:shadow-2xl relative select-none transition-colors duration-300"
    >
      {/* ─── HERO BANNER MAIN CONTENT AREA ─── */}
      <div className="relative w-full min-h-[460px] sm:min-h-[490px] lg:min-h-[510px] flex items-center overflow-hidden">
        
        {/* Right side REAL STUDIO PHOTOGRAPHY with smooth cinematic blend */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id + '-bg'}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 bottom-0 right-0 w-full md:w-[65%] lg:w-[60%] h-full pointer-events-none"
          >
            <img
              src={activeSlide.rightVisualImage}
              alt={activeSlide.mainTitleText}
              className="w-full h-full object-cover object-center md:object-right brightness-95 dark:brightness-90 contrast-105"
            />
            
            {/* Multi-layer Gradient Masks for seamless blend in Light & Dark Mode */}
            {/* Light Mode Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent md:via-white/40 dark:hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:hidden" />
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/70 to-transparent dark:hidden" />

            {/* Dark Mode Gradient Overlay */}
            <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-[#090d16] via-[#090d16]/90 to-transparent md:via-[#090d16]/40" />
            <div className="hidden dark:block absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent" />
            <div className="hidden dark:block absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#090d16]/80 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Color Glow */}
        <div 
          className="absolute -top-24 left-10 w-96 h-96 rounded-full blur-3xl opacity-15 dark:opacity-25 pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: activeSlide.themeColor }}
        />

        {/* Content Container */}
        <div className="relative z-10 w-full px-5 sm:px-8 lg:px-10 py-8 sm:py-10 flex flex-col justify-center">
          
          {/* Top Row: Brand Pill & Carousel Arrows */}
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Brand Logo Tag */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 backdrop-blur-md border border-slate-200/90 dark:border-white/10 transition-all group/logo shadow-2xs"
            >
              <img 
                src="/logo/symbol-white.png" 
                alt="DRX Hardware Logo" 
                className="h-4.5 w-auto object-contain dark:invert-0 invert group-hover/logo:rotate-12 transition-transform duration-300" 
              />
              <span className="font-heading text-xs font-black tracking-widest text-slate-900 dark:text-white uppercase">
                DRX HARDWARE
              </span>
            </Link>

            {/* Prev / Next Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrev} 
                aria-label="Previous slide"
                className="p-2 sm:p-2.5 rounded-xl bg-white/90 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white backdrop-blur-md border border-slate-200/90 dark:border-white/10 hover:border-[#0284c7]/40 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNext} 
                aria-label="Next slide"
                className="p-2 sm:p-2.5 rounded-xl bg-white/90 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white backdrop-blur-md border border-slate-200/90 dark:border-white/10 hover:border-[#0284c7]/40 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slide Text Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id + '-content'}
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 25 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="max-w-xl lg:max-w-2xl space-y-3.5"
            >
              {/* Campaign Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-slate-900/80 backdrop-blur-md border border-sky-200/80 dark:border-white/15 text-[11px] font-black text-[#0284c7] dark:text-sky-300 tracking-wider uppercase shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeSlide.themeColor }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: activeSlide.themeColor }} />
                </span>
                <span>• {activeSlide.badgeTag}</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.08] uppercase tracking-tight">
                {activeSlide.mainTitleText}
              </h1>

              {/* Sub-headline */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider leading-relaxed">
                {activeSlide.highlightText}
              </p>
              
              {/* CTA Action Button */}
              <div className="pt-2 sm:pt-3">
                <Link
                  href={activeSlide.ctaLink}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#0284c7] hover:bg-[#0369a1] dark:bg-white dark:hover:bg-sky-400 text-white dark:text-slate-950 dark:hover:text-slate-950 font-heading font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 active:scale-98 transition-all duration-300 group/cta cursor-pointer"
                >
                  <span>{activeSlide.ctaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 4 Value Highlight Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id + '-vouchers'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="mt-8 sm:mt-9 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 max-w-4xl"
            >
              {activeSlide.vouchers.map((v, idx) => {
                const IconComp = v.icon || Sparkles;
                return (
                  <div 
                    key={idx} 
                    className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-white/10 hover:border-sky-400 dark:hover:border-sky-400/50 transition-all duration-300 shadow-2xs hover:shadow-md overflow-hidden group/voucher"
                  >
                    <div className="flex items-center gap-2.5 relative z-10">
                      <div className="p-2 rounded-xl bg-sky-100 dark:bg-white/10 border border-sky-200/80 dark:border-white/10 text-[#0284c7] dark:text-sky-400 group-hover/voucher:scale-110 transition-transform">
                        <IconComp className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9.5px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider truncate">
                          {v.title}
                        </div>
                        <div className="text-[11.5px] font-heading font-black text-slate-900 dark:text-white truncate group-hover/voucher:text-[#0284c7] dark:group-hover/voucher:text-sky-300 transition-colors">
                          {v.value}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
          
        </div>
      </div>

      {/* ─── BOTTOM 5-TAB CAROUSEL NAVIGATION BAR ─── */}
      <div className="bg-slate-100/90 dark:bg-[#040810]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800/80 p-2 sm:p-2.5 relative z-30 transition-colors duration-300">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 max-w-7xl mx-auto">
          {HERO_BANNERS.map((banner, idx) => {
            const isActive = currentIndex === idx;
            const TabIcon = banner.tabIcon;
            return (
              <button
                key={banner.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative text-left p-3 rounded-2xl transition-all flex flex-col justify-between cursor-pointer overflow-hidden border ${
                  isActive
                    ? 'bg-white dark:bg-slate-800/90 border-[#0284c7] dark:border-sky-500/50 shadow-sm shadow-sky-500/10 dark:shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                    : 'bg-white/60 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900/70 border-slate-200/60 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                }`}
              >
                {/* Active progress beam */}
                {isActive && (
                  <motion.div 
                    layoutId="active-tab-glow"
                    className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-sky-400 via-[#0284c7] to-blue-600 shadow-[0_0_8px_#0284c7]"
                  />
                )}

                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-[#0284c7] text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    <TabIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[11.5px] font-heading font-black uppercase tracking-tight truncate ${
                    isActive 
                      ? 'text-slate-900 dark:text-white' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}>
                    {banner.tabTitle}
                  </span>
                </div>
                
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1.5 font-medium">
                  {banner.tabSubtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SummerHeroCarousel;