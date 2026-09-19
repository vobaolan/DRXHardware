"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { 
  Boxes, Package, ShoppingCart, Users, ShieldCheck, 
  TrendingUp, AlertTriangle, Plus, Search, CheckCircle2, 
  Wrench, ArrowLeft, RefreshCw, Lock, ShieldAlert, Home, UserCheck,
  ChevronRight, Truck, FileText, SearchCode, Database, Tag, Clock, HardDrive, Cpu,
  Edit2, Trash2, Eye, Phone, Mail, MapPin, Calendar, Check, X,
  ExternalLink, Layers, Sparkles, Award, PackageCheck, Ban, ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { showToast, showConfirm } from '@/components/Toast';
import { ProductFormModal, ProductFormData } from '@/components/admin/ProductFormModal';
import { supabase } from '@/lib/supabase';
import { authFetch } from '@/lib/auth-client';
import { ModernSelect, SelectOption } from '@/components/ui/ModernSelect';
import { PortalHeader } from '@/components/admin/PortalHeader';
import { OrderVerificationModal } from '@/components/admin/OrderVerificationModal';
import { OrderStatusSelector, OrderStatus } from '@/components/admin/OrderStatusSelector';
import { CancelOrderModal } from '@/components/admin/CancelOrderModal';
import { CouponManagementView } from '@/components/admin/CouponManagementView';
import { SerialManagementSection } from '@/components/admin/SerialManagementSection';
import { PortalDropdown } from '@/components/ui/PortalDropdown';

function SerialStatusButton({
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
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-black uppercase transition-all cursor-pointer shadow-xs active:scale-95 border ${
          status === 'AVAILABLE'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
            : status === 'SOLD'
            ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-200'
            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100'
        }`}
        title="Click để đổi trạng thái Serial"
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
        width={240}
      >
        <div className="px-2.5 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
          Cập Nhật Trạng Thái SN
        </div>

        {/* Option AVAILABLE */}
        <button
          type="button"
          onClick={() => {
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
          onClick={() => {
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
              <span className="block text-[10px] text-slate-400 font-normal">Đã bàn giao cho khách hàng</span>
            </div>
          </div>
          {status === 'SOLD' && <Check className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />}
        </button>

        {/* Option WARRANTY */}
        <button
          type="button"
          onClick={() => {
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
              <span className="block text-[10px] text-slate-400 font-normal">Đang tiếp nhận xử lý bảo hành</span>
            </div>
          </div>
          {status === 'WARRANTY' && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
        </button>
      </PortalDropdown>
    </>
  );
}

// Category mapping for filters
const CATEGORY_NAMES: Record<string, string> = {
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
};

const CATEGORY_FILTER_OPTIONS: SelectOption[] = Object.entries(CATEGORY_NAMES).map(([key, label]) => ({
  value: key,
  label: label,
  badge: key === 'ALL' ? 'TẤT CẢ' : key,
}));

const SERIAL_STATUS_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'Tất Cả Trạng Thái SN', badge: 'TẤT CẢ' },
  { value: 'AVAILABLE', label: 'Trong Kho (AVAILABLE)', badge: 'SẴN SÀNG' },
  { value: 'SOLD', label: 'Đã Xuất Bán (SOLD)', badge: 'ĐÃ BÁN' },
  { value: 'WARRANTY', label: 'Đang Bảo Hành (WARRANTY)', badge: 'BẢO HÀNH' },
];

const STAFF_ASSEMBLY_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'Tất Cả Tiến Độ' },
  { value: 'PENDING', label: 'Chờ Kỹ Thuật Tiếp Nhận', badge: 'Chờ Tiếp Nhận' },
  { value: 'CONFIRMED', label: 'Đã Duyệt Lắp Ráp', badge: 'Đang Ráp' },
  { value: 'SHIPPING', label: 'Đang Vận Chuyển', badge: 'Vận Chuyển' },
  { value: 'COMPLETED', label: 'Đã Hoàn Tất Nghiệm Thu', badge: 'Nghiệm Thu' },
];

const formatVND = (num: number | string | null | undefined) => {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
};

export const formatOrderDisplayCode = (ord: any): string => {
  if (!ord) return '#DRX-00000';
  let raw = String(ord.orderCode || ord.id || '').toUpperCase();
  raw = raw.replace(/^#/, '').replace(/^ORD-/, '').trim();
  
  if (raw.startsWith('DRX-')) {
    const digits = raw.replace('DRX-', '');
    if (digits.length === 5) return `#${raw}`;
    if (digits.length === 4) return `#DRX-0${digits}`;
    return `#DRX-${digits.padStart(5, '0').slice(-5)}`;
  }
  
  if (raw.startsWith('DRX')) {
    const digits = raw.slice(3);
    if (digits.length === 5) return `#DRX-${digits}`;
    if (digits.length === 4) return `#DRX-0${digits}`;
    return `#DRX-${digits.padStart(5, '0').slice(-5)}`;
  }
  
  const nums = raw.replace(/\D/g, '');
  if (nums.length >= 5) {
    return `#DRX-${nums.slice(0, 5)}`;
  }
  return `#DRX-${(nums || '84920').padStart(5, '0').slice(-5)}`;
};

