'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Percent, Check } from 'lucide-react';
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
        {/* Product Media Box - Clean & Seamless Presentation as in Image 3 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white dark:bg-slate-900 p-4 flex items-center justify-center group/media">
          {/* Top-Right: Discount Badge (Only if discounted) */}
          {hasDiscount && (
            <div className="absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-black tracking-tight shadow-md shadow-rose-500/20">
              <Percent className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>-{discountPercent}%</span>
            </div>
          )}

          {/* Main Hardware Image - Seamless Blend, No Contrasting White Square (mix-blend-multiply) */}
          <img
            src={product.coverImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-108 transition-transform duration-500 ease-out z-10"
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
