'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { 
  User, Mail, Lock, LogIn, UserPlus, CreditCard, Shield, 
  ShoppingBag, Heart, Settings, LogOut, CheckCircle2, Copy, Check, ArrowRight, 
  ShieldCheck, Cpu, Box, Sparkles, Zap, Clock, PackageCheck, Wrench, ChevronRight,
  Monitor, Award, CheckCircle, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast';

interface HardwareKey {
  id: string;
  keyCode: string;
  product?: {
    name: string;
    coverImage: string;
    platform: string;
    type: string;
  };
  createdAt?: string;
}

interface Order {
  id: string;
  createdAt: string;
  netAmount: number | string;
  status: string;
  gameKeys: HardwareKey[];
}

function ProfileContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Dashboard navigation tab states
  const [dashboardTab, setDashboardTab] = useState<'orders' | 'vault' | 'wishlist' | 'settings' | 'transactions' | 'builds'>('orders');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // User state
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    balance: number;
    role: string;
  } | null>(null);

  // Live order list
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Transaction list
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Check query params for active tab on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'vault' || tabParam === 'wishlist' || tabParam === 'settings' || tabParam === 'orders' || tabParam === 'transactions' || tabParam === 'builds') {
      setDashboardTab(tabParam as any);
    }
  }, [searchParams]);

  // Check login status on mount & restore remembered email
  useEffect(() => {
    const storedUser = localStorage.getItem('ods_user');
    if (storedUser) {
      try {
        let parsed = JSON.parse(storedUser);
        let changed = false;
        if (parsed.email === 'admin@odsstore.vn' || parsed.email === 'admin@drxhardware.vn' || parsed.email?.toLowerCase().includes('ods')) {
          parsed.email = 'admin@drx.vn';
          changed = true;
        }
        if (parsed.name === 'ODS ADMIN' || parsed.name === 'ODS Store' || parsed.name?.includes('ODS')) {
          parsed.name = parsed.name.replace(/ODS/g, 'DRX');
          changed = true;
        }
        if (changed) {
          localStorage.setItem('ods_user', JSON.stringify(parsed));
          window.dispatchEvent(new Event('ods_user_update'));
        }
        setCurrentUser(parsed);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
    }

    const savedEmail = localStorage.getItem('ods_remembered_email');
    const isRemembered = localStorage.getItem('ods_remember_me') === 'true';
    if (savedEmail) {
      setLoginEmail(savedEmail === 'admin@odsstore.vn' ? 'admin@drx.vn' : savedEmail);
    }
    setRememberMe(isRemembered);
  }, []);

  // Fetch real order history from database when user is logged in
  useEffect(() => {
    if (!currentUser?.id) {
      setOrders([]);
      return;
    }
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await fetch(`/api/orders?userId=${currentUser.id}`);
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  // Fetch transaction history
  useEffect(() => {
    if (!currentUser?.id) {
      setTransactions([]);
      return;
    }
    const fetchTransactions = async () => {
      setIsLoadingTransactions(true);
      try {
        const res = await fetch(`/api/wallet/transactions?userId=${currentUser.id}`);
        const data = await res.json();
        if (res.ok) {
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setIsLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, [currentUser]);

  const formatCurrency = (value: number | string) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numericValue || 0);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Đăng nhập thất bại!', 'error');
        return;
      }
      showToast('Đăng nhập thành công! Chào mừng bạn quay lại DRX Hardware.', 'success');
      localStorage.setItem('ods_user', JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem('ods_remembered_email', loginEmail);
        localStorage.setItem('ods_remember_me', 'true');
      } else {
        localStorage.removeItem('ods_remembered_email');
        localStorage.removeItem('ods_remember_me');
      }

      window.dispatchEvent(new Event('ods_user_update'));
      setCurrentUser(data.user);
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra, vui lòng thử lại sau!', 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      showToast('Mật khẩu nhập lại không khớp!', 'error');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Đăng ký thất bại!', 'error');
        return;
      }
      showToast('Đăng ký tài khoản DRX Hardware thành công!', 'success');
      localStorage.setItem('ods_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('ods_user_update'));
      setCurrentUser(data.user);
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra, vui lòng thử lại sau!', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ods_user');
    window.dispatchEvent(new Event('ods_user_update'));
    setCurrentUser(null);
    setOrders([]);
    setIsLoggedIn(false);
    showToast('Đã đăng xuất khỏi tài khoản.', 'info');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    showToast('Đã sao chép mã Serial/SN linh kiện!', 'success');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Calculate total registered hardware items
  const totalHardwareItems = orders.reduce((acc, curr) => acc + (curr.gameKeys ? curr.gameKeys.length : 0), 0);

  // Sanitized display values
  const sanitizedName = currentUser?.name ? currentUser.name.replace(/ODS/g, 'DRX') : 'Khách Hàng DRX';
  const rawEmail = currentUser?.email || '';
  const sanitizedEmail = rawEmail === 'admin@odsstore.vn' || rawEmail === 'admin@drxhardware.vn' ? 'admin@drx.vn' : rawEmail;
  const sanitizedInitial = sanitizedName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased tech-grid-pattern transition-colors duration-300">
      {/* HEADER */}
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            /* ================== AUTHENTICATION FORM (LOGIN / REGISTER) ================== */
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="mx-auto max-w-md my-10"
            >
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-8 shadow-xl backdrop-blur-xl space-y-6">
                
                {/* Brand Header */}
                <div className="text-center space-y-2 pb-2">
                  <div className="inline-flex p-3 rounded-2xl bg-sky-50 dark:bg-slate-800 text-[#0284c7] border border-sky-200 dark:border-sky-500/30 mb-2">
                    <Cpu className="h-7 w-7 animate-pulse" />
                  </div>
                  <h2 className="font-heading text-xl font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    DRX HARDWARE ACCOUNT
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                    Quản lý đơn hàng linh kiện, bảo hành 36T và cấu hình PC
                  </p>
                </div>

                {/* Tabs selection */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 mb-6">
                  <button
                    onClick={() => setAuthTab('login')}
                    className={`flex-1 text-center font-heading text-xs font-black uppercase tracking-wider pb-3 border-b-2 transition-all cursor-pointer ${
                      authTab === 'login'
                        ? 'border-[#0284c7] text-[#0284c7]'
                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Đăng Nhập
                  </button>
                  <button
                    onClick={() => setAuthTab('register')}
                    className={`flex-1 text-center font-heading text-xs font-black uppercase tracking-wider pb-3 border-b-2 transition-all cursor-pointer ${
                      authTab === 'register'
                        ? 'border-[#0284c7] text-[#0284c7]'
                        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    Tạo Tài Khoản
                  </button>
                </div>

                {/* Tab Contents */}
                {authTab === 'login' ? (
                  /* LOGIN FORM */
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="khachhang@drxhardware.vn"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Mật khẩu</label>
                        <span className="text-[9.5px] text-[#0284c7] hover:underline cursor-pointer font-bold">Quên mật khẩu?</span>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* REMEMBER ME CHECKBOX */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7] accent-[#0284c7]"
                        />
                        <span>Ghi nhớ tài khoản trên thiết bị này</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="uiverse-btn-shimmer w-full mt-4 flex items-center justify-center gap-2 rounded-2xl text-white py-3.5 text-xs font-heading font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Đăng Nhập Tài Khoản</span>
                    </button>
                  </form>
                ) : (
                  /* REGISTER FORM */
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Họ và Tên</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Nguyễn Văn A"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="khachhang@drxhardware.vn"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Mật khẩu</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          placeholder="Tối thiểu 6 ký tự"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Nhập lại mật khẩu</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          placeholder="Trùng khớp mật khẩu trên"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="uiverse-btn-shimmer w-full mt-4 flex items-center justify-center gap-2 rounded-2xl text-white py-3.5 text-xs font-heading font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Đăng Ký Thành Viên DRX</span>
                    </button>
                  </form>
                )}

                {/* Secure Notice */}
                <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-4 text-center flex items-center justify-center gap-2 text-[9.5px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Bảo mật dữ liệu 256-bit chuẩn thương mại điện tử DRX</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ================== HARDWARE SHOWROOM USER DASHBOARD ================== */
            <div className="space-y-8 my-4">
              
              {/* 1. TOP HARDWARE ENTHUSIAST STATS BANNER (CRISP LIGHT THEME) */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 sm:p-8 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-50/70 via-white to-sky-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#0284c7]/5 dark:bg-[#0284c7]/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Left User Profile Avatar & Tag (5 cols) */}
                  <div className="md:col-span-5 flex items-center gap-5">
                    <div className="relative shrink-0">
                      <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#6EC2F7] via-[#0284c7] to-blue-600 p-0.5 shadow-md shadow-sky-500/20">
                        <div className="h-full w-full rounded-[22px] bg-white dark:bg-slate-950 flex items-center justify-center text-[#0284c7] dark:text-white font-black text-2xl font-heading shadow-inner">
                          {sanitizedInitial}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 text-white shadow-xs" title="Trạng thái trực tuyến">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-lg sm:text-xl font-black uppercase text-slate-900 dark:text-white tracking-wide truncate">
                          {sanitizedName}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-sky-200/80 font-mono truncate">{sanitizedEmail}</p>
                      
                      <div className="flex items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/40 text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                          <Award className="h-3 w-3" /> DRX ELITE BUILDER
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ● Chiết khấu 3% PC Prebuilt
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Quick Metrics Grid (7 cols) */}
                  <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    
                    {/* Metric 1: Wallet Balance */}
                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-sky-400/30 p-3.5 rounded-2xl flex flex-col justify-between shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-sky-200/70 uppercase tracking-wider">Số Dư Ví DRX</span>
                        <CreditCard className="h-4 w-4 text-[#0284c7]" />
                      </div>
                      <div className="mt-2">
                        <span className="font-heading text-base sm:text-lg font-black text-slate-900 dark:text-white block truncate">
                          {formatCurrency(currentUser?.balance || 0)}
                        </span>
                        <Link href="/deposit" className="text-[10px] font-bold text-[#0284c7] hover:underline inline-flex items-center gap-0.5 mt-0.5">
                          <span>Nạp tiền VietQR</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Metric 2: Hardware Warranty Items */}
                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-emerald-500/30 p-3.5 rounded-2xl flex flex-col justify-between shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wider">Linh Kiện Bảo Hành</span>
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="mt-2">
                        <span className="font-heading text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block">
                          {totalHardwareItems} <span className="text-xs font-normal text-slate-500 dark:text-slate-300">thiết bị</span>
                        </span>
                        <button onClick={() => setDashboardTab('vault')} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 mt-0.5 cursor-pointer">
                          <span>Xem mã Serial</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Metric 3: Orders Count */}
                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-amber-500/30 p-3.5 rounded-2xl flex flex-col justify-between col-span-2 sm:col-span-1 shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-amber-300/70 uppercase tracking-wider">Tổng Đơn Hàng</span>
                        <PackageCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="mt-2">
                        <span className="font-heading text-base sm:text-lg font-black text-amber-600 dark:text-amber-300 block">
                          {orders.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-300">đơn</span>
                        </span>
                        <button onClick={() => setDashboardTab('orders')} className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5 mt-0.5 cursor-pointer">
                          <span>Xem chi tiết</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* 2. MAIN DASHBOARD WORKSPACE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT NAVIGATION MENU (4 cols) */}
                <div className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 block">
                    QUẢN LÝ TÀI KHOẢN & LINH KIỆN
                  </span>

                  <div className="flex flex-col space-y-1.5">
                    
                    {/* TAB 1: ĐƠN HÀNG LINH KIỆN */}
                    <button
                      onClick={() => setDashboardTab('orders')}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                        dashboardTab === 'orders'
                          ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="h-4 w-4" />
                        <span>Đơn Hàng Linh Kiện & PC</span>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        dashboardTab === 'orders'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {orders.length}
                      </span>
                    </button>

                    {/* TAB 2: QUẢN LÝ BẢO HÀNH & SERIAL */}
                    <button
                      onClick={() => setDashboardTab('vault')}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                        dashboardTab === 'vault'
                          ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className={`h-4 w-4 ${dashboardTab === 'vault' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                        <span>Kho Linh Kiện & Bảo Hành</span>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        dashboardTab === 'vault'
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {totalHardwareItems}
                      </span>
                    </button>

                    {/* TAB 3: LỊCH SỬ NẠP VÍ */}
                    <button
                      onClick={() => setDashboardTab('transactions')}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                        dashboardTab === 'transactions'
                          ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4" />
                        <span>Lịch Sử Giao Dịch & Ví</span>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        dashboardTab === 'transactions'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {transactions.length}
                      </span>
                    </button>

                    {/* TAB 4: CẤU HÌNH PC ĐÃ LƯU */}
                    <button
                      onClick={() => setDashboardTab('builds')}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                        dashboardTab === 'builds'
                          ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Wrench className={`h-4 w-4 ${dashboardTab === 'builds' ? 'text-white' : 'text-amber-500'}`} />
                        <span>Cấu Hình PC Tự Ráp</span>
                      </div>
                      <span className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-black tracking-wider ${
                        dashboardTab === 'builds'
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
                      }`}>
                        BUILDER
                      </span>
                    </button>

                    {/* TAB 5: DANH SÁCH YÊU THÍCH */}
                    <button
                      onClick={() => setDashboardTab('wishlist')}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                        dashboardTab === 'wishlist'
                          ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="h-4 w-4 text-rose-500" />
                        <span>Linh Kiện Yêu Thích</span>
                      </div>
                    </button>

                    {/* TAB 6: THIẾT LẬP BẢO MẬT */}
                    <button
                      onClick={() => setDashboardTab('settings')}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                        dashboardTab === 'settings'
                          ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4" />
                        <span>Đổi Mật Khẩu & Bảo Mật</span>
                      </div>
                    </button>

                    {/* LOGOUT */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all mt-4 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng Xuất Tài Khoản</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT DETAIL WORKSPACE (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* 1. ORDERS TAB */}
                  {dashboardTab === 'orders' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                          <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-[#0284c7]" />
                            <span>LỊCH SỬ ĐƠN HÀNG LINH KIỆN & PC GAMING</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                            Theo dõi trạng thái đóng gói, kiểm tra benchmark và bàn giao linh kiện.
                          </p>
                        </div>
                      </div>

                      {isLoadingOrders ? (
                        <div className="text-center py-12 text-xs text-slate-400">
                          Đang tải dữ liệu đơn hàng...
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-4">
                          <div className="h-16 w-16 rounded-3xl bg-sky-50 dark:bg-slate-800 flex items-center justify-center text-[#0284c7]">
                            <Box className="h-8 w-8" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Chưa có đơn hàng linh kiện nào</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-light max-w-sm leading-relaxed mx-auto">
                              Bạn chưa đặt mua linh kiện hoặc PC nào. Hãy khám phá kho linh kiện chính hãng tại DRX Hardware!
                            </p>
                          </div>
                          <Link
                            href="/products"
                            className="uiverse-btn-shimmer inline-flex items-center gap-2 rounded-2xl text-white px-6 py-3 text-xs font-heading font-black uppercase tracking-wider shadow-lg"
                          >
                            <span>Khám Phá Linh Kiện Ngay</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div key={order.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </span>
                                  <h4 className="font-heading text-xs font-black uppercase text-slate-900 dark:text-slate-100 mt-0.5">
                                    Mã Đơn: #{order.id.slice(0, 10).toUpperCase()}
                                  </h4>
                                </div>
                                <div className="text-left sm:text-right shrink-0">
                                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block font-heading">
                                    {formatCurrency(order.netAmount)}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-600 font-bold uppercase mt-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="h-3 w-3" /> Đã thanh toán & Bàn giao
                                  </span>
                                </div>
                              </div>

                              {/* LIST OF HARDWARE ITEMS IN ORDER */}
                              <div className="space-y-2">
                                {order.gameKeys && order.gameKeys.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <Cpu className="h-4 w-4 text-[#0284c7] shrink-0" />
                                      <div className="min-w-0">
                                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                                          {item.product?.name || 'Linh Kiện Máy Tính Chính Hãng'}
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[10px] text-slate-400 font-mono">Mã Serial SN:</span>
                                          <code className="text-[11px] font-mono text-[#0284c7] font-bold select-all">
                                            {item.keyCode}
                                          </code>
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleCopy(item.id, item.keyCode)}
                                      className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-800 dark:text-slate-200 hover:bg-[#0284c7] hover:text-white transition-all shrink-0 cursor-pointer"
                                    >
                                      {copiedKeyId === item.id ? (
                                        <>
                                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                                          <span className="text-emerald-400">ĐÃ LƯU</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-3.5 w-3.5" />
                                          <span>COPY SN</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. HARDWARE VAULT & WARRANTY TAB */}
                  {dashboardTab === 'vault' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-2">
                        <div>
                          <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <span>KHO LINH KIỆN & QUẢN LÝ BẢO HÀNH CHÍNH HÃNG</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                            Quản lý mã Serial Number (SN) linh kiện CPU, VGA, Mainboard, RAM & phiếu bảo hành 36T 1 đổi 1.
                          </p>
                        </div>
                        <Link
                          href="/warranty"
                          className="inline-flex items-center gap-1.5 text-xs font-black text-[#0284c7] uppercase hover:underline bg-sky-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-500/30"
                        >
                          <span>Tra cứu online</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      {isLoadingOrders ? (
                        <div className="text-center py-12 text-xs text-slate-400">
                          Đang tải kho linh kiện...
                        </div>
                      ) : (() => {
                        const allHardwareItems: any[] = [];
                        orders.forEach((order) => {
                          if (order.gameKeys && order.gameKeys.length > 0) {
                            order.gameKeys.forEach((k: any) => {
                              allHardwareItems.push({
                                id: k.id,
                                orderId: order.id,
                                serialNumber: k.keyCode.includes('SN-') ? k.keyCode : `SN-${k.keyCode.toUpperCase()}`,
                                productName: k.product?.name || 'Linh Kiện Máy Tính DRX',
                                platform: k.product?.platform || 'HARDWARE',
                                coverImage: k.product?.coverImage || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800',
                                warrantyMonths: 36,
                                purchaseDate: new Date(k.createdAt || order.createdAt).toLocaleDateString('vi-VN', {
                                  year: 'numeric', month: '2-digit', day: '2-digit',
                                }),
                              });
                            });
                          }
                        });

                        if (allHardwareItems.length === 0) {
                          return (
                            <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-4">
                              <div className="h-16 w-16 rounded-3xl bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="h-8 w-8" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Chưa có linh kiện nào trong kho bảo hành</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-light max-w-sm leading-relaxed mx-auto">
                                  Bạn chưa sở hữu linh kiện máy tính nào. Hãy mua sắm linh kiện chính hãng tại DRX để nhận bảo hành 1 đổi 1 36 tháng tận nơi!
                                </p>
                              </div>
                              <Link
                                href="/products"
                                className="uiverse-btn-shimmer inline-flex items-center gap-2 rounded-2xl text-white px-6 py-3 text-xs font-heading font-black uppercase tracking-wider shadow-lg"
                              >
                                <span>Mua Sắm Linh Kiện Ngay</span>
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {allHardwareItems.map((item) => (
                              <div key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-3.5 hover:border-[#0284c7] transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3.5">
                                    <img
                                      src={item.coverImage}
                                      alt={item.productName}
                                      className="h-14 w-20 rounded-xl object-cover bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0"
                                    />
                                    <div>
                                      <h4 className="font-heading text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1">{item.productName}</h4>
                                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block mt-0.5">
                                        ✓ Bảo hành chính hãng 36 Tháng (1 Đổi 1)
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-left sm:text-right shrink-0">
                                    <span className="text-[10px] text-slate-400 font-mono block">Ngày kích hoạt: {item.purchaseDate}</span>
                                    <span className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-300 uppercase bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-full inline-block mt-1">
                                      Đang trong hạn bảo hành
                                    </span>
                                  </div>
                                </div>

                                {/* SERIAL NUMBER BAR */}
                                <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-3 rounded-xl">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mã Serial SN:</span>
                                    <code className="text-xs font-mono text-[#0284c7] font-bold select-all">
                                      {item.serialNumber}
                                    </code>
                                  </div>
                                  <button
                                    onClick={() => handleCopy(item.id, item.serialNumber)}
                                    className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-800 dark:text-slate-200 hover:bg-[#0284c7] hover:text-white transition-all shrink-0 cursor-pointer"
                                  >
                                    {copiedKeyId === item.id ? (
                                      <>
                                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                                        <span className="text-emerald-400">ĐÃ COPY</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>COPY MÃ SN</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* 3. TRANSACTIONS TAB */}
                  {dashboardTab === 'transactions' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                          <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-[#0284c7]" />
                            <span>LỊCH SỬ BIẾN ĐỘNG SỐ DƯ VÍ DRX</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                            Ghi nhận nạp tiền tự động VietQR không phí và thanh toán đơn hàng.
                          </p>
                        </div>
                        <Link
                          href="/deposit"
                          className="uiverse-btn-shimmer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-heading font-black uppercase"
                        >
                          <Zap className="h-3.5 w-3.5 text-amber-300" />
                          <span>Nạp Tiền Ngay</span>
                        </Link>
                      </div>

                      {isLoadingTransactions ? (
                        <div className="text-center py-12 text-xs text-slate-400">
                          Đang tải lịch sử nạp tiền...
                        </div>
                      ) : transactions.length === 0 ? (
                        <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-4">
                          <div className="h-16 w-16 rounded-3xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#0284c7]">
                            <CreditCard className="h-8 w-8" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Chưa có giao dịch nạp tiền</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-light max-w-sm leading-relaxed mx-auto">
                              Nạp tiền vào ví DRX để thanh toán nhanh chóng đơn hàng linh kiện và nhận chiết khấu VIP!
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {transactions.map((tx) => (
                            <div key={tx.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-mono block mb-1">
                                    {new Date(tx.createdAt).toLocaleDateString('vi-VN', {
                                      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </span>
                                  <h4 className="font-heading text-xs font-black text-slate-900 dark:text-slate-100">
                                    {tx.description || 'Nạp tiền vào ví DRX'}
                                  </h4>
                                  {tx.referenceId && (
                                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                                      Mã GD: {tx.referenceId}
                                    </span>
                                  )}
                                </div>
                                <div className="text-left sm:text-right shrink-0">
                                  <span className={`text-sm font-black font-heading block ${tx.type === 'DEPOSIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                    {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mt-1">
                                    <CheckCircle2 className="h-3 w-3" /> Thành công
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. SAVED PC BUILDS TAB */}
                  {dashboardTab === 'builds' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                          <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-amber-500" />
                            <span>CẤU HÌNH PC GAMING & ĐỒ HỌA ĐÃ LƯU</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                            Quản lý các bộ cấu hình PC bạn đã tự phối linh kiện trên công cụ DRX PC Builder.
                          </p>
                        </div>
                      </div>

                      <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-4">
                        <div className="h-16 w-16 rounded-3xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center text-amber-500">
                          <Wrench className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Chưa có cấu hình PC nào được lưu</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light max-w-sm leading-relaxed mx-auto">
                            Tự tay lựa chọn CPU, VGA, Mainboard, RAM và kiểm tra tương thích tự động với công cụ PC Builder của DRX!
                          </p>
                        </div>
                        <Link
                          href="/pc-builder"
                          className="uiverse-btn-shimmer inline-flex items-center gap-2 rounded-2xl text-white px-6 py-3 text-xs font-heading font-black uppercase tracking-wider shadow-lg"
                        >
                          <Zap className="h-4 w-4 text-amber-300" />
                          <span>Tự Xây Dựng Cấu Hình PC Ngay</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* 5. WISHLIST TAB */}
                  {dashboardTab === 'wishlist' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                          <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-rose-500" />
                            <span>DANH SÁCH LINH KIỆN & THIẾT BỊ YÊU THÍCH</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                            Các linh kiện bạn đã đánh dấu quan tâm để chờ đợt khuyến mãi.
                          </p>
                        </div>
                      </div>

                      <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-4">
                        <div className="h-16 w-16 rounded-3xl bg-rose-50 dark:bg-slate-800 flex items-center justify-center text-rose-500">
                          <Heart className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Danh sách yêu thích trống</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light max-w-sm leading-relaxed mx-auto">
                            Bạn chưa lưu linh kiện nào. Hãy nhấn biểu tượng trái tim trên các sản phẩm CPU, VGA, Màn hình để theo dõi giá!
                          </p>
                        </div>
                        <Link
                          href="/products"
                          className="uiverse-btn-shimmer inline-flex items-center gap-2 rounded-2xl text-white px-6 py-3 text-xs font-heading font-black uppercase tracking-wider shadow-lg"
                        >
                          <span>Xem Kho Linh Kiện DRX</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* 6. SETTINGS TAB */}
                  {dashboardTab === 'settings' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5 shadow-sm">
                      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                        <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Settings className="h-4 w-4 text-[#0284c7]" />
                          <span>BẢO MẬT & ĐỔI MẬT KHẨU TÀI KHOẢN</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                          Cập nhật mật khẩu định kỳ để bảo vệ số dư ví và quyền lợi bảo hành.
                        </p>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); showToast('Đổi mật khẩu tài khoản thành công!', 'success'); }} className="space-y-4 max-w-md">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Mật khẩu hiện tại</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Mật khẩu mới</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="uiverse-btn-shimmer inline-flex items-center gap-2 rounded-2xl text-white px-6 py-3 text-xs font-heading font-black uppercase tracking-wider shadow-lg cursor-pointer"
                        >
                          <Lock className="h-4 w-4" />
                          <span>Cập Nhật Mật Khẩu</span>
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center text-xs font-bold text-slate-400">Đang tải trang cá nhân DRX Hardware...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
