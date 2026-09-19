'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Tag, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Percent, 
  DollarSign, 
  Layers, 
  X,
  ShieldCheck,
  TrendingUp,
  Clock,
  ChevronDown
} from 'lucide-react';
import { showToast, showConfirm } from '@/components/Toast';
import { authFetch } from '@/lib/auth-client';
import { PortalDropdown } from '@/components/ui/PortalDropdown';

interface CouponItem {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number | string;
  minOrderValue?: number | string | null;
  maxDiscount?: number | string | null;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  createdAt?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'DISABLED' | string;
}

interface CouponFormData {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  expiresAt: string;
  maxUses: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const formatVND = (num: number | string | null | undefined) => {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
};

function CouponStatusButton({
  coupon,
  canEdit,
  isInactive,
  isExpired,
  isDepleted,
  onToggleStatus,
}: {
  coupon: CouponItem;
  canEdit: boolean;
  isInactive: boolean;
  isExpired: boolean;
  isDepleted: boolean;
  onToggleStatus: (coupon: CouponItem, status: 'ACTIVE' | 'INACTIVE') => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  if (!canEdit) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-black uppercase border ${
          isInactive
            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
            : isExpired
            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            : isDepleted
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        }`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${isInactive ? 'bg-rose-500' : 'bg-emerald-500'}`} />
        <span>{isInactive ? 'Ngưng hoạt động' : 'Hoạt động'}</span>
      </span>
    );
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-black uppercase transition-all cursor-pointer shadow-xs active:scale-95 border ${
          isInactive
            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
            : isExpired
            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            : isDepleted
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
        }`}
        title="Click để đổi trạng thái"
      >
        {isInactive ? (
          <>
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>Ngưng hoạt động</span>
            <ChevronDown className={`w-3 h-3 ml-0.5 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        ) : isExpired ? (
          <>
            <Clock className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Hết hạn</span>
            <ChevronDown className={`w-3 h-3 ml-0.5 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        ) : isDepleted ? (
          <>
            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
            <span>Hết lượt</span>
            <ChevronDown className={`w-3 h-3 ml-0.5 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Hoạt động</span>
            <ChevronDown className={`w-3 h-3 ml-0.5 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <PortalDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={btnRef}
        width={230}
      >
        <div className="px-2.5 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
          Chọn Trạng Thái
        </div>
        
        <button
          type="button"
          onClick={() => {
            onToggleStatus(coupon, 'ACTIVE');
            setIsOpen(false);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
            !isInactive
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-bold'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <span className="block text-xs">Hoạt Động</span>
              <span className="block text-[10px] text-slate-400 font-normal">Cho phép áp dụng</span>
            </div>
          </div>
          {!isInactive && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
        </button>

        <button
          type="button"
          onClick={() => {
            onToggleStatus(coupon, 'INACTIVE');
            setIsOpen(false);
          }}
          className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer ${
            isInactive
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-extrabold'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-bold'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <div>
              <span className="block text-xs">Ngưng Hoạt Động</span>
              <span className="block text-[10px] text-slate-400 font-normal">Tạm dừng áp dụng</span>
            </div>
          </div>
          {isInactive && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
        </button>
      </PortalDropdown>
    </>
  );
}

export function CouponManagementView({ canEdit = true }: { canEdit?: boolean }) {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PERCENT' | 'FIXED'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrderValue: 0,
    maxDiscount: null,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUses: 100,
    status: 'ACTIVE',
  });

  // Fetch live coupons
  const fetchCoupons = useCallback(async (showNotification = false) => {
    setIsRefreshing(true);
    try {
      const res = await authFetch(`/api/admin/coupons?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.coupons)) {
          setCoupons(data.coupons);
          if (showNotification) {
            showToast('Đã đồng bộ danh sách mã giảm giá!', 'success');
          }
        }
      }
    } catch (e) {
      console.error(e);
      if (showNotification) showToast('Lỗi khi tải mã giảm giá', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Đã sao chép mã "${code}"!`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Generate random code helper
  const handleGenerateCode = () => {
    const prefixes = ['DRX', 'GAMING', 'VOUCHER', 'MEGA', 'PC'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randNum = Math.floor(100 + Math.random() * 900);
    const newCode = `${prefix}${randNum}`;
    setFormData(prev => ({ ...prev, code: newCode }));
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      code: '',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrderValue: 0,
      maxDiscount: null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxUses: 100,
      status: 'ACTIVE',
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (c: CouponItem) => {
    const expStr = c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '';
    setFormData({
      code: c.code,
      discountType: c.discountType,
      discountValue: Number(c.discountValue) || 0,
      minOrderValue: Number(c.minOrderValue) || 0,
      maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
      expiresAt: expStr,
      maxUses: Number(c.maxUses) || 100,
      status: c.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Quick Toggle Status
  const handleToggleStatus = async (coupon: CouponItem, targetStatus: 'ACTIVE' | 'INACTIVE') => {
    // Optimistic update
    setCoupons(prev => prev.map(c => c.code === coupon.code ? { ...c, status: targetStatus } : c));

    try {
      const res = await authFetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: coupon.code,
          status: targetStatus,
        }),
      });

      if (res.ok) {
        showToast(
          targetStatus === 'ACTIVE'
            ? `Đã kích hoạt mã "${coupon.code}" thành công!`
            : `Đã ngưng hoạt động mã "${coupon.code}"!`,
          targetStatus === 'ACTIVE' ? 'success' : 'info'
        );
      } else {
        fetchCoupons();
        showToast('Không thể cập nhật trạng thái mã.', 'error');
      }
    } catch (e) {
      fetchCoupons();
      showToast('Lỗi kết nối máy chủ.', 'error');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = (code: string) => {
    showConfirm({
      title: 'Xóa Mã Giảm Giá',
      message: `Bạn có chắc chắn muốn xóa vĩnh viễn mã giảm giá "${code}" khỏi hệ thống? Thao tác này không thể hoàn tác.`,
      confirmText: 'Xóa Ngay',
      cancelText: 'Hủy Bỏ',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await authFetch(`/api/admin/coupons?code=${encodeURIComponent(code)}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            showToast(`Đã xóa mã giảm giá "${code}" thành công!`, 'success');
            fetchCoupons();
          } else {
            showToast('Lỗi khi xóa mã giảm giá.', 'error');
          }
        } catch (e) {
          showToast('Không thể kết nối máy chủ.', 'error');
        }
      }
    });
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showToast('Vui lòng nhập mã giảm giá!', 'error');
      return;
    }

    if (formData.discountValue <= 0) {
      showToast('Giá trị giảm giá phải lớn hơn 0!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const res = await authFetch('/api/admin/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Thành công!', 'success');
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        showToast(data.message || 'Lỗi khi lưu mã giảm giá.', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối máy chủ khi lưu mã.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search
  const filteredCoupons = useMemo(() => {
    let list = [...coupons];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.code.toLowerCase().includes(q));
    }
    if (typeFilter !== 'ALL') {
      list = list.filter(c => c.discountType === typeFilter);
    }
    if (statusFilter === 'ACTIVE') {
      list = list.filter(c => c.status !== 'INACTIVE');
    } else if (statusFilter === 'INACTIVE') {
      list = list.filter(c => c.status === 'INACTIVE');
    }
    return list;
  }, [coupons, searchQuery, typeFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = coupons.length;
    const now = new Date();
    const active = coupons.filter(c => c.status !== 'INACTIVE' && new Date(c.expiresAt) > now && c.usedCount < c.maxUses).length;
    const inactive = coupons.filter(c => c.status === 'INACTIVE').length;
    const totalUsed = coupons.reduce((sum, c) => sum + (Number(c.usedCount) || 0), 0);
    return { total, active, inactive, totalUsed };
  }, [coupons]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. STATS METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/80 text-[#0284c7] border border-sky-100 dark:border-sky-800">
            <Tag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[10.5px] uppercase font-black tracking-wider text-slate-400">Tổng Mã</span>
            <p className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 border border-emerald-100 dark:border-emerald-800">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[10.5px] uppercase font-black tracking-wider text-slate-400">Hoạt Động</span>
            <p className="text-xl sm:text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400">{stats.active}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 border border-rose-100 dark:border-rose-800">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[10.5px] uppercase font-black tracking-wider text-slate-400">Tạm Ngưng</span>
            <p className="text-xl sm:text-2xl font-black font-heading text-rose-600 dark:text-rose-400">{stats.inactive}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 border border-purple-100 dark:border-purple-800">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[10.5px] uppercase font-black tracking-wider text-slate-400">Đã Áp Dụng</span>
            <p className="text-xl sm:text-2xl font-black font-heading text-purple-600 dark:text-purple-400">{stats.totalUsed} Lượt</p>
          </div>
        </div>
      </div>

      {/* 2. ACTION BAR & FILTERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0284c7] text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white">
                QUẢN LÝ MÃ GIẢM GIÁ &amp; VOUCHER KHUYẾN MÃI
              </h3>
              <p className="text-xs text-slate-500">
                Tạo mã ưu đãi cho khách hàng thanh toán tại Giỏ hàng và Checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchCoupons(true)}
              disabled={isRefreshing}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            {canEdit && (
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2.5 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-heading font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Thêm Mã Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã code (VD: DRX, GAMING)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#0284c7]"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">Loại:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="ALL">Tất Cả Loại</option>
                <option value="PERCENT">Phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (VNĐ)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold cursor-pointer"
              >
                <option value="ALL">Tất Cả Trạng Thái</option>
                <option value="ACTIVE">🟢 Đang Hoạt Động</option>
                <option value="INACTIVE">🔴 Ngưng Hoạt Động</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. COUPON TABLE / CARDS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Đang tải dữ liệu mã giảm giá...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Tag className="w-7 h-7" />
            </div>
            <p className="text-xs font-bold text-slate-500">Không tìm thấy mã giảm giá phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-heading text-[10.5px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã Code</th>
                  <th className="py-3 px-4">Mức Ưu Đãi</th>
                  <th className="py-3 px-4">Điều Kiện Áp Dụng</th>
                  <th className="py-3 px-4">Lượt Dùng</th>
                  <th className="py-3 px-4">Hạn Sử Dụng</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  {canEdit && <th className="py-3 px-4 text-right">Thao Tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredCoupons.map((coupon) => {
                  const now = new Date();
                  const isExpired = new Date(coupon.expiresAt) < now;
                  const isDepleted = coupon.usedCount >= coupon.maxUses;
                  const isInactive = coupon.status === 'INACTIVE' || coupon.status === 'DISABLED';
                  const isActive = !isInactive && !isExpired && !isDepleted;

                  return (
                    <tr key={coupon.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Code Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-[#0284c7] bg-sky-50 dark:bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 select-all">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            title="Copy mã"
                          >
                            {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-4 font-bold">
                        {coupon.discountType === 'PERCENT' ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            Giảm {coupon.discountValue}%
                            {coupon.maxDiscount ? ` (Tối đa ${formatVND(coupon.maxDiscount)})` : ''}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Giảm {formatVND(coupon.discountValue)}
                          </span>
                        )}
                      </td>

                      {/* Conditions */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        {coupon.minOrderValue && Number(coupon.minOrderValue) > 0 ? (
                          <span>Đơn từ {formatVND(coupon.minOrderValue)}</span>
                        ) : (
                          <span className="text-slate-400">Không giới hạn đơn tối thiểu</span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-[11px]">
                            {coupon.usedCount} / {coupon.maxUses} lượt
                          </span>
                          <div className="w-24 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#0284c7] h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="py-3.5 px-4 text-[11px] font-mono">
                        {new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <CouponStatusButton
                          coupon={coupon}
                          canEdit={canEdit}
                          isInactive={isInactive}
                          isExpired={isExpired}
                          isDepleted={isDepleted}
                          onToggleStatus={handleToggleStatus}
                        />
                      </td>

                      {/* Actions */}
                      {canEdit && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(coupon)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Chỉnh sửa mã"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon.code)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              title="Xóa mã"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL CREATE / EDIT COUPON */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-slate-900 dark:text-slate-100 relative my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#0284c7] text-white">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">
                    {modalMode === 'create' ? 'TẠO MÃ GIẢM GIÁ MỚI' : 'CHỈNH SỬA MÃ GIẢM GIÁ'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cấu hình mức giảm và điều kiện áp dụng cho khách hàng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Code input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                    Mã Giảm Giá (Code):
                  </label>
                  {modalMode === 'create' && (
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[10px] text-[#0284c7] font-bold hover:underline cursor-pointer"
                    >
                      🎲 Tạo mã ngẫu nhiên
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  disabled={modalMode === 'edit'}
                  placeholder="VD: DRXGAMING, HE2026, VOUCHER500K..."
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:border-[#0284c7] disabled:opacity-60"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                    Loại Giảm Giá:
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                    Giá Trị Giảm:
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder={formData.discountType === 'PERCENT' ? '10%' : '100.000 đ'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Đơn Tối Thiểu (VNĐ):
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0 = Không yêu cầu"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrderValue: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                {formData.discountType === 'PERCENT' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      Giảm Tối Đa (VNĐ):
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="VD: 2.000.000 đ"
                      value={formData.maxDiscount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value ? Number(e.target.value) : null }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>
                )}
              </div>

              {/* Max Uses & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Giới Hạn Lượt Dùng:
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.maxUses}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Ngày Hết Hạn:
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiresAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#0284c7]"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                  Trạng Thái Áp Dụng:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'ACTIVE' }))}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer text-xs font-black uppercase ${
                      formData.status === 'ACTIVE'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Hoạt Động</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'INACTIVE' }))}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer text-xs font-black uppercase ${
                      formData.status === 'INACTIVE'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-rose-700 dark:text-rose-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>Ngưng Hoạt Động</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isSubmitting ? 'Đang Lưu...' : modalMode === 'create' ? 'Tạo Mã Giảm Giá' : 'Cập Nhật Mã'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
