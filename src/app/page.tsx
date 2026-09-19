'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { FeaturedDealCard } from '@/components/FeaturedDealCard';
import { SummerHeroCarousel } from '@/components/SummerHeroCarousel';
import CategoryShowcaseBlock from '@/components/CategoryShowcaseBlock';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { CartProvider, useCart } from '@/context/CartContext';
import { Search, SlidersHorizontal, Flame, Award, Clock, ShoppingCart, Percent, Sparkles, ArrowRight, Layers, Zap } from 'lucide-react';
import { 
  IconLaptop, IconLaptopGaming, IconCpu, IconCase, 
  IconHeadset, IconMonitor, IconKeyboard, IconStorage 
} from '@/components/icons/HardwareIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';
import { supabase } from '@/lib/supabase';

const INITIAL_HOME_PRODUCTS: ProductProps[] = INITIAL_PRODUCTS.map(p => ({
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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('FEATURED');
  const [liveProducts, setLiveProducts] = useState<ProductProps[]>(INITIAL_HOME_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  // Fetch live products in background directly from Supabase PostgreSQL Database API
  useEffect(() => {
    const fetchHomeProducts = () => {
      fetch(`/api/products?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          const apiProds = data.products && Array.isArray(data.products) 
            ? data.products 
            : [];
          
          if (apiProds.length > 0) {
            setLiveProducts(apiProds);
          }
        })
        .catch((err) => {
          console.warn('Lỗi khi tải sản phẩm từ database, sử dụng dữ liệu mặc định:', err);
        });
    };

    fetchHomeProducts();

    // Supabase Realtime channel for Home page
    const channel = supabase
      .channel('home_products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Product' }, (payload: any) => {
        if (payload.eventType === 'DELETE') {
          const deletedId = payload.old?.id;
          if (deletedId) {
            setLiveProducts(prev => prev.filter(p => p.id !== deletedId));
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new;
          if (updated && updated.id) {
            setLiveProducts(prev => prev.map(p => {
              if (p.id === updated.id) {
                return {
                  ...p,
                  name: updated.name,
                  price: updated.price,
                  discountPrice: updated.discountPrice || null,
                  coverImage: updated.coverImage || p.coverImage,
                  status: (updated.stockQuantity ?? 1) > 0,
                  isFlashDeal: updated.isFlashDeal ?? p.isFlashDeal,
                  isFeaturedDeal: updated.isFeatured ?? p.isFeaturedDeal,
                  category: updated.category ? [updated.category] : p.category,
                  brand: updated.brand || p.brand,
                };
              }
              return p;
            }));
          }
        } else if (payload.eventType === 'INSERT') {
          fetchHomeProducts();
        }
      })
      .subscribe();

    window.addEventListener('storage', fetchHomeProducts);
    window.addEventListener('ods_products_updated', fetchHomeProducts);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', fetchHomeProducts);
      window.removeEventListener('ods_products_updated', fetchHomeProducts);
    };
  }, []);

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
      
      let matchesPlatform = selectedPlatform === 'ALL';
      if (!matchesPlatform) {
        const plat = String(product.platform || '').toUpperCase();
        const cat = String(product.category || '').toUpperCase();
        const name = String(product.name || '').toUpperCase();

        if (selectedPlatform === 'LAPTOP') {
          matchesPlatform = (plat.includes('LAPTOP') || cat.includes('LAPTOP') || name.includes('LAPTOP')) && !name.includes('GAMING');
        } else if (selectedPlatform === 'LAPTOP_GAMING') {
          matchesPlatform = plat.includes('GAMING') || cat.includes('GAMING') || name.includes('GAMING') || name.includes('ROG') || name.includes('LEGION');
        } else if (selectedPlatform === 'CPU') {
          matchesPlatform = ['CPU', 'VI XỬ LÝ', 'INTEL CORE', 'RYZEN'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'VGA') {
          matchesPlatform = ['VGA', 'CARD MÀN HÌNH', 'GEFORCE', 'RTX', 'RADEON'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'MAINBOARD') {
          matchesPlatform = ['MAIN', 'BO MẠCH', 'MOTHERBOARD', 'B760', 'Z790', 'B650'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'RAM') {
          matchesPlatform = ['RAM', 'BỘ NHỚ', 'DDR4', 'DDR5'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'STORAGE') {
          matchesPlatform = ['STORAGE', 'SSD', 'HDD', 'CỨNG', 'NVME'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'PSU') {
          matchesPlatform = ['PSU', 'NGUỒN', 'POWER SUPPLY', '80 PLUS'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'CASE') {
          matchesPlatform = ['CASE', 'VỎ MÁY', 'VỎ CASE'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'COOLING') {
          matchesPlatform = ['COOLING', 'TẢN NHIỆT', 'AIO', 'FAN'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'MONITOR') {
          matchesPlatform = ['MONITOR', 'SCREEN', 'MÀN HÌNH'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'KEYBOARD') {
          matchesPlatform = ['KEYBOARD', 'BÀN PHÍM', 'KEYCAP'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'HEADSET') {
          matchesPlatform = ['HEADSET', 'AUDIO', 'HEADPHONE', 'TAI NGHE'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'PREBUILT_PC') {
          matchesPlatform = ['PREBUILT', 'PC GẮN SẴN', 'ĐỒNG BỘ'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else if (selectedPlatform === 'CORE_PARTS') {
          matchesPlatform = ['CPU', 'VGA', 'MAINBOARD', 'RAM'].some(k => plat.includes(k) || cat.includes(k)) || ['CPU', 'VGA', 'RTX', 'RYZEN', 'MAINBOARD', 'DDR'].some(k => name.includes(k));
        } else if (selectedPlatform === 'CASE_COOLING') {
          matchesPlatform = ['CASE', 'PSU', 'COOLING', 'NGUỒN', 'TẢN'].some(k => plat.includes(k) || cat.includes(k) || name.includes(k));
        } else {
          matchesPlatform = product.platform === selectedPlatform || product.category === selectedPlatform;
        }
      }
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

        {/* FULL-WIDTH FLAGSHIP HERO SECTION */}
        <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
          <SummerHeroCarousel />
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

        {/* 8-CATEGORY SHOWCASE GRID SECTION */}
        <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-12 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest block mb-1">
                DRX HARDWARE CATEGORIES
              </span>
              <h3 className="font-heading text-xl font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                DANH MỤC THIẾT BỊ & LINH KIỆN NỔI BẬT
              </h3>
            </div>
            <Link 
              href="/products"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors group"
            >
              <span>Xem Tất Cả</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'LAPTOP', title: 'Laptop', desc: 'Mỏng nhẹ, Doanh nhân, Sinh viên', icon: IconLaptop, badge: 'MỚI VỀ', color: 'from-cyan-500/20 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
              { id: 'LAPTOP_GAMING', title: 'Laptop Gaming', desc: 'ROG, Legion, RTX 40 Series', icon: IconLaptopGaming, badge: 'GIẢM SÂU', color: 'from-rose-500/20 to-amber-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
              { id: 'CORE_PARTS', title: 'Main, CPU, VGA, RAM', desc: 'Vi xử lý, Card đồ họa, Bo mạch', icon: IconCpu, badge: 'HOT', color: 'from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
              { id: 'CASE_COOLING', title: 'Case, Nguồn, Tản Nhiệt', desc: 'Vỏ PC, PSU 80 Plus, Tản AIO', icon: IconCase, badge: 'PC BUILD', color: 'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
              { id: 'HEADSET', title: 'Tai Nghe', desc: 'Tai nghe Gaming 7.1, Mic lọc ồn', icon: IconHeadset, badge: 'GEAR', color: 'from-purple-500/20 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
              { id: 'MONITOR', title: 'Màn Hình', desc: '144Hz - 360Hz, 2K/4K OLED, IPS', icon: IconMonitor, badge: 'BÁN CHẠY', color: 'from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
              { id: 'KEYBOARD', title: 'Bàn Phím', desc: 'Phím cơ Custom, Wireless, Hot-swap', icon: IconKeyboard, badge: 'CUSTOM', color: 'from-teal-500/20 to-emerald-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30' },
              { id: 'STORAGE', title: 'Ổ Cứng', desc: 'SSD NVMe PCIe 4.0/5.0, HDD 4TB', icon: IconStorage, badge: 'TỐC ĐỘ', color: 'from-indigo-500/20 to-cyan-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  onClick={() => setSelectedPlatform(cat.id)}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm dark:shadow-xl hover:shadow-xl hover:border-cyan-500 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl ${cat.color} rounded-bl-full opacity-40 group-hover:opacity-80 transition-opacity pointer-events-none`} />

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 ${cat.color.split(' ')[2]} group-hover:scale-110 transition-transform shadow-xs`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs ${cat.color.split(' ')[2]} ${cat.color.split(' ')[3]}`}>
                      {cat.badge}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {cat.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light mt-1 line-clamp-1">
                      {cat.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FEATURED CATEGORY SHOWCASE LIST BLOCKS (HÌNH 1, 2, 3) */}
        <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-4 flex-1">
          <div className="space-y-10">
            {(() => {
              const matchCat = (p: any, ...targetCats: string[]) => {
                if (!p) return false;
                const pCats: string[] = [];
                if (Array.isArray(p.category)) {
                  p.category.forEach((c: any) => pCats.push(String(c).toUpperCase()));
                } else if (p.category) {
                  pCats.push(String(p.category).toUpperCase());
                }
                if (p.type) pCats.push(String(p.type).toUpperCase());
                return targetCats.some(tc => pCats.includes(tc.toUpperCase()));
              };

              const isPrebuiltPC = (p: any) => {
                if (!p) return false;
                const name = String(p.name || '').toLowerCase();
                return matchCat(p, 'PREBUILT_PC') || p.isPrebuilt === true || name.startsWith('pc ') || name.startsWith('pc drx') || name.startsWith('pc gaming');
              };

              const isMonitorProduct = (p: any) => {
                if (!p || isPrebuiltPC(p)) return false;
                const name = String(p.name || '').toLowerCase();
                const isVgaOrCard = name.includes('card màn hình') || name.includes('vga') || name.includes('geforce') || name.includes('radeon') || matchCat(p, 'VGA');
                const isCoolingOrCase = matchCat(p, 'COOLING', 'CASE', 'PSU') || name.includes('tản nhiệt') || name.includes('vỏ case');
                if (isVgaOrCard || isCoolingOrCase) return false;
                return matchCat(p, 'MONITOR') || (name.includes('màn hình') && !isVgaOrCard);
              };

              const isGearProduct = (p: any) => {
                if (!p || isPrebuiltPC(p) || isMonitorProduct(p)) return false;
                const name = String(p.name || '').toLowerCase();
                if (matchCat(p, 'CPU', 'VGA', 'MAINBOARD', 'RAM', 'STORAGE', 'CASE', 'COOLING', 'PSU', 'LAPTOP', 'LAPTOP_GAMING')) return false;
                return matchCat(p, 'GEAR', 'KEYBOARD', 'HEADSET') || name.includes('bàn phím') || name.includes('chuột') || name.includes('tai nghe') || name.includes('ghế');
              };

              const isCaseCoolingPsuProduct = (p: any) => {
                if (!p || isPrebuiltPC(p) || isMonitorProduct(p) || isGearProduct(p)) return false;
                if (matchCat(p, 'CPU', 'VGA', 'MAINBOARD', 'RAM', 'STORAGE', 'LAPTOP', 'LAPTOP_GAMING')) return false;
                const name = String(p.name || '').toLowerCase();
                return matchCat(p, 'CASE', 'COOLING', 'PSU') || name.includes('vỏ case') || name.includes('tản nhiệt') || name.includes('nguồn máy tính') || (name.includes('nguồn') && !name.includes('mainboard'));
              };

              const isLaptopProduct = (p: any) => {
                if (!p || isPrebuiltPC(p)) return false;
                // Exclude components that might have "laptop" in their name (e.g. RAM Laptop, Ổ cứng laptop, Balo, Tản nhiệt)
                if (matchCat(p, 'RAM', 'STORAGE', 'COOLING', 'CASE', 'PSU', 'CPU', 'VGA', 'MAINBOARD', 'KEYBOARD', 'MOUSE', 'HEADSET', 'MONITOR', 'CHAIR', 'GEAR')) return false;
                const name = String(p.name || '').toLowerCase();
                if (name.startsWith('ram ') || name.includes('sodimm') || name.includes('ddr4') || name.includes('ddr5') || name.includes('thanh ram') || name.includes('ổ cứng') || name.includes('ssd') || name.includes('balo') || name.includes('đế tản')) return false;
                if (matchCat(p, 'LAPTOP', 'LAPTOP_GAMING')) return true;
                return (name.includes('laptop') || name.includes('macbook') || name.includes('vivobook') || name.includes('legion') || name.includes('loq') || name.includes('thinkpad') || name.includes('zenbook') || name.includes('swift')) && !name.includes('ram');
              };

              const isCoreProduct = (p: any) => {
                if (!p || isPrebuiltPC(p) || isMonitorProduct(p) || isGearProduct(p) || isCaseCoolingPsuProduct(p) || isLaptopProduct(p)) return false;
                const name = String(p.name || '').toLowerCase();
                return matchCat(p, 'CPU', 'VGA', 'MAINBOARD', 'RAM', 'STORAGE') || name.includes('ram ') || name.includes('ddr4') || name.includes('ddr5') || name.includes('sodimm');
              };

              return (
                <>
                  {/* SHOWCASE 1: CASE - TẢN - NGUỒN (BANNER HÌNH 1) */}
                  <CategoryShowcaseBlock
                    title="CASE - TẢN - NGUỒN"
                    subtitle="GIÁ RẺ HÀNG TỐT"
                    badgeText="HÀNG BÁN CHẠY"
                    bannerImage="/banners/banner-showcase-case-psu.webp"
                    theme="cyan"
                    viewAllLink="/products?category=CASE_COOLING"
                    products={liveProducts.filter(isCaseCoolingPsuProduct)}
                    subTabs={[
                      { id: 'ALL', label: 'Tất cả Case Tản', viewAllLink: '/products?category=CASE_COOLING' },
                      { id: 'CASE', label: 'Case PC', viewAllLink: '/products?category=CASE', filterFn: p => !isPrebuiltPC(p) && (matchCat(p, 'CASE') || p.name.toLowerCase().includes('vỏ case') || (p.name.toLowerCase().includes('case') && !p.name.toLowerCase().includes('pc '))) },
                      { id: 'COOLING', label: 'Tản nhiệt', viewAllLink: '/products?category=COOLING', filterFn: p => !isPrebuiltPC(p) && (matchCat(p, 'COOLING') || p.name.toLowerCase().includes('tản nhiệt') || p.name.toLowerCase().includes('cooler') || p.name.toLowerCase().includes('liquid') || p.name.toLowerCase().includes('kraken')) },
                      { id: 'PSU', label: 'Bộ Nguồn PSU', viewAllLink: '/products?category=PSU', filterFn: p => !isPrebuiltPC(p) && (matchCat(p, 'PSU') || p.name.toLowerCase().includes('nguồn máy tính') || (p.name.toLowerCase().includes('nguồn') && !p.name.toLowerCase().includes('mainboard') && !p.name.toLowerCase().includes('pc ')) || p.name.toLowerCase().includes('80 plus')) },
                    ]}
                  />

                  {/* SHOWCASE 2: LINH KIỆN MÁY TÍNH (BANNER HÌNH 2: MAIN, CPU, VGA, RAM, SSD) */}
                  <CategoryShowcaseBlock
                    title="LINH KIỆN"
                    subtitle="GIÁ SỐC TẬN GỐC"
                    badgeText="HÀNG BÁN CHẠY"
                    bannerImage="/banners/banner-showcase-linh-kien.webp"
                    theme="rose"
                    viewAllLink="/products?category=CORE_PARTS"
                    products={liveProducts.filter(isCoreProduct)}
                    subTabs={[
                      { id: 'ALL', label: 'Tất cả Linh Kiện', viewAllLink: '/products?category=CORE_PARTS' },
                      { id: 'CPU', label: 'Vi xử lý CPU', viewAllLink: '/products?category=CPU', filterFn: p => matchCat(p, 'CPU') || p.name.toLowerCase().includes('cpu') || p.name.toLowerCase().includes('core i') || p.name.toLowerCase().includes('ryzen') },
                      { id: 'VGA', label: 'Card đồ họa VGA', viewAllLink: '/products?category=VGA', filterFn: p => matchCat(p, 'VGA') || p.name.toLowerCase().includes('card màn hình') || p.name.toLowerCase().includes('vga') || p.name.toLowerCase().includes('rtx') || p.name.toLowerCase().includes('geforce') },
                      { id: 'MAINBOARD', label: 'Bo mạch Main', viewAllLink: '/products?category=MAINBOARD', filterFn: p => matchCat(p, 'MAINBOARD') || p.name.toLowerCase().includes('bo mạch') || p.name.toLowerCase().includes('mainboard') || p.name.toLowerCase().includes('b760') || p.name.toLowerCase().includes('z790') || p.name.toLowerCase().includes('b650') || p.name.toLowerCase().includes('x670') },
                      { id: 'RAM', label: 'Bộ nhớ RAM', viewAllLink: '/products?category=RAM', filterFn: p => matchCat(p, 'RAM') || p.name.toLowerCase().includes('ram ') || p.name.toLowerCase().includes('ddr4') || p.name.toLowerCase().includes('ddr5') || p.name.toLowerCase().includes('trident') || p.name.toLowerCase().includes('vengeance') || p.name.toLowerCase().includes('fury') || p.name.toLowerCase().includes('ripjaws') || p.name.toLowerCase().includes('sodimm') },
                      { id: 'STORAGE', label: 'Ổ cứng SSD', viewAllLink: '/products?category=STORAGE', filterFn: p => matchCat(p, 'STORAGE') || p.name.toLowerCase().includes('ssd') || p.name.toLowerCase().includes('hdd') || p.name.toLowerCase().includes('ổ cứng') || p.name.toLowerCase().includes('nvme') || p.name.toLowerCase().includes('sata') },
                    ]}
                  />

                  {/* SHOWCASE 3: LAPTOP (BANNER HÌNH 3) */}
                  <CategoryShowcaseBlock
                    title="LAPTOP"
                    subtitle="MỎNG NHẸ MƯỢT MÀ"
                    badgeText="HÀNG BÁN CHẠY"
                    bannerImage="/banners/banner-showcase-laptop.webp"
                    theme="emerald"
                    viewAllLink="/products?category=LAPTOP"
                    products={liveProducts.filter(isLaptopProduct)}
                    subTabs={[
                      { id: 'ALL', label: 'Laptop khuyến mãi', viewAllLink: '/products?category=LAPTOP' },
                      { 
                        id: 'GAMING', 
                        label: 'Laptop gaming', 
                        viewAllLink: '/products?category=LAPTOP_GAMING',
                        filterFn: p => matchCat(p, 'LAPTOP_GAMING') || p.name.toLowerCase().includes('gaming') || p.name.toLowerCase().includes('nitro') || p.name.toLowerCase().includes('legion') || p.name.toLowerCase().includes('rog') || p.name.toLowerCase().includes('tuf') || p.name.toLowerCase().includes('katana') || p.name.toLowerCase().includes('dell g15') || p.name.toLowerCase().includes('loq') 
                      },
                      { 
                        id: 'OFFICE', 
                        label: 'Laptop văn phòng', 
                        viewAllLink: '/products?category=LAPTOP',
                        filterFn: p => matchCat(p, 'LAPTOP') || p.name.toLowerCase().includes('macbook') || p.name.toLowerCase().includes('vivobook') || p.name.toLowerCase().includes('pavilion') || p.name.toLowerCase().includes('thinkpad') || p.name.toLowerCase().includes('swift') || p.name.toLowerCase().includes('inspiron') || p.name.toLowerCase().includes('zenbook') 
                      },
                    ]}
                  />

                  {/* SHOWCASE 4: MÀN HÌNH (BANNER HÌNH 4) */}
                  <CategoryShowcaseBlock
                    title="MÀN HÌNH"
                    subtitle="ĐẸP HÌNH MƯỢT MẮT"
                    badgeText="HÀNG BÁN CHẠY"
                    bannerImage="/banners/banner-showcase-man-hinh.webp"
                    theme="blue"
                    viewAllLink="/products?category=MONITOR"
                    products={liveProducts.filter(isMonitorProduct)}
                    subTabs={[
                      { id: 'ALL', label: 'Màn hình khuyến mãi', viewAllLink: '/products?category=MONITOR' },
                      { 
                        id: 'GAMING', 
                        label: 'Màn hình gaming', 
                        viewAllLink: '/products?category=MONITOR&usage=gaming',
                        filterFn: p => {
                          const name = p.name.toLowerCase();
                          return name.includes('gaming') || name.includes('144hz') || name.includes('165hz') || name.includes('180hz') || name.includes('240hz') || name.includes('360hz') || name.includes('tuf') || name.includes('rog') || name.includes('odyssey') || name.includes('ultragear') || name.includes('24g2sp') || name.includes('vx2428') || name.includes('vg249') || name.includes('vg279');
                        } 
                      },
                      { 
                        id: 'OFFICE', 
                        label: 'Màn hình văn phòng', 
                        viewAllLink: '/products?category=MONITOR&usage=văn+phòng',
                        filterFn: p => {
                          const name = p.name.toLowerCase();
                          return name.includes('văn phòng') || name.includes('p2422h') || name.includes('ls24c310') || name.includes('essential') || name.includes('s3') || (name.includes('dell') && !name.includes('gaming') && !name.includes('ultrasharp')) || (!name.includes('165hz') && !name.includes('180hz') && !name.includes('240hz') && !name.includes('tuf') && !name.includes('ultragear') && !name.includes('24g2sp') && !name.includes('vx2428'));
                        } 
                      },
                      { 
                        id: 'DESIGN', 
                        label: 'Màn hình đồ họa', 
                        viewAllLink: '/products?category=MONITOR&usage=đồ+họa',
                        filterFn: p => {
                          const name = p.name.toLowerCase();
                          return name.includes('đồ họa') || name.includes('proart') || name.includes('ultrasharp') || name.includes('pa278cv') || name.includes('u2724d') || name.includes('ips black') || name.includes('2k') || name.includes('4k') || name.includes('srgb 125%') || name.includes('27gr75q');
                        } 
                      },
                    ]}
                  />

                  {/* SHOWCASE 5: GAMING GEAR */}
                  <CategoryShowcaseBlock
                    title="GAMING GEAR"
                    subtitle="HÀNG CHẤT GIÁ MỀM"
                    badgeText="HÀNG BÁN CHẠY"
                    bannerImage="https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80"
                    theme="amber"
                    viewAllLink="/products?category=GEAR"
                    products={liveProducts.filter(isGearProduct)}
                    subTabs={[
                      { id: 'ALL', label: 'Bàn phím & Gear', viewAllLink: '/products?category=GEAR' },
                      { 
                        id: 'KEYBOARD', 
                        label: 'Bàn phím cơ', 
                        viewAllLink: '/products?category=KEYBOARD',
                        filterFn: p => {
                          const name = p.name.toLowerCase();
                          if (name.includes('chuột') || name.includes('mouse') || name.includes('tai nghe') || name.includes('headset') || name.includes('ghế')) return false;
                          return matchCat(p, 'KEYBOARD') || name.includes('bàn phím') || name.includes('keyboard') || name.includes('akko') || name.includes('dareu') || name.includes('fl-esports') || name.includes('keychron') || name.includes('k70');
                        } 
                      },
                      { 
                        id: 'MOUSE', 
                        label: 'Chuột Gaming', 
                        viewAllLink: '/products?category=MOUSE',
                        filterFn: p => {
                          const name = p.name.toLowerCase();
                          if (name.includes('tai nghe') || name.includes('headset') || name.includes('headphone') || name.includes('bàn phím') || name.includes('keyboard') || name.includes('ghế')) return false;
                          return name.includes('chuột') || name.includes('mouse') || name.includes('superlight') || name.includes('deathadder') || name.includes('g102') || name.includes('gladius');
                        } 
                      },
                      { 
                        id: 'HEADSET', 
                        label: 'Tai nghe', 
                        viewAllLink: '/products?category=HEADSET',
                        filterFn: p => {
                          const name = p.name.toLowerCase();
                          if (name.includes('chuột') || name.includes('mouse') || name.includes('bàn phím') || name.includes('keyboard') || name.includes('ghế')) return false;
                          return matchCat(p, 'HEADSET') || name.includes('tai nghe') || name.includes('headphone') || name.includes('headset') || name.includes('cloud') || name.includes('g435') || name.includes('hs80') || name.includes('blackshark') || name.includes('arctis');
                        } 
                      },
                      { 
                        id: 'CHAIR', 
                        label: 'Bàn & Ghế', 
                        viewAllLink: '/products?category=CHAIR',
                        filterFn: p => {
                          const name = p.name.toLowerCase();
                          if (name.includes('chuột') || name.includes('mouse') || name.includes('bàn phím') || name.includes('keyboard') || name.includes('tai nghe') || name.includes('headset')) return false;
                          return matchCat(p, 'GEAR') || name.includes('ghế') || name.includes('bàn di') || name.includes('lót chuột') || name.includes('tay cầm') || name.includes('stream deck') || name.includes('giá treo') || name.includes('microphone') || name.includes('quadcast') || name.includes('t3 rush') || name.includes('throne');
                        } 
                      },
                    ]}
                  />
                </>
              );
            })()}
          </div>
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
