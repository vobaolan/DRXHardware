'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, QrCode, Wallet, ArrowLeft, ShieldCheck, CheckCircle2, 
  Zap, Copy, Building2, CreditCard, User, Tag, Lock, Sparkles,
  Calculator, Percent, BadgePercent, Clock
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { showToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { UiverseRadio } from '@/components/uiverse/UiverseRadio';
import { UiverseCheckbox } from '@/components/uiverse/UiverseCheckbox';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, coupon, getDiscountAmount, getNetAmount, clearCart } = useCart();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const netAmount = getNetAmount();
  const userBalance = currentUser?.balance ? Number(currentUser.balance) : 0;
  const isBalanceEnough = userBalance >= netAmount;

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'VIETQR' | 'WALLET' | 'HD_SAISON' | 'DEPOSIT_WALLET'>('VIETQR');

  // HD SAISON Installment States
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 10, 20, 30, 50
  const [installmentTerm, setInstallmentTerm] = useState<number>(12); // 6, 9, 12, 18
  const [interestRateType, setInterestRateType] = useState<'ZERO' | 'STANDARD'>('ZERO'); // 0% vs 1.49%/month

  // Deposit Wallet State
  const [depositPercent, setDepositPercent] = useState<number>(10); // 10% or 20%

  // Real-time HD SAISON calculations
  const downPaymentAmount = useMemo(() => Math.round(netAmount * (downPaymentPercent / 100)), [netAmount, downPaymentPercent]);
  const remainingLoanAmount = useMemo(() => netAmount - downPaymentAmount, [netAmount, downPaymentAmount]);
  const monthlyInterestFee = useMemo(() => interestRateType === 'ZERO' ? 0 : Math.round(remainingLoanAmount * 0.0149), [remainingLoanAmount, interestRateType]);
  const monthlyPaymentAmount = useMemo(() => Math.round(remainingLoanAmount / installmentTerm) + monthlyInterestFee, [remainingLoanAmount, installmentTerm, monthlyInterestFee]);

  // Real-time Wallet Deposit calculations
  const depositRequiredAmount = useMemo(() => Math.round(netAmount * (depositPercent / 100)), [netAmount, depositPercent]);
  const depositRemainingOnDelivery = useMemo(() => netAmount - depositRequiredAmount, [netAmount, depositRequiredAmount]);
  const isDepositBalanceEnough = userBalance >= depositRequiredAmount;
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

  const vietQrUrl = useMemo(() => {
    return `https://img.vietqr.io/image/MB-0399224729-compact2.png?amount=${netAmount}&addInfo=${encodeURIComponent(transferMemo)}&accountName=VO%20BAO%20LAN`;
  }, [netAmount, transferMemo]);

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  // Dynamic delivery badge & instruction text for Hardware Store
  const deliveryBadgeInfo = useMemo(() => {
    return { 
      text: '🚚 Giao Hàng & Lắp Ráp Tận Nơi', 
      style: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      subtext: 'Mở App Ngân Hàng quét mã VietQR để thanh toán đơn hàng linh kiện chính hãng. Nhân viên DRX sẽ đóng gói nguyên seal & giao tận nơi!',
      buttonLabel: 'Xác Nhận Đặt Hàng & Giao Tận Nơi'
    };
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Đã sao chép ${fieldName}!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle Order Completion & Digital Key Distribution into Vault
  const handleProcessPayment = async () => {
    if (cartItems.length === 0) {
      showToast('Giỏ hàng của bạn đang trống!', 'error');
      return;
    }

    if (paymentMethod === 'WALLET' && !isBalanceEnough) {
      showToast('Số dư ví DRX không đủ để thanh toán đơn hàng này!', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Call Backend API to process order and deduct balance
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

      // 2. Update local state if paying with WALLET
      if (paymentMethod === 'WALLET') {
        const finalBal = userBalance - netAmount;
        const updatedUser = { ...currentUser, balance: finalBal };
        localStorage.setItem('ods_user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        window.dispatchEvent(new Event('ods_user_update'));
        window.dispatchEvent(new Event('storage'));
      }

      // 3. Push Admin Notification via API
      try {
        const hasGift = data.hasGift || cartItems.some(i => i.name.toLowerCase().includes('gift'));
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.order?.id,
            customerId: currentUser?.id,
            customerName: currentUser?.name || currentUser?.email || 'Khách hàng',
            isGift: hasGift,
            productNames: cartItems.map(i => i.name).join(', ')
          })
        });
      } catch (e) {
        console.error('Lỗi khi gửi thông báo cho Admin:', e);
      }

      // 4. Clear cart & trigger completion state
      clearCart();
      setIsSuccess(true);
      showToast(`🎉 Thanh toán thành công! Mã đơn: ${data.order?.id?.slice(0, 8) || orderCode}`, 'success');
      
      // Auto redirect to vault after 3s
      setTimeout(() => {
        router.push('/profile?tab=vault');
      }, 3000);
      
    } catch (err: any) {
      console.error('Lỗi khi tiến hành thanh toán:', err);
      showToast(err.message || 'Có lỗi xảy ra khi xử lý đơn hàng!', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col antialiased">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại Trang Chủ DRX Hardware</span>
          </Link>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full border border-emerald-200 text-xs font-bold shadow-2xs">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Thanh Toán Bảo Mật Chẩn SSL 256-Bit</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Payment Methods & Order Items */}
          <div className="lg:col-span-7 space-y-6">
            {/* Payment Method Selector Card */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
              <h2 className="text-base font-extrabold text-zinc-900 tracking-tight mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-sky-600" />
                <span>Chọn Phương Thức Thanh Toán:</span>
              </h2>

              <div className="space-y-3">
                {/* Method 1: VietQR Auto Pay */}
                <div
                  onClick={() => setPaymentMethod('VIETQR')}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    paymentMethod === 'VIETQR'
                      ? 'border-2 border-[#6EC2F7] bg-sky-50/80 ring-2 ring-sky-300/40 shadow-sm'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <UiverseRadio checked={paymentMethod === 'VIETQR'} onChange={() => setPaymentMethod('VIETQR')} />
                    <div className="p-2.5 rounded-lg bg-[#0284c7] text-white shadow-sm">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-900">Quét Mã VietQR Ngân Hàng Tự Động 24/7</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Thanh toán trực tiếp từ ứng dụng MB Bank, VCB, Momo, Zalopay...
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs ${deliveryBadgeInfo.style}`}>
                    {deliveryBadgeInfo.text}
                  </span>
                </div>

                {/* Method 2: Wallet Balance */}
                <div
                  onClick={() => setPaymentMethod('WALLET')}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    paymentMethod === 'WALLET'
                      ? 'border-2 border-[#6EC2F7] bg-sky-50/80 ring-2 ring-sky-300/40 shadow-sm'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <UiverseRadio checked={paymentMethod === 'WALLET'} onChange={() => setPaymentMethod('WALLET')} />
                    <div className="p-2.5 rounded-lg bg-amber-500 text-white shadow-sm">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-900 flex items-center gap-2">
                        <span>Số Dư Ví DRX Hardware</span>
                        <span className="text-amber-600 font-black">({formatCurrency(userBalance)})</span>
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Thanh toán tức thì 1-Click bằng số dư ví khả dụng của bạn
                      </p>
                    </div>
                  </div>
                  {isBalanceEnough ? (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                      Đủ Số Dư
                    </span>
                  ) : (
                    <Link
                      href="/deposit"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full hover:bg-rose-200 transition-colors"
                    >
                      Nạp Thêm
                    </Link>
                  )}
                </div>

                {/* Method 3: HD SAISON Installment Plan Calculator */}
                <div className="space-y-3">
                  <div
                    onClick={() => setPaymentMethod('HD_SAISON')}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      paymentMethod === 'HD_SAISON'
                        ? 'border-2 border-[#6EC2F7] bg-sky-50/90 ring-2 ring-sky-300/40 shadow-sm'
                        : 'border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <UiverseRadio checked={paymentMethod === 'HD_SAISON'} onChange={() => setPaymentMethod('HD_SAISON')} />
                      <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-600 to-[#0284c7] text-white shadow-sm">
                        <Calculator className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-zinc-900 flex items-center gap-2">
                          <span>Mua Trả Góp Qua HD SAISON / Tài Chính</span>
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">Lãi 0% - 1.49%</span>
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Tự chọn % trả trước & số tháng trả góp linh hoạt. Duyệt hồ sơ siêu tốc 15 phút!
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-[#0284c7] bg-sky-100 px-2.5 py-1 rounded-full border border-sky-200">
                      Tự Tính Lãi Suất
                    </span>
                  </div>

                  {/* INTERACTIVE HD SAISON CALCULATOR WIDGET */}
                  {paymentMethod === 'HD_SAISON' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-5 rounded-2xl bg-white border border-sky-200 space-y-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <span className="text-xs font-black uppercase text-zinc-900 flex items-center gap-1.5">
                          <BadgePercent className="h-4 w-4 text-[#0284c7]" />
                          <span>BẢNG TÍNH TRẢ GÓP HD SAISON REALTIME</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Duyệt 100% Căn Cước / CMND
                        </span>
                      </div>

                      {/* 1. Down Payment Selector */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-700 flex items-center justify-between">
                          <span>1. CHỌN MỨC TRẢ TRƯỚC (%):</span>
                          <strong className="text-[#0284c7] font-black">{downPaymentPercent}% ({formatCurrency(downPaymentAmount)})</strong>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[10, 20, 30, 50].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setDownPaymentPercent(pct)}
                              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                downPaymentPercent === pct
                                  ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm font-extrabold'
                                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Installment Term Selector */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-700 flex items-center justify-between">
                          <span>2. CHỌN KỲ HẠN VAY (THÁNG):</span>
                          <strong className="text-purple-600 font-black">{installmentTerm} Tháng</strong>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[6, 9, 12, 18].map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => setInstallmentTerm(term)}
                              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                installmentTerm === term
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm font-extrabold'
                                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                              }`}
                            >
                              {term}T
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Interest Rate Package Selector */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-700 block">3. GÓI LÃI SUẤT HÃNG:</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setInterestRateType('ZERO')}
                            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                              interestRateType === 'ZERO'
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-300'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                            }`}
                          >
                            <span className="text-xs font-black block">HD SAISON 0% Lãi Suất</span>
                            <span className="text-[10px] text-zinc-500 block">Dành cho sản phẩm ưu đãi hè</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInterestRateType('STANDARD')}
                            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                              interestRateType === 'STANDARD'
                                ? 'bg-sky-50 border-[#0284c7] text-sky-950 ring-1 ring-sky-300'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                            }`}
                          >
                            <span className="text-xs font-black block">Gói Lãi Suất 1.49%/tháng</span>
                            <span className="text-[10px] text-zinc-500 block">Duyệt hồ sơ nhanh 15 phút</span>
                          </button>
                        </div>
                      </div>

                      {/* REALTIME CALCULATION SUMMARY CARD */}
                      <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 font-sans shadow-inner">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">1. Số tiền trả trước ({downPaymentPercent}%):</span>
                          <span className="font-bold text-amber-400">{formatCurrency(downPaymentAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">2. Số tiền nợ còn lại:</span>
                          <span className="font-bold text-slate-200">{formatCurrency(remainingLoanAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">3. Phí lãi hàng tháng ({interestRateType === 'ZERO' ? '0%' : '1.49%'}):</span>
                          <span className="font-bold text-slate-200">{formatCurrency(monthlyInterestFee)}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-2.5 flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase text-sky-400">TIỀN GÓP MỖI THÁNG ({installmentTerm}T):</span>
                          <span className="text-base font-black text-emerald-400 font-heading">
                            {formatCurrency(monthlyPaymentAmount)} / tháng
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Method 4: Wallet Deposit & Stock Hold */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('DEPOSIT_WALLET')}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      paymentMethod === 'DEPOSIT_WALLET'
                        ? 'border-2 border-emerald-500 bg-emerald-50/90 ring-1 ring-emerald-300 shadow-sm'
                        : 'border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-lg bg-emerald-600 text-white shadow-sm">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-zinc-900 flex items-center gap-2">
                          <span>Đặt Cọc Giữ Hàng Bằng Số Dư Ví DRX</span>
                          <span className="text-amber-600 font-black">({formatCurrency(userBalance)})</span>
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Trích cọc trước 10% - 20% từ số dư ví để khóa linh kiện nguyên seal tại Store.
                        </p>
                      </div>
                    </div>
                    {isDepositBalanceEnough ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                        Đủ Tiền Cọc
                      </span>
                    ) : (
                      <Link
                        href="/deposit"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full hover:bg-rose-200 transition-colors"
                      >
                        Nạp Ví Thêm
                      </Link>
                    )}
                  </button>

                  {/* INTERACTIVE DEPOSIT WIDGET */}
                  {paymentMethod === 'DEPOSIT_WALLET' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-5 rounded-2xl bg-white border border-emerald-200 space-y-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <span className="text-xs font-black uppercase text-zinc-900 flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          <span>MỨC ĐẶT CỌC GIỮ HÀNG NGUYÊN SEAL</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Khóa Tồn Kho Ngay
                        </span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-700 flex items-center justify-between">
                          <span>CHỌN TỶ LỆ ĐẶT CỌC GIỮ HÀNG:</span>
                          <strong className="text-emerald-700 font-black">{depositPercent}% ({formatCurrency(depositRequiredAmount)})</strong>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[10, 20].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setDepositPercent(pct)}
                              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                depositPercent === pct
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-extrabold'
                                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                              }`}
                            >
                              Đặt Cọc {pct}% Đơn Hàng
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                        <div className="flex justify-between text-emerald-900 font-bold">
                          <span>Trích từ Ví DRX ngay:</span>
                          <span>{formatCurrency(depositRequiredAmount)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-600">
                          <span>Số tiền còn lại thanh toán khi nhận PC/Hàng:</span>
                          <span className="font-bold">{formatCurrency(depositRemainingOnDelivery)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Review */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
              <h2 className="text-base font-extrabold text-zinc-900 tracking-tight mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-sky-600" />
                <span>Sản Phẩm Trong Đơn Hàng ({cartItems.length}):</span>
              </h2>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  Giỏ hàng đang trống! Vui lòng chọn game trước khi thanh toán.
                </div>
              ) : (
                <div className="divide-y divide-zinc-150">
                  {cartItems.map((item) => {
                    const price = item.discountPrice ?? item.price;
                    return (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.coverImage}
                            alt={item.name}
                            className="h-12 w-16 rounded-lg object-cover bg-black border border-zinc-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-zinc-900 truncate">{item.name}</h4>
                            <span className="text-[10px] text-sky-600 font-extrabold uppercase">{item.platform}</span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-zinc-900 shrink-0">{formatCurrency(price)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: VietQR Code or Wallet Trigger & Invoice Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-lg relative overflow-hidden">
              {/* Payment Summary */}
              <div className="bg-zinc-900 -mx-6 -mt-6 p-5 text-white mb-6">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Mã Đơn Hàng:</span>
                  <span className="font-mono font-bold text-sky-400">{orderCode}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-extrabold">
                  <span>Tổng Cần Thanh Toán:</span>
                  <span className="text-xl text-amber-400 font-black">{formatCurrency(netAmount)}</span>
                </div>
              </div>

              {/* VietQR View Mode */}
              {paymentMethod === 'VIETQR' ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                    <div className="relative aspect-square w-52 max-w-full bg-white p-2.5 rounded-xl shadow-md border border-zinc-200">
                      <img src={vietQrUrl} alt="VietQR Code" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-2 font-medium text-center">
                      {deliveryBadgeInfo.subtext}
                    </p>
                  </div>

                  {/* Account Info Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                      <span className="text-zinc-500">Ngân Hàng:</span>
                      <span className="font-extrabold text-zinc-900">MB BANK (Quân Đội)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                      <span className="text-zinc-500">Số TK:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sky-700">0399224729</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('0399224729', 'Số tài khoản')}
                          className="p-1 rounded bg-white hover:bg-sky-100 text-sky-700 border border-sky-200"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                      <span className="text-zinc-500">Chủ TK:</span>
                      <span className="font-extrabold text-zinc-900">VO BAO LAN</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-50/90 to-blue-50/70 border border-sky-200 shadow-2xs flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-600"></span>
                          <span className="text-[10px] font-extrabold text-sky-900 uppercase tracking-wider">Nội Dung Chuyển Khoản</span>
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Bắt buộc
                          </span>
                        </div>
                        <span className="text-base font-black text-sky-950 tracking-wider select-all font-mono">
                          {transferMemo}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(transferMemo, 'Nội dung chuyển khoản')}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{copiedField === 'Nội dung chuyển khoản' ? 'Đã chép!' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full mt-4 py-3.5 rounded-2xl uiverse-btn-shimmer text-white font-heading font-black text-xs uppercase tracking-wider hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4 text-amber-300 fill-amber-300 animate-bounce" />
                    <span>{deliveryBadgeInfo.buttonLabel}</span>
                  </button>
                </div>
              ) : paymentMethod === 'WALLET' ? (
                /* Wallet Pay View Mode */
                <div className="space-y-4 py-4 text-center">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <p className="font-bold">Thanh toán 1-Click bằng số dư ví DRX Hardware</p>
                    <p className="text-[11px] text-amber-700">
                      Số dư sau khi thanh toán: <strong>{formatCurrency(Math.max(0, userBalance - netAmount))}</strong>
                    </p>
                  </div>

                  {isBalanceEnough ? (
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-2xl uiverse-btn-shimmer text-white font-heading font-black text-xs uppercase tracking-wider hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>Xác Nhận Thanh Toán Bằng Ví ({formatCurrency(netAmount)})</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-rose-600 font-bold">Số dư ví của bạn không đủ để thực hiện thanh toán này.</p>
                      <Link
                        href="/deposit"
                        className="block w-full py-3.5 rounded-2xl uiverse-btn-primary text-white font-heading font-black text-xs uppercase text-center"
                      >
                        Nạp Thêm Tiền Vào Ví Ngay
                      </Link>
                    </div>
                  )}
                </div>
              ) : paymentMethod === 'HD_SAISON' ? (
                /* HD SAISON View Mode */
                <div className="space-y-4 py-4 text-center">
                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 text-xs space-y-1 text-left">
                    <p className="font-bold uppercase text-[#0284c7]">Xác Nhận Mua Trả Góp HD SAISON</p>
                    <p className="text-[11px] text-slate-600">
                      Tiền trả trước: <strong className="text-amber-600">{formatCurrency(downPaymentAmount)}</strong> ({downPaymentPercent}%)
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Mỗi tháng góp: <strong className="text-emerald-600">{formatCurrency(monthlyPaymentAmount)}/tháng</strong> (Kỳ hạn {installmentTerm}T)
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
              ) : (
                /* DEPOSIT_WALLET View Mode */
                <div className="space-y-4 py-4 text-center">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1 text-left">
                    <p className="font-bold uppercase text-emerald-700">Trích Cọc Ví Giữ Hàng Nguyên Seal</p>
                    <p className="text-[11px] text-slate-600">
                      Số tiền cọc trích từ ví: <strong className="text-emerald-600">{formatCurrency(depositRequiredAmount)}</strong> ({depositPercent}%)
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Số tiền thanh toán khi nhận hàng/PC: <strong className="text-slate-900">{formatCurrency(depositRemainingOnDelivery)}</strong>
                    </p>
                  </div>

                  {isDepositBalanceEnough ? (
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-2xl uiverse-btn-shimmer text-white font-heading font-black text-xs uppercase tracking-wider hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <ShieldCheck className="h-4 w-4 text-amber-300" />
                      <span>Trích Cọc Ví ({formatCurrency(depositRequiredAmount)}) & Khóa Tồn Kho</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-rose-600 font-bold">Số dư ví của bạn không đủ tiền cọc ({formatCurrency(depositRequiredAmount)}).</p>
                      <Link
                        href="/deposit"
                        className="block w-full py-3 rounded-xl bg-emerald-600 text-white font-extrabold text-xs uppercase text-center hover:bg-emerald-700 transition-colors"
                      >
                        Nạp Thêm Ví Ngay
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Order Success Overlay */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center z-30"
                  >
                    <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-lg">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-extrabold text-zinc-900">ĐẶT HÀNG THÀNH CÔNG!</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                      Đơn hàng <strong className="text-sky-600">{orderCode}</strong> đã được ghi nhận hoàn tất. Linh kiện chính hãng kèm bảo hành 36 tháng đã sẵn sàng giao hàng / lắp ráp!
                    </p>

                    <div className="mt-6 flex items-center gap-3 w-full max-w-xs">
                      <Link
                        href="/profile?tab=vault"
                        className="flex-1 py-3 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors text-center shadow-sm"
                      >
                        Đơn Hàng & Bảo Hành
                      </Link>
                      <Link
                        href="/"
                        className="flex-1 py-3 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition-colors text-center"
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
