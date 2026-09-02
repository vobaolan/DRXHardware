"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, ShieldCheck, 
  TrendingUp, DollarSign, AlertTriangle, Plus, Search, Eye, 
  CheckCircle2, XCircle, Truck, ArrowUpRight, ChevronRight, 
  Boxes, Cpu, ShieldAlert, Lock, ArrowLeft, RefreshCw, Home,
  Wrench, FileText, Sparkles, Filter, X, Award, ExternalLink,
  Edit2, Trash2, Phone, Mail, MapPin, Calendar, Clock, Check,
  UserCheck, ArrowDownRight, BarChart3, Hash, Layers, UserPlus,
  KeyRound, Shield, ShieldQuestion
} from 'lucide-react';
import { motion } from 'framer-motion';
import { showToast } from '@/components/Toast';
import { ProductFormModal, ProductFormData } from '@/components/admin/ProductFormModal';
import { supabase } from '@/lib/supabase';
import { ModernSelect, SelectOption } from '@/components/ui/ModernSelect';

const USER_ROLE_SELECT_OPTIONS: SelectOption[] = [
  { value: 'USER', label: '👤 Khách Hàng (User)', badge: 'USER' },
  { value: 'STAFF', label: '🛠️ Nhân Viên (Staff)', badge: 'STAFF' },
  { value: 'ADMIN', label: '👑 Quản Trị Viên (Admin)', badge: 'ADMIN' },
];

// Category map
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

