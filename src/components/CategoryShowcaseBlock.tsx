'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, ArrowRight, ChevronLeft, ChevronRight, Zap, 
  Flame, Shield, Cpu, Sparkles, Check, Percent, Eye 
} from 'lucide-react';
import { HardwareProduct } from '@/lib/hardware-data';
import { formatCurrency, calculateDiscountPercent } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export interface SubTab {
  id: string;
  label: string;
  viewAllLink?: string;
  filterFn?: (product: HardwareProduct) => boolean;
}

export interface CategoryShowcaseBlockProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  bannerImage: string;
  theme: 'cyan' | 'amber' | 'emerald' | 'rose' | 'purple' | 'blue';
  subTabs: SubTab[];
  products: HardwareProduct[];
  viewAllLink: string;
}

export default function CategoryShowcaseBlock({
  title,
  subtitle,
  badgeText = "HÀNG BÁN CHẠY",
  bannerImage,
  theme,
  subTabs,
  products,
  viewAllLink
}: CategoryShowcaseBlockProps) {
  const [activeSubTab, setActiveSubTab] = useState(subTabs[0]?.id || 'ALL');
  const { addToCart } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Theme color maps for light & dark mode styling
  const themeStyles = {
    cyan: {
      bgBanner: 'from-cyan-500/10 via-cyan-500/5 to-blue-500/10 dark:from-cyan-950/40 dark:to-slate-900',
      bannerBorder: 'border-cyan-500/30',
      activeTab: 'bg-[#0284c7] text-white shadow-md shadow-cyan-500/20',
      titleText: 'text-[#0284c7] dark:text-[#38bdf8]',
      btnBg: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white',
      accentBorder: 'hover:border-cyan-500 hover:shadow-cyan-500/15',
      badgeBg: 'bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/20 dark:bg-cyan-500/20 dark:text-cyan-300',
      subTabActiveText: 'text-[#0284c7] border-[#0284c7]',
      glow: 'from-cyan-500/25 via-sky-400/15 to-transparent',
      brandDot: 'bg-cyan-500',
    },
    amber: {
      bgBanner: 'from-amber-500/10 via-amber-500/5 to-orange-500/10 dark:from-amber-950/40 dark:to-slate-900',
      bannerBorder: 'border-amber-500/30',
      activeTab: 'bg-amber-500 text-white shadow-md shadow-amber-500/20',
      titleText: 'text-amber-600 dark:text-amber-400',
      btnBg: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white',
      accentBorder: 'hover:border-amber-500 hover:shadow-amber-500/15',
      badgeBg: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300',
      subTabActiveText: 'text-amber-600 border-amber-500',
      glow: 'from-amber-500/25 via-orange-400/15 to-transparent',
      brandDot: 'bg-amber-500',
    },
    emerald: {
      bgBanner: 'from-emerald-500/10 via-emerald-500/5 to-teal-500/10 dark:from-emerald-950/40 dark:to-slate-900',
      bannerBorder: 'border-emerald-500/30',
      activeTab: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20',
      titleText: 'text-emerald-600 dark:text-emerald-400',
      btnBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white',
      accentBorder: 'hover:border-emerald-500 hover:shadow-emerald-500/15',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300',
      subTabActiveText: 'text-emerald-600 border-emerald-500',
      glow: 'from-emerald-500/25 via-teal-400/15 to-transparent',
      brandDot: 'bg-emerald-500',
    },
    rose: {
      bgBanner: 'from-rose-500/10 via-rose-500/5 to-red-500/10 dark:from-rose-950/40 dark:to-slate-900',
      bannerBorder: 'border-rose-500/30',
      activeTab: 'bg-rose-600 text-white shadow-md shadow-rose-500/20',
      titleText: 'text-rose-600 dark:text-rose-400',
      btnBg: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white',
      accentBorder: 'hover:border-rose-500 hover:shadow-rose-500/15',
      badgeBg: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300',
      subTabActiveText: 'text-rose-600 border-rose-500',
      glow: 'from-rose-500/25 via-red-400/15 to-transparent',
      brandDot: 'bg-rose-500',
    },
    purple: {
      bgBanner: 'from-purple-500/10 via-purple-500/5 to-indigo-500/10 dark:from-purple-950/40 dark:to-slate-900',
      bannerBorder: 'border-purple-500/30',
      activeTab: 'bg-purple-600 text-white shadow-md shadow-purple-500/20',
      titleText: 'text-purple-600 dark:text-purple-400',
      btnBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white',
      accentBorder: 'hover:border-purple-500 hover:shadow-purple-500/15',
      badgeBg: 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-300',
      subTabActiveText: 'text-purple-600 border-purple-500',
      glow: 'from-purple-500/25 via-indigo-400/15 to-transparent',
      brandDot: 'bg-purple-500',
    },
    blue: {
      bgBanner: 'from-blue-500/10 via-blue-500/5 to-cyan-500/10 dark:from-blue-950/40 dark:to-slate-900',
      bannerBorder: 'border-blue-500/30',
      activeTab: 'bg-blue-600 text-white shadow-md shadow-blue-500/20',
      titleText: 'text-blue-600 dark:text-blue-400',
      btnBg: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white',
      accentBorder: 'hover:border-blue-500 hover:shadow-blue-500/15',
      badgeBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300',
      subTabActiveText: 'text-blue-600 border-blue-500',
      glow: 'from-blue-500/25 via-cyan-400/15 to-transparent',
      brandDot: 'bg-blue-500',
    }
  }[theme];

  // Filter products by active sub tab
  const currentTab = subTabs.find(t => t.id === activeSubTab);
  const filteredProducts = currentTab?.filterFn 
    ? products.filter(currentTab.filterFn)
    : products;

  // Scroll controls
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleBuyNow = (product: HardwareProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      coverImage: product.coverImage,
      platform: product.category,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section className="w-full my-8 antialiased">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm dark:shadow-2xl overflow-hidden">
        
        {/* TOP SUB-TAB NAVIGATION BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 px-4 sm:px-6 py-2.5 gap-3">
          {/* Sub-tabs List */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {subTabs.map((tab) => {
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`font-heading text-xs font-bold uppercase px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? themeStyles.activeTab
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* View All Link - Dynamically updates destination based on active tab */}
          <Link
            href={currentTab?.viewAllLink || viewAllLink}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0284c7] dark:hover:text-[#38bdf8] transition-colors shrink-0 group px-2 py-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* SHOWCASE BODY: LEFT BANNER + RIGHT PRODUCT CAROUSEL */}
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* 1. LEFT FEATURED BANNER POSTER (Uncropped Full Native Ratio) */}
          <div className="lg:col-span-3 flex items-center justify-center">
            <Link
              href={currentTab?.viewAllLink || viewAllLink}
              className={`w-full h-full rounded-2xl border ${themeStyles.bannerBorder} overflow-hidden group relative flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer p-0`}
            >
              <img
                src={bannerImage}
                alt={title}
                className="w-full h-full object-contain rounded-2xl group-hover:scale-[1.02] transition-transform duration-500 ease-out select-none"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              {/* Subtle glow / sheen overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            </Link>
          </div>

          {/* 2. RIGHT PRODUCTS SLIDER / GRID (Col 12 -> Col 9) */}
          <div className="lg:col-span-9 relative flex flex-col justify-between">
            
            {/* Navigation Arrows Controls */}
            <div className="hidden sm:flex items-center justify-end gap-1.5 mb-2">
              <button
                onClick={scrollLeft}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#0284c7] hover:text-white transition-all shadow-xs cursor-pointer"
                title="Sản phẩm trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={scrollRight}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#0284c7] hover:text-white transition-all shadow-xs cursor-pointer"
                title="Sản phẩm tiếp"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Products Row */}
            <div
              ref={scrollContainerRef}
              className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-1 pt-1 select-none"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {filteredProducts.length === 0 ? (
                <div className="w-full py-16 text-center text-xs text-slate-400">
                  Đang cập nhật sản phẩm thuộc mục này...
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const hasDiscount = !!(product.discountPrice && product.discountPrice < product.price);
                  const activePrice = product.discountPrice ?? product.price;
                  const discountPercent = hasDiscount ? calculateDiscountPercent(product.price, product.discountPrice!) : 0;
                  const isJustAdded = addedId === product.id;

                  return (
                    <div
                      key={product.id}
                      className={`min-w-[215px] sm:min-w-[235px] max-w-[235px] rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs hover:shadow-xl ${themeStyles.accentBorder} transition-all duration-300 flex flex-col justify-between group relative shrink-0`}
                    >
                      <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
                        {/* Image Box - Pure White & Crisp Sharp Rendering */}
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50/70 dark:bg-slate-800/40 p-3 mb-2.5 flex items-center justify-center group-hover:bg-slate-100/70 dark:group-hover:bg-slate-800/60 transition-colors">
                          {/* Top-Right: Discount Badge */}
                          {hasDiscount && (
                            <div className="absolute top-2 right-2 z-20 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-rose-500 text-white text-[9.5px] font-black tracking-tight shadow-sm shadow-rose-500/20">
                              <Percent className="w-2.5 h-2.5 stroke-[2.5]" />
                              <span>-{discountPercent}%</span>
                            </div>
                          )}

                          {/* Top-Left: Brand Tag */}
                          {product.brand && (
                            <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 text-[9px] font-black uppercase tracking-wider border border-slate-200/80 dark:border-slate-700 shadow-2xs backdrop-blur-xs">
                              {product.brand}
                            </span>
                          )}

                          {/* Main Hardware Image - Sharp & High-DPI optimized */}
                          <img
                            src={product.coverImage}
                            alt={product.name}
                            loading="lazy"
                            decoding="async"
                            className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out select-none"
                            style={{ 
                              imageRendering: '-webkit-optimize-contrast',
                              WebkitBackfaceVisibility: 'hidden',
                              transform: 'translateZ(0)'
                            }}
                          />
                        </div>

                        {/* Title & Info */}
                        <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                          <h4 
                            title={product.name}
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              height: '36px',
                              lineHeight: '18px',
                            }}
                            className="font-heading font-bold text-[12.5px] text-slate-900 dark:text-slate-100 group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8] transition-colors"
                          >
                            {product.name}
                          </h4>

                          {/* Specs Pills Row */}
                          <div className="flex flex-wrap gap-1 text-[9px] font-mono-tech">
                            {product.socket && (
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-semibold">
                                {product.socket}
                              </span>
                            )}
                            {product.ramType && (
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-semibold">
                                {product.ramType}
                              </span>
                            )}
                            {product.specs?.["Tốc độ"] && (
                              <span className="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
                                {product.specs["Tốc độ"]}
                              </span>
                            )}
                          </div>

                          {/* Price Tag */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            {hasDiscount ? (
                              <>
                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                  <span className="text-[10.5px] text-slate-400 line-through font-mono-tech">
                                    {formatCurrency(product.price)}
                                  </span>
                                  <span className="text-[10px] font-bold text-rose-500">
                                    Tiết kiệm {formatCurrency(product.price - activePrice)}
                                  </span>
                                </div>
                                <span className="font-heading font-black text-[16px] text-rose-600 dark:text-rose-400 block tracking-tight">
                                  {formatCurrency(activePrice)}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                                  Giá bán
                                </span>
                                <span className="font-heading font-black text-[16px] text-slate-900 dark:text-white block tracking-tight">
                                  {formatCurrency(activePrice)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Action Buttons Row: Cart Icon + MUA NGAY */}
                      <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart({
                              id: product.id,
                              productId: product.id,
                              name: product.name,
                              slug: product.slug,
                              price: product.price,
                              discountPrice: product.discountPrice,
                              coverImage: product.coverImage,
                              platform: product.category,
                            });
                            setAddedId(product.id);
                            setTimeout(() => setAddedId(null), 1500);
                          }}
                          className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-2xs cursor-pointer shrink-0"
                          title="Thêm vào giỏ hàng"
                        >
                          {isJustAdded ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                        </button>

                        <button
                          onClick={(e) => handleBuyNow(product, e)}
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-heading font-black transition-all active:scale-95 shadow-sm shadow-rose-500/25 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white cursor-pointer`}
                        >
                          <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                          <span>MUA NGAY</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
