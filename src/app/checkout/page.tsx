'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, ArrowLeft, ShieldCheck, CheckCircle2, 
  Zap, Copy, Building2, CreditCard, Lock, Sparkles,
  Calculator, Truck, BadgePercent, Check, PackageCheck
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { showToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { UiverseRadio } from '@/components/uiverse/UiverseRadio';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, coupon, getDiscountAmount, getNetAmount, clearCart } = useCart();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const netAmount = getNetAmount();

  // Payment method state: COD, Direct Bank Transfer (No QR), or HD SAISON Installment
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER' | 'HD_SAISON'>('COD');

  // HD SAISON Installment States
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 10, 20, 30, 50
  const [installmentTerm, setInstallmentTerm] = useState<number>(12); // 6, 9, 12, 18
  const [interestRateType, setInterestRateType] = useState<'ZERO' | 'STANDARD'>('ZERO'); // 0% vs 1.49%/month

  // Real-time HD SAISON calculations
  const downPaymentAmount = useMemo(() => Math.round(netAmount * (downPaymentPercent / 100)), [netAmount, downPaymentPercent]);
  const remainingLoanAmount = useMemo(() => netAmount - downPaymentAmount, [netAmount, downPaymentAmount]);
  const monthlyInterestFee = useMemo(() => interestRateType === 'ZERO' ? 0 : Math.round(remainingLoanAmount * 0.0149), [remainingLoanAmount, interestRateType]);
  const monthlyPaymentAmount = useMemo(() => Math.round(remainingLoanAmount / installmentTerm) + monthlyInterestFee, [remainingLoanAmount, installmentTerm, monthlyInterestFee]);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string>('');

  useEffect(() => {
    import('@/lib/auth-client').then(({ getStoredSessionUser }) => {
      const u = getStoredSessionUser();
      if (u) {
        setCurrentUser(u);
      }
    });

    const randomOrd = 'DRX' + Math.floor(100000 + Math.random() * 900000);
    setOrderCode(randomOrd);
  }, []);

  const transferMemo = useMemo(() => {
    return `${orderCode}`;
  }, [orderCode]);

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Đã sao chép ${fieldName}!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle Order Completion
  const handleProcessPayment = async () => {
    if (cartItems.length === 0) {
      showToast('Giỏ hàng của bạn đang trống!', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Call Backend API to process order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          cartItems,
          netAmount,
          paymentMethod
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi xử lý đơn hàng từ server');
      }

      // 2. Push Admin Notification via API
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.order?.id,
            customerId: currentUser?.id,
            customerName: currentUser?.name || currentUser?.email || 'Khách hàng',
            paymentMethod,
            productNames: cartItems.map(i => i.name).join(', ')
          })
        });
      } catch (e) {
        console.error('Lỗi khi gửi thông báo cho Admin:', e);
      }

      // 3. Clear cart & trigger completion state
      clearCart();
      setIsSuccess(true);
      showToast(`🎉 Đặt hàng thành công! Mã đơn: ${data.order?.id?.slice(0, 8) || orderCode}`, 'success');
      
      // Auto redirect to orders tab after 3s
      setTimeout(() => {
        router.push('/profile?tab=orders');
      }, 3000);
      
    } catch (err: any) {
      console.error('Lỗi khi tiến hành thanh toán:', err);
      showToast(err.message || 'Có lỗi xảy ra khi xử lý đơn hàng!', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-300">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0284c7] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại Cửa Hàng DRX Hardware</span>
          </Link>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-2xs">
            <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Thanh Toán Bảo Mật SSL 256-Bit</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Payment Methods & Order Items */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* PAYMENT METHOD SELECTOR */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <CreditCard className="h-4 w-4 text-[#0284c7]" />
                <span>Chọn Phương Thức Thanh Toán:</span>
              </h2>

              <div className="space-y-3">
                
                {/* Method 1: COD (Cash on Delivery) */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-2 border-[#0284c7] bg-sky-50/60 dark:bg-sky-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <UiverseRadio checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                    <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Thanh Toán Khi Nhận Hàng (COD)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">Phổ biến</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Kiểm tra tem niêm phong và linh kiện trước khi thanh toán tiền mặt hoặc chuyển khoản cho shipper.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] font-extrabold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                    🚚 Đồng Kiểm Tận Nơi
                  </span>
                </div>

                {/* Method 2: Direct Bank Transfer (No QR image) */}
                <div
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'border-2 border-[#0284c7] bg-sky-50/60 dark:bg-sky-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <UiverseRadio checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} />
                    <div className="p-2.5 rounded-xl bg-[#0284c7] text-white shadow-sm">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                        Chuyển Khoản Ngân Hàng Trực Tiếp
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Chuyển khoản vào số tài khoản MB Bank chính thức của DRX Hardware qua ứng dụng ngân hàng.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] font-extrabold px-3 py-1 rounded-full border bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800">
                    🏦 MB Bank 24/7
                  </span>
                </div>

                {/* Method 3: HD SAISON Installment */}
                <div className="space-y-3">
                  <div
                    onClick={() => setPaymentMethod('HD_SAISON')}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      paymentMethod === 'HD_SAISON'
                        ? 'border-2 border-[#0284c7] bg-sky-50/60 dark:bg-sky-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <UiverseRadio checked={paymentMethod === 'HD_SAISON'} onChange={() => setPaymentMethod('HD_SAISON')} />
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
                        <Calculator className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Mua Trả Góp 0% Qua HD SAISON</span>
                          <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase">Lãi 0% - 1.49%</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Tự chọn % trả trước &amp; số tháng trả góp linh hoạt. Duyệt hồ sơ nhanh chóng qua CCCD.
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] font-extrabold text-[#0284c7] bg-sky-100 dark:bg-sky-950 px-2.5 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                      Tự Tính Lãi Suất
                    </span>
                  </div>

                  {/* INTERACTIVE HD SAISON CALCULATOR WIDGET */}
                  {paymentMethod === 'HD_SAISON' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 space-y-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                          <BadgePercent className="h-4 w-4 text-[#0284c7]" />
                          <span>BẢNG TÍNH TRẢ GÓP HD SAISON</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          Duyệt 100% Căn Cước / CMND
                        </span>
                      </div>

                      {/* Down Payment Selector */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>1. CHỌN MỨC TRẢ TRƯỚC (%):</span>
                          <strong className="text-[#0284c7] font-black">{downPaymentPercent}% ({formatCurrency(downPaymentAmount)})</strong>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[10, 20, 30, 50].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setDownPaymentPercent(pct)}
                              className={`py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                                downPaymentPercent === pct
                                  ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm'
                                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Term Selector */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>2. CHỌN KỲ HẠN VAY (THÁNG):</span>
                          <strong className="text-emerald-600 font-black">{installmentTerm} Tháng</strong>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[6, 9, 12, 18].map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => setInstallmentTerm(term)}
                              className={`py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                                installmentTerm === term
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                              }`}
                            >
                              {term}T
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>
            </div>

            {/* ORDER ITEMS LIST */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-heading text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ShoppingBag className="h-4 w-4 text-[#0284c7]" />
                <span>Sản Phẩm Trong Đơn Hàng ({cartItems.length}):</span>
              </h2>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Giỏ hàng đang trống! Vui lòng chọn linh kiện hoặc cấu hình PC trước khi thanh toán.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cartItems.map((item) => {
                    const price = item.discountPrice ?? item.price;
                    return (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.coverImage}
                            alt={item.name}
                            className="h-12 w-16 object-cover rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-heading text-xs font-black uppercase text-slate-900 dark:text-white truncate">
                              {item.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-bold block">
                              Số lượng: {item.quantity} x {formatCurrency(price)}
                            </span>
                          </div>
                        </div>
                        <span className="font-heading text-xs font-black text-slate-900 dark:text-white shrink-0">
                          {formatCurrency(price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary & Confirmation Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden space-y-6">
              
              {/* Payment Summary Header */}
              <div className="bg-slate-950 -mx-6 -mt-6 p-5 text-white">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Mã Đơn Hàng:</span>
                  <span className="font-mono font-bold text-sky-400">{orderCode}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-extrabold">
                  <span>Tổng Cần Thanh Toán:</span>
                  <span className="text-xl text-amber-400 font-black">{formatCurrency(netAmount)}</span>
                </div>
              </div>

              {/* COD Mode Details */}
              {paymentMethod === 'COD' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black uppercase tracking-wider">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>GIAO HÀNG TẬN NHÀ &amp; THU TIỀN TẬN NƠI</span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Linh kiện máy tính sẽ được đóng gói cẩn thận 3 lớp (hộp carton + xốp chống sốc nguyên seal).
                    </p>
                    <div className="pt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Miễn phí đồng kiểm linh kiện cùng shipper</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Hình thức thanh toán:</span>
                      <span className="font-black text-slate-900 dark:text-white">Tiền mặt / Thẻ khi nhận hàng</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Phí giao hàng:</span>
                      <span className="font-bold text-emerald-600">MIỄN PHÍ TOÀN QUỐC</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full mt-4 py-4 rounded-2xl uiverse-btn-shimmer text-white font-heading font-black text-xs uppercase tracking-wider hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <PackageCheck className="h-4 w-4 text-amber-300" />
                    <span>Xác Nhận Đặt Hàng (COD)</span>
                  </button>
                </div>
              )}

              {/* BANK TRANSFER (NO QR CODE - DIRECT TEXT INFO ONLY) */}
              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-xs space-y-1">
                    <span className="font-black uppercase text-[#0284c7] block">
                      THÔNG TIN TÀI KHOẢN NGÂN HÀNG DRX HARDWARE
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Quý khách vui lòng chuyển khoản theo thông tin dưới đây bằng ứng dụng ngân hàng của bạn.
                    </p>
                  </div>

                  {/* Text Details with 1-Click Copy */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Ngân Hàng:</span>
                      <span className="font-black text-slate-900 dark:text-white">MB BANK (Ngân Hàng Quân Đội)</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Số Tài Khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#0284c7] text-sm">0399224729</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('0399224729', 'Số tài khoản')}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-sky-100 text-[#0284c7] border border-slate-200 dark:border-slate-700 cursor-pointer"
                          title="Sao chép số tài khoản"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Chủ Tài Khoản:</span>
                      <span className="font-black text-slate-900 dark:text-white uppercase">VO BAO LAN</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Số Tiền:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-600 dark:text-amber-400">{formatCurrency(netAmount)}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(String(netAmount), 'Số tiền')}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-sky-100 text-[#0284c7] border border-slate-200 dark:border-slate-700 cursor-pointer"
                          title="Sao chép số tiền"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/60 dark:to-slate-900 border border-sky-200 dark:border-sky-800 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-black text-[#0284c7] uppercase tracking-wider">Cú Pháp Chuyển Khoản</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-wider">
                          {transferMemo}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(transferMemo, 'Nội dung chuyển khoản')}
                        className="px-3.5 py-2 rounded-xl bg-[#0284c7] hover:bg-sky-700 text-white text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{copiedField === 'Nội dung chuyển khoản' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full mt-4 py-4 rounded-2xl uiverse-btn-shimmer text-white font-heading font-black text-xs uppercase tracking-wider hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4 text-amber-300 fill-amber-300 animate-bounce" />
                    <span>Tôi Đã Chuyển Khoản Xong</span>
                  </button>
                </div>
              )}

              {/* HD SAISON Mode Details */}
              {paymentMethod === 'HD_SAISON' && (
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
                    <span className="font-black uppercase text-amber-800 dark:text-amber-300 block">
                      TÓM TẮT HỢP ĐỒNG TRẢ GÓP HD SAISON
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Tiền trả trước: <strong className="text-amber-600">{formatCurrency(downPaymentAmount)}</strong> ({downPaymentPercent}%)
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Số tiền trả góp mỗi tháng: <strong className="text-emerald-600">{formatCurrency(monthlyPaymentAmount)}/tháng</strong> (Kỳ hạn {installmentTerm}T)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-2xl uiverse-btn-shimmer text-white font-heading font-black text-xs uppercase tracking-wider hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Calculator className="h-4 w-4 text-amber-300" />
                    <span>Xác Nhận Đăng Ký Trả Góp HD SAISON</span>
                  </button>
                </div>
              )}

              {/* Order Success Overlay */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center z-30"
                  >
                    <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-lg">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">ĐẶT HÀNG THÀNH CÔNG!</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                      Đơn hàng <strong className="text-[#0284c7]">{orderCode}</strong> đã được ghi nhận hoàn tất. Kỹ thuật viên DRX Hardware sẽ liên hệ đóng gói và bàn giao linh kiện sớm nhất!
                    </p>

                    <div className="mt-6 flex items-center gap-3 w-full max-w-xs">
                      <Link
                        href="/profile?tab=orders"
                        className="flex-1 py-3 rounded-2xl bg-[#0284c7] text-white text-xs font-bold hover:bg-sky-700 transition-colors text-center shadow-sm"
                      >
                        Đơn Hàng Của Tôi
                      </Link>
                      <Link
                        href="/"
                        className="flex-1 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
                      >
                        Về Trang Chủ
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
