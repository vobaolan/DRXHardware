'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Plus, Trash2, Image as ImageIcon, Sparkles, Check, 
  Cpu, HardDrive, Monitor, Box, Zap, Fan, Gamepad2, Laptop, 
  ShieldCheck, DollarSign, Layers, Tag, ExternalLink, RefreshCw,
  Upload, CheckCircle2, FileImage, Star
} from 'lucide-react';
import { showToast } from '@/components/Toast';
import { authFetch } from '@/lib/auth-client';
import { ModernSelect, SelectOption } from '@/components/ui/ModernSelect';

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'CPU', label: 'Bộ Vi Xử Lý (CPU)', badge: 'CPU' },
  { value: 'VGA', label: 'Card Màn Hình (VGA)', badge: 'GPU' },
  { value: 'MAINBOARD', label: 'Bo Mạch Chủ (Mainboard)', badge: 'Main' },
  { value: 'RAM', label: 'Bộ Nhớ Trong (RAM)', badge: 'RAM' },
  { value: 'STORAGE', label: 'Ổ Cứng Lưu Trữ (SSD / HDD)', badge: 'Drive' },
  { value: 'PSU', label: 'Nguồn Máy Tính (PSU)', badge: 'Power' },
  { value: 'CASE', label: 'Vỏ Case Máy Tính', badge: 'Case' },
  { value: 'COOLING', label: 'Tản Nhiệt Nước / Khí (Cooling)', badge: 'Cooler' },
  { value: 'MONITOR', label: 'Màn Hình Máy Tính (Monitor)', badge: 'Màn Hình' },
  { value: 'KEYBOARD', label: 'Bàn Phím Cơ & Chuột (Keyboard & Mouse)', badge: 'Phím Chuột' },
  { value: 'HEADSET', label: 'Tai Nghe Gaming (Headset)', badge: 'Audio' },
  { value: 'GEAR', label: 'Gaming Gear Tổng Hợp', badge: 'Gear' },
  { value: 'LAPTOP', label: 'Laptop Văn Phòng', badge: 'Laptop' },
  { value: 'LAPTOP_GAMING', label: 'Laptop Gaming & Đồ Họa', badge: 'Gaming' },
  { value: 'PREBUILT_PC', label: 'PC Gắn Sẵn / PC Đồng Bộ DRX', badge: 'PC Đồng Bộ' },
];

const WARRANTY_OPTIONS: SelectOption[] = [
  { value: 12, label: '12 Tháng (1 Năm)', badge: '1 Năm' },
  { value: 24, label: '24 Tháng (2 Năm)', badge: '2 Năm' },
  { value: 36, label: '36 Tháng (3 Năm)', badge: 'Chuẩn 3 Năm' },
  { value: 60, label: '60 Tháng (5 Năm)', badge: 'VIP 5 Năm' },
  { value: 72, label: '72 Tháng (6 Năm)', badge: '6 Năm' },
];

export interface ProductFormData {
  id?: string;
  name: string;
  category: string;
  brand: string;
  modelCode?: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  warrantyMonths: number;
  coverImage: string;
  screenshots: string[];
  socket?: string;
  ramType?: string;
  wattage?: number;
  formFactor?: string;
  specs: Record<string, string>;
  description?: string;
  isFlashDeal?: boolean;
  isFeatured?: boolean;
  isPrebuilt?: boolean;
  status?: boolean;
}

interface ProductFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: ProductFormData | null;
  onClose: () => void;
  onSaved: (product: ProductFormData) => void;
}

// Helpers for formatted currency with commas (e.g. 89,999,999)
function formatCommas(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/\D/g, '');
  if (!numStr) return '';
  return Number(numStr).toLocaleString('en-US');
}

function parseCommas(val: string): number {
  if (!val) return 0;
  const clean = String(val).replace(/,/g, '').trim();
  return Number(clean) || 0;
}

