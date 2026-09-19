'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { 
  User, Mail, Lock, LogIn, UserPlus, Shield, 
  ShoppingBag, Settings, LogOut, CheckCircle2, Copy, Check, ArrowRight, 
  ShieldCheck, Cpu, Box, Zap, PackageCheck, Wrench, ChevronRight,
  Award, CheckCircle, LayoutDashboard, Phone, MapPin,
  Eye, EyeOff, Sparkles, X, Trash2, ShoppingCart, Download, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast, showToast, showConfirm } from '@/components/Toast';
import { useCart } from '@/context/CartContext';
import { VIETNAM_PROVINCES, parseFullAddress } from '@/lib/vietnamLocations';
import { ModernSelect } from '@/components/ui/ModernSelect';

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
  const router = useRouter();
  const { addToCart } = useCart();
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

  // User info form states
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Guards against background verifications overwriting active user edits
  const isFormDirtyRef = useRef(false);
  const hasLoadedAddressRef = useRef(false);

  // Vietnam Administrative Locations State for Profile Default Address
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('hcm');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('hcm_thu_duc');
  const [selectedWardName, setSelectedWardName] = useState<string>('Phường Thảo Điền');
  const [streetAddress, setStreetAddress] = useState<string>('');

  const currentProvince = React.useMemo(() => {
    return VIETNAM_PROVINCES.find(p => p.id === selectedProvinceId) || VIETNAM_PROVINCES[0];
  }, [selectedProvinceId]);

  const currentDistrict = React.useMemo(() => {
    return currentProvince.districts.find(d => d.id === selectedDistrictId) || currentProvince.districts[0];
  }, [currentProvince, selectedDistrictId]);

  const wardsList = React.useMemo(() => {
    return currentDistrict?.wards || [];
  }, [currentDistrict]);

  const provinceOptions = React.useMemo(() => {
    return VIETNAM_PROVINCES.map((prov) => ({
      value: prov.id,
      label: prov.name,
    }));
  }, []);

  const districtOptions = React.useMemo(() => {
    return (currentProvince?.districts || []).map((dist) => ({
      value: dist.id,
      label: dist.name,
    }));
  }, [currentProvince]);

  const wardOptions = React.useMemo(() => {
    return (wardsList || []).map((ward) => ({
      value: ward,
      label: ward,
    }));
  }, [wardsList]);

  const handleProvinceChange = (provId: string) => {
    isFormDirtyRef.current = true;
    setSelectedProvinceId(provId);
    const prov = VIETNAM_PROVINCES.find(p => p.id === provId) || VIETNAM_PROVINCES[0];
    const firstDist = prov.districts[0];
    setSelectedDistrictId(firstDist?.id || '');
    setSelectedWardName(firstDist?.wards[0] || '');
  };

  const handleDistrictChange = (distId: string) => {
    isFormDirtyRef.current = true;
    setSelectedDistrictId(distId);
    const dist = currentProvince.districts.find(d => d.id === distId) || currentProvince.districts[0];
    setSelectedWardName(dist?.wards[0] || '');
  };

  const handleWardChange = (ward: string) => {
    isFormDirtyRef.current = true;
    setSelectedWardName(ward);
  };

  const handleStreetChange = (street: string) => {
    isFormDirtyRef.current = true;
    setStreetAddress(street);
  };

  // Sync profileAddress whenever location changes
  useEffect(() => {
    const parts: string[] = [];
    if (streetAddress.trim()) parts.push(streetAddress.trim());
    if (selectedWardName) parts.push(selectedWardName);
    if (currentDistrict?.name) parts.push(currentDistrict.name);
    if (currentProvince?.name) parts.push(currentProvince.name);

    setProfileAddress(parts.join(', '));
  }, [streetAddress, selectedWardName, currentDistrict, currentProvince]);

  const applyAddressToForm = (addrStr?: string, force: boolean = false) => {
    if (!addrStr || typeof addrStr !== 'string' || !addrStr.trim()) return;
    // Never overwrite if user is actively modifying the form unless explicitly forced
    if (isFormDirtyRef.current && !force) return;

    const parsed = parseFullAddress(addrStr);
    setSelectedProvinceId(parsed.provinceId);
    setSelectedDistrictId(parsed.districtId);
    setSelectedWardName(parsed.wardName);
    setStreetAddress(parsed.street);
    setProfileAddress(addrStr);
    hasLoadedAddressRef.current = true;
  };

  // Password change form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
    provider?: string;
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
        const storedProvider = typeof window !== 'undefined' ? sessionStorage.getItem('drx_auth_provider') : null;
        const resolvedSessionUser = storedProvider === 'google' || sessionUser.provider === 'google' || sessionUser.id?.startsWith('google-')
          ? { ...sessionUser, provider: 'google' }
          : sessionUser;

        setCurrentUser(resolvedSessionUser);

        if (!isFormDirtyRef.current) {
          setProfileName(resolvedSessionUser.name || '');
          setProfilePhone(resolvedSessionUser.phone || '');
          if (!hasLoadedAddressRef.current) {
            applyAddressToForm(resolvedSessionUser.address);
          }
        }
        setIsLoggedIn(true);

        verifyCurrentSession().then((verified) => {
          if (verified) {
            const resolvedVerified = storedProvider === 'google' || verified.provider === 'google' || verified.id?.startsWith('google-')
              ? { ...verified, provider: 'google' }
              : verified;
            setCurrentUser(resolvedVerified);
            if (!isFormDirtyRef.current) {
              setProfileName(resolvedVerified.name || '');
              setProfilePhone(resolvedVerified.phone || '');
              applyAddressToForm(resolvedVerified.address, true);
            }
            setIsLoggedIn(true);
          }
        });
      } else {
        verifyCurrentSession().then((verified) => {
          if (verified) {
            const storedProvider = typeof window !== 'undefined' ? sessionStorage.getItem('drx_auth_provider') : null;
            const resolvedVerified = storedProvider === 'google' || verified.provider === 'google' || verified.id?.startsWith('google-')
              ? { ...verified, provider: 'google' }
              : verified;
            setCurrentUser(resolvedVerified);
            if (!isFormDirtyRef.current) {
              setProfileName(resolvedVerified.name || '');
              setProfilePhone(resolvedVerified.phone || '');
              applyAddressToForm(resolvedVerified.address, true);
            }
            setIsLoggedIn(true);
          }
        });
      }
    };

    initAuth();

    window.addEventListener('storage', initAuth);
    window.addEventListener('ods_user_update', initAuth);
    return () => {
      window.removeEventListener('storage', initAuth);
      window.removeEventListener('ods_user_update', initAuth);
    };

    try {
      const savedEmail = localStorage.getItem('drx_remember_email');
      if (savedEmail) {
        setLoginEmail(savedEmail === 'admin@odsstore.vn' ? 'admin@drx.vn' : savedEmail);
        setRememberMe(true);
      }
    } catch (e) {
      console.warn('Failed to read remember email:', e);
    }

    // Preload Google Identity Services SDK for instant account popup
    try {
      if (typeof window !== 'undefined' && !(window as any).google?.accounts) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    } catch (e) {}
  }, []);

  // Fetch orders when user is authenticated
  useEffect(() => {
    if (!currentUser?.id) return;

    let isSubscribed = true;

    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const emailParam = currentUser.email ? `&email=${encodeURIComponent(currentUser.email)}` : '';
        const phoneParam = (currentUser as any).phone ? `&phone=${encodeURIComponent((currentUser as any).phone)}` : '';
        const res = await fetch(`/api/orders?userId=${currentUser.id}${emailParam}${phoneParam}`);
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

    window.addEventListener('storage', fetchOrders);
    window.addEventListener('drx_orders_updated', fetchOrders);

    return () => {
      isSubscribed = false;
      window.removeEventListener('storage', fetchOrders);
      window.removeEventListener('drx_orders_updated', fetchOrders);
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
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('drx_auth_provider');
        }
        if (rememberMe) {
          localStorage.setItem('drx_remember_email', loginEmail);
        } else {
          localStorage.removeItem('drx_remember_email');
        }
        setCurrentUser(user);
        setProfileName(user.name || '');
        setProfilePhone(user.phone || '');
        applyAddressToForm(user.address);
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
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('drx_auth_provider');
        }
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

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '545197389164-tudqa7vaa2l158lbg9par4pok81cfrrt.apps.googleusercontent.com';

    const triggerPopup = () => {
      try {
        const googleAuth = (window as any).google?.accounts?.oauth2;
        if (!googleAuth) {
          setIsGoogleLoading(false);
          showToast('Đang tải tiện ích Google, vui lòng thử lại sau vài giây!', 'info');
          return;
        }

        const client = googleAuth.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setIsGoogleLoading(false);
              if (tokenResponse.error !== 'popup_closed_by_user') {
                showToast(`Lỗi đăng nhập Google: ${tokenResponse.error}`, 'error');
              }
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                const { loginWithGoogle } = await import('@/lib/auth-client');
                const user = await loginWithGoogle({ accessToken: tokenResponse.access_token });
                if (user) {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('drx_auth_provider', 'google');
                  }
                  setCurrentUser({ ...user, provider: 'google' });
                  setProfileName(user.name || '');
                  setIsLoggedIn(true);
                  showToast(`Đăng nhập Google thành công! Chào mừng ${user.name || 'bạn'}.`, 'success');
                } else {
                  showToast('Không thể tạo phiên đăng nhập Google. Vui lòng thử lại!', 'error');
                }
              } catch (err) {
                console.error(err);
                showToast('Đã xảy ra lỗi khi hoàn tất đăng nhập Google.', 'error');
              } finally {
                setIsGoogleLoading(false);
              }
            } else {
              setIsGoogleLoading(false);
            }
          },
          error_callback: (err: any) => {
            setIsGoogleLoading(false);
            if (err?.type === 'popup_failed_to_open') {
              showToast('Trình duyệt đã chặn cửa sổ bật lên. Vui lòng bật Pop-up để tiếp tục!', 'error');
            }
          },
        });

        if (client) {
          client.requestAccessToken({ prompt: 'select_account' });
        } else {
          setIsGoogleLoading(false);
          showToast('Không thể khởi tạo phiên Google.', 'error');
        }
      } catch (err) {
        console.error('Google OAuth Trigger Error:', err);
        setIsGoogleLoading(false);
        showToast('Lỗi khi mở cửa sổ Google.', 'error');
      }
    };

    if (!(window as any).google?.accounts?.oauth2) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => triggerPopup();
      script.onerror = () => {
        setIsGoogleLoading(false);
        showToast('Không thể kết nối đến Google. Vui lòng kiểm tra mạng!', 'error');
      };
      document.head.appendChild(script);
    } else {
      triggerPopup();
    }
  };

  const handleLogout = async () => {
    const { clearSessionUser } = await import('@/lib/auth-client');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('drx_auth_provider');
    }
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const trimmedName = profileName.trim();
    if (!trimmedName) {
      showToast('Vui lòng nhập họ và tên!', 'error');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const { updateUserProfile } = await import('@/lib/auth-client');
      const updated = await updateUserProfile({
        name: trimmedName,
        phone: profilePhone.trim(),
        address: profileAddress.trim(),
      });

      if (updated) {
        isFormDirtyRef.current = false;
        setCurrentUser(updated);
        setProfileName(updated.name || '');
        setProfilePhone(updated.phone || '');
        setProfileAddress(updated.address || '');
        applyAddressToForm(updated.address, true);
        showToast('Cập nhật thông tin cá nhân lên hệ thống thành công!', 'success');
      } else {
        showToast('Không thể lưu thông tin vào cơ sở dữ liệu. Vui lòng thử lại!', 'error');
      }
    } catch (err) {
      console.error('Lỗi cập nhật profile:', err);
      showToast('Đã xảy ra lỗi khi lưu thông tin.', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có tối thiểu 6 ký tự!', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Xác nhận mật khẩu mới không khớp!', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { changeUserPassword } = await import('@/lib/auth-client');
      const res = await changeUserPassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
        email: currentUser?.email,
      });

      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        showToast(res.message || 'Đổi mật khẩu tài khoản thành công!', 'success');
      } else {
        showToast(res.message || 'Không thể đổi mật khẩu lúc này. Vui lòng kiểm tra lại!', 'error');
      }
    } catch (err: any) {
      console.error('Lỗi khi đổi mật khẩu:', err);
      showToast('Đã xảy ra lỗi kết nối máy chủ khi đổi mật khẩu.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteSavedBuild = (buildId: string) => {
    showConfirm({
      title: 'Xóa Cấu Hình Đã Lưu',
      message: 'Bạn có chắc chắn muốn xóa cấu hình PC này khỏi danh sách đã lưu? Cấu hình sẽ bị gỡ bỏ khỏi tài khoản của bạn.',
      confirmText: 'Xóa Cấu Hình',
      cancelText: 'Giữ Lại',
      variant: 'danger',
      onConfirm: () => {
        try {
          const updated = savedBuilds.filter((b: any) => b.id !== buildId);
          setSavedBuilds(updated);
          localStorage.setItem('drx_saved_pc_builds', JSON.stringify(updated));
          showToast('Đã xóa cấu hình PC thành công!', 'success');
        } catch (e) {
          showToast('Lỗi khi xóa cấu hình.', 'error');
        }
      }
    });
  };

  const handleBuySavedBuild = (build: any) => {
    const items = build.items || [];
    if (items.length === 0) {
      showToast('Cấu hình này không có linh kiện!', 'error');
      return;
    }
    items.forEach((it: any) => {
      const p = it.product;
      if (p) {
        addToCart({
          id: p.id,
          productId: p.id,
          name: p.name,
          slug: p.slug || p.id,
          price: p.price,
          discountPrice: p.discountPrice,
          coverImage: p.coverImage,
          platform: 'HARDWARE',
        });
      }
    });
    showToast(`Đã thêm toàn bộ linh kiện của "${build.name}" vào giỏ hàng!`, 'success');
    router.push('/checkout');
  };

  // Calculate total registered hardware items
  const totalHardwareItems = orders.reduce((acc, curr) => acc + (curr.gameKeys ? curr.gameKeys.length : 0), 0);

  // Sanitized display values
  const sanitizedName = currentUser?.name ? currentUser.name.replace(/ODS/g, 'DRX') : 'Khách Hàng DRX';
  const rawEmail = currentUser?.email || '';
  const sanitizedEmail = rawEmail === 'admin@odsstore.vn' || rawEmail === 'admin@drxhardware.vn' ? 'admin@drx.vn' : rawEmail;
  const sanitizedInitial = sanitizedName.charAt(0).toUpperCase();
  const isGoogleUser =
    currentUser?.provider === 'google' ||
    currentUser?.id?.startsWith('google-') ||
    (typeof window !== 'undefined' && sessionStorage.getItem('drx_auth_provider') === 'google');

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
                  <div className="flex justify-center pb-1">
                    <Link href="/" className="inline-block group" title="DRX Hardware">
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
                    onClick={handleGoogleAuth}
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
                      
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {currentUser?.role === 'ADMIN' ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                              👑 Quản Trị Viên (ADMIN)
                            </span>
                            <Link href="/admin" className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline">
                              Vào Cổng Admin →
                            </Link>
                            <Link href="/staff" className="text-[10px] font-bold text-[#0284c7] hover:underline">
                              Vào Cổng Staff →
                            </Link>
                          </div>
                        ) : currentUser?.role === 'STAFF' ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                              🛠️ Nhân Viên Vận Hành (STAFF)
                            </span>
                            <Link href="/staff" className="text-[10px] font-bold text-[#0284c7] hover:underline">
                              Vào Cổng Staff Kho →
                            </Link>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/40 text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                            <Award className="h-3 w-3" /> Thành Viên DRX (USER)
                          </span>
                        )}
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
                        <span className="text-[10px] font-bold text-slate-500 dark:text-amber-300/70 uppercase tracking-wider">DRX Build Đã Lưu</span>
                        <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="mt-2">
                        <span className="font-heading text-lg font-black text-amber-600 dark:text-amber-300 block">
                          {savedBuilds.length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">cấu hình</span>
                        </span>
                        <button onClick={() => setDashboardTab('builds')} className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-0.5 mt-0.5 cursor-pointer">
                          <span>Xem DRX Build</span>
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

                    {/* 4. CẤU HÌNH DRX BUILD */}
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
                        <span>Cấu Hình DRX Build</span>
                      </div>
                      <span className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-black tracking-wider ${
                        dashboardTab === 'builds'
                          ? 'bg-white/20 text-white'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
                      }`}>
                        DRX BUILD
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
                          {orders.map((order: any) => {
                            const orderDisplayCode = (() => {
                              let raw = String(order.orderCode || order.id || 'DRX-83921').toUpperCase();
                              raw = raw.replace(/^#/, '').replace(/^ORD-/, '');
                              if (raw.startsWith('DRX-')) return raw;
                              if (raw.startsWith('DRX')) return `DRX-${raw.slice(3)}`;
                              return `DRX-${raw.slice(-5)}`;
                            })();
                            const pDetails = typeof order.paymentDetails === 'object' && order.paymentDetails !== null
                              ? order.paymentDetails
                              : typeof order.paymentDetails === 'string'
                                ? (() => { try { return JSON.parse(order.paymentDetails); } catch(e) { return {}; } })()
                                : {};
                            const needInst = Boolean(pDetails.needInstallation);
                            const isProxy = Boolean(pDetails.isProxyRecipient);
                            const isPickup = order.deliveryType === 'STORE_PICKUP';

                            // Real-time Checklist steps completed
                            const checks = [
                              { key: 'check_called', label: '1. Gọi xác nhận đơn', done: Boolean(pDetails.check_called) },
                              { key: 'check_assembled', label: '2. Kiểm tra & Ráp máy', done: Boolean(pDetails.check_assembled) },
                              { key: 'check_packed', label: '3. Đóng gói 3 lớp xốp', done: Boolean(pDetails.check_packed) },
                              { key: 'check_handed_over', label: '4. Bàn giao vận chuyển', done: Boolean(pDetails.check_handed_over) },
                              { key: 'check_collected_cod', label: '5. Đã giao & Thu tiền', done: Boolean(pDetails.check_collected_cod) || order.paymentStatus === 'PAID' },
                            ];
                            const checksDoneCount = checks.filter(c => c.done).length;

                            // Items in order
                            const itemsList = (order.orderItems && order.orderItems.length > 0)
                              ? order.orderItems.map((oi: any) => ({
                                  name: oi.product?.name || 'Linh kiện DRX',
                                  coverImage: oi.product?.coverImage,
                                  price: oi.price,
                                  quantity: oi.quantity || 1,
                                }))
                              : (pDetails.items && Array.isArray(pDetails.items))
                              ? pDetails.items
                              : [];

                            return (
                              <div key={order.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-4 shadow-xs">
                                {/* CARD HEADER */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-mono font-black text-[#0284c7]">
                                      MÃ ĐƠN: #{orderDisplayCode}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">
                                      • Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Mới'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="text-xs sm:text-sm font-black font-heading text-rose-600 dark:text-rose-400">
                                      {formatCurrency(order.netAmount || order.totalAmount)}
                                    </span>
                                    {/* DYNAMIC STATUS BADGE */}
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                      order.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' :
                                      order.status === 'SHIPPING' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800' :
                                      order.status === 'CONFIRMED' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800' :
                                      order.status === 'CANCELLED' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800' :
                                      'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                    }`}>
                                      {order.status === 'COMPLETED' ? '✓ Giao Thành Công' :
                                       order.status === 'SHIPPING' ? '🚚 Đang Giao Hàng' :
                                       order.status === 'CONFIRMED' ? '🛠️ Đang Lắp Ráp & Chuẩn Bị' :
                                       order.status === 'CANCELLED' ? '✕ Đã Hủy Đơn' :
                                       '⏳ Chờ DRX Xác Nhận'}
                                    </span>
                                  </div>
                                </div>

                                {/* CANCELLATION NOTICE IF CANCELLED */}
                                {order.status === 'CANCELLED' && (
                                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300">
                                    <span className="font-black uppercase text-[10.5px] block">ĐƠN HÀNG ĐÃ HỦY:</span>
                                    <p className="text-[11px] opacity-90 mt-0.5">
                                      {pDetails.cancellationReason || 'Đơn hàng đã được hủy bởi cửa hàng hoặc khách hàng.'}
                                    </p>
                                  </div>
                                )}

                                {/* OPERATIONAL CHECKLIST PROGRESS (SYNCED REAL-TIME WITH ADMIN & STAFF) */}
                                {order.status !== 'CANCELLED' && (
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-sky-100 dark:border-slate-800 space-y-2">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                      <PackageCheck className="w-3.5 h-3.5 text-[#0284c7]" />
                                      <span>Tiến Độ Vận Hành Của Kỹ Thuật Viên:</span>
                                    </span>
                                    <span className="font-mono font-black text-[#0284c7]">{checksDoneCount}/5 Bước</span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[9.5px]">
                                    {checks.map((chk) => (
                                      <div 
                                        key={chk.key} 
                                        className={`p-1.5 rounded-lg border text-center font-bold flex items-center justify-center gap-1 ${
                                          chk.done 
                                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' 
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                        }`}
                                      >
                                        {chk.done ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />}
                                        <span className="truncate">{chk.label}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                )}

                                {/* ITEMS LIST */}
                                {itemsList.length > 0 && (
                                  <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                      Linh Kiện Trong Đơn ({itemsList.length}):
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {itemsList.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                          <img
                                            src={item.coverImage || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200'}
                                            alt={item.name}
                                            className="h-10 w-12 object-contain rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                                          />
                                          <div className="min-w-0 flex-1">
                                            <h5 className="font-heading text-xs font-black text-slate-900 dark:text-white truncate">
                                              {item.name}
                                            </h5>
                                            <span className="text-[10px] text-slate-500 block">
                                              SL: {item.quantity || 1} x {formatCurrency(item.price)}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* DELIVERY & SPECIAL REQUESTS FOOTER */}
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                                  <div className="space-y-0.5 min-w-0">
                                    <p className="truncate">
                                      <strong>Giao nhận:</strong> {isPickup ? '🏬 Nhận tại Showroom DRX' : `🚚 ${order.shippingAddress || 'Giao tận nơi'}`}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                                      {needInst && <span className="text-sky-600 dark:text-sky-400 font-bold">🛠️ Đã đăng ký lắp ráp PC</span>}
                                      {isProxy && <span className="text-purple-600 dark:text-purple-400 font-bold">👥 Nhận thay: {pDetails.proxyName}</span>}
                                    </div>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[11px] border border-amber-200 dark:border-amber-800">
                                      💵 COD: {formatCurrency(order.netAmount || order.totalAmount)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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

                  {/* TAB 4: CẤU HÌNH DRX BUILD */}
                  {dashboardTab === 'builds' && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                          <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-amber-500" />
                            <span>CẤU HÌNH DRX BUILD ĐÃ LƯU</span>
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-0.5">
                            Quản lý các bộ cấu hình PC bạn đã tự phối linh kiện trên công cụ DRX Build.
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
                            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Chưa có cấu hình DRX Build nào được lưu</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-light max-w-sm leading-relaxed mx-auto">
                              Tự tay lựa chọn CPU, VGA, Mainboard, RAM và kiểm tra tương thích tự động với công cụ DRX Build!
                            </p>
                          </div>
                          <Link
                            href="/pc-builder"
                            className="uiverse-btn-shimmer inline-flex items-center gap-2 rounded-2xl text-white px-6 py-3 text-xs font-heading font-black uppercase tracking-wider shadow-lg"
                          >
                            <Zap className="h-4 w-4 text-amber-300" />
                            <span>Tự Xây Dựng Cấu Hình DRX Build Ngay</span>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {savedBuilds.map((build: any, bIdx: number) => {
                            const items = build.items || [];
                            const dateStr = build.savedAt 
                              ? new Date(build.savedAt).toLocaleDateString('vi-VN', {
                                  day: '2-digit', month: '2-digit', year: 'numeric'
                                })
                              : 'Vừa lưu';

                            return (
                              <div 
                                key={build.id || bIdx} 
                                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-5 sm:p-6 space-y-4 shadow-2xs hover:border-sky-300 dark:hover:border-slate-700 transition-all"
                              >
                                {/* Header of Saved Build Card */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3.5">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white">
                                        {build.name || `Cấu hình PC #${bIdx + 1}`}
                                      </h4>
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-100 text-[#0284c7] dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                        {items.length || build.itemCount || 0} Linh Kiện
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                      Ngày lưu: {dateStr} {build.note ? `• ${build.note}` : ''}
                                    </p>
                                  </div>

                                  <div className="text-left sm:text-right">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng giá trị:</span>
                                    <span className="font-heading text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">
                                      {formatCurrency(build.totalPrice || 0)}
                                    </span>
                                  </div>
                                </div>

                                {/* Items mini-grid */}
                                {items.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    {items.map((it: any, itIdx: number) => {
                                      const p = it.product;
                                      if (!p) return null;
                                      return (
                                        <div 
                                          key={itIdx} 
                                          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-2xs"
                                        >
                                          <img 
                                            src={p.coverImage || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=100'} 
                                            alt={p.name}
                                            className="w-10 h-10 rounded-xl object-contain bg-slate-50 dark:bg-slate-950 p-1 shrink-0 border border-slate-100 dark:border-slate-800"
                                          />
                                          <div className="min-w-0 flex-1">
                                            <span className="text-[9px] font-black uppercase text-[#0284c7] block">
                                              {it.category || p.category}
                                            </span>
                                            <h5 className="font-heading text-[11px] font-bold text-slate-900 dark:text-white truncate" title={p.name}>
                                              {p.name}
                                            </h5>
                                            <span className="text-[10px] font-mono text-slate-500 block">
                                              {formatCurrency(p.discountPrice || p.price)}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                                  <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Link
                                      href={`/pc-builder?loadBuildId=${build.id}`}
                                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-[#0284c7] dark:text-sky-300 hover:bg-sky-100 text-xs font-heading font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-sky-200 dark:border-sky-800 transition-all cursor-pointer"
                                    >
                                      <Wrench className="w-3.5 h-3.5" />
                                      <span>Tải Vào PC Builder</span>
                                    </Link>

                                    <button
                                      type="button"
                                      onClick={() => handleBuySavedBuild(build)}
                                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-heading font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                                    >
                                      <ShoppingCart className="w-3.5 h-3.5" />
                                      <span>Mua Toàn Bộ</span>
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSavedBuild(build.id)}
                                    className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0"
                                    title="Xóa cấu hình này"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Xóa cấu hình</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
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
                              onChange={(e) => {
                                isFormDirtyRef.current = true;
                                setProfileName(e.target.value);
                              }}
                              placeholder="Họ và tên khách hàng"
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Địa chỉ Email</label>
                              {isGoogleUser && (
                                <span className="inline-flex items-center gap-1.5 text-[9.5px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                                  <GoogleIcon className="w-3 h-3" />
                                  Tài khoản Google
                                </span>
                              )}
                            </div>
                            <input
                              type="email"
                              disabled
                              value={sanitizedEmail}
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 py-3 px-4 text-xs font-semibold text-slate-500 cursor-not-allowed"
                            />
                            <span className="text-[10px] text-slate-400">
                              {isGoogleUser
                                ? 'Được xác thực an toàn qua tài khoản Google của bạn.'
                                : 'Email được liên kết cố định với tài khoản.'}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Số điện thoại nhận hàng</label>
                            <input
                              type="tel"
                              value={profilePhone}
                              onChange={(e) => {
                                isFormDirtyRef.current = true;
                                setProfilePhone(e.target.value);
                              }}
                              placeholder="Ví dụ: 0908889999"
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                            />
                          </div>

                          {/* ĐỊA CHỈ GIAO HÀNG MẶC ĐỊNH (SAU SÁP NHẬP) */}
                          <div className="space-y-4 pt-2 bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-xl bg-sky-500/10 text-[#0284c7]">
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-heading text-xs font-black uppercase tracking-wide text-slate-900 dark:text-white block">
                                    Địa Chỉ Nhận Hàng Cụ Thể (Sau Sáp Nhập)
                                  </span>
                                  <span className="text-[10.5px] text-slate-400 block font-medium">
                                    Cập nhật theo địa giới hành chính sáp nhập mới nhất
                                  </span>
                                </div>
                              </div>
                              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto shadow-2xs">
                                <span className="text-[#0284c7] font-extrabold">Tỉnh/TP</span>
                                <span>&rarr;</span>
                                <span className="text-[#0284c7] font-extrabold">Quận/Huyện</span>
                                <span>&rarr;</span>
                                <span className="text-[#0284c7] font-extrabold">Phường/Xã</span>
                              </div>
                            </div>

                            {/* LƯỚI 2X2 THÔNG THOÁNG: 2 CỘT MỖI HÀNG, KHÔNG BỊ CHEN CHÚC */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                              {/* 1. TỈNH / THÀNH PHỐ */}
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                  <span>Tỉnh / Thành Phố <span className="text-rose-500">*</span></span>
                                  <span className="text-[10px] text-slate-400 font-normal">63 Tỉnh/TP</span>
                                </label>
                                <ModernSelect
                                  options={provinceOptions}
                                  value={selectedProvinceId}
                                  onChange={handleProvinceChange}
                                  searchable={true}
                                  searchPlaceholder="Tìm Tỉnh / Thành phố..."
                                  placeholder="Chọn Tỉnh / Thành phố"
                                />
                              </div>

                              {/* 2. QUẬN / HUYỆN / TP */}
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                  <span>Quận / Huyện / TP <span className="text-rose-500">*</span></span>
                                  <span className="text-[10px] text-slate-400 font-normal">{districtOptions.length} khu vực</span>
                                </label>
                                <ModernSelect
                                  options={districtOptions}
                                  value={selectedDistrictId}
                                  onChange={handleDistrictChange}
                                  searchable={true}
                                  searchPlaceholder="Tìm Quận / Huyện / TP..."
                                  placeholder="Chọn Quận / Huyện"
                                />
                              </div>

                              {/* 3. PHƯỜNG / XÃ */}
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                  <span>Phường / Xã (Sau Sáp Nhập) <span className="text-rose-500">*</span></span>
                                  <span className="text-[10px] text-[#0284c7] font-semibold">{wardOptions.length} đơn vị</span>
                                </label>
                                <ModernSelect
                                  options={wardOptions}
                                  value={selectedWardName}
                                  onChange={handleWardChange}
                                  searchable={true}
                                  searchPlaceholder="Tìm Phường / Xã..."
                                  placeholder="Chọn Phường / Xã"
                                />
                              </div>

                              {/* 4. SỐ NHÀ, TÊN ĐƯỜNG CỤ THỂ */}
                              <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                  <span>Số Nhà, Tên Đường <span className="text-rose-500">*</span></span>
                                  <span className="text-[10px] text-slate-400 font-normal">Chi tiết</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ví dụ: Số 123 Đường Nguyễn Huệ, Tòa nhà Landmark 81..."
                                  value={streetAddress}
                                  onChange={(e) => handleStreetChange(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 shadow-2xs transition-all h-[42px]"
                                />
                              </div>
                            </div>

                            {/* PREVIEW ĐỊA CHỈ HOÀN CHỈNH */}
                            <div className="p-3.5 bg-gradient-to-br from-sky-50/90 via-white to-sky-50/50 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 rounded-2xl border border-sky-200/80 dark:border-slate-700 text-xs flex items-start gap-3 shadow-2xs">
                              <div className="p-2 rounded-xl bg-sky-500/10 text-[#0284c7] shrink-0 mt-0.5 border border-sky-200/50 dark:border-sky-900/50">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0284c7]">
                                    ĐỊA CHỈ GIAO HÀNG MẶC ĐỊNH
                                  </span>
                                  {profileAddress && (
                                    <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                      Đã cập nhật
                                    </span>
                                  )}
                                </div>
                                <p className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-relaxed break-words">
                                  {profileAddress || 'Vui lòng chọn thông tin để hoàn tất địa chỉ'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isUpdatingProfile}
                            className="uiverse-btn-shimmer inline-flex items-center gap-2 rounded-2xl text-white px-6 py-3 text-xs font-heading font-black uppercase tracking-wider shadow-lg cursor-pointer disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />
                            <span>{isUpdatingProfile ? 'Đang lưu thông tin...' : 'Lưu Thông Tin Cá Nhân'}</span>
                          </button>
                        </form>
                      </div>

                      {/* CARD 2: ĐỔI MẬT KHẨU (CHỈ HIỂN THỊ KHI ĐĂNG NHẬP BẰNG TÀI KHOẢN EMAIL, ẨN KHI ĐĂNG NHẬP GOOGLE) */}
                      {!isGoogleUser && (
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
                              <div className="relative">
                                <input
                                  type={showCurrentPassword ? 'text' : 'password'}
                                  required
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  placeholder="••••••••"
                                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-4 pr-11 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                >
                                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Mật khẩu mới</label>
                              <div className="relative">
                                <input
                                  type={showNewPassword ? 'text' : 'password'}
                                  required
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="Tối thiểu 6 ký tự"
                                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-4 pr-11 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Xác nhận mật khẩu mới</label>
                              <div className="relative">
                                <input
                                  type={showConfirmNewPassword ? 'text' : 'password'}
                                  required
                                  value={confirmNewPassword}
                                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                                  placeholder="Nhập lại mật khẩu mới"
                                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-4 pr-11 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:border-[#0284c7] focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                >
                                  {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={isChangingPassword}
                              className="uiverse-btn-shimmer inline-flex items-center gap-2 rounded-2xl text-white px-6 py-3 text-xs font-heading font-black uppercase tracking-wider shadow-lg cursor-pointer disabled:opacity-50"
                            >
                              <Lock className="h-4 w-4" />
                              <span>{isChangingPassword ? 'Đang cập nhật mật khẩu...' : 'Cập Nhật Mật Khẩu'}</span>
                            </button>
                          </form>
                        </div>
                      )}

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
