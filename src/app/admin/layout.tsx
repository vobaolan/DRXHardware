'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, Lock, ArrowLeft, Home, UserCheck, Key, ShieldCheck, 
  Package, Users, ClipboardList, LayoutDashboard, Sparkles, Boxes, Wrench
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem('ods_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoaded(true);
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('ods_user_update', checkUser);
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('ods_user_update', checkUser);
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#5B3DF5] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-500">Đang xác thực quyền Admin...</span>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser && (currentUser.email === 'admin@drx.vn' || currentUser.email === 'admin@drxhardware.vn' || currentUser.email === 'admin@odsstore.vn' || currentUser.role === 'ADMIN');

  // 🔴 403 FORBIDDEN PAGE - WHEN NOT AUTHORIZED
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 antialiased tech-grid-pattern">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-black tracking-widest uppercase mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>HTTP 403 FORBIDDEN</span>
          </div>

          <h1 className="font-heading text-2xl font-black uppercase text-slate-900 dark:text-slate-100 mb-2">
            TRUY CẬP BỊ TỪ CHỐI
          </h1>
          
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-light">
            Bạn không có quyền truy cập vào bảng quản trị **DRX Admin System**. Khu vực này yêu cầu xác thực tài khoản Quản Trị Viên chính thức.
          </p>

          {/* User Status Card */}
          <div className="bg-slate-100 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left text-xs mb-6 space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Tài khoản hiện tại:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser ? currentUser.email : 'Chưa đăng nhập'}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Quyền hạn hệ thống:</span>
              <span className="font-extrabold text-rose-500 uppercase">{currentUser?.role || 'Khách (GUEST)'}</span>
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
              <span>ĐĂNG NHẬP ADMIN</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 🟢 AUTHORIZED ADMIN WRAPPER
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* ADMIN SUB-HEADER NAVIGATION BAR */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white font-black text-xs font-heading shadow-md shadow-sky-500/30">
                DRX
              </div>
              <span className="font-heading font-black text-sm tracking-wider text-slate-900 dark:text-slate-100">
                ADMIN PANEL
              </span>
            </Link>

            <span className="hidden sm:inline bg-[#5B3DF5]/10 text-[#5B3DF5] dark:text-[#D6C7FF] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#5B3DF5]/30">
              SYSTEM v2.5
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs no-scrollbar">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-heading font-extrabold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Báo Cáo CEO & Bảng Điều Hành</span>
            </Link>

            <Link
              href="/staff"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-heading font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Cổng Vận Hành Staff & Quản Lý Kho 4-in-1</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
