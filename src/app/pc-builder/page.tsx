'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { INITIAL_PRODUCTS, HardwareProduct } from '@/lib/hardware-data';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { showToast, showConfirm } from '@/components/Toast';
import { 
  CheckCircle2, 
  Trash2, 
  Printer, 
  ShoppingCart, 
  Plus, 
  Wrench,
  ShieldAlert,
  Sparkles,
  Check,
  RotateCcw,
  X,
  ShieldCheck,
  ChevronRight,
  Bookmark,
  FileSpreadsheet,
  Download,
  Share2,
  Search,
  SlidersHorizontal,
  ArrowRight,
  ExternalLink,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';
import { 
  IconCpu, 
  IconMainboard, 
  IconRam, 
  IconVga, 
  IconStorage, 
  IconPsu, 
  IconCase 
} from '@/components/icons/HardwareIcons';
import { BuildQuotationModal } from '@/components/pc-builder/BuildQuotationModal';
import { SaveBuildModal } from '@/components/pc-builder/SaveBuildModal';
import Link from 'next/link';

type BuildStep = {
  key: string;
  stepNum: string;
  name: string;
  shortBtn: string;
  subtitle: string;
  category: HardwareProduct['category'];
  icon: any;
};

const BUILD_STEPS: BuildStep[] = [
  { key: "cpu", stepNum: "01", name: "Bộ Vi Xử Lý (CPU)", shortBtn: "Chọn CPU", subtitle: "Intel Core i5 / i7 / i9 hoặc AMD Ryzen 5 / 7 / 9 thế hệ mới", category: "CPU", icon: IconCpu },
  { key: "mainboard", stepNum: "02", name: "Bo Mạch Chủ (Mainboard)", shortBtn: "Chọn Mainboard", subtitle: "Tương thích Socket LGA1700, AM4, AM5 chuẩn kích thước ATX/mATX", category: "MAINBOARD", icon: IconMainboard },
  { key: "ram", stepNum: "03", name: "Bộ Nhớ Trong (RAM)", shortBtn: "Chọn RAM", subtitle: "Chuẩn DDR4 hoặc DDR5 tốc độ cao (Bus 3200MHz - 6000MHz+)", category: "RAM", icon: IconRam },
  { key: "vga", stepNum: "04", name: "Card Màn Hình (VGA / GPU)", shortBtn: "Chọn Card VGA", subtitle: "NVIDIA GeForce RTX 40/30 Series hoặc AMD Radeon RX chuyên Gaming/Đồ Họa", category: "VGA", icon: IconVga },
  { key: "storage", stepNum: "05", name: "Ổ Cứng Lưu Trữ (SSD NVMe)", shortBtn: "Chọn Ổ SSD", subtitle: "SSD M.2 NVMe PCIe Gen 4/5 tốc độ đọc siêu tốc 5000MB/s - 7400MB/s", category: "STORAGE", icon: IconStorage },
  { key: "psu", stepNum: "06", name: "Nguồn Máy Tính (PSU)", shortBtn: "Chọn Nguồn PSU", subtitle: "Chuẩn 80 Plus Bronze / Gold công suất thực, bảo vệ linh kiện", category: "PSU", icon: IconPsu },
  { key: "case", stepNum: "07", name: "Vỏ Case Máy Tính", shortBtn: "Chọn Vỏ Case", subtitle: "Kính cường lực Panoramic, tối ưu lưu thông gió và hỗ trợ quạt ARGB", category: "CASE", icon: IconCase },
  { key: "cooling", stepNum: "08", name: "Tản Nhiệt CPU (Cooling / AIO)", shortBtn: "Chọn Tản Nhiệt", subtitle: "Tản nhiệt khí tháp đôi hoặc Tản nước AIO 240/360mm ARGB", category: "COOLING", icon: IconCpu },
  { key: "monitor", stepNum: "09", name: "Màn Hình Máy Tính (Monitor)", shortBtn: "Chọn Màn Hình", subtitle: "Tần số quét cao 144Hz - 240Hz, tấm nền IPS chuẩn màu đồ họa", category: "MONITOR", icon: IconCpu },
];

export function generateDynamicBuildName(build: Record<string, HardwareProduct | null>, customName?: string): string {
  // If user has manually saved a customized name, prioritize it
  if (customName && 
      customName.trim() &&
      customName !== 'Cấu Hình DRX Build Gaming' && 
      customName !== 'Cấu Hình Tự Chọn DRX Build' &&
      !customName.startsWith('Cấu Hình PC DRX Venom (Intel Core i5 13400F') && 
      !customName.startsWith('Cấu Hình PC DRX Quái Thú (AMD Ryzen 7 7800X3D')) {
    return customName;
  }

  const cpu = build.cpu?.name || '';
  const vga = build.vga?.name || '';

  let cpuShort = '';
  const ryzenMatch = cpu.match(/Ryzen\s+[3579]\s+\w+/i);
  const intelMatch = cpu.match(/(Core\s+i[3579][\s-]*\w+|Ultra\s+\d+[\s-]*\w+)/i);
  if (ryzenMatch) cpuShort = ryzenMatch[0];
  else if (intelMatch) cpuShort = intelMatch[0];
  else if (cpu) cpuShort = cpu.split('(')[0].replace(/Bộ Vi Xử Lý|CPU/gi, '').trim().slice(0, 24);

  let vgaShort = '';
  const rtxMatch = vga.match(/(RTX\s*\d+\s*(Ti|SUPER)?|GTX\s*\d+\s*(Ti|SUPER)?|RX\s*\d+\s*(XT|XTX)?|Arc\s*\w+)/i);
  if (rtxMatch) vgaShort = rtxMatch[0].trim();
  else if (vga) vgaShort = vga.split('(')[0].replace(/Card Màn Hình|VGA|Card Đồ Họa/gi, '').trim().slice(0, 20);

  if (cpuShort && vgaShort) {
    return `Cấu Hình PC DRX Gaming (${cpuShort} + ${vgaShort})`;
  } else if (cpuShort) {
    return `Cấu Hình PC DRX Custom (${cpuShort})`;
  } else if (vgaShort) {
    return `Cấu Hình PC DRX Custom (${vgaShort})`;
  }
  return 'Cấu Hình PC DRX Custom Build';
}

function PCBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, addMultipleToCart } = useCart();

  const [allProducts, setAllProducts] = useState<HardwareProduct[]>(INITIAL_PRODUCTS);
  const [selectedBuild, setSelectedBuild] = useState<Record<string, HardwareProduct | null>>({
    cpu: null,
    mainboard: null,
    ram: null,
    vga: null,
    storage: null,
    psu: null,
    case: null,
    cooling: null,
    monitor: null,
  });

  const [customSavedName, setCustomSavedName] = useState<string>('');

  const computedBuildName = useMemo(() => {
    return generateDynamicBuildName(selectedBuild, customSavedName);
  }, [selectedBuild, customSavedName]);

  const [activeStepModal, setActiveStepModal] = useState<string | null>(null);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Modal search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'popular'>('popular');

  // Category matching helper supporting both string and array
  const matchesCategory = (product: any, targetCategory: string) => {
    if (!product || !product.category) return false;
    const target = targetCategory.toUpperCase();
    if (Array.isArray(product.category)) {
      return product.category.some((c: any) => String(c).toUpperCase() === target);
    }
    return String(product.category).toUpperCase() === target;
  };

  // 1-Click Preset Builders linking live Supabase products
  const applyPreset = (type: 'intel' | 'amd' | 'empty', productsPool = allProducts) => {
    if (type === 'empty') {
      setSelectedBuild({
        cpu: null,
        mainboard: null,
        ram: null,
        vga: null,
        storage: null,
        psu: null,
        case: null,
        cooling: null,
        monitor: null,
      });
      setCustomSavedName('');
      showToast('Đã làm mới danh sách linh kiện PC.', 'info');
      return;
    }

    const findProduct = (cat: string, searchKey: string) => {
      return (
        productsPool.find(
          p => matchesCategory(p, cat) && p.name.toLowerCase().includes(searchKey.toLowerCase())
        ) || productsPool.find(p => matchesCategory(p, cat)) || null
      );
    };

    if (type === 'intel') {
      const cpu = findProduct('CPU', '13400F') || findProduct('CPU', 'Intel');
      const mainboard = findProduct('MAINBOARD', 'B760') || findProduct('MAINBOARD', 'Intel') || findProduct('MAINBOARD', '');
      const ram = findProduct('RAM', 'Corsair') || findProduct('RAM', '32GB') || findProduct('RAM', '');
      const vga = findProduct('VGA', '4060') || findProduct('VGA', 'RTX') || findProduct('VGA', '');
      const storage = findProduct('STORAGE', 'Samsung') || findProduct('STORAGE', 'SSD') || findProduct('STORAGE', '');
      const psu = findProduct('PSU', '750') || findProduct('PSU', 'RM750') || findProduct('PSU', '');
      const caseItem = findProduct('CASE', 'NZXT') || findProduct('CASE', 'H9') || findProduct('CASE', '');
      const cooling = findProduct('COOLING', 'Tản') || findProduct('COOLING', 'AIO') || findProduct('COOLING', '');

      setSelectedBuild({
        cpu,
        mainboard,
        ram,
        vga,
        storage,
        psu,
        case: caseItem,
        cooling,
        monitor: null,
      });
      setCustomSavedName('');
      showToast('Đã nạp Cấu Hình Mẫu: PC Gaming Intel Core i5 + RTX 4060!', 'success');
    } else if (type === 'amd') {
      const cpu = findProduct('CPU', '7800X3D') || findProduct('CPU', 'AMD');
      const mainboard = findProduct('MAINBOARD', 'B650') || findProduct('MAINBOARD', 'AM5') || findProduct('MAINBOARD', '');
      const ram = findProduct('RAM', 'Corsair') || findProduct('RAM', 'DDR5') || findProduct('RAM', '');
      const vga = findProduct('VGA', '4060') || findProduct('VGA', 'RTX') || findProduct('VGA', '');
      const storage = findProduct('STORAGE', 'Samsung') || findProduct('STORAGE', 'SSD') || findProduct('STORAGE', '');
      const psu = findProduct('PSU', '750') || findProduct('PSU', 'RM750') || findProduct('PSU', '');
      const caseItem = findProduct('CASE', 'NZXT') || findProduct('CASE', 'H9') || findProduct('CASE', '');
      const cooling = findProduct('COOLING', 'Tản') || findProduct('COOLING', 'AIO') || findProduct('COOLING', '');

      setSelectedBuild({
        cpu,
        mainboard,
        ram,
        vga,
        storage,
        psu,
        case: caseItem,
        cooling,
        monitor: null,
      });
      setCustomSavedName('');
      showToast('Đã nạp Cấu Hình Mẫu: AMD Ryzen 7 7800X3D Siêu Cấp!', 'success');
    }
  };

  // Fetch live products from backend to ensure all latest items are present
  useEffect(() => {
    const fetchPCProducts = () => {
      fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            const normalized = data.products.map((p: any) => ({
              ...p,
              category: Array.isArray(p.category) ? p.category[0] : p.category,
            }));
            setAllProducts(normalized);

            // Only auto-load preset if explicitly requested via URL parameter (?preset=intel / ?preset=amd)
            const loadId = searchParams.get('loadBuildId');
            const presetParam = searchParams.get('preset');
            if (!loadId && presetParam) {
              if (presetParam === 'amd') {
                applyPreset('amd', normalized);
              } else if (presetParam === 'intel') {
                applyPreset('intel', normalized);
              }
            }
          }
        })
        .catch(() => {});
    };

    fetchPCProducts();

    // Supabase Realtime channel for PC Builder
    const channel = supabase
      .channel('pc_builder_products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Product' }, (payload: any) => {
        if (payload.eventType === 'DELETE') {
          const deletedId = payload.old?.id;
          if (deletedId) {
            setAllProducts(prev => prev.filter(p => p.id !== deletedId));
            setSelectedBuild(prev => {
              const updated = { ...prev };
              Object.keys(updated).forEach(k => {
                if (updated[k]?.id === deletedId) {
                  updated[k] = null;
                }
              });
              return updated;
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new;
          if (updated && updated.id) {
            setAllProducts(prev => prev.map(p => {
              if (p.id === updated.id) {
                return {
                  ...p,
                  ...updated,
                  category: Array.isArray(updated.category) ? updated.category[0] : updated.category,
                };
              }
              return p;
            }));
          }
        } else if (payload.eventType === 'INSERT') {
          fetchPCProducts();
        }
      })
      .subscribe();

    window.addEventListener('storage', fetchPCProducts);
    window.addEventListener('ods_products_updated', fetchPCProducts);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', fetchPCProducts);
      window.removeEventListener('ods_products_updated', fetchPCProducts);
    };
  }, []);

  // Restore saved build if loadBuildId is in URL query
  useEffect(() => {
    const loadId = searchParams.get('loadBuildId');
    if (loadId) {
      try {
        const raw = localStorage.getItem('drx_saved_pc_builds');
        if (raw) {
          const list = JSON.parse(raw);
          const found = list.find((b: any) => b.id === loadId);
          if (found) {
            if (found.buildState) {
              setSelectedBuild(found.buildState);
            } else if (found.items && Array.isArray(found.items)) {
              const restored: any = {};
              found.items.forEach((it: any) => {
                restored[it.stepKey] = it.product;
              });
              setSelectedBuild(prev => ({ ...prev, ...restored }));
            }
            if (found.name) setCustomSavedName(found.name);
            showToast(`Đã tải lại cấu hình "${found.name}" vào PC Builder!`, 'success');
          }
        }
      } catch (e) {
        console.error('Lỗi khi tải cấu hình:', e);
      }
    }
  }, [searchParams]);

  // Total cost calculation
  const totalCost = useMemo(() => {
    return Object.values(selectedBuild).reduce((acc, item) => {
      if (!item) return acc;
      return acc + (item.discountPrice || item.price);
    }, 0);
  }, [selectedBuild]);

  const selectedItemsCount = useMemo(() => {
    return Object.values(selectedBuild).filter(Boolean).length;
  }, [selectedBuild]);

  // Compatibility checking (Socket & RAM types)
  const compatibilityAlerts = useMemo(() => {
    const alerts: string[] = [];
    const { cpu, mainboard, ram } = selectedBuild;

    // Check CPU & Mainboard socket match
    if (cpu && mainboard) {
      if (cpu.socket && mainboard.socket && cpu.socket !== mainboard.socket) {
        alerts.push(`Xung đột Socket: CPU (${cpu.socket}) không tương thích với chân cắm Bo Mạch Chủ (${mainboard.socket}).`);
      }
    }

    // Check RAM & Mainboard type match
    if (mainboard && ram) {
      if (mainboard.ramType && ram.ramType && !mainboard.ramType.includes(ram.ramType)) {
        alerts.push(`Xung đột Chuẩn RAM: Mainboard hỗ trợ ${mainboard.ramType} nhưng RAM chọn là ${ram.ramType}.`);
      }
    }

    return alerts;
  }, [selectedBuild]);

  const handleSelectComponent = (stepKey: string, product: HardwareProduct) => {
    setSelectedBuild(prev => ({ ...prev, [stepKey]: product }));
    setActiveStepModal(null);
    setSearchQuery('');
    setSelectedBrand('ALL');
    showToast(`Đã thêm ${product.name} vào cấu hình!`, 'success');
  };

  const handleRemoveComponent = (stepKey: string) => {
    setSelectedBuild(prev => ({ ...prev, [stepKey]: null }));
  };

  const handleClearAll = () => {
    showConfirm({
      title: 'Làm Mới Cấu Hình PC',
      message: 'Bạn có chắc chắn muốn làm mới toàn bộ linh kiện đã chọn trong cấu hình này? Danh sách linh kiện đã chọn sẽ được đưa về trống.',
      confirmText: 'Làm Mới Ngay',
      cancelText: 'Giữ Lại',
      variant: 'warning',
      onConfirm: () => {
        setSelectedBuild({
          cpu: null,
          mainboard: null,
          ram: null,
          vga: null,
          storage: null,
          psu: null,
          case: null,
          cooling: null,
          monitor: null,
        });
        showToast('Đã làm mới cấu hình PC.', 'info');
      }
    });
  };

  // 1-Click Buy Entire PC Build
  const handleBuyAll = () => {
    const itemsToBuy = Object.values(selectedBuild).filter(Boolean) as HardwareProduct[];
    if (itemsToBuy.length === 0) {
      showToast('Vui lòng bấm chọn ít nhất một linh kiện vào cấu hình trước khi thanh toán!', 'error');
      return;
    }

    const cartPayload = itemsToBuy.map(item => ({
      id: item.id,
      productId: item.id,
      name: item.name,
      slug: item.slug || item.id,
      price: item.price,
      discountPrice: item.discountPrice,
      coverImage: item.coverImage,
      platform: 'HARDWARE',
    }));

    try {
      addMultipleToCart(cartPayload, false);
      showToast(`Đã thêm ${itemsToBuy.length} linh kiện vào giỏ hàng!`, 'success');
      router.push('/checkout');
    } catch (e) {
      console.error('Error during handleBuyAll:', e);
      router.push('/checkout');
    }
  };

  // Copy shareable link
  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết công cụ PC Builder!', 'success');
    }
  };

  // Filter products for active step modal
  const activeStepObj = BUILD_STEPS.find(s => s.key === activeStepModal);

  const filteredProducts = useMemo(() => {
    if (!activeStepObj) return [];

    let list = allProducts.filter(p => matchesCategory(p, activeStepObj.category));

    // Socket filter for Mainboard if CPU is already selected
    if (activeStepObj.category === "MAINBOARD" && selectedBuild.cpu?.socket) {
      list = list.filter(p => !p.socket || p.socket === selectedBuild.cpu?.socket);
    }

    // Socket filter for CPU if Mainboard is selected first
    if (activeStepObj.category === "CPU" && selectedBuild.mainboard?.socket) {
      list = list.filter(p => !p.socket || p.socket === selectedBuild.mainboard?.socket);
    }

    // RAM filter for Mainboard
    if (activeStepObj.category === "RAM" && selectedBuild.mainboard?.ramType) {
      list = list.filter(p => !p.ramType || selectedBuild.mainboard?.ramType?.includes(p.ramType));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        (p.socket && p.socket.toLowerCase().includes(q))
      );
    }

    // Brand filter
    if (selectedBrand !== 'ALL') {
      list = list.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    }

    return list;
  }, [activeStepObj, allProducts, selectedBuild, searchQuery, selectedBrand, sortBy]);

  // Extract available brands for active step
  const availableBrands = useMemo(() => {
    if (!activeStepObj) return [];
    const brands = new Set<string>();
    allProducts.filter(p => matchesCategory(p, activeStepObj.category)).forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands);
  }, [activeStepObj, allProducts]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased tech-grid-pattern transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* 1. HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-7 shadow-xs backdrop-blur-md">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0284c7]/10 dark:bg-[#0284c7]/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-sky-50 dark:bg-sky-950/80 text-[#0284c7] dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
                  <Wrench className="w-3.5 h-3.5 text-[#0284c7] dark:text-sky-400" />
                  DRX BUILD PC
                </span>
                <span className="text-[11.5px] font-semibold text-slate-500 dark:text-slate-400">
                  • Chuẩn Socket LGA1700 / AM5 &amp; RAM DDR4 / DDR5
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Tự Phối Cấu Hình PC Gaming &amp; Đồ Họa
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal">
                Tùy chọn linh kiện chính hãng 100%, hệ thống tự động kiểm tra tương thích và tính giá trực tiếp.
              </p>
            </div>

            {selectedItemsCount > 0 && (
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700/80 active:scale-95"
                  title="Làm mới toàn bộ danh sách đã chọn"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm mới ({selectedItemsCount}/9)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. COMPATIBILITY ALERT BANNER */}
        {compatibilityAlerts.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-700/60 rounded-3xl p-5 space-y-2 text-rose-900 dark:text-rose-200 text-sm shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span className="font-heading uppercase tracking-wide text-xs">Cảnh Báo Tương Thích Linh Kiện:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs sm:text-sm font-medium text-rose-800 dark:text-rose-300">
              {compatibilityAlerts.map((alert, idx) => (
                <li key={idx}>{alert}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. MAIN BUILDER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Component Selection Steps (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-[#0284c7]" />
                <h2 className="text-sm sm:text-base font-heading font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Danh Sách Linh Kiện Cấu Hình ({selectedItemsCount}/9)
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button 
                  onClick={handleClearAll}
                  disabled={selectedItemsCount === 0}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 disabled:opacity-40 flex items-center gap-1.5 font-bold transition-colors cursor-pointer bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Làm Mới</span>
                </button>
              </div>
            </div>

            {/* List of Component Cards */}
            <div className="space-y-3.5">
              {BUILD_STEPS.map((step) => {
                const IconComponent = step.icon;
                const selectedItem = selectedBuild[step.key];

                return (
                  <div 
                    key={step.key} 
                    className={`rounded-3xl p-4 sm:p-5 border transition-all ${
                      selectedItem 
                        ? 'bg-white dark:bg-slate-900 border-[#0284c7] dark:border-sky-500/80 shadow-md shadow-sky-500/5' 
                        : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 shadow-xs hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left Icon & Details */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                        
                        {/* Thumbnail or Category Icon */}
                        {selectedItem ? (
                          <div className="relative shrink-0">
                            <img 
                              src={selectedItem.coverImage || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200'} 
                              alt={selectedItem.name}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs"
                            />
                            <span className="absolute -top-1.5 -right-1.5 bg-[#0284c7] text-white p-1 rounded-full shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          </div>
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 bg-sky-50 dark:bg-slate-800 text-[#0284c7] dark:text-sky-400 border border-sky-100 dark:border-slate-700 shadow-2xs">
                            <IconComponent className="w-6 h-6" />
                          </div>
                        )}
                        
                        {/* Text Information */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9.5px] font-black uppercase tracking-wider text-[#0284c7] bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                              BƯỚC {step.stepNum}
                            </span>
                            <h3 className="text-xs sm:text-sm font-heading font-black uppercase text-slate-900 dark:text-white tracking-wide truncate">
                              {step.name}
                            </h3>
                          </div>

                          {selectedItem ? (
                            <div className="space-y-1.5">
                              <p className="text-xs sm:text-sm font-bold text-[#0284c7] dark:text-sky-300 line-clamp-1">
                                {selectedItem.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                                {selectedItem.brand && (
                                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg font-semibold border border-slate-200 dark:border-slate-700">
                                    Hãng: {selectedItem.brand}
                                  </span>
                                )}
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg font-semibold border border-slate-200 dark:border-slate-700">
                                  BH: {selectedItem.warrantyMonths}T
                                </span>
                                {selectedItem.socket && (
                                  <span className="bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-lg font-bold border border-sky-200 dark:border-sky-800">
                                    Socket: {selectedItem.socket}
                                  </span>
                                )}
                                {selectedItem.ramType && (
                                  <span className="bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-lg font-bold border border-purple-200 dark:border-purple-800">
                                    {selectedItem.ramType}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                              {step.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Actions & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 shrink-0">
                        {selectedItem ? (
                          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                            <span className="text-sm sm:text-base font-heading font-black text-rose-600 dark:text-rose-400">
                              {formatVND(selectedItem.discountPrice || selectedItem.price)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setActiveStepModal(step.key)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0284c7] hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                              >
                                Đổi món
                              </button>
                              <button
                                onClick={() => handleRemoveComponent(step.key)}
                                className="p-1.5 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                                title="Xóa linh kiện này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveStepModal(step.key);
                              setSearchQuery('');
                              setSelectedBrand('ALL');
                            }}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-heading font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-500/20 cursor-pointer active:scale-95"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>{step.shortBtn}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Build Summary & Checkout Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sticky top-28 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-xs sm:text-sm font-heading font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Tóm Tắt Cấu Hình</span>
                </h2>
                <span className="font-mono text-xs font-bold text-[#0284c7]">
                  {selectedItemsCount}/9 Món
                </span>
              </div>

              {/* Items checklist */}
              <div className="space-y-2.5 text-xs max-h-64 overflow-y-auto pr-1">
                {BUILD_STEPS.map((step) => {
                  const item = selectedBuild[step.key];
                  return (
                    <div key={step.key} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                      <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">{step.shortBtn.replace('Chọn ', '')}:</span>
                      {item ? (
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-right line-clamp-1 max-w-[170px] text-[11px]" title={item.name}>
                          {item.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 italic text-[11px]">Chưa chọn</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total Summary Box (No Wattage display) */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10.5px] uppercase font-bold text-slate-500 tracking-wider block">
                  Tổng Tiền Cấu Hình (Đã Gồm VAT):
                </span>
                <span className="text-xl sm:text-2xl font-heading font-black text-rose-600 dark:text-rose-400 block">
                  {formatVND(totalCost)}
                </span>
                <span className="text-[10.5px] text-slate-400 block">
                  Miễn phí lắp ráp, vệ sinh &amp; bảo hành 36 tháng
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2.5 pt-1">
                {/* 1. MUA TOÀN BỘ CẤU HÌNH */}
                <button
                  type="button"
                  onClick={handleBuyAll}
                  className={`w-full py-3.5 rounded-2xl font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    selectedItemsCount > 0 
                      ? 'bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#0284c7] hover:from-[#0369a1] hover:to-[#0284c7] text-white shadow-sky-500/25 active:scale-95' 
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 active:scale-95'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Mua Toàn Bộ Cấu Hình Này {selectedItemsCount > 0 ? `(${selectedItemsCount}/9 Món)` : ''}</span>
                </button>

                {/* 2. XUẤT ẢNH BÁO GIÁ & HÓA ĐƠN */}
                <button
                  type="button"
                  onClick={() => setIsQuotationOpen(true)}
                  disabled={selectedItemsCount === 0}
                  className="w-full py-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/80 disabled:opacity-50 text-[#0284c7] dark:text-sky-300 text-xs font-heading font-black uppercase tracking-wider flex items-center justify-center gap-2 border border-sky-200 dark:border-sky-800 transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất Ảnh Báo Giá (.PNG / PDF)</span>
                </button>

                {/* 3. LƯU VÀO PROFILE */}
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(true)}
                  disabled={selectedItemsCount === 0}
                  className="w-full py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/80 disabled:opacity-50 text-amber-700 dark:text-amber-300 text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer active:scale-95"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Lưu Vào Cấu Hình Đã Lưu</span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cam kết 100% linh kiện chính hãng</span>
                </p>
                <p>🚚 Giao hàng COD tận nơi toàn quốc</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 4. MODAL SELECTION COMPONENT (HIGH-CRAFT PRODUCT PICKER) */}
      {activeStepModal && activeStepObj && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-950">
              <div className="space-y-0.5">
                <h3 className="text-sm font-heading font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <span>CHỌN {activeStepObj.name}</span>
                </h3>
                {selectedBuild.cpu && activeStepObj.category === 'MAINBOARD' && (
                  <p className="text-xs text-[#0284c7] font-bold">
                    💡 Đã lọc Mainboard khớp Socket {selectedBuild.cpu.socket} với CPU {selectedBuild.cpu.brand}!
                  </p>
                )}
              </div>
              <button 
                onClick={() => setActiveStepModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm linh kiện theo tên, socket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                {availableBrands.length > 0 && (
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="ALL">Tất Cả Thương Hiệu</option>
                    {availableBrands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                )}

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold cursor-pointer"
                >
                  <option value="popular">Nổi Bật / Bán Chạy</option>
                  <option value="price_asc">Giá: Thấp Đến Cao</option>
                  <option value="price_desc">Giá: Cao Đến Thấp</option>
                </select>
              </div>
            </div>

            {/* Modal Product List */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Cpu className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-bold">Không tìm thấy linh kiện phù hợp với bộ lọc.</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#0284c7] transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <img 
                        src={product.coverImage || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200'} 
                        alt={product.name} 
                        className="w-16 h-16 rounded-xl object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {product.name}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 text-[10.5px]">
                          {product.brand && (
                            <span className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold border border-slate-200 dark:border-slate-800">
                              Hãng: {product.brand}
                            </span>
                          )}
                          <span className="bg-white dark:bg-slate-900 text-[#0284c7] dark:text-sky-300 px-2 py-0.5 rounded-md font-semibold border border-slate-200 dark:border-slate-800">
                            BH: {product.warrantyMonths}T
                          </span>
                          {product.socket && (
                            <span className="bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-md font-bold border border-sky-200 dark:border-sky-800">
                              Socket: {product.socket}
                            </span>
                          )}
                          {product.ramType && (
                            <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-md font-bold border border-purple-200 dark:border-purple-800">
                              {product.ramType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-slate-200 dark:border-slate-900 pt-2 sm:pt-0 shrink-0">
                      <span className="text-sm sm:text-base font-heading font-black text-rose-600 dark:text-rose-400">
                        {formatVND(product.discountPrice || product.price)}
                      </span>
                      <button
                        onClick={() => handleSelectComponent(activeStepModal, product)}
                        className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-heading font-black uppercase tracking-wider shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        Chọn Linh Kiện
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. QUOTATION & INVOICE EXPORT MODAL */}
      {isQuotationOpen && (
        <BuildQuotationModal
          build={selectedBuild}
          totalCost={totalCost}
          buildName={computedBuildName}
          onClose={() => setIsQuotationOpen(false)}
          onBuyAll={handleBuyAll}
        />
      )}

      {/* 6. SAVE BUILD MODAL */}
      {isSaveModalOpen && (
        <SaveBuildModal
          build={selectedBuild}
          totalCost={totalCost}
          defaultBuildName={computedBuildName}
          onClose={() => setIsSaveModalOpen(false)}
          onSaved={(saved) => {
            setCustomSavedName(saved.name);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

export default function PCBuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-mono">Đang tải PC Builder...</div>}>
      <PCBuilderContent />
    </Suspense>
  );
}
