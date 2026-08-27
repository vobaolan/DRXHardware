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
      { title: 'ĐỔI ĐIỂM NHẬN', value: 'VOUCHER 500K', icon: Gift },
      { title: 'LAPTOP GAMING', value: 'GIẢM ĐẾN 2.5 TR', icon: Laptop },
      { title: 'HSSV & GIÁO VIÊN', value: 'GIẢM ĐẾN 300K', icon: Award },
      { title: 'RAM / SSD GEN4', value: 'GIẢM ĐẾN 1.4 TR', icon: Cpu },
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
      { title: 'TRẢ TRƯỚC HÔM NAY', value: 'CHỈ 0 ĐỒNG', icon: Zap },
      { title: 'TRỢ GIÁ TRẢ GÓP', value: 'ĐẾN 2.0 TRIỆU', icon: Tag },
      { title: 'LÃI SUẤT ƯU ĐÃI', value: 'CHỈ TỪ 0% - 1.49%', icon: Percent },
      { title: 'THỜI HẠN LINH HOẠT', value: '6 - 24 THÁNG', icon: Clock },
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
      { title: 'COMBO CORE i5', value: 'TẶNG VOUCHER 1TR', icon: Gift },
      { title: 'VGA RTX 4060 SUPER', value: 'GIẢM NGAY 1.5TR', icon: Zap },
      { title: 'MAINBOARD B760M', value: 'TẶNG TẢN ARGB', icon: Sparkles },
      { title: 'NÂNG CẤP DDR5', value: 'GIẢM ĐẾN 57%++', icon: Percent },
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
      { title: 'TẤM NỀN FAST-IPS', value: 'GIÁ CHỈ 2.990K', icon: Monitor },
      { title: 'QUÀ TẶNG KÈM', value: 'TẶNG ARM TREO 590K', icon: Gift },
      { title: 'BẢO HÀNH 03 NĂM', value: '1 ĐỔI 1 TẠI NHÀ', icon: ShieldCheck },
      { title: 'TRỢ GIÁ TRỰC TIẾP', value: 'ĐẾN 1.0 TRIỆU', icon: Tag },
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
      { title: 'QUÀ TẶNG BALO', value: 'TRỊ GIÁ 890K', icon: Gift },
      { title: 'CHUỘT GAMING', value: 'TẶNG KHÔNG DÂY', icon: Sparkles },
      { title: 'NÂNG CẤP RAM DDR5', value: 'GIẢM 50% GIÁ', icon: Percent },
      { title: 'VOUCHER TRỢ GIÁ', value: 'ĐẾN 2.5 TRIỆU', icon: Tag },
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
      className="w-full flex flex-col bg-[#050B14] overflow-hidden group border-b border-slate-800"
    >
      {/* ─── HERO BANNER SECTION ─── */}
      <div className="relative w-full min-h-[460px] lg:min-h-[500px] flex items-center">
        
        {/* Right side image with smooth gradient fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id + '-bg'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 bottom-0 right-0 w-full md:w-[65%] lg:w-[60%]"
          >
            <img
              src={activeSlide.rightVisualImage}
              alt={activeSlide.mainTitleText}
              className="w-full h-full object-cover object-center md:object-right opacity-80"
            />
            {/* Gradient to blend image into the solid dark background on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050B14] via-[#050B14]/80 to-transparent md:via-[#050B14]/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent md:hidden" />
          </motion.div>
        </AnimatePresence>

        {/* Content Container (aligned with standard site grid max-w-7xl) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center">
          
          {/* Top Logo & Controls */}
          <div className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center gap-4">
             <Link href="/">
               <img src="/logo/logo-blue.png" alt="DRX Hardware Logo" className="h-5 w-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
             </Link>
          </div>

          <div className="absolute top-6 right-4 sm:right-6 lg:right-8 flex gap-2">
            <button onClick={handlePrev} className="p-2 rounded-md bg-white/5 hover:bg-white/20 text-white transition-colors border border-white/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNext} className="p-2 rounded-md bg-white/5 hover:bg-white/20 text-white transition-colors border border-white/10">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Text Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id + '-content'}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="max-w-xl lg:max-w-2xl mt-12 space-y-4"
            >
              <div className="inline-block px-2.5 py-1 rounded bg-blue-600 text-[11px] font-bold text-white tracking-wider uppercase">
                {activeSlide.badgeTag}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15]">
                {activeSlide.mainTitleText}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-normal max-w-md">
                {activeSlide.highlightText}
              </p>
              
              <div className="pt-4">
                <Link
                  href={activeSlide.ctaLink}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 hover:bg-slate-200 font-bold rounded text-sm transition-colors"
                >
                  {activeSlide.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Clean Info Cards / Vouchers */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id + '-vouchers'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl"
            >
              {activeSlide.vouchers.map((v, idx) => {
                const IconComp = v.icon || Sparkles;
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded bg-[#0A1220] border border-[#1A2942] hover:border-blue-500/50 transition-colors">
                    <IconComp className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium uppercase tracking-wide">{v.title}</div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-100">{v.value}</div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
          
        </div>
      </div>

      {/* ─── BOTTOM 5-TAB NAVIGATION BAR ─── */}
      <div className="bg-[#030712] border-t border-[#1A2942] p-2 sm:p-3 relative z-30">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 max-w-7xl mx-auto">
          {TIN_HOC_NGOI_SAO_BANNERS.map((banner, idx) => {
            const isActive = currentIndex === idx;
            const TabIcon = banner.tabIcon;
            return (
              <button
                key={banner.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative text-left p-3 rounded-lg transition-all flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#111C31] shadow-sm'
                    : 'hover:bg-[#0A1220] border-transparent'
                } border ${isActive ? 'border-[#1E3A8A]' : 'border-transparent'}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <TabIcon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {banner.tabTitle}
                  </span>
                </div>
                
                <span className="text-[11px] text-slate-500 line-clamp-1 mt-2">
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