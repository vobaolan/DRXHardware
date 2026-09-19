'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  PhoneCall, 
  MapPin, 
  Truck, 
  Building2, 
  Wrench, 
  UserCheck, 
  Sparkles, 
  X, 
  Check, 
  Cpu, 
  PackageCheck, 
  BadgeDollarSign, 
  Ban, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  QrCode
} from 'lucide-react';
import { showToast } from '@/components/Toast';
import { authFetch } from '@/lib/auth-client';
import { OrderStatusSelector, OrderStatus } from './OrderStatusSelector';
import { CancelOrderModal } from './CancelOrderModal';

interface OrderVerificationModalProps {
  order: any;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: any) => void;
}

const formatVND = (num: number | string | null | undefined) => {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
};

export function OrderVerificationModal({ order, onClose, onOrderUpdated }: OrderVerificationModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!order) return null;

  // Safe parse paymentDetails
  const paymentDetails = (() => {
    if (!order.paymentDetails) return {};
    if (typeof order.paymentDetails === 'object') return order.paymentDetails;
    if (typeof order.paymentDetails === 'string') {
      try {
        return JSON.parse(order.paymentDetails);
      } catch (e) {
        return {};
      }
    }
    return {};
  })();

  const needInstallation = Boolean(paymentDetails.needInstallation);
  const isProxyRecipient = Boolean(paymentDetails.isProxyRecipient);
  const proxyName = paymentDetails.proxyName || '';
  const proxyPhone = paymentDetails.proxyPhone || '';
  const technicalNotes = paymentDetails.technicalNotes || order.notes || '';
  const isStorePickup = order.deliveryType === 'STORE_PICKUP';

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Checklist state
  const [checklist, setChecklist] = useState({
    check_called: Boolean(paymentDetails.check_called),
    check_assembled: Boolean(paymentDetails.check_assembled),
    check_packed: Boolean(paymentDetails.check_packed),
    check_handed_over: Boolean(paymentDetails.check_handed_over),
    check_collected_cod: Boolean(paymentDetails.check_collected_cod) || order.paymentStatus === 'PAID',
  });

  const [currentStatus, setCurrentStatus] = useState<string>(order.status || 'PENDING');
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState<string>(order.paymentStatus || 'PENDING');

  const [showQrPreview, setShowQrPreview] = useState(false);
  const isQrPayment = order.paymentMethod === 'QR_BANK';
  const isPaid = currentPaymentStatus === 'PAID';

  const orderDisplayCode = (() => {
    let raw = String(order.orderCode || order.id || 'DRX-83921').toUpperCase();
    raw = raw.replace(/^#/, '').replace(/^ORD-/, '');
    if (raw.startsWith('DRX-')) return raw;
    if (raw.startsWith('DRX')) return `DRX-${raw.slice(3)}`;
    return `DRX-${raw.slice(-5)}`;
  })();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderDisplayCode);
    setCopiedCode(true);
    showToast(`Đã sao chép mã đơn #${orderDisplayCode}`, 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Confirm Techcombank payment received
  const handleConfirmPaymentReceived = async () => {
    setIsUpdating(true);
    try {
      const updatedChecklist = {
        ...checklist,
        check_collected_cod: true,
      };
      setChecklist(updatedChecklist);
      setCurrentPaymentStatus('PAID');

      await saveOrderChanges(currentStatus, 'PAID', updatedChecklist);
      showToast(`Đã xác nhận tiền vào Techcombank (STK: BAOLANN) cho đơn #${orderDisplayCode}!`, 'success');
    } catch (err: any) {
      showToast('Lỗi khi xác nhận thanh toán!', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Checklist Item Toggle
  const handleToggleCheck = async (key: keyof typeof checklist) => {
    const updatedChecklist = {
      ...checklist,
      [key]: !checklist[key],
    };
    setChecklist(updatedChecklist);

    // Auto calculate suggested status based on checks
    let nextStatus = currentStatus;
    let nextPaymentStatus = currentPaymentStatus;

    if (updatedChecklist.check_collected_cod) {
      nextStatus = 'COMPLETED';
      nextPaymentStatus = 'PAID';
    } else if (updatedChecklist.check_handed_over) {
      nextStatus = 'SHIPPING';
    } else if (updatedChecklist.check_called || updatedChecklist.check_assembled || updatedChecklist.check_packed) {
      if (currentStatus === 'PENDING') {
        nextStatus = 'CONFIRMED';
      }
    }

    setCurrentStatus(nextStatus);
    setCurrentPaymentStatus(nextPaymentStatus);

    await saveOrderChanges(nextStatus, nextPaymentStatus, updatedChecklist);
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === 'CANCELLED') {
      setIsCancelModalOpen(true);
      return;
    }

    setCurrentStatus(newStatus);
    let newPaymentStatus = currentPaymentStatus;
    let updatedChecklist = { ...checklist };

    if (newStatus === 'COMPLETED') {
      newPaymentStatus = 'PAID';
      updatedChecklist.check_collected_cod = true;
      updatedChecklist.check_handed_over = true;
      updatedChecklist.check_packed = true;
      updatedChecklist.check_called = true;
      setChecklist(updatedChecklist);
      setCurrentPaymentStatus('PAID');
    }

    await saveOrderChanges(newStatus, newPaymentStatus, updatedChecklist);
  };

  // Perform Order Cancellation (Spam / Refusal protection)
  const handleConfirmCancelOrder = async (finalReason: string) => {
    setIsUpdating(true);

    try {
      const mergedDetails = {
        ...paymentDetails,
        cancellationReason: finalReason,
        cancelledAt: new Date().toISOString(),
        cancelledBy: 'STAFF_OR_ADMIN',
      };

      const targetPaymentStatus = order.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED';

      const res = await authFetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id || order.orderCode || orderDisplayCode,
          status: 'CANCELLED',
          paymentStatus: targetPaymentStatus,
          paymentDetails: mergedDetails,
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        showToast(`Đã hủy đơn hàng #${orderDisplayCode} thành công!`, 'success');
        setCurrentStatus('CANCELLED');
        setCurrentPaymentStatus(targetPaymentStatus);
        setIsCancelModalOpen(false);
        onOrderUpdated(data.order);
      } else {
        showToast(data.message || 'Lỗi khi hủy đơn hàng', 'error');
      }
    } catch (e) {
      showToast('Lỗi kết nối khi hủy đơn', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const saveOrderChanges = async (statusToSave: string, paymentStatusToSave: string, checklistToSave: any) => {
    setIsUpdating(true);
    try {
      const mergedDetails = {
        ...paymentDetails,
        ...checklistToSave,
      };

      const res = await authFetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id || order.orderCode || orderDisplayCode,
          status: statusToSave,
          paymentStatus: paymentStatusToSave,
          paymentDetails: mergedDetails,
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        showToast(`Đã lưu tiến độ đơn #${orderDisplayCode}`, 'success');
        onOrderUpdated(data.order);
      } else {
        showToast(data.message || 'Lỗi cập nhật đơn hàng', 'error');
      }
    } catch (e: any) {
      showToast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = (() => {
    try {
      const d = new Date(order.createdAt);
      if (isNaN(d.getTime())) return null;
      const timeStr = d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh',
      });
      const dateStr = d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh',
      });
      return `${timeStr} ${dateStr}`;
    } catch (e) {
      return null;
    }
  })();

  // Extract products
  const itemsList = (order.orderItems && order.orderItems.length > 0)
    ? order.orderItems.map((oi: any) => ({
        id: oi.id,
        name: oi.product?.name || oi.name || 'Linh kiện DRX',
        coverImage: oi.product?.coverImage || oi.coverImage,
        price: oi.price,
        quantity: oi.quantity || 1,
        brand: oi.product?.brand,
      }))
    : (paymentDetails.items && Array.isArray(paymentDetails.items) && paymentDetails.items.length > 0)
    ? paymentDetails.items
    : [];

  const checksDoneCount = Object.values(checklist).filter(Boolean).length;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 py-6 sm:py-10">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl text-slate-900 dark:text-slate-100 my-auto relative">
        {/* ─────────────────────────────────────────────────────────────
            HEADER: ORDER CODE, STATUS, PAYMENT & LOGICAL ACTIONS
           ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-slate-100 dark:border-slate-800/80 pb-5">
          <div className="space-y-2 flex-1 min-w-0">
            {/* Top row with all badges strictly aligned together */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
                <span className="font-mono font-black text-xs sm:text-sm text-[#0284c7]">
                  #{orderDisplayCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Sao chép mã đơn"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* High-craft Status Dropdown Selector - Compact size to prevent awkward wrap */}
              <div className="shrink-0">
                <OrderStatusSelector
                  orderId={order.id}
                  currentStatus={currentStatus}
                  onStatusChange={handleStatusChange}
                  size="sm"
                  placement="bottom"
                />
              </div>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide border whitespace-nowrap shrink-0 ${
                currentPaymentStatus === 'PAID'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-400/30'
                  : currentPaymentStatus === 'REFUNDED'
                  ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-400/30'
                  : currentPaymentStatus === 'CANCELLED' || currentPaymentStatus === 'FAILED'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400/30'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400/30'
              }`}>
                <span>{order.paymentMethod === 'BANKING' ? '💳 Banking' : '💵 COD'}</span>
                <span>•</span>
                <span>{currentPaymentStatus === 'PAID' ? 'Đã Thu Tiền' : currentPaymentStatus === 'REFUNDED' ? 'Đã Hoàn Tiền' : 'Chưa Thu Tiền'}</span>
              </span>

              {/* Stock Deduction Status */}
              {paymentDetails.inventoryDeducted ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide border whitespace-nowrap shrink-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-400/30">
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Đã Trừ Tồn Kho</span>
                </span>
              ) : currentStatus !== 'CANCELLED' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wide border whitespace-nowrap shrink-0 bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                  <span>📦 Chưa Trừ Kho (Từ B3)</span>
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
              {formattedDate && (
                <span>
                  Thời gian đặt: <strong className="text-slate-700 dark:text-slate-300 font-bold">{formattedDate}</strong>
                </span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                {isStorePickup ? <Building2 className="w-3 h-3 text-[#0284c7]" /> : <Truck className="w-3 h-3 text-[#0284c7]" />}
                <strong className="text-slate-700 dark:text-slate-300 font-bold">{isStorePickup ? 'Showroom DRX' : 'Giao tận nơi'}</strong>
              </span>
            </div>
          </div>

          {/* Right Controls: Logical contextual actions + Close button */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {currentStatus === 'COMPLETED' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Đã Hoàn Tất</span>
              </span>
            ) : currentStatus === 'CANCELLED' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold shadow-2xs">
                <Ban className="w-3.5 h-3.5 text-rose-500" />
                <span>Đơn Đã Hủy</span>
              </span>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors border border-slate-200/60 dark:border-slate-700/60"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CANCELLATION ALERT (IF ALREADY CANCELLED)
           ───────────────────────────────────────────────────────────── */}
        {currentStatus === 'CANCELLED' && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2 text-xs text-rose-900 dark:text-rose-300 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 font-black uppercase text-[11px] text-rose-700 dark:text-rose-400">
                <Ban className="w-4 h-4" />
                <span>ĐƠN HÀNG ĐÃ ĐƯỢC HỦY BỎ</span>
              </div>
              {paymentDetails.cancelledAt && (
                <span className="text-[10.5px] font-mono text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-900/50 px-2.5 py-0.5 rounded-lg font-bold border border-rose-200/60 dark:border-rose-800/60">
                  {new Date(paymentDetails.cancelledAt).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    timeZone: 'Asia/Ho_Chi_Minh'
                  })}
                </span>
              )}
            </div>
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-rose-200/60 dark:border-rose-900/40">
              <span className="text-[10px] uppercase font-black tracking-wider text-rose-500 dark:text-rose-400 block mb-0.5">
                LÝ DO HỦY ĐƠN:
              </span>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200 leading-relaxed">
                {paymentDetails.cancellationReason || 'Khách không mua / Đơn spam ảo'}
              </p>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            BANK TRANSFER VERIFICATION BOX (TECHCOMBANK - BAOLANN)
           ───────────────────────────────────────────────────────────── */}
        {isQrPayment && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-blue-50/60 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-sky-300 dark:border-sky-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#0284c7] text-white">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-heading text-xs font-black uppercase text-slate-900 dark:text-white">
                      THANH TOÁN VIETQR: TECHCOMBANK - STK: BAOLANN
                    </h4>
                    {isPaid ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                        ✓ ĐÃ NHẬN TIỀN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 animate-pulse">
                        ⏳ CHỜ ĐỐI SOÁT BIẾN ĐỘNG SỐ DƯ
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Khách chọn thanh toán chuyển khoản quét mã QR tự động qua Techcombank.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowQrPreview(!showQrPreview)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-[#0284c7] hover:bg-sky-50 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showQrPreview ? 'Ẩn Mã QR' : 'Xem Mã QR Khách Quét'}</span>
                </button>

                {!isPaid && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleConfirmPaymentReceived}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/25 active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Xác Nhận Tiền Đã Vào</span>
                  </button>
                )}
              </div>
            </div>

            {/* EXPANDABLE QR PREVIEW */}
            {showQrPreview && (
              <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-sky-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={`https://img.vietqr.io/image/970407-BAOLANN-compact2.png?amount=${order.netAmount || order.totalAmount}&addInfo=${orderDisplayCode}&accountName=VO%20BAO%20LAN`}
                  alt="VietQR Techcombank VO BAO LAN"
                  className="w-40 h-auto object-contain rounded-xl border border-slate-200"
                />
                <div className="space-y-1.5 text-xs flex-1">
                  <div className="font-heading font-black text-slate-900 dark:text-white uppercase">
                    Thông Tin Tài Khoản Thụ Hưởng DRX:
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Ngân hàng: <strong>Techcombank (TCB)</strong>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Số tài khoản: <strong className="font-mono text-[#0284c7] text-sm">BAOLANN</strong>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Tên thụ hưởng: <strong>VO BAO LAN</strong>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Nội dung chuyển khoản chuẩn: <strong className="font-mono text-[#0284c7]">{orderDisplayCode}</strong>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Số tiền cần nhận: <strong className="font-mono text-rose-600 text-sm">{formatVND(order.netAmount || order.totalAmount)}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* DETAILS BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-white/80 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ngân Hàng:</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">Techcombank</span>
              </div>
              <div className="p-2.5 bg-white/80 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">STK Thụ Hưởng:</span>
                <span className="font-mono font-black text-[#0284c7]">BAOLANN</span>
              </div>
              <div className="p-2.5 bg-white/80 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nội Dung CK:</span>
                <span className="font-mono font-black text-[#0284c7]">{orderDisplayCode}</span>
              </div>
              <div className="p-2.5 bg-white/80 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Số Tiền:</span>
                <span className="font-mono font-black text-rose-600 dark:text-rose-400">{formatVND(order.netAmount || order.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            1. CHECKLIST TIẾN ĐỘ VẬN HÀNH 5 BƯỚC (REDESIGNED FIGURE 2)
           ───────────────────────────────────────────────────────────── */}
        <div className="space-y-3 bg-gradient-to-br from-sky-50/60 via-slate-50 to-blue-50/40 dark:from-slate-800/60 dark:via-slate-900 dark:to-slate-800/40 p-4 sm:p-5 rounded-2xl border border-sky-200/80 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-700/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#0284c7] text-white">
                <PackageCheck className="w-4 h-4" />
              </div>
              <h4 className="font-heading text-xs font-black uppercase text-slate-900 dark:text-white tracking-wide">
                QUY TRÌNH CHECK XÁC THỰC &amp; VẬN HÀNH ĐƠN HÀNG
              </h4>
            </div>
            <span className="text-xs font-mono font-black text-[#0284c7] bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-slate-800">
              {checksDoneCount}/5 Mục Đã Xong
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {/* STEP 1: GỌI ĐIỆN XÁC NHẬN */}
            <div 
              onClick={() => handleToggleCheck('check_called')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                checklist.check_called
                  ? 'bg-emerald-500/10 border-emerald-400/50 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                  checklist.check_called
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                }`}>
                  {checklist.check_called && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PhoneCall className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span className="font-heading text-xs font-black">
                      1. Đã gọi điện thoại xác nhận đơn hàng ({order.customerPhone || 'Chưa có SĐT'})
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75 leading-relaxed">
                    Kiểm tra đúng tên người nhận ({order.customerName}), địa chỉ nhận hàng và danh sách linh kiện.
                  </p>
                </div>
              </div>

              {order.customerPhone && (
                <a
                  href={`tel:${order.customerPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2.5 py-1 rounded-lg bg-[#0284c7]/10 hover:bg-[#0284c7] text-[#0284c7] hover:text-white text-[10.5px] font-bold transition-colors shrink-0 flex items-center gap-1"
                  title="Bấm để gọi ngay"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Gọi Ngay</span>
                </a>
              )}
            </div>

            {/* STEP 2: LẮP RÁP & TEST MÁY */}
            <div 
              onClick={() => handleToggleCheck('check_assembled')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                checklist.check_assembled
                  ? 'bg-emerald-500/10 border-emerald-400/50 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                  checklist.check_assembled
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                }`}>
                  {checklist.check_assembled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Cpu className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="font-heading text-xs font-black">
                      2. Đã kiểm tra kho &amp; lắp ráp / cài đặt theo yêu cầu
                    </span>
                    {needInstallation && (
                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase bg-sky-100 dark:bg-sky-950 text-[#0284c7] border border-sky-300 dark:border-sky-800">
                        🛠️ Khách Yêu Cầu Ráp
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-75 leading-relaxed">
                    Gán mã Serial kho, test nhiệt độ CPU/VGA Full-load và cài đặt Windows/Driver.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 3: ĐÓNG GÓI 3 LỚP XỐP */}
            <div 
              onClick={() => handleToggleCheck('check_packed')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                checklist.check_packed
                  ? 'bg-emerald-500/10 border-emerald-400/50 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                  checklist.check_packed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                }`}>
                  {checklist.check_packed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PackageCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="font-heading text-xs font-black">
                      3. Đã đóng gói thùng xốp &amp; dán tem niêm phong bảo hành
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700">
                      ⚡ Tự động trừ tồn kho từ bước này
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75 leading-relaxed">
                    Đóng gói 3 lớp xốp chống va đập, dán tem bảo hành 36 tháng DRX Hardware. Hệ thống sẽ tự động trừ số lượng tồn kho của các linh kiện trong đơn.
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 4: BÀN GIAO SHIPPER / QUẦY SHOWROOM */}
            <div 
              onClick={() => handleToggleCheck('check_handed_over')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                checklist.check_handed_over
                  ? 'bg-emerald-500/10 border-emerald-400/50 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                  checklist.check_handed_over
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                }`}>
                  {checklist.check_handed_over && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isStorePickup ? <Building2 className="w-3.5 h-3.5 text-[#0284c7]" /> : <Truck className="w-3.5 h-3.5 text-[#0284c7]" />}
                    <span className="font-heading text-xs font-black">
                      {isStorePickup
                        ? '4. Đã sẵn sàng tại quầy Showroom DRX (Chờ khách tới nhận)'
                        : '4. Đã bàn giao cho đơn vị Vận Chuyển Tiêu Chuẩn (Đang giao)'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75 leading-relaxed">
                    Tự động đồng bộ trạng thái đơn hàng sang SHIPPING (Đang vận chuyển).
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 5: THU TIỀN COD / CHECK TIỀN QR & HOÀN TẤT */}
            <div 
              onClick={() => handleToggleCheck('check_collected_cod')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                checklist.check_collected_cod
                  ? 'bg-emerald-500/10 border-emerald-400/50 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                  checklist.check_collected_cod
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                }`}>
                  {checklist.check_collected_cod && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <BadgeDollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-heading text-xs font-black">
                      {isQrPayment 
                        ? `5. Đã check tiền vào Techcombank STK BAOLANN (${formatVND(order.netAmount || order.totalAmount)})`
                        : `5. Đã thu tiền COD (${formatVND(order.netAmount || order.totalAmount)}) & Hoàn tất`}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75 leading-relaxed">
                    {isQrPayment
                      ? 'Đã đối soát biến động số dư Techcombank đúng số tiền và nội dung. Tự động chuyển COMPLETED & PAID.'
                      : 'Khách đã kiểm tra, nhận đủ linh kiện và thanh toán thành công. Tự động chuyển COMPLETED & PAID.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. THÔNG TIN KHÁCH HÀNG & HÌNH THỨC GIAO NHẬN
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Card 1: Người Nhận */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
              THÔNG TIN NGƯỜI NHẬN
            </span>
            <div className="font-heading text-sm font-black text-slate-900 dark:text-white">
              {order.customerName || 'Khách hàng'}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {order.customerPhone && (
                <a 
                  href={`tel:${order.customerPhone}`}
                  className="inline-flex items-center gap-1.5 font-mono font-bold text-xs text-[#0284c7] hover:underline bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 shrink-0"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>{order.customerPhone}</span>
                </a>
              )}
              {order.customerEmail && (
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] break-all">
                  ({order.customerEmail})
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Giao Nhận */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
              HÌNH THỨC GIAO NHẬN
            </span>
            <div className="font-heading text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              {isStorePickup ? <Building2 className="w-4 h-4 text-[#0284c7]" /> : <Truck className="w-4 h-4 text-[#0284c7]" />}
              <span>{isStorePickup ? 'Nhận tại Showroom DRX' : 'Giao hàng tận nơi'}</span>
            </div>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed break-words" title={order.shippingAddress}>
              <MapPin className="w-3 h-3 inline mr-1 text-slate-400 shrink-0" />
              <span>{order.shippingAddress || 'Showroom DRX Hardware (Q.10, TP. Hồ Chí Minh)'}</span>
            </p>
            {currentStatus === 'CANCELLED' && (
              <div className="mt-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/50 flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                <Ban className="w-3 h-3 shrink-0" />
                <span>Đã dừng vận chuyển do đơn hàng đã hủy</span>
              </div>
            )}
          </div>
        </div>

        {/* SPECIAL REQUESTS BANNER */}
        {(needInstallation || isProxyRecipient || technicalNotes) && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 dark:border-amber-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-heading text-[10.5px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>YÊU CẦU ĐẶC BIỆT TỪ KHÁCH HÀNG:</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5">
              {needInstallation && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/15 text-[#0284c7] dark:text-sky-400 font-extrabold text-[11px] border border-sky-400/30">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Hỗ trợ lắp đặt / cài ráp linh kiện &amp; Test nhiệt độ</span>
                </span>
              )}

              {isProxyRecipient && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] border border-purple-400/30">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Nhờ người nhận thay: {proxyName} ({proxyPhone})</span>
                </span>
              )}
            </div>

            {technicalNotes && (
              <div className="pt-1 text-[11.5px] text-slate-700 dark:text-slate-300 italic bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                <strong>Ghi chú kỹ thuật:</strong> "{technicalNotes}"
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. DANH SÁCH LINH KIỆN TRONG ĐƠN (REDESIGNED)
           ───────────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              LINH KIỆN TRONG ĐƠN HÀNG ({itemsList.length})
            </h4>
            <span className="text-xs font-bold text-slate-400">
              Bảo hành 36 tháng chính hãng DRX
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs overflow-hidden">
            {itemsList.length > 0 ? (
              itemsList.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-white dark:hover:bg-slate-800/80 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.coverImage || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200'}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <span className="font-heading font-black text-xs text-slate-900 dark:text-white block truncate">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
                        {item.brand && <span className="font-bold text-slate-700 dark:text-slate-300">{item.brand}</span>}
                        <span>•</span>
                        <span className="font-mono text-[#0284c7] font-bold">SL: {item.quantity || 1} x {formatVND(item.price)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white shrink-0">
                    {formatVND(Number(item.price || 0) * Number(item.quantity || 1))}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-5 text-center space-y-1">
                <Cpu className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="font-bold text-xs text-slate-700 dark:text-slate-300">
                  Gói linh kiện phần cứng PC Gaming / Workstation DRX
                </p>
                <p className="text-[11px] text-slate-400">
                  Tổng giá trị gói cấu hình: <strong className="text-[#0284c7]">{formatVND(order.netAmount || order.totalAmount)}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            FOOTER: TOTAL & ACTIONS
           ───────────────────────────────────────────────────────────── */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 uppercase">
              {isQrPayment ? 'Tổng tiền QR Bank:' : 'Tổng tiền COD:'}
            </span>
            <span className="font-heading font-black text-lg text-rose-600 dark:text-rose-400">
              {formatVND(order.netAmount || order.totalAmount)}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-[#0284c7] dark:hover:bg-[#0284c7] text-white dark:text-slate-900 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer text-center shadow-md active:scale-95"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
          CANCELLATION CONFIRMATION MODAL (CHỐNG SPAM & GHI LÝ DO)
         ───────────────────────────────────────────────────────────── */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        order={{
          ...order,
          orderCode: orderDisplayCode,
          netAmount: order.netAmount || order.totalAmount,
        }}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancelOrder}
        isUpdating={isUpdating}
      />

    </div>,
    document.body
  );
}
