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
    const checkUser = async () => {
      try {
        const { getStoredSessionUser, verifyCurrentSession } = await import('@/lib/auth-client');
        let user = getStoredSessionUser();
        if (user) {
          setCurrentUser(user);
        }

        // Verify with server in background
        const verified = await verifyCurrentSession();
        if (verified) {
          setCurrentUser(verified);
        }
      } catch (e) {
      } finally {
        setIsLoaded(true);
      }
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
          <div className="w-10 h-10 border-4 border-[#0284c7] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-500">Đang xác thực quyền Admin...</span>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser && (
    currentUser.email === 'admin@drx.vn' || 
    currentUser.email === 'admin@drxhardware.vn' || 
    currentUser.email === 'admin@odsstore.vn' || 
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MANAGER' ||
    String(currentUser.email || '').toLowerCase().includes('admin')
  );

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
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
