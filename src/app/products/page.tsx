'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { 
  Search, SlidersHorizontal, Flame, Clock, Tag, ArrowLeft, Grid, Layers
} from 'lucide-react';
import { 
  IconLaptop, IconLaptopGaming, IconCpu, IconCase, 
  IconHeadset, IconMonitor, IconKeyboard, IconStorage 
} from '@/components/icons/HardwareIcons';

const CATEGORY_CONFIG: Record<string, { title: string; subtitle: string; iconName: string }> = {
  ALL: {
    title: 'Toàn Bộ Kho Linh Kiện & Laptop DRX',
    subtitle: 'Khám phá hàng ngàn linh kiện máy tính, Laptop, màn hình & phụ kiện gaming chính hãng bảo hành 36T',
    iconName: 'Grid',
  },
  LAPTOP: {
    title: 'Laptop Văn Phòng & Đồ Họa Cao Cấp',
    subtitle: 'Laptop mỏng nhẹ, hiệu năng cao, pin lâu dành cho doanh nhân, kỹ sư & sáng tạo nội dung',
    iconName: 'Laptop',
  },
  LAPTOP_GAMING: {
    title: 'Laptop Gaming Cấu Hình Khủng',
    subtitle: 'Laptop chơi game mạnh mẽ, card đồ họa Nvidia RTX 40-Series, màn hình 144Hz - 240Hz sắc nét',
    iconName: 'Gamepad2',
  },
  CORE_PARTS: {
    title: 'Linh Kiện Core (CPU, VGA, Mainboard & RAM)',
    subtitle: 'Bo mạch chủ, Vi xử lý Intel Core / AMD Ryzen, Card màn hình RTX, RAM DDR5 chính hãng 1 đổi 1',
    iconName: 'Cpu',
  },
  CASE_COOLING: {
    title: 'Vỏ Case & Tản Nhiệt Nước AIO RGB',
    subtitle: 'Vỏ máy tính kính cường lực Panoramic & Tản nhiệt nước AIO 240mm/360mm giải nhiệt cực tốt',
    iconName: 'Box',
  },
  HEADSET: {
    title: 'Tai Nghe Gaming & Âm Thanh Chuyên Nghiệp',
    subtitle: 'Tai nghe gaming 7.1 vòm, tai nghe không dây Wireless độ trễ siêu thấp từ HyperX, Logitech, Corsair',
    iconName: 'Headphones',
  },
  MONITOR: {
    title: 'Màn Hình Chơi Game & Đồ Họa 4K Chuẩn Màu',
    subtitle: 'Màn hình tần số quét cao 144Hz - 360Hz, tấm nền Fast-IPS/OLED màu chuẩn đồ họa từ ASUS ROG, LG, Samsung',
    iconName: 'Monitor',
  },
  KEYBOARD: {
    title: 'Bàn Phím Cơ Custom & Chuột Gaming',
    subtitle: 'Bàn phím cơ Hotswap gõ êm mượt, Chuột chơi game siêu nhẹ 8KHz Polling Rate chuẩn eSports',
    iconName: 'Keyboard',
  },
  STORAGE: {
    title: 'Ổ Cứng SSD NVMe Siêu Tốc & HDD Dung Lượng Cao',
    subtitle: 'Ổ cứng SSD NVMe M.2 PCIe Gen4/Gen5 tốc độ đọc siêu tốc 7400MB/s từ Samsung, Kingston, WD Black',
    iconName: 'HardDrive',
  },
};

