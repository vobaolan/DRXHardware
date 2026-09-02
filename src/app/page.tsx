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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('FEATURED');
  const [liveProducts, setLiveProducts] = useState<ProductProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  const DEFAULT_HOME_PRODUCTS: ProductProps[] = useMemo(() => {
    return INITIAL_PRODUCTS.map(p => ({
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
  }, []);

  // Fetch live products from database API & local admin cache
  useEffect(() => {
    const fetchHomeProducts = () => {
      setIsLoading(true);
      let localProds: any[] = [];
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
        const storedCustom = localStorage.getItem('ods_custom_products');
        if (storedCustom) {
          const parsed = JSON.parse(storedCustom);
          if (Array.isArray(parsed)) {
            localProds.push(...parsed.filter((p) => !isDeletedOrObsolete(p)));
          }
        }

        const storedAdmin = localStorage.getItem('ods_admin_products');
        if (storedAdmin) {
          const parsed = JSON.parse(storedAdmin);
          if (Array.isArray(parsed)) {
            parsed.filter((p) => !isDeletedOrObsolete(p)).forEach(ap => {
              if (!localProds.some(lp => lp.id === ap.id)) {
                localProds.push(ap);
              }
            });
          }
        }
      } catch (e) {}

      fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          const apiProds = data.products && Array.isArray(data.products) ? data.products.filter((p: any) => !isDeletedOrObsolete(p)) : [];
          const combined = [...DEFAULT_HOME_PRODUCTS];

          // 1. Merge API products
          apiProds.forEach((ap: any) => {
            const idx = combined.findIndex((p) => p.id === ap.id || p.slug === ap.slug || p.name.toLowerCase() === ap.name.toLowerCase());
            if (idx >= 0) {
              combined[idx] = { 
                ...combined[idx], 
                ...ap, 
                coverImage: ap.coverImage || combined[idx].coverImage,
                category: Array.isArray(ap.category) ? ap.category : [ap.category || combined[idx].category[0]],
              };
            } else {
              combined.push(ap);
            }
          });

          // 2. Merge local admin edited products (highest live client priority)
          localProds.forEach((lp: any) => {
            const idx = combined.findIndex((p) => p.id === lp.id || p.slug === lp.slug || p.name.toLowerCase() === lp.name.toLowerCase());
            if (idx >= 0) {
              combined[idx] = { 
                ...combined[idx], 
                ...lp,
                coverImage: lp.coverImage || combined[idx].coverImage,
                category: Array.isArray(lp.category) ? lp.category : [lp.category || combined[idx].category[0]],
              };
            } else {
              combined.push(lp);
            }
          });

          const finalLive = combined.filter((p) => !isDeletedOrObsolete(p));
          setLiveProducts(finalLive);
        })
        .catch((err) => {
          console.error('Lỗi khi tải sản phẩm:', err);
          const combined = [...DEFAULT_HOME_PRODUCTS];
          localProds.forEach((lp: any) => {
            const idx = combined.findIndex((p) => p.id === lp.id || p.slug === lp.slug || p.name.toLowerCase() === lp.name.toLowerCase());
            if (idx >= 0) {
              combined[idx] = { 
                ...combined[idx], 
                ...lp,
                coverImage: lp.coverImage || combined[idx].coverImage,
              };
            } else {
              combined.push(lp);
            }
          });
          const finalLive = combined.filter((p) => !isDeletedOrObsolete(p));
          setLiveProducts(finalLive);
        })
        .finally(() => setIsLoading(false));
    };

    fetchHomeProducts();

    window.addEventListener('storage', fetchHomeProducts);
    window.addEventListener('ods_products_updated', fetchHomeProducts);

    return () => {
      window.removeEventListener('storage', fetchHomeProducts);
      window.removeEventListener('ods_products_updated', fetchHomeProducts);
    };
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

              const isMonitorProduct = (p: any) => {
                if (!p) return false;
                const name = String(p.name || '').toLowerCase();
                const isVgaOrCard = name.includes('card màn hình') || name.includes('vga') || name.includes('geforce') || name.includes('radeon') || matchCat(p, 'VGA');
                const isCoolingOrCase = matchCat(p, 'COOLING', 'CASE', 'PSU') || name.includes('tản nhiệt') || name.includes('vỏ case');
                if (isVgaOrCard || isCoolingOrCase) return false;
                return matchCat(p, 'MONITOR') || (name.includes('màn hình') && !isVgaOrCard);
              };

              const isGearProduct = (p: any) => {
                if (!p) return false;
                const name = String(p.name || '').toLowerCase();
                if (isMonitorProduct(p) || matchCat(p, 'CPU', 'VGA', 'MAINBOARD', 'RAM', 'STORAGE', 'CASE', 'COOLING', 'PSU', 'LAPTOP', 'LAPTOP_GAMING')) return false;
                return matchCat(p, 'GEAR', 'KEYBOARD', 'HEADSET') || name.includes('bàn phím') || name.includes('chuột') || name.includes('tai nghe') || name.includes('ghế');
              };

              const isCaseCoolingPsuProduct = (p: any) => {
                if (!p) return false;
                const name = String(p.name || '').toLowerCase();
                if (isMonitorProduct(p) || isGearProduct(p)) return false;
                return matchCat(p, 'CASE', 'COOLING', 'PSU') || name.includes('vỏ case') || name.includes('tản nhiệt') || (name.includes('nguồn') && !name.includes('mainboard'));
              };

              const isLaptopProduct = (p: any) => {
                if (!p) return false;
                const name = String(p.name || '').toLowerCase();
                return matchCat(p, 'LAPTOP', 'LAPTOP_GAMING') || name.includes('laptop') || name.includes('macbook') || name.includes('vivobook') || name.includes('legion') || name.includes('loq');
              };

              const isCoreProduct = (p: any) => {
                if (!p) return false;
                if (isMonitorProduct(p) || isGearProduct(p) || isCaseCoolingPsuProduct(p) || isLaptopProduct(p)) return false;
                return matchCat(p, 'CPU', 'VGA', 'MAINBOARD', 'RAM', 'STORAGE');
              };

              return (
                <>
                  {/* SHOWCASE 1: CASE - TẢN - NGUỒN (HÌNH 1) */}
                  <CategoryShowcaseBlock
                    title="CASE - TẢN - NGUỒN"
                    subtitle="GIÁ RẺ HÀNG TỐT"
                    badgeText="HÀNG BÁN CHẠY"
                    bannerImage="https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=600&q=80"
                    theme="cyan"
                    viewAllLink="/products?category=CASE"
                    products={liveProducts.filter(isCaseCoolingPsuProduct)}
                    subTabs={[
                      { id: 'ALL', label: 'Tất cả Case Tản' },
                      { id: 'CASE', label: 'Case PC', filterFn: p => matchCat(p, 'CASE') || p.name.toLowerCase().includes('case') },
                      { id: 'COOLING', label: 'Tản nhiệt', filterFn: p => matchCat(p, 'COOLING') || p.name.toLowerCase().includes('tản nhiệt') },
                      { id: 'PSU', label: 'Bộ Nguồn PSU', filterFn: p => matchCat(p, 'PSU') || p.name.toLowerCase().includes('nguồn') },
                    ]}
                  />

                  {/* SHOWCASE 2: GAMING GEAR (HÌNH 2) */}
                  <CategoryShowcaseBlock
                    title="GAMING GEAR"
                    subtitle="HÀNG CHẤT GIÁ MỀM"
                    badgeText="HÀNG BÁN CHẠY"
                    bannerImage="https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80"
                    theme="amber"
                    viewAllLink="/products?category=GEAR"
                    products={liveProducts.filter(isGearProduct)}
                    subTabs={[
                      { id: 'ALL', label: 'Bàn phím & Gear' },
                      { id: 'KEYBOARD', label: 'Bàn phím cơ', filterFn: p => p.name.toLowerCase().includes('bàn phím') || p.name.toLowerCase().includes('akko') || p.name.toLowerCase().includes('keychron') },
                      { id: 'MOUSE', label: 'Chuột Gaming', filterFn: p => p.name.toLowerCase().includes('chuột') || p.name.toLowerCase().includes('razer') || p.name.toLowerCase().includes('logitech') },
                      { id: 'HEADSET', label: 'Tai nghe', filterFn: p => p.name.toLowerCase().includes('tai nghe') || p.name.toLowerCase().includes('hyperx') || p.name.toLowerCase().includes('hs80') },
                      { id: 'CHAIR', label: 'Bàn & Ghế', filterFn: p => p.name.toLowerCase().includes('ghế') || p.name.toLowerCase().includes('sihoo') },
                    ]}
                  />

                  {/* SHOWCASE 3: MÀN HÌNH GAMING (HÌNH 3) */}
                  <CategoryShowcaseBlock
                    title="MÀN HÌNH GAMING"
                    subtitle="ĐẸP HÌNH MƯỢT MẮT"
                    badgeText="HÀNG BÁN CHẠY"
                    bannerImage="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80"
                    theme="emerald"
                    viewAllLink="/products?category=MONITOR"
                    products={liveProducts.filter(isMonitorProduct)}
                    subTabs={[
                      { id: 'ALL', label: 'Màn hình khuyến mãi' },
                      { id: 'GAMING', label: 'Màn hình gaming', filterFn: p => p.name.includes('144Hz') || p.name.includes('180Hz') || p.name.includes('240Hz') || p.name.includes('360Hz') || p.name.toLowerCase().includes('rog') || p.name.toLowerCase().includes('odyssey') || p.name.toLowerCase().includes('ultragear') },
                      { id: 'OFFICE', label: 'Màn hình văn phòng', filterFn: p => (p.price && p.price < 7000000) || p.name.toLowerCase().includes('odyssey g4') },
                      { id: 'DESIGN', label: 'Màn hình đồ họa', filterFn: p => p.name.toLowerCase().includes('ultrasharp') || p.name.toLowerCase().includes('ips black') || p.name.toLowerCase().includes('2k') || p.name.toLowerCase().includes('dell') },
                    ]}
                  />

                  {/* SHOWCASE 4: LAPTOP & LAPTOP GAMING */}
                  <CategoryShowcaseBlock
                    title="LAPTOP & MOBILE"
                    subtitle="MỎNG NHẸ MƯỢT MÀ"
                    badgeText="HÀNG BÁN CHẠY"
                    bannerImage="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80"
                    theme="purple"
                    viewAllLink="/products?category=LAPTOP"
                    products={liveProducts.filter(isLaptopProduct)}
                    subTabs={[
                      { id: 'ALL', label: 'Laptop khuyến mãi' },
                      { id: 'GAMING', label: 'Laptop gaming', filterFn: p => matchCat(p, 'LAPTOP_GAMING') || p.name.toLowerCase().includes('gaming') || p.name.toLowerCase().includes('rog') || p.name.toLowerCase().includes('loq') || p.name.toLowerCase().includes('legion') },
                      { id: 'OFFICE', label: 'Laptop văn phòng', filterFn: p => matchCat(p, 'LAPTOP') || p.name.toLowerCase().includes('vivobook') },
                      { id: 'STAND', label: 'Phụ kiện Laptop', filterFn: p => p.ramType !== undefined },
                    ]}
                  />

                  {/* SHOWCASE 5: MAIN, CPU, VGA, RAM (CORE PARTS) */}
                  <CategoryShowcaseBlock
                    title="MAIN, CPU, VGA, RAM"
                    subtitle="HIỆU NĂNG BỨT PHÁ"
                    badgeText="HÀNG BÁN CHẠY"
                    bannerImage="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80"
                    theme="rose"
                    viewAllLink="/products?category=CORE_PARTS"
                    products={liveProducts.filter(isCoreProduct)}
                    subTabs={[
                      { id: 'ALL', label: 'Tất cả Linh Kiện' },
                      { id: 'CPU', label: 'Vi xử lý CPU', filterFn: p => matchCat(p, 'CPU') },
                      { id: 'VGA', label: 'Card đồ họa VGA', filterFn: p => matchCat(p, 'VGA') },
                      { id: 'MAINBOARD', label: 'Bo mạch Main', filterFn: p => matchCat(p, 'MAINBOARD') },
                      { id: 'RAM', label: 'Bộ nhớ RAM', filterFn: p => matchCat(p, 'RAM') },
                      { id: 'STORAGE', label: 'Ổ cứng SSD', filterFn: p => matchCat(p, 'STORAGE') },
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