export default function StaffWarehousePortalPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorizedStaff, setIsAuthorizedStaff] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'assembly' | 'warranty' | 'coupons'>('products');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Database States
  const [products, setProducts] = useState<any[]>([]);
  const [serials, setSerials] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [serialStatusFilter, setSerialStatusFilter] = useState<string>('ALL');
  const [assemblyStatusFilter, setAssemblyStatusFilter] = useState<string>('ALL');

  // Modals & Active Selections
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);

  // Serial Import Modal
  const [isSnModalOpen, setIsSnModalOpen] = useState(false);
  const [selectedProductIdForSn, setSelectedProductIdForSn] = useState('');
  const [inputSerialsText, setInputSerialsText] = useState('');
  const [inputSerialStatus, setInputSerialStatus] = useState('AVAILABLE');
  const [isSubmittingSn, setIsSubmittingSn] = useState(false);

  const productSelectOptions: SelectOption[] = useMemo(() => {
    return products.map((p) => {
      const cleanName = (p.name || '').replace(/ODS/gi, 'DRX');
      return {
        value: p.id,
        label: `[${p.category || 'PART'}] ${cleanName}`,
        badge: p.category || 'LINH KIỆN',
        description: `${p.brand || 'DRX'} • ${formatVND(p.price)}`,
      };
    });
  }, [products]);

  const SERIAL_STATUS_INIT_OPTIONS: SelectOption[] = [
    { value: 'AVAILABLE', label: 'AVAILABLE (Có Sẵn Trong Kho)', badge: 'SẴN SÀNG' },
    { value: 'SOLD', label: 'SOLD (Đã Xuất Bán)', badge: 'ĐÃ BÁN' },
    { value: 'WARRANTY', label: 'WARRANTY (Đang Bảo Hành)', badge: 'BẢO HÀNH' },
  ];

  // Warranty Search
  const [warrantyQuery, setWarrantyQuery] = useState('');
  const [warrantySearchResult, setWarrantySearchResult] = useState<any | null>(null);
  const [isSearchingWarranty, setIsSearchingWarranty] = useState(false);

  // 1. Fetch all live data from Database
  const fetchAllStaffData = useCallback(async (showNotification = false) => {
    setIsRefreshing(true);
    try {
      const [prodsRes, serialsRes, ordersRes, couponsRes] = await Promise.all([
        authFetch(`/api/admin/products?t=${Date.now()}`, { cache: 'no-store' }),
        authFetch(`/api/admin/serials?t=${Date.now()}`, { cache: 'no-store' }),
        authFetch(`/api/admin/orders?t=${Date.now()}`, { cache: 'no-store' }),
        authFetch(`/api/admin/coupons?t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      if (prodsRes.ok) {
        const prodsData = await prodsRes.json();
        if (prodsData.products) setProducts(prodsData.products);
      }

      if (serialsRes.ok) {
        const serialsData = await serialsRes.json();
        if (serialsData.serials) setSerials(serialsData.serials);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.orders) setOrders(ordersData.orders);
      }

      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        if (couponsData.coupons) setCoupons(couponsData.coupons);
      }

      if (showNotification) {
        showToast('Đã làm mới dữ liệu hệ thống thành công!', 'success');
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Staff:', err);
      if (showNotification) {
        showToast('Lỗi khi cập nhật dữ liệu từ máy chủ.', 'error');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // 2. Auth checking & Initial Fetch
  useEffect(() => {
    const initStaff = async () => {
      try {
        const { getStoredSessionUser, verifyCurrentSession } = await import('@/lib/auth-client');
        let user = getStoredSessionUser();
        if (!user) {
          user = await verifyCurrentSession();
        }
        if (user) {
          setCurrentUser(user);
          const email = String(user.email || '').toLowerCase();
          const role = String(user.role || '').toUpperCase();

          // Staff Portal Policy: Both ADMIN and STAFF are allowed to enter
          // Regular USER and unauthenticated GUEST are strictly denied
          if (
            role === 'ADMIN' || 
            role === 'STAFF' || 
            role === 'WAREHOUSE' || 
            role === 'MANAGER' || 
            email === 'staff@drx.vn' || 
            email === 'admin@drx.vn' ||
            email.includes('staff') ||
            email.includes('admin')
          ) {
            setIsAuthorizedStaff(true);
            setIsAuthChecking(false);
            fetchAllStaffData(false);
            return;
          } else {
            setIsAuthorizedStaff(false);
          }
        } else {
          setIsAuthorizedStaff(false);
        }
      } catch (e) {
        setIsAuthorizedStaff(false);
      } finally {
        setIsAuthChecking(false);
      }
    };

    initStaff();

    // Supabase Realtime Channels
    const channel = supabase
      .channel('staff_global_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Product' }, (payload: any) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
          setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        } else if (payload.eventType === 'INSERT' && payload.new) {
          setProducts(prev => [payload.new, ...prev.filter(p => p.id !== payload.new.id)]);
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ProductSerial' }, () => fetchAllStaffData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Order' }, () => fetchAllStaffData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllStaffData]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.modelCode && p.modelCode.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Filtered Serials
  const filteredSerials = useMemo(() => {
    return serials.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (s.serialNumber && s.serialNumber.toLowerCase().includes(q)) ||
        (s.product?.name && s.product.name.toLowerCase().includes(q)) ||
        (s.product?.brand && s.product.brand.toLowerCase().includes(q)) ||
        (s.product?.modelCode && s.product.modelCode.toLowerCase().includes(q)) ||
        (s.product?.category && s.product.category.toLowerCase().includes(q)) ||
        (s.order?.orderCode && s.order.orderCode.toLowerCase().includes(q)) ||
        (s.order?.customerName && s.order.customerName.toLowerCase().includes(q)) ||
        (s.order?.customerPhone && s.order.customerPhone.includes(q));
      const matchesStatus = serialStatusFilter === 'ALL' || s.status === serialStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [serials, searchQuery, serialStatusFilter]);

  // Filtered Assembly Orders
  const filteredAssemblyOrders = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (o.orderCode && o.orderCode.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q));
      const matchesStatus = assemblyStatusFilter === 'ALL' || o.status === assemblyStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, assemblyStatusFilter]);

  // Product Actions
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormModalMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    const formattedData: ProductFormData = {
      id: p.id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      modelCode: p.modelCode || '',
      price: Number(p.price) || 0,
      discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
      costPrice: p.costPrice ? Number(p.costPrice) : undefined,
      stockQuantity: p.stockQuantity ?? p.stockCount ?? 10,
      warrantyMonths: p.warrantyMonths || 36,
      coverImage: p.coverImage || '',
      screenshots: Array.isArray(p.screenshots) ? p.screenshots : [p.coverImage].filter(Boolean),
      specs: (p.specs as any) || {},
      isFlashDeal: Boolean(p.isFlashDeal),
      isFeatured: Boolean(p.isFeatured || p.isBestSeller),
      isPrebuilt: Boolean(p.isPrebuilt),
      status: p.status !== false && p.inStock !== false,
    };
    setEditingProduct(formattedData);
    setFormModalMode('edit');
    setIsFormModalOpen(true);
  };

  const handleDeleteProduct = (p: any) => {
    showConfirm({
      title: 'Xác Nhận Xóa Linh Kiện',
      message: `Bạn có chắc chắn muốn xóa linh kiện "${p.name}" khỏi cơ sở dữ liệu kho?`,
      confirmText: 'Xóa Linh Kiện',
      cancelText: 'Hủy Bỏ',
      variant: 'danger',
      onConfirm: async () => {
        // Optimistic realtime deletion
        setProducts(prev => prev.filter(x => x.id !== p.id));
        showToast(`Đã xóa linh kiện "${p.name}" thành công!`, 'success');

        try {
          const res = await authFetch(`/api/admin/products?id=${p.id}`, { method: 'DELETE' });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.message || 'Không thể xóa sản phẩm lúc này.', 'error');
          }
        } catch (e) {
          showToast('Lỗi khi xóa sản phẩm!', 'error');
        }
      }
    });
  };

  // Order & Assembly Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const targetPaymentStatus = newStatus === 'COMPLETED' ? 'PAID' : undefined;
      const payload: any = { orderId, status: newStatus };
      if (targetPaymentStatus) {
        payload.paymentStatus = targetPaymentStatus;
      }

      const res = await authFetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { 
          ...o, 
          status: newStatus,
          ...(targetPaymentStatus ? { paymentStatus: targetPaymentStatus } : {})
        } : o));
        setAssemblyOrders(prev => prev.map(o => o.id === orderId ? { 
          ...o, 
          status: newStatus,
          ...(targetPaymentStatus ? { paymentStatus: targetPaymentStatus } : {})
        } : o));
        if (viewingOrder && viewingOrder.id === orderId) {
          setViewingOrder({ 
            ...viewingOrder, 
            status: newStatus,
            ...(targetPaymentStatus ? { paymentStatus: targetPaymentStatus } : {})
          });
        }
        showToast(`Đã chuyển đơn hàng sang trạng thái: ${newStatus}`, 'success');
        fetchAllStaffData();
      } else {
        showToast('Lỗi khi cập nhật trạng thái đơn hàng!', 'error');
      }
    } catch (e) {
      showToast('Không thể kết nối máy chủ để cập nhật đơn.', 'error');
    }
  };

  const handleConfirmCancelOrder = async (reason: string) => {
    if (!cancellingOrder) return;
    setIsCancellingOrder(true);
    try {
      const pDetails = typeof cancellingOrder.paymentDetails === 'string'
        ? (() => { try { return JSON.parse(cancellingOrder.paymentDetails); } catch { return {}; } })()
        : (cancellingOrder.paymentDetails && typeof cancellingOrder.paymentDetails === 'object' ? cancellingOrder.paymentDetails : {});

      const targetPaymentStatus = cancellingOrder.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED';
      const mergedDetails = {
        ...pDetails,
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
        cancelledBy: 'STAFF',
      };

      const res = await authFetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: cancellingOrder.id,
          status: 'CANCELLED',
          paymentStatus: targetPaymentStatus,
          paymentDetails: mergedDetails,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Đã hủy đơn hàng #${formatOrderDisplayCode(cancellingOrder)} thành công!`, 'success');
        setOrders(prev => prev.map(o => o.id === cancellingOrder.id ? { 
          ...o, 
          status: 'CANCELLED', 
          paymentStatus: targetPaymentStatus,
          paymentDetails: mergedDetails 
        } : o));
        setAssemblyOrders(prev => prev.map(o => o.id === cancellingOrder.id ? { 
          ...o, 
          status: 'CANCELLED', 
          paymentStatus: targetPaymentStatus,
          paymentDetails: mergedDetails 
        } : o));
        if (viewingOrder && viewingOrder.id === cancellingOrder.id) {
          setViewingOrder({ 
            ...viewingOrder, 
            status: 'CANCELLED', 
            paymentStatus: targetPaymentStatus,
            paymentDetails: mergedDetails 
          });
        }
        setCancellingOrder(null);
        fetchAllStaffData();
      } else {
        showToast(data.message || 'Lỗi khi hủy đơn hàng!', 'error');
      }
    } catch (e) {
      showToast('Không thể kết nối máy chủ để hủy đơn.', 'error');
    } finally {
      setIsCancellingOrder(false);
    }
  };

  // Serial Import Handler
  const handleImportSerials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductIdForSn) {
      showToast('Vui lòng chọn linh kiện cần gán mã Serial!', 'error');
      return;
    }
    if (!inputSerialsText.trim()) {
      showToast('Vui lòng nhập ít nhất một mã Serial!', 'error');
      return;
    }

    setIsSubmittingSn(true);
    try {
      const res = await authFetch('/api/admin/serials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductIdForSn,
          serialNumbers: inputSerialsText,
          status: inputSerialStatus,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Đã nhập mã Serial vào kho thành công!', 'success');
        setIsSnModalOpen(false);
        setInputSerialsText('');
        fetchAllStaffData();
      } else {
        showToast(data.message || 'Lỗi khi nhập Serial.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setIsSubmittingSn(false);
    }
  };

  const handleUpdateSerialStatus = async (serialId: string, newStatus: string) => {
    try {
      const res = await authFetch('/api/admin/serials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: serialId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setSerials(prev => prev.map(s => s.id === serialId ? { ...s, ...(data.serial || {}), status: newStatus } : s));
        const statusLabel = newStatus === 'AVAILABLE' ? 'Trong Kho' : newStatus === 'SOLD' ? 'Đã Xuất Bán' : 'Bảo Hành';
        showToast(`Đã chuyển trạng thái SN sang: ${statusLabel}`, 'success');
        fetchAllStaffData();
      } else {
        showToast(data.message || 'Lỗi khi cập nhật trạng thái Serial.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ khi cập nhật Serial.', 'error');
    }
  };

  const handleDeleteSerial = (serialId: string) => {
    showConfirm({
      title: 'Xác Nhận Xóa Serial (SN)',
      message: 'Bạn có chắc chắn muốn xóa mã Serial này khỏi kho linh kiện?',
      confirmText: 'Xóa Serial',
      cancelText: 'Hủy Bỏ',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await authFetch(`/api/admin/serials?id=${serialId}`, { method: 'DELETE' });
          if (res.ok) {
            setSerials(prev => prev.filter(s => s.id !== serialId));
            showToast('Đã xóa mã Serial thành công!', 'success');
            fetchAllStaffData();
          } else {
            showToast('Lỗi khi xóa mã Serial.', 'error');
          }
        } catch (e) {
          showToast('Lỗi kết nối máy chủ.', 'error');
        }
      }
    });
  };

  // Live Electronic Warranty Search Handler
  const handleSearchWarranty = (e: React.FormEvent) => {
    e.preventDefault();
    const query = warrantyQuery.trim().toLowerCase();
    if (!query) return;

    setIsSearchingWarranty(true);
    setWarrantySearchResult(null);

    // 1. Search in loaded serials
    const foundSerial = serials.find(s => 
      s.serialNumber?.toLowerCase().includes(query) ||
      s.order?.orderCode?.toLowerCase().includes(query) ||
      s.order?.customerPhone?.includes(query) ||
      s.order?.customerName?.toLowerCase().includes(query)
    );

    if (foundSerial) {
      // Calculate warranty duration and expiry
      const months = foundSerial.product?.warrantyMonths || 36;
      const soldDate = foundSerial.soldDate || foundSerial.createdAt || new Date().toISOString();
      const expiryDate = new Date(soldDate);
      expiryDate.setMonth(expiryDate.getMonth() + months);

      const isStillValid = new Date() <= expiryDate;

      setWarrantySearchResult({
        serialNumber: foundSerial.serialNumber,
        productName: foundSerial.product?.name || 'Linh Kiện Phần Cứng DRX',
        brand: foundSerial.product?.brand || 'Chính Hãng',
        category: foundSerial.product?.category || 'PART',
        warrantyMonths: months,
        soldDate: new Date(soldDate).toLocaleDateString('vi-VN'),
        expiryDate: expiryDate.toLocaleDateString('vi-VN'),
        isValid: isStillValid,
        customerName: foundSerial.order?.customerName || 'Khách Hàng DRX VIP',
        customerPhone: foundSerial.order?.customerPhone || 'Đang cập nhật',
        orderCode: foundSerial.order?.orderCode || 'Bán Lẻ',
        status: foundSerial.status,
      });
      showToast('Đã tìm thấy phiếu bảo hành điện tử!', 'success');
    } else {
      // Check in orders
      const foundOrder = orders.find(o => 
        o.orderCode?.toLowerCase().includes(query) ||
        o.customerPhone?.includes(query) ||
        o.customerName?.toLowerCase().includes(query)
      );

      if (foundOrder && foundOrder.orderItems && foundOrder.orderItems.length > 0) {
        const firstItem = foundOrder.orderItems[0];
        const months = firstItem.product?.warrantyMonths || 36;
        const soldDate = foundOrder.createdAt;
        const expiryDate = new Date(soldDate);
        expiryDate.setMonth(expiryDate.getMonth() + months);

        setWarrantySearchResult({
          serialNumber: firstItem.serialsList?.[0] || `SN-ORD-${foundOrder.orderCode || 'DRX'}`,
          productName: firstItem.product?.name || 'Đơn Hàng Lắp Ráp PC',
          brand: firstItem.product?.brand || 'DRX Custom',
          category: firstItem.product?.category || 'PC',
          warrantyMonths: months,
          soldDate: new Date(soldDate).toLocaleDateString('vi-VN'),
          expiryDate: expiryDate.toLocaleDateString('vi-VN'),
          isValid: new Date() <= expiryDate,
          customerName: foundOrder.customerName,
          customerPhone: foundOrder.customerPhone,
          orderCode: foundOrder.orderCode,
          status: 'SOLD',
        });
        showToast('Đã tìm thấy thông tin bảo hành qua đơn hàng!', 'success');
      } else {
        showToast(`Không tìm thấy bảo hành cho từ khóa "${warrantyQuery}"`, 'error');
      }
    }

    setIsSearchingWarranty(false);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold font-mono">
        <RefreshCw className="h-5 w-5 animate-spin text-[#0284c7] mr-2" />
        Đang xác thực quyền hạn Cổng Vận Hành Staff...
      </div>
    );
  }

  if (!isAuthorizedStaff) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 antialiased">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900/95 p-8 text-center shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Top Decorative Glow Banner */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-rose-500/20 to-[#5B3DF5]/20 rounded-full blur-2xl pointer-events-none" />

          {/* 403 Shield Icon */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 shadow-inner">
            <ShieldAlert className="w-10 h-10 animate-pulse" />
          </div>

          {/* Error Code Tag */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-black tracking-widest uppercase mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>HTTP 403 FORBIDDEN</span>
          </div>

          <h1 className="font-heading text-2xl font-black uppercase text-slate-900 dark:text-slate-100 mb-2">
            TRUY CẬP BỊ TỪ CHỐI
          </h1>
          
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-light">
            Bạn không có quyền truy cập vào bảng quản trị **DRX Staff Operations**. Khu vực này yêu cầu xác thực tài khoản Nhân Viên (STAFF) hoặc Quản Trị Viên (ADMIN) chính thức.
          </p>

          {/* User Status Card */}
          <div className="bg-slate-100 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs mb-6 space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Tài khoản hiện tại:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser ? currentUser.email : 'Chưa đăng nhập'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Quyền hạn hệ thống:</span>
              <span className="font-extrabold text-rose-500 uppercase">{currentUser?.role ? `${currentUser.role} (CHƯA CÓ QUYỀN STAFF)` : 'KHÁCH (GUEST)'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2.5 font-heading text-xs font-bold transition-all shadow-xs"
            >
              <Home className="w-4 h-4" />
              <span>VỀ TRANG CHỦ</span>
            </Link>

            <Link
              href="/profile"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5B3DF5] to-[#7257F7] hover:from-[#4A2CE0] hover:to-[#5B3DF5] text-white px-4 py-2.5 font-heading text-xs font-extrabold transition-all shadow-md shadow-[#5B3DF5]/30"
            >
              <UserCheck className="w-4 h-4" />
              <span>ĐĂNG NHẬP STAFF</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col font-sans overflow-x-clip">
      
      {/* 1. TOP HEADER */}
      <PortalHeader
        portalType="staff"
        currentUser={currentUser}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchAllStaffData(true)}
        onOpenCreateProduct={handleOpenCreate}
        onOpenImportSerial={() => {
          if (products.length > 0) {
            setSelectedProductIdForSn(products[0].id);
          }
          setIsSnModalOpen(true);
        }}
      />

      {/* 2. BODY WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        
        {/* SIDEBAR NAVIGATION TABS */}
        <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 space-y-1.5 shrink-0 shadow-xs">
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products' 
                ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-md shadow-sky-500/20 font-extrabold' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Quản Lý Linh Kiện</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 dark:bg-slate-800 text-current">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory' 
                ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-md shadow-sky-500/20 font-extrabold' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Boxes className="w-4 h-4" />
              <span>Kho Mã Serial (SN)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 dark:bg-slate-800 text-current">
              {serials.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('assembly')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'assembly' 
                ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-md shadow-sky-500/20 font-extrabold' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Wrench className="w-4 h-4" />
              <span>Tiến Độ Lắp Ráp PC</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 dark:bg-slate-800 text-current">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('warranty')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'warranty' 
                ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-md shadow-sky-500/20 font-extrabold' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <SearchCode className="w-4 h-4" />
              <span>Tra Cứu Bảo Hành SN</span>
            </div>
            {activeTab === 'warranty' && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'coupons' 
                ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-md shadow-sky-500/20 font-extrabold' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4" />
              <span>Quản Lý Mã Giảm Giá</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 dark:bg-slate-800 text-current">
              {coupons.length}
            </span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Trạng thái:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                <span>Hoạt động</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Phiên làm việc:</span>
              <span className="font-mono text-[10px] truncate max-w-[110px]" title={currentUser?.email}>
                {currentUser?.email || 'staff@drx.vn'}
              </span>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
          
          {/* ============================================================ */}
          {/* TAB 1: PRODUCT MANAGEMENT                                    */}
          {/* ============================================================ */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              
              {/* TOOLBAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên linh kiện, thương hiệu, mã SKU..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-52 sm:w-60">
                    <ModernSelect
                      options={CATEGORY_FILTER_OPTIONS}
                      value={selectedCategory}
                      onChange={(val) => setSelectedCategory(String(val))}
                      placeholder="Lọc theo danh mục..."
                    />
                  </div>

                  <button
                    onClick={handleOpenCreate}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-sky-500/20 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Linh Kiện Mới</span>
                  </button>
                </div>
              </div>

              {/* PRODUCTS TABLE */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4 min-w-[240px]">Sản Phẩm Linh Kiện</th>
                        <th className="py-3 px-3">Danh Mục</th>
                        <th className="py-3 px-3">Thương Hiệu</th>
                        <th className="py-3 px-3">Giá Bán</th>
                        <th className="py-3 px-3 text-center">Tồn Kho Thực Tế</th>
                        <th className="py-3 px-3 text-center">Bảo Hành</th>
                        <th className="py-3 px-4 text-right">Thao Tác Kho</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 flex items-center gap-3 min-w-[240px]">
                            <img 
                              src={p.coverImage || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200'} 
                              alt={p.name} 
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0" 
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 dark:text-white line-clamp-1" title={p.name}>
                                  {p.name}
                                </span>
                                {p.createdAt && (new Date().getTime() - new Date(p.createdAt).getTime() < 48 * 60 * 60 * 1000) && (
                                  <span className="px-1.5 py-0.2 rounded-md text-[8.5px] font-black uppercase bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs shrink-0">
                                    MỚI
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                SKU: {p.modelCode || p.slug || p.id.slice(0, 8)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-extrabold text-[#0284c7] text-[10.5px] uppercase whitespace-nowrap">
                            {p.category}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {p.brand}
                          </td>
                          <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white whitespace-nowrap">
                            {formatVND(p.price)}
                          </td>
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {p.stockQuantity ?? p.stockCount ?? 0} Món
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                            {p.warrantyMonths || 36} Tháng
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer"
                                title="Chỉnh sửa linh kiện"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setViewingProduct(p)}
                                className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-[#0284c7] dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-all cursor-pointer"
                                title="Xem thông số kỹ thuật"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p)}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
                                title="Xóa linh kiện khỏi kho"
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

          {/* ============================================================ */}
          {/* TAB 2: INVENTORY & SERIALS (SN)                              */}
          {/* ============================================================ */}
          {activeTab === 'inventory' && (
            <SerialManagementSection
              products={products}
              serials={serials}
              orders={orders}
              onUpdateSerialStatus={handleUpdateSerialStatus}
              onDeleteSerial={handleDeleteSerial}
              onOpenAddSerialModal={(productId) => {
                if (productId) {
                  setSelectedProductIdForSn(productId);
                } else if (products.length > 0) {
                  setSelectedProductIdForSn(products[0].id);
                }
                setIsSnModalOpen(true);
              }}
              onViewOrder={(ord) => setViewingOrder(ord)}
              formatOrderDisplayCode={formatOrderDisplayCode}
            />
          )}

          {/* ============================================================ */}
          {/* TAB 3: PC ASSEMBLY PIPELINE & ORDERS                         */}
          {/* ============================================================ */}
          {activeTab === 'assembly' && (
            <div className="space-y-5">
              
              {/* TOOLBAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <ModernSelect
                    options={STAFF_ASSEMBLY_OPTIONS}
                    value={assemblyStatusFilter}
                    onChange={(val) => setAssemblyStatusFilter(String(val))}
                    placeholder="Lọc tiến độ..."
                    className="w-56 sm:w-64"
                    align="right"
                  />
                </div>
              </div>

              {/* ASSEMBLY CARDS GRID */}
              {filteredAssemblyOrders.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] flex items-center justify-center border border-sky-200 dark:border-sky-800">
                      <Wrench className="w-7 h-7 text-[#0284c7]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        Không có đơn lắp ráp nào
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {searchQuery || assemblyStatusFilter !== 'ALL'
                          ? `Không tìm thấy đơn lắp ráp nào phù hợp với bộ lọc "${assemblyStatusFilter !== 'ALL' ? assemblyStatusFilter : ''}" ${searchQuery ? `hoặc từ khóa "${searchQuery}"` : ''}.`
                          : 'Hiện tại chưa có đơn hàng PC cần lắp ráp mới nào.'}
                      </p>
                    </div>
                    {(searchQuery || assemblyStatusFilter !== 'ALL') && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setAssemblyStatusFilter('ALL');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                          Xóa bộ lọc tìm kiếm
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAssemblyOrders.map((ord) => {
                    if (!ord) return null;
                    const pDetails = typeof ord.paymentDetails === 'string'
                      ? (() => { try { return JSON.parse(ord.paymentDetails); } catch { return {}; } })()
                      : (ord.paymentDetails && typeof ord.paymentDetails === 'object' ? ord.paymentDetails : {});
                  const needInst = Boolean(pDetails.needInstallation);
                  const isProxy = Boolean(pDetails.isProxyRecipient);
                  const isPickup = ord.deliveryType === 'STORE_PICKUP';
                  const checksDone = [
                    pDetails.check_called,
                    pDetails.check_assembled,
                    pDetails.check_packed,
                    pDetails.check_handed_over,
                    pDetails.check_collected_cod || ord.paymentStatus === 'PAID'
                  ].filter(Boolean).length;

                  const orderDisplayCode = formatOrderDisplayCode(ord);
                  const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('vi-VN') : '';

                  return (
                    <div 
                      key={ord.id} 
                      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs hover:border-[#0284c7] transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#0284c7] text-xs">
                              {orderDisplayCode}
                            </span>
                            {ord.status === 'CANCELLED' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                Đã Hủy
                              </span>
                            )}
                          </div>
                          {dateStr && (
                            <span className="text-[10.5px] font-mono text-slate-400">
                              {dateStr}
                            </span>
                          )}
                        </div>

                        {/* SPECIAL REQUESTS BADGES */}
                        <div className="flex flex-wrap gap-1.5">
                          {ord.status === 'CANCELLED' ? (
                            <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              <span>Ngừng Vận Chuyển</span>
                            </span>
                          ) : (
                            <>
                              {needInst && (
                                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase bg-sky-100 dark:bg-sky-950 text-[#0284c7] border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                                  <Wrench className="w-3 h-3" />
                                  <span>Cần Ráp Máy / Cài Đặt</span>
                                </span>
                              )}
                              {isProxy && (
                                <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" />
                                  <span>Người Nhận Thay</span>
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {isPickup ? '🏬 Nhận Showroom' : '🚚 Giao Tận Nơi'}
                              </span>
                            </>
                          )}
                          <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            💵 COD
                          </span>
                        </div>

                        {/* Prominent Cancellation Reason Display */}
                        {ord.status === 'CANCELLED' && (
                          <div className="p-3 rounded-xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-300 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400 text-[11px] uppercase tracking-wide">
                              <Ban className="w-3.5 h-3.5 text-rose-500" />
                              <span>Lý do hủy đơn hàng:</span>
                            </div>
                            <p className="text-[11.5px] font-bold text-rose-900 dark:text-rose-200 leading-tight">
                              {pDetails.cancellationReason || 'Khách hủy / Không nhận hàng'}
                            </p>
                            {pDetails.cancelledAt && (
                              <span className="text-[9.5px] text-rose-500/80 dark:text-rose-400/70 block font-mono">
                                Hủy lúc: {new Date(pDetails.cancelledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                                {new Date(pDetails.cancelledAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-2">
                            {ord.orderItems && ord.orderItems.length > 0
                              ? ord.orderItems.map((oi: any) => `${oi.product?.name || 'Linh kiện'} (x${oi.quantity})`).join(', ')
                              : pDetails.items && Array.isArray(pDetails.items)
                              ? pDetails.items.map((it: any) => `${it.name} (x${it.quantity || 1})`).join(', ')
                              : 'Đơn Hàng Lắp Ráp PC DRX'}
                          </h4>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                            <p>Khách: <strong className="text-slate-800 dark:text-slate-200">{ord.customerName || 'Khách hàng'}</strong> ({ord.customerPhone || 'Chưa có SĐT'})</p>
                            <p className="truncate" title={ord.shippingAddress}>Địa chỉ: {ord.shippingAddress || 'Nhận tại Showroom DRX'}</p>
                            {ord.notes && <p className="italic text-slate-400 line-clamp-1">Ghi chú: "{ord.notes}"</p>}
                          </div>
                        </div>

                        {/* CHECKLIST PROGRESS BAR */}
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between">
                          <span className="text-slate-500 font-bold text-[10px] uppercase">Tiến Độ Check:</span>
                          <span className="font-mono font-black text-[#0284c7]">{checksDone}/5 Bước Hoàn Tất</span>
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-bold uppercase text-[10px]">Tổng Thanh Toán:</span>
                          <span className="font-black text-[#0284c7] font-heading">{formatVND(ord.netAmount || ord.totalAmount)}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                        <OrderStatusSelector
                          orderId={ord.id}
                          currentStatus={ord.status}
                          onStatusChange={(newSt) => {
                            if (newSt === 'CANCELLED') {
                              setCancellingOrder(ord);
                            } else {
                              handleUpdateOrderStatus(ord.id, newSt);
                            }
                          }}
                          size="sm"
                        />

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Mục Check Đơn</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: ELECTRONIC WARRANTY LOOKUP                           */}
          {/* ============================================================ */}
          {activeTab === 'warranty' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] flex items-center justify-center mx-auto border border-sky-200 dark:border-sky-800 shadow-xs">
                    <SearchCode className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-base font-black uppercase text-slate-900 dark:text-white">
                    TRA CỨU BẢO HÀNH ĐIỆN TỬ LINH KIỆN
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Nhập mã Serial Number (SN) hoặc số điện thoại khách hàng để kiểm tra thời hạn và xuất phiếu bảo hành chính hãng.
                  </p>
                </div>

                <form onSubmit={handleSearchWarranty} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={warrantyQuery}
                    onChange={(e) => setWarrantyQuery(e.target.value)}
                    placeholder="VD: SN-CPU-INTEL-13400F-881 hoặc số điện thoại..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingWarranty}
                    className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs uppercase rounded-xl transition-all shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSearchingWarranty ? 'Đang Tra Cứu...' : 'Tra Cứu'}
                  </button>
                </form>

                {/* WARRANTY CERTIFICATE CARD */}
                {warrantySearchResult && (
                  <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white to-sky-50/50 dark:from-slate-900 dark:to-slate-800/80 border border-sky-200 dark:border-sky-800 shadow-md space-y-4">
                    <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#0284c7]" />
                        <span className="font-heading text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          PHIẾU BẢO HÀNH ĐIỆN TỬ CHÍNH HÃNG DRX
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        warrantySearchResult.isValid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                      }`}>
                        {warrantySearchResult.isValid ? '✓ ĐANG CÒN HẠN BẢO HÀNH' : '✕ ĐÃ HẾT HẠN BẢO HÀNH'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Tên Linh Kiện:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm block">{warrantySearchResult.productName}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Mã Serial SN:</span>
                          <span className="font-mono font-black text-[#0284c7]">{warrantySearchResult.serialNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Thời Hạn Bảo Hành:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{warrantySearchResult.warrantyMonths} Tháng (1 Đổi 1)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Khách Hàng Sở Hữu:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{warrantySearchResult.customerName} ({warrantySearchResult.customerPhone})</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Hạn Đến Ngày:</span>
                          <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{warrantySearchResult.expiryDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-sky-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Mã Hóa Đơn: #{warrantySearchResult.orderCode}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Trung Tâm CSKH DRX: 1900 8888</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: COUPON & VOUCHER MANAGEMENT                          */}
          {/* ============================================================ */}
          {activeTab === 'coupons' && (
            <CouponManagementView canEdit={true} />
          )}

        </main>
      </div>

      {/* ============================================================ */}


      {/* ============================================================ */}
      {/* MODAL 2: VIEW PRODUCT TECHNICAL SPECS                         */}
      {/* ============================================================ */}
      {mounted && viewingProduct && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-900 dark:text-slate-100 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#0284c7] tracking-wider block">THÔNG SỐ KỸ THUẬT PHẦN CỨNG</span>
                  <h3 className="font-heading text-base font-black line-clamp-1">{viewingProduct.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="sm:col-span-4 aspect-square rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center">
                <img src={viewingProduct.coverImage} alt={viewingProduct.name} className="w-full h-full object-contain" />
              </div>
              <div className="sm:col-span-8 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#0284c7] text-white">
                    {viewingProduct.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Hãng: {viewingProduct.brand}
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white font-heading">
                  {formatVND(viewingProduct.price)}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Tồn Kho</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{viewingProduct.stockQuantity ?? viewingProduct.stockCount ?? 0} Món</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Bảo Hành</span>
                    <span className="text-slate-900 dark:text-white font-extrabold">{viewingProduct.warrantyMonths || 36} Tháng</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Chi Tiết Cấu Hình & Tương Thích</h4>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {viewingProduct.specs && Object.keys(viewingProduct.specs).length > 0 ? (
                  Object.entries(viewingProduct.specs).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-12 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="col-span-4 font-bold text-slate-500 uppercase text-[10.5px]">{key}</div>
                      <div className="col-span-8 font-extrabold text-slate-900 dark:text-white">{String(val)}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">Không có thông số kỹ thuật đặc biệt.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setViewingProduct(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-[#0284c7] text-white dark:text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================ */}
      {/* MODAL 3: IMPORT SERIAL NUMBERS INTO INVENTORY               */}
      {/* ============================================================ */}
      {mounted && isSnModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-slate-900 dark:text-slate-100 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#0284c7]" />
                <span>GÁN MÃ SERIAL (SN) VÀO KHO LINH KIỆN</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSnModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSerials} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px]">
                  Chọn Linh Kiện Gán Serial:
                </label>
                <ModernSelect
                  options={productSelectOptions}
                  value={selectedProductIdForSn}
                  onChange={(val) => setSelectedProductIdForSn(String(val))}
                  placeholder="Chọn linh kiện gán Serial..."
                />
              </div>

              {/* PRODUCT PREVIEW CARD */}
              {(() => {
                const selectedProd = products.find(p => p.id === selectedProductIdForSn);
                if (!selectedProd) return null;
                return (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                    {selectedProd.coverImage ? (
                      <img src={selectedProd.coverImage} alt={selectedProd.name} className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-800">
                        <Boxes className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-[#0284c7] text-white">
                          {selectedProd.category}
                        </span>
                        {selectedProd.modelCode && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            SKU: {selectedProd.modelCode}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white truncate text-xs mt-0.5">
                        {selectedProd.name}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px]">
                    Danh Sách Mã Serial (SN):
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const selectedProd = products.find(p => p.id === selectedProductIdForSn);
                        const rawPrefix = selectedProd?.modelCode || `${selectedProd?.brand || 'DRX'}-${selectedProd?.category || 'PART'}`;
                        const cleanPrefix = rawPrefix.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16);
                        const rand = Math.floor(100000 + Math.random() * 900000);
                        const newSn = `${cleanPrefix}-${rand}`;
                        setInputSerialsText(prev => prev.trim() ? `${prev.trim()}\n${newSn}` : newSn);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-[#0284c7] text-[10px] font-bold border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
                    >
                      + 1 Mã Mẫu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const selectedProd = products.find(p => p.id === selectedProductIdForSn);
                        const rawPrefix = selectedProd?.modelCode || `${selectedProd?.brand || 'DRX'}-${selectedProd?.category || 'PART'}`;
                        const cleanPrefix = rawPrefix.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16);
                        const list = Array.from({ length: 5 }, () => `${cleanPrefix}-${Math.floor(100000 + Math.random() * 900000)}`).join('\n');
                        setInputSerialsText(prev => prev.trim() ? `${prev.trim()}\n${list}` : list);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-[#0284c7] text-[10px] font-bold border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
                    >
                      + 5 Mã
                    </button>
                    {inputSerialsText && (
                      <button
                        type="button"
                        onClick={() => setInputSerialsText('')}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder={"TUF-RTX4060-O8G-GAMING-629377\nTUF-RTX4060-O8G-GAMING-833785\n(Hoặc click '+ 5 Mã' phía trên)"}
                  value={inputSerialsText}
                  onChange={(e) => setInputSerialsText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px]">
                  Trạng Thái Khởi Tạo:
                </label>
                <ModernSelect
                  options={SERIAL_STATUS_INIT_OPTIONS}
                  value={inputSerialStatus}
                  onChange={(val) => setInputSerialStatus(String(val))}
                  placeholder="Chọn trạng thái..."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSn}
                  className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingSn ? 'Đang Lưu...' : 'Xác Nhận Nhập Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================ */}
      {/* MODAL 4: PRODUCT CREATE / EDIT MODAL                          */}
      {/* ============================================================ */}
      {isFormModalOpen && (
        <ProductFormModal
          isOpen={isFormModalOpen}
          mode={formModalMode}
          initialData={editingProduct}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingProduct(null);
          }}
          onSaved={(savedProd) => {
            setIsFormModalOpen(false);
            setEditingProduct(null);
            if (savedProd) {
              setProducts((prev) => {
                const filtered = prev.filter(p => p.id !== savedProd.id && p.slug !== (savedProd as any).slug && p.name !== savedProd.name);
                return [{ ...savedProd, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...filtered];
              });
            }
            fetchAllStaffData(true);
          }}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL 5: ORDER VERIFICATION & CHECKLIST MODAL                 */}
      {/* ============================================================ */}
      {viewingOrder && (
        <OrderVerificationModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onOrderUpdated={(updated) => {
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            fetchAllStaffData(false);
          }}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL 6: CANCEL ORDER REASON CONFIRMATION                    */}
      {/* ============================================================ */}
      {cancellingOrder && (
        <CancelOrderModal
          isOpen={!!cancellingOrder}
          order={cancellingOrder}
          onClose={() => setCancellingOrder(null)}
          onConfirmCancel={handleConfirmCancelOrder}
          isUpdating={isCancellingOrder}
        />
      )}

    </div>
  );
}
