'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { 
  User, Mail, Lock, LogIn, UserPlus, Shield, 
  ShoppingBag, Settings, LogOut, CheckCircle2, Copy, Check, ArrowRight, 
  ShieldCheck, Cpu, Box, Zap, PackageCheck, Wrench, ChevronRight,
  Award, CheckCircle, LayoutDashboard, Phone, MapPin,
  Eye, EyeOff, Sparkles, X
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

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function ProfileContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Dashboard navigation tab states (6 logical sections as requested)
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'orders' | 'warranty' | 'builds' | 'profile'>('overview');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Password visibility & Google auth states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // User info form states
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');

  // Password change form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // User state
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);

  // Live order list
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Saved PC builds
  const [savedBuilds, setSavedBuilds] = useState<any[]>([]);

  // Check query params for active tab on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'overview' || tabParam === 'orders' || tabParam === 'warranty' || tabParam === 'builds' || tabParam === 'profile') {
      setDashboardTab(tabParam as any);
    }
  }, [searchParams]);

  // Check login status on mount & restore remembered email
  useEffect(() => {
    const initAuth = async () => {
      const { getStoredSessionUser, verifyCurrentSession } = await import('@/lib/auth-client');
      const sessionUser = getStoredSessionUser();
      if (sessionUser) {
        setCurrentUser(prev => {
          if (prev && prev.id === sessionUser.id && prev.email === sessionUser.email) {
            return prev;
          }
          return sessionUser;
        });
        setProfileName(sessionUser.name || '');
        setIsLoggedIn(true);

        verifyCurrentSession().then((verified) => {
          if (verified) {
            setCurrentUser(prev => {
              if (prev && prev.id === verified.id && prev.email === verified.email) {
                return prev;
              }
              return verified;
            });
            setProfileName(verified.name || '');
            setIsLoggedIn(true);
          } else {
            setCurrentUser(null);
            setIsLoggedIn(false);
          }
        });
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    };

    initAuth();

    try {
      const savedEmail = localStorage.getItem('drx_remember_email');
      if (savedEmail) {
        setLoginEmail(savedEmail === 'admin@odsstore.vn' ? 'admin@drx.vn' : savedEmail);
        setRememberMe(true);
      }
    } catch (e) {
      console.warn('Failed to read remember email:', e);
    }
  }, []);

  // Fetch orders when user is authenticated
  useEffect(() => {
    if (!currentUser?.id) return;

    let isSubscribed = true;

    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await fetch(`/api/orders?userId=${currentUser.id}`);
        if (!isSubscribed) return;
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải lịch sử đơn hàng:', err);
      } finally {
        if (isSubscribed) {
          setIsLoadingOrders(false);
        }
      }
    };

    fetchOrders();

    // Load saved PC builds from localStorage
    try {
      const rawBuilds = localStorage.getItem('drx_saved_pc_builds');
      if (rawBuilds) {
        setSavedBuilds(JSON.parse(rawBuilds));
      }
    } catch (e) {
      console.warn('Lỗi đọc cấu hình PC đã lưu:', e);
    }

    return () => {
      isSubscribed = false;
    };
  }, [currentUser?.id]);

  const formatCurrency = (val: number | string) => {
    return Number(val || 0).toLocaleString('vi-VN') + ' đ';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { loginUser } = await import('@/lib/auth-client');
      const user = await loginUser(loginEmail, loginPassword);
      if (user) {
        if (rememberMe) {
          localStorage.setItem('drx_remember_email', loginEmail);
        } else {
          localStorage.removeItem('drx_remember_email');
        }
        setCurrentUser(user);
        setProfileName(user.name || '');
        setIsLoggedIn(true);
        showToast(`Đăng nhập thành công! Chào mừng ${user.name || 'bạn'}.`, 'success');
      } else {
        showToast('Email hoặc mật khẩu không chính xác!', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Đã xảy ra lỗi đăng nhập.', 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      showToast('Mật khẩu xác nhận không khớp!', 'error');
      return;
    }
    if (regPassword.length < 6) {
      showToast('Mật khẩu phải có tối thiểu 6 ký tự!', 'error');
      return;
    }

    try {
      const { registerUser } = await import('@/lib/auth-client');
      const user = await registerUser(regEmail, regPassword, regName);
      if (user) {
        setCurrentUser(user);
        setProfileName(user.name || regName);
        setIsLoggedIn(true);
        showToast('Đăng ký tài khoản DRX thành công!', 'success');
      } else {
        showToast('Email này đã được đăng ký tài khoản!', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Đã xảy ra lỗi khi tạo tài khoản.', 'error');
    }
  };

  const handleGoogleAuth = async (googleEmail?: string) => {
    const email = (googleEmail || customGoogleEmail).trim();
    if (!email || !email.includes('@')) {
      showToast('Vui lòng nhập địa chỉ Gmail hợp lệ!', 'error');
      return;
    }
    setIsGoogleLoading(true);
    try {
      const name = email.split('@')[0].replace(/[._]/g, ' ').toUpperCase();
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;

      const { loginWithGoogle } = await import('@/lib/auth-client');
      const user = await loginWithGoogle({ email, name, avatar });
      if (user) {
        setCurrentUser(user);
        setProfileName(user.name || name);
        setIsLoggedIn(true);
        setShowGoogleModal(false);
        showToast(`Đăng nhập Google thành công! Chào mừng ${user.name || 'bạn'}.`, 'success');
      } else {
        showToast('Không thể kết nối Google lúc này. Vui lòng thử lại!', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Đã xảy ra lỗi khi kết nối tài khoản Google.', 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    const { clearSessionUser } = await import('@/lib/auth-client');
    await clearSessionUser();
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

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      const updated = { ...currentUser, name: profileName.trim() || currentUser.name };
      setCurrentUser(updated);
      localStorage.setItem('ods_session_user', JSON.stringify(updated));
    }
    showToast('Cập nhật thông tin cá nhân thành công!', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có tối thiểu 6 ký tự!', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Xác nhận mật khẩu mới không khớp!', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    showToast('Đổi mật khẩu tài khoản thành công!', 'success');
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
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            /* ================== REDESIGNED LUXURY AUTHENTICATION CARD ================== */
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -12 }}
              className="relative mx-auto max-w-md my-8 sm:my-12 px-2"
            >
              {/* Subtle ambient lighting backdrop */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-sky-500/20 to-blue-600/10 dark:from-sky-500/15 dark:to-blue-600/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl space-y-6">
                
                {/* Brand Header */}
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-sky-500/10 via-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-slate-800 text-[#0284c7] border border-sky-200/80 dark:border-sky-500/30 shadow-2xs mb-1">
                    <Cpu className="h-7 w-7 text-[#0284c7]" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[10px] font-black uppercase tracking-wider text-[#0284c7] dark:text-sky-300">
                    <ShieldCheck className="w-3 h-3 text-[#0284c7]" />
                    <span>CỔNG BẢO MẬT DRX HARDWARE</span>
                  </div>
                  <h2 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    TÀI KHOẢN THÀNH VIÊN
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                    Quản lý đơn hàng linh kiện, bảo hành chính hãng và cấu hình PC
                  </p>
                </div>

                {/* Google Sign-in / Sign-up Button */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(true)}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 font-bold text-xs text-slate-800 dark:text-slate-100 shadow-xs transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer group"
                  >
                    {isGoogleLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-[#0284c7] rounded-full animate-spin" />
                    ) : (
                      <GoogleIcon className="w-4 h-4" />
                    )}
                    <span>
                      {authTab === 'login' ? 'Đăng nhập nhanh bằng Google' : 'Đăng ký tài khoản bằng Google'}
                    </span>
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Hoặc với Email
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                </div>

                {/* Segmented Pill Tabs Switcher */}
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAuthTab('login')}
                    className={`py-2 text-center font-heading text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      authTab === 'login'
                        ? 'bg-white dark:bg-slate-800 text-[#0284c7] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    Đăng Nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('register')}
                    className={`py-2 text-center font-heading text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      authTab === 'register'
                        ? 'bg-white dark:bg-slate-800 text-[#0284c7] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    Tạo Tài Khoản
                  </button>
                </div>

                {/* Form Tabs */}
                {authTab === 'login' ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                        Địa chỉ Email
                      </label>
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
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                          Mật khẩu
                        </label>
                        <span 
                          onClick={() => showToast('Vui lòng liên hệ Hotline 1900.8888 hoặc hỗ trợ trực tuyến để đặt lại mật khẩu!', 'info')}
                          className="text-[9.5px] text-[#0284c7] hover:underline cursor-pointer font-bold"
                        >
                          Quên mật khẩu?
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-11 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7] accent-[#0284c7]"
                        />
                        <span>Ghi nhớ đăng nhập</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="uiverse-btn-shimmer w-full mt-3 flex items-center justify-center gap-2 rounded-2xl text-white py-3.5 text-xs font-heading font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Đăng Nhập Tài Khoản</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                        Họ và Tên
                      </label>
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
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                        Địa chỉ Email
                      </label>
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
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          placeholder="Tối thiểu 6 ký tự"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-11 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                        Nhập lại mật khẩu
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Trùng khớp mật khẩu trên"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-11 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="uiverse-btn-shimmer w-full mt-3 flex items-center justify-center gap-2 rounded-2xl text-white py-3.5 text-xs font-heading font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Đăng Ký Thành Viên DRX</span>
                    </button>
                  </form>
                )}

                {/* Footer Security Badge */}
                <div className="mt-5 border-t border-slate-200/80 dark:border-slate-800 pt-4 text-center flex items-center justify-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Bảo mật 256-bit SSL chuẩn thương mại điện tử DRX</span>
                </div>
              </div>

              {/* GOOGLE ACCOUNT SELECTOR MODAL */}
              <AnimatePresence>
                {showGoogleModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <GoogleIcon className="w-5 h-5" />
                          <span className="font-heading text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                            Đăng nhập bằng Google
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowGoogleModal(false)}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          Nhập địa chỉ tài khoản Google / Gmail của bạn để tiếp tục đến <strong className="text-slate-900 dark:text-white">DRX Hardware</strong>:
                        </p>

                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                              Địa chỉ Gmail
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="tenban@gmail.com"
                              value={customGoogleEmail}
                              onChange={(e) => setCustomGoogleEmail(e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-2 focus:ring-sky-400/20 transition-all"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (!customGoogleEmail || !customGoogleEmail.includes('@')) {
                                showToast('Vui lòng nhập địa chỉ Gmail hợp lệ!', 'error');
                                return;
                              }
                              handleGoogleAuth(customGoogleEmail);
                            }}
                            disabled={isGoogleLoading}
                            className="w-full py-3.5 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-heading text-xs font-black uppercase tracking-wider shadow-md shadow-sky-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            {isGoogleLoading ? (
                              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                              <GoogleIcon className="w-4 h-4" />
                            )}
                            <span>Tiếp Tục Với Google</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* ================== USER DASHBOARD (NO WALLET, 5 CLEAN TABS) ================== */
            <div className="space-y-8 my-4">
              
              {/* 1. TOP STATS BANNER (NO WALLET BALANCE - ONLY ESSENTIAL HARDWARE STATS) */}
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
                          ● Bảo hành 1 đổi 1 36T
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Quick Metrics Grid (7 cols - NO WALLET, ONLY REAL HARDWARE STATS) */}
                  <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    
                    {/* Metric 1: Orders Count */}
                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-sky-400/30 p-4 rounded-2xl flex flex-col justify-between shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-sky-200/70 uppercase tracking-wider">Đơn Hàng Của Tôi</span>
                        <ShoppingBag className="h-4 w-4 text-[#0284c7]" />
                      </div>
                      <div className="mt-2">
                        <span className="font-heading text-lg font-black text-slate-900 dark:text-white block">
                          {orders.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">đơn hàng</span>
                        </span>
                        <button onClick={() => setDashboardTab('orders')} className="text-[10px] font-bold text-[#0284c7] hover:underline inline-flex items-center gap-0.5 mt-0.5 cursor-pointer">
                          <span>Xem danh sách</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Metric 2: Hardware Warranty Items */}
                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-emerald-500/30 p-4 rounded-2xl flex flex-col justify-between shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-emerald-300/70 uppercase tracking-wider">Linh Kiện Bảo Hành</span>
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="mt-2">
                        <span className="font-heading text-lg font-black text-emerald-600 dark:text-emerald-400 block">
                          {totalHardwareItems} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">thiết bị</span>
                        </span>
                        <button onClick={() => setDashboardTab('warranty')} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 mt-0.5 cursor-pointer">
                          <span>Xem Serial Number</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Metric 3: Saved PC Builds */}
                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-amber-500/30 p-4 rounded-2xl flex flex-col justify-between shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-amber-300/70 uppercase tracking-wider">Cấu Hình Tự Ráp</span>
                        <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="mt-2">
                        <span className="font-heading text-lg font-black text-amber-600 dark:text-amber-300 block">
                          {savedBuilds.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">cấu hình</span>
                        </span>
                        <button onClick={() => setDashboardTab('builds')} className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5 mt-0.5 cursor-pointer">
                          <span>Xem PC Builder</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* 2. MAIN WORKSPACE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT SIDEBAR NAVIGATION MENU (EXACTLY 6 LOGICAL ITEMS) */}
                <div className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 block">
                    QUẢN LÝ TÀI KHOẢN & LINH KIỆN
                  </span>

                  <div className="flex flex-col space-y-1.5">
                    
                    {/* 1. TỔNG QUAN */}
                    <button
                      onClick={() => setDashboardTab('overview')}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                        dashboardTab === 'overview'
                          ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Tổng Quan</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                    </button>

                    {/* 2. ĐƠN HÀNG CỦA TÔI */}
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
                        <span>Đơn Hàng Của Tôi</span>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        dashboardTab === 'orders'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {orders.length}
                      </span>
                    </button>

                    {/* 3. BẢO HÀNH */}
                    <button
                      onClick={() => setDashboardTab('warranty')}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                        dashboardTab === 'warranty'
                          ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck className={`h-4 w-4 ${dashboardTab === 'warranty' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                        <span>Bảo Hành</span>
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        dashboardTab === 'warranty'
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {totalHardwareItems}
                      </span>
                    </button>

                    {/* 4. CẤU HÌNH PC TỰ RÁP */}
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

                    {/* 5. THÔNG TIN CÁ NHÂN (GỒM ĐỔI MẬT KHẨU BÊN TRONG) */}
                    <button
                      onClick={() => setDashboardTab('profile')}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider transition-all cursor-pointer ${
                        dashboardTab === 'profile'
                          ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4" />
                        <span>Thông Tin Cá Nhân</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                    </button>

                    {/* 6. ĐĂNG XUẤT */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-xs font-heading font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all mt-4 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng Xuất</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT DETAIL WORKSPACE (8 cols) */}
                <div className="lg:col-span-8 space-y-6 min-h-[520px] transition-all duration-300">
                  
                  {/* TAB 1: TỔNG QUAN (OVERVIEW DASHBOARD) */}
                  {dashboardTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Welcome Card */}
                      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#0284c7] block">
                              BẢNG ĐIỀU KHIỂN TÀI KHOẢN
                            </span>
                            <h3 className="font-heading text-lg font-black uppercase text-slate-900 dark:text-white mt-0.5">
                              Xin Chào, {sanitizedName}!
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Chào mừng bạn quay trở lại trung tâm quản lý linh kiện phần cứng &amp; PC Gaming DRX.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              Tài khoản đã xác thực
                            </span>
                          </div>
                        </div>

                        {/* Quick Action Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                          <div 
                            onClick={() => setDashboardTab('orders')}
                            className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#0284c7] transition-all cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-slate-800 text-[#0284c7] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                            <h4 className="font-heading text-xs font-black uppercase text-slate-900 dark:text-white">
                              Đơn Hàng ({orders.length})
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Theo dõi tiến độ giao nhận linh kiện và hóa đơn mua sắm.
                            </p>
                          </div>

                          <div 
                            onClick={() => setDashboardTab('warranty')}
                            className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-slate-800 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h4 className="font-heading text-xs font-black uppercase text-slate-900 dark:text-white">
                              Bảo Hành ({totalHardwareItems})
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Quản lý mã Serial Number (SN) và hạn bảo hành 1 đổi 1.
                            </p>
                          </div>

                          <div 
                            onClick={() => setDashboardTab('builds')}
                            className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-slate-800 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                              <Wrench className="w-5 h-5" />
                            </div>
                            <h4 className="font-heading text-xs font-black uppercase text-slate-900 dark:text-white">
                              Cấu Hình PC ({savedBuilds.length})
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              Xem lại cấu hình PC Gaming đã tự phối linh kiện.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Links Banner */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link 
                          href="/pc-builder"
                          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent p-6 space-y-2 hover:border-[#0284c7] transition-all block group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-[#0284c7]">DRX PC BUILDER</span>
                            <ArrowRight className="w-4 h-4 text-[#0284c7] group-hover:translate-x-1 transition-transform" />
                          </div>
                          <h4 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">
                            Tự Tay Ráp Dàn PC Mới
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Công cụ kiểm tra tương thích thông minh giữa CPU, Mainboard, RAM và VGA.
                          </p>
                        </Link>

                        <Link 
                          href="/warranty"
                          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-6 space-y-2 hover:border-emerald-500 transition-all block group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-emerald-600">TRA CỨU TRỰC TUYẾN</span>
                            <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <h4 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">
                            Tra Cứu Bảo Hành Bằng Serial (SN)
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Nhập mã Serial Number trên tem linh kiện để kiểm tra lịch sử bảo trì.
                          </p>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: ĐƠN HÀNG CỦA TÔI */}
                  {dashboardTab === 'orders' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                          <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-[#0284c7]" />
                            <span>ĐƠN HÀNG CỦA TÔI</span>
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
                            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Chưa có đơn hàng nào</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-light max-w-sm leading-relaxed mx-auto">
                              Bạn chưa đặt mua linh kiện hoặc PC nào. Hãy khám phá kho linh kiện chính hãng tại DRX Hardware!
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
                      ) : (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div key={order.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-mono block">MÃ ĐƠN: #{order.id.slice(0, 8).toUpperCase()}</span>
                                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-black font-heading text-[#0284c7]">
                                    {formatCurrency(order.netAmount)}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                    <CheckCircle2 className="h-3 w-3" /> Đã xác nhận
                                  </span>
                                </div>
                              </div>

                              {order.gameKeys && order.gameKeys.length > 0 && (
                                <div className="space-y-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    Linh Kiện Trong Đơn ({order.gameKeys.length}):
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {order.gameKeys.map((item) => (
                                      <div key={item.id} className="flex items-center gap-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                        {item.product?.coverImage && (
                                          <img
                                            src={item.product.coverImage}
                                            alt={item.product.name}
                                            className="h-10 w-14 object-cover rounded-lg bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0"
                                          />
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <h5 className="font-heading text-xs font-black text-slate-900 dark:text-white truncate">
                                            {item.product?.name || 'Linh Kiện Máy Tính'}
                                          </h5>
                                          <span className="text-[10px] font-mono text-[#0284c7] block">
                                            SN: {item.keyCode}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: BẢO HÀNH */}
                  {dashboardTab === 'warranty' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                          <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            <span>KHO LINH KIỆN &amp; BẢO HÀNH CHÍNH HÃNG</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                            Quản lý toàn bộ mã Serial Number (SN) linh kiện đã mua và kích hoạt bảo hành 1 đổi 1 trong 36 tháng.
                          </p>
                        </div>
                        <Link
                          href="/warranty"
                          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#0284c7] hover:underline"
                        >
                          <span>Cổng tra cứu bảo hành</span>
                          <ChevronRight className="w-3.5 h-3.5" />
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

                  {/* TAB 4: CẤU HÌNH PC TỰ RÁP */}
                  {dashboardTab === 'builds' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                          <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-amber-500" />
                            <span>CẤU HÌNH PC TỰ RÁP ĐÃ LƯU</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                            Quản lý các bộ cấu hình PC bạn đã tự phối linh kiện trên công cụ DRX PC Builder.
                          </p>
                        </div>
                        <Link
                          href="/pc-builder"
                          className="uiverse-btn-shimmer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-heading font-black uppercase"
                        >
                          <Zap className="h-3.5 w-3.5 text-amber-300" />
                          <span>Ráp Cấu Hình Mới</span>
                        </Link>
                      </div>

                      {savedBuilds.length === 0 ? (
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
                      ) : (
                        <div className="space-y-4">
                          {savedBuilds.map((build: any, bIdx: number) => (
                            <div key={bIdx} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">
                                  {build.name || `Cấu hình PC #${bIdx + 1}`}
                                </h4>
                                <span className="font-heading text-xs font-black text-[#0284c7]">
                                  {formatCurrency(build.totalPrice || 0)}
                                </span>
                              </div>
                              <Link
                                href="/pc-builder"
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#0284c7] hover:underline"
                              >
                                <span>Mở lại trong PC Builder</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: THÔNG TIN CÁ NHÂN (GỒM CẢ ĐỔI MẬT KHẨU) */}
                  {dashboardTab === 'profile' && (
                    <div className="space-y-6">
                      
                      {/* CARD 1: THÔNG TIN TÀI KHOẢN */}
                      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 space-y-5 shadow-sm">
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                          <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <User className="h-4 w-4 text-[#0284c7]" />
                            <span>THÔNG TIN CÁ NHÂN</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                            Cập nhật họ tên và thông tin liên hệ nhận hàng của bạn.
                          </p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Họ và tên</label>
                            <input
                              type="text"
                              required
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              placeholder="Họ và tên khách hàng"
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Địa chỉ Email</label>
                            <input
                              type="email"
                              disabled
                              value={sanitizedEmail}
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 py-3 px-4 text-xs font-semibold text-slate-500 cursor-not-allowed"
                            />
                            <span className="text-[10px] text-slate-400">Email được liên kết cố định với tài khoản.</span>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Số điện thoại nhận hàng</label>
                            <input
                              type="tel"
                              value={profilePhone}
                              onChange={(e) => setProfilePhone(e.target.value)}
                              placeholder="Ví dụ: 0908889999"
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Địa chỉ giao hàng mặc định</label>
                            <textarea
                              rows={2}
                              value={profileAddress}
                              onChange={(e) => setProfileAddress(e.target.value)}
                              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="uiverse-btn-shimmer inline-flex items-center gap-2 rounded-2xl text-white px-6 py-3 text-xs font-heading font-black uppercase tracking-wider shadow-lg cursor-pointer"
                          >
                            <Check className="h-4 w-4" />
                            <span>Lưu Thông Tin Cá Nhân</span>
                          </button>
                        </form>
                      </div>

                      {/* CARD 2: ĐỔI MẬT KHẨU (INTEGRATED INSIDE PERSONAL INFO) */}
                      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 space-y-5 shadow-sm">
                        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                          <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Lock className="h-4 w-4 text-[#0284c7]" />
                            <span>ĐỔI MẬT KHẨU TÀI KHOẢN</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                            Nên đặt mật khẩu mạnh (tối thiểu 6 ký tự) để bảo vệ tài khoản và lịch sử bảo hành linh kiện.
                          </p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Mật khẩu hiện tại</label>
                            <input
                              type="password"
                              required
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Mật khẩu mới</label>
                            <input
                              type="password"
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Tối thiểu 6 ký tự"
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Xác nhận mật khẩu mới</label>
                            <input
                              type="password"
                              required
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                              placeholder="Nhập lại mật khẩu mới"
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