const formatVND = (num: number | string | null | undefined) => {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
};

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory' | 'users'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Database States
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalSerials: 0,
    serialsAvailable: 0,
    serialsSold: 0,
    serialsWarranty: 0,
  });
  const [last7Days, setLast7Days] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [serials, setSerials] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [serialStatusFilter, setSerialStatusFilter] = useState<string>('ALL');
  const [selectedUserRoleFilter, setSelectedUserRoleFilter] = useState<string>('ALL');

  // Modals
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  
  // User Management Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
  const [userFormData, setUserFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'USER',
    password: '',
  });
  const [viewingUserDetails, setViewingUserDetails] = useState<any | null>(null);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Serial import modal
  const [isSnModalOpen, setIsSnModalOpen] = useState(false);
  const [selectedProductIdForSn, setSelectedProductIdForSn] = useState('');
  const [inputSerialsText, setInputSerialsText] = useState('');
  const [inputSerialStatus, setInputSerialStatus] = useState('AVAILABLE');
  const [isSubmittingSn, setIsSubmittingSn] = useState(false);

  // 1. Fetch all live data from Database
  const fetchAllData = useCallback(async (showNotification = false) => {
    setIsRefreshing(true);
    try {
      const [statsRes, prodsRes, ordersRes, serialsRes, usersRes] = await Promise.all([
        fetch(`/api/admin/stats?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/admin/products?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/admin/orders?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/admin/serials?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/admin/users?t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) setStats(statsData.stats);
        if (statsData.last7Days) setLast7Days(statsData.last7Days);
      }

      if (prodsRes.ok) {
        const prodsData = await prodsRes.json();
        if (prodsData.products) setProducts(prodsData.products);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.orders) setOrders(ordersData.orders);
      }

      if (serialsRes.ok) {
        const serialsData = await serialsRes.json();
        if (serialsData.serials) setSerials(serialsData.serials);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.users) setUsers(usersData.users);
      }

      if (showNotification) {
        showToast('Đã đồng bộ toàn bộ dữ liệu thời gian thực từ Database!', 'success');
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Admin:', err);
      if (showNotification) {
        showToast('Lỗi khi cập nhật dữ liệu từ máy chủ.', 'error');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // 2. Auth checking & Initial Fetch
  useEffect(() => {
    const initAdmin = async () => {
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
          
          // Strict Role Policy: Only ADMIN can access CEO Admin Portal (/admin)
          // STAFF and regular USER are strictly forbidden from /admin
          if (role === 'ADMIN' || email === 'admin@drx.vn' || (email.includes('admin') && !email.includes('staff'))) {
            setIsAdmin(true);
            await fetchAllData();
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        setIsAdmin(false);
      } finally {
        setIsAuthChecking(false);
      }
    };

    initAdmin();

    // Realtime Postgres Changes
    const channel = supabase
      .channel('admin_global_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Order' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Product' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ProductSerial' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'User' }, () => fetchAllData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  // Max revenue for bar chart
  const maxRevenue = useMemo(() => {
    if (!last7Days || last7Days.length === 0) return 1;
    const max = Math.max(...last7Days.map(d => d.revenue || 0));
    return max > 0 ? max : 1;
  }, [last7Days]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.modelCode && p.modelCode.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));
      const matchesCategory = selectedCategoryFilter === 'ALL' || p.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategoryFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (o.orderCode && o.orderCode.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q));
      const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, orderStatusFilter]);

  // Filtered Serials
  const filteredSerials = useMemo(() => {
    return serials.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (s.serialNumber && s.serialNumber.toLowerCase().includes(q)) ||
        (s.product?.name && s.product.name.toLowerCase().includes(q)) ||
        (s.product?.brand && s.product.brand.toLowerCase().includes(q));
      const matchesStatus = serialStatusFilter === 'ALL' || s.status === serialStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [serials, searchQuery, serialStatusFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.address && u.address.toLowerCase().includes(q));
      
      const matchesRole = selectedUserRoleFilter === 'ALL' || u.role === selectedUserRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedUserRoleFilter]);

  // Handlers for Products
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

  const handleDeleteProduct = async (p: any) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${p.name}" khỏi cơ sở dữ liệu?`)) return;
    try {
      const res = await fetch(`/api/admin/products?id=${p.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(x => x.id !== p.id));
        showToast(`Đã xóa sản phẩm "${p.name}" thành công!`, 'success');
        fetchAllData();
      } else {
        showToast('Không thể xóa sản phẩm lúc này.', 'error');
      }
    } catch (e) {
      showToast('Lỗi khi xóa sản phẩm!', 'error');
    }
  };

  // Handlers for Orders
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (viewingOrder && viewingOrder.id === orderId) {
          setViewingOrder({ ...viewingOrder, status: newStatus });
        }
        showToast(`Đã chuyển đơn hàng sang trạng thái: ${newStatus}`, 'success');
        fetchAllData();
      } else {
        showToast('Lỗi khi cập nhật trạng thái đơn hàng!', 'error');
      }
    } catch (e) {
      showToast('Không thể kết nối máy chủ để cập nhật đơn.', 'error');
    }
  };

  // Handlers for Serials Import
  const handleImportSerials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductIdForSn) {
      showToast('Vui lòng chọn sản phẩm cần gán mã Serial!', 'error');
      return;
    }
    if (!inputSerialsText.trim()) {
      showToast('Vui lòng nhập ít nhất một mã Serial!', 'error');
      return;
    }

    setIsSubmittingSn(true);
    try {
      const res = await fetch('/api/admin/serials', {
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
        fetchAllData();
      } else {
        showToast(data.message || 'Lỗi khi nhập Serial.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setIsSubmittingSn(false);
    }
  };

  const handleDeleteSerial = async (serialId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã Serial này khỏi kho?')) return;
    try {
      const res = await fetch(`/api/admin/serials?id=${serialId}`, { method: 'DELETE' });
      if (res.ok) {
        setSerials(prev => prev.filter(s => s.id !== serialId));
        showToast('Đã xóa mã Serial thành công!', 'success');
        fetchAllData();
      } else {
        showToast('Lỗi khi xóa mã Serial.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ.', 'error');
    }
  };

  // Handlers for User Account Management (CRUD & Permissions)
  const handleOpenCreateUser = () => {
    setUserFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'USER',
      password: '',
    });
    setUserModalMode('create');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: any) => {
    setUserFormData({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      address: u.address || '',
      role: u.role || 'USER',
      password: '',
    });
    setUserModalMode('edit');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.email) {
      showToast('Vui lòng nhập Email tài khoản!', 'error');
      return;
    }
    if (userModalMode === 'create' && (!userFormData.password || userFormData.password.length < 6)) {
      showToast('Mật khẩu khởi tạo tối thiểu 6 ký tự!', 'error');
      return;
    }

    setIsSubmittingUser(true);
    try {
      if (userModalMode === 'create') {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userFormData),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || 'Đã tạo tài khoản thành công!', 'success');
          setIsUserModalOpen(false);
          fetchAllData();
        } else {
          showToast(data.message || 'Lỗi khi tạo tài khoản.', 'error');
        }
      } else {
        // Edit Mode
        const res = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userFormData.id,
            name: userFormData.name,
            phone: userFormData.phone,
            address: userFormData.address,
            role: userFormData.role,
            newPassword: userFormData.password ? userFormData.password : undefined,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Đã cập nhật thông tin tài khoản thành công!', 'success');
          setIsUserModalOpen(false);
          fetchAllData();
        } else {
          showToast(data.message || 'Lỗi khi cập nhật tài khoản.', 'error');
        }
      }
    } catch (err: any) {
      showToast('Lỗi kết nối máy chủ khi lưu tài khoản.', 'error');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (u: any) => {
    if (u.email === 'admin@drx.vn') {
      showToast('Không thể xóa tài khoản Quản trị Master (admin@drx.vn)!', 'error');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${u.name || u.email}" (${u.email}) khỏi hệ thống? Thao tác không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?userId=${u.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => prev.filter(x => x.id !== u.id));
        showToast(data.message || 'Đã xóa tài khoản thành công!', 'success');
      } else {
        showToast(data.message || 'Không thể xóa tài khoản lúc này.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ.', 'error');
    }
  };

  // Handlers for User Role Quick Switch
  const handleSetUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        showToast(`Đã cập nhật phân quyền thành công: ${newRole}!`, 'success');
      } else {
        showToast('Lỗi khi cập nhật quyền tài khoản.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ.', 'error');
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold font-mono">
        <RefreshCw className="h-5 w-5 animate-spin text-[#0284c7] mr-2" />
        Đang xác thực quyền truy cập DRX Admin Portal...
      </div>
    );
  }

  if (!isAdmin) {
    const isStaffUser = currentUser?.role === 'STAFF' || String(currentUser?.email || '').toLowerCase().includes('staff');
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
            {isStaffUser ? (
              <>
                Tài khoản của bạn mang vai trò <strong>NHÂN VIÊN (STAFF)</strong>. Theo quy định phân quyền, nhân viên không có quyền truy cập Cổng Quản Trị CEO (Admin). Vui lòng chuyển sang Cổng Vận Hành Kho.
              </>
            ) : (
              <>
                Bạn không có quyền truy cập vào bảng quản trị **DRX Admin System**. Khu vực này yêu cầu xác thực tài khoản Quản Trị Viên chính thức.
              </>
            )}
          </p>

          {/* User Status Card */}
          <div className="bg-slate-100 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs mb-6 space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Tài khoản hiện tại:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser ? currentUser.email : 'Chưa đăng nhập'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Quyền hạn hệ thống:</span>
              <span className="font-extrabold text-rose-500 uppercase">{currentUser?.role ? currentUser.role : 'KHÁCH (GUEST)'}</span>
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

            {isStaffUser ? (
              <Link
                href="/staff"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white px-4 py-2.5 font-heading text-xs font-extrabold transition-all shadow-md shadow-sky-500/30"
              >
                <Wrench className="w-4 h-4" />
                <span>CỔNG STAFF</span>
              </Link>
            ) : (
              <Link
                href="/profile"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5B3DF5] to-[#7257F7] hover:from-[#4A2CE0] hover:to-[#5B3DF5] text-white px-4 py-2.5 font-heading text-xs font-extrabold transition-all shadow-md shadow-[#5B3DF5]/30"
              >
                <UserCheck className="w-4 h-4" />
                <span>ĐĂNG NHẬP ADMIN</span>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col font-sans overflow-x-clip">
      
      {/* 1. TOP HEADER */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" title="Trang chủ DRX HARDWARE">
            <img src="/logo/logo-blue.png" alt="DRX Logo" className="h-8 sm:h-9 w-auto object-contain hover:scale-105 transition-transform" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white tracking-wide truncate">
                DRX HARDWARE ADMIN CENTER
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Database
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Quản lý doanh thu, kho linh kiện, đơn hàng và bảo hành thời gian thực.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchAllData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs disabled:opacity-60"
            title="Đồng bộ dữ liệu tức thì từ PostgreSQL Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0284c7] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Đang Tải...' : 'Đồng Bộ Live'}</span>
          </button>

          <button
            onClick={() => {
              if (products.length > 0) {
                setSelectedProductIdForSn(products[0].id);
              }
              setIsSnModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-[#0284c7] dark:text-sky-300 font-bold text-xs border border-sky-200 dark:border-sky-800 transition-all cursor-pointer shadow-xs"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>+ Nhập Serial SN</span>
          </button>

          <Link
            href="/staff"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cổng Staff (/staff)</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700"
            title="Quay lại giao diện bán hàng"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Cửa Hàng</span>
          </Link>
        </div>
      </header>

      {/* 2. BODY WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        
        {/* SIDEBAR TABS */}
        <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 space-y-1.5 shrink-0 shadow-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-md shadow-sky-500/20 font-extrabold' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Báo Cáo Doanh Thu</span>
            </div>
            {activeTab === 'overview' && <ChevronRight className="w-4 h-4" />}
          </button>

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
              <span>Kho Linh Kiện</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 dark:bg-slate-800 text-current">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-md shadow-sky-500/20 font-extrabold' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4 h-4" />
              <span>Đơn Hàng & Vận Chuyển</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 dark:bg-slate-800 text-current">
              {orders.length}
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
              <span>Quản Lý Serial (SN)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 dark:bg-slate-800 text-current">
              {serials.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users' 
                ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-md shadow-sky-500/20 font-extrabold' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Khách Hàng & Quyền</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 dark:bg-slate-800 text-current">
              {users.length}
            </span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Trạng thái DB:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Phiên làm việc:</span>
              <span className="font-mono text-[10px] truncate max-w-[110px]" title={currentUser?.email}>
                {currentUser?.email || 'admin@drx.vn'}
              </span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT WORKSPACE */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
          
          {/* ============================================================ */}
          {/* TAB 1: OVERVIEW & REAL ANALYTICS                             */}
          {/* ============================================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* 4 CORE STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-xs hover:border-[#0284c7] transition-all">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-[11px] font-black uppercase tracking-wider">Tổng Doanh Thu Thực</span>
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                      {formatVND(stats.totalRevenue)}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold mt-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Tính từ các đơn hoàn tất/thanh toán
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-xs hover:border-[#0284c7] transition-all">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-[11px] font-black uppercase tracking-wider">Lợi Nhuận Tạm Tính</span>
                    <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                      {formatVND(stats.totalProfit)}
                    </p>
                    <p className="text-[11px] text-sky-600 dark:text-sky-400 flex items-center gap-1 font-bold mt-1">
                      Biên lợi nhuận gộp ~15.0%
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-xs hover:border-[#0284c7] transition-all">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-[11px] font-black uppercase tracking-wider">Đơn Hàng Thực Tế</span>
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                      {stats.totalOrders} Đơn Hàng
                    </p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold mt-1">
                      {stats.pendingOrders} đơn chờ duyệt • {stats.shippingOrders} đang giao
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-xs hover:border-[#0284c7] transition-all">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-[11px] font-black uppercase tracking-wider">Mã Serial Bảo Hành</span>
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                      <Boxes className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                      {stats.totalSerials} Mã Serial
                    </p>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1 font-bold mt-1">
                      {stats.serialsAvailable} còn trong kho • {stats.serialsSold} đã bán
                    </p>
                  </div>
                </div>
              </div>

              {/* CHARTS & RECENT ACTIVITY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 7-DAY REVENUE BAR CHART (8 COLS) */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <div>
                      <h3 className="font-heading text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#0284c7]" />
                        <span>DOANH THU 7 NGÀY GẦN NHẤT (THỜI GIAN THỰC)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Thống kê tổng tiền từ các đơn hàng phần cứng thực tế theo ngày.
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      Đỉnh: {formatVND(maxRevenue)}
                    </span>
                  </div>

                  <div className="h-56 flex items-end justify-between gap-2.5 pt-4 px-1">
                    {last7Days.map((item, idx) => {
                      const heightPercent = maxRevenue > 0 ? Math.round(((item.revenue || 0) / maxRevenue) * 100) : 0;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold py-1 px-2 rounded border border-slate-800 dark:border-slate-200 whitespace-nowrap shadow-xl pointer-events-none mb-1">
                            {formatVND(item.revenue)} ({item.orders} đơn)
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden h-full flex items-end">
                            <div 
                              style={{ height: `${Math.max(heightPercent, 6)}%` }}
                              className={`w-full transition-all rounded-t-lg shadow-sm ${
                                item.revenue > 0 
                                  ? 'bg-gradient-to-t from-[#0284c7] to-[#38bdf8]' 
                                  : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-[#0284c7] transition-colors truncate max-w-[45px] sm:max-w-none text-center">
                            {item.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* OVERVIEW SUMMARY (4 COLS) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                  <h3 className="font-heading text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-[#0284c7]" />
                    <span>TỔNG QUAN HỆ THỐNG</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Sản phẩm linh kiện</span>
                      <span className="font-black text-slate-900 dark:text-white">{stats.totalProducts} mã hàng</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Khách hàng thành viên</span>
                      <span className="font-black text-slate-900 dark:text-white">{stats.totalUsers} tài khoản</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Mã Serial trong kho</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">{stats.serialsAvailable} mã khả dụng</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Đơn hàng hoàn tất</span>
                      <span className="font-black text-slate-900 dark:text-white">{stats.completedOrders} đơn</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0284c7] hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Xem Danh Sách Đơn Hàng</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* RECENT ORDERS TABLE */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-heading text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#0284c7]" />
                    <span>ĐƠN HÀNG GẦN ĐÂY NHẤT ({orders.slice(0, 5).length})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#0284c7] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Xem tất cả</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    Chưa có đơn hàng nào trong hệ thống.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                          <th className="py-2.5 px-3">Mã Đơn</th>
                          <th className="py-2.5 px-3">Khách Hàng</th>
                          <th className="py-2.5 px-3">Linh Kiện / Sản Phẩm</th>
                          <th className="py-2.5 px-3">Tổng Tiền</th>
                          <th className="py-2.5 px-3">Trạng Thái</th>
                          <th className="py-2.5 px-3 text-right">Hành Động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {orders.slice(0, 5).map((o: any) => (
                          <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-[#0284c7]">
                              #{o.orderCode || o.id.slice(0, 8)}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-900 dark:text-white block">{o.customerName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{o.customerPhone}</span>
                            </td>
                            <td className="py-3 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300">
                              {o.orderItems && o.orderItems.length > 0 
                                ? o.orderItems.map((oi: any) => `${oi.product?.name || 'Linh kiện'} (x${oi.quantity})`).join(', ')
                                : 'Đơn hàng PC / Linh kiện'}
                            </td>
                            <td className="py-3 px-3 font-black text-slate-900 dark:text-white">
                              {formatVND(o.netAmount || o.totalAmount)}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' :
                                o.status === 'SHIPPING' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' :
                                o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' :
                                o.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' :
                                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setViewingOrder(o)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#0284c7] hover:text-white text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-all cursor-pointer"
                              >
                                Xem
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: PRODUCTS CATALOG                                      */}
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
                    placeholder="Tìm kiếm linh kiện, thương hiệu, mã SKU..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-52 sm:w-60">
                    <ModernSelect
                      options={CATEGORY_FILTER_OPTIONS}
                      value={selectedCategoryFilter}
                      onChange={(val) => setSelectedCategoryFilter(String(val))}
                      placeholder="Lọc theo danh mục..."
                    />
                  </div>

                  <button
                    onClick={handleOpenCreate}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-sky-500/20 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Mới</span>
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
                        <th className="py-3 px-3 text-center">Tồn Kho</th>
                        <th className="py-3 px-3 text-center">Bảo Hành</th>
                        <th className="py-3 px-4 text-right">Thao Tác</th>
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
                            {p.warrantyMonths || 36}T
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer"
                                title="Chỉnh sửa sản phẩm"
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
                                title="Xóa sản phẩm"
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
          {/* TAB 3: ORDERS MANAGEMENT                                     */}
          {/* ============================================================ */}
          {activeTab === 'orders' && (
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

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#0284c7]"
                  >
                    <option value="ALL">Tất Cả Trạng Thái</option>
                    <option value="PENDING">Chờ Duyệt (PENDING)</option>
                    <option value="CONFIRMED">Đã Xác Nhận (CONFIRMED)</option>
                    <option value="SHIPPING">Đang Vận Chuyển (SHIPPING)</option>
                    <option value="COMPLETED">Đã Hoàn Tất (COMPLETED)</option>
                    <option value="CANCELLED">Đã Hủy (CANCELLED)</option>
                  </select>
                </div>
              </div>

              {/* ORDERS TABLE */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Mã Đơn Hàng</th>
                        <th className="py-3 px-3">Khách Hàng</th>
                        <th className="py-3 px-3">Địa Chỉ Giao</th>
                        <th className="py-3 px-3">Linh Kiện Trong Đơn</th>
                        <th className="py-3 px-3">Thanh Toán</th>
                        <th className="py-3 px-3">Tổng Tiền</th>
                        <th className="py-3 px-3">Trạng Thái</th>
                        <th className="py-3 px-4 text-right">Xử Lý Đơn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#0284c7] whitespace-nowrap">
                            #{o.orderCode || o.id.slice(0, 8)}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="font-bold text-slate-900 dark:text-white block">{o.customerName}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{o.customerPhone}</span>
                          </td>
                          <td className="py-3.5 px-3 max-w-[200px] truncate text-slate-600 dark:text-slate-300" title={o.shippingAddress}>
                            {o.shippingAddress || 'Nhận tại cửa hàng'}
                          </td>
                          <td className="py-3.5 px-3 max-w-xs truncate text-slate-600 dark:text-slate-300">
                            {o.orderItems && o.orderItems.length > 0
                              ? o.orderItems.map((oi: any) => `${oi.product?.name || 'Sản phẩm'} (x${oi.quantity})`).join(', ')
                              : 'Chi tiết linh kiện'}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {o.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white whitespace-nowrap">
                            {formatVND(o.netAmount || o.totalAmount)}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className={`text-[10.5px] font-black uppercase px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${
                                o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' :
                                o.status === 'SHIPPING' ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' :
                                o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' :
                                o.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' :
                                'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              }`}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="SHIPPING">SHIPPING</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setViewingOrder(o)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0284c7] hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                            >
                              Xem Chi Tiết
                            </button>
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
          {/* TAB 4: INVENTORY & SERIALS (SN)                              */}
          {/* ============================================================ */}
          {activeTab === 'inventory' && (
            <div className="space-y-5">
              
              {/* TOOLBAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo mã Serial SN, tên linh kiện, hãng..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-56 sm:w-64">
                    <ModernSelect
                      options={SERIAL_STATUS_OPTIONS}
                      value={serialStatusFilter}
                      onChange={(val) => setSerialStatusFilter(String(val))}
                      placeholder="Trạng thái Serial..."
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (products.length > 0) {
                        setSelectedProductIdForSn(products[0].id);
                      }
                      setIsSnModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-sky-500/20 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nhập Mã Serial Mới</span>
                  </button>
                </div>
              </div>

              {/* SERIALS TABLE */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Mã Serial Number (SN)</th>
                        <th className="py-3 px-3">Linh Kiện Liên Kết</th>
                        <th className="py-3 px-3">Danh Mục</th>
                        <th className="py-3 px-3 text-center">Trạng Thái Kho</th>
                        <th className="py-3 px-3">Ngày Nhập</th>
                        <th className="py-3 px-3">Đơn Hàng Liên Kết</th>
                        <th className="py-3 px-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredSerials.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              {s.serialNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 min-w-[200px]">
                            <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                              {s.product?.name || 'Linh kiện DRX'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Hãng: {s.product?.brand || 'DRX'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-extrabold text-[#0284c7] text-[10px] uppercase whitespace-nowrap">
                            {s.product?.category || 'PART'}
                          </td>
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                              s.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' :
                              s.status === 'SOLD' ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' :
                              'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                            }`}>
                              {s.status === 'AVAILABLE' ? 'Trong Kho' : s.status === 'SOLD' ? 'Đã Xuất Bán' : 'Bảo Hành'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                            {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px] text-[#0284c7]">
                            {s.order?.orderCode ? `#${s.order.orderCode}` : '-'}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteSerial(s.id)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
                              title="Xóa Serial"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
          {/* TAB 5: USERS & PERMISSIONS MANAGEMENT                         */}
          {/* ============================================================ */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              
              {/* METRICS OVERVIEW */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Thành Viên</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-heading text-slate-900 dark:text-white mt-2">
                    {users.length}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Toàn bộ tài khoản trên hệ thống</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Khách Hàng (User)</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-heading text-slate-900 dark:text-white mt-2">
                    {users.filter(u => u.role === 'USER' || !u.role).length}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">Mua sắm & tra cứu bảo hành</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nhân Viên (Staff)</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                      <Wrench className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-heading text-slate-900 dark:text-white mt-2">
                    {users.filter(u => u.role === 'STAFF').length}
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium">Vận hành kho & ráp máy</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quản Trị (Admin)</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-heading text-slate-900 dark:text-white mt-2">
                    {users.filter(u => u.role === 'ADMIN').length}
                  </div>
                  <span className="text-[10px] text-purple-600 font-medium">Toàn quyền kiểm soát CEO</span>
                </div>
              </div>

              {/* TOOLBAR: SEARCH & FILTERS & ADD USER BUTTON */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                
                {/* ROLE FILTER PILLS */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'ALL', label: `Tất Cả (${users.length})` },
                    { id: 'USER', label: `Khách Hàng (${users.filter(u => u.role === 'USER' || !u.role).length})` },
                    { id: 'STAFF', label: `Nhân Viên (${users.filter(u => u.role === 'STAFF').length})` },
                    { id: 'ADMIN', label: `Quản Trị (${users.filter(u => u.role === 'ADMIN').length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedUserRoleFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedUserRoleFilter === tab.id
                          ? 'bg-[#0284c7] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2.5">
                  {/* SEARCH INPUT */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm tên, email, SĐT, địa chỉ..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  {/* ADD USER BUTTON */}
                  <button
                    onClick={handleOpenCreateUser}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Thêm Tài Khoản</span>
                  </button>
                </div>
              </div>

              {/* USERS TABLE */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Tài Khoản Thành Viên</th>
                        <th className="py-3 px-3">Phân Quyền Hệ Thống</th>
                        <th className="py-3 px-3">Số Điện Thoại</th>
                        <th className="py-3 px-3">Địa Chỉ Giao Hàng</th>
                        <th className="py-3 px-3">Đơn Hàng & Chi Tiêu</th>
                        <th className="py-3 px-3">Ngày Tham Gia</th>
                        <th className="py-3 px-4 text-right">Thao Tác Quản Lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-medium">
                            Không tìm thấy tài khoản người dùng nào phù hợp với bộ lọc.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            {/* USER INFO */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-950/80 text-[#0284c7] font-black flex items-center justify-center text-xs shrink-0 border border-sky-200 dark:border-sky-800">
                                  {(u.name || u.email || 'U')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[180px]">
                                    {u.name || 'Khách hàng DRX'}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-mono block truncate max-w-[180px]">
                                    {u.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* ROLE BADGE & QUICK SWITCH */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                  u.role === 'ADMIN' 
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' 
                                    : u.role === 'STAFF'
                                    ? 'bg-sky-50 text-[#0284c7] border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                }`}>
                                  {u.role === 'ADMIN' ? '👑 ADMIN' : u.role === 'STAFF' ? '🛠️ STAFF' : '👤 USER'}
                                </span>
                                <select
                                  value={u.role || 'USER'}
                                  onChange={(e) => handleSetUserRole(u.id, e.target.value)}
                                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#0284c7] cursor-pointer"
                                  title="Đổi phân quyền nhanh"
                                >
                                  <option value="USER">USER</option>
                                  <option value="STAFF">STAFF</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              </div>
                            </td>

                            {/* PHONE */}
                            <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              {u.phone ? (
                                <a href={`tel:${u.phone}`} className="hover:text-[#0284c7] flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{u.phone}</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">Chưa có SĐT</span>
                              )}
                            </td>

                            {/* ADDRESS */}
                            <td className="py-3.5 px-3 max-w-[180px] truncate text-slate-600 dark:text-slate-300" title={u.address}>
                              {u.address || <span className="text-slate-400 italic">Chưa có địa chỉ</span>}
                            </td>

                            {/* ORDERS & SPEND */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {u._count?.orders ?? 0} đơn hàng
                              </span>
                              {u.totalSpent ? (
                                <span className="text-[11px] text-emerald-600 font-mono block">
                                  {formatVND(u.totalSpent)}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-mono block">0 đ</span>
                              )}
                            </td>

                            {/* JOIN DATE */}
                            <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                              {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                            </td>

                            {/* ACTIONS */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* VIEW DETAILS BUTTON */}
                                <button
                                  onClick={() => setViewingUserDetails(u)}
                                  className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-[#0284c7] border border-sky-200 dark:border-sky-800 transition-all cursor-pointer"
                                  title="Xem Hồ Sơ Chi Tiết"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* EDIT / RESET PASSWORD BUTTON */}
                                <button
                                  onClick={() => handleOpenEditUser(u)}
                                  className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer"
                                  title="Chỉnh Sửa & Đổi Mật Khẩu"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* DELETE BUTTON */}
                                {u.email !== 'admin@drx.vn' && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
                                    title="Xóa Tài Khoản"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: VIEW ORDER DETAILS                                   */}
      {/* ============================================================ */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7]">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#0284c7] tracking-wider block">CHI TIẾT ĐƠN HÀNG</span>
                  <h3 className="font-heading text-base font-black">#{viewingOrder.orderCode || viewingOrder.id}</h3>
                </div>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* CUSTOMER & SHIPPING INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Khách hàng:</span>
                <span className="font-bold text-slate-900 dark:text-white block">{viewingOrder.customerName}</span>
                <span className="font-mono text-slate-500 block">{viewingOrder.customerPhone}</span>
                <span className="text-slate-500 block">{viewingOrder.customerEmail}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Địa chỉ giao hàng:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 block">{viewingOrder.shippingAddress || 'Nhận tại shop'}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mt-2">Ghi chú khách:</span>
                <span className="text-slate-600 dark:text-slate-300 italic block">{viewingOrder.notes || 'Không có ghi chú.'}</span>
              </div>
            </div>

            {/* ORDER ITEMS LIST */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Linh kiện & Sản phẩm ({viewingOrder.orderItems?.length || 0})</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {viewingOrder.orderItems && viewingOrder.orderItems.length > 0 ? (
                  viewingOrder.orderItems.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                          {item.product?.name || 'Linh kiện phần cứng'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Số lượng: {item.quantity} • Đơn giá: {formatVND(item.price)}
                        </span>
                      </div>
                      <span className="font-black text-slate-900 dark:text-white shrink-0">
                        {formatVND((item.quantity || 1) * Number(item.price || 0))}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">Không có dữ liệu linh kiện.</div>
                )}
              </div>
            </div>

            {/* TOTAL & QUICK STATUS UPDATE */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng hóa đơn thanh toán</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-heading">
                  {formatVND(viewingOrder.netAmount || viewingOrder.totalAmount)}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleUpdateOrderStatus(viewingOrder.id, 'CONFIRMED')}
                  className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Xác Nhận Đơn
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus(viewingOrder.id, 'SHIPPING')}
                  className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Đang Giao Hàng
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus(viewingOrder.id, 'COMPLETED')}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Hoàn Tất Đơn
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: VIEW PRODUCT TECHNICAL SPECS                         */}
      {/* ============================================================ */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-900 dark:text-slate-100">
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
                  <div className="p-4 text-center text-slate-400">Không có thông số đặc biệt.</div>
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
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: IMPORT SERIAL NUMBERS INTO INVENTORY               */}
      {/* ============================================================ */}
      {isSnModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#0284c7]" />
                <span>NHẬP MÃ SERIAL (SN) VÀO KHO</span>
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
                <select
                  value={selectedProductIdForSn}
                  onChange={(e) => setSelectedProductIdForSn(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.category}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px] flex items-center justify-between">
                  <span>Danh Sách Mã Serial (SN):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Mỗi mã một dòng</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={"SN-RTX4060-ASUS-001\nSN-RTX4060-ASUS-002\nSN-RTX4060-ASUS-003"}
                  value={inputSerialsText}
                  onChange={(e) => setInputSerialsText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px]">
                  Trạng Thái Khởi Tạo:
                </label>
                <select
                  value={inputSerialStatus}
                  onChange={(e) => setInputSerialStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                >
                  <option value="AVAILABLE">AVAILABLE (Có Sẵn Trong Kho)</option>
                  <option value="SOLD">SOLD (Đã Xuất Bán)</option>
                  <option value="WARRANTY">WARRANTY (Đang Bảo Hành)</option>
                </select>
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
        </div>
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
            fetchAllData(true);
          }}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL 5: USER CREATE / EDIT & RESET PASSWORD MODAL            */}
      {/* ============================================================ */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7]">
                  {userModalMode === 'create' ? <UserPlus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#0284c7] tracking-wider block">
                    {userModalMode === 'create' ? 'TẠO TÀI KHOẢN MỚI' : 'CHỈNH SỬA TÀI KHOẢN'}
                  </span>
                  <h3 className="font-heading text-sm font-black text-slate-900 dark:text-white">
                    {userModalMode === 'create' ? 'Thêm Người Dùng / Nhân Viên Mới' : `Cập Nhật: ${userFormData.email}`}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* EMAIL */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px]">
                    Email Đăng Nhập: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={userModalMode === 'edit'}
                    placeholder="example@drx.vn"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7] disabled:opacity-60"
                  />
                </div>

                {/* ROLE */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px]">
                    Phân Quyền Vai Trò: <span className="text-rose-500">*</span>
                  </label>
                  <ModernSelect
                    options={USER_ROLE_SELECT_OPTIONS}
                    value={userFormData.role}
                    onChange={(val) => setUserFormData({ ...userFormData, role: String(val) })}
                    placeholder="Chọn phân quyền..."
                  />
                </div>
              </div>

              {/* FULL NAME */}
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px]">
                  Họ và Tên:
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* PHONE */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px]">
                    Số Điện Thoại:
                  </label>
                  <input
                    type="tel"
                    placeholder="0987654321"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                {/* PASSWORD / RESET PASSWORD */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px] flex items-center justify-between">
                    <span>{userModalMode === 'create' ? 'Mật Khẩu Khởi Tạo:' : 'Đổi Mật Khẩu Mới:'}</span>
                    {userModalMode === 'edit' && <span className="text-[10px] text-slate-400 font-normal">Để trống nếu không đổi</span>}
                  </label>
                  <input
                    type="text"
                    required={userModalMode === 'create'}
                    placeholder={userModalMode === 'create' ? "Tối thiểu 6 ký tự..." : "Nhập mật khẩu mới..."}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              {/* ADDRESS */}
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px]">
                  Địa Chỉ Nhận Hàng Mặc Định:
                </label>
                <textarea
                  rows={2}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                  value={userFormData.address}
                  onChange={(e) => setUserFormData({ ...userFormData, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingUser ? 'Đang Lưu...' : userModalMode === 'create' ? 'Tạo Tài Khoản' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 6: VIEW USER DETAILS & PURCHASE STATS                   */}
      {/* ============================================================ */}
      {viewingUserDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-[#0284c7] font-black flex items-center justify-center text-base shrink-0 border border-sky-200 dark:border-sky-800">
                  {(viewingUserDetails.name || viewingUserDetails.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading text-base font-black text-slate-900 dark:text-white">
                    {viewingUserDetails.name || 'Khách hàng DRX'}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono block">
                    {viewingUserDetails.email}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingUserDetails(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* USER STATS GRID */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Vai Trò Hệ Thống</span>
                <span className="text-xs font-black uppercase text-[#0284c7] mt-1 block">
                  {viewingUserDetails.role === 'ADMIN' ? '👑 Quản Trị Viên (Admin)' : viewingUserDetails.role === 'STAFF' ? '🛠️ Nhân Viên (Staff)' : '👤 Khách Hàng (User)'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Số Điện Thoại</span>
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 mt-1 block">
                  {viewingUserDetails.phone || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Đơn Hàng</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 block">
                  {viewingUserDetails._count?.orders ?? 0} đơn hàng
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Tiền Đã Mua</span>
                <span className="text-xs font-black font-mono text-emerald-600 mt-1 block">
                  {formatVND(viewingUserDetails.totalSpent || 0)}
                </span>
              </div>
            </div>

            {/* ADDRESS & REGISTRATION */}
            <div className="space-y-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Địa Chỉ Giao Hàng:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {viewingUserDetails.address || 'Chưa thiết lập địa chỉ giao hàng'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Ngày Đăng Ký Tài Khoản:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {new Date(viewingUserDetails.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  const targetUser = viewingUserDetails;
                  setViewingUserDetails(null);
                  handleOpenEditUser(targetUser);
                }}
                className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-600 dark:text-amber-400 font-extrabold text-xs border border-amber-200 dark:border-amber-800 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Chỉnh Sửa / Đổi MK</span>
              </button>
              <button
                onClick={() => setViewingUserDetails(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-[#0284c7] text-white dark:text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
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
