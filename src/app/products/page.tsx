'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { 
  Search, SlidersHorizontal, Flame, Clock, Tag, ArrowLeft, Grid, 
  X, RotateCcw, ChevronDown, Check, Filter
} from 'lucide-react';
import { 
  IconLaptop, IconLaptopGaming, IconCpu, IconMainboard, 
  IconVga, IconRam, IconStorage, IconCase, IconHeadset, 
  IconMonitor, IconKeyboard, IconMouse 
} from '@/components/icons/HardwareIcons';

// Clean 1-line titles as requested by user
const CATEGORY_DEFINITIONS: Record<string, { title: string; iconName: string }> = {
  ALL: {
    title: 'Tất Cả Sản Phẩm & Linh Kiện DRX',
    iconName: 'Grid',
  },
  LAPTOP: {
    title: 'Laptop - Học Tập và Làm Việc',
    iconName: 'IconLaptop',
  },
  LAPTOP_GAMING: {
    title: 'Laptop Gaming & Đồ Họa',
    iconName: 'IconLaptopGaming',
  },
  CORE_PARTS: {
    title: 'Linh Kiện Core - CPU, Main, VGA & RAM',
    iconName: 'IconCpu',
  },
  CPU: {
    title: 'Bộ Vi Xử Lý - CPU Intel & AMD',
    iconName: 'IconCpu',
  },
  VGA: {
    title: 'Card Màn Hình - VGA NVIDIA & AMD',
    iconName: 'IconVga',
  },
  MAINBOARD: {
    title: 'Bo Mạch Chủ - Mainboard',
    iconName: 'IconMainboard',
  },
  RAM: {
    title: 'Bộ Nhớ Trong - RAM DDR4 & DDR5',
    iconName: 'IconRam',
  },
  STORAGE: {
    title: 'Ổ Cứng Lưu Trữ - SSD M.2 & HDD',
    iconName: 'IconStorage',
  },
  CASE_COOLING: {
    title: 'Vỏ Case, Nguồn Máy Tính & Tản Nhiệt',
    iconName: 'IconCase',
  },
  MONITOR: {
    title: 'Màn Hình Máy Tính - Gaming & Đồ Họa',
    iconName: 'IconMonitor',
  },
  KEYBOARD: {
    title: 'Bàn Phím Cơ Custom & Chuột Gaming',
    iconName: 'IconKeyboard',
  },
  HEADSET: {
    title: 'Tai Nghe Gaming & Âm Thanh',
    iconName: 'IconHeadset',
  },
};

const SIDEBAR_CATEGORIES = [
  { id: 'ALL', label: 'Tất Cả Sản Phẩm', icon: Grid },
  { id: 'LAPTOP', label: 'Laptop - Học Tập & Làm Việc', icon: IconLaptop },
  { id: 'LAPTOP_GAMING', label: 'Laptop Gaming', icon: IconLaptopGaming },
  { id: 'CPU', label: 'Bộ Vi Xử Lý (CPU)', icon: IconCpu },
  { id: 'VGA', label: 'Card Màn Hình (VGA)', icon: IconVga },
  { id: 'MAINBOARD', label: 'Bo Mạch Chủ (Mainboard)', icon: IconMainboard },
  { id: 'RAM', label: 'Bộ Nhớ RAM', icon: IconRam },
  { id: 'STORAGE', label: 'Ổ Cứng SSD NVMe', icon: IconStorage },
  { id: 'CASE_COOLING', label: 'Vỏ Case, Nguồn & Tản', icon: IconCase },
  { id: 'MONITOR', label: 'Màn Hình Máy Tính', icon: IconMonitor },
  { id: 'KEYBOARD', label: 'Bàn Phím & Chuột', icon: IconKeyboard },
  { id: 'HEADSET', label: 'Tai Nghe Gaming', icon: IconHeadset },
];

