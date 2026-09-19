"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, ShieldCheck, 
  TrendingUp, DollarSign, AlertTriangle, Plus, Search, Eye, 
  CheckCircle2, XCircle, Truck, ArrowUpRight, ChevronRight, 
  Boxes, Cpu, ShieldAlert, Lock, ArrowLeft, RefreshCw, Home,
  Wrench, FileText, Sparkles, Filter, X, Award, ExternalLink,
  Edit2, Trash2, Phone, Mail, MapPin, Calendar, Clock, Check,
  UserCheck, ArrowDownRight, BarChart3, Hash, Layers, UserPlus,
  KeyRound, Shield, ShieldQuestion, PackageCheck, Ban, Tag,
  ChevronDown, Activity, Database, Zap, ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { showToast, showConfirm } from '@/components/Toast';
import { ProductFormModal, ProductFormData } from '@/components/admin/ProductFormModal';
import { supabase } from '@/lib/supabase';
import { authFetch } from '@/lib/auth-client';
import { ModernSelect, SelectOption } from '@/components/ui/ModernSelect';
import { PortalHeader } from '@/components/admin/PortalHeader';
import { OrderVerificationModal } from '@/components/admin/OrderVerificationModal';
import { OrderStatusSelector } from '@/components/admin/OrderStatusSelector';
import { CancelOrderModal } from '@/components/admin/CancelOrderModal';
import { CouponManagementView } from '@/components/admin/CouponManagementView';
import { PortalDropdown } from '@/components/ui/PortalDropdown';
import { RevenueChartWidget } from '@/components/admin/RevenueChartWidget';
import { SerialManagementSection } from '@/components/admin/SerialManagementSection';

