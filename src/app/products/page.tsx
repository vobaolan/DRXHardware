'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { 
  Search, SlidersHorizontal, Flame, Clock, Tag, ArrowLeft, Grid, Filter,
  Laptop, Gamepad2, Cpu, Box, Headphones, Monitor, Keyboard, HardDrive, Sparkles, Layers
} from 'lucide-react';

const CATEGORY_CONFIG: Record<string, { title: string; subtitle: string; iconName: string; bgGradient: string }> = {
  ALL: {
    title: 'Toàn Bộ Kho Linh Kiện & PC',
    subtitle: 'Danh mục linh kiện máy tính, Laptop, màn hình & phụ kiện gaming chính hãng ODSStore',
    iconName: 'Grid',
    bgGradient: 'from-slate-900 via-sky-950 to-slate-950',
  },
  LAPTOP: {
    title: 'Laptop Văn Phòng & Đồ Họa',
    subtitle: 'Laptop mỏng nhẹ, hiệu năng cao, pin lâu dành cho doanh nhân, kỹ sư & sáng tạo nội dung',
    iconName: 'Laptop',
    bgGradient: 'from-blue-900 via-sky-900 to-slate-900',
  },
  LAPTOP_GAMING: {
    title: 'Laptop Gaming Cao Cấp',
    subtitle: 'Laptop chơi game cấu hình mạnh mẽ, card đồ họa Nvidia RTX 40-series, màn hình 144Hz - 240Hz',
    iconName: 'Gamepad2',
    bgGradient: 'from-indigo-950 via-purple-950 to-slate-900',
  },
  CORE_PARTS: {
    title: 'Linh Kiện Core (CPU, VGA, Mainboard & RAM)',
    subtitle: 'Bo mạch chủ, Vi xử lý Intel Core / AMD Ryzen, Card màn hình RTX, RAM DDR5 chính hãng bảo hành 36T',
    iconName: 'Cpu',
    bgGradient: 'from-sky-950 via-[#0284c7]/40 to-slate-900',
  },
  CASE_COOLING: {
    title: 'Vỏ Case & Tản Nhiệt Nước RGB',
    subtitle: 'Vỏ máy tính kính cường lực NZXT, Lian Li & Tản nhiệt nước AIO 240mm/360mm giải nhiệt cực tốt',
    iconName: 'Box',
    bgGradient: 'from-slate-900 via-cyan-950 to-slate-900',
  },
  HEADSET: {
    title: 'Tai Nghe Gaming & Âm Thanh Pro',
    subtitle: 'Tai nghe gaming 7.1 vòm, tai nghe không dây Wireless độ trễ thấp từ HyperX, Logitech, SteelSeries',
    iconName: 'Headphones',
    bgGradient: 'from-violet-950 via-slate-900 to-purple-950',
  },
  MONITOR: {
    title: 'Màn Hình Chơi Game & Đồ Họa 4K',
    subtitle: 'Màn hình tần số quét cao 144Hz, 240Hz, tấm nền IPS/OLED màu chuẩn đồ họa từ ASUS ROG, LG, Samsung',
    iconName: 'Monitor',
    bgGradient: 'from-[#0284c7]/50 via-sky-950 to-slate-900',
  },
  KEYBOARD: {
    title: 'Bàn Phím Cơ & Chuột Gaming',
    subtitle: 'Bàn phím cơ Custom Hotswap, Switch mượt mà, Chuột chơi game siêu nhẹ 8KHz Polling Rate',
    iconName: 'Keyboard',
    bgGradient: 'from-[#5B3DF5]/30 via-slate-900 to-slate-900',
  },
  STORAGE: {
    title: 'Ổ Cứng SSD NVMe & HDD Dung Lượng Lớn',
    subtitle: 'Ổ cứng SSD NVMe M.2 PCIe Gen4/Gen5 tốc độ siêu nhanh 7400MB/s từ Samsung, Kingston, WD Black',
    iconName: 'HardDrive',
    bgGradient: 'from-emerald-950 via-teal-950 to-slate-900',
  },
};

