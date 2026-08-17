'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Monitor, Laptop, Cpu, ChevronLeft, ChevronRight, Zap, Gift, Tag, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BannerSlide {
  id: string;
  categoryTag: string;
  mainTitle: string;
  subtitle: string;
  brandName: string;
  heroOffer: string;
  heroOfferLabel: string;
  subOffers: Array<{ label: string; highlight: string }>;
  dateRange: string;
  ctaText: string;
  ctaLink: string;
  bgImage: string;
  badgeIcon: React.ElementType;
  themeColor: 'fire' | 'emerald' | 'amber';
}

const SUMMER_BANNERS: BannerSlide[] = [
  {
    id: 'banner-build-pc',
    categoryTag: 'CHƯƠNG TRÌNH KHUYẾN MÃI MÙA HÈ 2026',
    mainTitle: 'BUILD PC',
    subtitle: 'KHUYẾN ĐỘNG HÈ',
    brandName: 'ODSSTORE.COM',
    heroOffer: 'CPU 0đ',
    heroOfferLabel: 'ƯU ĐÃI NỔI BẬT NHẤT',
    subOffers: [
      { label: 'RAM GIẢM ĐẾN', highlight: '57%++' },
      { label: 'VGA GIẢM ĐẾN', highlight: '990K' },
    ],
    dateRange: 'Áp dụng từ 01 – 31/08/2026',
    ctaText: 'BUILD PC NGAY',
    ctaLink: '/pc-builder',
    bgImage: '/banners/banner-build-pc.jpg',
    badgeIcon: Cpu,
    themeColor: 'fire',
  },
  {
    id: 'banner-monitor',
    categoryTag: 'MÀN HÌNH CHÍNH HÃNG BẢO HÀNH 36T',
    mainTitle: 'MÀN HÌNH',
    subtitle: 'GAMING / VĂN PHÒNG',
    brandName: 'ODSSTORE.COM',
    heroOffer: 'MUA LÀ CÓ QUÀ',
    heroOfferLabel: 'ĐẶC QUYỀN MÙA HÈ',
    subOffers: [
      { label: 'QUÀ TẶNG KÈM', highlight: 'MUA 1 TẶNG 1' },
      { label: 'GIÁ SỐC MÙA HÈ', highlight: 'GIẢM ĐẾN 1 TR' },
    ],
    dateRange: 'Áp dụng từ 01 – 31/08/2026',
    ctaText: 'SẮM MÀN HÌNH NGAY',
    ctaLink: '/products?category=MONITOR',
    bgImage: '/banners/banner-monitor.jpg',
    badgeIcon: Monitor,
    themeColor: 'amber',
  },
  {
    id: 'banner-laptop',
    categoryTag: 'LAPTOP MỎNG NHẸ & CHÂN THẬT GAMING',
    mainTitle: 'LAPTOP',
    subtitle: 'GAMING / VĂN PHÒNG',
    brandName: 'ODSSTORE.COM',
    heroOffer: 'RẺ NHẤT THỊ TRƯỜNG',
    heroOfferLabel: 'CAM KẾT GIÁ TỐT NHẤT',
    subOffers: [
      { label: 'TRỰC TIẾP GIẢM', highlight: 'ĐẾN 1.7 TR' },
      { label: 'NÂNG CẤP RAM/SSD', highlight: 'GIẢM 1.2 TR' },
    ],
    dateRange: 'Áp dụng từ 01 – 31/08/2026',
    ctaText: 'CHỌN LAPTOP NGAY',
    ctaLink: '/products?category=LAPTOP',
    bgImage: '/banners/banner-laptop.jpg',
    badgeIcon: Laptop,
    themeColor: 'emerald',
  },
];

