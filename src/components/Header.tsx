'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShoppingBag, User, Wallet, ShieldAlert, Package, Users, ChevronDown,
  Clock, Flame, Tag, Key, Bell, ClipboardList, MessageCircle, Cpu, ShieldCheck,
  Sun, Moon, Search, Grid, Receipt, Sparkles, Layers, HardDrive, Zap, Award, HelpCircle,
  Laptop, Gamepad2, Box, Headphones, Monitor, Keyboard
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomerChatModal } from './CustomerChatModal';
import { AdminChatModal } from './AdminChatModal';
import { UiverseToggle } from './uiverse/UiverseToggle';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();

  // Navigation & Dropdown states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteList, setAutocompleteList] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Dynamic user state loaded from localStorage
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    balance: number;
    email: string;
    role?: string;
  } | null>(null);

  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [isAdminNotifOpen, setIsAdminNotifOpen] = useState(false);
  const [adminChatOpen, setAdminChatOpen] = useState(false);
  const [activeAdminChat, setActiveAdminChat] = useState<any>(null);

  const [hasUserNewMessage, setHasUserNewMessage] = useState(false);
  const [isUserNotifOpen, setIsUserNotifOpen] = useState(false);
  const [customerChatOpen, setCustomerChatOpen] = useState(false);

  const isAdmin = currentUser?.email === 'admin@drx.vn' || currentUser?.email === 'admin@drxhardware.vn' || currentUser?.email === 'admin@odsstore.vn' || currentUser?.role === 'ADMIN';

  // Load products for Header live search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setAllProducts(data);
          } else if (data && Array.isArray(data.products)) {
            setAllProducts(data.products);
          }
        }
      } catch (e) {
        console.error('Failed to load products for search:', e);
      }
    };
    fetchProducts();
  }, []);

  // Update autocomplete list
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAutocompleteList([]);
      return;
    }
    const filtered = allProducts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.platform && p.platform.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5);
    setAutocompleteList(filtered);
  }, [searchQuery, allProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchFocused(false);
  };

  useEffect(() => {
    const loadUser = async () => {
      // Import client auth helper dynamically
      const { getStoredSessionUser, verifyCurrentSession } = await import('@/lib/auth-client');
      const sessionUser = getStoredSessionUser();
      if (sessionUser) {
        setCurrentUser(sessionUser);
        // Verify with server in background
        verifyCurrentSession().then((verified) => {
          if (verified) {
            const finalBalance = (verified.balance !== undefined && verified.balance !== null && Number(verified.balance) > 0)
              ? Number(verified.balance)
              : Number(sessionUser.balance || 0);
            setCurrentUser({
              ...verified,
              balance: finalBalance,
            });
          }
        });
      } else {
        setCurrentUser(null);
      }
    };

    loadUser();

    window.addEventListener('storage', loadUser);
    window.addEventListener('ods_user_update', loadUser);
    
    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('ods_user_update', loadUser);
    };
  }, []);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        if (isAdmin) {
          const res = await fetch('/api/notifications');
          if (res.ok) {
            const parsed = await res.json();
            setAdminNotifications(parsed);
            const hasUnread = parsed.some((n: any) => !n.read);
            if (hasUnread && !hasNewNotification) {
              setHasNewNotification(true);
              try {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => console.log('Audio play blocked:', e));
              } catch (e) {}
            } else if (!hasUnread && hasNewNotification) {
              setHasNewNotification(false);
            }
          }
        } else if (currentUser) {
          const res = await fetch('/api/support');
          if (res.ok) {
            const allMessages = await res.json();
            const hasUnread = allMessages.some((m: any) => m.receiverId === currentUser.id && !m.isRead);
            if (hasUnread && !hasUserNewMessage) {
              setHasUserNewMessage(true);
              try {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => console.log('Audio play blocked:', e));
              } catch (e) {}
            } else if (!hasUnread && hasUserNewMessage) {
              setHasUserNewMessage(false);
            }
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải thông báo:', error);
      }
    };
    
    const notifInterval = setInterval(checkNotifications, 3000);
    checkNotifications();

    const handleOpenChat = () => setCustomerChatOpen(true);
    window.addEventListener('open_customer_chat', handleOpenChat);

    return () => {
      clearInterval(notifInterval);
      window.removeEventListener('open_customer_chat', handleOpenChat);
    };
  }, [isAdmin, hasNewNotification, hasUserNewMessage, currentUser]);

  const formatCurrency = (value: number) => {
    return Number(value || 0).toLocaleString('vi-VN') + ' đ';
  };

  const hardwareCategories = [
    { id: 'LAPTOP', name: 'Laptop', desc: 'Laptop văn phòng, mỏng nhẹ, pin trâu', icon: Laptop, color: 'text-cyan-500' },
    { id: 'LAPTOP_GAMING', name: 'Laptop Gaming', desc: 'ASUS ROG, MSI, Legion RTX 40 Series', icon: Gamepad2, color: 'text-rose-500' },
    { id: 'CORE_PARTS', name: 'Main, CPU, VGA, RAM', desc: 'Vi xử lý, Card đồ họa, Bo mạch chủ, RAM', icon: Cpu, color: 'text-amber-500' },
    { id: 'CASE_COOLING', name: 'Case, Nguồn, Tản Nhiệt', desc: 'Vỏ PC gaming, PSU 80 Plus, Tản AIO', icon: Box, color: 'text-emerald-500' },
    { id: 'HEADSET', name: 'Tai Nghe', desc: 'Tai nghe gaming 7.1, không dây, mic lọc ồn', icon: Headphones, color: 'text-purple-500' },
    { id: 'MONITOR', name: 'Màn Hình', desc: 'Màn hình 144Hz - 360Hz, 2K/4K OLED, IPS', icon: Monitor, color: 'text-blue-500' },
    { id: 'KEYBOARD', name: 'Bàn Phím', desc: 'Bàn phím cơ Custom, Wireless, Hot-swap', icon: Keyboard, color: 'text-teal-500' },
    { id: 'STORAGE', name: 'Ổ Cứng', desc: 'SSD NVMe PCIe 4.0/5.0, HDD lưu trữ', icon: HardDrive, color: 'text-indigo-500' },
  ];

  const sponsorBrands = [
    { name: 'NVIDIA', logo: 'NVIDIA RTX', color: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400' },
    { name: 'INTEL', logo: 'INTEL CORE', color: 'border-blue-500/30 text-blue-600 dark:text-blue-400' },
    { name: 'AMD', logo: 'AMD RYZEN', color: 'border-red-500/30 text-red-600 dark:text-red-400' },
    { name: 'ASUS', logo: 'ASUS ROG', color: 'border-rose-500/30 text-rose-600 dark:text-rose-400' },
    { name: 'MSI', logo: 'MSI GAMING', color: 'border-amber-500/30 text-amber-600 dark:text-amber-400' },
    { name: 'GIGABYTE', logo: 'AORUS', color: 'border-purple-500/30 text-purple-600 dark:text-purple-400' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl shadow-xs transition-colors duration-300">
      
      {/* ─────────────────────────────────────────────────────────────
          1. MAIN HEADER ROW (LOGIC SEQUENCE: LOGO -> DANH MỤC -> TÌM KIẾM -> GIỎ HÀNG -> ĐĂNG NHẬP)
         ───────────────────────────────────────────────────────────── */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        
        {/* STEP 1: LOGO */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0" title="Trang chủ DRX HARDWARE">
          <img 
            src="/logo/logo-header.png" 
            alt="DRX HARDWARE Logo" 
            className="h-8 md:h-9 w-auto object-contain dark:hidden group-hover:scale-105 transition-transform" 
          />
          <img 
            src="/logo/logo-white.png" 
            alt="DRX HARDWARE Logo" 
            className="h-8 md:h-9 w-auto object-contain hidden dark:block group-hover:scale-105 transition-transform" 
          />
        </Link>

        {/* STEP 2: DANH MỤC (CATEGORY DROPDOWN BUTTON) */}
        <div 
          className="relative py-2 hidden md:block shrink-0"
          onMouseEnter={() => setIsCategoryOpen(true)}
          onMouseLeave={() => setIsCategoryOpen(false)}
        >
          <button 
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-heading font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all shadow-xs cursor-pointer"
          >
            <Grid className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>DANH MỤC</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-cyan-500' : ''}`} />
          </button>

          {/* DANH MỤC DROPDOWN MENU */}
          <AnimatePresence>
            {isCategoryOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 w-[560px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl z-50 mt-1"
              >
                <div className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 px-3 py-1.5 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/80 mb-2">
                  DANH MỤC THIẾT BỊ & LINH KIỆN PC
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {hardwareCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.id}`}
                        onClick={() => setIsCategoryOpen(false)}
                        className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group"
                      >
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                          <Icon className={`h-4 w-4 ${cat.color}`} />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="font-heading font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 truncate">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-light truncate">
                            {cat.desc}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/80 mt-2 pt-2 flex justify-between items-center px-1">
                  <span className="text-[10px] text-slate-400">Tất cả sản phẩm chính hãng bảo hành 36T</span>
                  <Link
                    href="/products"
                    onClick={() => setIsCategoryOpen(false)}
                    className="flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    <span>Xem tất cả kho hàng →</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STEP 3: THANH TÌM KIẾM SẢN PHẨM (MAIN SEARCH BAR - UI VERSE INPUT) */}
        <div className="relative flex-1 max-w-xl mx-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#0284c7] dark:text-[#6EC2F7]" />
            <input
              type="text"
              placeholder="Tìm CPU, RTX 4060, Mainboard, RAM DDR5..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full uiverse-input-glow py-2.5 pl-10 pr-10 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </form>

          {/* Autocomplete Suggestions Overlay */}
          {isSearchFocused && autocompleteList.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl border border-sky-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl z-50 space-y-1">
              <div className="text-[10px] font-bold text-[#0284c7] dark:text-[#6EC2F7] px-2 py-1 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Gợi ý tìm kiếm linh kiện</span>
              </div>
              {autocompleteList.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <img src={item.coverImage} alt={item.name} className="h-8 w-12 object-cover rounded-lg bg-slate-950" />
                  <div className="flex-1 truncate">
                    <span className="font-heading font-bold text-xs text-slate-900 dark:text-slate-100 block truncate">{item.name}</span>
                    <span className="text-[10px] font-extrabold text-[#0284c7] dark:text-[#6EC2F7]">{formatCurrency(item.discountPrice ?? item.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* STEP 4: GIỎ HÀNG & STEP 5: ĐĂNG NHẬP / TÀI KHOẢN CONTROLS */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* STEP 4: GIỎ HÀNG (CART TOGGLE) */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center justify-center rounded-xl border border-sky-200 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-900 p-2 text-slate-700 dark:text-slate-200 hover:text-[#0284c7] hover:border-[#6EC2F7] hover:shadow-md hover:shadow-sky-400/20 transition-all cursor-pointer shadow-xs"
            title="Giỏ hàng của bạn"
          >
            <ShoppingBag className="h-4.5 w-4.5 text-[#0284c7] dark:text-[#6EC2F7]" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#6EC2F7] to-[#0284c7] text-[10px] font-black text-white shadow-md shadow-sky-400/40"
              >
                {cartCount}
              </motion.span>
            )}
          </button>


          {/* BELL THÔNG BÁO (When logged in) */}
          {currentUser && (
            isAdmin ? (
              <div className="relative">
                <button
                  onClick={() => setIsAdminNotifOpen(!isAdminNotifOpen)}
                  className="relative flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-pointer shadow-xs"
                  title="Thông báo quản trị"
                >
                  <Bell className={`h-4.5 w-4.5 ${hasNewNotification ? 'animate-bounce text-amber-500' : ''}`} />
                  {hasNewNotification && (
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserNotifOpen(!isUserNotifOpen)}
                  className="relative flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-pointer shadow-xs"
                  title="Thông báo cá nhân"
                >
                  <Bell className={`h-4.5 w-4.5 ${hasUserNewMessage ? 'animate-bounce text-cyan-500' : ''}`} />
                  {hasUserNewMessage && (
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                    </span>
                  )}
                </button>
              </div>
            )
          )}

          {/* THEME TOGGLE (UI VERSE TOGGLE SWITCHER) */}
          <div title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}>
            <UiverseToggle
              active={theme === 'dark'}
              onToggle={toggleTheme}
              label={
                <span className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  {theme === 'dark' ? <Moon className="h-3.5 w-3.5 text-sky-400" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
                </span>
              }
            />
          </div>

          {/* STEP 5: ĐĂNG NHẬP / TÀI KHOẢN */}
          <Link
            href="/profile"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all shadow-xs"
            title={currentUser ? `Tài khoản: ${currentUser.name}` : 'Đăng Nhập / Đăng Ký'}
          >
            <User className="h-4.5 w-4.5" />
            <span className="hidden sm:inline font-heading text-xs font-bold">
              {currentUser ? currentUser.name : 'ĐĂNG NHẬP'}
            </span>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SUB HEADER ROW (THANH HEADER PHỤ Ở DƯỚI)
          Items: Danh Mục Khuyến Mãi | Tra Cứu Bảo Hành | Tra Cứu Hóa Đơn | Các Hãng Tài Trợ
         ───────────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 overflow-x-auto text-xs no-scrollbar">
          
          {/* LEFT SUB-HEADER LINKS */}
          <div className="flex items-center space-x-6 shrink-0">
            
            {/* 1. DANH MỤC KHUYẾN MÃI */}
            <Link
              href="/products/discounts"
              className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:text-rose-500 transition-colors py-1 group"
            >
              <Tag className="h-3.5 w-3.5 text-rose-500" />
              <span>KHUYẾN MÃI GIẢM SÂU</span>
              <span className="bg-rose-500/10 text-rose-600 dark:text-rose-300 text-[9px] px-1.5 py-0.2 rounded-full font-black border border-rose-500/20">HOT</span>
            </Link>

            {/* 2. TRA CỨU BẢO HÀNH */}
            <Link
              href="/warranty"
              className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 group"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>TRA CỨU BẢO HÀNH</span>
            </Link>

            {/* 3. TRA CỨU HÓA ĐƠN & ĐƠN HÀNG */}
            <Link
              href={currentUser ? "/profile?tab=orders" : "/profile"}
              className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors py-1 group"
            >
              <Receipt className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>TRA CỨU HÓA ĐƠN</span>
            </Link>

            {/* 4. BUILD PC TỰ ĐỘNG */}
            <Link
              href="/pc-builder"
              className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 group"
            >
              <Cpu className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>BUILD PC TỰ ĐỘNG</span>
            </Link>

            {/* 5. TOP LINH KIỆN MUA NHIỀU */}
            <Link
              href="/products/best-sellers"
              className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-1 group"
            >
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>LINH KIỆN MUA NHIỀU</span>
            </Link>

            {/* 6. HÃNG TÀI TRỢ (LINK TRỰC TIẾP TỚI TRANG /sponsors) */}
            <Link
              href="/sponsors"
              className="flex items-center gap-1.5 font-heading text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-1 border-l border-slate-200 dark:border-slate-800 pl-6 group"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>HÃNG TÀI TRỢ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* CUSTOMER CHAT MODAL */}
      {currentUser && !isAdmin && (
        <CustomerChatModal
          isOpen={customerChatOpen}
          onClose={() => setCustomerChatOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* ADMIN CHAT MODAL */}
      {isAdmin && activeAdminChat && (
        <AdminChatModal
          isOpen={adminChatOpen}
          onClose={() => {
            setAdminChatOpen(false);
            setActiveAdminChat(null);
          }}
          customerId={activeAdminChat.customerId}
          customerName={activeAdminChat.customerName}
          orderId={activeAdminChat.orderId}
          onSupportSuccess={() => {}}
        />
      )}
    </header>
  );
};

export default Header;
