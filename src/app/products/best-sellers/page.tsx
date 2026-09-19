'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { Footer } from '@/components/Footer';
import { Search, SlidersHorizontal, Flame, ArrowLeft } from 'lucide-react';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';

const INITIAL_BEST_SELLER_PRODUCTS: ProductProps[] = INITIAL_PRODUCTS.map(p => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  price: p.price,
  discountPrice: p.discountPrice || null,
  coverImage: p.coverImage,
  category: [p.category],
  platform: p.brand,
  type: p.category,
  brand: p.brand,
  socket: p.socket,
  ramType: p.ramType,
  wattage: p.wattage,
  warrantyMonths: p.warrantyMonths,
  deliveryMethod: 'GIFT',
  status: (p.stockQuantity ?? 1) > 0,
  isFlashDeal: p.isFlashDeal || false,
  isFeaturedDeal: p.isFeatured || false,
  screenshots: p.screenshots || [p.coverImage]
}));

export default function BestSellersPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('FEATURED');

  const [liveProducts, setLiveProducts] = useState<ProductProps[]>(INITIAL_BEST_SELLER_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  // Load products from database
  useEffect(() => {
    fetch(`/api/products?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setLiveProducts(data.products);
        }
      })
      .catch((err) => console.error('Lỗi khi tải sản phẩm:', err));
  }, []);

  // Filter best sellers products
  const bestSellersProducts = useMemo(() => {
    let list = liveProducts.filter((p) => 
      p.isFeaturedDeal || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes('hot') || t.toLowerCase().includes('bán chạy')))
    );

    // If no specific tagged products, fallback to top products
    if (list.length === 0) {
      list = liveProducts.slice(0, 12);
    }

    // Filter by Platform
    if (selectedPlatform !== 'ALL') {
      list = list.filter((p) => p.platform === selectedPlatform);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => 
        p.name.toLowerCase().includes(q) ||
        (Array.isArray(p.category)
          ? p.category.some((c) => String(c).toLowerCase().includes(q))
          : typeof p.category === 'string'
          ? p.category.toLowerCase().includes(q)
          : false)
      );
    }

    // Sorting
    return [...list].sort((a, b) => {
      const aPrice = a.discountPrice ?? a.price;
      const bPrice = b.discountPrice ?? b.price;

      if (sortBy === 'PRICE_ASC') return aPrice - bPrice;
      if (sortBy === 'PRICE_DESC') return bPrice - aPrice;
      return 0;
    });
  }, [liveProducts, selectedPlatform, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      <Header />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* BREADCRUMB HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 gap-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#0284c7] dark:hover:text-sky-400 uppercase tracking-wider mb-2 transition-colors">
                <ArrowLeft className="h-4 w-4 text-[#0284c7]" /> Trang Chủ Cửa Hàng
              </Link>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2.5">
                <Flame className="h-7 w-7 text-amber-500 fill-amber-500" />
                <span>SẢN PHẨM MUA NHIỀU (HOT BEST SELLERS)</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">
                Top các linh kiện máy tính, màn hình và PC bán chạy nhất được đông đảo khách hàng tin tưởng lựa chọn tại DRX Hardware.
              </p>
            </div>

            <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3.5 py-1.5 rounded-full shrink-0 shadow-2xs">
              {bestSellersProducts.length} Sản Phẩm Hot
            </span>
          </div>

          {/* CONTROLS STRIP */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedPlatform('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                  selectedPlatform === 'ALL'
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#0284c7]'
                }`}
              >
                TẤT CẢ
              </button>
              <button
                onClick={() => setSelectedPlatform('HARDWARE')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                  selectedPlatform === 'HARDWARE'
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#0284c7]'
                }`}
              >
                LINH KIỆN PC
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm bán chạy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-[#0284c7] focus:outline-none cursor-pointer"
                >
                  <option value="FEATURED">Nổi Bật Nhất</option>
                  <option value="PRICE_ASC">Giá Thấp ➔ Cao</option>
                  <option value="PRICE_DESC">Giá Cao ➔ Thấp</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {isLoading ? (
            <div className="py-20 text-center text-xs font-semibold text-slate-400">
              Đang tải danh sách sản phẩm bán chạy...
            </div>
          ) : bestSellersProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-8">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Chưa có sản phẩm nào thuộc danh mục Mua Nhiều.</p>
              <Link
                href="/products"
                className="inline-block rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all mt-2 shadow-sm"
              >
                Khám Phá Tất Cả Sản Phẩm
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellersProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
  );
}
