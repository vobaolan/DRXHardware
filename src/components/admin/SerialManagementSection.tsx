"use client";

import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, Plus, Boxes, Trash2, Copy, ChevronDown, ChevronUp, 
  LayoutGrid, List, Check, ExternalLink, ShieldCheck, Tag, 
  Layers, Package, CheckCircle2, ChevronLeft, ChevronRight, X,
  Clock, Hash, Sparkles, Filter, RefreshCw
} from 'lucide-react';
import { showToast, showConfirm } from '@/components/Toast';
import { ModernSelect, SelectOption } from '@/components/ui/ModernSelect';
import { PortalDropdown } from '@/components/ui/PortalDropdown';

// Serial Status Button with dropdown portal
export function SerialStatusButton({
  serial,
  onUpdateStatus,
}: {
  serial: any;
  onUpdateStatus: (serialId: string, newStatus: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const status = serial.status || 'AVAILABLE';

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer shadow-xs active:scale-95 border ${
          status === 'AVAILABLE'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
            : status === 'SOLD'
            ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-200'
            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100'
        }`}
        title="Click để cập nhật trạng thái Serial"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'AVAILABLE' ? 'bg-emerald-500' : status === 'SOLD' ? 'bg-slate-400' : 'bg-amber-500'
        }`}></span>
        <span>{status === 'AVAILABLE' ? 'Trong Kho' : status === 'SOLD' ? 'Đã Xuất Bán' : 'Bảo Hành'}</span>
        <ChevronDown className={`w-3 h-3 ml-0.5 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <PortalDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={btnRef}
        width={250}
      >
        <div className="px-2.5 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
          Cập Nhật Trạng Thái SN
        </div>

        {/* Option AVAILABLE */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(serial.id, 'AVAILABLE');
            setIsOpen(false);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
            status === 'AVAILABLE'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <div>
              <span className="block text-xs">Trong Kho (AVAILABLE)</span>
              <span className="block text-[10px] text-slate-400 font-normal">Sẵn sàng xuất bán & ráp máy</span>
            </div>
          </div>
          {status === 'AVAILABLE' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
        </button>

        {/* Option SOLD */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(serial.id, 'SOLD');
            setIsOpen(false);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
            status === 'SOLD'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <div>
              <span className="block text-xs">Đã Xuất Bán (SOLD)</span>
              <span className="block text-[10px] text-slate-400 font-normal">Đã xuất theo đơn hàng</span>
            </div>
          </div>
          {status === 'SOLD' && <Check className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />}
        </button>

        {/* Option WARRANTY */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(serial.id, 'WARRANTY');
            setIsOpen(false);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
            status === 'WARRANTY'
              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-extrabold'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <div>
              <span className="block text-xs">Bảo Hành (WARRANTY)</span>
              <span className="block text-[10px] text-slate-400 font-normal">Đang bảo hành xử lý</span>
            </div>
          </div>
          {status === 'WARRANTY' && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
        </button>
      </PortalDropdown>
    </>
  );
}

// Category options matching Kho Linh Kiện
export const CATEGORY_NAMES: Record<string, string> = {
  ALL: 'Tất Cả Danh Mục',
  CPU: 'Bộ Vi Xử Lý (CPU)',
  VGA: 'Card Màn Hình (VGA)',
  MAINBOARD: 'Bo Mạch Chủ (Mainboard)',
  RAM: 'Bộ Nhớ Trong (RAM)',
  STORAGE: 'Ổ Cứng SSD / HDD',
  PSU: 'Nguồn Máy Tính (PSU)',
  CASE: 'Vỏ Máy Tính (Case)',
  COOLING: 'Tản Nhiệt (Cooling)',
  MONITOR: 'Màn Hình (Monitor)',
  KEYBOARD: 'Bàn Phím Cơ & Chuột',
  HEADSET: 'Tai Nghe Gaming',
  GEAR: 'Gaming Gear Tổng Hợp',
  LAPTOP: 'Laptop Văn Phòng',
  LAPTOP_GAMING: 'Laptop Gaming & Đồ Họa',
  PREBUILT_PC: 'PC Lắp Sẵn DRX',
  ACCESSORY: 'Phụ Kiện Máy Tính',
};

export const CATEGORY_FILTER_OPTIONS: SelectOption[] = Object.entries(CATEGORY_NAMES).map(([key, label]) => ({
  value: key,
  label: label,
  badge: key === 'ALL' ? 'TẤT CẢ' : key,
}));

export const SERIAL_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'Tất Cả Trạng Thái SN', badge: 'TẤT CẢ' },
  { value: 'AVAILABLE', label: 'Trong Kho (AVAILABLE)', badge: 'SẴN SÀNG' },
  { value: 'SOLD', label: 'Đã Xuất Bán (SOLD)', badge: 'ĐÃ BÁN' },
  { value: 'WARRANTY', label: 'Đang Bảo Hành (WARRANTY)', badge: 'BẢO HÀNH' },
];

interface SerialManagementSectionProps {
  products: any[];
  serials: any[];
  orders: any[];
  onUpdateSerialStatus: (serialId: string, newStatus: string) => void;
  onDeleteSerial: (serialId: string) => void;
  onOpenAddSerialModal: (productId?: string) => void;
  onViewOrder: (order: any) => void;
  formatOrderDisplayCode: (ord: any) => string;
}

export function SerialManagementSection({
  products,
  serials,
  orders,
  onUpdateSerialStatus,
  onDeleteSerial,
  onOpenAddSerialModal,
  onViewOrder,
  formatOrderDisplayCode,
}: SerialManagementSectionProps) {
  // View states
  const [viewMode, setViewMode] = useState<'by_product' | 'flat'>('by_product');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());

  // Pagination states
  const [flatPage, setFlatPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const FLAT_PAGE_SIZE = 15;
  const PRODUCT_PAGE_SIZE = 12;

  // Copy to clipboard helper
  const handleCopy = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      showToast(`Đã sao chép: ${text}`, 'success');
    }
  };

  // Toggle single product expansion
  const toggleProductExpand = (productId: string) => {
    setExpandedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Expand / Collapse all
  const handleExpandAll = (expand: boolean, allIds: string[]) => {
    if (expand) {
      setExpandedProductIds(new Set(allIds));
    } else {
      setExpandedProductIds(new Set());
    }
  };

  // KPI calculations
  const totalSerialsCount = serials.length;
  const availableSerialsCount = serials.filter((s) => s.status === 'AVAILABLE').length;
  const soldSerialsCount = serials.filter((s) => s.status === 'SOLD').length;
  const warrantySerialsCount = serials.filter((s) => s.status === 'WARRANTY').length;

  // Map serials by productId
  const serialsByProductId = useMemo(() => {
    const map = new Map<string, any[]>();
    serials.forEach((s) => {
      const pId = s.productId || s.product?.id;
      if (pId) {
        if (!map.has(pId)) map.set(pId, []);
        map.get(pId)!.push(s);
      }
    });
    return map;
  }, [serials]);

  const coveredProductsCount = useMemo(() => {
    return products.filter((p) => {
      const list = serialsByProductId.get(p.id);
      return list && list.length > 0;
    }).length;
  }, [products, serialsByProductId]);

  // Helper to check category match
  const checkCategoryMatch = (prodCategory: string | undefined, filterCategory: string) => {
    if (!filterCategory || filterCategory === 'ALL') return true;
    if (!prodCategory) return false;
    if (prodCategory === filterCategory) return true;
    if (filterCategory === 'STORAGE' && (prodCategory === 'SSD' || prodCategory === 'STORAGE' || prodCategory === 'HDD')) return true;
    if (filterCategory === 'LAPTOP' && (prodCategory === 'LAPTOP' || prodCategory === 'LAPTOP_GAMING')) return true;
    if (filterCategory === 'KEYBOARD' && (prodCategory === 'KEYBOARD' || prodCategory === 'KEYBOARD_MOUSE' || prodCategory === 'MOUSE')) return true;
    if (filterCategory === 'GEAR' && (prodCategory === 'GEAR' || prodCategory === 'KEYBOARD' || prodCategory === 'MOUSE' || prodCategory === 'HEADSET')) return true;
    return false;
  };

  // 1. Grouped by Product data list
  const productSerialGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const groups = products.map((prod) => {
      const productSerials = serialsByProductId.get(prod.id) || [];
      const availableCount = productSerials.filter((s) => s.status === 'AVAILABLE').length;
      const soldCount = productSerials.filter((s) => s.status === 'SOLD').length;
      const warrantyCount = productSerials.filter((s) => s.status === 'WARRANTY').length;
      const totalCount = productSerials.length;

      // Filter serials within product if status filter is active
      let matchingSerials = productSerials;
      if (statusFilter !== 'ALL') {
        matchingSerials = matchingSerials.filter((s) => s.status === statusFilter);
      }

      // Check search match
      const matchesProductText =
        !q ||
        (prod.name && prod.name.toLowerCase().includes(q)) ||
        (prod.brand && prod.brand.toLowerCase().includes(q)) ||
        (prod.modelCode && prod.modelCode.toLowerCase().includes(q)) ||
        (prod.category && prod.category.toLowerCase().includes(q));

      const matchesSerialText =
        q &&
        productSerials.some(
          (s) =>
            (s.serialNumber && s.serialNumber.toLowerCase().includes(q)) ||
            (s.order?.orderCode && s.order.orderCode.toLowerCase().includes(q)) ||
            (s.order?.customerName && s.order.customerName.toLowerCase().includes(q)) ||
            (s.order?.customerPhone && s.order.customerPhone.includes(q))
        );

      const matchesCategory = checkCategoryMatch(prod.category, selectedCategory);
      const matchesStatus = statusFilter === 'ALL' || matchingSerials.length > 0;

      const isVisible = matchesCategory && matchesStatus && (matchesProductText || matchesSerialText);

      return {
        product: prod,
        serials: matchingSerials,
        allSerials: productSerials,
        availableCount,
        soldCount,
        warrantyCount,
        totalCount,
        isVisible,
      };
    }).filter((g) => g.isVisible);

    // Sort: products with serials first, then by name
    return groups.sort((a, b) => {
      if (a.totalCount > 0 && b.totalCount === 0) return -1;
      if (a.totalCount === 0 && b.totalCount > 0) return 1;
      return (a.product.name || '').localeCompare(b.product.name || '');
    });
  }, [products, serialsByProductId, searchQuery, selectedCategory, statusFilter]);

  // Paginated product groups
  const totalProductPages = Math.ceil(productSerialGroups.length / PRODUCT_PAGE_SIZE) || 1;
  const paginatedProductGroups = useMemo(() => {
    const start = (productPage - 1) * PRODUCT_PAGE_SIZE;
    return productSerialGroups.slice(start, start + PRODUCT_PAGE_SIZE);
  }, [productSerialGroups, productPage]);

  // 2. Filtered Serials for Flat Table View
  const filteredFlatSerials = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return serials.filter((s) => {
      const matchesSearch =
        !q ||
        (s.serialNumber && s.serialNumber.toLowerCase().includes(q)) ||
        (s.product?.name && s.product.name.toLowerCase().includes(q)) ||
        (s.product?.brand && s.product.brand.toLowerCase().includes(q)) ||
        (s.product?.modelCode && s.product.modelCode.toLowerCase().includes(q)) ||
        (s.product?.category && s.product.category.toLowerCase().includes(q)) ||
        (s.order?.orderCode && s.order.orderCode.toLowerCase().includes(q)) ||
        (s.order?.customerName && s.order.customerName.toLowerCase().includes(q)) ||
        (s.order?.customerPhone && s.order.customerPhone.includes(q));

      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchesCategory = checkCategoryMatch(s.product?.category, selectedCategory);

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [serials, searchQuery, statusFilter, selectedCategory]);

  const totalFlatPages = Math.ceil(filteredFlatSerials.length / FLAT_PAGE_SIZE) || 1;
  const paginatedFlatSerials = useMemo(() => {
    const start = (flatPage - 1) * FLAT_PAGE_SIZE;
    return filteredFlatSerials.slice(start, start + FLAT_PAGE_SIZE);
  }, [filteredFlatSerials, flatPage]);

  return (
    <div className="space-y-5">
      {/* ============================================================ */}
      {/* 1. TOP KPI METRIC CARDS                                      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Total Serials */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tổng Serial Kho
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                {totalSerialsCount}
              </span>
              <span className="text-[10px] font-bold text-[#0284c7]">Mã SN</span>
            </div>
            <p className="text-[10px] text-slate-400">Phủ sóng {coveredProductsCount}/{products.length} sản phẩm</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] flex items-center justify-center border border-sky-200 dark:border-sky-800 shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Available in Stock */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Sẵn Sàng Xuất Kho
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400">
                {availableSerialsCount}
              </span>
              <span className="text-[10px] font-bold text-emerald-500">
                {totalSerialsCount > 0 ? `${Math.round((availableSerialsCount / totalSerialsCount) * 100)}%` : '0%'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Sẵn sàng ráp máy & bán lẻ</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Sold Serials */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Đã Xuất Bán
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-heading text-slate-800 dark:text-slate-200">
                {soldSerialsCount}
              </span>
              <span className="text-[10px] font-bold text-slate-400">Theo đơn hàng</span>
            </div>
            <p className="text-[10px] text-slate-400">Gắn liền bảo hành khách hàng</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Warranty Serials */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Đang Bảo Hành
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-heading text-amber-600 dark:text-amber-400">
                {warrantySerialsCount}
              </span>
              <span className="text-[10px] font-bold text-amber-500">Mã SN</span>
            </div>
            <p className="text-[10px] text-slate-400">Đang xử lý kỹ thuật / hãng</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TOOLBAR: SEARCH, CATEGORY DROPDOWN, STATUS DROPDOWN, VIEW MODE */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setProductPage(1);
              setFlatPage(1);
            }}
            placeholder="Tìm theo Serial SN, tên linh kiện, SKU, hãng, mã đơn..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-8 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setProductPage(1);
                setFlatPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters & Actions Group */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Category Dropdown (Same as Kho Linh Kiện) */}
          <div className="w-56 sm:w-64">
            <ModernSelect
              options={CATEGORY_FILTER_OPTIONS}
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(String(val));
                setProductPage(1);
                setFlatPage(1);
              }}
              placeholder="Lọc theo danh mục..."
            />
          </div>

          {/* Status Dropdown */}
          <div className="w-56 sm:w-64">
            <ModernSelect
              options={SERIAL_STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(String(val));
                setProductPage(1);
                setFlatPage(1);
              }}
              placeholder="Trạng thái Serial..."
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('by_product')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'by_product'
                  ? 'bg-white dark:bg-slate-900 text-[#0284c7] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Xem danh sách nhóm theo sản phẩm"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Theo Sản Phẩm</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('flat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'flat'
                  ? 'bg-white dark:bg-slate-900 text-[#0284c7] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Xem bảng chi tiết tất cả Serial"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tất Cả SN</span>
            </button>
          </div>

          {/* New Serial Button */}
          <button
            onClick={() => onOpenAddSerialModal()}
            className="px-4 py-2 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-sky-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nhập Mã SN Mới</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MODE 1: GROUPED BY PRODUCT VIEW (PRIMARY)                 */}
      {/* ============================================================ */}
      {viewMode === 'by_product' && (
        <div className="space-y-4">
          {/* Header Bar for Mode 1 */}
          <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
            <div>
              Hiển thị <strong className="text-slate-900 dark:text-white font-bold">{productSerialGroups.length}</strong> sản phẩm phù hợp
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExpandAll(true, productSerialGroups.map((g) => g.product.id))}
                className="hover:text-[#0284c7] font-semibold cursor-pointer underline"
              >
                Mở rộng tất cả
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleExpandAll(false, [])}
                className="hover:text-[#0284c7] font-semibold cursor-pointer underline"
              >
                Thu gọn tất cả
              </button>
            </div>
          </div>

          {productSerialGroups.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] flex items-center justify-center mx-auto border border-sky-200 dark:border-sky-800 shadow-sm mb-3">
                <Boxes className="w-7 h-7" />
              </div>
              <h4 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                Không Tìm Thấy Sản Phẩm Phù Hợp
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Không có linh kiện nào khớp với từ khóa tìm kiếm hoặc bộ lọc danh mục/trạng thái Serial hiện tại.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setStatusFilter('ALL');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đặt Lại Bộ Lọc</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedProductGroups.map((group) => {
                const { product, serials: itemSerials, availableCount, soldCount, warrantyCount, totalCount } = group;
                const isExpanded = expandedProductIds.has(product.id);
                const sku = product.modelCode || '';

                return (
                  <div
                    key={product.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'border-[#0284c7]/50 shadow-md ring-1 ring-sky-500/10'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                    }`}
                  >
                    {/* Card Header Row */}
                    <div
                      onClick={() => toggleProductExpand(product.id)}
                      className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/20 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Left: Product Thumbnail & Title */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {product.coverImage ? (
                          <img
                            src={product.coverImage}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-800">
                            <Boxes className="w-6 h-6" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] border border-sky-200 dark:border-sky-800">
                              {product.category || 'PART'}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {product.brand || 'DRX'}
                            </span>
                            {sku && (
                              <button
                                type="button"
                                onClick={(e) => handleCopy(sku, e)}
                                className="group inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#0284c7]"
                                title="Click để copy SKU"
                              >
                                <span>SKU: {sku}</span>
                                <Copy className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 text-[#0284c7]" />
                              </button>
                            )}
                          </div>
                          <h4 className="font-heading font-black text-slate-900 dark:text-white text-xs sm:text-sm line-clamp-1">
                            {product.name}
                          </h4>
                        </div>
                      </div>

                      {/* Right: Metrics Badges & Action Buttons */}
                      <div className="flex items-center gap-2.5 flex-wrap justify-between lg:justify-end shrink-0">
                        {/* Status Count Badges */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1"
                            title="Số Serial có sẵn trong kho"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{availableCount} Trong kho</span>
                          </span>

                          {soldCount > 0 && (
                            <span
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold"
                              title="Số Serial đã xuất bán theo đơn"
                            >
                              {soldCount} Đã bán
                            </span>
                          )}

                          {warrantyCount > 0 && (
                            <span
                              className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold"
                              title="Số Serial đang bảo hành"
                            >
                              {warrantyCount} BH
                            </span>
                          )}

                          <span className="text-xs font-mono font-bold text-slate-400 pl-1">
                            Tổng: {totalCount} SN
                          </span>
                        </div>

                        {/* Quick Add Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAddSerialModal(product.id);
                          }}
                          className="px-3 py-1.5 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-[#0284c7] dark:text-sky-300 text-xs font-bold rounded-xl border border-sky-200 dark:border-sky-800 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                          title="Thêm nhanh mã Serial cho sản phẩm này"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Nhập SN</span>
                        </button>

                        {/* Expand Accordion Button */}
                        <button
                          type="button"
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Preview Serial Badges (When not expanded or for quick copy) */}
                    <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">
                        Mã SN:
                      </span>
                      {itemSerials.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Chưa có mã serial nào trong kho</span>
                      ) : (
                        itemSerials.slice(0, 6).map((s) => {
                          const isAvail = s.status === 'AVAILABLE';
                          const isSold = s.status === 'SOLD';
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={(e) => handleCopy(s.serialNumber, e)}
                              className={`group inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] border transition-all cursor-pointer active:scale-95 ${
                                isAvail
                                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                  : isSold
                                  ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              }`}
                              title={`Click để copy SN: ${s.serialNumber} (${s.status})`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isAvail ? 'bg-emerald-500' : isSold ? 'bg-slate-400' : 'bg-amber-500'
                                }`}></span>
                              <span className="font-bold">{s.serialNumber}</span>
                              <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                            </button>
                          );
                        })
                      )}
                      {itemSerials.length > 6 && (
                        <button
                          type="button"
                          onClick={() => toggleProductExpand(product.id)}
                          className="text-[11px] font-bold text-[#0284c7] hover:underline cursor-pointer ml-1"
                        >
                          +{itemSerials.length - 6} mã khác...
                        </button>
                      )}
                    </div>

                    {/* EXPANDED ACCORDION: FULL SERIAL TABLE FOR THIS PRODUCT */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                                  <th className="py-2.5 px-3.5">Mã Serial Number (SN)</th>
                                  <th className="py-2.5 px-3 text-center">Trạng Thái Kho</th>
                                  <th className="py-2.5 px-3">Ngày Nhập Kho</th>
                                  <th className="py-2.5 px-3">Đơn Hàng Xuất Bán</th>
                                  <th className="py-2.5 px-3 text-right">Thao Tác</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {itemSerials.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                                      Chưa có mã serial nào. Click "+ Nhập SN" ở trên để gán mã vào kho.
                                    </td>
                                  </tr>
                                ) : (
                                  itemSerials.map((s) => {
                                    const ord = s.order;
                                    return (
                                      <tr
                                        key={s.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                      >
                                        {/* SERIAL WITH COPY */}
                                        <td className="py-3 px-3.5 font-mono whitespace-nowrap">
                                          <div className="inline-flex items-center gap-1.5">
                                            <span className="font-black text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                                              {s.serialNumber}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleCopy(s.serialNumber)}
                                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                              title="Sao chép Serial"
                                            >
                                              <Copy className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </td>

                                        {/* STATUS QUICK TOGGLE */}
                                        <td className="py-3 px-3 text-center whitespace-nowrap">
                                          <SerialStatusButton
                                            serial={s}
                                            onUpdateStatus={onUpdateSerialStatus}
                                          />
                                        </td>

                                        {/* IMPORT / SOLD DATE */}
                                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                                          <div>{new Date(s.createdAt).toLocaleDateString('vi-VN')}</div>
                                          {s.soldDate && (
                                            <div className="text-[10px] text-slate-400">
                                              Xuất: {new Date(s.soldDate).toLocaleDateString('vi-VN')}
                                            </div>
                                          )}
                                        </td>

                                        {/* LINKED ORDER */}
                                        <td className="py-3 px-3 whitespace-nowrap text-xs">
                                          {ord ? (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const fullOrder = orders.find((o) => o.id === ord.id) || ord;
                                                onViewOrder(fullOrder);
                                              }}
                                              className="text-left group cursor-pointer"
                                            >
                                              <span className="font-mono font-bold text-[#0284c7] group-hover:underline block">
                                                {formatOrderDisplayCode(ord)}
                                              </span>
                                              {(ord.customerName || ord.customerPhone) && (
                                                <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                                                  {ord.customerName || ord.customerPhone}
                                                </span>
                                              )}
                                            </button>
                                          ) : (
                                            <span className="text-slate-400 font-mono">-</span>
                                          )}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="py-3 px-3 text-right whitespace-nowrap">
                                          <button
                                            type="button"
                                            onClick={() => onDeleteSerial(s.id)}
                                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
                                            title="Xóa Serial"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Product View Pagination */}
          {totalProductPages > 1 && (
            <div className="flex items-center justify-between pt-2 px-1 text-xs">
              <span className="text-slate-400">
                Trang <strong className="text-slate-700 dark:text-slate-300">{productPage}</strong> / {totalProductPages} (Tổng {productSerialGroups.length} sản phẩm)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={productPage <= 1}
                  onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Trước
                </button>
                <button
                  type="button"
                  disabled={productPage >= totalProductPages}
                  onClick={() => setProductPage((p) => Math.min(totalProductPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                >
                  Sau <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODE 2: FLAT AUDIT TABLE VIEW (DETAILED AUDIT)           */}
      {/* ============================================================ */}
      {viewMode === 'flat' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Mã Serial (SN)</th>
                    <th className="py-3 px-3">Linh Kiện Liên Kết</th>
                    <th className="py-3 px-3">Danh Mục</th>
                    <th className="py-3 px-3 text-center">Trạng Thái Kho</th>
                    <th className="py-3 px-3">Ngày Nhập / Xuất</th>
                    <th className="py-3 px-3">Đơn Hàng Liên Kết</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedFlatSerials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] flex items-center justify-center border border-sky-200 dark:border-sky-800 shadow-sm">
                            <Boxes className="w-7 h-7" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-heading font-black text-sm text-slate-800 dark:text-slate-200">
                              Không Tìm Thấy Mã Serial Nào
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Không có dữ liệu mã serial nào phù hợp với từ khóa hoặc bộ lọc đã chọn.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedFlatSerials.map((s) => {
                      const prod = s.product;
                      const ord = s.order;
                      const sku = prod?.modelCode || '';

                      return (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          {/* SERIAL NUMBER */}
                          <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-900 dark:text-white px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-block text-xs">
                                {s.serialNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(s.serialNumber)}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                title="Sao chép Serial"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {sku && (
                              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                                SKU: <span className="text-slate-600 dark:text-slate-300 font-bold">{sku}</span>
                              </span>
                            )}
                          </td>

                          {/* PRODUCT INFO */}
                          <td className="py-3.5 px-3 min-w-[220px]">
                            <div className="flex items-center gap-2.5">
                              {prod?.coverImage ? (
                                <img
                                  src={prod.coverImage}
                                  alt={prod.name}
                                  className="w-9 h-9 rounded-lg object-contain bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-800">
                                  <Boxes className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 dark:text-white line-clamp-1 block text-xs" title={prod?.name}>
                                  {prod?.name || 'Linh kiện DRX'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Hãng: {prod?.brand || 'DRX'} • BH {prod?.warrantyMonths || 36}T
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* CATEGORY */}
                          <td className="py-3.5 px-3 font-extrabold text-[#0284c7] text-[10px] uppercase whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800">
                              {prod?.category || 'PART'}
                            </span>
                          </td>

                          {/* STATUS QUICK TOGGLE */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <SerialStatusButton
                              serial={s}
                              onUpdateStatus={onUpdateSerialStatus}
                            />
                          </td>

                          {/* IMPORT / SOLD DATE */}
                          <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                            <div>Nhập: {new Date(s.createdAt).toLocaleDateString('vi-VN')}</div>
                            {s.soldDate && (
                              <div className="text-[10px] text-slate-400">Xuất: {new Date(s.soldDate).toLocaleDateString('vi-VN')}</div>
                            )}
                          </td>

                          {/* LINKED ORDER */}
                          <td className="py-3.5 px-3 whitespace-nowrap text-xs">
                            {ord ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const fullOrder = orders.find((o) => o.id === ord.id) || ord;
                                  onViewOrder(fullOrder);
                                }}
                                className="text-left group cursor-pointer"
                              >
                                <span className="font-mono font-bold text-[#0284c7] group-hover:underline block">
                                  {formatOrderDisplayCode(ord)}
                                </span>
                                {(ord.customerName || ord.customerPhone) && (
                                  <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                                    {ord.customerName || ord.customerPhone}
                                  </span>
                                )}
                              </button>
                            ) : (
                              <span className="text-slate-400 font-mono">-</span>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onDeleteSerial(s.id)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
                              title="Xóa Serial"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Flat Table Pagination */}
          {totalFlatPages > 1 && (
            <div className="flex items-center justify-between pt-2 px-1 text-xs">
              <span className="text-slate-400">
                Hiển thị <strong className="text-slate-700 dark:text-slate-300">{(flatPage - 1) * FLAT_PAGE_SIZE + 1} - {Math.min(flatPage * FLAT_PAGE_SIZE, filteredFlatSerials.length)}</strong> trên tổng số {filteredFlatSerials.length} mã SN
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={flatPage <= 1}
                  onClick={() => setFlatPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Trước
                </button>
                <span className="px-2 font-mono font-bold text-slate-600 dark:text-slate-400">
                  {flatPage} / {totalFlatPages}
                </span>
                <button
                  type="button"
                  disabled={flatPage >= totalFlatPages}
                  onClick={() => setFlatPage((p) => Math.min(totalFlatPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                >
                  Sau <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
