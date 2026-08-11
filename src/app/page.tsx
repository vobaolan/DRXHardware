'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { FeaturedDealCard } from '@/components/FeaturedDealCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { CartProvider, useCart } from '@/context/CartContext';
import { Search, SlidersHorizontal, Flame, Award, Clock, ShoppingCart, Percent, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('FEATURED');
  const [liveProducts, setLiveProducts] = useState<ProductProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  const DEFAULT_HOME_PRODUCTS: ProductProps[] = useMemo(() => [], []);

  // Fetch live products from database API & local admin cache
  useEffect(() => {
    setIsLoading(true);
    let localProds: ProductProps[] = [];
    let deletedKeys: string[] = [];

    try {
      const storedDeleted = localStorage.getItem('ods_deleted_product_ids');
      if (storedDeleted) deletedKeys = JSON.parse(storedDeleted);
    } catch (e) {}

    const isDeletedOrObsolete = (p: any) => {
      if (!p) return true;
      const pid = String(p.id || '').toLowerCase();
      const pslug = String(p.slug || '').toLowerCase();
      const pname = String(p.name || p.title || '').toLowerCase();

      // Purge old stale mock leftovers (Netflix, Rust, Stardew, Wukong) so Cốc Cốc, Chrome, and all browsers are 100% synced
      if (
        pname.includes('netflix') ||
        pslug.includes('netflix') ||
        pname.includes('rust') ||
        pslug.includes('rust') ||
        pname.includes('stardew') ||
        pslug.includes('stardew') ||
        pname.includes('wukong') ||
        pslug.includes('wukong')
      ) {
        return true;
      }

      return deletedKeys.some((dk) => {
        const k = String(dk).toLowerCase();
        return (
          pid === k ||
          pslug === k ||
          pname === k ||
          (pslug.length > 3 && k.includes(pslug)) ||
          (k.length > 3 && pslug.includes(k))
        );
      });
    };

    try {
      const stored = localStorage.getItem('ods_admin_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localProds = parsed.filter((p) => !isDeletedOrObsolete(p));
        }
      }
    } catch (e) {}

    fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const apiProds = data.products && Array.isArray(data.products) ? data.products.filter((p: any) => !isDeletedOrObsolete(p)) : [];
        const combined = [...DEFAULT_HOME_PRODUCTS];

        localProds.forEach((lp: any) => {
          const idx = combined.findIndex((p) => p.id === lp.id || p.slug === lp.slug || p.name === lp.name);
          if (idx >= 0) {
            combined[idx] = { ...combined[idx], ...lp };
          } else {
            combined.push(lp);
          }
        });

        apiProds.forEach((ap: any) => {
          const idx = combined.findIndex((p) => p.id === ap.id || p.slug === ap.slug || p.name === ap.name);
          if (idx >= 0) {
            combined[idx] = { ...combined[idx], ...ap };
          } else {
            combined.push(ap);
          }
        });

        const finalLive = combined.filter((p) => !isDeletedOrObsolete(p));
        setLiveProducts(finalLive);
        try {
          localStorage.setItem('ods_admin_products', JSON.stringify(finalLive));
        } catch (e) {}
      })
      .catch((err) => {
        console.error('Lỗi khi tải sản phẩm thực tế:', err);
        const combined = [...DEFAULT_HOME_PRODUCTS];
        localProds.forEach((lp: any) => {
          const idx = combined.findIndex((p) => p.id === lp.id || p.slug === lp.slug || p.name === lp.name);
          if (idx >= 0) {
            combined[idx] = { ...combined[idx], ...lp };
          } else {
            combined.push(lp);
          }
        });
        const finalLive = combined.filter((p) => !isDeletedOrObsolete(p));
        setLiveProducts(finalLive);
        try {
          localStorage.setItem('ods_admin_products', JSON.stringify(finalLive));
        } catch (e) {}
      })
      .finally(() => setIsLoading(false));
  }, [DEFAULT_HOME_PRODUCTS]);

  const allProducts = liveProducts;

  // Filter Featured Weekly Deals (Products flagged with isFeaturedDeal, prioritized Resident Evil Requiem #1)
  const featuredDeals = useMemo(() => {
    const sorted = [...allProducts].sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      if (aName.includes('resident evil')) return -1;
      if (bName.includes('resident evil')) return 1;
      if (aName.includes('dying light')) return -1;
      if (bName.includes('dying light')) return 1;
      return 0;
    });

    const flagged = sorted.filter((p) => p.isFeaturedDeal);
    if (flagged.length > 0) return flagged;
    return sorted.slice(0, 3);
  }, [allProducts]);

  // Active Featured Item for Hero Slider
  const activeFeatured = featuredDeals[currentFeaturedIndex] || featuredDeals[0];

  // Auto-play hero slider every 3 seconds (3000ms) without manual navigation buttons per user request
  useEffect(() => {
    if (featuredDeals.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % featuredDeals.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [featuredDeals.length]);

  // Fixed Synchronized Best Sellers List (#1 Resident Evil Requiem, #2 Dying Light: The Beast, #3 Palworld, #4 Wukong)
  const bestSellersProducts = useMemo(() => {
    const sorted = [...allProducts].sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();

      const getPriority = (name: string) => {
        if (name.includes('resident evil')) return 1;
        if (name.includes('dying light')) return 2;
        if (name.includes('palworld')) return 3;
        if (name.includes('wukong') || name.includes('black myth')) return 4;
        if (name.includes('cyberpunk')) return 5;
        return 99;
      };

      return getPriority(aName) - getPriority(bName);
    });

    return sorted.slice(0, 4);
  }, [allProducts]);

  // Filter Flash Deals Products
  const flashDealsProducts = useMemo(() => {
    const flagged = allProducts.filter((p) => p.isFlashDeal);
    if (flagged.length > 0) return flagged.slice(0, 3);
    return allProducts.filter((p) => p.discountPrice !== null && p.discountPrice! < p.price).slice(0, 3);
  }, [allProducts]);

  // Dynamic Countdown Timer calculation based on nearest flashSaleEnd date
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const targetProductWithEnd = flashDealsProducts.find((p) => p.flashSaleEnd);
    
    const updateTimer = () => {
      let targetTime: number;
      if (targetProductWithEnd && targetProductWithEnd.flashSaleEnd) {
        targetTime = new Date(targetProductWithEnd.flashSaleEnd).getTime();
      } else {
        const tonight = new Date();
        tonight.setHours(23, 59, 59, 999);
        targetTime = tonight.getTime();
      }

      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [flashDealsProducts]);

  // Filter products based on controls
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(q) ||
        (Array.isArray(product.category)
          ? product.category.some((c) => String(c).toLowerCase().includes(q))
          : typeof product.category === 'string'
          ? product.category.toLowerCase().includes(q)
          : false);
      
      const matchesPlatform = selectedPlatform === 'ALL' || product.platform === selectedPlatform || product.category === selectedPlatform;
      const matchesType = selectedType === 'ALL' || product.type === selectedType;

      return matchesSearch && matchesPlatform && matchesType;
    }).sort((a, b) => {
      const aPrice = a.discountPrice ?? a.price;
      const bPrice = b.discountPrice ?? b.price;

      if (sortBy === 'PRICE_ASC') return aPrice - bPrice;
      if (sortBy === 'PRICE_DESC') return bPrice - aPrice;
      return 0;
    });
  }, [allProducts, searchQuery, selectedPlatform, selectedType, sortBy]);

  // Live search autocomplete list
  const autocompleteList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [allProducts, searchQuery]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased tech-grid-pattern transition-colors duration-300">
        {/* HEADER */}
        <Header />

        {/* MODULAR HERO SECTION */}
        <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left 60% Block - Primary Highlight */}
            <div className="lg:col-span-3 flex">
              {activeFeatured ? (
                <FeaturedDealCard
                  products={featuredDeals}
                  currentIndex={currentFeaturedIndex}
                  onSelectIndex={(idx) => setCurrentFeaturedIndex(idx)}
                />
              ) : (
                <div className="py-20 text-center text-slate-400 text-xs">Đang tải deal nổi bật...</div>
              )}
            </div>

            {/* Right 40% Block - TOP BEST SELLERS RANKING */}
            <div className="lg:col-span-2 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-6 min-h-[480px] shadow-md dark:shadow-2xl backdrop-blur-md">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="font-heading text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-amber-500 fill-amber-400" /> TOP LINH KIỆN MUA NHIỀU
                  </span>
                  
                  {/* Top Ranking Tag */}
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                    <span>🔥 BẢNG XẾP HẠNG</span>
                  </div>
                </div>

                {/* Dynamic Best Sellers List with Rank Badges */}
                <div className="space-y-3">
                  {bestSellersProducts.length > 0 ? (
                    bestSellersProducts.map((deal, idx) => {
                      const activePrice = deal.discountPrice ?? deal.price;
                      const rank = idx + 1;
                      return (
                        <Link key={deal.id} href={`/products/${deal.slug}`} className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl relative group hover:border-cyan-500 hover:shadow-md transition-all">
                          {/* Rank Badge Indicator */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-xs border ${
                            rank === 1
                              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black border-amber-300'
                              : rank === 2
                              ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black border-slate-300'
                              : rank === 3
                              ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 border-amber-600'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                          }`}>
                            #{rank}
                          </div>

                          <div className="relative w-20 sm:w-24 aspect-[16/9] rounded-lg overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 group-hover:border-cyan-500 transition-all">
                            <img 
                              src={deal.coverImage} 
                              alt={deal.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                          </div>

                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8.5px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">{deal.platform}</span>
                              {deal.discountPrice && (
                                <span className="text-[8.5px] text-rose-600 dark:text-rose-300 font-extrabold bg-rose-100 dark:bg-rose-950/80 px-1 rounded border border-rose-300 dark:border-rose-800">GIẢM SÂU</span>
                              )}
                            </div>
                            <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 truncate">{deal.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">{formatCurrency(activePrice)}</span>
                              {deal.discountPrice && (
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 line-through font-mono-tech">{formatCurrency(deal.price)}</span>
                              )}
                            </div>
                          </div>
                          <div className="relative z-10 shrink-0">
                            <QuickBuyButton product={deal} />
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">Đang cập nhật bảng xếp hạng...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE FEATURES STRIP */}
        <section className="border-y border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-3 text-cyan-600 dark:text-cyan-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">BẢO HÀNH 1 ĐỔI 1 CHÍNH HÃNG</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light">Bảo hành 12 - 36 tháng cho mọi linh kiện vật lý</p>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-3 text-cyan-600 dark:text-cyan-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">HỖ TRỢ LẮP RÁP & GIAO HÀNG TỐC ĐỘ</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light">Giao hàng toàn quốc & lắp ráp PC theo yêu cầu</p>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-3 text-rose-500 dark:text-rose-400">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">TƯ VẤN BUILD PC CHUYÊN NGHIỆP</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light">Tư vấn socket & RAM tối ưu hiệu năng / ngân sách</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN PRODUCT CATALOG SECTION */}
        <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest block mb-1">
                  ODS HARDWARE STORE
                </span>
                <h2 className="font-heading text-2xl font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  DANH SÁCH LINH KIỆN MÁY TÍNH & PC GAMING
                </h2>
              </div>

              {/* SEARCH INPUT */}
              <div className="relative w-full md:w-96">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm CPU, RTX 4060, Mainboard, RAM..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-sm dark:shadow-lg"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {isSearchFocused && autocompleteList.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-40 space-y-1">
                    {autocompleteList.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <img src={item.coverImage} alt={item.name} className="h-8 w-12 object-cover rounded bg-slate-950" />
                        <div className="flex-1 truncate">
                          <span className="font-heading font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">{item.name}</span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.discountPrice ?? item.price)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FILTER CATEGORY BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800/80 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'ALL', label: 'TẤT CẢ LINH KIỆN' },
                  { id: 'CPU', label: 'CPU (VI XỬ LÝ)' },
                  { id: 'VGA', label: 'VGA (CARD MÀN HÌNH)' },
                  { id: 'MAINBOARD', label: 'BO MẠCH CHỦ' },
                  { id: 'RAM', label: 'RAM' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedPlatform(tab.id)}
                    className={`font-heading rounded-xl px-4 py-2 text-xs font-bold uppercase transition-all ${
                      selectedPlatform === tab.id
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SORT DROPDOWN */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="FEATURED">Nổi Bật Nhất</option>
                  <option value="PRICE_ASC">Giá: Thấp Đến Cao</option>
                  <option value="PRICE_DESC">Giá: Cao Đến Thấp</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {isLoading ? (
            <div className="py-20 text-center text-xs text-slate-400">Đang tải kho sản phẩm...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Không tìm thấy sản phẩm nào phù hợp.</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hãy thử tìm kiếm từ khóa khác hoặc xóa bộ lọc.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <Footer />
      </div>
  );
}

// Quick Buy Button for Flash Deals
function QuickBuyButton({ product }: { product: ProductProps }) {
  const { addToCart } = useCart();
  const isInStock = product.status !== false;

  if (!isInStock) {
    return (
      <button
        disabled
        className="rounded-full bg-gray-200 text-gray-400 p-2 text-xs font-bold cursor-not-allowed shrink-0"
        title="Hết hàng"
      >
        <ShoppingCart className="h-4 w-4" />
      </button>
    );
  }

  return (
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
          platform: product.platform,
        });
      }}
      className="rounded-full bg-ods-primary hover:bg-ods-primaryHover text-white p-2 text-xs font-bold transition-all active:scale-95 hover:shadow-buttonGlow shrink-0"
      title="Thêm vào giỏ"
    >
      <ShoppingCart className="h-4 w-4" />
    </button>
  );
}
