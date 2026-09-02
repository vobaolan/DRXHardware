'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  RefreshCw, Boxes, Plus, Wrench, ShieldCheck, 
  ArrowLeft, ShoppingBag, ExternalLink, LogOut, 
  Sparkles, CheckCircle2, User, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clearSessionUser } from '@/lib/auth-client';
import { showToast } from '@/components/Toast';

interface PortalHeaderProps {
  portalType: 'admin' | 'staff';
  currentUser: any;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenCreateProduct: () => void;
  onOpenImportSerial: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  portalType,
  currentUser,
  isRefreshing,
  onRefresh,
  onOpenCreateProduct,
  onOpenImportSerial,
}) => {
  const router = useRouter();

  const handleLogout = () => {
    clearSessionUser();
    showToast('Đã đăng xuất khỏi cổng quản trị.', 'info');
    router.push('/profile');
  };

  const isAdminPortal = portalType === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-xs transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
        
        {/* ─────────────────────────────────────────────────────────────
            ZONE 1: LOGO & PORTAL IDENTITY (BÊN TRÁI)
           ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* LOGO DRX HARDWARE */}
          <Link href="/" className="group flex items-center gap-2 shrink-0" title="Về trang chủ DRX HARDWARE">
            <img 
              src="/logo/logo-header.png" 
              alt="DRX HARDWARE Logo" 
              className="h-8 sm:h-9 w-auto object-contain dark:hidden group-hover:scale-105 transition-transform" 
            />
            <img 
              src="/logo/logo-white.png" 
              alt="DRX HARDWARE Logo" 
              className="h-8 sm:h-9 w-auto object-contain hidden dark:block group-hover:scale-105 transition-transform" 
            />
          </Link>

          {/* DIVIDER */}
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block shrink-0" />

          {/* PORTAL TITLE & LIVE BADGE */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white tracking-wide truncate">
                {isAdminPortal ? 'CỔNG QUẢN TRỊ CEO & DOANH THU' : 'CỔNG VẬN HÀNH STAFF & KHO LINH KIỆN'}
              </h1>

              {isAdminPortal ? (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  👑 CEO ADMIN
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-sky-50 dark:bg-sky-950/70 text-[#0284c7] dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
                  🛠️ STAFF PORTAL
                </span>
              )}

              <span className="hidden xl:inline-flex px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Database
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate hidden md:block">
              {isAdminPortal 
                ? 'Quản lý toàn diện tài khoản, doanh thu, đơn hàng & bảo hành thời gian thực.'
                : 'Quản lý kho linh kiện, xuất nhập mã Serial và hỗ trợ ráp PC chuyên nghiệp.'
              }
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            ZONE 2: QUICK CROSS-PORTAL NAVIGATION & ACTIONS (BÊN PHẢI)
           ───────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap ml-auto">
          
          {/* 1. BUTTON: REFRESH DATA */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs disabled:opacity-60"
            title="Đồng bộ dữ liệu thời gian thực từ PostgreSQL Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0284c7] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Đang Tải...' : 'Đồng Bộ Live'}</span>
          </button>

          {/* 2. BUTTON: IMPORT SERIAL SN */}
          <button
            type="button"
            onClick={onOpenImportSerial}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-[#0284c7] dark:text-sky-300 font-bold text-xs border border-sky-200 dark:border-sky-800 transition-all cursor-pointer shadow-xs"
            title="Nhập và gán mã Serial Number cho sản phẩm"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span className="hidden md:inline">+ Nhập Serial SN</span>
            <span className="md:hidden">Serial SN</span>
          </button>

          {/* 3. BUTTON: ADD PRODUCT (PRIMARY ACTION) */}
          <button
            type="button"
            onClick={onOpenCreateProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-extrabold text-xs shadow-md shadow-sky-500/25 transition-all cursor-pointer"
            title="Thêm sản phẩm phần cứng mới vào hệ thống"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Linh Kiện</span>
          </button>

          {/* 4. CROSS-PORTAL SWITCHER BUTTON */}
          {isAdminPortal ? (
            <Link
              href="/staff"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-[#0284c7] text-white font-bold text-xs transition-all shadow-xs"
              title="Chuyển sang Cổng Vận Hành Kho & Kỹ Thuật"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Cổng Staff</span>
            </Link>
          ) : (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-purple-600 text-white font-bold text-xs transition-all shadow-xs"
              title="Chuyển sang Cổng Quản Trị CEO (Admin)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">CEO Admin</span>
            </Link>
          )}

          {/* 5. STOREFRONT BUTTON */}
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all border border-slate-200 dark:border-slate-700"
            title="Xem giao diện Cửa hàng bán hàng"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Cửa Hàng</span>
          </Link>

          {/* 6. USER PROFILE & LOGOUT */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0" 
                title={`${currentUser.name || currentUser.email} (${currentUser.role || 'GUEST'})`}
              >
                {(currentUser.name || currentUser.email || 'U')[0].toUpperCase()}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shadow-2xs"
                title="Đăng xuất khỏi phiên quản trị"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
