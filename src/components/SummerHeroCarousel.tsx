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
    ctaLink: '/products?category=LAPTOP',
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
    ctaLink: '/checkout',
    rightVisualImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1600&q=85',
  },
  {
    id: 'banner-build-pc',
    tabTitle: 'KHUYẾN MÃI BUILD PC',
    tabSubtitle: 'CPU chỉ 0Đ, Ram giảm đến 57%++',
    tabIcon: Cpu,
    badgeTag: 'BUILD PC PREBUILT TỰ ĐỘNG',
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
    ctaText: 'BUILD PC TỰ ĐỘNG',
    ctaLink: '/pc-builder',
    rightVisualImage: 'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=1600&q=85',
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
    ctaLink: '/products?category=LAPTOP',
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
    }, 6500);
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
      className="w-full flex flex-col bg-[#070b14] overflow-hidden group border-b border-slate-800/80 relative select-none"
    >
      {/* ─── HERO BANNER MAIN SECTION ─── */}
      <div className="relative w-full min-h-[480px] lg:min-h-[520px] flex items-center overflow-hidden">
        
        {/* Right side REAL PHOTOGRAPHY with smooth cinematic blend */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id + '-bg'}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 bottom-0 right-0 w-full md:w-[68%] lg:w-[62%] h-full"
          >
            <img
              src={activeSlide.rightVisualImage}
              alt={activeSlide.mainTitleText}
              className="w-full h-full object-cover object-center md:object-right brightness-90 contrast-105"
            />
            
            {/* Multi-layer Gradient Mask to integrate into the dark room aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/90 to-transparent md:via-[#070b14]/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#070b14] to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Glow Aura */}
        <div 
          className="absolute -top-24 left-10 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: activeSlide.themeColor }}
        />

        {/* Content Container (aligned with standard max-w-7xl) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col justify-center">
          
          {/* Top Logo & Uiverse Glass Nav Controls */}
          <div className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center gap-3">
             <Link href="/" className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 transition-all group/logo shadow-inner">
               <img src="/logo/symbol-white.png" alt="DRX Hardware Logo" className="h-5 w-auto object-contain group-hover/logo:rotate-12 transition-transform duration-300" />
               <span className="font-heading text-xs font-black tracking-widest text-white uppercase">DRX HARDWARE</span>
             </Link>
          </div>

          {/* UIVERSE NEUMORPHIC PREV/NEXT CONTROLS */}
          <div className="absolute top-6 right-4 sm:right-6 lg:right-8 flex items-center gap-2">
            <button 
              onClick={handlePrev} 
              aria-label="Previous slide"
              className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white backdrop-blur-xl border border-white/10 hover:border-white/25 transition-all shadow-lg active:scale-95 cursor-pointer group/btn overflow-hidden"
            >
              <ChevronLeft className="w-4 h-4 group-hover/btn:-translate-x-0.5 transition-transform" />
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform" />
            </button>
            <button 
              onClick={handleNext} 
              aria-label="Next slide"
              className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white backdrop-blur-xl border border-white/10 hover:border-white/25 transition-all shadow-lg active:scale-95 cursor-pointer group/btn overflow-hidden"
            >
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform" />
            </button>
          </div>

          {/* Text Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id + '-content'}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="max-w-xl lg:max-w-2xl mt-12 sm:mt-14 space-y-4"
            >
              {/* UIVERSE GLOWING PILL BADGE */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/15 text-[11px] font-black text-white tracking-widest uppercase shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeSlide.themeColor }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: activeSlide.themeColor }} />
                </span>
                <span>{activeSlide.badgeTag}</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] uppercase tracking-tight drop-shadow-md">
                {activeSlide.mainTitleText}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-medium max-w-lg leading-relaxed">
                {activeSlide.highlightText}
              </p>
              
              {/* UIVERSE SHIMMER GLOW BUTTON */}
              <div className="pt-3 sm:pt-4">
                <Link
                  href={activeSlide.ctaLink}
                  className="relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-2xl font-heading font-black text-xs uppercase tracking-wider group/cta transition-all shadow-xl hover:shadow-sky-500/20 active:scale-98 cursor-pointer"
                >
                  {/* Rotating Gradient Border on Hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 group-hover/cta:opacity-100 transition-opacity" />
                  
                  {/* Button Inner Body */}
                  <span className="relative inline-flex items-center gap-2.5 px-6 py-3 rounded-[14px] bg-white text-slate-950 group-hover/cta:bg-slate-900 group-hover/cta:text-white transition-all duration-300">
                    <span>{activeSlide.ctaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* UIVERSE GLASSMORPHIC CARDS / VOUCHERS */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id + '-vouchers'}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mt-10 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl"
            >
              {activeSlide.vouchers.map((v, idx) => {
                const IconComp = v.icon || Sparkles;
                return (
                  <div 
                    key={idx} 
                    className="relative group/voucher p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-xl border border-white/10 hover:border-sky-400/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] overflow-hidden"
                  >
                    {/* Light streak sweep effect on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover/voucher:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform pointer-events-none" />

                    <div className="flex items-center gap-3 relative z-10">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover/voucher:border-sky-400/40 text-sky-400 group-hover/voucher:scale-110 transition-all">
                        <IconComp className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                          {v.title}
                        </div>
                        <div className="text-xs font-black text-slate-100 truncate group-hover/voucher:text-sky-300 transition-colors">
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

      {/* ─── BOTTOM 5-TAB UIVERSE GLASS NAVIGATION BAR ─── */}
      <div className="bg-[#040810]/95 backdrop-blur-2xl border-t border-slate-800/80 p-2 sm:p-3 relative z-30">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 max-w-7xl mx-auto">
          {HERO_BANNERS.map((banner, idx) => {
            const isActive = currentIndex === idx;
            const TabIcon = banner.tabIcon;
            return (
              <button
                key={banner.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative text-left p-3 rounded-2xl transition-all flex flex-col justify-between cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-slate-800/80 border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                    : 'bg-slate-950/40 hover:bg-slate-900/70 border-white/5 hover:border-white/15'
                } border`}
              >
                {/* Active progress beam at top of active tab */}
                {isActive && (
                  <motion.div 
                    layoutId="active-tab-glow"
                    className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 shadow-[0_0_8px_#38bdf8]"
                  />
                )}

                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-xl transition-colors ${
                    isActive ? 'bg-[#0284c7] text-white' : 'bg-slate-800/80 text-slate-400'
                  }`}>
                    <TabIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-tight truncate ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}>
                    {banner.tabTitle}
                  </span>
                </div>
                
                <span className="text-[11px] text-slate-500 line-clamp-1 mt-1.5 font-medium">
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