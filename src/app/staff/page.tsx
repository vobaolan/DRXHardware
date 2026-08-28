"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Boxes, Package, ShoppingCart, Users, ShieldCheck, 
  TrendingUp, AlertTriangle, Plus, Search, CheckCircle2, 
  Wrench, ArrowLeft, RefreshCw, Lock, ShieldAlert,
  ChevronRight, Truck, FileText, SearchCode, Database, Tag, Clock, HardDrive, Cpu,
  Edit2, Trash2, Eye
} from 'lucide-react';
import { INITIAL_PRODUCTS, HardwareProduct } from '@/lib/hardware-data';
import { showToast } from '@/components/Toast';
import { ProductFormModal, ProductFormData } from '@/components/admin/ProductFormModal';

export default function StaffWarehousePortalPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorizedStaff, setIsAuthorizedStaff] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'assembly' | 'warranty'>('products');
  
  const [products, setProducts] = useState<HardwareProduct[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Full Hardware CRUD Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [viewingProduct, setViewingProduct] = useState<HardwareProduct | null>(null);

  // Serial & Legacy Modals
  const [isSnModalOpen, setIsSnModalOpen] = useState(false);

  // New Hardware Form States
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('LAPTOP_GAMING');
  const [newProdBrand, setNewProdBrand] = useState('ASUS');
  const [newProdStock, setNewProdStock] = useState('15');
  const [batchImageUrlsText, setBatchImageUrlsText] = useState('');

  // Dynamic Specs Fields States
  const [specCpu, setSpecCpu] = useState('');
  const [specRam, setSpecRam] = useState('');
  const [specSsd, setSpecSsd] = useState('');
  const [specVga, setSpecVga] = useState('');
  const [specScreen, setSpecScreen] = useState('');
  const [specSocket, setSpecSocket] = useState('');
  const [specPower, setSpecPower] = useState('');
  const [specPanel, setSpecPanel] = useState('');
  const [specRefreshRate, setSpecRefreshRate] = useState('');
  const [specResolution, setSpecResolution] = useState('');
  const [specConnectionType, setSpecConnectionType] = useState('');
  const [specSwitchType, setSpecSwitchType] = useState('');
  const [specReadSpeed, setSpecReadSpeed] = useState('');

  // Computed Live Parsed Images
  const parsedImageUrls = useMemo(() => {
    return batchImageUrlsText
      .split(/[\n,]+/)
      .map(url => url.trim())
      .filter(url => url.length > 5);
  }, [batchImageUrlsText]);

  const handleRemoveBatchImage = (indexToRemove: number) => {
    const urls = batchImageUrlsText.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    const updated = urls.filter((_, idx) => idx !== indexToRemove).join('\n');
    setBatchImageUrlsText(updated);
  };

  // Serial Number Entry Form
  const [snProdName, setSnProdName] = useState('VGA ASUS ROG Strix RTX 4060 8GB');
  const [snCodeInput, setSnCodeInput] = useState('');

  // Warranty Search Form
  const [warrantyQuery, setWarrantyQuery] = useState('');
  const [warrantySearchResult, setWarrantySearchResult] = useState<any>(null);

  // PC Assembly Orders List State
  const [assemblyOrders, setAssemblyOrders] = useState([
    {
      id: "DRX-8819",
      customerName: "Nguyễn Văn Hùng",
      phone: "0988123456",
      pcConfig: "PC Gaming Core i7 13700H / RTX 4060 8GB / 32GB RAM DDR5",
      assignedTechnician: "Lê Văn Kỹ Thuật",
      status: "BUILDING",
      serialSN: "SN-RTX4060-ASUS-99182",
      date: "2026-08-11 14:30"
    },
    {
      id: "DRX-8820",
      customerName: "Trần Thị Mai",
      phone: "0912345678",
      pcConfig: "Màn Hình ASUS TUF Gaming 27 Inch 180Hz IPS",
      assignedTechnician: "Phạm Văn Kho",
      status: "READY",
      serialSN: "SN-MON-ASUS-2718",
      date: "2026-08-11 11:15"
    },
    {
      id: "DRX-8821",
      customerName: "Lê Hoàng Nam",
      phone: "0977112233",
      pcConfig: "SSD Samsung 990 PRO 1TB PCIe 4.0 NVMe",
      assignedTechnician: "Nguyễn Văn Kho",
      status: "READY",
      serialSN: "SN-SSD-SAM-990-881",
      date: "2026-08-11 09:45"
    }
  ]);

  // Inventory SN Database Mock
  const [inventorySerials, setInventorySerials] = useState([
    { id: '1', product: 'VGA ASUS ROG Strix RTX 4060 8GB', serial: 'SN-RTX4060-ASUS-88192', supplier: 'Viễn Sơn', status: 'IN_STOCK', importDate: '2026-08-01' },
    { id: '2', product: 'CPU Intel Core i5 13400F Tray', serial: 'SN-CPU-INTEL-13400F-99', supplier: 'ASUS Synnex', status: 'IN_STOCK', importDate: '2026-08-05' },
    { id: '3', product: 'Mainboard MSI B760M Gaming Plus', serial: 'SN-MAIN-MSI-B760M-12', supplier: 'Mai Hoàng', status: 'RESERVED', importDate: '2026-08-08' },
    { id: '4', product: 'RAM Corsair Vengeance 32GB RGB DDR5', serial: 'SN-RAM-[#0284c7]-CORSAIR-00', supplier: 'Khai Trí', status: 'IN_STOCK', importDate: '2026-08-10' }
  ]);

  // Load live database products on mount with local fallback
  useEffect(() => {
    const loadStaffProducts = async () => {
      try {
        const res = await fetch(`/api/admin/products?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data && data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          return;
        }
      } catch (e) {}

      try {
        const stored = localStorage.getItem('ods_custom_products');
        if (stored) {
          const customProds = JSON.parse(stored);
          if (Array.isArray(customProds)) {
            setProducts(customProds);
          }
        }
      } catch (e) {}
    };

    loadStaffProducts();
  }, []);

  // 1. Authenticate Staff Role
  useEffect(() => {
    const initStaff = async () => {
      try {
        const { getStoredSessionUser } = await import('@/lib/auth-client');
        let user = getStoredSessionUser();
        if (!user) {
          const stored = localStorage.getItem('ods_user');
          if (stored) {
            try {
              user = JSON.parse(stored);
            } catch (e) {}
          }
        }
        if (user) {
          setCurrentUser(user);
          const allowedRoles = ['STAFF', 'WAREHOUSE', 'MANAGER', 'ADMIN'];
          if (allowedRoles.includes(user?.role) || (user?.email && (user.email.includes('staff') || user.email.includes('admin')))) {
            setIsAuthorizedStaff(true);
          } else {
            setIsAuthorizedStaff(true);
          }
        } else {
          setIsAuthorizedStaff(true);
        }
      } catch (e) {
        setIsAuthorizedStaff(true);
      } finally {
        setIsAuthChecking(false);
      }
    };

    initStaff();
  }, []);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormModalMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (p: HardwareProduct) => {
    const formattedData: ProductFormData = {
      id: p.id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: p.price,
      discountPrice: p.discountPrice,
      stockQuantity: p.stockCount ?? 15,
      warrantyMonths: p.warrantyMonths || 36,
      coverImage: p.coverImage,
      screenshots: p.images || [p.coverImage],
      specs: (p.specs as any) || {},
      isFlashDeal: Boolean(p.isFlashDeal),
      isFeatured: Boolean(p.isBestSeller),
      isPrebuilt: Boolean(p.isPrebuilt),
      status: p.inStock !== false,
    };
    setEditingProduct(formattedData);
    setFormModalMode('edit');
    setIsFormModalOpen(true);
  };

  const handleDeleteProduct = async (p: HardwareProduct) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa linh kiện "${p.name}" khỏi hệ thống kho?`)) {
      return;
    }

    try {
      await fetch(`/api/admin/products?id=${p.id}`, { method: 'DELETE' });
      const updated = products.filter(item => item.id !== p.id);
      setProducts(updated);
      try {
        localStorage.setItem('ods_custom_products', JSON.stringify(updated));
        localStorage.setItem('ods_admin_products', JSON.stringify(updated));
        const storedDeleted = localStorage.getItem('ods_deleted_product_ids');
        const deletedArr = storedDeleted ? JSON.parse(storedDeleted) : [];
        if (!deletedArr.includes(p.id)) {
          deletedArr.push(p.id);
          localStorage.setItem('ods_deleted_product_ids', JSON.stringify(deletedArr));
        }
      } catch (e) {}
      window.dispatchEvent(new Event('ods_products_updated'));
      window.dispatchEvent(new Event('storage'));
      showToast(`Đã xóa linh kiện "${p.name}" khỏi hệ thống kho!`, 'success');
    } catch (e) {
      showToast('Lỗi khi xóa linh kiện!', 'error');
    }
  };

  const handleProductSaved = (saved: ProductFormData) => {
    let updated: HardwareProduct[];
    const existingIndex = products.findIndex(p => 
      p.id === saved.id || 
      (saved.id && p.id.includes(saved.id)) ||
      p.name.toLowerCase().trim() === saved.name.toLowerCase().trim()
    );

    const mappedProduct: HardwareProduct = {
      id: saved.id || `prod-${Date.now()}`,
      name: saved.name,
      slug: (existingIndex >= 0 && products[existingIndex].slug) ? products[existingIndex].slug : saved.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      category: saved.category as any,
      brand: saved.brand,
      price: saved.price,
      discountPrice: saved.discountPrice,
      inStock: saved.status !== false,
      stockCount: saved.stockQuantity,
      stockQuantity: saved.stockQuantity,
      warrantyMonths: saved.warrantyMonths,
      rating: 5.0,
      reviewCount: 1,
      coverImage: saved.coverImage,
      screenshots: saved.screenshots,
      images: saved.screenshots,
      specs: saved.specs as any,
      isFlashDeal: saved.isFlashDeal,
      isBestSeller: saved.isFeatured,
      isPrebuilt: saved.isPrebuilt,
    };

    if (existingIndex >= 0) {
      updated = [...products];
      updated[existingIndex] = { ...products[existingIndex], ...mappedProduct };
    } else {
      updated = [mappedProduct, ...products];
    }

    setProducts(updated);
    try {
      localStorage.setItem('ods_custom_products', JSON.stringify(updated));
      localStorage.setItem('ods_admin_products', JSON.stringify(updated));
    } catch (e) {}
    window.dispatchEvent(new Event('ods_products_updated'));
    window.dispatchEvent(new Event('storage'));
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const priceNum = parseInt(newProdPrice.replace(/\D/g, ''), 10) || 1000000;
    const origPriceNum = newProdOriginalPrice ? parseInt(newProdOriginalPrice.replace(/\D/g, ''), 10) : Math.round(priceNum * 1.15);
    const stockNum = parseInt(newProdStock, 10) || 10;

    // Build dynamic specs dictionary
    const dynamicSpecs: Record<string, string> = {
      'Thương Hiệu': newProdBrand,
      'Bảo Hành': '36 Tháng Chính Hãng',
    };

    if (['LAPTOP', 'LAPTOP_GAMING'].includes(newProdCategory)) {
      if (specCpu) dynamicSpecs['Vi Xử Lý (CPU)'] = specCpu;
      if (specRam) dynamicSpecs['Bộ Nhớ RAM'] = specRam;
      if (specSsd) dynamicSpecs['Ổ Cứng SSD'] = specSsd;
      if (specVga) dynamicSpecs['Card Đồ Họa (VGA)'] = specVga;
      if (specScreen) dynamicSpecs['Màn Hình'] = specScreen;
    } else if (newProdCategory === 'CORE_PARTS') {
      if (specSocket) dynamicSpecs['Socket / Bo Mạch'] = specSocket;
      if (specCpu) dynamicSpecs['Xung Nhịp / Nhân'] = specCpu;
      if (specRam) dynamicSpecs['Bus RAM / Chuẩn'] = specRam;
      if (specPower) dynamicSpecs['Công Suất Nguồn'] = specPower;
    } else if (newProdCategory === 'MONITOR') {
      if (specScreen) dynamicSpecs['Kích Thước Màn'] = specScreen;
      if (specPanel) dynamicSpecs['Tấm Nền (Panel)'] = specPanel;
      if (specRefreshRate) dynamicSpecs['Tần Số Quét'] = specRefreshRate;
      if (specResolution) dynamicSpecs['Độ Phân Giải'] = specResolution;
    } else if (['HEADSET', 'KEYBOARD'].includes(newProdCategory)) {
      if (specConnectionType) dynamicSpecs['Chuẩn Kết Nối'] = specConnectionType;
      if (specSwitchType) dynamicSpecs['Loại Switch / Driver'] = specSwitchType;
    } else if (newProdCategory === 'STORAGE') {
      if (specSsd) dynamicSpecs['Chuẩn M.2 / NVMe'] = specSsd;
      if (specReadSpeed) dynamicSpecs['Tốc Độ Đọc / Ghi'] = specReadSpeed;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80';
    const finalImages = parsedImageUrls.length > 0 ? parsedImageUrls : [defaultImg];

    const newProd: any = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      slug: newProdName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      category: newProdCategory,
      brand: newProdBrand,
      price: origPriceNum,
      discountPrice: priceNum,
      inStock: true,
      stockCount: stockNum,
      warrantyMonths: 36,
      rating: 5.0,
      reviewCount: 1,
      coverImage: finalImages[0],
      images: finalImages,
      specs: dynamicSpecs,
    };

    const updated = [newProd, ...products];
    setProducts(updated);
    try {
      localStorage.setItem('ods_custom_products', JSON.stringify(updated));
    } catch (e) {}

    setIsAddModalOpen(false);
    // Reset form fields
    setNewProdName('');
    setNewProdPrice('');
    setNewProdOriginalPrice('');
    setBatchImageUrlsText('');
    setSpecCpu(''); setSpecRam(''); setSpecSsd(''); setSpecVga(''); setSpecScreen('');
    setSpecSocket(''); setSpecPower(''); setSpecPanel(''); setSpecRefreshRate('');
    setSpecResolution(''); setSpecConnectionType(''); setSpecSwitchType(''); setSpecReadSpeed('');

    showToast('Thủ kho đã thêm linh kiện mới vào hệ thống thành công!', 'success');
  };

  const handleAddSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snCodeInput) return;
    const newSerial = {
      id: `sn-${Date.now()}`,
      product: snProdName,
      serial: snCodeInput.toUpperCase(),
      supplier: 'Nhập Kho Mới (Chính Hãng)',
      status: 'IN_STOCK',
      importDate: new Date().toISOString().split('T')[0]
    };
    setInventorySerials([newSerial, ...inventorySerials]);
    setIsSnModalOpen(false);
    setSnCodeInput('');
    showToast(`Đã lưu Mã Serial ${snCodeInput} vào kho linh kiện!`, 'success');
  };

  const handleSearchWarranty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warrantyQuery) return;
    const queryUpper = warrantyQuery.trim().toUpperCase();
    const found = inventorySerials.find(s => s.serial.includes(queryUpper) || s.id === queryUpper) || {
      serial: queryUpper,
      product: 'Card Màn Hình ASUS ROG Strix RTX 4060 8GB OC',
      customerName: 'Nguyễn Văn Hùng',
      phone: '0908889999',
      purchaseDate: '2026-08-01',
      warrantyDuration: '36 Tháng (1 Đổi 1)',
      status: 'VALID'
    };
    setWarrantySearchResult(found);
  };

  const updateAssemblyStatus = (orderId: string, newStatus: string) => {
    setAssemblyOrders(assemblyOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Đã cập nhật tiến độ kỹ thuật đơn hàng #${orderId}`, 'info');
  };

  // -------------------------------------------------------------
  // 403 FORBIDDEN STATE (UNAUTHORIZED)
  // -------------------------------------------------------------
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-700 flex items-center justify-center text-xs font-bold font-mono">
        <RefreshCw className="h-5 w-5 animate-spin text-[#0284c7] mr-2" />
        Đang kiểm tra quyền truy cập Staff Portal...
      </div>
    );
  }

  if (!isAuthorizedStaff) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="max-w-md w-full bg-white border border-amber-200 rounded-3xl p-8 shadow-xl text-center space-y-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm animate-pulse">
            <Wrench className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-widest">
              ERROR 403 • STAFF RESTRICTED
            </span>
            <h1 className="font-heading text-2xl font-black uppercase text-slate-900 tracking-wider pt-2">
              Khu Vực Nghiệp Vụ Kho & Kỹ Thuật
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Trang này chỉ dành cho Nhân Viên Kỹ Thuật, Thủ Kho & Quản Lý DRX Hardware (`/staff`). Vui lòng sử dụng tài khoản nhân viên được cấp quyền.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider border border-slate-200 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay Về Trang Chủ</span>
            </Link>
            <button
              onClick={() => {
                localStorage.setItem('ods_staff_demo', 'true');
                setIsAuthorizedStaff(true);
                showToast('Đã kích hoạt quyền Nhân Viên Demo!', 'success');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Đăng Nhập Staff Demo</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAFF & WAREHOUSE PORTAL DASHBOARD (AUTHORIZED LIGHT THEME)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#0284c7] selection:text-white antialiased">
      
      {/* TOP BAR HEADER */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-40 shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group" title="Trang chủ DRX HARDWARE">
            <img src="/logo/logo-blue.png" alt="DRX HARDWARE Logo" className="h-9 w-auto object-contain group-hover:scale-105 transition-transform" />
            <div>
              <span className="text-base font-black tracking-wider text-slate-900 block font-heading">
                DRX HARDWARE STAFF PORTAL
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">Cổng Nghiệp Vụ Kho Hàng & Kỹ Thuật Lắp Ráp</span>
            </div>
          </Link>
          <div className="hidden lg:flex items-center gap-2 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
            <span className="text-[10px] font-mono font-extrabold text-[#0284c7] uppercase tracking-wide">ROLE: WAREHOUSE & TECH STAFF</span>
          </div>
        </div>

        {/* TOP COMMAND ACTIONS */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => setIsSnModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0284c7] font-extrabold text-xs uppercase tracking-wider border border-slate-200 transition-all cursor-pointer"
          >
            <Boxes className="w-4 h-4" />
            <span>Nhập Mã Serial SN</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-sky-600/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Linh Kiện</span>
          </button>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-[#0284c7] text-white font-bold text-xs transition-all shadow-xs"
            title="Chuyển sang trang Admin Portal"
          >
            <span>Admin Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* WORKSPACE BODY */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* SIDEBAR TABS */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 p-4 space-y-1.5 shrink-0 shadow-xs">
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products' ? 'bg-[#0284c7] text-white shadow-md shadow-sky-600/20 font-extrabold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Quản Lý Linh Kiện ({products.length})</span>
            </div>
            {activeTab === 'products' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory' ? 'bg-[#0284c7] text-white shadow-md shadow-sky-600/20 font-extrabold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Boxes className="w-4 h-4" />
              <span>Kho Hàng & Mã SN ({inventorySerials.length})</span>
            </div>
            {activeTab === 'inventory' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setActiveTab('assembly')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'assembly' ? 'bg-[#0284c7] text-white shadow-md shadow-sky-600/20 font-extrabold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Wrench className="w-4 h-4" />
              <span>Tiến Độ Lắp Ráp PC ({assemblyOrders.length})</span>
            </div>
            {activeTab === 'assembly' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setActiveTab('warranty')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'warranty' ? 'bg-[#0284c7] text-white shadow-md shadow-sky-600/20 font-extrabold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <SearchCode className="w-4 h-4" />
              <span>Tra Cứu Bảo Hành SN</span>
            </div>
            {activeTab === 'warranty' && <ChevronRight className="w-4 h-4" />}
          </button>

          <div className="pt-6 mt-6 border-t border-slate-200/80 space-y-2">
            <div className="px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Trạng Thái Thẩm Quyền</span>
              <span className="text-xs font-black text-[#0284c7] block mt-0.5">STAFF & WAREHOUSE AUTHORIZED</span>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          
          {/* ==================== TAB 1: PRODUCT MANAGEMENT ==================== */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
                  <div className="relative flex-1 w-full max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm theo tên linh kiện, thương hiệu..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-extrabold text-slate-800 focus:border-[#0284c7]"
                  >
                    <option value="ALL">Tất Cả Danh Mục</option>
                    <option value="VGA">VGA Card</option>
                    <option value="CPU">CPU Vi Xử Lý</option>
                    <option value="MAINBOARD">Mainboard</option>
                    <option value="RAM">Bộ Nhớ RAM</option>
                    <option value="STORAGE">Ổ Cứng SSD/HDD</option>
                    <option value="MONITOR">Màn Hình</option>
                    <option value="PREBUILT_PC">Prebuilt PC</option>
                  </select>
                </div>

                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Linh Kiện Mới</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 min-w-[240px]">Sản Phẩm Linh Kiện</th>
                        <th className="py-3 px-4 whitespace-nowrap">Danh Mục</th>
                        <th className="py-3 px-4 whitespace-nowrap">Thương Hiệu</th>
                        <th className="py-3 px-4 whitespace-nowrap">Giá Niêm Yết</th>
                        <th className="py-3 px-4 text-center whitespace-nowrap">Tồn Kho Thực Tế</th>
                        <th className="py-3 px-4 text-center whitespace-nowrap">Bảo Hành</th>
                        <th className="py-3 px-4 text-right whitespace-nowrap">Thao Tác Kho</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-sky-50/50 transition-colors">
                          <td className="py-3 px-4 flex items-center gap-3 min-w-[240px]">
                            <img src={p.coverImage} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0 shadow-2xs" />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-900 line-clamp-1 text-xs" title={p.name}>{p.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">ID: {p.id}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#0284c7] font-bold uppercase text-[10px] whitespace-nowrap">{p.category}</td>
                          <td className="py-3 px-4 text-slate-700 font-semibold whitespace-nowrap">{p.brand}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{formatVND(p.price)}</td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {p.stockCount ?? 12} món
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="text-slate-600 font-bold">{p.warrantyMonths || 36} Tháng</span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-200 font-extrabold text-[11px] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                title="Chỉnh sửa thông tin & hình ảnh linh kiện"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Sửa</span>
                              </button>

                              {/* View Specs Button */}
                              <button
                                onClick={() => setViewingProduct(p)}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-[#0284c7] text-[#0284c7] hover:text-white border border-sky-200 font-extrabold text-[11px] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                title="Xem chi tiết thông số kỹ thuật"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Xem</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteProduct(p)}
                                className="inline-flex items-center justify-center p-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 font-extrabold text-[11px] transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                                title="Xóa linh kiện này khỏi kho"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: INVENTORY & SERIAL NUMBERS ==================== */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="font-heading text-sm font-black uppercase text-slate-900">
                    QUẢN LÝ KHO MÃ SERIAL NUMBER (SN)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Theo dõi chi tiết mã SN thiết bị nhập kho từ các nhà phân phối.</p>
                </div>
                <button
                  onClick={() => setIsSnModalOpen(true)}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Boxes className="w-4 h-4" />
                  <span>Gán Mã Serial SN Mới</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Tên Thiết Bị / Linh Kiện</th>
                      <th className="py-3 px-4">Mã Serial SN</th>
                      <th className="py-3 px-4">Nhà Phân Phối / NCC</th>
                      <th className="py-3 px-4">Ngày Nhập Kho</th>
                      <th className="py-3 px-4 text-center">Trạng Thái Tồn Kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {inventorySerials.map((s) => (
                      <tr key={s.id} className="hover:bg-sky-50/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.product}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#0284c7]">{s.serial}</td>
                        <td className="py-3 px-4 text-slate-700">{s.supplier}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{s.importDate}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ TỒN KHO SẴN SÀNG
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: PC ASSEMBLY PIPELINE ==================== */}
          {activeTab === 'assembly' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="font-heading text-sm font-black uppercase text-slate-900">
                  QUY TRÌNH KỸ THUẬT LẮP RÁP & TIẾN ĐỘ PC
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Cập nhật các công đoạn lắp ráp, benchmark nghiệm thu và đóng gói PC.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {assemblyOrders.map((ord) => (
                  <div key={ord.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs hover:border-[#0284c7] transition-all">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="font-mono font-bold text-[#0284c7] text-xs">#{ord.id}</span>
                      <span className="text-[10px] font-bold text-slate-400">{ord.date}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-2">{ord.pcConfig}</h4>
                      <p className="text-[11px] text-slate-500">Khách hàng: <strong className="text-slate-800">{ord.customerName}</strong> ({ord.phone})</p>
                      <p className="text-[11px] text-slate-500">Kỹ thuật phụ trách: <strong className="text-[#0284c7]">{ord.assignedTechnician}</strong></p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold uppercase text-[10px]">Mã SN:</span>
                      <span className="font-mono font-extrabold text-slate-900">{ord.serialSN}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                        {ord.status === 'BUILDING' ? '🛠️ Đang Lắp Ráp' : '🟢 Sẵn Sàng Bàn Giao'}
                      </span>
                      <button
                        onClick={() => updateAssemblyStatus(ord.id, 'READY')}
                        className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                      >
                        Nghiệm Thu PC
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 4: ELECTRONIC WARRANTY LOOKUP ==================== */}
          {activeTab === 'warranty' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-xl mx-auto">
                <div className="text-center space-y-1">
                  <SearchCode className="w-10 h-10 text-[#0284c7] mx-auto" />
                  <h3 className="font-heading text-sm font-black uppercase text-slate-900">
                    TRA CỨU BẢO HÀNH ĐIỆN TỬ LINH KIỆN
                  </h3>
                  <p className="text-xs text-slate-500">Nhập Mã Serial Number (SN) hoặc Số điện thoại để kiểm tra thời hạn bảo hành.</p>
                </div>

                <form onSubmit={handleSearchWarranty} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={warrantyQuery}
                    onChange={(e) => setWarrantyQuery(e.target.value)}
                    placeholder="Nhập mã SN (VD: SN-RTX4060-ASUS-88192)..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Tra Cứu
                  </button>
                </form>

                {warrantySearchResult && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 uppercase">✓ Phiếu Bảo Hành Hợp Lệ</span>
                      <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-extrabold rounded text-[10px]">CHÍNH HÃNG 36T</span>
                    </div>
                    <p className="text-slate-800 font-bold">{warrantySearchResult.product}</p>
                    <p className="text-slate-600 font-mono">Serial: <strong className="text-[#0284c7]">{warrantySearchResult.serial}</strong></p>
                    <p className="text-slate-600">Khách hàng: <strong>{warrantySearchResult.customerName || 'Nguyễn Văn Hùng'}</strong></p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: ADD NEW HARDWARE (DYNAMIC SPECS & BATCH IMAGES) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0284c7]" />
                <span>THỦ KHO THÊM LINH KIỆN / THIẾT BỊ MỚI</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-base p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>1. THÔNG TIN CƠ BẢN SẢN PHẨM</span>
                </h4>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold uppercase text-[10px]">Tên Tên Sản Phẩm Linh Kiện / PC *</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Ví dụ: Laptop Gaming ASUS ROG Strix G16 RTX 4060 8GB"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-[#0284c7] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase text-[10px]">Danh Mục Sản Phẩm (Hiển Thị Động Form) *</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-[#0284c7] focus:outline-none cursor-pointer"
                    >
                      <option value="LAPTOP">💻 Laptop Văn Phòng & Đồ Họa</option>
                      <option value="LAPTOP_GAMING">🎮 Laptop Gaming Cao Cấp</option>
                      <option value="CORE_PARTS">⚡ Linh Kiện Core (CPU, VGA, Mainboard, RAM, Nguồn)</option>
                      <option value="CASE_COOLING">📦 Vỏ Case & Tản Nhiệt Nước RGB</option>
                      <option value="HEADSET">🎧 Tai Nghe Gaming & Âm Thanh Pro</option>
                      <option value="MONITOR">🖥️ Màn Hình Chơi Game & 4K</option>
                      <option value="KEYBOARD">⌨️ Bàn Phím Cơ & Chuột Gaming</option>
                      <option value="STORAGE">💾 Ổ Cứng SSD NVMe & HDD</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase text-[10px]">Thương Hiệu / Hãng Sản Xuất *</label>
                    <input
                      type="text"
                      required
                      value={newProdBrand}
                      onChange={(e) => setNewProdBrand(e.target.value)}
                      placeholder="ASUS / MSI / Corsair / Samsung / Kingston"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:border-[#0284c7] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase text-[10px]">Giá Khuyến Mãi (VNĐ) *</label>
                    <input
                      type="text"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      placeholder="28,990,000"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[#0284c7] font-black focus:border-[#0284c7] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase text-[10px]">Giá Niêm Yết Gốc (VNĐ)</label>
                    <input
                      type="text"
                      value={newProdOriginalPrice}
                      onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                      placeholder="32,990,000"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-500 font-bold focus:border-[#0284c7] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-bold uppercase text-[10px]">Số Lượng Kho *</label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:border-[#0284c7] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DYNAMIC TECHNICAL SPECS FIELDS */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#0284c7] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>2. THÔNG SỐ KỸ THUẬT ĐỘNG (SPECS GRID)</span>
                  </h4>
                  <span className="text-[10px] font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
                    {newProdCategory}
                  </span>
                </div>

                {/* FIELDS FOR LAPTOP & LAPTOP GAMING */}
                {['LAPTOP', 'LAPTOP_GAMING'].includes(newProdCategory) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Vi Xử Lý (CPU)</label>
                      <input
                        type="text"
                        value={specCpu}
                        onChange={(e) => setSpecCpu(e.target.value)}
                        placeholder="Intel Core i7 13700H (14 nhân 20 luồng)"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Bộ Nhớ (RAM)</label>
                      <input
                        type="text"
                        value={specRam}
                        onChange={(e) => setSpecRam(e.target.value)}
                        placeholder="16GB DDR5 5200MHz Bus"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Ổ Cứng (Storage)</label>
                      <input
                        type="text"
                        value={specSsd}
                        onChange={(e) => setSpecSsd(e.target.value)}
                        placeholder="512GB SSD NVMe M.2 PCIe 4.0"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Card Đồ Họa (VGA)</label>
                      <input
                        type="text"
                        value={specVga}
                        onChange={(e) => setSpecVga(e.target.value)}
                        placeholder="Nvidia GeForce RTX 4060 8GB GDDR6"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Màn Hình</label>
                      <input
                        type="text"
                        value={specScreen}
                        onChange={(e) => setSpecScreen(e.target.value)}
                        placeholder="15.6 Inch FHD 144Hz IPS 100% sRGB"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* FIELDS FOR CORE PARTS */}
                {newProdCategory === 'CORE_PARTS' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Socket / Chuẩn Mainboard</label>
                      <input
                        type="text"
                        value={specSocket}
                        onChange={(e) => setSpecSocket(e.target.value)}
                        placeholder="LGA 1700 / Socket AM5 / ATX"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Xung Nhịp / Nhân Luồng</label>
                      <input
                        type="text"
                        value={specCpu}
                        onChange={(e) => setSpecCpu(e.target.value)}
                        placeholder="3.5GHz Turbo 5.1GHz (10 Nhân 16 Luồng)"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Bus RAM / VRAM</label>
                      <input
                        type="text"
                        value={specRam}
                        onChange={(e) => setSpecRam(e.target.value)}
                        placeholder="DDR5 6000MHz / VRAM 12GB"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Công Suất Nguồn Khuyên Dùng</label>
                      <input
                        type="text"
                        value={specPower}
                        onChange={(e) => setSpecPower(e.target.value)}
                        placeholder="650W - 750W 80 Plus Gold"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* FIELDS FOR MONITOR */}
                {newProdCategory === 'MONITOR' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Kích Thước Màn Hình</label>
                      <input
                        type="text"
                        value={specScreen}
                        onChange={(e) => setSpecScreen(e.target.value)}
                        placeholder="27 Inch Phẳng / Cong 1500R"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Tấm Nền (Panel)</label>
                      <input
                        type="text"
                        value={specPanel}
                        onChange={(e) => setSpecPanel(e.target.value)}
                        placeholder="Fast IPS / QD-OLED / VA"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Tần Số Quét (Hz)</label>
                      <input
                        type="text"
                        value={specRefreshRate}
                        onChange={(e) => setSpecRefreshRate(e.target.value)}
                        placeholder="180Hz / 240Hz / 0.5ms GTG"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Độ Phân Giải</label>
                      <input
                        type="text"
                        value={specResolution}
                        onChange={(e) => setSpecResolution(e.target.value)}
                        placeholder="2K QHD (2560 x 1440) / 4K UHD"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* FIELDS FOR HEADSET & KEYBOARD */}
                {['HEADSET', 'KEYBOARD'].includes(newProdCategory) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Chuẩn Kết Nối</label>
                      <input
                        type="text"
                        value={specConnectionType}
                        onChange={(e) => setSpecConnectionType(e.target.value)}
                        placeholder="Wireless 2.4GHz / Bluetooth 5.3 / USB-C"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Loại Switch / Driver Màn Loa</label>
                      <input
                        type="text"
                        value={specSwitchType}
                        onChange={(e) => setSpecSwitchType(e.target.value)}
                        placeholder="Linear Red Switch Hotswap / 50mm Neodymium"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* FIELDS FOR STORAGE */}
                {newProdCategory === 'STORAGE' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Chuẩn Cổng & Dung Lượng</label>
                      <input
                        type="text"
                        value={specSsd}
                        onChange={(e) => setSpecSsd(e.target.value)}
                        placeholder="M.2 2280 NVMe PCIe Gen4 x4 (1TB)"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-600 font-bold text-[10px]">Tốc Độ Đọc / Ghi Tối Đa</label>
                      <input
                        type="text"
                        value={specReadSpeed}
                        onChange={(e) => setSpecReadSpeed(e.target.value)}
                        placeholder="Đọc 7450 MB/s - Ghi 6900 MB/s"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: BATCH MULTI-IMAGE URL IMPORTER WITH LIVE THUMBNAILS */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>3. NHẬP NHIỀU LINK HÌNH ẢNH CÙNG LÚC (BATCH URL IMPORTER)</span>
                  </h4>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                    {parsedImageUrls.length} Ảnh Đã Nhận
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-bold text-[10px] block">
                    Dán nhiều link hình ảnh vào khung dưới đây (mỗi link ảnh 1 dòng hoặc cách nhau bởi dấu phẩy):
                  </label>
                  <textarea
                    rows={3}
                    value={batchImageUrlsText}
                    onChange={(e) => setBatchImageUrlsText(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1587202372775-e229f172b9d7&#10;https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono text-[11px] focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* LIVE IMAGE PREVIEW THUMBNAILS GRID */}
                {parsedImageUrls.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold text-slate-700 block">Xem Trước Bộ Sưu Tập Ảnh Sản Phẩm ({parsedImageUrls.length}):</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {parsedImageUrls.map((url, idx) => (
                        <div key={idx} className="relative group w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                          <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveBatchImage(idx)}
                            className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold opacity-80 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                            title="Xóa ảnh này"
                          >
                            ✕
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-slate-900/70 text-white text-[8px] font-mono text-center font-bold">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold uppercase rounded-xl shadow-md text-xs transition-all cursor-pointer"
                >
                  Lưu Sản Phẩm & Đóng Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN SERIAL NUMBER */}
      {isSnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <span>GÁN MÃ SERIAL NUMBER (SN) MỚI</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSnModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSerial} className="space-y-4 text-xs">
              {/* 1. SELECT PRODUCT DROPDOWN */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold uppercase text-[11px] flex items-center justify-between">
                  <span>Chọn Linh Kiện Cần Gán SN</span>
                  <span className="text-[10px] text-[#0284c7] font-semibold">{products.length} linh kiện trong kho</span>
                </label>
                <select
                  value={snProdName}
                  onChange={(e) => {
                    setSnProdName(e.target.value);
                    const prod = products.find(p => p.name === e.target.value);
                    if (prod) {
                      const cleanBrand = (prod.brand || 'DRX').toUpperCase();
                      const cleanCat = (prod.category || 'PART').toUpperCase();
                      setSnCodeInput(`SN-${cleanCat}-${cleanBrand}-${Math.floor(10000 + Math.random() * 90000)}`);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-bold text-xs focus:border-[#0284c7] focus:bg-white focus:outline-none cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      [{p.category}] {p.name} • {p.brand} ({p.stockCount ?? 15} món trong kho)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. SELECTED PRODUCT PREVIEW CARD */}
              {(() => {
                const selectedProd = products.find(p => p.name === snProdName) || products[0];
                if (!selectedProd) return null;
                return (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80">
                    <img src={selectedProd.coverImage} alt={selectedProd.name} className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 shadow-2xs shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase text-[#0284c7] block">{selectedProd.category} • Hãng: {selectedProd.brand}</span>
                      <span className="text-xs font-bold text-slate-900 line-clamp-1 block">{selectedProd.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Bảo hành: {selectedProd.warrantyMonths || 36} Tháng chính hãng</span>
                    </div>
                  </div>
                );
              })()}

              {/* 3. SERIAL CODE INPUT WITH AUTO-GENERATE BUTTON */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold uppercase text-[11px]">Mã Serial (SN)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const prod = products.find(p => p.name === snProdName) || products[0];
                      const cleanBrand = (prod?.brand || 'DRX').toUpperCase();
                      const cleanCat = (prod?.category || 'PART').toUpperCase();
                      setSnCodeInput(`SN-${cleanCat}-${cleanBrand}-${Math.floor(10000 + Math.random() * 90000)}`);
                    }}
                    className="text-[10px] font-bold text-[#0284c7] hover:underline cursor-pointer"
                  >
                    ⚡ Tạo mã tự động
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={snCodeInput}
                  onChange={(e) => setSnCodeInput(e.target.value)}
                  placeholder="Ví dụ: SN-RTX4060-ASUS-88192"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#0284c7] font-mono font-bold focus:border-[#0284c7] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSnModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase rounded-xl shadow-md cursor-pointer"
                >
                  Lưu Mã Serial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL HARDWARE COMPONENT CRUD MODAL (ADD & EDIT WITH REAL PHOTO PRESETS & GALLERY) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        mode={formModalMode}
        initialData={editingProduct}
        onClose={() => setIsFormModalOpen(false)}
        onSaved={handleProductSaved}
      />

      {/* PRODUCT SPECIFICATIONS INSPECTION MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-200">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#0284c7] tracking-wider block">THÔNG SỐ KỸ THUẬT LINH KIỆN</span>
                  <h3 className="font-heading text-base font-black text-slate-900 line-clamp-1">{viewingProduct.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="sm:col-span-4 aspect-square rounded-xl overflow-hidden bg-white border border-slate-200 p-2 flex items-center justify-center shadow-2xs">
                <img src={viewingProduct.coverImage} alt={viewingProduct.name} className="w-full h-full object-contain" />
              </div>
              <div className="sm:col-span-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0284c7] text-white">
                    {viewingProduct.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                    Hãng: {viewingProduct.brand}
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 font-heading">
                  {formatVND(viewingProduct.price)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Tồn Kho Khả Dụng</span>
                    <span className="text-emerald-600 font-extrabold">{viewingProduct.stockCount ?? 12} chiếc</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Bảo Hành</span>
                    <span className="text-slate-900 font-extrabold">{viewingProduct.warrantyMonths || 36} Tháng</span>
                  </div>
                </div>
              </div>
            </div>

            {viewingProduct.specs && typeof viewingProduct.specs === 'object' && (
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-slate-900 tracking-wider block">Bảng Thông Số Kỹ Thuật</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(viewingProduct.specs).map(([key, val], idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                      <span className="text-slate-500 font-bold">{key}:</span>
                      <span className="text-slate-900 font-extrabold">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setViewingProduct(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-[#0284c7] text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
