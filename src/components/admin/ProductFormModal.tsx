'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Plus, Trash2, Image as ImageIcon, Sparkles, Check, 
  Cpu, HardDrive, Monitor, Box, Zap, Fan, Gamepad2, Laptop, 
  ShieldCheck, DollarSign, Layers, Tag, ExternalLink, RefreshCw,
  Upload, CheckCircle2, FileImage, Star, AlertTriangle, FileText,
  Building2, ChevronDown, Search
} from 'lucide-react';
import { showToast } from '@/components/Toast';
import { authFetch } from '@/lib/auth-client';
import { ModernSelect, SelectOption } from '@/components/ui/ModernSelect';
import { optimizeImageForUpload } from '@/lib/imageOptimizer';

export const DEFAULT_POPULAR_BRANDS = [
  'ASUS', 'MSI', 'Gigabyte', 'Intel', 'AMD', 'Corsair', 'Kingston', 'Samsung',
  'Hikvision', 'NZXT', 'DeepCool', 'Lian Li', 'ASRock', 'Thermalright', 'Western Digital',
  'Seagate', 'Zotac', 'Palit', 'Inno3D', 'Colorful', 'Galax', 'TeamGroup',
  'G.Skill', 'Patriot', 'DareU', 'Logitech', 'Razer', 'ViewSonic', 'LG', 'AOC', 'DRX'
];

