'use client';

import React, { useState } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { showToast } from '@/components/Toast';
import { OrderStatusSelector, OrderStatus } from './OrderStatusSelector';

interface OrderVerificationModalProps {
  order: any;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: any) => void;
}

const formatVND = (num: number | string | null | undefined) => {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
};

const CANCEL_REASONS = [
  'Khách không nghe máy xác nhận (đã gọi nhiều lần)',
  'Khách từ chối nhận / Đổi ý không mua',
  'Nghi vấn đơn hàng spam ảo / Thông tin giả mạo',
  'Hết hàng trong kho hoặc linh kiện tạm ngưng sản xuất',
  'Khách yêu cầu hủy đơn trực tiếp qua hotline',
];

export function OrderVerificationModal({ order, onClose, onOrderUpdated }: OrderVerificationModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState(CANCEL_REASONS[0]);
  const [customCancelReason, setCustomCancelReason] = useState('');
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
  const handleConfirmCancelOrder = async () => {
    const finalReason = customCancelReason.trim() || selectedCancelReason;
    setIsUpdating(true);

    try {
      const mergedDetails = {
        ...paymentDetails,
        cancellationReason: finalReason,
        cancelledAt: new Date().toISOString(),
        cancelledBy: 'STAFF_OR_ADMIN',
      };

      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: 'CANCELLED',
          paymentStatus: 'CANCELLED',
          paymentDetails: mergedDetails,
        }),
      });

      const data = await res.json();
      if (res.ok && data.order) {
        showToast(`Đã hủy đơn hàng #${orderDisplayCode} thành công!`, 'success');
        setCurrentStatus('CANCELLED');
        setCurrentPaymentStatus('CANCELLED');
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

      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
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
      return order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');
    } catch {
      return '';
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 py-6 sm:py-10">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl text-slate-900 dark:text-slate-100 my-auto relative">
        
        {/* TOP AMBIENT ACCENT */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0284c7] via-cyan-400 to-blue-600 rounded-t-3xl" />

        {/* ─────────────────────────────────────────────────────────────
            HEADER: ORDER CODE & STATUS SELECTOR
           ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-mono font-black text-sm sm:text-base text-[#0284c7]">
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

              {/* High-craft Status Dropdown Selector */}
              <OrderStatusSelector
                currentStatus={currentStatus}
                onStatusChange={handleStatusChange}
                size="md"
                placement="bottom"
              />

              <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase border ${
                currentPaymentStatus === 'PAID'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-400/30'
                  : currentPaymentStatus === 'CANCELLED'
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-400/30'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400/30'
              }`}>
                💵 COD ({currentPaymentStatus === 'PAID' ? 'Đã Thu Tiền' : currentPaymentStatus === 'CANCELLED' ? 'Đã Hủy COD' : 'Chưa Thu Tiền'})
              </span>
            </div>

            {formattedDate && (
              <span className="text-xs text-slate-400 font-mono block pt-0.5">
                Thời gian đặt: <strong className="text-slate-600 dark:text-slate-300 font-bold">{formattedDate}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {currentStatus !== 'CANCELLED' && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Hủy đơn hàng nếu khách từ chối nhận hoặc spam"
              >
                <Ban className="w-4 h-4" />
                <span>Hủy Đơn (Spam)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CANCELLATION ALERT (IF ALREADY CANCELLED)
           ───────────────────────────────────────────────────────────── */}
        {currentStatus === 'CANCELLED' && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1.5 text-xs text-rose-900 dark:text-rose-300">
            <div className="flex items-center gap-2 font-black uppercase text-[11px] text-rose-700 dark:text-rose-400">
              <Ban className="w-4 h-4" />
              <span>ĐƠN HÀNG ĐÃ ĐƯỢC HỦY BỎ BỞI QUẢN TRỊ VIÊN / STAFF</span>
            </div>
            <p className="text-[11.5px] opacity-90">
              Lý do hủy: <strong>{paymentDetails.cancellationReason || 'Khách không mua / Đơn spam ảo'}</strong>
            </p>
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
                  </div>
                  <p className="text-[11px] opacity-75 leading-relaxed">
                    Đóng gói 3 lớp xốp chống va đập, dán tem bảo hành 36 tháng DRX Hardware và chụp hình kiện hàng.
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

            {/* STEP 5: THU TIỀN COD & HOÀN TẤT */}
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
                      5. Đã thu tiền COD ({formatVND(order.netAmount || order.totalAmount)}) &amp; Hoàn tất
                    </span>
                  </div>
                  <p className="text-[11px] opacity-75 leading-relaxed">
                    Khách đã kiểm tra, nhận đủ linh kiện và thanh toán thành công. Tự động chuyển COMPLETED &amp; PAID.
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
                  className="inline-flex items-center gap-1.5 font-mono font-bold text-xs text-[#0284c7] hover:underline bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>{order.customerPhone}</span>
                </a>
              )}
              {order.customerEmail && (
                <span className="text-slate-500 font-mono text-[11px] truncate max-w-[150px]">({order.customerEmail})</span>
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
            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed" title={order.shippingAddress}>
              <MapPin className="w-3 h-3 inline mr-1 text-slate-400" />
              {order.shippingAddress || 'Showroom DRX Hardware (Q.10, TP. Hồ Chí Minh)'}
            </p>
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
            FOOTER: TOTAL COD & ACTIONS
           ───────────────────────────────────────────────────────────── */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-baseline gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 uppercase">Tổng tiền COD:</span>
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
          CANCELLATION CONFIRMATION MODAL (CHỐNG SPAM)
         ───────────────────────────────────────────────────────────── */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-slate-900 dark:text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-black uppercase">
                  XÁC NHẬN HỦY ĐƠN #{orderDisplayCode}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dành cho trường hợp khách không mua, từ chối nhận hoặc spam đơn
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Chọn lý do hủy đơn:
              </label>

              <div className="space-y-1.5">
                {CANCEL_REASONS.map((reason, idx) => (
                  <label 
                    key={idx} 
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedCancelReason === reason 
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200 font-bold' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      checked={selectedCancelReason === reason}
                      onChange={() => setSelectedCancelReason(reason)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className="text-xs">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[11px] text-slate-500 font-bold block">
                  Hoặc nhập lý do chi tiết khác:
                </label>
                <input
                  type="text"
                  placeholder="Nhập ghi chú hủy đơn..."
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Quay Lại
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{isUpdating ? 'Đang Hủy...' : 'Xác Nhận Hủy Đơn'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