const CATEGORY_PILLS = [
  { id: 'ALL', label: 'Tất Cả', icon: Grid },
  { id: 'LAPTOP', label: 'Laptop', icon: IconLaptop },
  { id: 'LAPTOP_GAMING', label: 'Laptop Gaming', icon: IconLaptopGaming },
  { id: 'CORE_PARTS', label: 'Linh Kiện Core', icon: IconCpu },
  { id: 'CASE_COOLING', label: 'Case & Tản Nhiệt', icon: IconCase },
  { id: 'HEADSET', label: 'Tai Nghe Gaming', icon: IconHeadset },
  { id: 'MONITOR', label: 'Màn Hình', icon: IconMonitor },
  { id: 'KEYBOARD', label: 'Bàn Phím & Chuột', icon: IconKeyboard },
  { id: 'STORAGE', label: 'Ổ Cứng SSD', icon: IconStorage },
];

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case 'Laptop': return <IconLaptop className={className} />;
    case 'Gamepad2': return <IconLaptopGaming className={className} />;
    case 'Cpu': return <IconCpu className={className} />;
    case 'Box': return <IconCase className={className} />;
    case 'Headphones': return <IconHeadset className={className} />;
    case 'Monitor': return <IconMonitor className={className} />;
    case 'Keyboard': return <IconKeyboard className={className} />;
    case 'HardDrive': return <IconStorage className={className} />;
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

  const [liveProducts, setLiveProducts] = useState<ProductProps[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load products from database & local admin cache with real-time sync
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

  // Filter products based on active category & filters
  const filteredProducts = useMemo(() => {
    let list = liveProducts;

    // Filter by Header Quick Nav Filter
    if (activeFilter === 'recently_viewed') {
      return validRecentlyViewed;
    }

    if (activeFilter === 'best_sellers') {
      list = list.filter((p) => p.isFeaturedDeal || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes('hot') || t.toLowerCase().includes('bán chạy'))));
    }

    if (activeFilter === 'discounts') {
      list = list.filter((p) => (p.discountPrice && p.discountPrice < p.price) || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes('giảm giá'))));
    }

    // Filter by Category
    if (selectedCategory !== 'ALL') {
      const upperCat = selectedCategory.toUpperCase();
      list = list.filter((p) => {
        const pCats = Array.isArray(p.category) 
          ? p.category.map((c: any) => String(c).toUpperCase()) 
          : [String(p.category).toUpperCase()];

        if (upperCat === 'CORE_PARTS') {
          return pCats.some((c) => ['CORE_PARTS', 'CPU', 'VGA', 'MAINBOARD', 'RAM', 'PSU'].includes(c));
        }

        return pCats.some((c) => c === upperCat);
      });
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
  }, [liveProducts, activeFilter, selectedCategory, selectedPlatform, searchQuery, sortBy, validRecentlyViewed]);

  const currentCategoryInfo = useMemo(() => {
    const key = selectedCategory.toUpperCase();
    return CATEGORY_CONFIG[key] || {
      title: selectedCategory.replace(/_/g, ' '),
      subtitle: `Danh mục sản phẩm ${selectedCategory} chính hãng tại DRX Hardware`,
      iconName: 'Grid',
    };
  }, [selectedCategory]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'ALL') {
      router.push('/products');
    } else {
      router.push(`/products?category=${catId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased tech-grid-pattern transition-colors duration-300">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* BREADCRUMB */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0284c7] transition-colors">
            <ArrowLeft className="h-4 w-4 text-[#0284c7]" /> Trang Chủ DRX Hardware
          </Link>
          <span className="text-xs font-extrabold text-[#0284c7] bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 px-3.5 py-1.5 rounded-full shadow-2xs">
            {filteredProducts.length} Linh Kiện Chính Hãng
          </span>
        </div>

        {/* CATEGORY HERO BANNER CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 sm:p-8 mb-6 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-white to-blue-50/50 dark:from-slate-900 dark:via-[#071930] dark:to-slate-950 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0284c7]/5 dark:bg-[#0284c7]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-100 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-500/30 text-xs font-black text-[#0284c7] dark:text-sky-300 uppercase tracking-wider shadow-2xs">
                <CategoryIcon name={currentCategoryInfo.iconName} className="h-3.5 w-3.5 text-[#0284c7] dark:text-sky-400" />
                <span>DANH MỤC SẢN PHẨM DRX HARDWARE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight text-slate-900 dark:text-white uppercase">
                {currentCategoryInfo.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                {currentCategoryInfo.subtitle}
              </p>
            </div>

            {selectedCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => handleCategorySelect('ALL')}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-700 dark:text-slate-200 text-xs font-heading font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer shadow-2xs"
              >
                ✕ Xóa Bộ Lọc Danh Mục
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY NAV PILLS STRIP - MODERN SEGMENTED CAPSULE BAR */}
        <div className="mb-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-2 sm:p-2.5 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORY_PILLS.map((pill) => {
              const IconComp = pill.icon;
              const isActive = selectedCategory.toUpperCase() === pill.id.toUpperCase();
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleCategorySelect(pill.id)}
                  className={`group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/25 scale-[1.02]'
                      : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-[#0284c7] dark:text-sky-400 group-hover:scale-110'
                  }`}>
                    <IconComp className="h-3.5 w-3.5" />
                  </div>
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SEARCH & CONTROLS STRIP */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
          {/* QUICK FILTER BUTTONS */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Tất Cả Hàng
            </button>

            <button
              onClick={() => setActiveFilter('recently_viewed')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === 'recently_viewed'
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Vừa Xem ({validRecentlyViewed.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('best_sellers')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === 'best_sellers'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>Bán Chạy</span>
            </button>

            <button
              onClick={() => setActiveFilter('discounts')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === 'discounts'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Khuyến Mãi Hè</span>
            </button>
          </div>

          {/* SEARCH INPUT & SORT DROPDOWN */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm linh kiện, CPU, Laptop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 px-3.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:bg-white dark:focus:bg-slate-900 focus:outline-none cursor-pointer"
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
          <div className="py-24 text-center text-xs font-bold text-slate-400">
            Đang tải kho sản phẩm DRX Hardware...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <div className="h-16 w-16 rounded-full bg-sky-50 dark:bg-slate-800 text-[#0284c7] flex items-center justify-center mx-auto">
              <Layers className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Chưa có sản phẩm nào trong danh mục này</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Hãy thử chọn danh mục khác hoặc xóa bộ lọc tìm kiếm để khám phá kho hàng DRX Hardware.
              </p>
            </div>
            <button
              onClick={() => { setActiveFilter('ALL'); setSelectedCategory('ALL'); setSelectedPlatform('ALL'); setSearchQuery(''); router.push('/products'); }}
              className="px-5 py-2.5 rounded-2xl bg-[#0284c7] text-white text-xs font-heading font-black uppercase hover:bg-[#0369a1] transition-all shadow-sm cursor-pointer"
            >
              Xem Tất Cả Sản Phẩm
            </button>
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

export default function ProductsPage() {
  return (
    <CartProvider>
      <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-slate-400">Loading DRX Hardware catalog...</div>}>
        <ProductsCatalogContent />
      </Suspense>
    </CartProvider>
  );
}