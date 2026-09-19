'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { Footer } from '@/components/Footer';
import { 
  Search, SlidersHorizontal, Flame, Clock, Tag, ArrowLeft, Grid, 
  X, RotateCcw, Check, Filter, ChevronRight
} from 'lucide-react';
import { 
  IconLaptop, IconLaptopGaming, IconCpu, IconMainboard, 
  IconVga, IconRam, IconStorage, IconCase, IconHeadset, 
  IconMonitor, IconKeyboard, IconMouse 
} from '@/components/icons/HardwareIcons';
import { INITIAL_PRODUCTS } from '@/lib/hardware-data';
import { supabase } from '@/lib/supabase';

const INITIAL_CATALOG_PRODUCTS: ProductProps[] = INITIAL_PRODUCTS.map(p => ({
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

// Category definitions with Title Case
const CATEGORY_DEFINITIONS: Record<string, { title: string; iconName: string }> = {
  ALL: {
    title: 'Tất Cả Sản Phẩm & Linh Kiện',
    iconName: 'Grid',
  },
  CPU: {
    title: 'Bộ Vi Xử Lý (CPU)',
    iconName: 'IconCpu',
  },
  VGA: {
    title: 'Card Màn Hình (VGA)',
    iconName: 'IconVga',
  },
  MAINBOARD: {
    title: 'Bo Mạch Chủ (Mainboard)',
    iconName: 'IconMainboard',
  },
  RAM: {
    title: 'Bộ Nhớ Trong (RAM)',
    iconName: 'IconRam',
  },
  STORAGE: {
    title: 'Ổ Cứng Lưu Trữ (SSD / HDD)',
    iconName: 'IconStorage',
  },
  PSU: {
    title: 'Nguồn Máy Tính (PSU)',
    iconName: 'IconCase',
  },
  CASE: {
    title: 'Vỏ Case Máy Tính',
    iconName: 'IconCase',
  },
  COOLING: {
    title: 'Tản Nhiệt Nước / Khí CPU',
    iconName: 'IconCase',
  },
  MONITOR: {
    title: 'Màn Hình Máy Tính',
    iconName: 'IconMonitor',
  },
  KEYBOARD: {
    title: 'Bàn Phím & Chuột Gaming',
    iconName: 'IconKeyboard',
  },
  HEADSET: {
    title: 'Tai Nghe Gaming & Âm Thanh',
    iconName: 'IconHeadset',
  },
  GEAR: {
    title: 'Gaming Gear Tổng Hợp',
    iconName: 'IconKeyboard',
  },
  LAPTOP: {
    title: 'Laptop - Học Tập và Làm Việc',
    iconName: 'IconLaptop',
  },
  LAPTOP_GAMING: {
    title: 'Laptop Gaming & Đồ Họa',
    iconName: 'IconLaptopGaming',
  },
  PREBUILT_PC: {
    title: 'PC Gắn Sẵn / PC Đồng Bộ DRX',
    iconName: 'IconCpu',
  },
  CORE_PARTS: {
    title: 'Linh Kiện Core - CPU, Main, VGA & RAM',
    iconName: 'IconCpu',
  },
  CASE_COOLING: {
    title: 'Vỏ Case, Nguồn Máy Tính & Tản Nhiệt',
    iconName: 'IconCase',
  },
};

const ALL_CATEGORIES_NAV = [
  { id: 'ALL', name: 'Tất Cả', icon: 'Grid' },
  { id: 'CPU', name: 'CPU Vi Xử Lý', icon: 'IconCpu' },
  { id: 'VGA', name: 'Card Màn Hình (VGA)', icon: 'IconVga' },
  { id: 'MAINBOARD', name: 'Mainboard', icon: 'IconMainboard' },
  { id: 'RAM', name: 'RAM', icon: 'IconRam' },
  { id: 'STORAGE', name: 'Ổ Cứng SSD/HDD', icon: 'IconStorage' },
  { id: 'PSU', name: 'Nguồn (PSU)', icon: 'IconCase' },
  { id: 'CASE', name: 'Vỏ Case PC', icon: 'IconCase' },
  { id: 'COOLING', name: 'Tản Nhiệt', icon: 'IconCase' },
  { id: 'MONITOR', name: 'Màn Hình', icon: 'IconMonitor' },
  { id: 'KEYBOARD', name: 'Bàn Phím', icon: 'IconKeyboard' },
  { id: 'HEADSET', name: 'Tai Nghe', icon: 'IconHeadset' },
  { id: 'GEAR', name: 'Gaming Gear', icon: 'IconKeyboard' },
  { id: 'LAPTOP', name: 'Laptop', icon: 'IconLaptop' },
  { id: 'LAPTOP_GAMING', name: 'Laptop Gaming', icon: 'IconLaptopGaming' },
  { id: 'PREBUILT_PC', name: 'PC Lắp Sẵn', icon: 'IconCpu' },
];

const PRICE_PRESETS = [
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
  const [customMinInput, setCustomMinInput] = useState<string>('');
  const [customMaxInput, setCustomMaxInput] = useState<string>('');
  const [appliedMinPrice, setAppliedMinPrice] = useState<number | null>(null);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<number | null>(null);

  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedUsage, setSelectedUsage] = useState<string>('ALL');
  const [selectedRam, setSelectedRam] = useState<string>('ALL');
  const [selectedSsd, setSelectedSsd] = useState<string>('ALL');
  const [selectedCpuBrand, setSelectedCpuBrand] = useState<string>('ALL');
  const [selectedGpuBrand, setSelectedGpuBrand] = useState<string>('ALL');
  const [selectedRefreshRate, setSelectedRefreshRate] = useState<string>('ALL');
  const [selectedScreenSize, setSelectedScreenSize] = useState<string>('ALL');
  const [selectedResolution, setSelectedResolution] = useState<string>('ALL');
  const [selectedSocket, setSelectedSocket] = useState<string>('ALL');
  const [selectedVram, setSelectedVram] = useState<string>('ALL');
  const [selectedWattage, setSelectedWattage] = useState<string>('ALL');

  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [liveProducts, setLiveProducts] = useState<ProductProps[]>(INITIAL_CATALOG_PRODUCTS);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state with query parameters
  useEffect(() => {
    setActiveFilter(searchParams.get('filter') || 'ALL');
    setSelectedCategory(searchParams.get('category') || 'ALL');
    setSelectedPlatform(searchParams.get('platform') || 'ALL');
  }, [searchParams]);

  // Load products directly from Supabase PostgreSQL Database API
  useEffect(() => {
    const loadProducts = () => {
      fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          const apiProds = data.products && Array.isArray(data.products) ? data.products : [];
          if (apiProds.length > 0) {
            setLiveProducts(apiProds);
          }
        })
        .catch((err) => console.error('Lỗi khi tải sản phẩm từ database:', err));
    };

    loadProducts();

    // Supabase Realtime updates
    const channel = supabase
      .channel('public_products_catalog_realtime')
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
          loadProducts();
        }
      })
      .subscribe();

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
      supabase.removeChannel(channel);
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

  // Current category info with Title Case
  const currentCategoryInfo = useMemo(() => {
    const key = selectedCategory.toUpperCase();
    return CATEGORY_DEFINITIONS[key] || {
      title: selectedCategory.replace(/_/g, ' '),
      iconName: 'Grid',
    };
  }, [selectedCategory]);

  // Handle Preset Price Selection
  const handleSelectPricePreset = (prId: string) => {
    setSelectedPriceRange(prId);
    setAppliedMinPrice(null);
    setAppliedMaxPrice(null);
    setCustomMinInput('');
    setCustomMaxInput('');
  };

  // Handle Custom Price Range Submit
  const handleApplyCustomPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const minVal = customMinInput.replace(/\D/g, '');
    const maxVal = customMaxInput.replace(/\D/g, '');
    const minNum = minVal ? parseInt(minVal, 10) : null;
    const maxNum = maxVal ? parseInt(maxVal, 10) : null;

    if (minNum !== null || maxNum !== null) {
      setSelectedPriceRange('CUSTOM');
      setAppliedMinPrice(minNum);
      setAppliedMaxPrice(maxNum);
    } else {
      setSelectedPriceRange('ALL');
      setAppliedMinPrice(null);
      setAppliedMaxPrice(null);
    }
  };

  // Format number input with thousand separators
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setCustomMinInput('');
      return;
    }
    const num = parseInt(raw, 10);
    setCustomMinInput(new Intl.NumberFormat('vi-VN').format(num));
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setCustomMaxInput('');
      return;
    }
    const num = parseInt(raw, 10);
    setCustomMaxInput(new Intl.NumberFormat('vi-VN').format(num));
  };

  // Reset all filters
  const handleResetAllFilters = () => {
    setSelectedPriceRange('ALL');
    setCustomMinInput('');
    setCustomMaxInput('');
    setAppliedMinPrice(null);
    setAppliedMaxPrice(null);
    setSelectedBrand('ALL');
    setSelectedUsage('ALL');
    setSelectedRam('ALL');
    setSelectedSsd('ALL');
    setSelectedCpuBrand('ALL');
    setSelectedGpuBrand('ALL');
    setSelectedRefreshRate('ALL');
    setSelectedScreenSize('ALL');
    setSelectedResolution('ALL');
    setSelectedSocket('ALL');
    setSelectedVram('ALL');
    setSelectedWattage('ALL');
    setActiveFilter('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters = useMemo(() => {
    return (
      selectedPriceRange !== 'ALL' ||
      appliedMinPrice !== null ||
      appliedMaxPrice !== null ||
      selectedBrand !== 'ALL' ||
      selectedUsage !== 'ALL' ||
      selectedRam !== 'ALL' ||
      selectedSsd !== 'ALL' ||
      selectedCpuBrand !== 'ALL' ||
      selectedGpuBrand !== 'ALL' ||
      selectedRefreshRate !== 'ALL' ||
      selectedScreenSize !== 'ALL' ||
      selectedResolution !== 'ALL' ||
      selectedSocket !== 'ALL' ||
      selectedVram !== 'ALL' ||
      selectedWattage !== 'ALL' ||
      searchQuery.trim() !== ''
    );
  }, [
    selectedPriceRange, appliedMinPrice, appliedMaxPrice, selectedBrand, 
    selectedUsage, selectedRam, selectedSsd, selectedCpuBrand, selectedGpuBrand, 
    selectedRefreshRate, selectedScreenSize, selectedResolution, selectedSocket, 
    selectedVram, selectedWattage, searchQuery
  ]);

  // Available brands in the category
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    liveProducts.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand.trim());
    });
    return Array.from(brandsSet).slice(0, 10);
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
          return pCats.some((c) => ['CORE_PARTS', 'CPU', 'VGA', 'MAINBOARD', 'RAM'].includes(c));
        }

        if (upperCat === 'CASE_COOLING') {
          return pCats.some((c) => ['CASE', 'PSU', 'COOLING', 'CASE_COOLING'].includes(c));
        }

        if (upperCat === 'GEAR') {
          return pCats.some((c) => ['GEAR', 'KEYBOARD', 'HEADSET', 'MOUSE'].includes(c));
        }

        return pCats.some((c) => c === upperCat);
      });
    }

    // 3. Filter by Price Range (Preset or Custom)
    if (selectedPriceRange === 'CUSTOM') {
      list = list.filter((p) => {
        const price = p.discountPrice ?? p.price;
        if (appliedMinPrice !== null && price < appliedMinPrice) return false;
        if (appliedMaxPrice !== null && price > appliedMaxPrice) return false;
        return true;
      });
    } else if (selectedPriceRange !== 'ALL') {
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
      list = list.filter((p) => (p.brand || '').toLowerCase().includes(selectedBrand.toLowerCase()));
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

    // 5. Contextual: Nhu cầu sử dụng
    if (selectedUsage !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedUsage));
    }

    // 6. Contextual: RAM
    if (selectedRam !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedRam));
    }

    // 7. Contextual: SSD
    if (selectedSsd !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedSsd));
    }

    // 8. Contextual: CPU
    if (selectedCpuBrand !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedCpuBrand));
    }

    // 9. Contextual: GPU
    if (selectedGpuBrand !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedGpuBrand));
    }

    // 10. Contextual: Tần số quét
    if (selectedRefreshRate !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedRefreshRate));
    }

    // 11. Contextual: Kích thước màn hình
    if (selectedScreenSize !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedScreenSize));
    }

    // 12. Contextual: Độ phân giải
    if (selectedResolution !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedResolution));
    }

    // 13. Contextual: Socket
    if (selectedSocket !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedSocket) || (p.socket && p.socket.toLowerCase().includes(selectedSocket.toLowerCase())));
    }

    // 14. Contextual: VRAM
    if (selectedVram !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedVram));
    }

    // 15. Contextual: Công suất nguồn
    if (selectedWattage !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedWattage) || (p.wattage && String(p.wattage).includes(selectedWattage)));
    }

    // 16. Search Query
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
    appliedMinPrice, appliedMaxPrice, selectedBrand, selectedUsage, 
    selectedRam, selectedSsd, selectedCpuBrand, selectedGpuBrand, 
    selectedRefreshRate, selectedScreenSize, selectedResolution, 
    selectedSocket, selectedVram, selectedWattage, searchQuery, sortBy, validRecentlyViewed
  ]);

  // Category types
  const upperCat = selectedCategory.toUpperCase();
  const isLaptop = upperCat === 'LAPTOP' || upperCat === 'LAPTOP_GAMING';
  const isCpu = upperCat === 'CPU';
  const isVga = upperCat === 'VGA';
  const isMain = upperCat === 'MAINBOARD';
  const isRam = upperCat === 'RAM';
  const isStorage = upperCat === 'STORAGE';
  const isMonitor = upperCat === 'MONITOR';
  const isCaseCooling = upperCat === 'CASE_COOLING' || upperCat === 'PSU' || upperCat === 'CASE' || upperCat === 'COOLING';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-300">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ─── 1. SINGLE-ROW HEADER (1 HÀNG GỌN GÀNG) ─── */}
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
            {/* Mobile Filter Button */}
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
                placeholder="Tìm sản phẩm..."
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
              
              {/* Sidebar Header: Title Case - "Bộ Lọc Tìm Kiếm - [Tên Danh Mục]" */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-heading text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Bộ Lọc {currentCategoryInfo.title}</span>
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetAllFilters}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Thiết Lập Lại</span>
                  </button>
                )}
              </div>

              {/* 1. KHOẢNG GIÁ (PRICE RANGE PRESETS + CUSTOM INPUT) */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Khoảng Giá
                </span>

                {/* Preset Chips */}
                <div className="space-y-1">
                  {PRICE_PRESETS.map((pr) => {
                    const isSelected = selectedPriceRange === pr.id;
                    return (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => handleSelectPricePreset(pr.id)}
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

                {/* Hoặc nhập khoảng giá phù hợp với bạn */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                    Hoặc nhập khoảng giá phù hợp với bạn:
                  </span>
                  <form onSubmit={handleApplyCustomPrice} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Từ (đ)"
                          value={customMinInput}
                          onChange={handleMinInputChange}
                          className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                        />
                      </div>
                      <span className="text-slate-400 text-xs">-</span>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Đến (đ)"
                          value={customMaxInput}
                          onChange={handleMaxInputChange}
                          className="w-full text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      Áp Dụng Khoảng Giá
                    </button>
                  </form>
                </div>
              </div>

              {/* 2. THƯƠNG HIỆU / HÃNG (BRAND) */}
              {availableBrands.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
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
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
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

              {/* 3. LOGIC LỌC TƯƠNG ỨNG TỪNG DANH MỤC */}
              
              {/* ─── A. CHO LAPTOP / LAPTOP GAMING ─── */}
              {isLaptop && (
                <>
                  {/* Nhu Cầu Sử Dụng */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Nhu Cầu Sử Dụng
                    </span>
                    <div className="space-y-1">
                      {['Học Tập - Văn Phòng', 'Đồ Họa - Kỹ Thuật', 'Gaming Hiệu Năng Cao', 'Mỏng Nhẹ Doanh Nhân'].map((u) => {
                        const isSelected = selectedUsage === u;
                        return (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setSelectedUsage(isSelected ? 'ALL' : u)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300 font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{u}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#0284c7]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dòng Chip CPU */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
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
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
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

                  {/* Dung Lượng RAM */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
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

                  {/* Dung Lượng Ổ Cứng SSD */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
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

                  {/* Card Đồ Họa (GPU) */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
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
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
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

                  {/* Tần Số Quét Màn Hình */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Tần Số Quét Màn Hình
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['60Hz', '144Hz', '165Hz', '240Hz'].map((hz) => {
                        const isSelected = selectedRefreshRate === hz;
                        return (
                          <button
                            key={hz}
                            type="button"
                            onClick={() => setSelectedRefreshRate(isSelected ? 'ALL' : hz)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
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
                </>
              )}

              {/* ─── B. CHO BỘ VI XỬ LÝ (CPU) ─── */}
              {isCpu && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Dòng Chip CPU
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Core i5', 'Core i7', 'Core i9', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9'].map((c) => {
                        const isSelected = selectedCpuBrand === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSelectedCpuBrand(isSelected ? 'ALL' : c)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Chuẩn Socket
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['LGA1700', 'AM5', 'AM4'].map((sock) => {
                        const isSelected = selectedSocket === sock;
                        return (
                          <button
                            key={sock}
                            type="button"
                            onClick={() => setSelectedSocket(isSelected ? 'ALL' : sock)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {sock}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ─── C. CHO CARD MÀN HÌNH (VGA) ─── */}
              {isVga && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Dòng Card GPU
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['RTX 4060', 'RTX 4070', 'RTX 4080', 'RTX 4090', 'RX 7000'].map((g) => {
                        const isSelected = selectedGpuBrand === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setSelectedGpuBrand(isSelected ? 'ALL' : g)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Dung Lượng VRAM
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['8GB', '12GB', '16GB'].map((v) => {
                        const isSelected = selectedVram === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setSelectedVram(isSelected ? 'ALL' : v)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ─── D. CHO BO MẠCH CHỦ (MAINBOARD) ─── */}
              {isMain && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Chuẩn Socket
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['LGA1700', 'AM5', 'AM4'].map((s) => {
                        const isSelected = selectedSocket === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSocket(isSelected ? 'ALL' : s)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Hỗ Trợ RAM
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['DDR4', 'DDR5'].map((r) => {
                        const isSelected = selectedRam === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setSelectedRam(isSelected ? 'ALL' : r)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ─── E. CHO BỘ NHỚ TRONG (RAM) ─── */}
              {isRam && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Dung Lượng RAM
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['8GB', '16GB', '32GB'].map((r) => {
                        const isSelected = selectedRam === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setSelectedRam(isSelected ? 'ALL' : r)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ─── F. CHO Ổ CỨNG SSD ─── */}
              {isStorage && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Dung Lượng Ổ Cứng
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['256GB', '512GB', '1TB'].map((s) => {
                        const isSelected = selectedSsd === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSsd(isSelected ? 'ALL' : s)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ─── G. CHO MÀN HÌNH MÁY TÍNH ─── */}
              {isMonitor && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Tần Số Quét
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['100Hz', '144Hz', '165Hz', '240Hz'].map((hz) => {
                        const isSelected = selectedRefreshRate === hz;
                        return (
                          <button
                            key={hz}
                            type="button"
                            onClick={() => setSelectedRefreshRate(isSelected ? 'ALL' : hz)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {hz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Kích Thước Màn Hình
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['24 inch', '27 inch', '32 inch'].map((sz) => {
                        const isSelected = selectedScreenSize === sz;
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedScreenSize(isSelected ? 'ALL' : sz)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ─── H. CHO VỎ CASE & NGUỒN & TẢN NHIỆT ─── */}
              {isCaseCooling && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Công Suất Nguồn
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['650W', '750W', '850W'].map((w) => {
                        const isSelected = selectedWattage === w;
                        return (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setSelectedWattage(isSelected ? 'ALL' : w)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {w}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ─── I. NẾU ĐANG Ở 'TẤT CẢ SẢN PHẨM' (ALL) ─── */}
              {upperCat === 'ALL' && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
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
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {ram}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
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
                                ? 'bg-[#0284c7] text-white border-[#0284c7]'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {ssd}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

            </div>
          </aside>

          {/* ──── RIGHT COLUMN: ACTIVE FILTER CHIPS & PRODUCT GRID (COL-SPAN-9) ──── */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Active Filters Tag Pills (if any) */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Đang lọc theo:</span>

                {/* Preset Price Pill */}
                {selectedPriceRange !== 'ALL' && selectedPriceRange !== 'CUSTOM' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>{PRICE_PRESETS.find(p => p.id === selectedPriceRange)?.label}</span>
                    <button onClick={() => setSelectedPriceRange('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {/* Custom Price Pill */}
                {selectedPriceRange === 'CUSTOM' && (appliedMinPrice !== null || appliedMaxPrice !== null) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>
                      Giá: {appliedMinPrice ? `${new Intl.NumberFormat('vi-VN').format(appliedMinPrice)} đ` : '0 đ'} - {appliedMaxPrice ? `${new Intl.NumberFormat('vi-VN').format(appliedMaxPrice)} đ` : 'Vô cực'}
                    </span>
                    <button onClick={() => { setSelectedPriceRange('ALL'); setAppliedMinPrice(null); setAppliedMaxPrice(null); setCustomMinInput(''); setCustomMaxInput(''); }} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedBrand !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Hãng: {selectedBrand}</span>
                    <button onClick={() => setSelectedBrand('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedUsage !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Nhu cầu: {selectedUsage}</span>
                    <button onClick={() => setSelectedUsage('ALL')} className="hover:text-rose-500">✕</button>
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
                    <span>Tần số: {selectedRefreshRate}</span>
                    <button onClick={() => setSelectedRefreshRate('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedScreenSize !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Kích thước: {selectedScreenSize}</span>
                    <button onClick={() => setSelectedScreenSize('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedSocket !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Socket: {selectedSocket}</span>
                    <button onClick={() => setSelectedSocket('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedVram !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>VRAM: {selectedVram}</span>
                    <button onClick={() => setSelectedVram('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedWattage !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Công suất: {selectedWattage}</span>
                    <button onClick={() => setSelectedWattage('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                <button
                  onClick={handleResetAllFilters}
                  className="text-xs font-bold text-rose-600 hover:underline ml-auto cursor-pointer"
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
                    Vui lòng thử điều chỉnh lại khoảng giá hoặc xóa bớt tiêu chí lọc để xem thêm sản phẩm.
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
    <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-slate-400">Loading DRX Hardware catalog...</div>}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