const PRICE_RANGES = [
  { id: 'ALL', label: 'Tất Cả Mức Giá' },
  { id: 'UNDER_10M', label: 'Dưới 10 Triệu' },
  { id: '10M_20M', label: 'Từ 10 - 20 Triệu' },
  { id: '20M_30M', label: 'Từ 20 - 30 Triệu' },
  { id: 'ABOVE_30M', label: 'Trên 30 Triệu' },
];

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case 'IconLaptop': return <IconLaptop className={className} />;
    case 'IconLaptopGaming': return <IconLaptopGaming className={className} />;
    case 'IconCpu': return <IconCpu className={className} />;
    case 'IconVga': return <IconVga className={className} />;
    case 'IconMainboard': return <IconMainboard className={className} />;
    case 'IconRam': return <IconRam className={className} />;
    case 'IconStorage': return <IconStorage className={className} />;
    case 'IconCase': return <IconCase className={className} />;
    case 'IconMonitor': return <IconMonitor className={className} />;
    case 'IconKeyboard': return <IconKeyboard className={className} />;
    case 'IconHeadset': return <IconHeadset className={className} />;
    default: return <Grid className={className} />;
  }
}

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialFilter = searchParams.get('filter') || 'ALL';
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialPlatform = searchParams.get('platform') || 'ALL';

  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(initialPlatform);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('FEATURED');

  // Filter States (Sidebar)
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedRam, setSelectedRam] = useState<string>('ALL');
  const [selectedSsd, setSelectedSsd] = useState<string>('ALL');
  const [selectedCpuBrand, setSelectedCpuBrand] = useState<string>('ALL');
  const [selectedGpuBrand, setSelectedGpuBrand] = useState<string>('ALL');
  const [selectedRefreshRate, setSelectedRefreshRate] = useState<string>('ALL');

  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [liveProducts, setLiveProducts] = useState<ProductProps[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state with query parameters
  useEffect(() => {
    if (searchParams.get('filter')) {
      setActiveFilter(searchParams.get('filter') || 'ALL');
    }
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category') || 'ALL');
    }
    if (searchParams.get('platform')) {
      setSelectedPlatform(searchParams.get('platform') || 'ALL');
    }
  }, [searchParams]);

  // Load products from database & local admin cache
  useEffect(() => {
    const loadProducts = () => {
      setIsLoading(true);
      let localProds: any[] = [];
      try {
        const storedCustom = localStorage.getItem('ods_custom_products');
        if (storedCustom) {
          const parsed = JSON.parse(storedCustom);
          if (Array.isArray(parsed)) localProds.push(...parsed);
        }
      } catch (e) {}

      fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          const apiProds = data.products && Array.isArray(data.products) ? data.products : [];
          const combined = [...apiProds];

          localProds.forEach((lp) => {
            const idx = combined.findIndex((cp) => cp.id === lp.id || cp.slug === lp.slug || cp.name.toLowerCase() === lp.name.toLowerCase());
            if (idx >= 0) {
              combined[idx] = { ...combined[idx], ...lp, coverImage: lp.coverImage || combined[idx].coverImage };
            } else {
              combined.unshift(lp);
            }
          });

          setLiveProducts(combined);
        })
        .catch((err) => console.error('Lỗi khi tải sản phẩm:', err))
        .finally(() => setIsLoading(false));
    };

    loadProducts();

    window.addEventListener('storage', loadProducts);
    window.addEventListener('ods_products_updated', loadProducts);

    // Load recently viewed
    try {
      const stored = localStorage.getItem('ods_recently_viewed');
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      setRecentlyViewed([]);
    }

    return () => {
      window.removeEventListener('storage', loadProducts);
      window.removeEventListener('ods_products_updated', loadProducts);
    };
  }, []);

  // Match valid recently viewed products
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

  // Current category info for 1-row header
  const currentCategoryInfo = useMemo(() => {
    const key = selectedCategory.toUpperCase();
    return CATEGORY_DEFINITIONS[key] || {
      title: selectedCategory.replace(/_/g, ' '),
      iconName: 'Grid',
    };
  }, [selectedCategory]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    // Reset specific sub-filters when switching category
    setSelectedRam('ALL');
    setSelectedSsd('ALL');
    setSelectedCpuBrand('ALL');
    setSelectedGpuBrand('ALL');
    setSelectedRefreshRate('ALL');

    if (catId === 'ALL') {
      router.push('/products');
    } else {
      router.push(`/products?category=${catId}`);
    }
  };

  // Reset all filters
  const handleResetAllFilters = () => {
    setSelectedPriceRange('ALL');
    setSelectedBrand('ALL');
    setSelectedRam('ALL');
    setSelectedSsd('ALL');
    setSelectedCpuBrand('ALL');
    setSelectedGpuBrand('ALL');
    setSelectedRefreshRate('ALL');
    setActiveFilter('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters = useMemo(() => {
    return (
      selectedPriceRange !== 'ALL' ||
      selectedBrand !== 'ALL' ||
      selectedRam !== 'ALL' ||
      selectedSsd !== 'ALL' ||
      selectedCpuBrand !== 'ALL' ||
      selectedGpuBrand !== 'ALL' ||
      selectedRefreshRate !== 'ALL' ||
      searchQuery.trim() !== ''
    );
  }, [selectedPriceRange, selectedBrand, selectedRam, selectedSsd, selectedCpuBrand, selectedGpuBrand, selectedRefreshRate, searchQuery]);

  // Available brands in the current products list
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    liveProducts.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand.trim());
    });
    return Array.from(brandsSet).slice(0, 8);
  }, [liveProducts]);

  // Filter products based on active category & all sidebar criteria
  const filteredProducts = useMemo(() => {
    let list = liveProducts;

    // 1. Filter by Quick Nav Tabs
    if (activeFilter === 'recently_viewed') {
      return validRecentlyViewed;
    }
    if (activeFilter === 'best_sellers') {
      list = list.filter((p) => p.isFeaturedDeal || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes('hot') || t.toLowerCase().includes('bán chạy'))));
    }
    if (activeFilter === 'discounts') {
      list = list.filter((p) => (p.discountPrice && p.discountPrice < p.price) || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes('giảm giá'))));
    }

    // 2. Filter by Category
    if (selectedCategory !== 'ALL') {
      const upperCat = selectedCategory.toUpperCase();
      list = list.filter((p) => {
        const pCats = Array.isArray(p.category) 
          ? p.category.map((c: any) => String(c).toUpperCase()) 
          : [String(p.category).toUpperCase()];

        if (upperCat === 'CORE_PARTS') {
          return pCats.some((c) => ['CORE_PARTS', 'CPU', 'VGA', 'MAINBOARD', 'RAM', 'PSU'].includes(c));
        }

        if (upperCat === 'CASE_COOLING') {
          return pCats.some((c) => ['CASE', 'PSU', 'COOLING', 'CASE_COOLING'].includes(c));
        }

        return pCats.some((c) => c === upperCat);
      });
    }

    // 3. Filter by Price Range
    if (selectedPriceRange !== 'ALL') {
      list = list.filter((p) => {
        const price = p.discountPrice ?? p.price;
        if (selectedPriceRange === 'UNDER_10M') return price < 10000000;
        if (selectedPriceRange === '10M_20M') return price >= 10000000 && price <= 20000000;
        if (selectedPriceRange === '20M_30M') return price >= 20000000 && price <= 30000000;
        if (selectedPriceRange === 'ABOVE_30M') return price > 30000000;
        return true;
      });
    }

    // 4. Filter by Brand
    if (selectedBrand !== 'ALL') {
      list = list.filter((p) => (p.brand || '').toLowerCase() === selectedBrand.toLowerCase());
    }

    // Helper text search in product metadata
    const matchText = (p: ProductProps, query: string) => {
      const q = query.toLowerCase();
      const n = (p.name || '').toLowerCase();
      const d = (p.description || '').toLowerCase();
      const b = (p.brand || '').toLowerCase();
      const s = p.specs ? Object.values(p.specs).join(' ').toLowerCase() : '';
      return n.includes(q) || d.includes(q) || b.includes(q) || s.includes(q);
    };

    // 5. Filter by RAM
    if (selectedRam !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedRam));
    }

    // 6. Filter by SSD
    if (selectedSsd !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedSsd));
    }

    // 7. Filter by CPU Brand/Model
    if (selectedCpuBrand !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedCpuBrand));
    }

    // 8. Filter by GPU Brand/Model
    if (selectedGpuBrand !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedGpuBrand));
    }

    // 9. Filter by Refresh Rate
    if (selectedRefreshRate !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedRefreshRate));
    }

    // 10. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => 
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
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
  }, [
    liveProducts, activeFilter, selectedCategory, selectedPriceRange, 
    selectedBrand, selectedRam, selectedSsd, selectedCpuBrand, 
    selectedGpuBrand, selectedRefreshRate, searchQuery, sortBy, validRecentlyViewed
  ]);

  // Is Laptop or Gaming Laptop
  const isLaptopCategory = selectedCategory === 'LAPTOP' || selectedCategory === 'LAPTOP_GAMING';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-300">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ─── 1. SINGLE-ROW HEADER (ĐÚNG 1 HÀNG NHƯ YÊU CẦU CỦA BẠN) ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/" className="text-xs font-bold text-slate-400 hover:text-[#0284c7] transition-colors">
              Trang Chủ
            </Link>
            <span className="text-slate-300 dark:text-slate-700 text-xs">/</span>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-[#0284c7]">
                <CategoryIcon name={currentCategoryInfo.iconName} className="w-4 h-4" />
              </div>
              <h1 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white uppercase tracking-wide">
                {currentCategoryInfo.title}
              </h1>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                ({filteredProducts.length} sản phẩm)
              </span>
            </div>
          </div>

          {/* Quick Search & Sort on Right */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Mobile Filter Trigger Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0284c7] text-white text-xs font-bold cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Bộ Lọc</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              )}
            </button>

            {/* Search Box */}
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm linh kiện, laptop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-9 pr-7 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:outline-none transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 focus:border-[#0284c7] focus:outline-none cursor-pointer shadow-xs"
              >
                <option value="FEATURED">Nổi Bật</option>
                <option value="PRICE_ASC">Giá Tăng Dần</option>
                <option value="PRICE_DESC">Giá Giảm Dần</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── 2. MAIN 2-COLUMN LAYOUT: LEFT SIDEBAR FILTERS + RIGHT PRODUCTS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ──── LEFT COLUMN: SIDEBAR FILTERS (COL-SPAN-3) ──── */}
          <aside className={`lg:col-span-3 space-y-5 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-5">
              
              {/* Sidebar Header & Clear Filters Button */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-heading text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>BỘ LỌC TÌM KIẾM</span>
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetAllFilters}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Thiết lập lại</span>
                  </button>
                )}
              </div>

              {/* 1. DANH MỤC SẢN PHẨM (CATEGORY LIST) */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                  Danh Mục Sản Phẩm
                </span>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                  {SIDEBAR_CATEGORIES.map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = selectedCategory.toUpperCase() === cat.id.toUpperCase();
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0284c7] text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <IconComp size={15} className={`shrink-0 ${isSelected ? 'text-white' : 'text-[#0284c7]'}`} />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. KHOẢNG GIÁ (PRICE RANGE) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                  Khoảng Giá
                </span>
                <div className="space-y-1">
                  {PRICE_RANGES.map((pr) => {
                    const isSelected = selectedPriceRange === pr.id;
                    return (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => setSelectedPriceRange(pr.id)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{pr.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0284c7]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. THƯƠNG HIỆU / HÃNG (BRAND) */}
              {availableBrands.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                    Thương Hiệu
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableBrands.map((b) => {
                      const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBrand(isSelected ? 'ALL' : b)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. CONTEXTUAL FILTER: DUNG LƯỢNG RAM (CHO LAPTOP & PC) */}
              {(isLaptopCategory || selectedCategory === 'ALL' || selectedCategory === 'RAM') && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                    Dung Lượng RAM
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['8GB', '16GB', '32GB'].map((ram) => {
                      const isSelected = selectedRam === ram;
                      return (
                        <button
                          key={ram}
                          type="button"
                          onClick={() => setSelectedRam(isSelected ? 'ALL' : ram)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                            isSelected
                              ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                          }`}
                        >
                          {ram}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. CONTEXTUAL FILTER: Ổ CỨNG SSD (CHO LAPTOP & STORAGE) */}
              {(isLaptopCategory || selectedCategory === 'ALL' || selectedCategory === 'STORAGE') && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                    Ổ Cứng SSD
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['256GB', '512GB', '1TB'].map((ssd) => {
                      const isSelected = selectedSsd === ssd;
                      return (
                        <button
                          key={ssd}
                          type="button"
                          onClick={() => setSelectedSsd(isSelected ? 'ALL' : ssd)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                            isSelected
                              ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                          }`}
                        >
                          {ssd}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6. CONTEXTUAL FILTER: HÃNG CPU */}
              {(isLaptopCategory || selectedCategory === 'ALL' || selectedCategory === 'CPU') && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                    Dòng Chip CPU
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Core i5', 'Core i7', 'Core i9', 'Ryzen 5', 'Ryzen 7'].map((cpu) => {
                      const isSelected = selectedCpuBrand === cpu;
                      return (
                        <button
                          key={cpu}
                          type="button"
                          onClick={() => setSelectedCpuBrand(isSelected ? 'ALL' : cpu)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                          }`}
                        >
                          {cpu}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 7. CONTEXTUAL FILTER: HÃNG GPU / CARD ĐỒ HỌA */}
              {(isLaptopCategory || selectedCategory === 'ALL' || selectedCategory === 'VGA') && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                    Card Đồ Họa (GPU)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['RTX 4050', 'RTX 4060', 'RTX 4070', 'RTX 3050'].map((gpu) => {
                      const isSelected = selectedGpuBrand === gpu;
                      return (
                        <button
                          key={gpu}
                          type="button"
                          onClick={() => setSelectedGpuBrand(isSelected ? 'ALL' : gpu)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                          }`}
                        >
                          {gpu}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 8. CONTEXTUAL FILTER: TẦN SỐ QUÉT MÀN HÌNH (CHO LAPTOP & MONITOR) */}
              {(isLaptopCategory || selectedCategory === 'ALL' || selectedCategory === 'MONITOR') && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                    Tần Số Quét
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['60Hz', '144Hz', '165Hz', '240Hz'].map((hz) => {
                      const isSelected = selectedRefreshRate === hz;
                      return (
                        <button
                          key={hz}
                          type="button"
                          onClick={() => setSelectedRefreshRate(isSelected ? 'ALL' : hz)}
                          className={`py-1.5 rounded-lg text-[11px] font-bold transition-all border text-center cursor-pointer ${
                            isSelected
                              ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                          }`}
                        >
                          {hz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </aside>

          {/* ──── RIGHT COLUMN: ACTIVE FILTER CHIPS & PRODUCT GRID (COL-SPAN-9) ──── */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Active Filters Tag Pills (if any) */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Đang lọc theo:</span>

                {selectedPriceRange !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>{PRICE_RANGES.find(p => p.id === selectedPriceRange)?.label}</span>
                    <button onClick={() => setSelectedPriceRange('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedBrand !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Hãng: {selectedBrand}</span>
                    <button onClick={() => setSelectedBrand('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedRam !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>RAM: {selectedRam}</span>
                    <button onClick={() => setSelectedRam('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedSsd !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>SSD: {selectedSsd}</span>
                    <button onClick={() => setSelectedSsd('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedCpuBrand !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>CPU: {selectedCpuBrand}</span>
                    <button onClick={() => setSelectedCpuBrand('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedGpuBrand !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>GPU: {selectedGpuBrand}</span>
                    <button onClick={() => setSelectedGpuBrand('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedRefreshRate !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Màn hình: {selectedRefreshRate}</span>
                    <button onClick={() => setSelectedRefreshRate('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                <button
                  onClick={handleResetAllFilters}
                  className="text-xs font-bold text-rose-600 hover:underline ml-auto"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* PRODUCT GRID */}
            {isLoading ? (
              <div className="py-24 text-center text-xs font-bold text-slate-400">
                Đang tải kho sản phẩm DRX Hardware...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                <div className="h-16 w-16 rounded-full bg-sky-50 dark:bg-slate-800 text-[#0284c7] flex items-center justify-center mx-auto">
                  <Grid className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    Không tìm thấy sản phẩm phù hợp
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Vui lòng thử điều chỉnh lại bộ lọc giá, RAM hoặc dung lượng ổ cứng để xem thêm sản phẩm.
                  </p>
                </div>
                <button
                  onClick={handleResetAllFilters}
                  className="px-5 py-2.5 rounded-2xl bg-[#0284c7] text-white text-xs font-heading font-black uppercase hover:bg-[#0369a1] transition-all shadow-sm cursor-pointer"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <CartProvider>
      <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-slate-400">Loading DRX Hardware catalog...</div>}>
        <ProductsCatalogContent />
      </Suspense>
    </CartProvider>
  );
}