const STANDARD_SPECS_BY_CATEGORY: Record<string, { key: string; value: string }[]> = {
  CPU: [
    { key: 'Loại CPU', value: 'Intel Core / AMD Ryzen' },
    { key: 'Socket', value: 'LGA 1700 / AM5' },
    { key: 'Số Nhân / Số Luồng', value: 'Số nhân P/E + Luồng' },
    { key: 'Xung Nhịp Cơ Bản / Boost', value: 'Tốc độ xung nhịp up to 5.x GHz' },
    { key: 'Bộ Nhớ Đệm (Cache)', value: 'L3 Cache' },
    { key: 'Điện Năng Tiêu Thụ (TDP)', value: '65W - 125W' },
    { key: 'Hỗ Trợ RAM', value: 'DDR4 / DDR5 Dual Channel' },
    { key: 'Bảo Hành', value: '36 Tháng Chính Hãng' },
  ],
  VGA: [
    { key: 'Chipset Đồ Họa', value: 'NVIDIA GeForce RTX / AMD Radeon' },
    { key: 'Dung Lượng VRAM', value: '8GB / 12GB / 16GB GDDR6X' },
    { key: 'Băng Thông Bộ Nhớ', value: '128-bit / 192-bit / 256-bit' },
    { key: 'Xung Nhịp Boost', value: 'up to 2600 MHz' },
    { key: 'Cổng Xuất Hình', value: '3x DisplayPort 1.4a, 1x HDMI 2.1a' },
    { key: 'Nguồn Khuyến Nghị', value: '650W - 750W' },
    { key: 'Bảo Hành', value: '36 Tháng Chính Hãng' },
  ],
  MAINBOARD: [
    { key: 'Chipset', value: 'B760 / Z790 / B650 / X670' },
    { key: 'Socket', value: 'LGA 1700 / AM5' },
    { key: 'Kích Thước (Form Factor)', value: 'ATX / Micro-ATX' },
    { key: 'Khe Cắm RAM', value: '4x DDR5 / DDR4 up to 192GB' },
    { key: 'Khe Cắm M.2 SSD', value: '3x M.2 NVMe PCIe 4.0' },
    { key: 'Kết Nối Mạng', value: '2.5GbE LAN + Wi-Fi 6E' },
    { key: 'Bảo Hành', value: '36 Tháng Chính Hãng' },
  ],
  RAM: [
    { key: 'Dung Lượng', value: '16GB (2x8GB) / 32GB (2x16GB)' },
    { key: 'Chuẩn Bộ Nhớ', value: 'DDR4 / DDR5' },
    { key: 'Tốc Độ Bus', value: '3200MHz / 5600MHz / 6000MHz' },
    { key: 'Độ Trễ (Latency)', value: 'CL16 / CL30 / CL36' },
    { key: 'Đèn LED / Tản Nhiệt', value: 'Tản Nhôm Kim Loại + RGB' },
    { key: 'Bảo Hành', value: '36 Tháng Chính Hãng' },
  ],
  STORAGE: [
    { key: 'Dung Lượng', value: '500GB / 1TB / 2TB' },
    { key: 'Chuẩn Giao Tiếp', value: 'M.2 NVMe PCIe 4.0 x4' },
    { key: 'Tốc Độ Đọc Tuần Tự', value: 'up to 7,400 MB/s' },
    { key: 'Tốc Độ Ghi Tuần Tự', value: 'up to 6,500 MB/s' },
    { key: 'Độ Bền (TBW)', value: '600 TBW' },
    { key: 'Bảo Hành', value: '60 Tháng (5 Năm)' },
  ],
  PSU: [
    { key: 'Công Suất Định Mức', value: '650W / 750W / 850W' },
    { key: 'Chứng Nhận Hiệu Suất', value: '80 Plus Bronze / Gold' },
    { key: 'Kiểu Dây Cáp', value: 'Full Modular / Cáp dẹt đen' },
    { key: 'Chuẩn Nguồn Mới', value: 'ATX 3.0 / PCIe 5.0' },
    { key: 'Bảo Hành', value: '60 Tháng (5 Năm)' },
  ],
  COOLING: [
    { key: 'Loại Tản Nhiệt', value: 'Tản Nhiệt Nước AIO 240mm / 360mm' },
    { key: 'Socket Tương Thích', value: 'Intel LGA1700/1200 & AMD AM5/AM4' },
    { key: 'Quạt Kèm Theo', value: '3x 120mm ARGB PWM' },
    { key: 'Độ Ồn Tối Đa', value: '< 28 dBA' },
    { key: 'Bảo Hành', value: '36 Tháng Chính Hãng' },
  ],
  CASE: [
    { key: 'Hỗ Trợ Bo Mạch', value: 'ATX, Micro-ATX, Mini-ITX' },
    { key: 'Chất Liệu', value: 'Thép SPCC + Kính Cường Lực' },
    { key: 'Hỗ Trợ Chiều Dài VGA', value: 'Tối đa 400mm' },
    { key: 'Hỗ Trợ Radiator', value: 'Lên đến 360mm' },
    { key: 'Quạt Lắp Sẵn', value: 'Kèm sẵn Fan ARGB' },
  ],
  MONITOR: [
    { key: 'Kích Thước Màn Hình', value: '24 inch / 27 inch' },
    { key: 'Độ Phân Giải', value: 'Full HD (1920x1080) / 2K QHD (2560x1440)' },
    { key: 'Tấm Nền', value: 'Fast IPS' },
    { key: 'Tần Số Quét', value: '165Hz / 180Hz / 240Hz' },
    { key: 'Thời Gian Phản Hồi', value: '1ms GTG' },
    { key: 'Cổng Kết Nối', value: 'DisplayPort 1.4, HDMI 2.0' },
    { key: 'Bảo Hành', value: '36 Tháng Chính Hãng' },
  ],
  PREBUILT_PC: [
    { key: 'Bộ Vi Xử Lý (CPU)', value: 'Intel Core / AMD Ryzen Gaming' },
    { key: 'Bo Mạch Chủ (Main)', value: 'B760 / B650 Chính Hãng' },
    { key: 'Card Đồ Họa (VGA)', value: 'NVIDIA GeForce RTX Series' },
    { key: 'Bộ Nhớ Trong (RAM)', value: '16GB / 32GB Dual Channel' },
    { key: 'Ổ Cứng Lưu Trữ (SSD)', value: '500GB / 1TB NVMe PCIe 4.0' },
    { key: 'Nguồn Điện (PSU)', value: '650W - 750W 80 Plus' },
    { key: 'Tản Nhiệt & Vỏ Case', value: 'Case Kính Bể Cá + Fan LED RGB' },
    { key: 'Bảo Hành Trọn Bộ', value: '36 Tháng Tận Nơi 1 Đổi 1' },
  ],
  LAPTOP: [
    { key: 'Bộ Vi Xử Lý (CPU)', value: 'Intel Core / AMD Ryzen' },
    { key: 'Bộ Nhớ RAM', value: '16GB DDR5 Dual Channel' },
    { key: 'Ổ Cứng SSD', value: '512GB / 1TB NVMe PCIe Gen 4' },
    { key: 'Card Đồ Họa (GPU)', value: 'NVIDIA RTX Laptop GPU' },
    { key: 'Màn Hình', value: '15.6" / 16" FHD/QHD IPS' },
    { key: 'Bảo Hành', value: '24 Tháng Chính Hãng' },
  ],
};

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

  // Dynamic Brand Selection & Creation State
  const [customBrands, setCustomBrands] = useState<string[]>([]);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('drx_custom_brands');
      if (stored) {
        setCustomBrands(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const allAvailableBrands = useMemo(() => {
    const combined = Array.from(new Set([...DEFAULT_POPULAR_BRANDS, ...customBrands]));
    return combined;
  }, [customBrands]);

  const filteredBrands = useMemo(() => {
    if (!brand.trim()) return allAvailableBrands;
    return allAvailableBrands.filter(b => b.toLowerCase().includes(brand.toLowerCase()));
  }, [allAvailableBrands, brand]);

  const handleAddNewBrand = (newBrandName: string) => {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;
    
    if (!allAvailableBrands.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [trimmed, ...customBrands];
      setCustomBrands(updated);
      try {
        localStorage.setItem('drx_custom_brands', JSON.stringify(updated));
      } catch (e) {}
      showToast.success(`Đã thêm và lưu hãng mới "${trimmed}"!`);
    }
    setBrand(trimmed);
    setIsBrandDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formatted price strings (with commas: 89,999,999)
  const [priceInput, setPriceInput] = useState('');
  const [discountPriceInput, setDiscountPriceInput] = useState('');
  const [costPriceInput, setCostPriceInput] = useState('');

  const [stockQuantity, setStockQuantity] = useState<number>(15);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(36);
  
  // Hardware Compatibility specs
  const [socket, setSocket] = useState('');
  const [ramType, setRamType] = useState('');
  const [wattage, setWattage] = useState('');
  const [formFactor, setFormFactor] = useState('');

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

function extractCompatibilityFromSpecs(specs?: Record<string, any>) {
  if (!specs || typeof specs !== 'object') return { socket: '', ramType: '', wattage: '', formFactor: '' };
  
  let socket = '';
  let ramType = '';
  let wattage = '';
  let formFactor = '';

  for (const [key, val] of Object.entries(specs)) {
    const k = key.toLowerCase().trim();
    const v = String(val || '').trim();
    if (!v) continue;

    // Socket: LGA 1700, AM5, AM4, LGA1200, etc.
    if (!socket && (k.includes('socket') || k === 'loại cpu' || k === 'cpu socket')) {
      socket = v;
    }

    // RAM Type: DDR4, DDR5, LPDDR5, GDDR6, etc.
    if (!ramType && (k.includes('ram') || k.includes('bộ nhớ') || k.includes('chuẩn memory') || k.includes('loại ram / bus ram'))) {
      if (/ddr[345]|gddr[56]x?|lpddr[45]x?/i.test(v)) {
        const match = v.match(/((?:lp)?ddr[345]|gddr[56]x?)/i);
        ramType = match ? match[0].toUpperCase() : v;
      } else {
        ramType = v;
      }
    }

    // Wattage (TDP / PSU Watt / Công Suất)
    if (!wattage && (k.includes('công suất') || k.includes('tdp') || k.includes('điện năng') || k.includes('nguồn khuyến nghị'))) {
      const match = v.match(/(\d+)\s*w?/i);
      if (match) wattage = match[1];
    }

    // Form factor (ATX, Micro-ATX, Mini-ITX, etc.)
    if (!formFactor && (k.includes('kích thước') || k.includes('form factor') || k.includes('bo mạch') || k.includes('chuẩn main') || k.includes('loại case'))) {
      formFactor = v;
    }
  }

  return { socket, ramType, wattage, formFactor };
}

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

        setStockQuantity(typeof initialData.stockQuantity === 'number' ? initialData.stockQuantity : (initialData.stockQuantity ? Number(initialData.stockQuantity) : 0));
        setWarrantyMonths(initialData.warrantyMonths || 36);
        
        const extracted = extractCompatibilityFromSpecs(initialData.specs);
        setSocket(initialData.socket || extracted.socket || '');
        setRamType(initialData.ramType || extracted.ramType || '');
        setWattage(initialData.wattage ? String(initialData.wattage) : (extracted.wattage || ''));
        setFormFactor(initialData.formFactor || extracted.formFactor || '');

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
        setSocket('');
        setRamType('');
        setWattage('');
        setFormFactor('');

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

  const handleLoadStandardSpecs = () => {
    const defaultPairs = STANDARD_SPECS_BY_CATEGORY[category] || [
      { key: 'Thương Hiệu', value: brand || 'DRX' },
      { key: 'Bảo Hành', value: `${warrantyMonths} Tháng Chính Hãng` },
      { key: 'Tình Trạng', value: 'Mới 100% Nguyên Hộp' },
    ];
    setSpecList(prev => {
      const existingKeys = new Set(prev.map(p => p.key.trim().toLowerCase()));
      const newItems = defaultPairs.filter(p => !existingKeys.has(p.key.trim().toLowerCase()));
      if (newItems.length === 0) {
        return defaultPairs;
      }
      return [...prev, ...newItems];
    });
    showToast(`Đã nạp mẫu thông số kỹ thuật chuẩn cho ${category}!`, 'success');
  };

  // Upload Cover Image from Computer (Instant Preview & Smart Compression)
  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Phản hồi tức thì (<1ms): Tạo preview cục bộ hiển thị ngay lập tức cho người dùng
    const localPreviewUrl = URL.createObjectURL(file);
    const prevCover = coverImage;
    setCoverImage(localPreviewUrl);
    setIsUploadingCover(true);

    try {
      // 2. Nén thông minh phía client (5MB-10MB -> ~150KB WebP chỉ trong ~30ms, giữ nét 100%)
      const optimizedFile = await optimizeImageForUpload(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
      });

      const formData = new FormData();
      formData.append('file', optimizedFile);

      // 3. Tải lên máy chủ siêu tốc (dung lượng nhẹ chỉ ~150KB, upload trong ~300ms)
      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
        // Thu hồi bộ nhớ preview
        try { URL.revokeObjectURL(localPreviewUrl); } catch (e) {}

        // Nếu danh sách ảnh có ảnh mẫu placeholder unsplash hoặc blob cũ thì thay thế
        setScreenshots(prev => {
          const filtered = prev.filter(img => !img.includes('unsplash.com') && img !== localPreviewUrl);
          return [data.url, ...filtered.filter(u => u !== data.url)];
        });
        showToast('Đã tải ảnh đại diện lên Cloud thành công!', 'success');
      } else {
        setCoverImage(prevCover);
        try { URL.revokeObjectURL(localPreviewUrl); } catch (e) {}
        showToast(data.message || 'Lỗi khi tải ảnh lên.', 'error');
      }
    } catch (err: any) {
      setCoverImage(prevCover);
      try { URL.revokeObjectURL(localPreviewUrl); } catch (e) {}
      showToast('Lỗi kết nối máy chủ khi tải ảnh.', 'error');
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  // Upload Multiple Gallery Images from Computer (Instant Multi-Preview & Parallel Compression)
  const handleUploadGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploadingGallery(true);

    // 1. Tạo preview tức thì cho tất cả ảnh được chọn
    const localPreviews = fileList.map(f => URL.createObjectURL(f));
    setScreenshots(prev => {
      const realImages = prev.filter(img => !img.includes('unsplash.com'));
      return [...realImages, ...localPreviews];
    });

    try {
      // 2. Nén song song tất cả các ảnh trên trình duyệt
      const optimizedFiles = await Promise.all(
        fileList.map(f => optimizeImageForUpload(f, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 }))
      );

      // 3. Tải lên máy chủ đồng thời
      const uploadPromises = optimizedFiles.map(async (optFile, idx) => {
        try {
          const formData = new FormData();
          formData.append('file', optFile);
          const res = await authFetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();
          return {
            localUrl: localPreviews[idx],
            cloudUrl: res.ok && data.url ? (data.url as string) : null,
          };
        } catch (err) {
          return { localUrl: localPreviews[idx], cloudUrl: null };
        }
      });

      const results = await Promise.all(uploadPromises);

      // Dọn dẹp URL blob cục bộ
      localPreviews.forEach(u => {
        try { URL.revokeObjectURL(u); } catch (e) {}
      });

      // Thay thế URL tạm thời bằng URL Supabase thực tế
      const successMap = new Map<string, string>();
      results.forEach(r => {
        if (r.cloudUrl) successMap.set(r.localUrl, r.cloudUrl);
      });

      setScreenshots(prev => {
        return prev
          .map(url => successMap.get(url) || (localPreviews.includes(url) ? null : url))
          .filter(Boolean) as string[];
      });

      const validUrls = results.map(r => r.cloudUrl).filter(Boolean) as string[];
      if (validUrls.length > 0) {
        if (!coverImage || coverImage.includes('unsplash.com')) {
          setCoverImage(validUrls[0]);
        }
        showToast(`Đã tải lên thành công ${validUrls.length} ảnh lên Cloud siêu tốc!`, 'success');
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

    if (socket.trim() && !specsObj['Socket'] && !specsObj['Socket Tương Thích']) {
      specsObj['Socket'] = socket.trim();
    }
    if (ramType.trim() && !specsObj['Chuẩn RAM'] && !specsObj['Chuẩn Bộ Nhớ'] && !specsObj['Loại Ram / Bus Ram']) {
      specsObj['Chuẩn RAM'] = ramType.trim();
    }
    if (wattage && !specsObj['Công Suất'] && !specsObj['Công Suất Định Mức'] && !specsObj['TDP'] && !specsObj['Điện Năng Tiêu Thụ (TDP)']) {
      specsObj['Công Suất (Watt)'] = `${wattage}W`;
    }
    if (formFactor.trim() && !specsObj['Kích Thước (Form Factor)'] && !specsObj['Kích Thước'] && !specsObj['Hỗ Trợ Bo Mạch']) {
      specsObj['Kích Thước (Form Factor)'] = formFactor.trim();
    }

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
      socket: socket.trim() || undefined,
      ramType: ramType.trim() || undefined,
      wattage: wattage ? Number(wattage) : undefined,
      formFactor: formFactor.trim() || undefined,
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

      showToast(mode === 'edit' ? 'Đã cập nhật linh kiện thành công vào Supabase!' : 'Đã thêm linh kiện mới vào kho Supabase!', 'success');
      
      // Dispatch global sync event for all active tabs and views
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ods_products_updated'));
      }

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

              <div className="sm:col-span-6 space-y-2 relative" ref={brandDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>Hãng Sản Xuất (Thương Hiệu) <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[10.5px] text-slate-400 font-medium">
                    Chọn hãng cũ hoặc gõ tạo mới
                  </span>
                </div>

                {/* Input & Autocomplete Search / Trigger */}
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Chọn hoặc nhập hãng: ASUS, MSI, Hikvision, Gigabyte..."
                    value={brand}
                    onFocus={() => setIsBrandDropdownOpen(true)}
                    onChange={(e) => {
                      setBrand(e.target.value);
                      setIsBrandDropdownOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (brand.trim()) {
                          handleAddNewBrand(brand.trim());
                        }
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3.5 pr-14 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none transition-all shadow-2xs"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {brand && (
                      <button
                        type="button"
                        onClick={() => {
                          setBrand('');
                          setIsBrandDropdownOpen(true);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Xóa chữ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#0284c7] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Mở danh sách hãng"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isBrandDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {isBrandDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2.5 max-h-64 overflow-y-auto space-y-2 backdrop-blur-md">
                      {/* Create New Brand Action if not in list */}
                      {brand.trim() && !allAvailableBrands.some(b => b.toLowerCase() === brand.trim().toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => handleAddNewBrand(brand.trim())}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/80 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/80 transition-all text-xs font-bold cursor-pointer text-left"
                        >
                          <span className="flex items-center gap-2">
                            <Plus className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                            <span>Tạo hãng mới: <strong>"{brand.trim()}"</strong></span>
                          </span>
                          <span className="text-[9.5px] bg-sky-600 text-white px-2 py-0.5 rounded-full font-black uppercase">
                            Lưu cho lần sau
                          </span>
                        </button>
                      )}

                      <div className="px-1 py-0.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1.5">
                        <span>Danh Sách Thương Hiệu ({filteredBrands.length})</span>
                        <span className="text-[10px] text-[#0284c7] font-semibold">Bấm để chọn</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5">
                        {filteredBrands.map((b) => {
                          const isSelected = brand.toLowerCase() === b.toLowerCase();
                          return (
                            <button
                              key={b}
                              type="button"
                              onClick={() => {
                                setBrand(b);
                                setIsBrandDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0284c7] text-white shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-[#0284c7] border border-slate-100 dark:border-slate-800'
                              }`}
                            >
                              <span className="truncate">{b}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>

                      {filteredBrands.length === 0 && !brand.trim() && (
                        <div className="p-3 text-center text-xs text-slate-400 font-medium">
                          Chưa có thương hiệu nào phù hợp.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Selection Pills / Chips below input */}
                <div className="pt-0.5">
                  <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Hãng phổ biến (1 chạm chọn nhanh):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_POPULAR_BRANDS.slice(0, 11).map((b) => {
                      const isSelected = brand.toLowerCase() === b.toLowerCase();
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBrand(b)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0284c7] text-white shadow-2xs scale-[1.02]'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:border-[#0284c7] hover:text-[#0284c7]'
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PRICING & INVENTORY (WITH COMMA SEPARATORS & VIETNAMESE CURRENCY WORDS) */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-[#0284c7] tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>2. Giá Bán, Giá Vốn &amp; Quản Lý Kho</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Định dạng số phân tách hàng triệu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              
              {/* GIÁ GỐC */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Giá Niêm Yết <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-mono">VNĐ</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="8,990,000"
                    value={priceInput}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-7 py-2.5 text-xs font-mono font-black text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₫</span>
                </div>
                {activeNumPrice > 0 ? (
                  <span className="text-[10px] font-bold text-[#0284c7] block truncate">
                    {toVietnameseCurrencyText(activeNumPrice)}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 block italic">Nhập số</span>
                )}
              </div>

              {/* GIÁ KHUYẾN MÃI */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Giá Khuyến Mãi</span>
                  <span className="text-[10px] text-slate-400 font-mono">VNĐ</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="8,290,000"
                    value={discountPriceInput}
                    onChange={(e) => handleDiscountPriceChange(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-7 py-2.5 text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 focus:border-[#0284c7] outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500">₫</span>
                </div>
                {activeNumDiscountPrice > 0 ? (
                  <span className="text-[10px] font-bold text-emerald-600 block truncate">
                    {toVietnameseCurrencyText(activeNumDiscountPrice)}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 block italic">Để trống nếu không giảm</span>
                )}
              </div>

              {/* GIÁ VỐN NHẬP KHO */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Giá Nhập Kho</span>
                  <span className="text-[10px] text-slate-400 font-mono">VNĐ</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="7,500,000"
                    value={costPriceInput}
                    onChange={(e) => handleCostPriceChange(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-7 py-2.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 focus:border-[#0284c7] outline-none"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₫</span>
                </div>
                {activeNumCostPrice > 0 ? (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block truncate">
                    {toVietnameseCurrencyText(activeNumCostPrice)}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 block italic">Tính lãi ròng</span>
                )}
              </div>

              {/* SỐ LƯỢNG TỒN KHO */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Số Lượng Tồn Kho
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
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
                  placeholder="Thời hạn..."
                />
                <span className="text-[10px] text-slate-400 block">Tra cứu bằng SN</span>
              </div>
            </div>
          </div>

          {/* 2.5. HARDWARE COMPATIBILITY & PC BUILDER SPECS */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-[#0284c7] tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>2.5. Tương Thích Lắp Ráp &amp; Tự Build PC (PC Builder Sync)</span>
              </h3>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">Tự động check tương thích khi khách build</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Socket (CPU / Mainboard)
                </label>
                <input
                  type="text"
                  placeholder="LGA 1700, AM5, AM4..."
                  value={socket}
                  onChange={(e) => setSocket(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
                />
                <span className="text-[10px] text-slate-400 block">Khớp socket giữa CPU &amp; Main</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chuẩn RAM (RAM / Mainboard)
                </label>
                <input
                  type="text"
                  placeholder="DDR4, DDR5..."
                  value={ramType}
                  onChange={(e) => setRamType(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
                />
                <span className="text-[10px] text-slate-400 block">Khớp thế hệ RAM DDR4/DDR5</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Công Suất Tiêu Thụ / Cung Cấp (Watt)
                </label>
                <input
                  type="number"
                  placeholder="65, 125, 650, 750..."
                  value={wattage}
                  onChange={(e) => setWattage(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
                />
                <span className="text-[10px] text-slate-400 block">TDP (CPU/VGA) hoặc Nguồn (PSU)</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kích Thước (Form Factor)
                </label>
                <input
                  type="text"
                  placeholder="ATX, Micro-ATX, Mini-ITX..."
                  value={formFactor}
                  onChange={(e) => setFormFactor(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] outline-none"
                />
                <span className="text-[10px] text-slate-400 block">Khớp kích thước Main &amp; Vỏ Case</span>
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
                    {isUploadingCover && (
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* INFO & ACTIONS */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {coverImage.includes('supabase.co') ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Đã Lưu Trên Supabase Cloud Storage</span>
                        </span>
                      ) : coverImage.startsWith('blob:') || isUploadingCover ? (
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-sky-500/20">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>⚡ Đang nén &amp; lưu Supabase...</span>
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
                        
                        {/* Optimistic Uploading Indicator for Gallery */}
                        {img.startsWith('blob:') && (
                          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white text-[9px] font-bold gap-1 pointer-events-none">
                            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                            <span>Đang lưu...</span>
                          </div>
                        )}
                        
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase text-[#0284c7] tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>4. Bảng Thông Số Kỹ Thuật Chi Tiết (Technical Specs)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadStandardSpecs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-[#0284c7] dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800/60 transition-all cursor-pointer"
                  title="Tự động nạp danh sách thông số phần cứng chuẩn của danh mục"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ Nạp Mẫu Thông Số Chuẩn</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-[#0284c7] hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Dòng</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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

          {/* 5. DESCRIPTION */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-[#0284c7] tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>5. Mô Tả Sản Phẩm</span>
              </h3>
              {initialData?.description && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Đã nạp mô tả hiện tại từ CSDL</span>
                </span>
              )}
            </div>

            {/* Ô xem lại mô tả sản phẩm cũ trước khi sửa */}
            {initialData?.description && (
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Mô tả sản phẩm cũ trước khi sửa:</span>
                  </span>
                  {description !== initialData.description && (
                    <button
                      type="button"
                      onClick={() => setDescription(initialData.description || '')}
                      className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline font-bold cursor-pointer"
                    >
                      Khôi phục mô tả cũ này
                    </button>
                  )}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed font-normal italic bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/40 max-h-24 overflow-y-auto">
                  {initialData.description}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Nội Dung Mô Tả Chi Tiết (Chỉnh sửa tại đây)</span>
                <span className="text-[10px] text-slate-400 font-mono">{description.length} ký tự</span>
              </label>
              <textarea
                rows={4}
                placeholder="Nhập mô tả chi tiết tính năng nổi bật, tản nhiệt, kiến trúc phần cứng, hiệu năng FPS chơi game / làm việc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#0284c7] leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Trạng thái gắn huy hiệu sản phẩm</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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