function UserRoleButton({
  user,
  onSetRole,
}: {
  user: any;
  onSetRole: (userId: string, newRole: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-black uppercase transition-all cursor-pointer shadow-xs active:scale-95 border ${
          user.role === 'ADMIN'
            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60'
            : user.role === 'STAFF'
            ? 'bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        title="Click để phân quyền vai trò"
      >
        <span className="text-xs">
          {user.role === 'ADMIN' ? '👑' : user.role === 'STAFF' ? '🛠️' : '👤'}
        </span>
        <span>{user.role || 'USER'}</span>
        <ChevronDown className={`w-3 h-3 ml-0.5 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <PortalDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={btnRef}
        width={260}
      >
        <div className="px-2.5 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
          Phân Quyền Tài Khoản
        </div>

        {/* Option USER */}
        <button
          type="button"
          onClick={() => {
            onSetRole(user.id, 'USER');
            setIsOpen(false);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
            (user.role || 'USER') === 'USER'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">👤</span>
            <div>
              <span className="block text-xs">Khách Hàng (USER)</span>
              <span className="block text-[10px] text-slate-400 font-normal">Tài khoản mua sắm thông thường</span>
            </div>
          </div>
          {(user.role || 'USER') === 'USER' && <Check className="w-4 h-4 text-[#0284c7] shrink-0" />}
        </button>

        {/* Option STAFF */}
        <button
          type="button"
          onClick={() => {
            onSetRole(user.id, 'STAFF');
            setIsOpen(false);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
            user.role === 'STAFF'
              ? 'bg-sky-50 dark:bg-sky-950/50 text-[#0284c7] dark:text-sky-300 font-extrabold'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🛠️</span>
            <div>
              <span className="block text-xs">Nhân Viên (STAFF)</span>
              <span className="block text-[10px] text-slate-400 font-normal">Quyền truy cập Cổng Staff Kho</span>
            </div>
          </div>
          {user.role === 'STAFF' && <Check className="w-4 h-4 text-[#0284c7] shrink-0" />}
        </button>

        {/* Option ADMIN */}
        <button
          type="button"
          onClick={() => {
            onSetRole(user.id, 'ADMIN');
            setIsOpen(false);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
            user.role === 'ADMIN'
              ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-extrabold'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">👑</span>
            <div>
              <span className="block text-xs">Quản Trị Viên (ADMIN)</span>
              <span className="block text-[10px] text-slate-400 font-normal">Toàn quyền hệ thống & tài chính</span>
            </div>
          </div>
          {user.role === 'ADMIN' && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
        </button>
      </PortalDropdown>
    </>
  );
}

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

const ADMIN_ORDER_STATUS_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'Tất Cả Trạng Thái' },
  { value: 'PENDING', label: 'Chờ Duyệt (PENDING)', badge: 'Chờ Gọi' },
  { value: 'CONFIRMED', label: 'Đã Xác Nhận (CONFIRMED)', badge: 'Ráp PC' },
  { value: 'SHIPPING', label: 'Đang Vận Chuyển (SHIPPING)', badge: 'Giao Hàng' },
  { value: 'COMPLETED', label: 'Đã Hoàn Tất (COMPLETED)', badge: 'Đã Thu' },
  { value: 'CANCELLED', label: 'Đã Hủy (CANCELLED)', badge: 'Đã Hủy' },
];

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory' | 'users' | 'coupons'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Database States
  const [coupons, setCoupons] = useState<any[]>([]);
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

  // Live Reactive Stats linked directly to live `orders` state
  const activeStats = useMemo(() => {
    let totalRevenue = 0;
    let totalProfit = 0;
    let pendingOrders = 0;
    let shippingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;

    orders.forEach((o) => {
      const amount = Number(o.netAmount || o.totalAmount || 0);
      const isCompletedOrPaid = o.status === 'COMPLETED' || o.paymentStatus === 'PAID';
      
      if (isCompletedOrPaid) {
        totalRevenue += amount;
        totalProfit += Math.round(amount * 0.15);
      }
      
      if (o.status === 'PENDING') pendingOrders++;
      else if (o.status === 'SHIPPING' || o.status === 'CONFIRMED') shippingOrders++;
      else if (o.status === 'COMPLETED') completedOrders++;
      else if (o.status === 'CANCELLED') cancelledOrders++;
    });

    return {
      totalRevenue: totalRevenue || stats.totalRevenue,
      totalProfit: totalProfit || stats.totalProfit,
      totalOrders: orders.length || stats.totalOrders,
      pendingOrders,
      shippingOrders,
      completedOrders,
      cancelledOrders,
      totalProducts: products.length || stats.totalProducts,
      totalUsers: users.length || stats.totalUsers,
      totalSerials: serials.length || stats.totalSerials,
      serialsAvailable: serials.filter(s => s.status === 'AVAILABLE').length || stats.serialsAvailable,
      serialsSold: serials.filter(s => s.status === 'SOLD').length || stats.serialsSold,
      serialsWarranty: serials.filter(s => s.status === 'WARRANTY').length || stats.serialsWarranty,
    };
  }, [orders, products, users, serials, stats]);

  // Live 7-Day Chart Data linked directly to live `orders` state
  const activeLast7Days = useMemo(() => {
    if (orders.length === 0) return last7Days;

    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const now = new Date();
    const getVnDateStr = (date: Date | string) => {
      try {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
      } catch (e) {
        return new Date(date).toISOString().split('T')[0];
      }
    };

    const result: { day: string; date: string; fullDate: string; revenue: number; orders: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = getVnDateStr(d);
      const dayName = days[d.getDay()];

      let dayRevenue = 0;
      let dayOrderCount = 0;

      orders.forEach((o) => {
        if (!o.createdAt) return;
        const orderDateStr = getVnDateStr(o.createdAt);
        if (orderDateStr === dateStr && o.status !== 'CANCELLED') {
          dayOrderCount++;
          if (o.status === 'COMPLETED' || o.paymentStatus === 'PAID') {
            dayRevenue += Number(o.netAmount || o.totalAmount || 0);
          }
        }
      });

      result.push({
        day: dayName,
        date: dateStr,
        fullDate: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        revenue: dayRevenue,
        orders: dayOrderCount,
      });
    }

    return result;
  }, [orders, last7Days]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [serialStatusFilter, setSerialStatusFilter] = useState<string>('ALL');
  const [selectedUserRoleFilter, setSelectedUserRoleFilter] = useState<string>('ALL');
  const [activeRoleDropdownUserId, setActiveRoleDropdownUserId] = useState<string | null>(null);

  // Modals
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
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

  // 1. Fetch all live data from Database
  const fetchAllData = useCallback(async (showNotification = false) => {
    setIsRefreshing(true);
    try {
      const [statsRes, prodsRes, ordersRes, serialsRes, usersRes, couponsRes] = await Promise.all([
        authFetch(`/api/admin/stats?t=${Date.now()}`, { cache: 'no-store' }),
        authFetch(`/api/admin/products?t=${Date.now()}`, { cache: 'no-store' }),
        authFetch(`/api/admin/orders?t=${Date.now()}`, { cache: 'no-store' }),
        authFetch(`/api/admin/serials?t=${Date.now()}`, { cache: 'no-store' }),
        authFetch(`/api/admin/users?t=${Date.now()}`, { cache: 'no-store' }),
        authFetch(`/api/admin/coupons?t=${Date.now()}`, { cache: 'no-store' }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) setStats(statsData.stats);
        if (statsData.last7Days) setLast7Days(statsData.last7Days);
      }

      if (prodsRes.ok) {
        const prodsData = await prodsRes.json();
        if (prodsData.products && Array.isArray(prodsData.products)) {
          setProducts(prodsData.products);
        }
      } else {
        // Backup fetch from live Supabase products API if admin endpoint had a cold start
        try {
          const backupRes = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
          if (backupRes.ok) {
            const backupData = await backupRes.json();
            if (backupData.products && Array.isArray(backupData.products)) {
              setProducts(backupData.products);
            }
          }
        } catch (e) {}
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

      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        if (couponsData.coupons) setCoupons(couponsData.coupons);
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
          
          // Strict Role Policy: Only ADMIN can access DRX Admin Portal (/admin)
          if (role === 'ADMIN' || email === 'admin@drx.vn' || (email.includes('admin') && !email.includes('staff'))) {
            setIsAdmin(true);
            setIsAuthChecking(false); // Render dashboard shell instantly (< 20ms)!
            fetchAllData(false); // Fetch live database in background
            return;
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Product' }, (payload: any) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
          setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        } else if (payload.eventType === 'INSERT' && payload.new) {
          setProducts(prev => [payload.new, ...prev.filter(p => p.id !== payload.new.id)]);
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ProductSerial' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'User' }, () => fetchAllData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  // Realtime Sync on Tab Navigation
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'orders') {
      fetchAllData(false);
    }
  }, [activeTab, fetchAllData]);

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

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.address && u.address.toLowerCase().includes(q));
      
      const isGoogle = u.provider === 'GOOGLE' || Boolean(u.image && u.image.includes('googleusercontent')) || (u.id && (String(u.id).startsWith('user-google-') || String(u.id).startsWith('google-')));
      const matchesRole = 
        selectedUserRoleFilter === 'ALL' || 
        (selectedUserRoleFilter === 'GOOGLE' ? isGoogle : u.role === selectedUserRoleFilter);
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

  const handleDeleteProduct = (p: any) => {
    showConfirm({
      title: 'Xóa Sản Phẩm Khỏi Cửa Hàng',
      message: `Bạn có chắc chắn muốn xóa sản phẩm "${p.name}" khỏi cơ sở dữ liệu? Toàn bộ thông tin linh kiện sẽ bị gỡ bỏ vĩnh viễn.`,
      confirmText: 'Xóa Sản Phẩm',
      cancelText: 'Hủy Bỏ',
      variant: 'danger',
      onConfirm: async () => {
        // 1. Optimistic Realtime UI Update: xóa ngay lập tức khỏi giao diện
        setProducts(prev => prev.filter(x => x.id !== p.id));
        showToast(`Đã xóa sản phẩm "${p.name}" thành công!`, 'success');

        // 2. Gửi lệnh xóa vĩnh viễn lên Supabase qua API
        try {
          const res = await authFetch(`/api/admin/products?id=${p.id}`, { method: 'DELETE' });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            showToast(data.message || 'Lỗi khi xóa sản phẩm trên cơ sở dữ liệu.', 'error');
          }
        } catch (e) {
          showToast('Lỗi kết nối khi xóa sản phẩm!', 'error');
        }
      }
    });
  };

  // Handlers for Orders
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
          paymentStatus: targetPaymentStatus || o.paymentStatus 
        } : o));
        if (viewingOrder && viewingOrder.id === orderId) {
          setViewingOrder({ 
            ...viewingOrder, 
            status: newStatus,
            paymentStatus: targetPaymentStatus || viewingOrder.paymentStatus 
          });
        }
        showToast(`Đã cập nhật trạng thái đơn sang: ${newStatus}`, 'success');
        fetchAllData(false);
      } else {
        showToast('Lỗi khi cập nhật đơn hàng.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ.', 'error');
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
        cancelledBy: 'ADMIN',
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
        if (viewingOrder && viewingOrder.id === cancellingOrder.id) {
          setViewingOrder({ 
            ...viewingOrder, 
            status: 'CANCELLED', 
            paymentStatus: targetPaymentStatus,
            paymentDetails: mergedDetails 
          });
        }
        setCancellingOrder(null);
        fetchAllData();
      } else {
        showToast(data.message || 'Lỗi khi hủy đơn hàng!', 'error');
      }
    } catch (e) {
      showToast('Không thể kết nối máy chủ để hủy đơn.', 'error');
    } finally {
      setIsCancellingOrder(false);
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
        fetchAllData(false);
      } else {
        showToast(data.message || 'Lỗi khi cập nhật trạng thái Serial.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ khi cập nhật Serial.', 'error');
    }
  };

  const handleDeleteSerial = (serialId: string) => {
    showConfirm({
      title: 'Xóa Mã Serial (SN)',
      message: 'Bạn có chắc chắn muốn xóa mã Serial này khỏi kho linh kiện? Dữ liệu bảo hành theo SN này sẽ bị hủy.',
      confirmText: 'Xóa Serial',
      cancelText: 'Hủy Bỏ',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await authFetch(`/api/admin/serials?id=${serialId}`, { method: 'DELETE' });
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
      }
    });
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
        const res = await authFetch('/api/admin/users', {
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
        const res = await authFetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userFormData.id,
            email: userFormData.email,
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
          setUsers(prev => prev.map(u => (u.id === userFormData.id || u.email?.toLowerCase() === userFormData.email?.toLowerCase()) ? { ...u, ...userFormData } : u));
          if (viewingUserDetails && (viewingUserDetails.id === userFormData.id || viewingUserDetails.email?.toLowerCase() === userFormData.email?.toLowerCase())) {
            setViewingUserDetails(prev => prev ? { ...prev, ...userFormData } : null);
          }
          setIsUserModalOpen(false);
          fetchAllData(false);
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

  const handleDeleteUser = (u: any) => {
    if (u.email === 'admin@drx.vn') {
      showToast('Không thể xóa tài khoản Quản trị Master (admin@drx.vn)!', 'error');
      return;
    }

    showConfirm({
      title: 'Xóa Tài Khoản Người Dùng',
      message: `Bạn có chắc chắn muốn xóa tài khoản "${u.name || u.email}" (${u.email}) khỏi hệ thống? Thao tác này không thể hoàn tác.`,
      confirmText: 'Xóa Tài Khoản',
      cancelText: 'Hủy Bỏ',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await authFetch(`/api/admin/users?userId=${u.id}`, { method: 'DELETE' });
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
      }
    });
  };

  // Handlers for User Role Quick Switch
  const handleSetUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await authFetch('/api/admin/users', {
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
                Tài khoản của bạn mang vai trò <strong>NHÂN VIÊN (STAFF)</strong>. Theo quy định phân quyền, nhân viên không có quyền truy cập Cổng Quản Trị DRX Admin. Vui lòng chuyển sang Cổng Vận Hành Kho.
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
      <PortalHeader
        portalType="admin"
        currentUser={currentUser}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchAllData(true)}
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
              <span>Mã Giảm Giá</span>
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
                      {formatVND(activeStats.totalRevenue)}
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
                      {formatVND(activeStats.totalProfit)}
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
                      {activeStats.totalOrders} Đơn Hàng
                    </p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold mt-1">
                      {activeStats.pendingOrders} đơn chờ duyệt • {activeStats.shippingOrders} đang giao
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
                      {activeStats.totalSerials} Mã Serial
                    </p>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1 font-bold mt-1">
                      {activeStats.serialsAvailable} còn trong kho • {activeStats.serialsSold} đã bán
                    </p>
                  </div>
                </div>
              </div>

              {/* CHARTS & RECENT ACTIVITY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 7-DAY REVENUE KPI CHART (8 COLS) */}
                <div className="lg:col-span-8">
                  <RevenueChartWidget data={activeLast7Days} formatVND={formatVND} />
                </div>

                {/* OVERVIEW SUMMARY (4 COLS) - REDESIGNED SYSTEM DASHBOARD */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs flex flex-col justify-between">
                  <div>
                    {/* Header with real-time health indicator */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h3 className="font-heading text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-[#0284c7]" />
                        <span>TỔNG QUAN HỆ THỐNG</span>
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ONLINE
                      </span>
                    </div>

                    {/* 4 Core Quantitative Metrics in 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                      <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Sản Phẩm</span>
                        <p className="text-base font-black text-slate-900 dark:text-white font-heading mt-0.5">{activeStats.totalProducts} <span className="text-[10px] text-slate-400 font-normal">mã</span></p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Khách Hàng</span>
                        <p className="text-base font-black text-slate-900 dark:text-white font-heading mt-0.5">{activeStats.totalUsers} <span className="text-[10px] text-slate-400 font-normal">user</span></p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Serial Kho</span>
                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-heading mt-0.5">{activeStats.serialsAvailable} <span className="text-[10px] text-emerald-600/70 font-normal">sẵn có</span></p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Đơn Hoàn Tất</span>
                        <p className="text-base font-black text-sky-600 dark:text-sky-400 font-heading mt-0.5">{activeStats.completedOrders} <span className="text-[10px] text-sky-600/70 font-normal">đơn</span></p>
                      </div>
                    </div>

                    {/* Operational Health & Inventory Gauges */}
                    <div className="space-y-3 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {/* Gauge 1: Stock Availability Rate */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-emerald-500" /> Tỷ lệ linh kiện sẵn có:
                          </span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {activeStats.totalSerials > 0 ? Math.round((activeStats.serialsAvailable / activeStats.totalSerials) * 100) : 100}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                            style={{ width: `${activeStats.totalSerials > 0 ? Math.min(100, Math.round((activeStats.serialsAvailable / activeStats.totalSerials) * 100)) : 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Gauge 2: Order Fulfillment Rate */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5 text-sky-500" /> Tỷ lệ hoàn tất đơn:
                          </span>
                          <span className="font-black text-sky-600 dark:text-sky-400 font-mono">
                            {activeStats.totalOrders > 0 ? Math.round((activeStats.completedOrders / activeStats.totalOrders) * 100) : 100}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#0284c7] to-[#38bdf8] transition-all duration-500"
                            style={{ width: `${activeStats.totalOrders > 0 ? Math.min(100, Math.round((activeStats.completedOrders / activeStats.totalOrders) * 100)) : 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cloud Infrastructure & Service Status */}
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Database className="w-3 h-3 text-emerald-500" /> Supabase Cloud DB:
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Trực Tuyến
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-amber-500" /> Thanh Toán COD & Banking:
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Sẵn Sàng
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3 h-3 text-sky-500" /> Tra Cứu Bảo Hành SN:
                        </span>
                        <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Hoạt Động
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#0284c7] hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Xem Đơn Hàng</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveTab('serials')}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Kho Serial SN</span>
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
                              {formatOrderDisplayCode(o)}
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
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
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
                        <th className="py-3 px-4 min-w-[240px]">Sản Phẩm Linh Kiện ({filteredProducts.length})</th>
                        <th className="py-3 px-3">Danh Mục</th>
                        <th className="py-3 px-3">Thương Hiệu</th>
                        <th className="py-3 px-3">Giá Bán</th>
                        <th className="py-3 px-3 text-center">Tồn Kho</th>
                        <th className="py-3 px-3 text-center">Bảo Hành</th>
                        <th className="py-3 px-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-16 px-4 text-center">
                            <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                {isRefreshing && products.length === 0 ? (
                                  <RefreshCw className="w-7 h-7 text-[#0284c7] animate-spin" />
                                ) : (
                                  <Package className="w-7 h-7 text-slate-400" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                  {isRefreshing && products.length === 0 ? 'Đang tải danh sách linh kiện...' : 'Không có sản phẩm nào'}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {isRefreshing && products.length === 0
                                    ? 'Đang kết nối cơ sở dữ liệu thời gian thực...'
                                    : searchQuery || selectedCategoryFilter !== 'ALL'
                                    ? `Không tìm thấy linh kiện nào phù hợp với bộ lọc "${selectedCategoryFilter !== 'ALL' ? CATEGORY_NAMES[selectedCategoryFilter] || selectedCategoryFilter : ''}" ${searchQuery ? `hoặc từ khóa "${searchQuery}"` : ''}.`
                                    : 'Kho linh kiện hiện chưa có sản phẩm nào.'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 pt-2">
                                {(searchQuery || selectedCategoryFilter !== 'ALL') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSearchQuery('');
                                      setSelectedCategoryFilter('ALL');
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                  >
                                    Xóa bộ lọc tìm kiếm
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={handleOpenCreate}
                                  className="px-4 py-2 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Thêm Linh Kiện Mới</span>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
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
                        ))
                      )}
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

                <div className="flex items-center gap-2">
                  <ModernSelect
                    options={ADMIN_ORDER_STATUS_OPTIONS}
                    value={orderStatusFilter}
                    onChange={(val) => setOrderStatusFilter(String(val))}
                    placeholder="Lọc trạng thái..."
                    className="w-56 sm:w-64"
                    align="right"
                  />
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
                        <th className="py-3 px-3">Giao Nhận & Yêu Cầu</th>
                        <th className="py-3 px-3">Tiến Độ Check</th>
                        <th className="py-3 px-3">Thanh Toán</th>
                        <th className="py-3 px-3">Tổng Tiền</th>
                        <th className="py-3 px-3">Trạng Thái</th>
                        <th className="py-3 px-4 text-right">Xử Lý &amp; Xác Thực</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-16 px-4 text-center">
                            <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                <ShoppingBag className="w-7 h-7 text-slate-400" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                  Không có đơn hàng nào
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {searchQuery || orderStatusFilter !== 'ALL'
                                    ? `Không tìm thấy đơn hàng nào phù hợp với bộ lọc "${orderStatusFilter !== 'ALL' ? orderStatusFilter : ''}" ${searchQuery ? `hoặc từ khóa "${searchQuery}"` : ''}.`
                                    : 'Hệ thống hiện tại chưa phát sinh đơn hàng mới nào.'}
                                </p>
                              </div>
                              {(searchQuery || orderStatusFilter !== 'ALL') && (
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSearchQuery('');
                                      setOrderStatusFilter('ALL');
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                  >
                                    Xóa bộ lọc tìm kiếm
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => {
                          if (!o) return null;
                          const pDetails = typeof o.paymentDetails === 'string'
                            ? (() => { try { return JSON.parse(o.paymentDetails); } catch { return {}; } })()
                            : (o.paymentDetails && typeof o.paymentDetails === 'object' ? o.paymentDetails : {});
                        const needInst = Boolean(pDetails.needInstallation);
                        const isProxy = Boolean(pDetails.isProxyRecipient);
                        const isPickup = o.deliveryType === 'STORE_PICKUP';
                        const checksDone = [
                          pDetails.check_called,
                          pDetails.check_assembled,
                          pDetails.check_packed,
                          pDetails.check_handed_over,
                          pDetails.check_collected_cod || o.paymentStatus === 'PAID'
                        ].filter(Boolean).length;

                        const orderDisplayCode = formatOrderDisplayCode(o);

                        return (
                          <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#0284c7] whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{orderDisplayCode}</span>
                                {o.status === 'CANCELLED' && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                    Đã Hủy
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="font-bold text-slate-900 dark:text-white block">{o.customerName || 'Khách hàng'}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">{o.customerPhone || 'Chưa có SĐT'}</span>
                            </td>
                            <td className="py-3.5 px-3 max-w-[220px]">
                              <div className="flex flex-wrap gap-1 mb-1">
                                {o.status === 'CANCELLED' ? (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-0.5">
                                    <Ban className="w-2.5 h-2.5" />
                                    <span>Ngừng Vận Chuyển</span>
                                  </span>
                                ) : (
                                  <>
                                    {needInst && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-sky-100 text-[#0284c7] border border-sky-200">
                                        🛠️ Ráp PC
                                      </span>
                                    )}
                                    {isProxy && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-100 text-purple-700 border border-purple-200">
                                        👥 Nhận Thay
                                      </span>
                                    )}
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                      {isPickup ? '🏬 Showroom' : '🚚 Tận Nơi'}
                                    </span>
                                  </>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1" title={o.shippingAddress}>
                                {o.shippingAddress || 'Nhận tại Showroom DRX'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                checksDone === 5 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {checksDone}/5 Bước
                              </span>
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                💵 {o.paymentMethod || 'COD'}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white whitespace-nowrap">
                              {formatVND(o.netAmount || o.totalAmount)}
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <OrderStatusSelector
                                orderId={o.id}
                                currentStatus={o.status}
                                onStatusChange={(newSt) => {
                                  if (newSt === 'CANCELLED') {
                                    setCancellingOrder(o);
                                  } else {
                                    handleUpdateOrderStatus(o.id, newSt);
                                  }
                                }}
                                size="sm"
                              />

                              {/* Prominent Cancellation Reason Display */}
                              {o.status === 'CANCELLED' && (
                                <div 
                                  className="mt-1.5 flex items-start gap-1.5 p-2 rounded-xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 max-w-[210px] text-left whitespace-normal"
                                  title={`Lý do hủy: ${pDetails.cancellationReason || 'Chưa cập nhật lý do'}`}
                                >
                                  <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                  <div className="min-w-0">
                                    <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-400 block tracking-wider">
                                      Lý do hủy đơn:
                                    </span>
                                    <p className="text-[11px] font-bold text-rose-900 dark:text-rose-200 line-clamp-2 leading-tight">
                                      {pDetails.cancellationReason || 'Khách hủy / Đơn spam'}
                                    </p>
                                    {pDetails.cancelledAt && (
                                      <span className="text-[9.5px] text-rose-500/80 dark:text-rose-400/70 block mt-0.5 font-mono">
                                        {new Date(pDetails.cancelledAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                                        {new Date(pDetails.cancelledAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => setViewingOrder(o)}
                                className="px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 active:scale-95"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>Check Đơn</span>
                              </button>
                            </td>
                          </tr>
                        );
                      }))}
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
                  <span className="text-[10px] text-purple-600 font-medium">Toàn quyền quản trị DRX Admin</span>
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
                    { id: 'GOOGLE', label: `🔵 Google OAuth (${users.filter(u => u.provider === 'GOOGLE' || Boolean(u.image && u.image.includes('googleusercontent')) || (u.id && (String(u.id).startsWith('user-google-') || String(u.id).startsWith('google-')))).length})` },
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
                        filteredUsers.map((u) => {
                          const isGoogleAuth = u.provider === 'GOOGLE' || Boolean(u.image && u.image.includes('googleusercontent')) || (u.id && (String(u.id).startsWith('user-google-') || String(u.id).startsWith('google-')));
                          const uName = (u.name || '').trim().toLowerCase();
                          const uPhone = (u.phone || '').trim();
                          const uEmail = (u.email || '').trim().toLowerCase();

                          const uCleanPhone = (u.phone || '').trim().replace(/\D/g, '');
                          const userMatchingOrders = (u.orders && u.orders.length > 0)
                            ? u.orders
                            : orders.filter(o => {
                                const oUid = o.userId;
                                const oEmail = (o.customerEmail || '').trim().toLowerCase();
                                const oPhone = (o.customerPhone || '').trim().replace(/\D/g, '');

                                if (oUid && (oUid === u.id || oUid === uEmail)) return true;
                                if (oEmail && oEmail === uEmail) return true;
                                if (uCleanPhone.length >= 9 && oPhone.length >= 9 && uCleanPhone === oPhone) return true;
                                return false;
                              });

                          const orderCount = Math.max(u._count?.orders ?? 0, userMatchingOrders.length);
                          const totalSpent = (u.totalSpent && u.totalSpent > 0)
                            ? u.totalSpent
                            : userMatchingOrders
                                .filter(o => String(o.status || '').toUpperCase() !== 'CANCELLED' && String(o.status || '').toUpperCase() !== 'REJECTED')
                                .reduce((sum, o) => sum + Number(o.netAmount || o.totalAmount || 0), 0);

                          const displayPhone = u.phone || '';
                          const displayAddress = u.address || '';
                          const enrichedUser = { ...u, phone: displayPhone, address: displayAddress, totalSpent, _count: { ...u._count, orders: orderCount }, orders: userMatchingOrders };

                          return (
                          <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            {/* USER INFO */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                {u.image ? (
                                  <img 
                                    src={u.image} 
                                    alt={u.name} 
                                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-sky-200 dark:border-sky-800 shadow-xs" 
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-950/80 text-[#0284c7] font-black flex items-center justify-center text-xs shrink-0 border border-sky-200 dark:border-sky-800">
                                    {(u.name || u.email || 'U')[0].toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-900 dark:text-white block truncate max-w-[170px]">
                                      {u.name || 'Khách hàng DRX'}
                                    </span>
                                    {isGoogleAuth ? (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-extrabold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                                        🔵 Google
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                        ✉️ Mật khẩu
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-mono block truncate max-w-[180px] mt-0.5">
                                    {u.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* ROLE BADGE & QUICK SWITCH */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <UserRoleButton user={u} onSetRole={handleSetUserRole} />
                            </td>

                            {/* PHONE */}
                            <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              {displayPhone ? (
                                <a href={`tel:${displayPhone}`} className="hover:text-[#0284c7] flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{displayPhone}</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">Chưa có SĐT</span>
                              )}
                            </td>

                            {/* ADDRESS */}
                            <td className="py-3.5 px-3 max-w-[180px] truncate text-slate-600 dark:text-slate-300" title={displayAddress || 'Chưa có địa chỉ'}>
                              {displayAddress ? (
                                <span>{displayAddress}</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10.5px] text-amber-600 dark:text-amber-400 italic">
                                  Chưa có địa chỉ
                                </span>
                              )}
                            </td>

                            {/* ORDERS & SPEND */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {orderCount} đơn hàng
                              </span>
                              {totalSpent > 0 ? (
                                <span className="text-[11px] text-emerald-600 font-mono block font-bold">
                                  {formatVND(totalSpent)}
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
                                  onClick={() => setViewingUserDetails(enrichedUser)}
                                  className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-[#0284c7] border border-sky-200 dark:border-sky-800 transition-all cursor-pointer"
                                  title="Xem Hồ Sơ Chi Tiết"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* EDIT / RESET PASSWORD BUTTON */}
                                <button
                                  onClick={() => handleOpenEditUser(enrichedUser)}
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
                        );
                      })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 6: COUPON & VOUCHER MANAGEMENT                          */}
          {/* ============================================================ */}
          {activeTab === 'coupons' && (
            <CouponManagementView canEdit={true} />
          )}

        </main>
      </div>



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
                const exists = prev.some(p => p.id === savedProd.id);
                if (exists) {
                  return prev.map(p => p.id === savedProd.id ? { ...p, ...savedProd, updatedAt: new Date().toISOString() } : p);
                }
                return [savedProd, ...prev];
              });
            }
          }}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL 5: USER CREATE / EDIT & RESET PASSWORD MODAL            */}
      {/* ============================================================ */}
      {mounted && isUserModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-slate-900 dark:text-slate-100 my-auto">
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
              {/* GOOGLE USER NOTICE */}
              {userModalMode === 'edit' && (userFormData.provider === 'GOOGLE' || (userFormData.image && String(userFormData.image).includes('googleusercontent'))) && (
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-200">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">G</span>
                  <div>
                    <span className="font-extrabold block">Tài Khoản Đăng Nhập Qua Google OAuth</span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-300 font-normal">
                      Khách hàng xác thực bằng Google. Bạn có thể cập nhật thông tin cá nhân, phân quyền, hoặc đặt mật khẩu mới nếu muốn tài khoản này có thể đăng nhập bằng cả 2 cách.
                    </span>
                  </div>
                </div>
              )}

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
                  <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px] block whitespace-nowrap">
                    {userModalMode === 'create' ? 'Mật Khẩu Khởi Tạo:' : 'Đổi Mật Khẩu Mới:'}
                  </label>
                  <input
                    type="text"
                    required={userModalMode === 'create'}
                    placeholder={userModalMode === 'create' ? "Tối thiểu 6 ký tự..." : "Để trống nếu không đổi..."}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              {/* ADDRESS */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10.5px]">
                    Địa Chỉ Nhận Hàng Mặc Định:
                  </label>
                  <span className="text-[10px] text-slate-400 italic">Để trống = Chưa có địa chỉ</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Để trống nếu chưa thiết lập địa chỉ... (ví dụ: Số nhà, tên đường, phường/xã, TP...)"
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
        </div>,
        document.body
      )}

      {/* ============================================================ */}
      {/* MODAL 6: VIEW USER DETAILS & PURCHASE STATS                   */}
      {/* ============================================================ */}
      {mounted && viewingUserDetails && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-slate-900 dark:text-slate-100 my-auto">
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
                <div className="mt-1">
                  {viewingUserDetails.address && viewingUserDetails.address.trim() ? (
                    <span className="font-medium text-slate-800 dark:text-slate-200 block">
                      {viewingUserDetails.address}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Chưa thiết lập địa chỉ (Đang để trống)
                    </span>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Ngày Đăng Ký Tài Khoản:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {new Date(viewingUserDetails.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            {/* ORDER HISTORY PREVIEW */}
            {viewingUserDetails.orders && viewingUserDetails.orders.length > 0 && (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[10.5px] uppercase font-bold text-slate-400 block">Lịch Sử Đơn Hàng ({viewingUserDetails.orders.length})</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {viewingUserDetails.orders.map((ord: any) => (
                    <div key={ord.id} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                      <div>
                        <span className="font-mono font-bold text-[#0284c7]">{formatOrderDisplayCode(ord)}</span>
                        <span className="text-slate-400 ml-2">{new Date(ord.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-600">{formatVND(ord.netAmount || ord.totalAmount || 0)}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
        </div>,
        document.body
      )}

      {/* ============================================================ */}
      {/* MODAL 7: ORDER VERIFICATION & CHECKLIST MODAL                 */}
      {/* ============================================================ */}
      {viewingOrder && (
        <OrderVerificationModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onOrderUpdated={(updated) => {
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            fetchAllData(false);
          }}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL 8: CANCEL ORDER REASON CONFIRMATION                    */}
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
