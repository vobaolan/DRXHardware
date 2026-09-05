'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, 
  Truck, Building2, Wrench, UserCheck, MessageSquare, 
  Trash2, Plus, Minus, DollarSign, Check, Sparkles,
  PackageCheck, User, MapPin
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { showToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { VIETNAM_PROVINCES, parseFullAddress } from '@/lib/vietnamLocations';
import { ModernSelect } from '@/components/ui/ModernSelect';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, coupon, getDiscountAmount, getNetAmount, clearCart } = useCart();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 3-Step Checkout State: 1 = Check Giỏ Hàng, 2 = Thông Tin Giao Hàng, 3 = Xác Nhận Đơn Hàng
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State for Step 2
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    fulfillmentMethod: 'DELIVERY' as 'DELIVERY' | 'STORE_PICKUP',
    shippingMethod: 'STANDARD' as const,
    // 3 Special Requests:
    needInstallation: false,
    isProxyRecipient: false,
    proxyName: '',
    proxyPhone: '',
    technicalNotes: '',
  });

  // Vietnam Administrative Locations State
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('hcm');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('hcm_thu_duc');
  const [selectedWardName, setSelectedWardName] = useState<string>('Phường Thảo Điền');
  const [streetAddress, setStreetAddress] = useState<string>('');

  const currentProvince = useMemo(() => {
    return VIETNAM_PROVINCES.find(p => p.id === selectedProvinceId) || VIETNAM_PROVINCES[0];
  }, [selectedProvinceId]);

  const currentDistrict = useMemo(() => {
    return currentProvince.districts.find(d => d.id === selectedDistrictId) || currentProvince.districts[0];
  }, [currentProvince, selectedDistrictId]);

  const wardsList = useMemo(() => {
    return currentDistrict?.wards || [];
  }, [currentDistrict]);

  const provinceOptions = useMemo(() => {
    return VIETNAM_PROVINCES.map((prov) => ({
      value: prov.id,
      label: prov.name,
    }));
  }, []);

  const districtOptions = useMemo(() => {
    return (currentProvince?.districts || []).map((dist) => ({
      value: dist.id,
      label: dist.name,
    }));
  }, [currentProvince]);

  const wardOptions = useMemo(() => {
    return (wardsList || []).map((ward) => ({
      value: ward,
      label: ward,
    }));
  }, [wardsList]);

  // Guards against background verifications overwriting active checkout edits
  const isAddressDirtyRef = useRef(false);
  const hasLoadedAddressRef = useRef(false);

  const handleProvinceChange = (provId: string) => {
    isAddressDirtyRef.current = true;
    setSelectedProvinceId(provId);
    const prov = VIETNAM_PROVINCES.find(p => p.id === provId) || VIETNAM_PROVINCES[0];
    const firstDist = prov.districts[0];
    setSelectedDistrictId(firstDist?.id || '');
    setSelectedWardName(firstDist?.wards[0] || '');
  };

  const handleDistrictChange = (distId: string) => {
    isAddressDirtyRef.current = true;
    setSelectedDistrictId(distId);
    const dist = currentProvince.districts.find(d => d.id === distId) || currentProvince.districts[0];
    setSelectedWardName(dist?.wards[0] || '');
  };

  const handleWardChange = (ward: string) => {
    isAddressDirtyRef.current = true;
    setSelectedWardName(ward);
  };

  const handleStreetChange = (street: string) => {
    isAddressDirtyRef.current = true;
    setStreetAddress(street);
  };

  // Sync with shippingInfo.address whenever province, district, ward, or streetAddress changes
  useEffect(() => {
    if (shippingInfo.fulfillmentMethod === 'DELIVERY') {
      const parts: string[] = [];
      if (streetAddress.trim()) parts.push(streetAddress.trim());
      if (selectedWardName) parts.push(selectedWardName);
      if (currentDistrict?.name) parts.push(currentDistrict.name);
      if (currentProvince?.name) parts.push(currentProvince.name);

      const computed = parts.join(', ');
      setShippingInfo(prev => ({ ...prev, address: computed }));
    }
  }, [streetAddress, selectedWardName, currentDistrict, currentProvince, shippingInfo.fulfillmentMethod]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const netAmount = getNetAmount();
  const discountAmount = getDiscountAmount();
  const subtotal = cartItems.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);

  // Load Logged in User info if available (auto-fill from profile default address)
  useEffect(() => {
    import('@/lib/auth-client').then(({ getStoredSessionUser, verifyCurrentSession }) => {
      const applyUser = (u: any) => {
        if (!u) return;
        setCurrentUser(u);
        setShippingInfo(prev => ({
          ...prev,
          name: prev.name || u.name || '',
          phone: prev.phone || u.phone || '',
          email: prev.email || u.email || '',
        }));
        if (u.address && !isAddressDirtyRef.current && !hasLoadedAddressRef.current) {
          const parsed = parseFullAddress(u.address);
          setSelectedProvinceId(parsed.provinceId);
          setSelectedDistrictId(parsed.districtId);
          setSelectedWardName(parsed.wardName);
          setStreetAddress(parsed.street);
          hasLoadedAddressRef.current = true;
        }
      };

      const sessionUser = getStoredSessionUser();
      if (sessionUser) {
        applyUser(sessionUser);
      }
      verifyCurrentSession().then((verified) => {
        if (verified) {
          applyUser(verified);
        }
      });
    });
  }, []);

  const formatCurrency = (val: number) => {
    return Number(val || 0).toLocaleString('vi-VN') + ' đ';
  };

  // Step 1 Validation & Proceed
  const handleProceedToStep2 = () => {
    if (cartItems.length === 0) {
      showToast('Giỏ hàng của bạn đang trống!', 'error');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Validation & Proceed
  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingInfo.name.trim()) {
      showToast('Vui lòng nhập Họ và tên người nhận!', 'error');
      return;
    }
    if (!shippingInfo.phone.trim()) {
      showToast('Vui lòng nhập Số điện thoại nhận hàng!', 'error');
      return;
    }
    if (shippingInfo.fulfillmentMethod === 'DELIVERY' && !shippingInfo.address.trim()) {
      showToast('Vui lòng nhập Địa chỉ nhận hàng!', 'error');
      return;
    }
    if (shippingInfo.isProxyRecipient) {
      if (!shippingInfo.proxyName.trim() || !shippingInfo.proxyPhone.trim()) {
        showToast('Vui lòng nhập đầy đủ Tên và SĐT người nhận thay!', 'error');
        return;
      }
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 Confirm Order & Submit COD Order
  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      showToast('Giỏ hàng đang trống!', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || null,
          customerName: shippingInfo.name,
          customerPhone: shippingInfo.phone,
          customerEmail: shippingInfo.email || currentUser?.email || null,
          shippingAddress: shippingInfo.fulfillmentMethod === 'STORE_PICKUP'
            ? 'Nhận tại Showroom DRX Hardware (Showroom Q.10, TP. Hồ Chí Minh)'
            : shippingInfo.address,
          deliveryType: shippingInfo.fulfillmentMethod,
          shippingMethod: 'STANDARD',
          needInstallation: shippingInfo.needInstallation,
          isProxyRecipient: shippingInfo.isProxyRecipient,
          proxyName: shippingInfo.proxyName,
          proxyPhone: shippingInfo.proxyPhone,
          technicalNotes: shippingInfo.technicalNotes,
          cartItems,
          couponCode: coupon?.code || null,
          totalAmount: subtotal,
          discountAmount: discountAmount,
          netAmount: netAmount,
          paymentMethod: 'COD',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi tạo đơn hàng');
      }

      setCreatedOrder(data.order);
      clearCart();
      showToast('Đặt hàng thành công! DRX Hardware đã ghi nhận đơn hàng.', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error('Lỗi đặt hàng:', err);
      showToast(err.message || 'Lỗi khi xử lý đơn hàng. Vui lòng thử lại!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (createdOrder) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col antialiased">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl space-y-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 inline-block">
                ĐẶT HÀNG THÀNH CÔNG
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Cảm Ơn Quý Khách Đã Mua Sắm Tại DRX Hardware!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                Mã đơn hàng của bạn là <strong className="text-slate-900 dark:text-white font-mono">{createdOrder.orderCode}</strong>. Nhân viên kỹ thuật DRX sẽ gọi điện thoại xác nhận và chuẩn bị linh kiện ngay.
              </p>
            </div>

            {/* ORDER DETAILS SUMMARY */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 text-left text-xs space-y-3 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="text-slate-500 font-bold">Mã Đơn Hàng:</span>
                <span className="font-mono font-black text-[#0284c7]">{createdOrder.orderCode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="text-slate-500 font-bold">Người Nhận:</span>
                <span className="font-bold text-slate-900 dark:text-white">{createdOrder.customerName} ({createdOrder.customerPhone})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="text-slate-500 font-bold">Hình thức nhận:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {createdOrder.deliveryType === 'STORE_PICKUP' ? '🏬 Nhận tại Showroom DRX' : '🚚 Giao hàng tận nơi'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="text-slate-500 font-bold">Địa chỉ giao:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 max-w-xs text-right truncate">{createdOrder.shippingAddress}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                <span className="text-slate-500 font-bold">Hình thức thanh toán:</span>
                <span className="font-extrabold text-amber-600">💵 COD - Thu tiền khi nhận hàng</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black">
                <span className="text-slate-900 dark:text-white">Tổng tiền cần thanh toán:</span>
                <span className="text-rose-600 dark:text-rose-400 font-mono text-base">{formatCurrency(createdOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer text-center"
              >
                Tiếp Tục Mua Sắm
              </Link>
              <Link
                href="/profile"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Xem Lịch Sử Đơn Hàng
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col antialiased">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* BACK BUTTON */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider transition-colors">
            <ArrowLeft className="h-4 w-4 text-[#0284c7]" /> Về Cửa Hàng DRX
          </Link>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3-STEP PROGRESS STEPPER HEADER
           ───────────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 mb-8 shadow-xs">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
            
            {/* Step 1: Check Giỏ Hàng */}
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl transition-all text-left ${
                currentStep === 1
                  ? 'bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800'
                  : currentStep > 1
                  ? 'opacity-85 hover:opacity-100 cursor-pointer'
                  : 'opacity-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                currentStep === 1
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : currentStep > 1
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Bước 1</span>
                <span className={`text-xs font-extrabold block truncate ${currentStep === 1 ? 'text-[#0284c7] dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'}`}>
                  Kiểm Tra Giỏ Hàng
                </span>
              </div>
            </button>

            {/* Step 2: Thông Tin Giao Hàng */}
            <button
              onClick={() => {
                if (cartItems.length > 0) setCurrentStep(2);
              }}
              disabled={cartItems.length === 0}
              className={`flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl transition-all text-left ${
                currentStep === 2
                  ? 'bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800'
                  : currentStep > 2
                  ? 'opacity-85 hover:opacity-100 cursor-pointer'
                  : 'opacity-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                currentStep === 2
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : currentStep > 2
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Bước 2</span>
                <span className={`text-xs font-extrabold block truncate ${currentStep === 2 ? 'text-[#0284c7] dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'}`}>
                  Thông Tin Giao Hàng
                </span>
              </div>
            </button>

            {/* Step 3: Xác Nhận & COD */}
            <div
              className={`flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl transition-all text-left ${
                currentStep === 3
                  ? 'bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800'
                  : 'opacity-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                currentStep === 3
                  ? 'bg-[#0284c7] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                3
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Bước 3</span>
                <span className={`text-xs font-extrabold block truncate ${currentStep === 3 ? 'text-[#0284c7] dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'}`}>
                  Xác Nhận & Thanh Toán
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MAIN CONTENT AREA
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 8 COLS: ACTIVE STEP CONTENT */}
          <div className="lg:col-span-8 space-y-6">

            {/* ══════════════════════════════════════════════════════════
                BƯỚC 1: CHECK LẠI GIỎ HÀNG
               ══════════════════════════════════════════════════════════ */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] border border-sky-200 dark:border-sky-800">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-heading text-lg font-black uppercase text-slate-900 dark:text-white">
                        1. Kiểm Tra Lại Giỏ Hàng ({cartItems.length} Linh Kiện)
                      </h2>
                      <p className="text-xs text-slate-500">Xem lại số lượng, đơn giá và linh kiện trước khi nhập thông tin nhận hàng.</p>
                    </div>
                  </div>
                </div>

                {/* CART ITEMS LIST */}
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-2xl">
                      🛒
                    </div>
                    <p className="text-xs font-bold text-slate-400">Giỏ hàng của bạn đang trống!</p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284c7] text-white font-extrabold text-xs uppercase"
                    >
                      Duyệt Linh Kiện Ngay
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cartItems.map((item) => {
                      const itemPrice = item.discountPrice ?? item.price;
                      return (
                        <div key={item.id} className="py-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                          {/* Image */}
                          <div className="w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                            <img
                              src={item.coverImage || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80'}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-[200px]">
                            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                              {item.name}
                            </h3>
                            <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-bold block mt-0.5">
                              {formatCurrency(itemPrice)}
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black px-2 min-w-[24px] text-center font-mono text-slate-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right min-w-[100px]">
                            <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white block">
                              {formatCurrency(itemPrice * item.quantity)}
                            </span>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Xóa linh kiện"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* STEP 1 ACTION BUTTON */}
                {cartItems.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={handleProceedToStep2}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-sky-500/25 transition-all cursor-pointer"
                    >
                      <span>Tiếp Tục: Điền Thông Tin Giao Hàng</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════
                BƯỚC 2: THÔNG TIN GIAO HÀNG & YÊU CẦU ĐẶC BIỆT
               ══════════════════════════════════════════════════════════ */}
            {currentStep === 2 && (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleProceedToStep3}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8"
              >
                {/* SECTION 2.1: THÔNG TIN NGƯỜI NHẬN */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] border border-sky-200 dark:border-sky-800">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white">
                        2.1 Thông Tin Người Nhận Hàng
                      </h2>
                      <p className="text-[11px] text-slate-400">Tự động điền theo tài khoản, bạn có thể chỉnh sửa trực tiếp bên dưới.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* HỌ VÀ TÊN */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10.5px]">
                        Họ và Tên Người Nhận: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={shippingInfo.name}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>

                    {/* SỐ ĐIỆN THOẠI */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10.5px]">
                        Số Điện Thoại Nhận Hàng: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ví dụ: 0987654321"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>

                    {/* EMAIL (OPTIONAL) */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10.5px]">
                        Email Nhận Thông Báo Đơn Hàng (Tùy chọn):
                      </label>
                      <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2.2: HÌNH THỨC NHẬN HÀNG */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] border border-sky-200 dark:border-sky-800">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white">
                        2.2 Hình Thức Giao Nhận
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* GIAO HÀNG TẬN NƠI */}
                    <button
                      type="button"
                      onClick={() => setShippingInfo({ ...shippingInfo, fulfillmentMethod: 'DELIVERY' })}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        shippingInfo.fulfillmentMethod === 'DELIVERY'
                          ? 'border-[#0284c7] bg-sky-50/70 dark:bg-sky-950/50 ring-2 ring-[#0284c7]/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-heading text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#0284c7]" />
                          Giao Hàng Tận Nơi
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          shippingInfo.fulfillmentMethod === 'DELIVERY' ? 'border-[#0284c7] bg-[#0284c7]' : 'border-slate-300'
                        }`}>
                          {shippingInfo.fulfillmentMethod === 'DELIVERY' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                        Giao hàng đóng gói bảo hiểm 100% nguyên seal đến tận cửa nhà bạn.
                      </p>
                    </button>

                    {/* NHẬN TẠI SHOWROOM */}
                    <button
                      type="button"
                      onClick={() => setShippingInfo({ ...shippingInfo, fulfillmentMethod: 'STORE_PICKUP' })}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        shippingInfo.fulfillmentMethod === 'STORE_PICKUP'
                          ? 'border-[#0284c7] bg-sky-50/70 dark:bg-sky-950/50 ring-2 ring-[#0284c7]/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-heading text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#0284c7]" />
                          Nhận Tại Cửa Hàng
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          shippingInfo.fulfillmentMethod === 'STORE_PICKUP' ? 'border-[#0284c7] bg-[#0284c7]' : 'border-slate-300'
                        }`}>
                          {shippingInfo.fulfillmentMethod === 'STORE_PICKUP' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                        Showroom DRX Hardware (TP. Hồ Chí Minh). Hỗ trợ kiểm tra linh kiện và ráp PC tại chỗ.
                      </p>
                    </button>
                  </div>

                  {/* ĐỊA CHỈ NHẬN HÀNG NẾU CHỌN GIAO TẬN NƠI */}
                  {shippingInfo.fulfillmentMethod === 'DELIVERY' && (
                    <div className="space-y-4 pt-2 bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      {/* Tiêu đề & luồng chọn */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-xl bg-sky-500/10 text-[#0284c7]">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-heading text-xs font-black uppercase tracking-wide text-slate-900 dark:text-white block">
                              Địa Chỉ Nhận Hàng Cụ Thể <span className="text-rose-500">*</span>
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

                      {/* LƯỚI 2X2 THÔNG THOÁNG: 2 CỘT MỖI HÀNG TRÊN MÀN HÌNH TABLET/DESKTOP, KHÔNG BỊ CHEN CHÚC */}
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

                        {/* 2. QUẬN / HUYỆN / THỊ XÃ / TP TRỰC THUỘC */}
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

                        {/* 3. PHƯỜNG / XÃ (SAU SÁP NHẬP) */}
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
                            required={shippingInfo.fulfillmentMethod === 'DELIVERY'}
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
                              ĐỊA CHỈ GIAO HÀNG ĐÃ THIẾT LẬP
                            </span>
                            {shippingInfo.address && (
                              <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                Chính xác
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-relaxed break-words">
                            {shippingInfo.address || 'Vui lòng chọn Tỉnh/Quận/Phường và nhập số nhà để hoàn tất địa chỉ'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PHƯƠNG THỨC VẬN CHUYỂN: DUY NHẤT 1 VẬN CHUYỂN TIÊU CHUẨN */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PackageCheck className="w-4 h-4 text-[#0284c7]" />
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                          Phương thức: Vận Chuyển Tiêu Chuẩn (Standard Delivery)
                        </span>
                        <span className="text-[10.5px] text-slate-400">Thời gian giao: 1 - 3 ngày làm việc (Đóng gói thùng xốp chuyên dụng)</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Miễn Phí
                    </span>
                  </div>
                </div>

                {/* SECTION 2.3: YÊU CẦU ĐẶC BIỆT (3 MỤC) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] border border-sky-200 dark:border-sky-800">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white">
                        2.3 Dịch Vụ & Yêu Cầu Đặc Biệt
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* YÊU CẦU 1: HỖ TRỢ LẮP ĐẶT / CÀI ĐẶT */}
                    <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-sky-50/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={shippingInfo.needInstallation}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, needInstallation: e.target.checked })}
                        className="mt-0.5 rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7] cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-[#0284c7]" />
                          Tôi cần hỗ trợ lắp đặt / cài đặt
                        </span>
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                          Kỹ thuật viên DRX sẽ hỗ trợ lắp ráp linh kiện vào thùng máy, cài sẵn Windows/Driver và test nhiệt độ Full-load trước khi giao.
                        </p>
                      </div>
                    </label>

                    {/* YÊU CẦU 2: NHỜ NGƯỜI KHÁC NHẬN HÀNG */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shippingInfo.isProxyRecipient}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, isProxyRecipient: e.target.checked })}
                          className="rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7] cursor-pointer"
                        />
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#0284c7]" />
                          Nhờ người khác nhận hàng
                        </span>
                      </label>

                      {shippingInfo.isProxyRecipient && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pl-6 border-t border-slate-200/60 dark:border-slate-700/60">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
                              Họ và Tên Người Nhận Thay: <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required={shippingInfo.isProxyRecipient}
                              placeholder="Tên người nhận thay..."
                              value={shippingInfo.proxyName}
                              onChange={(e) => setShippingInfo({ ...shippingInfo, proxyName: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
                              Số Điện Thoại Người Nhận Thay: <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="tel"
                              required={shippingInfo.isProxyRecipient}
                              placeholder="SĐT người nhận thay..."
                              value={shippingInfo.proxyPhone}
                              onChange={(e) => setShippingInfo({ ...shippingInfo, proxyPhone: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* YÊU CẦU 3: GHI CHÚ ĐƠN HÀNG VÀ HỖ TRỢ KỸ THUẬT */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10.5px] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#0284c7]" />
                        Yêu Cầu Hỗ Trợ Kỹ Thuật & Ghi Chú Đơn Hàng:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ghi chú thêm giờ giao hàng, yêu cầu đóng thùng gỗ, bọc chống sốc hoặc lưu ý kỹ thuật..."
                        value={shippingInfo.technicalNotes}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, technicalNotes: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
                      />
                    </div>
                  </div>
                </div>

                {/* NAVIGATION BUTTONS */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay Lại Giỏ Hàng</span>
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-sky-500/25 transition-all cursor-pointer"
                  >
                    <span>Tiếp Tục: Xác Nhận Đơn Hàng</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* ══════════════════════════════════════════════════════════
                BƯỚC 3: XÁC NHẬN ĐƠN HÀNG & PHƯƠNG THỨC THANH TOÁN (COD)
               ══════════════════════════════════════════════════════════ */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8"
              >
                {/* 3.1 CHỌN PHƯƠNG THỨC THANH TOÁN (DUY NHẤT 1 LÀ COD) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white">
                        3.1 Phương Thức Thanh Toán
                      </h2>
                      <p className="text-[11px] text-slate-400">Hình thức thanh toán an toàn, kiểm tra hàng trước khi trả tiền.</p>
                    </div>
                  </div>

                  {/* COD OPTION CARD (DUY NHẤT 1) */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border-2 border-amber-500 ring-2 ring-amber-400/30 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                        💵
                      </div>
                      <div>
                        <span className="font-heading text-xs font-black uppercase text-slate-900 dark:text-white block">
                          COD - Thu Tiền Khi Nhận Hàng (Cash On Delivery)
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-normal mt-0.5 leading-relaxed">
                          Thanh toán bằng tiền mặt hoặc chuyển khoản trực tiếp cho nhân viên giao hàng khi nhận và kiểm tra linh kiện máy tính.
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      Khuyên Dùng
                    </span>
                  </div>
                </div>

                {/* 3.2 TỔNG HỢP CHI TIẾT ĐƠN HÀNG */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] border border-sky-200 dark:border-sky-800">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white">
                        3.2 Xác Nhận Thông Tin Đơn Hàng
                      </h2>
                    </div>
                  </div>

                  {/* SUMMARY BOX */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                    <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                      <span className="text-slate-500 font-bold">Người nhận hàng:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{shippingInfo.name}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                      <span className="text-slate-500 font-bold">Số điện thoại:</span>
                      <span className="font-extrabold font-mono text-slate-900 dark:text-white">{shippingInfo.phone}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                      <span className="text-slate-500 font-bold">Hình thức nhận hàng:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {shippingInfo.fulfillmentMethod === 'STORE_PICKUP' ? '🏬 Nhận tại Showroom DRX' : '🚚 Giao hàng tận nơi'}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                      <span className="text-slate-500 font-bold">Địa chỉ giao:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 max-w-xs text-right truncate">
                        {shippingInfo.fulfillmentMethod === 'STORE_PICKUP' ? 'Showroom DRX Hardware (TP. Hồ Chí Minh)' : shippingInfo.address}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                      <span className="text-slate-500 font-bold">Vận chuyển:</span>
                      <span className="font-extrabold text-emerald-600">Vận chuyển tiêu chuẩn (Miễn phí)</span>
                    </div>

                    {shippingInfo.needInstallation && (
                      <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2 text-[#0284c7]">
                        <span className="font-bold">Yêu cầu lắp ráp:</span>
                        <span className="font-extrabold">Hỗ trợ lắp đặt & test máy</span>
                      </div>
                    )}

                    {shippingInfo.isProxyRecipient && (
                      <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2 text-indigo-600 dark:text-indigo-400">
                        <span className="font-bold">Người nhận thay:</span>
                        <span className="font-extrabold">{shippingInfo.proxyName} ({shippingInfo.proxyPhone})</span>
                      </div>
                    )}

                    {shippingInfo.technicalNotes && (
                      <div className="border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                        <span className="text-slate-500 font-bold block mb-1">Ghi chú đơn hàng:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300 italic">{shippingInfo.technicalNotes}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-1 text-sm font-black">
                      <span className="text-slate-900 dark:text-white">Tổng tiền thu COD:</span>
                      <span className="text-rose-600 dark:text-rose-400 font-mono text-base">{formatCurrency(netAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* NAVIGATION BUTTONS */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Sửa Lại Thông Tin</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleConfirmOrder}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Đang Ghi Nhận Đơn Hàng...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Xác Nhận Đặt Hàng (COD)</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </div>

          {/* RIGHT 4 COLS: ORDER SUMMARY CARD (ALWAYS VISIBLE) */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs sticky top-24 space-y-6">
              <h3 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span>Tóm Tắt Đơn Hàng</span>
                <span className="text-xs font-mono font-bold text-[#0284c7]">{cartItems.length} Món</span>
              </h3>

              {/* MINI ITEMS LIST */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white block truncate">{item.name}</span>
                      <span className="text-[11px] text-slate-400">SL: {item.quantity}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      {formatCurrency((item.discountPrice ?? item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* PRICE BREAKDOWN */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Tạm tính linh kiện:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Giảm giá khuyến mãi:</span>
                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Phí vận chuyển:</span>
                  <span className="text-emerald-600 font-bold">Miễn Phí</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Phương thức:</span>
                  <span className="font-bold text-amber-600">COD (Thu tiền tận nơi)</span>
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-700 text-sm sm:text-base font-black">
                  <span className="text-slate-900 dark:text-white">Tổng cộng:</span>
                  <span className="text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(netAmount)}</span>
                </div>
              </div>

              {/* TRUST BADGE */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Bảo hành 36 Tháng chính hãng</span>
                </div>
                <p className="text-[10px] text-slate-400">Được quyền kiểm tra hàng, đối chiếu mã Serial trước khi thanh toán tiền mặt.</p>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