function toVietnameseCurrencyText(num: number): string {
  if (!num || num <= 0) return '';
  if (num >= 1_000_000_000) {
    const ty = Math.floor(num / 1_000_000_000);
    const remTy = num % 1_000_000_000;
    const trieu = Math.floor(remTy / 1_000_000);
    const remTrieu = remTy % 1_000_000;
    const nghin = Math.floor(remTrieu / 1_000);
    return `👉 ${ty} tỷ ${trieu > 0 ? trieu + ' triệu ' : ''}${nghin > 0 ? nghin + ' nghìn ' : ''}đồng`;
  }
  if (num >= 1_000_000) {
    const trieu = Math.floor(num / 1_000_000);
    const rem = num % 1_000_000;
    const nghin = Math.floor(rem / 1_000);
    const tram = rem % 1_000;
    return `👉 ${trieu} triệu ${nghin > 0 ? nghin + ' nghìn ' : ''}${tram > 0 ? tram + ' đồng' : 'đồng'}`;
  }
  if (num >= 1_000) {
    const nghin = Math.floor(num / 1_000);
    const tram = num % 1_000;
    return `👉 ${nghin} nghìn ${tram > 0 ? tram + ' đồng' : 'đồng'}`;
  }
  return `👉 ${num} đồng`;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSaved,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('VGA');
  const [brand, setBrand] = useState('ASUS');
  const [modelCode, setModelCode] = useState('');

  // Formatted price strings (with commas: 89,999,999)
  const [priceInput, setPriceInput] = useState('');
  const [discountPriceInput, setDiscountPriceInput] = useState('');
  const [costPriceInput, setCostPriceInput] = useState('');

  const [stockQuantity, setStockQuantity] = useState<number>(15);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(36);
  
  // Images (Direct upload to Supabase Storage - Anti Copyright)
  const [coverImage, setCoverImage] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const [description, setDescription] = useState('');
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPrebuilt, setIsPrebuilt] = useState(false);
  const [status, setStatus] = useState(true);

  const [specList, setSpecList] = useState<{ key: string; value: string }[]>([
    { key: 'Bảo Hành', value: '36 Tháng Chính Hãng' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setName(initialData.name || '');
        setCategory(Array.isArray(initialData.category) ? initialData.category[0] : (initialData.category || 'VGA'));
        setBrand(initialData.brand || 'DRX');
        setModelCode(initialData.modelCode || '');

        setPriceInput(formatCommas(initialData.price));
        setDiscountPriceInput(formatCommas(initialData.discountPrice));
        setCostPriceInput(formatCommas(initialData.costPrice));

        setStockQuantity(initialData.stockQuantity !== undefined ? initialData.stockQuantity : 15);
        setWarrantyMonths(initialData.warrantyMonths || 36);
        setCoverImage(initialData.coverImage || '');
        setScreenshots(initialData.screenshots || (initialData.coverImage ? [initialData.coverImage] : []));
        setDescription(initialData.description || '');
        setIsFlashDeal(Boolean(initialData.isFlashDeal));
        setIsFeatured(Boolean(initialData.isFeatured));
        setIsPrebuilt(Boolean(initialData.isPrebuilt));
        setStatus(initialData.status !== false);

        if (initialData.specs && typeof initialData.specs === 'object') {
          const pairs = Object.entries(initialData.specs).map(([k, v]) => ({ key: k, value: String(v) }));
          setSpecList(pairs.length > 0 ? pairs : [{ key: 'Bảo Hành', value: '36 Tháng' }]);
        }
      } else {
        setName('');
        setCategory('VGA');
        setBrand('ASUS');
        setModelCode('');

        setPriceInput('');
        setDiscountPriceInput('');
        setCostPriceInput('');

        setStockQuantity(15);
        setWarrantyMonths(36);
        setCoverImage('');
        setScreenshots([]);
        setDescription('');
        setIsFlashDeal(false);
        setIsFeatured(false);
        setIsPrebuilt(false);
        setStatus(true);
        setSpecList([
          { key: 'Thương Hiệu', value: 'ASUS' },
          { key: 'Bảo Hành', value: '36 Tháng 1 Đổi 1' },
          { key: 'Tình Trạng', value: 'Mới 100% Nguyên Seal' },
        ]);
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  // Handlers for Price Input Formatting
  const handlePriceChange = (val: string) => {
    setPriceInput(formatCommas(val));
  };

  const handleDiscountPriceChange = (val: string) => {
    setDiscountPriceInput(formatCommas(val));
  };

  const handleCostPriceChange = (val: string) => {
    setCostPriceInput(formatCommas(val));
  };

  // Handlers for Specs
  const handleAddSpec = () => {
    setSpecList([...specList, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecList(specList.filter((_, idx) => idx !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...specList];
    updated[index][field] = val;
    setSpecList(updated);
  };

  // Upload Cover Image from Computer
  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
        // If existing screenshots were just the old placeholder, replace it; otherwise prepend
        setScreenshots(prev => {
          const filtered = prev.filter(img => !img.includes('unsplash.com'));
          return [data.url, ...filtered.filter(u => u !== data.url)];
        });
        showToast('Đã tải ảnh đại diện từ máy tính lên Supabase thành công!', 'success');
      } else {
        showToast(data.message || 'Lỗi khi tải ảnh lên.', 'error');
      }
    } catch (err: any) {
      showToast('Lỗi kết nối máy chủ khi tải ảnh.', 'error');
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  // Upload Multiple Gallery Images from Computer
  const handleUploadGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await authFetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        return res.ok && data.url ? data.url : null;
      });

      const results = await Promise.all(uploadPromises);
      const validUrls = results.filter(Boolean) as string[];

      if (validUrls.length > 0) {
        setScreenshots(prev => {
          // If previous screenshots only had unsplash placeholder images, replace them
          const realImages = prev.filter(img => !img.includes('unsplash.com'));
          return [...realImages, ...validUrls];
        });
        
        // If current cover was unsplash or empty, set to first uploaded image
        if (!coverImage || coverImage.includes('unsplash.com')) {
          setCoverImage(validUrls[0]);
        }
        showToast(`Đã tải lên ${validUrls.length} ảnh linh kiện từ máy tính lên Cloud thành công!`, 'success');
      } else {
        showToast('Không thể tải ảnh lên.', 'error');
      }
    } catch (err: any) {
      showToast('Lỗi khi tải ảnh bộ sưu tập.', 'error');
    } finally {
      setIsUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleClearAllImages = () => {
    setCoverImage('');
    setScreenshots([]);
    showToast('Đã xóa toàn bộ ảnh. Hãy tải lên ảnh mới từ máy tính!', 'info');
  };

  const handleRemoveCoverImage = () => {
    setCoverImage('');
    showToast('Đã gỡ ảnh đại diện. Vui lòng chọn hoặc tải ảnh mới!', 'info');
  };

  const handleRemoveScreenshot = (index: number) => {
    const removedUrl = screenshots[index];
    const updated = screenshots.filter((_, idx) => idx !== index);
    setScreenshots(updated);
    if (coverImage === removedUrl) {
      setCoverImage(updated.length > 0 ? updated[0] : '');
    }
  };

  const handleSetAsCover = (imgUrl: string) => {
    setCoverImage(imgUrl);
    showToast('Đã đặt làm ảnh đại diện chính!', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPrice = parseCommas(priceInput);
    const rawDiscountPrice = parseCommas(discountPriceInput);
    const rawCostPrice = parseCommas(costPriceInput);

    if (!name.trim()) {
      showToast('Vui lòng nhập tên linh kiện!', 'error');
      return;
    }
    if (!rawPrice || rawPrice <= 0) {
      showToast('Vui lòng nhập giá gốc hợp lệ (lớn hơn 0)!', 'error');
      return;
    }
    if (!coverImage.trim()) {
      showToast('Vui lòng tải lên hoặc chọn ảnh đại diện!', 'error');
      return;
    }

    setIsSubmitting(true);

    const specsObj: Record<string, string> = {};
    specList.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });

    const payload: ProductFormData = {
      id: mode === 'edit' && initialData ? initialData.id : ('prod-' + Date.now()),
      name: name.trim(),
      category,
      brand: brand.trim(),
      modelCode: modelCode.trim(),
      price: rawPrice,
      discountPrice: rawDiscountPrice > 0 ? rawDiscountPrice : undefined,
      costPrice: rawCostPrice > 0 ? rawCostPrice : undefined,
      stockQuantity: Number(stockQuantity),
      warrantyMonths: Number(warrantyMonths),
      coverImage: coverImage.trim(),
      screenshots: screenshots.length > 0 ? screenshots : [coverImage.trim()],
      specs: specsObj,
      description: description.trim(),
      isFlashDeal,
      isFeatured,
      isPrebuilt,
      status,
    };

    try {
      const res = await authFetch('/api/admin/products', {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Lỗi lưu linh kiện!', 'error');
        setIsSubmitting(false);
        return;
      }

      showToast(mode === 'edit' ? 'Đã cập nhật linh kiện thành công!' : 'Đã thêm linh kiện mới vào kho!', 'success');
      onSaved(data.product || payload);
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast('Có lỗi xảy ra khi lưu linh kiện!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeNumPrice = parseCommas(priceInput);
  const activeNumDiscountPrice = parseCommas(discountPriceInput);
  const activeNumCostPrice = parseCommas(costPriceInput);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full space-y-6 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-900 dark:text-slate-100 antialiased my-auto">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] border border-sky-200 dark:border-sky-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-[#0284c7] tracking-widest block">
                {mode === 'edit' ? 'QUẢN TRỊ VIÊN & THỦ KHO' : 'NHẬP KHO THIẾT BỊ MỚI'}
              </span>
              <h2 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                {mode === 'edit' ? ('Chỉnh Sửa Linh Kiện: ' + (name || 'Chi Tiết')) : 'Thêm Linh Kiện / Thiết Bị Phần Cứng Mới'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. GENERAL INFORMATION */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase text-[#0284c7] tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>1. Thông Tin Nhận Diện Linh Kiện</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên Linh Kiện / Sản Phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Card Màn Hình ASUS TUF Gaming GeForce RTX 4060 8GB GDDR6"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] outline-none"
                />
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mã Model / SKU
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: TUF-RTX4060-O8G"
                  value={modelCode}
                  onChange={(e) => setModelCode(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
                />
              </div>

              <div className="sm:col-span-6 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Danh Mục Phần Cứng <span className="text-rose-500">*</span>
                </label>
                <ModernSelect
                  options={CATEGORY_OPTIONS}
                  value={category}
                  onChange={(val) => setCategory(String(val))}
                  placeholder="Chọn danh mục..."
                />
              </div>

              <div className="sm:col-span-6 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Hãng Sản Xuất (Thương Hiệu) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ASUS, MSI, Gigabyte, Intel, AMD, Corsair, NZXT, Samsung..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. PRICING & INVENTORY (WITH COMMA SEPARATORS & VIETNAMESE CURRENCY WORDS) */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-[#0284c7] tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>2. Giá Bán & Quản Lý Kho (Tự Động Phân Tách Hàng Triệu, Hàng Trăm)</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Định dạng số dễ nhìn</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* GIÁ GỐC */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Giá Niêm Yết (Gốc) <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-mono">VNĐ</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="8,990,000"
                    value={priceInput}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-mono font-black text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₫</span>
                </div>
                {activeNumPrice > 0 ? (
                  <span className="text-[10.5px] font-bold text-[#0284c7] block">
                    {toVietnameseCurrencyText(activeNumPrice)}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 block italic">Nhập số để xem tiền triệu/trăm</span>
                )}
              </div>

              {/* GIÁ KHUYẾN MÃI */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Giá Khuyến Mãi (Nếu có)</span>
                  <span className="text-[10px] text-slate-400 font-mono">VNĐ</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="8,290,000"
                    value={discountPriceInput}
                    onChange={(e) => handleDiscountPriceChange(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 focus:border-[#0284c7] outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500">₫</span>
                </div>
                {activeNumDiscountPrice > 0 ? (
                  <span className="text-[10.5px] font-bold text-emerald-600 block">
                    {toVietnameseCurrencyText(activeNumDiscountPrice)}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 block italic">Để trống nếu không giảm</span>
                )}
              </div>

              {/* SỐ LƯỢNG TỒN KHO */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Số Lượng Tồn Kho (Chiếc)
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
                />
                <span className="text-[10px] text-slate-400 block">Sẵn sàng xuất bán</span>
              </div>

              {/* BẢO HÀNH */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Bảo Hành Chính Hãng
                </label>
                <ModernSelect
                  options={WARRANTY_OPTIONS}
                  value={warrantyMonths}
                  onChange={(val) => setWarrantyMonths(Number(val))}
                  placeholder="Chọn thời hạn bảo hành..."
                />
                <span className="text-[10px] text-slate-400 block">Tra cứu bằng mã SN</span>
              </div>
            </div>
          </div>

          {/* 3. HARDWARE IMAGES & DIRECT DEVICE UPLOADER (ANTI-COPYRIGHT) */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase text-[#0284c7] tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>3. Quản Lý Hình Ảnh & Tải Trực Tiếp Từ Máy Tính</span>
              </h3>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Lưu trữ đám mây DRX Cloud (Tránh lỗi bản quyền link ngoài)</span>
              </span>
            </div>

            {/* COVER IMAGE SECTION */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ảnh Đại Diện Chính (Cover Image) <span className="text-rose-500">*</span>
                </label>
                {screenshots.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllImages}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa Sạch Tất Cả Ảnh Cũ &amp; Tải Mới</span>
                  </button>
                )}
              </div>

              {coverImage ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {/* PREVIEW THUMBNAIL */}
                  <div className="w-20 h-20 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center relative shadow-inner">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>

                  {/* INFO & ACTIONS */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {coverImage.includes('supabase.co') ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã Lưu Trên Supabase Cloud Storage</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Ảnh Mẫu Cũ (Hãy bấm "Thay Ảnh Bìa" để tải ảnh mới từ máy tính)</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* BUTTON: CHANGE COVER */}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0284c7] hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingCover ? 'Đang Tải...' : '📁 Thay Ảnh Bìa Khác'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                          disabled={isUploadingCover}
                          onChange={handleUploadCoverImage}
                          className="hidden"
                        />
                      </label>

                      {/* BUTTON: REMOVE COVER */}
                      <button
                        type="button"
                        onClick={handleRemoveCoverImage}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all border border-rose-200 dark:border-rose-900/50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Gỡ Ảnh Này</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* EMPTY DROPZONE / UPLOAD BUTTON */
                <label className="cursor-pointer flex flex-col items-center justify-center gap-2.5 p-6 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 hover:border-[#0284c7] bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-all text-center group">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-[#0284c7] group-hover:scale-110 transition-transform">
                    {isUploadingCover ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-[#0284c7]" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#0284c7] block">
                      {isUploadingCover ? 'Đang Tải Ảnh Lên Máy Chủ...' : '📁 Nhấp Để Tải Ảnh Bìa Từ Máy Tính'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Định dạng hỗ trợ: JPG, PNG, WebP, AVIF (Tự động lưu vào Supabase Cloud)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    disabled={isUploadingCover}
                    onChange={handleUploadCoverImage}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* GALLERY SECTION (MULTI-UPLOAD ONLY - NO URL INPUT) */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Bộ Sưu Tập Hình Ảnh Chi Tiết ({screenshots.length} ảnh)
                </label>

                {/* BUTTON: MULTI-UPLOAD FROM COMPUTER */}
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-xs font-extrabold transition-all shadow-md shadow-sky-500/20">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingGallery ? 'Đang Tải Lên...' : '📁 Tải Thêm Nhiều Ảnh Từ Máy Tính'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    disabled={isUploadingGallery}
                    onChange={handleUploadGalleryImages}
                    className="hidden"
                  />
                </label>
              </div>

              {/* THUMBNAILS GRID */}
              {screenshots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                  {screenshots.map((img, idx) => {
                    const isCurrentCover = img === coverImage;
                    return (
                      <div key={idx} className={`group relative aspect-square rounded-2xl overflow-hidden border ${isCurrentCover ? 'border-[#0284c7] ring-2 ring-[#0284c7]/30' : 'border-slate-200 dark:border-slate-700'} bg-slate-100 dark:bg-slate-800 shadow-xs transition-all`}>
                        <img src={img} alt={'Gallery ' + idx} className="w-full h-full object-cover" />
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-1.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(idx)}
                            className="self-end p-1 rounded-full bg-rose-600 text-white cursor-pointer shadow-md hover:bg-rose-700"
                            title="Xóa ảnh này khỏi bộ sưu tập"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          {!isCurrentCover && (
                            <button
                              type="button"
                              onClick={() => handleSetAsCover(img)}
                              className="w-full py-1 rounded-lg bg-[#0284c7] text-white text-[9px] font-extrabold uppercase tracking-wider hover:bg-[#0369a1] transition-all cursor-pointer flex items-center justify-center gap-0.5"
                            >
                              <Star className="w-2.5 h-2.5" />
                              <span>Làm Bìa</span>
                            </button>
                          )}
                        </div>

                        {/* Current Cover Badge */}
                        {isCurrentCover && (
                          <div className="absolute bottom-1 left-1 bg-[#0284c7] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                            ẢNH BÌA
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400">
                  Chưa có ảnh chi tiết. Bấm <span className="font-bold text-[#0284c7]">"📁 Tải Thêm Nhiều Ảnh Từ Máy Tính"</span> để thêm các góc chụp thực tế của linh kiện.
                </div>
              )}
            </div>
          </div>

          {/* 4. TECHNICAL SPECIFICATIONS BUILDER */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-[#0284c7] tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>4. Bảng Thông Số Kỹ Thuật Chi Tiết (Technical Specs)</span>
              </h3>
              <button
                type="button"
                onClick={handleAddSpec}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-[#0284c7] hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Dòng Thông Số</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {specList.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tên thông số (VRAM, Bus, Socket...)"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                    className="w-1/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-[#0284c7]"
                  />
                  <input
                    type="text"
                    placeholder="Giá trị (8GB GDDR6X, LGA 1700, 6000MHz...)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#0284c7]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 5. DESCRIPTION & FEATURE FLAGS */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase text-[#0284c7] tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>5. Mô Tả Sản Phẩm & Nhãn Nổi Bật</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Mô Tả Tổng Quan
              </label>
              <textarea
                rows={3}
                placeholder="Nhập mô tả tính năng nổi bật, tản nhiệt, hiệu năng FPS..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#0284c7]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <label className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFlashDeal}
                  onChange={(e) => setIsFlashDeal(e.target.checked)}
                  className="rounded text-[#0284c7] focus:ring-0"
                />
                <span className="text-xs font-bold">🔥 Flash Deal</span>
              </label>

              <label className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-[#0284c7] focus:ring-0"
                />
                <span className="text-xs font-bold">⭐ Hàng Bán Chạy</span>
              </label>

              <label className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrebuilt}
                  onChange={(e) => setIsPrebuilt(e.target.checked)}
                  className="rounded text-[#0284c7] focus:ring-0"
                />
                <span className="text-xs font-bold">🖥️ PC Lắp Sẵn</span>
              </label>

              <label className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  className="rounded text-[#0284c7] focus:ring-0"
                />
                <span className="text-xs font-bold">✓ Đang Bán (Active)</span>
              </label>
            </div>
          </div>

          {/* FORM ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-xs font-extrabold shadow-md shadow-sky-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{mode === 'edit' ? 'Lưu Cập Nhật Linh Kiện' : 'Hoàn Tất Thêm Linh Kiện'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};