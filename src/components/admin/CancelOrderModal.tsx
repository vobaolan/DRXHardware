'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  AlertTriangle, 
  Ban, 
  X, 
  User, 
  Phone, 
  Loader2 
} from 'lucide-react';

export const CANCEL_REASONS = [
  'Khách không nghe máy xác nhận (đã gọi nhiều lần)',
  'Khách từ chối nhận / Đổi ý không mua',
  'Nghi vấn đơn hàng spam ảo / Thông tin giả mạo',
  'Hết hàng trong kho hoặc linh kiện tạm ngưng sản xuất',
  'Khách yêu cầu hủy đơn trực tiếp qua hotline',
  'Lý do khác (nhập chi tiết bên dưới)',
];

const formatVND = (num: number | string | null | undefined) => {
  const n = Number(num) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
};

export interface CancelOrderModalProps {
  isOpen: boolean;
  order: any | null;
  onClose: () => void;
  onConfirmCancel: (reason: string) => Promise<void> | void;
  isUpdating?: boolean;
}

export function CancelOrderModal({
  isOpen,
  order,
  onClose,
  onConfirmCancel,
  isUpdating = false,
}: CancelOrderModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when opened with a new order
  useEffect(() => {
    if (isOpen) {
      setSelectedReason(CANCEL_REASONS[0]);
      setCustomReason('');
    }
  }, [isOpen, order?.id]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isUpdating) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isUpdating, onClose]);

  if (!isOpen || !order || !mounted) return null;

  const orderCode = (() => {
    let raw = String(order.orderCode || order.id || 'DRX-00000').toUpperCase();
    raw = raw.replace(/^#/, '').replace(/^ORD-/, '').trim();
    if (raw.startsWith('DRX-')) return `#${raw}`;
    if (raw.startsWith('DRX')) return `#DRX-${raw.slice(3)}`;
    return `#DRX-${raw.slice(-5)}`;
  })();

  const handleConfirm = async () => {
    let finalReason = selectedReason;
    if (selectedReason === 'Lý do khác (nhập chi tiết bên dưới)') {
      finalReason = customReason.trim() || 'Lý do khác';
    } else if (customReason.trim()) {
      finalReason = `${selectedReason} - ${customReason.trim()}`;
    }
    await onConfirmCancel(finalReason);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => !isUpdating && onClose()}
      />

      {/* Modal Dialog */}
      <div 
        className="relative bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/70 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl text-slate-900 dark:text-white animate-in zoom-in-95 fade-in-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white">
                  XÁC NHẬN HỦY ĐƠN HÀNG
                </h3>
                <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200/80 dark:border-rose-900/60">
                  {orderCode}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                Vui lòng chọn hoặc nhập lý do hủy để lưu vết quản trị và đồng bộ vận hành.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Quick Summary */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{order.customerName || 'Khách hàng'}</span>
            </span>
            {order.customerPhone && (
              <span className="flex items-center gap-1 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{order.customerPhone}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-slate-900 dark:text-white">
              {formatVND(order.netAmount || order.totalAmount || 0)}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-400/30">
              {order.paymentMethod === 'BANKING' ? '💳 Banking' : '💵 COD'}
            </span>
          </div>
        </div>

        {/* Reason Selection */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-300 block">
            Chọn lý do hủy đơn hàng:
          </label>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {CANCEL_REASONS.map((reason, idx) => {
              const isSelected = selectedReason === reason;
              return (
                <label 
                  key={idx} 
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-rose-50/80 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200 font-bold shadow-2xs ring-1 ring-rose-400/40' 
                      : 'bg-white dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancel_order_reason"
                    checked={isSelected}
                    onChange={() => setSelectedReason(reason)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500 cursor-pointer shrink-0"
                  />
                  <span className="text-xs leading-relaxed">{reason}</span>
                </label>
              );
            })}
          </div>

          {/* Custom / Detailed Reason */}
          <div className="space-y-1 pt-1">
            <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block">
              Ghi chú thêm hoặc lý do chi tiết:
            </label>
            <textarea
              rows={2}
              placeholder="Nhập chi tiết ghi chú hủy đơn (nếu có)..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Quay Lại
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isUpdating}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-rose-600/20 active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang Hủy...</span>
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5" />
                <span>Xác Nhận Hủy Đơn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
