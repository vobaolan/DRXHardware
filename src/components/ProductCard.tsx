'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingCart, Percent, Eye, ShieldCheck, Check, Sparkles, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

export interface ProductProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  coverImage: string;
  category: string[];
  platform: string;
  type: string;
  brand?: string;
  socket?: string;
  ramType?: string;
  wattage?: number;
  warrantyMonths?: number;
  deliveryMethod?: string;
  status?: boolean;
  isFlashDeal?: boolean;
  flashSaleEnd?: string | null;
  isFeaturedDeal?: boolean;
  tags?: string[];
}

export const ProductCard: React.FC<{ product: ProductProps }> = ({ product }) => {
  const { addToCart, setCartOpen } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const activePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) : 0;

  // Extract clean hardware brand name
  const brandLabel = useMemo(() => {
    if (product.brand && product.brand !== 'DRX' && product.brand !== 'OTHER' && product.brand !== 'GENERIC') {
      return product.brand;
    }
    const n = product.name || '';
    const knownBrands = [
      'Kingbank', 'Asus', 'ROG', 'TUF', 'MSI', 'Gigabyte', 'Aorus', 'Corsair',
      'Intel', 'AMD', 'Ryzen', 'Samsung', 'Kingston', 'TeamGroup', 'G.Skill',
      'AOC', 'ViewSonic', 'Dell', 'Acer', 'Predator', 'Lenovo', 'Legion',
      'HP', 'Omen', 'Thermalright', 'Deepcool', 'NZXT', 'Cooler Master',
      'Lian Li', 'Antec', 'Xigmatek', 'Mik', 'DareU', 'Akko', 'Keychron',
      'Logitech', 'Razer', 'SteelSeries', 'HyperX', 'Zotac', 'Palit', 'Colorful',
      'Crucial', 'Western Digital', 'WD', 'Seagate', 'MacBook', 'Apple'
    ];
    const found = knownBrands.find(b => new RegExp(`\\b${b}\\b`, 'i').test(n));
    return found ? found.toUpperCase() : (product.brand || 'CHÍNH HÃNG');
  }, [product.brand, product.name]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  const handleBuyNow = (e: React.MouseEvent) => {
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
      platform: product.platform,
    });
    setCartOpen(true);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="uiverse-card-cyber flex flex-col group relative h-full cursor-pointer rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-2xl hover:border-[#0284c7]/50 dark:hover:border-[#0284c7]/60 transition-all duration-300 overflow-hidden"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
        {/* Product Media Box - High-Tech Hardware Studio Showroom */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-100/90 dark:from-slate-950 dark:via-[#0c1424] dark:to-slate-950 p-3 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80 group/media">
          {/* 1. Subtle Ambient Radial Glow behind hardware */}
          <div className="absolute inset-0 m-auto w-3/4 h-3/4 rounded-full bg-gradient-to-tr from-[#0284c7]/15 via-[#38bdf8]/10 to-transparent blur-2xl pointer-events-none group-hover:scale-125 group-hover:from-[#0284c7]/25 transition-all duration-700 opacity-70 dark:opacity-85" />

          {/* 2. Hardware Pedestal Drop-Shadow */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-3/5 h-2 bg-slate-900/10 dark:bg-black/40 rounded-full blur-sm pointer-events-none group-hover:w-4/5 group-hover:scale-110 transition-all duration-500" />

          {/* 3. Cyber Glass Light Sweep Shimmer on Hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/40 dark:via-sky-400/15 to-transparent pointer-events-none skew-x-12 z-20" />

          {/* 4. Top-Left: Brand Chip */}
          <div className="absolute top-2.5 left-2.5 z-20 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 text-[9.5px] font-black tracking-wider text-slate-800 dark:text-slate-200 shadow-xs uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
            <span>{brandLabel}</span>
          </div>

          {/* 5. Top-Right: Discount Badge or Warranty Tag */}
          {hasDiscount ? (
            <div className="absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white text-[10px] font-black tracking-tight shadow-md shadow-rose-500/25">
              <Percent className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>-{discountPercent}%</span>
            </div>
          ) : (
            <div className="absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 dark:bg-slate-800/80 backdrop-blur-md text-[9px] font-extrabold text-sky-400 dark:text-sky-300 border border-sky-500/30 shadow-xs">
              <ShieldCheck className="w-3 h-3 text-sky-400" />
              <span>BH {product.warrantyMonths || 36}T</span>
            </div>
          )}

          {/* 6. Bottom-Left: Stock Status Pill */}
          <div className="absolute bottom-2.5 left-2.5 z-20 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[9px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-800 shadow-2xs">
            <span className={`w-1.5 h-1.5 rounded-full ${product.status !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{product.status !== false ? 'Sẵn hàng' : 'Hết hàng'}</span>
          </div>

          {/* 7. Bottom-Right: Quick Preview Eye button appearing on hover */}
          <div className="absolute bottom-2.5 right-2.5 z-20 p-1.5 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
            <Eye className="w-3.5 h-3.5 text-[#0284c7]" />
          </div>

          {/* 8. Main Hardware Image with Physical Drop-Shadow & 3D Lift Scale */}
          <img
            src={product.coverImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-2.5 z-10 relative filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_10px_20px_rgba(2,132,199,0.28)] group-hover:scale-110 group-hover:-translate-y-1.5 transition-all duration-500 ease-out"
          />
        </div>

        {/* Product Information Body */}
        <div className="flex flex-col flex-1 p-4 pb-3.5 space-y-2.5">
          <h3 
            title={product.name}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '44px',
              lineHeight: '22px',
            }}
            className="font-heading text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8] transition-colors"
          >
            {product.name}
          </h3>

          {/* Specs Pills List */}
          <div className="flex flex-wrap gap-1.5 pt-0.5 font-mono text-[10px]">
            {product.socket && (
              <span className="bg-sky-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 text-[#0284c7] dark:text-[#38bdf8] px-2 py-0.5 rounded-md font-bold">
                Socket {product.socket}
              </span>
            )}
            {product.ramType && (
              <span className="bg-emerald-50 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                {product.ramType}
              </span>
            )}
            {product.wattage && (
              <span className="bg-amber-50 dark:bg-slate-950 border border-amber-200 dark:border-slate-800 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-bold">
                {product.wattage}W
              </span>
            )}
          </div>

          {/* Price & Action Row */}
          <div className="flex items-end justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto gap-2">
            <div className="flex flex-col justify-end min-w-0">
              {hasDiscount ? (
                <>
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="text-[11px] text-slate-400 line-through font-mono">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[10px] font-black tracking-tight">
                      <Percent className="w-2.5 h-2.5 stroke-[2.5]" />
                      <span>-{discountPercent}%</span>
                    </span>
                  </div>
                  <span className="font-heading text-base font-black text-[#0284c7] dark:text-[#38bdf8] truncate">
                    {formatCurrency(activePrice)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                    Giá niêm yết
                  </span>
                  <span className="font-heading text-base font-black text-slate-900 dark:text-white truncate">
                    {formatCurrency(activePrice)}
                  </span>
                </>
              )}
            </div>

            {product.status !== false ? (
              <button
                onClick={handleBuyNow}
                className={`px-3.5 py-2 text-xs font-heading font-extrabold rounded-xl shadow-md z-30 relative cursor-pointer flex items-center gap-1.5 shrink-0 transition-all active:scale-95 ${
                  isAdded 
                    ? 'bg-emerald-600 text-white shadow-emerald-500/30' 
                    : 'uiverse-btn-shimmer'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>ĐÃ THÊM</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>MUA</span>
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="flex items-center gap-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-3 py-2 text-xs font-bold cursor-not-allowed z-30 relative shrink-0"
              >
                <span>HẾT HÀNG</span>
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
