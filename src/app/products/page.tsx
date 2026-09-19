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
    title: 'Tất Cả Linh Kiện (CPU, Main, VGA, RAM, SSD)',
    iconName: 'IconCpu',
  },
  CASE_COOLING: {
    title: 'Vỏ Case, Nguồn Máy Tính & Tản Nhiệt',
    iconName: 'IconCase',
  },
  MOUSE: {
    title: 'Chuột Gaming & Văn Phòng',
    iconName: 'IconKeyboard',
  },
  CHAIR: {
    title: 'Bàn & Ghế Gaming',
    iconName: 'IconKeyboard',
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
  { id: 'KEYBOARD', name: 'Bàn Phím Cơ', icon: 'IconKeyboard' },
  { id: 'MOUSE', name: 'Chuột Gaming', icon: 'IconKeyboard' },
  { id: 'HEADSET', name: 'Tai Nghe', icon: 'IconHeadset' },
  { id: 'CHAIR', name: 'Bàn & Ghế', icon: 'IconKeyboard' },
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
  const initialUsage = searchParams.get('usage') || 'ALL';

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
  const [selectedUsage, setSelectedUsage] = useState<string>(initialUsage);
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
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('ALL');
  const [selectedFormFactor, setSelectedFormFactor] = useState<string>('ALL');
  const [selectedCoolingType, setSelectedCoolingType] = useState<string>('ALL');
  const [selectedConnectivity, setSelectedConnectivity] = useState<string>('ALL');
  const [selectedSwitchType, setSelectedSwitchType] = useState<string>('ALL');
  const [selectedPanelType, setSelectedPanelType] = useState<string>('ALL');
  const [selectedEfficiency, setSelectedEfficiency] = useState<string>('ALL');

  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [liveProducts, setLiveProducts] = useState<ProductProps[]>(INITIAL_CATALOG_PRODUCTS);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state with query parameters
  useEffect(() => {
    setActiveFilter(searchParams.get('filter') || 'ALL');
    const cat = searchParams.get('category') || 'ALL';
    setSelectedCategory(cat);
    setSelectedPlatform(searchParams.get('platform') || 'ALL');
    setSelectedUsage(searchParams.get('usage') || 'ALL');

    // Reset specific sub-filters on category change to prevent cross-filtering conflicts
    setSelectedBrand('ALL');
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
    setSelectedSubCategory('ALL');
    setSelectedFormFactor('ALL');
    setSelectedCoolingType('ALL');
    setSelectedConnectivity('ALL');
    setSelectedSwitchType('ALL');
    setSelectedPanelType('ALL');
    setSelectedEfficiency('ALL');
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
    setSelectedSubCategory('ALL');
    setSelectedFormFactor('ALL');
    setSelectedCoolingType('ALL');
    setSelectedConnectivity('ALL');
    setSelectedSwitchType('ALL');
    setSelectedPanelType('ALL');
    setSelectedEfficiency('ALL');
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
      selectedSubCategory !== 'ALL' ||
      selectedFormFactor !== 'ALL' ||
      selectedCoolingType !== 'ALL' ||
      selectedConnectivity !== 'ALL' ||
      selectedSwitchType !== 'ALL' ||
      selectedPanelType !== 'ALL' ||
      selectedEfficiency !== 'ALL' ||
      searchQuery.trim() !== ''
    );
  }, [
    selectedPriceRange, appliedMinPrice, appliedMaxPrice, selectedBrand, 
    selectedUsage, selectedRam, selectedSsd, selectedCpuBrand, selectedGpuBrand, 
    selectedRefreshRate, selectedScreenSize, selectedResolution, selectedSocket, 
    selectedVram, selectedWattage, selectedSubCategory, selectedFormFactor,
    selectedCoolingType, selectedConnectivity, selectedSwitchType,
    selectedPanelType, selectedEfficiency, searchQuery
  ]);

  // Available brands in the active category (tránh lỗi hiện hãng linh kiện khác khi xem danh mục)
  const availableBrands = useMemo(() => {
    let list = liveProducts;
    if (selectedCategory !== 'ALL') {
      const upperCat = selectedCategory.toUpperCase();
      list = list.filter((p) => {
        const pCats = Array.isArray(p.category) 
          ? p.category.map((c: any) => String(c).toUpperCase()) 
          : [String(p.category).toUpperCase()];

        if (upperCat === 'CORE_PARTS') {
          return pCats.some((c) => ['CORE_PARTS', 'CPU', 'VGA', 'MAINBOARD', 'RAM', 'STORAGE'].includes(c));
        }
        if (upperCat === 'CASE_COOLING') {
          return pCats.some((c) => ['CASE', 'PSU', 'COOLING', 'CASE_COOLING'].includes(c));
        }
        if (upperCat === 'GEAR') {
          return pCats.some((c) => ['GEAR', 'KEYBOARD', 'HEADSET', 'MOUSE', 'CHAIR'].includes(c));
        }
        if (upperCat === 'MOUSE') {
          const name = (p.name || '').toLowerCase();
          return (pCats.includes('GEAR') || pCats.includes('MOUSE')) &&
                 (name.includes('chuột') || name.includes('mouse')) &&
                 !name.includes('lót chuột') && !name.includes('bàn di');
        }
        if (upperCat === 'CHAIR') {
          const name = (p.name || '').toLowerCase();
          return name.includes('ghế') || name.includes('bàn ');
        }
        if (upperCat === 'LAPTOP_GAMING') {
          return pCats.includes('LAPTOP_GAMING') || (
            pCats.includes('LAPTOP') && (
              (p.tags && p.tags.some((t: string) => t.toLowerCase().includes('gaming'))) ||
              p.name.toLowerCase().includes('gaming') ||
              p.name.toLowerCase().includes('rog') ||
              p.name.toLowerCase().includes('tuf') ||
              p.name.toLowerCase().includes('loq') ||
              p.name.toLowerCase().includes('legion') ||
              p.name.toLowerCase().includes('predator') ||
              p.name.toLowerCase().includes('nitro')
            )
          );
        }
        return pCats.includes(upperCat);
      });
    }

    const brandsSet = new Set<string>();
    list.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        brandsSet.add(p.brand.trim());
      }
    });
    return Array.from(brandsSet).slice(0, 15);
  }, [liveProducts, selectedCategory]);

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
          return pCats.some((c) => ['CORE_PARTS', 'CPU', 'VGA', 'MAINBOARD', 'RAM', 'STORAGE'].includes(c));
        }

        if (upperCat === 'CASE_COOLING') {
          return pCats.some((c) => ['CASE', 'PSU', 'COOLING', 'CASE_COOLING'].includes(c));
        }

        if (upperCat === 'GEAR') {
          return pCats.some((c) => ['GEAR', 'KEYBOARD', 'HEADSET', 'MOUSE', 'CHAIR'].includes(c));
        }

        if (upperCat === 'MOUSE') {
          const name = (p.name || '').toLowerCase();
          return (pCats.includes('GEAR') || pCats.includes('MOUSE')) &&
                 (name.includes('chuột') || name.includes('mouse')) &&
                 !name.includes('lót chuột') && !name.includes('bàn di');
        }

        if (upperCat === 'CHAIR') {
          const name = (p.name || '').toLowerCase();
          return name.includes('ghế') || name.includes('bàn ');
        }

        if (upperCat === 'LAPTOP_GAMING') {
          return pCats.includes('LAPTOP_GAMING') || (
            pCats.includes('LAPTOP') && (
              (p.tags && p.tags.some((t: string) => t.toLowerCase().includes('gaming'))) ||
              p.name.toLowerCase().includes('gaming') ||
              p.name.toLowerCase().includes('rog') ||
              p.name.toLowerCase().includes('tuf') ||
              p.name.toLowerCase().includes('loq') ||
              p.name.toLowerCase().includes('legion') ||
              p.name.toLowerCase().includes('predator') ||
              p.name.toLowerCase().includes('nitro')
            )
          );
        }

        return pCats.some((c) => c === upperCat);
      });
    }

    // 2b. Sub-Category Quick Filter within group categories
    if (selectedSubCategory !== 'ALL') {
      const sub = selectedSubCategory.toUpperCase();
      list = list.filter((p) => {
        const pCats = Array.isArray(p.category) 
          ? p.category.map((c: any) => String(c).toUpperCase()) 
          : [String(p.category).toUpperCase()];

        if (sub === 'CASE') return pCats.includes('CASE');
        if (sub === 'COOLING') return pCats.includes('COOLING');
        if (sub === 'PSU') return pCats.includes('PSU');

        if (sub === 'KEYBOARD') {
          const name = (p.name || '').toLowerCase();
          return pCats.includes('KEYBOARD') || name.includes('bàn phím');
        }
        if (sub === 'MOUSE') {
          const name = (p.name || '').toLowerCase();
          return (pCats.includes('GEAR') || pCats.includes('MOUSE')) &&
                 (name.includes('chuột') || name.includes('mouse')) &&
                 !name.includes('lót chuột') && !name.includes('bàn di');
        }
        if (sub === 'HEADSET') {
          const name = (p.name || '').toLowerCase();
          return pCats.includes('HEADSET') || name.includes('tai nghe');
        }
        if (sub === 'CHAIR') {
          const name = (p.name || '').toLowerCase();
          return name.includes('ghế') || name.includes('bàn ');
        }
        if (sub === 'PAD') {
          const name = (p.name || '').toLowerCase();
          return name.includes('lót chuột') || name.includes('bàn di');
        }

        if (['CPU', 'VGA', 'MAINBOARD', 'RAM', 'STORAGE'].includes(sub)) {
          return pCats.includes(sub);
        }
        return true;
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

    // Helper text search in product metadata (name, description, brand, tags, specs)
    const matchText = (p: ProductProps, query: string) => {
      const q = query.toLowerCase();
      const n = (p.name || '').toLowerCase();
      const d = (p.description || '').toLowerCase();
      const b = (p.brand || '').toLowerCase();
      const t = (p.tags || []).join(' ').toLowerCase();
      const s = p.specs ? Object.values(p.specs).join(' ').toLowerCase() : '';
      return n.includes(q) || d.includes(q) || b.includes(q) || t.includes(q) || s.includes(q);
    };

    // 5. Contextual: Nhu cầu sử dụng
    if (selectedUsage !== 'ALL') {
      const u = selectedUsage.toLowerCase();
      list = list.filter((p) => {
        if (u === 'gaming') {
          return matchText(p, 'gaming') || matchText(p, 'game') || matchText(p, 'rog') || matchText(p, 'tuf') || matchText(p, 'ultragear');
        }
        if (u.includes('văn phòng') || u.includes('học tập')) {
          return matchText(p, 'văn phòng') || matchText(p, 'học tập') || matchText(p, 'essential') || matchText(p, 'p2422h') || matchText(p, 'office');
        }
        if (u.includes('đồ họa') || u.includes('kỹ thuật')) {
          return matchText(p, 'đồ họa') || matchText(p, 'kỹ thuật') || matchText(p, 'proart') || matchText(p, 'creator') || matchText(p, 'srgb') || matchText(p, 'design');
        }
        if (u.includes('mỏng nhẹ') || u.includes('doanh nhân')) {
          return matchText(p, 'mỏng nhẹ') || matchText(p, 'doanh nhân') || matchText(p, 'zenbook') || matchText(p, 'swift') || matchText(p, 'macbook') || matchText(p, 'gram');
        }
        return matchText(p, selectedUsage);
      });
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
      const hz = selectedRefreshRate.toLowerCase();
      list = list.filter((p) => matchText(p, hz) || matchText(p, hz.replace('hz', ' hz')));
    }

    // 11. Contextual: Kích thước màn hình
    if (selectedScreenSize !== 'ALL') {
      list = list.filter((p) => {
        if (selectedScreenSize.includes('24')) return matchText(p, '24') || matchText(p, '23.8');
        if (selectedScreenSize.includes('27')) return matchText(p, '27');
        if (selectedScreenSize.includes('32')) return matchText(p, '32');
        return matchText(p, selectedScreenSize);
      });
    }

    // 12. Contextual: Độ phân giải
    if (selectedResolution !== 'ALL') {
      list = list.filter((p) => {
        const res = selectedResolution.toLowerCase();
        if (res.includes('1080') || res.includes('fhd')) return matchText(p, '1080') || matchText(p, 'fhd') || matchText(p, 'full hd');
        if (res.includes('2k') || res.includes('1440') || res.includes('qhd')) return matchText(p, '2k') || matchText(p, '1440') || matchText(p, 'qhd');
        if (res.includes('4k') || res.includes('2160') || res.includes('uhd')) return matchText(p, '4k') || matchText(p, '2160') || matchText(p, 'uhd');
        return matchText(p, selectedResolution);
      });
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
      list = list.filter((p) => matchText(p, selectedWattage) || (p.wattage && String(p.wattage).includes(selectedWattage.replace('W', ''))));
    }

    // 16. Contextual: Form Factor / Kiểu dáng / Hỗ trợ Main
    if (selectedFormFactor !== 'ALL') {
      list = list.filter((p) => {
        const ff = selectedFormFactor.toLowerCase();
        if (ff.includes('kính')) return matchText(p, 'kính') || matchText(p, 'glass');
        if (ff.includes('mid')) return matchText(p, 'mid-tower') || matchText(p, 'mid tower');
        if (ff.includes('mini')) return matchText(p, 'mini-tower') || matchText(p, 'mini tower') || matchText(p, 'micro-atx') || matchText(p, 'matx');
        if (ff.includes('fan')) return matchText(p, 'fan') || matchText(p, 'argb');
        if (ff.includes('đen')) return matchText(p, 'black') || matchText(p, 'đen');
        if (ff.includes('trắng')) return matchText(p, 'white') || matchText(p, 'trắng');
        if (ff.includes('micro-atx') || ff.includes('matx')) return matchText(p, 'micro-atx') || matchText(p, 'matx') || matchText(p, 'm-atx');
        if (ff.includes('atx')) return matchText(p, 'atx');
        if (ff.includes('itx')) return matchText(p, 'itx');
        return matchText(p, selectedFormFactor);
      });
    }

    // 17. Contextual: Loại tản nhiệt / Hiệu ứng
    if (selectedCoolingType !== 'ALL') {
      list = list.filter((p) => {
        const ct = selectedCoolingType.toLowerCase();
        if (ct.includes('240')) return matchText(p, '240');
        if (ct.includes('360')) return matchText(p, '360');
        if (ct.includes('khí')) return matchText(p, 'khí') || matchText(p, 'air') || matchText(p, 'ak400');
        if (ct.includes('lcd')) return matchText(p, 'lcd') || matchText(p, 'màn hình') || matchText(p, 'display');
        if (ct.includes('argb')) return matchText(p, 'argb') || matchText(p, 'rgb');
        return matchText(p, selectedCoolingType);
      });
    }

    // 18. Contextual: Kết nối
    if (selectedConnectivity !== 'ALL') {
      list = list.filter((p) => {
        const conn = selectedConnectivity.toLowerCase();
        if (conn.includes('không dây') || conn.includes('wireless')) {
          return matchText(p, 'không dây') || matchText(p, 'wireless') || matchText(p, 'bluetooth') || matchText(p, 'lightspeed');
        }
        if (conn.includes('có dây') || conn.includes('type-c') || conn.includes('usb')) {
          return matchText(p, 'có dây') || matchText(p, 'type-c') || matchText(p, 'usb') || (!matchText(p, 'không dây') && !matchText(p, 'wireless'));
        }
        return matchText(p, selectedConnectivity);
      });
    }

    // 19. Contextual: Loại Switch / Tính năng
    if (selectedSwitchType !== 'ALL') {
      list = list.filter((p) => {
        const sw = selectedSwitchType.toLowerCase();
        if (sw.includes('red')) return matchText(p, 'red') || matchText(p, 'linear') || matchText(p, 'piano');
        if (sw.includes('blue')) return matchText(p, 'blue') || matchText(p, 'clicky');
        if (sw.includes('brown')) return matchText(p, 'brown') || matchText(p, 'tactile');
        if (sw.includes('hotswap')) return matchText(p, 'hotswap');
        if (sw.includes('rgb')) return matchText(p, 'rgb');
        if (sw.includes('gasket')) return matchText(p, 'gasket');
        return matchText(p, selectedSwitchType);
      });
    }

    // 20. Contextual: Tấm nền
    if (selectedPanelType !== 'ALL') {
      list = list.filter((p) => matchText(p, selectedPanelType));
    }

    // 21. Contextual: Chuẩn hiệu suất nguồn & Cáp
    if (selectedEfficiency !== 'ALL') {
      list = list.filter((p) => {
        const eff = selectedEfficiency.toLowerCase();
        if (eff.includes('gold')) return matchText(p, 'gold');
        if (eff.includes('bronze')) return matchText(p, 'bronze');
        if (eff.includes('platinum')) return matchText(p, 'platinum');
        if (eff.includes('pcie 5.0') || eff.includes('atx 3.0')) return matchText(p, 'pcie 5.0') || matchText(p, 'atx 3.0') || matchText(p, 'pcie5');
        if (eff.includes('modular')) return matchText(p, 'modular');
        return matchText(p, selectedEfficiency);
      });
    }

    // 22. Search Query
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
    selectedSocket, selectedVram, selectedWattage, selectedSubCategory,
    selectedFormFactor, selectedCoolingType, selectedConnectivity,
    selectedSwitchType, selectedPanelType, selectedEfficiency,
    searchQuery, sortBy, validRecentlyViewed
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
  const isCase = upperCat === 'CASE';
  const isCooling = upperCat === 'COOLING';
  const isPsu = upperCat === 'PSU';
  const isCaseCoolingGroup = upperCat === 'CASE_COOLING';
  const isCaseCooling = isCaseCoolingGroup || isCase || isCooling || isPsu;
  const isKeyboard = upperCat === 'KEYBOARD';
  const isMouse = upperCat === 'MOUSE';
  const isHeadset = upperCat === 'HEADSET';
  const isChair = upperCat === 'CHAIR';
  const isGearGroup = upperCat === 'GEAR';
  const isCorePartsGroup = upperCat === 'CORE_PARTS';

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

              {/* ══════════════════════════════════════════════════════════════
                  NHÓM 1: CASE - TẢN - NGUỒN (CASE_COOLING, CASE, COOLING, PSU)
                  ══════════════════════════════════════════════════════════════ */}
              
              {/* 1A. Nhóm Tổng: CASE_COOLING */}
              {isCaseCoolingGroup && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Phân Loại Linh Kiện
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'ALL', label: 'Tất Cả' },
                        { id: 'CASE', label: 'Vỏ Case' },
                        { id: 'COOLING', label: 'Tản Nhiệt' },
                        { id: 'PSU', label: 'Nguồn PSU' },
                      ].map((item) => {
                        const isSelected = selectedSubCategory === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedSubCategory(item.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Công Suất Nguồn */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Công Suất Nguồn
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['550W', '650W', '750W', '850W', '1000W'].map((w) => {
                        const isSelected = selectedWattage === w;
                        return (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setSelectedWattage(isSelected ? 'ALL' : w)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {w}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Loại Tản Nhiệt */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Loại Tản Nhiệt
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['AIO 240mm', 'AIO 360mm', 'Tản Khí CPU'].map((ct) => {
                        const isSelected = selectedCoolingType === ct;
                        return (
                          <button
                            key={ct}
                            type="button"
                            onClick={() => setSelectedCoolingType(isSelected ? 'ALL' : ct)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {ct}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Kiểu Vỏ Case */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Kiểu Vỏ Case
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Bể Kính', 'Mid-Tower', 'Mini-Tower'].map((ff) => {
                        const isSelected = selectedFormFactor === ff;
                        return (
                          <button
                            key={ff}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : ff)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {ff}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* 1B. Vỏ Case (CASE) */}
              {isCase && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Kiểu Case / Thiết Kế
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Bể Kính', 'Mid-Tower', 'Mini-Tower', 'Kèm Fan ARGB'].map((ff) => {
                        const isSelected = selectedFormFactor === ff;
                        return (
                          <button
                            key={ff}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : ff)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {ff}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Màu Sắc
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Màu Đen', 'Màu Trắng'].map((color) => {
                        const isSelected = selectedFormFactor === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : color)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Hỗ Trợ Mainboard
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['ATX', 'Micro-ATX', 'Mini-ITX'].map((mb) => {
                        const isSelected = selectedFormFactor === mb;
                        return (
                          <button
                            key={mb}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : mb)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {mb}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* 1C. Tản Nhiệt (COOLING) */}
              {isCooling && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Loại Tản Nhiệt
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['AIO 240mm', 'AIO 360mm', 'Tản Khí CPU'].map((ct) => {
                        const isSelected = selectedCoolingType === ct;
                        return (
                          <button
                            key={ct}
                            type="button"
                            onClick={() => setSelectedCoolingType(isSelected ? 'ALL' : ct)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {ct}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Hiệu Ứng / Tính Năng
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Màn Hình LCD', 'LED ARGB', 'Không LED'].map((ef) => {
                        const isSelected = selectedCoolingType === ef;
                        return (
                          <button
                            key={ef}
                            type="button"
                            onClick={() => setSelectedCoolingType(isSelected ? 'ALL' : ef)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {ef}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Socket Tương Thích
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
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
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

              {/* 1D. Nguồn Máy Tính (PSU) */}
              {isPsu && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Công Suất Nguồn
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['550W', '650W', '750W', '850W', '1000W'].map((w) => {
                        const isSelected = selectedWattage === w;
                        return (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setSelectedWattage(isSelected ? 'ALL' : w)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {w}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Chuẩn Hiệu Suất
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['80 Plus Bronze', '80 Plus Gold', '80 Plus Platinum'].map((eff) => {
                        const isSelected = selectedEfficiency === eff;
                        return (
                          <button
                            key={eff}
                            type="button"
                            onClick={() => setSelectedEfficiency(isSelected ? 'ALL' : eff)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {eff}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Tính Năng Nguồn
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['PCIe 5.0 (ATX 3.0)', 'Full Modular'].map((feat) => {
                        const isSelected = selectedEfficiency === feat;
                        return (
                          <button
                            key={feat}
                            type="button"
                            onClick={() => setSelectedEfficiency(isSelected ? 'ALL' : feat)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {feat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  NHÓM 2: GAMING GEAR (GEAR, KEYBOARD, MOUSE, HEADSET, CHAIR)
                  ══════════════════════════════════════════════════════════════ */}
              
              {/* 2A. Nhóm Tổng: GEAR */}
              {isGearGroup && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Phân Loại Gear
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'ALL', label: 'Tất Cả Gear' },
                        { id: 'KEYBOARD', label: 'Bàn Phím Cơ' },
                        { id: 'MOUSE', label: 'Chuột Gaming' },
                        { id: 'HEADSET', label: 'Tai Nghe' },
                        { id: 'CHAIR', label: 'Bàn & Ghế' },
                      ].map((item) => {
                        const isSelected = selectedSubCategory === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedSubCategory(item.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Kiểu Kết Nối
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Không Dây', 'Có Dây'].map((conn) => {
                        const isSelected = selectedConnectivity === conn;
                        return (
                          <button
                            key={conn}
                            type="button"
                            onClick={() => setSelectedConnectivity(isSelected ? 'ALL' : conn)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {conn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* 2B. Bàn Phím Cơ (KEYBOARD) */}
              {isKeyboard && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Kiểu Kết Nối
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Không Dây (Wireless)', 'Có Dây Type-C'].map((conn) => {
                        const isSelected = selectedConnectivity === conn;
                        return (
                          <button
                            key={conn}
                            type="button"
                            onClick={() => setSelectedConnectivity(isSelected ? 'ALL' : conn)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {conn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Loại Switch
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Red Switch', 'Blue Switch', 'Brown Switch'].map((sw) => {
                        const isSelected = selectedSwitchType === sw;
                        return (
                          <button
                            key={sw}
                            type="button"
                            onClick={() => setSelectedSwitchType(isSelected ? 'ALL' : sw)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {sw}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Tính Năng Bàn Phím
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Hotswap', 'LED RGB', 'Gasket Mount'].map((feat) => {
                        const isSelected = selectedSwitchType === feat;
                        return (
                          <button
                            key={feat}
                            type="button"
                            onClick={() => setSelectedSwitchType(isSelected ? 'ALL' : feat)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {feat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* 2C. Chuột Gaming (MOUSE) */}
              {isMouse && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Kiểu Kết Nối
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Không Dây (Wireless)', 'Có Dây'].map((conn) => {
                        const isSelected = selectedConnectivity === conn;
                        return (
                          <button
                            key={conn}
                            type="button"
                            onClick={() => setSelectedConnectivity(isSelected ? 'ALL' : conn)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {conn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Trọng Lượng Chuột
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Siêu Nhẹ (<65g)', 'Tiêu Chuẩn'].map((w) => {
                        const isSelected = selectedFormFactor === w;
                        return (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : w)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {w}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Độ Phân Giải (DPI)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['8.000 DPI', '16.000+ DPI', '30.000 DPI'].map((dpi) => {
                        const isSelected = selectedFormFactor === dpi;
                        return (
                          <button
                            key={dpi}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : dpi)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {dpi}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* 2D. Tai Nghe Gaming (HEADSET) */}
              {isHeadset && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Kiểu Kết Nối
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Không Dây (Wireless)', 'Jack 3.5mm', 'Cổng USB'].map((conn) => {
                        const isSelected = selectedConnectivity === conn;
                        return (
                          <button
                            key={conn}
                            type="button"
                            onClick={() => setSelectedConnectivity(isSelected ? 'ALL' : conn)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {conn}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Tính Năng Âm Thanh
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Âm Thanh Vòm 7.1', 'Spatial Audio', 'Micro Khử Ồn'].map((feat) => {
                        const isSelected = selectedSwitchType === feat;
                        return (
                          <button
                            key={feat}
                            type="button"
                            onClick={() => setSelectedSwitchType(isSelected ? 'ALL' : feat)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {feat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* 2E. Bàn & Ghế Gaming (CHAIR) */}
              {isChair && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Phân Loại Bàn Ghế
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Ghế Gaming', 'Ghế Công Thái Học', 'Bàn Gaming'].map((cat) => {
                        const isSelected = selectedFormFactor === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : cat)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Chất Liệu
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Vải Nỉ Thoáng Khí', 'Da PU'].map((mat) => {
                        const isSelected = selectedCoolingType === mat;
                        return (
                          <button
                            key={mat}
                            type="button"
                            onClick={() => setSelectedCoolingType(isSelected ? 'ALL' : mat)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {mat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  NHÓM 3: MÀN HÌNH GAMING (MONITOR)
                  ══════════════════════════════════════════════════════════════ */}
              {isMonitor && (
                <>
                  {/* Nhu Cầu Sử Dụng */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Nhu Cầu Sử Dụng
                    </span>
                    <div className="space-y-1">
                      {['Gaming', 'Đồ Họa - Kỹ Thuật', 'Văn Phòng'].map((u) => {
                        const isSelected = selectedUsage.toLowerCase().includes(u.toLowerCase().slice(0, 4));
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

                  {/* Kích Thước Màn Hình */}
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
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tần Số Quét */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Tần Số Quét
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['75Hz', '100Hz', '144Hz', '165Hz', '240Hz'].map((hz) => {
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

                  {/* Độ Phân Giải */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Độ Phân Giải
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Full HD (1080p)', '2K QHD (1440p)', '4K UHD (2160p)'].map((res) => {
                        const isSelected = selectedResolution === res;
                        return (
                          <button
                            key={res}
                            type="button"
                            onClick={() => setSelectedResolution(isSelected ? 'ALL' : res)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {res}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tấm Nền */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Công Nghệ Tấm Nền
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['IPS', 'Fast IPS', 'VA', 'OLED'].map((pt) => {
                        const isSelected = selectedPanelType === pt;
                        return (
                          <button
                            key={pt}
                            type="button"
                            onClick={() => setSelectedPanelType(isSelected ? 'ALL' : pt)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {pt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  NHÓM 4: LAPTOP & LAPTOP GAMING (LAPTOP, LAPTOP_GAMING)
                  (Khớp 100% hình ảnh thực tế media_1789806427143.png)
                  ══════════════════════════════════════════════════════════════ */}
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

                  {/* Ổ Cứng SSD */}
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

              {/* ══════════════════════════════════════════════════════════════
                  NHÓM 5: MAIN, CPU, VGA, RAM, SSD (CORE_PARTS, CPU, VGA, MAIN, RAM, STORAGE)
                  ══════════════════════════════════════════════════════════════ */}
              
              {/* 5A. Nhóm Tổng: CORE_PARTS */}
              {isCorePartsGroup && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Phân Loại Linh Kiện
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'ALL', label: 'Tất Cả Linh Kiện' },
                        { id: 'CPU', label: 'Vi Xử Lý CPU' },
                        { id: 'VGA', label: 'Card Đồ Họa VGA' },
                        { id: 'MAINBOARD', label: 'Bo Mạch Main' },
                        { id: 'RAM', label: 'Bộ Nhớ RAM' },
                        { id: 'STORAGE', label: 'Ổ Cứng SSD' },
                      ].map((item) => {
                        const isSelected = selectedSubCategory === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedSubCategory(item.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* 5B. Bộ Vi Xử Lý (CPU) - hiển thị khi xem CPU hoặc chọn CPU trong nhóm Linh Kiện */}
              {(isCpu || (isCorePartsGroup && selectedSubCategory === 'CPU')) && (
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
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
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
                    <div className="grid grid-cols-2 gap-1.5">
                      {['LGA1700', 'LGA1851', 'AM5', 'AM4'].map((sock) => {
                        const isSelected = selectedSocket === sock;
                        return (
                          <button
                            key={sock}
                            type="button"
                            onClick={() => setSelectedSocket(isSelected ? 'ALL' : sock)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
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

              {/* 5C. Card Đồ Họa (VGA) - hiển thị khi xem VGA hoặc chọn VGA trong nhóm Linh Kiện */}
              {(isVga || (isCorePartsGroup && selectedSubCategory === 'VGA')) && (
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
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
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
                    <div className="grid grid-cols-4 gap-1.5">
                      {['8GB', '12GB', '16GB', '24GB'].map((v) => {
                        const isSelected = selectedVram === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setSelectedVram(isSelected ? 'ALL' : v)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Số Quạt Tản Nhiệt
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['2 Quạt (Dual Fan)', '3 Quạt (Triple Fan)'].map((f) => {
                        const isSelected = selectedFormFactor === f;
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : f)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* 5D. Bo Mạch Chủ (MAINBOARD) - hiển thị khi xem MAINBOARD hoặc chọn trong Linh Kiện */}
              {(isMain || (isCorePartsGroup && selectedSubCategory === 'MAINBOARD')) && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Dòng Chipset
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['B760', 'Z790', 'B650', 'X670', 'H610'].map((cs) => {
                        const isSelected = selectedCpuBrand === cs;
                        return (
                          <button
                            key={cs}
                            type="button"
                            onClick={() => setSelectedCpuBrand(isSelected ? 'ALL' : cs)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {cs}
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
                      {['LGA1700', 'AM5', 'AM4'].map((s) => {
                        const isSelected = selectedSocket === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSocket(isSelected ? 'ALL' : s)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
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
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Kích Thước Mainboard
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['ATX', 'Micro-ATX', 'Mini-ITX'].map((ff) => {
                        const isSelected = selectedFormFactor === ff;
                        return (
                          <button
                            key={ff}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : ff)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {ff}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* 5E. Bộ Nhớ Trong (RAM) - hiển thị khi xem RAM hoặc chọn trong Linh Kiện */}
              {(isRam || (isCorePartsGroup && selectedSubCategory === 'RAM')) && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Dung Lượng RAM
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['8GB', '16GB', '32GB', '64GB'].map((r) => {
                        const isSelected = selectedRam === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setSelectedRam(isSelected ? 'ALL' : r)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Thế Hệ RAM
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['DDR4', 'DDR5'].map((gen) => {
                        const isSelected = selectedFormFactor === gen;
                        return (
                          <button
                            key={gen}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : gen)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {gen}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Tốc Độ Bus
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['3200MHz', '5600MHz', '6000MHz'].map((bus) => {
                        const isSelected = selectedFormFactor === bus;
                        return (
                          <button
                            key={bus}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : bus)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {bus}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Hiệu Ứng LED
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['RGB', 'Không LED'].map((led) => {
                        const isSelected = selectedSwitchType === led;
                        return (
                          <button
                            key={led}
                            type="button"
                            onClick={() => setSelectedSwitchType(isSelected ? 'ALL' : led)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {led}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* 5F. Ổ Cứng Lưu Trữ (STORAGE) - hiển thị khi xem STORAGE hoặc chọn trong Linh Kiện */}
              {(isStorage || (isCorePartsGroup && selectedSubCategory === 'STORAGE')) && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Dung Lượng Ổ Cứng
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {['256GB', '512GB', '1TB', '2TB'].map((s) => {
                        const isSelected = selectedSsd === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSsd(isSelected ? 'ALL' : s)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
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
                      Chuẩn Giao Tiếp
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['PCIe Gen 4', 'PCIe Gen 3', 'SATA 3'].map((std) => {
                        const isSelected = selectedFormFactor === std;
                        return (
                          <button
                            key={std}
                            type="button"
                            onClick={() => setSelectedFormFactor(isSelected ? 'ALL' : std)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {std}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  KHI ĐANG Ở 'TẤT CẢ SẢN PHẨM' (ALL)
                  ══════════════════════════════════════════════════════════════ */}
              {upperCat === 'ALL' && (
                <>
                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Nhóm Danh Mục Chính
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'LAPTOP', label: 'Laptop' },
                        { id: 'MONITOR', label: 'Màn Hình' },
                        { id: 'CORE_PARTS', label: 'Linh Kiện PC' },
                        { id: 'CASE_COOLING', label: 'Case / Tản / Nguồn' },
                        { id: 'GEAR', label: 'Gaming Gear' },
                      ].map((cat) => {
                        return (
                          <Link
                            key={cat.id}
                            href={`/products?category=${cat.id}`}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#0284c7] hover:text-[#0284c7] transition-all cursor-pointer"
                          >
                            {cat.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>

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

                {selectedSubCategory !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Phân loại: {selectedSubCategory}</span>
                    <button onClick={() => setSelectedSubCategory('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedFormFactor !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Thiết kế / Form: {selectedFormFactor}</span>
                    <button onClick={() => setSelectedFormFactor('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedCoolingType !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Tản / Chất liệu: {selectedCoolingType}</span>
                    <button onClick={() => setSelectedCoolingType('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedConnectivity !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Kết nối: {selectedConnectivity}</span>
                    <button onClick={() => setSelectedConnectivity('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedSwitchType !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Switch / Tính năng: {selectedSwitchType}</span>
                    <button onClick={() => setSelectedSwitchType('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedPanelType !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Tấm nền: {selectedPanelType}</span>
                    <button onClick={() => setSelectedPanelType('ALL')} className="hover:text-rose-500">✕</button>
                  </span>
                )}

                {selectedEfficiency !== 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] text-xs font-bold border border-sky-200 dark:border-sky-800">
                    <span>Hiệu suất / Cáp: {selectedEfficiency}</span>
                    <button onClick={() => setSelectedEfficiency('ALL')} className="hover:text-rose-500">✕</button>
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
