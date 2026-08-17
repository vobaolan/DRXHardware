'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Cpu, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
  const { addToCart } = useCart();
  const router = useRouter();
  const activePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) : 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let isLoggedIn = false;
    try {
      isLoggedIn = !!localStorage.getItem('ods_user');
    } catch (err) {}

    if (!isLoggedIn) {
      router.push('/profile');
      return;
    }

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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="uiverse-card overflow-hidden flex flex-col group relative h-full cursor-pointer"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
        {/* Product Media Box */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
          <img
            src={product.coverImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

          {hasDiscount && (
            <div className="absolute top-2.5 right-2.5 uiverse-badge-glow px-2.5 py-0.5 text-[10px] font-black tracking-wider rounded-full z-20">
              -{discountPercent}%
            </div>
          )}

          {product.brand && (
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-[#6EC2F7] border border-[#6EC2F7]/30 shadow-lg z-20">
              <Cpu className="h-3 w-3 text-[#6EC2F7]" />
              <span>{product.brand}</span>
            </div>
          )}

          <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/30 shadow-lg z-20 flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-emerald-400" />
            <span>{product.warrantyMonths || 24}T BH</span>
          </div>
        </div>

        {/* Product Information Body */}
        <div className="flex flex-col flex-1 p-4 pb-3.5 space-y-2.5 bg-white dark:bg-slate-900/90">
          <h3 className="font-heading text-sm font-extrabold leading-snug text-slate-900 dark:text-slate-100 group-hover:text-[#0284c7] dark:group-hover:text-[#6EC2F7] line-clamp-2 min-h-[40px] transition-colors">
            {product.name}
          </h3>

          {/* Specs Pills List */}
          <div className="flex flex-wrap gap-1.5 pt-1 font-mono-tech text-[10px]">
            {product.socket && (
              <span className="bg-sky-50 dark:bg-slate-950/90 border border-sky-200 dark:border-slate-800 text-[#0284c7] dark:text-[#6EC2F7] px-2 py-0.5 rounded font-bold">
                Socket {product.socket}
              </span>
            )}
            {product.ramType && (
              <span className="bg-emerald-50 dark:bg-slate-950/90 border border-emerald-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                {product.ramType}
              </span>
            )}
            {product.wattage && (
              <span className="bg-amber-50 dark:bg-slate-950/90 border border-amber-200 dark:border-slate-800 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-bold">
                {product.wattage}W
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[10px] text-slate-400 line-through font-mono-tech">
                  {formatCurrency(product.price)}
                </span>
              )}
              <span className="font-heading text-base font-black text-[#0284c7] dark:text-[#6EC2F7]">
                {formatCurrency(activePrice)}
              </span>
            </div>

            {product.status !== false ? (
              <button
                onClick={handleBuyNow}
                className="uiverse-btn-primary px-4 py-2 text-xs font-heading font-extrabold shadow-md z-30 relative"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>MUA</span>
              </button>
            ) : (
              <button
                disabled
                className="flex items-center gap-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-3.5 py-2 text-xs font-bold cursor-not-allowed z-30 relative"
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