const CATEGORY_PILLS = [
  { id: 'ALL', label: 'Tất Cả', icon: Grid },
  { id: 'LAPTOP', label: 'Laptop', icon: Laptop },
  { id: 'LAPTOP_GAMING', label: 'Laptop Gaming', icon: Gamepad2 },
  { id: 'CORE_PARTS', label: 'Linh Kiện Core', icon: Cpu },
  { id: 'CASE_COOLING', label: 'Case & Tản Nhiệt', icon: Box },
  { id: 'HEADSET', label: 'Tai Nghe Gaming', icon: Headphones },
  { id: 'MONITOR', label: 'Màn Hình', icon: Monitor },
  { id: 'KEYBOARD', label: 'Bàn Phím & Chuột', icon: Keyboard },
  { id: 'STORAGE', label: 'Ổ Cứng SSD', icon: HardDrive },
];

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case 'Laptop': return <Laptop className={className} />;
    case 'Gamepad2': return <Gamepad2 className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Box': return <Box className={className} />;
    case 'Headphones': return <Headphones className={className} />;
    case 'Monitor': return <Monitor className={className} />;
    case 'Keyboard': return <Keyboard className={className} />;
    case 'HardDrive': return <HardDrive className={className} />;
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

  // Load products from database
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

    // Load recently viewed
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
      subtitle: `Danh mục sản phẩm ${selectedCategory} chính hãng tại ODSStore`,
      iconName: 'Grid',
      bgGradient: 'from-slate-900 via-sky-950 to-slate-950',
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* BREADCRUMB */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0284c7] transition-colors">
            <ArrowLeft className="h-4 w-4 text-[#0284c7]" /> Trang Chủ ODSStore
          </Link>
          <span className="text-xs font-extrabold text-[#0284c7] bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full shadow-2xs">
            {filteredProducts.length} Linh Kiện Chính Hãng
          </span>
        </div>

        {/* CATEGORY HERO BANNER CARD */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${currentCategoryInfo.bgGradient} text-white p-6 sm:p-8 mb-8 shadow-xl border border-white/10`}>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-extrabold text-sky-300">
                <CategoryIcon name={currentCategoryInfo.iconName} className="h-4 w-4 text-sky-400" />
                <span>DANH MỤC SẢN PHẨM ODSSTORE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white">
                {currentCategoryInfo.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                {currentCategoryInfo.subtitle}
              </p>
            </div>

            {selectedCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => handleCategorySelect('ALL')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 backdrop-blur-md shrink-0 cursor-pointer"
              >
                + Xóa Bộ Lọc Danh Mục
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY NAV PILLS STRIP - UI VERSE STYLE */}
        <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
          <div className="flex items-center gap-2.5 min-w-max">
            {CATEGORY_PILLS.map((pill) => {
              const IconComp = pill.icon;
              const isActive = selectedCategory.toUpperCase() === pill.id.toUpperCase();
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => handleCategorySelect(pill.id)}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border ${
                    isActive
                      ? 'uiverse-btn-primary shadow-lg ring-2 ring-sky-300/60 scale-105'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#6EC2F7] hover:text-[#0284c7] shadow-2xs hover:-translate-y-0.5'
                  }`}
                >
                  <IconComp className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#0284c7]'}`} />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SEARCH & CONTROLS STRIP */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          {/* QUICK FILTER BUTTONS */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất Cả Hàng
            </button>

            <button
              onClick={() => setActiveFilter('recently_viewed')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'recently_viewed'
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Vừa Xem ({validRecentlyViewed.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('best_sellers')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'best_sellers'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Flame className="h-3.5 w-3.5 fill-current" />
              <span>Bán Chạy</span>
            </button>

            <button
              onClick={() => setActiveFilter('discounts')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'discounts'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Khuyến Mãi Hè</span>
            </button>
          </div>

          {/* SEARCH INPUT & SORT DROPDOWN */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm linh kiện, CPU, Laptop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-[#0284c7] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:border-[#0284c7] focus:bg-white focus:outline-none cursor-pointer"
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
            Đang tải kho sản phẩm ODSStore...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="h-16 w-16 rounded-full bg-sky-50 text-[#0284c7] flex items-center justify-center mx-auto">
              <Layers className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-900">Chưa có sản phẩm nào trong danh mục này</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy thử chọn danh mục khác hoặc xóa bộ lọc tìm kiếm để khám phá kho hàng ODSStore.
              </p>
            </div>
            <button
              onClick={() => { setActiveFilter('ALL'); setSelectedCategory('ALL'); setSelectedPlatform('ALL'); setSearchQuery(''); router.push('/products'); }}
              className="px-5 py-2.5 rounded-xl bg-[#0284c7] text-white text-xs font-extrabold hover:bg-[#0369a1] transition-all shadow-sm cursor-pointer"
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
      <CartDrawer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <CartProvider>
      <Suspense fallback={<div className="py-20 text-center text-xs font-bold text-slate-400">Loading ODSStore catalog...</div>}>
        <ProductsCatalogContent />
      </Suspense>
    </CartProvider>
  );
}