export const SummerHeroCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlide = SUMMER_BANNERS[currentIndex];

  // Auto-advance slide every 6 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SUMMER_BANNERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SUMMER_BANNERS.length) % SUMMER_BANNERS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SUMMER_BANNERS.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group relative w-full overflow-hidden rounded-3xl border border-amber-500/30 bg-[#090b10] text-white shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(245,158,11,0.15)] transition-all duration-500 hover:border-amber-400/60"
    >
      {/* ─── 1. BACKGROUND ARTWORK WITH ANIMATED CROSSFADE ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id + '-bg'}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        >
          <img
            src={activeSlide.bgImage}
            alt={activeSlide.mainTitle}
            className="h-full w-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 brightness-110 contrast-110"
          />
        </motion.div>
      </AnimatePresence>

      {/* Layered Fiery Summer Ambience Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#090b10] via-[#090b10]/85 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-[#090b10]/60 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-transparent z-10 pointer-events-none" />

      {/* ─── 2. BANNER CONTAINER ─── */}
      <div className="relative z-20 flex flex-col justify-between p-6 sm:p-10 min-h-[460px] md:min-h-[520px]">
        {/* TOP BAR: BRAND MARK, PROMO TAG & ARROWS */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* ODSSTORE.COM BRAND BADGE */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-rose-500/20 backdrop-blur-md px-4 py-1.5 shadow-lg">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </span>
              <span className="text-xs font-black tracking-widest text-amber-300 uppercase font-heading">
                {activeSlide.brandName}
              </span>
            </div>

            {/* PROGRAMME TAG */}
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/80 backdrop-blur-md px-3.5 py-1 text-[11px] font-extrabold uppercase text-slate-300 tracking-wider">
              <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400 animate-bounce" />
              {activeSlide.categoryTag}
            </span>
          </div>

          {/* ARROW CONTROLS */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Banner trước"
              className="p-2 rounded-full border border-white/20 bg-black/60 text-white/80 hover:text-white hover:bg-amber-500 hover:border-amber-400 transition-all cursor-pointer shadow-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Banner tiếp"
              className="p-2 rounded-full border border-white/20 bg-black/60 text-white/80 hover:text-white hover:bg-amber-500 hover:border-amber-400 transition-all cursor-pointer shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* MAIN BODY: TITLES & HUGE HERO OFFER BADGES */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id + '-content'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 pb-2"
          >
            {/* Left Column: Titles & Sub offers */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-extrabold uppercase tracking-widest text-amber-400 font-heading">
                    {activeSlide.subtitle}
                  </span>
                </div>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-xl leading-none">
                  {activeSlide.mainTitle}
                </h1>
              </div>

              {/* Sub offers pills */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {activeSlide.subOffers.map((offer, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/80 backdrop-blur-md px-4 py-2 shadow-lg"
                  >
                    <Tag className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-300">{offer.label}</span>
                    <span className="text-sm font-black text-amber-300 font-heading tracking-wide">
                      {offer.highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: GIANT HERO OFFER BADGE (CENTRAL EYE-CATCHER) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -1 }}
                className="relative group/heroBox p-1 rounded-3xl bg-gradient-to-br from-amber-400 via-rose-500 to-amber-600 shadow-[0_0_50px_rgba(245,158,11,0.5)] w-full max-w-sm"
              >
                <div className="rounded-[22px] bg-slate-950/95 backdrop-blur-xl p-6 text-center space-y-2 border border-white/20">
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                    🔥 {activeSlide.heroOfferLabel}
                  </span>

                  <div className="py-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight font-heading bg-gradient-to-r from-amber-300 via-yellow-200 to-rose-400 bg-clip-text text-transparent drop-shadow-lg block uppercase">
                      {activeSlide.heroOffer}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 font-medium">
                    Áp dụng toàn bộ khách hàng trên website & cửa hàng
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* FOOTER: DATE RANGE, CTA & TAB NAVIGATOR */}
        <footer className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>{activeSlide.dateRange}</span>
          </div>

          {/* TAB SELECTOR BUTTONS */}
          <div className="flex items-center gap-2">
            {SUMMER_BANNERS.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => setCurrentIndex(index)}
                className={`font-heading rounded-xl px-4 py-2 text-xs font-extrabold uppercase transition-all duration-300 cursor-pointer ${
                  currentIndex === index
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/30 border border-amber-300 scale-105'
                    : 'bg-slate-900/80 text-slate-400 border border-white/10 hover:text-white hover:border-amber-400/50'
                }`}
              >
                0{index + 1}. {banner.mainTitle}
              </button>
            ))}
          </div>

          {/* CTA ACTION BUTTON */}
          <Link
            href={activeSlide.ctaLink}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 px-6 py-3 text-sm font-black text-white uppercase tracking-wider shadow-lg shadow-amber-500/30 hover:scale-105 hover:shadow-amber-500/60 active:scale-95 transition-all duration-300 border border-amber-300/40"
          >
            <Zap className="h-4 w-4 fill-white" />
            <span>{activeSlide.ctaText}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </footer>
      </div>
    </div>
  );
};
