'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, Phone, MapPin, Truck, Building2, 
  Wrench, UserCheck, MessageSquare, DollarSign, PackageCheck, 
  ShieldCheck, AlertCircle, Sparkles, X, Check
} from 'lucide-react';
import { showToast } from '@/components/Toast';

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

  // Parse paymentDetails
  const paymentDetails = order?.paymentDetails && typeof order.paymentDetails === 'object'
    ? order.paymentDetails
    : {};

  const needInstallation = Boolean(paymentDetails.needInstallation);
  const isProxyRecipient = Boolean(paymentDetails.isProxyRecipient);
  const proxyName = paymentDetails.proxyName || '';
  const proxyPhone = paymentDetails.proxyPhone || '';
  const technicalNotes = paymentDetails.technicalNotes || order?.notes || '';
  const isStorePickup = order?.deliveryType === 'STORE_PICKUP';

  // Checklist state
  const [checklist, setChecklist] = useState({
    check_called: Boolean(paymentDetails.check_called),
    check_assembled: Boolean(paymentDetails.check_assembled),
    check_packed: Boolean(paymentDetails.check_packed),
    check_handed_over: Boolean(paymentDetails.check_handed_over),
    check_collected_cod: Boolean(paymentDetails.check_collected_cod) || order?.paymentStatus === 'PAID',
  });

  const [currentStatus, setCurrentStatus] = useState<string>(order?.status || 'PENDING');
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState<string>(order?.paymentStatus || 'PENDING');

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

  const handleStatusChange = async (newStatus: string) => {
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
        showToast(`Đã cập nhật tiến độ đơn #${order.orderCode || order.id.slice(0, 8)}`, 'success');
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl text-slate-900 dark:text-slate-100 my-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-base sm:text-lg text-[#0284c7]">
                #{order.orderCode || order.id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                currentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' :
                currentStatus === 'SHIPPING' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' :
                currentStatus === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' :
                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
              }`}>
                {currentStatus}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                currentPaymentStatus === 'PAID'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                💵 COD ({currentPaymentStatus === 'PAID' ? 'Đã Thu Tiền' : 'Chưa Thu Tiền'})
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono block mt-1">
              Thời gian đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            1. CHECKLIST TIẾN ĐỘ VẬN HÀNH DÀNH CHO STAFF & ADMIN
           ───────────────────────────────────────────────────────────── */}
        <div className="space-y-3 bg-gradient-to-br from-sky-50/50 to-blue-50/30 dark:from-slate-800/40 dark:to-slate-800/20 p-4 sm:p-5 rounded-2xl border border-sky-200/80 dark:border-slate-700">
          <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-700/60 pb-2">
            <h4 className="font-heading text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-[#0284c7]" />
              <span>QUY TRÌNH CHECK XÁC THỰC &amp; VẬN HÀNH ĐƠN HÀNG</span>
            </h4>
            <span className="text-[10.5px] font-mono text-slate-500 font-bold">
              {Object.values(checklist).filter(Boolean).length}/5 Mục Đã Xong
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* CHECK 1: GỌI ĐIỆN THOẠI */}
            <label className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
              checklist.check_called
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={checklist.check_called}
                onChange={() => handleToggleCheck('check_called')}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold block">1. Đã gọi điện thoại xác nhận đơn hàng với khách ({order.customerPhone})</span>
                <span className="text-[11px] opacity-75">Kiểm tra đúng tên người nhận, địa chỉ giao hàng và mã linh kiện.</span>
              </div>
            </label>

            {/* CHECK 2: LẮP RÁP / TEST MÁY */}
            <label className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
              checklist.check_assembled
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={checklist.check_assembled}
                onChange={() => handleToggleCheck('check_assembled')}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <span>2. Đã kiểm tra kho &amp; lắp ráp / cài đặt theo yêu cầu</span>
                  {needInstallation && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-sky-100 text-[#0284c7]">Khách yêu cầu ráp</span>
                  )}
                </span>
                <span className="text-[11px] opacity-75">Gán mã Serial SN kho, test nhiệt độ CPU/VGA Full-load và cài Windows nếu có yêu cầu.</span>
              </div>
            </label>

            {/* CHECK 3: ĐÓNG GÓI */}
            <label className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
              checklist.check_packed
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={checklist.check_packed}
                onChange={() => handleToggleCheck('check_packed')}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold block">3. Đã đóng gói thùng xốp &amp; dán tem niêm phong bảo hành</span>
                <span className="text-[11px] opacity-75">Đóng gói 3 lớp xốp chống va đập, dán tem bảo hành 36 tháng DRX Hardware.</span>
              </div>
            </label>

            {/* CHECK 4: BÀN GIAO VẬN CHUYỂN / SẴN SÀNG TẠI SHOWROOM */}
            <label className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
              checklist.check_handed_over
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={checklist.check_handed_over}
                onChange={() => handleToggleCheck('check_handed_over')}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold block">
                  {isStorePickup
                    ? '4. Đã sẵn sàng tại quầy Showroom DRX (Chờ khách tới nhận)'
                    : '4. Đã bàn giao cho đơn vị Vận Chuyển Tiêu Chuẩn (Đang giao hàng)'}
                </span>
                <span className="text-[11px] opacity-75">Chuyển trạng thái đơn hàng sang SHIPPING.</span>
              </div>
            </label>

            {/* CHECK 5: THU TIỀN COD & HOÀN TẤT */}
            <label className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
              checklist.check_collected_cod
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={checklist.check_collected_cod}
                onChange={() => handleToggleCheck('check_collected_cod')}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold block">5. Đã thu tiền COD ({formatVND(order.netAmount || order.totalAmount)}) &amp; Hoàn tất</span>
                <span className="text-[11px] opacity-75">Xác nhận khách đã nhận hàng &amp; thanh toán tiền mặt thành công. Tự động chuyển đơn sang COMPLETED.</span>
              </div>
            </label>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. THÔNG TIN KHÁCH HÀNG & DỊCH VỤ ĐẶC BIỆT
           ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Box 1: Người nhận & SĐT */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Thông Tin Người Nhận</span>
            <div className="font-extrabold text-slate-900 dark:text-white text-sm">
              {order.customerName}
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={`tel:${order.customerPhone}`}
                className="inline-flex items-center gap-1 font-mono font-bold text-[#0284c7] hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{order.customerPhone}</span>
              </a>
              {order.customerEmail && (
                <span className="text-slate-400 truncate max-w-[140px]">({order.customerEmail})</span>
              )}
            </div>
          </div>

          {/* Box 2: Hình thức & Địa chỉ giao */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Hình Thức Giao Nhận</span>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {isStorePickup ? <Building2 className="w-4 h-4 text-[#0284c7]" /> : <Truck className="w-4 h-4 text-[#0284c7]" />}
              <span>{isStorePickup ? 'Nhận tại Showroom DRX' : 'Giao hàng tận nơi'}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2" title={order.shippingAddress}>
              {order.shippingAddress}
            </p>
          </div>
        </div>

        {/* SPECIAL SERVICES BADGES */}
        {(needInstallation || isProxyRecipient || technicalNotes) && (
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 space-y-2 text-xs">
            <span className="font-heading text-[10.5px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>YÊU CẦU ĐẶC BIỆT TỪ KHÁCH HÀNG:</span>
            </span>

            <div className="flex flex-wrap gap-2 pt-0.5">
              {needInstallation && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-100 dark:bg-sky-950 text-[#0284c7] font-extrabold text-[11px] border border-sky-200 dark:border-sky-800">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Hỗ trợ lắp đặt / cài ráp PC &amp; Test nhiệt độ</span>
                </span>
              )}

              {isProxyRecipient && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] border border-purple-200 dark:border-purple-800">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Nhờ người nhận thay: {proxyName} ({proxyPhone})</span>
                </span>
              )}
            </div>

            {technicalNotes && (
              <div className="pt-1 text-[11.5px] text-slate-700 dark:text-slate-300 italic">
                <strong>Ghi chú kỹ thuật:</strong> "{technicalNotes}"
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. DANH SÁCH LINH KIỆN TRONG ĐƠN
           ───────────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Linh Kiện Trong Đơn Hàng
          </h4>

          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {order.orderItems && order.orderItems.length > 0 ? (
              order.orderItems.map((item: any) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product?.coverImage || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200'}
                      alt="Linh kiện"
                      className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                        {item.product?.name || item.name || 'Linh kiện DRX'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        SL: {item.quantity} x {formatVND(item.price)}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-black text-slate-900 dark:text-white shrink-0">
                    {formatVND(item.price * item.quantity)}
                  </span>
                </div>
              ))
            ) : paymentDetails.items && Array.isArray(paymentDetails.items) ? (
              paymentDetails.items.map((item: any, idx: number) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.coverImage || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=200'}
                      alt="Linh kiện"
                      className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-extrabold text-slate-900 dark:text-white block truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        SL: {item.quantity} x {formatVND(item.price)}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-black text-slate-900 dark:text-white shrink-0">
                    {formatVND(item.price * item.quantity)}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400">Đơn hàng linh kiện phần cứng DRX.</div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. QUICK STATUS SWITCH & ACTIONS
           ───────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">Chuyển nhanh trạng thái:</span>
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black uppercase text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7] cursor-pointer"
            >
              <option value="PENDING">PENDING (Chờ Duyệt)</option>
              <option value="CONFIRMED">CONFIRMED (Đã Xác Nhận & Ráp)</option>
              <option value="SHIPPING">SHIPPING (Đang Giao Hàng)</option>
              <option value="COMPLETED">COMPLETED (Hoàn Tất)</option>
              <option value="CANCELLED">CANCELLED (Hủy)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-[#0284c7] text-white dark:text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
