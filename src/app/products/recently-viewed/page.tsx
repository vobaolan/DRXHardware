'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { Footer } from '@/components/Footer';
import { Search, SlidersHorizontal, Clock, ArrowLeft, Trash2 } from 'lucide-react';

const HARDWARE_CATEGORIES = [
  { id: 'ALL', label: 'TẤT CẢ' },
  { id: 'CPU', label: 'CPU / VI XỬ LÝ' },
  { id: 'VGA', label: 'VGA / CARD ĐỒ HỌA' },
  { id: 'MAINBOARD', label: 'BO MẠCH CHỦ' },
  { id: 'RAM', label: 'BỘ NHỚ RAM' },
  { id: 'STORAGE', label: 'SSD / HDD' },
  { id: 'PSU', label: 'NGUỒN PSU' },
  { id: 'CASE', label: 'VỎ CASE' },
  { id: 'COOLING', label: 'TẢN NHIỆT' },
  { id: 'MONITOR', label: 'MÀN HÌNH' },
  { id: 'GEAR', label: 'GAMING GEAR' },
  { id: 'LAPTOP', label: 'LAPTOP' },
  { id: 'PREBUILT_PC', label: 'PC ĐỒNG BỘ' },
];

export default function RecentlyViewedPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('FEATURED');

  const [liveProducts, setLiveProducts] = useState<ProductProps[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load products from database & localStorage
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setLiveProducts(data.products);
        }
      })
      .catch((err) => console.error('Lỗi khi tải sản phẩm:', err))
      .finally(() => setIsLoading(false));

    try {
      const stored = localStorage.getItem('ods_recently_viewed');
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      setRecentlyViewed([]);
    }
  }, []);

  // Match valid recently viewed products against live database products
  const validRecentlyViewed = useMemo(() => {
    const matched: ProductProps[] = [];
    recentlyViewed.forEach((rv) => {
      const found = liveProducts.find((p) => p.id === rv.id || p.slug === rv.slug);
      if (found && !matched.some((m) => m.id === found.id)) {
        matched.push(found);
      }
    });
    return matched;
  }, [recentlyViewed, liveProducts]);

  // Filter products based on controls
  const filteredProducts = useMemo(() => {
    let list = validRecentlyViewed;

    // Filter by Category
    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => {
        const catStr = Array.isArray(p.category) ? p.category.join(' ') : String(p.category || p.type || '');
        const normCat = catStr.toUpperCase();
        if (selectedCategory === 'LAPTOP') {
          return normCat.includes('LAPTOP');
        }
        if (selectedCategory === 'GEAR') {
          return normCat.includes('GEAR') || normCat.includes('KEYBOARD') || normCat.includes('HEADSET') || normCat.includes('MOUSE');
        }
        return normCat.includes(selectedCategory);
      });
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
  }, [validRecentlyViewed, selectedCategory, searchQuery, sortBy]);

  const handleClearHistory = () => {
    localStorage.removeItem('ods_recently_viewed');
    setRecentlyViewed([]);
  };

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
                <Clock className="h-7 w-7 text-[#0284c7]" />
                <span>SẢN PHẨM BẠN VỪA XEM GẦN ĐÂY</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-1">
                Lịch sử lưu trữ các sản phẩm linh kiện PC &amp; thiết bị bạn đã xem chi tiết trên DRX Hardware.
              </p>
            </div>

            {validRecentlyViewed.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold uppercase transition-all shrink-0 cursor-pointer shadow-2xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa Lịch Sử Đã Xem</span>
              </button>
            )}
          </div>

          {/* CONTROLS STRIP */}
          <div className="flex flex-col gap-4 mb-8 bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
            {/* Search and Sort Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm đã xem..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-[#0284c7] focus:outline-none cursor-pointer"
                >
                  <option value="FEATURED">Mới Nhất</option>
                  <option value="PRICE_ASC">Giá Thấp ➔ Cao</option>
                  <option value="PRICE_DESC">Giá Cao ➔ Thấp</option>
                </select>
              </div>
            </div>

            {/* Categorized Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {HARDWARE_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#0284c7] text-white shadow-sm ring-2 ring-[#0284c7]/30 scale-[1.02]'
                        : 'bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:border-[#0284c7] hover:text-[#0284c7]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {isLoading ? (
            <div className="py-20 text-center text-xs font-semibold text-slate-400">
              Đang tải lịch sử xem...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-8">
              <Clock className="h-10 w-10 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">Bạn chưa mở xem chi tiết sản phẩm nào gần đây.</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Truy cập cửa hàng để khám phá các linh kiện phần cứng mới nhất!</p>
              <Link
                href="/products"
                className="inline-block rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all mt-2"
              >
                Khám Phá Cửa Hàng Ngay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
  );
}
