'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Tag, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Wrench, 
  Sparkles, 
  AlertCircle,
  Cpu,
  Trash2
} from 'lucide-react';
import { useCart, Coupon } from '@/context/CartContext';
import { showToast } from '@/components/Toast';
import { HardwareProduct } from '@/lib/hardware-data';

interface CheckoutBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBuild: Record<string, HardwareProduct | null>;
  totalCost: number;
  onProceedToCheckout: (couponCode?: string) => void;
}

const formatVND = (num: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
};

export function CheckoutBuildModal({
  isOpen,
  onClose,
  selectedBuild,
  totalCost,
  onProceedToCheckout,
}: CheckoutBuildModalProps) {
  const { coupon, applyCoupon, removeCoupon, getDiscountAmount } = useCart();
  const [couponInput, setCouponInput] = useState(coupon?.code || '');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isOpen) return null;

  const itemsList = Object.entries(selectedBuild)
    .filter(([_, prod]) => prod !== null)
    .map(([key, prod]) => ({
      stepKey: key,
      product: prod as HardwareProduct,
    }));

  const discountAmount = getDiscountAmount(totalCost);
  const netTotal = Math.max(0, totalCost - discountAmount);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      showToast('Vui lòng nhập mã giảm giá!', 'error');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = await applyCoupon(code, totalCost);
      if (res.success) {
        showToast(res.message, 'success');
        setCouponInput(code);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Lỗi khi kiểm tra mã giảm giá', 'error');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    showToast('Đã hủy áp dụng mã giảm giá', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-900 dark:text-slate-100">
        
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-[#0284c7] text-white shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-heading font-black uppercase text-slate-900 dark:text-white">
                Xác Nhận Đặt Mua Cấu Hình PC
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kiểm tra danh sách linh kiện &amp; áp dụng mã ưu đãi trước khi thanh toán
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* 1. SELECTED COMPONENTS LIST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-heading font-black uppercase tracking-wider text-slate-400">
                Linh kiện trong cấu hình ({itemsList.length}/9 món):
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Đầy đủ tương thích
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 max-h-48 overflow-y-auto text-xs">
              {itemsList.map(({ stepKey, product }) => (
                <div key={stepKey} className="p-2.5 flex items-center justify-between gap-3 hover:bg-white dark:hover:bg-slate-900/60 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={product.coverImage || '/placeholder-hardware.png'}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[9.5px] font-black uppercase text-[#0284c7] block">
                        {product.category}
                      </span>
                      <h5 className="font-bold text-slate-900 dark:text-white truncate text-[11.5px]">
                        {product.name}
                      </h5>
                    </div>
                  </div>
                  <span className="font-mono font-black text-slate-900 dark:text-white shrink-0 text-xs">
                    {formatVND(product.discountPrice || product.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. PROMINENT COUPON CODE INPUT SECTION */}
          <div className="bg-gradient-to-br from-sky-50/80 via-white to-blue-50/50 dark:from-slate-800/60 dark:via-slate-900 dark:to-slate-800/50 p-4 rounded-2xl border border-sky-200 dark:border-slate-700 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-heading text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                <Tag className="w-3.5 h-3.5 text-[#0284c7]" />
                <span>MÃ GIẢM GIÁ / VOUCHER ƯU ĐÃI</span>
              </div>
              {coupon && (
                <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Đã áp dụng
                </span>
              )}
            </div>

            {coupon ? (
              /* Applied Voucher Display */
              <div className="flex items-center justify-between gap-3 p-3 bg-emerald-500/10 border border-emerald-400/40 rounded-xl text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-mono font-black text-xs">
                      MÃ: <span className="underline">{coupon.code}</span> ({coupon.discountType === 'PERCENT' ? `Giảm ${coupon.discountValue}%` : `Giảm ${formatVND(coupon.discountValue)}`})
                    </div>
                    <span className="text-[10.5px] text-emerald-700 dark:text-emerald-300 font-bold block">
                      Tiết kiệm: -{formatVND(discountAmount)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                  title="Hủy mã giảm giá"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Mã</span>
                </button>
              </div>
            ) : (
              /* Coupon Input Bar */
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Nhập mã giảm giá..."
                      className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-slate-900 dark:text-white shadow-2xs"
                    />
                    {couponInput && (
                      <button
                        type="button"
                        onClick={() => setCouponInput('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    disabled={!couponInput.trim() || isApplyingCoupon}
                    className="px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-heading font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                  >
                    {isApplyingCoupon ? 'Đang kiểm tra...' : 'Áp Dụng'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. FINANCIAL SUMMARY BOX */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Tạm tính cấu hình ({itemsList.length} linh kiện):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {formatVND(totalCost)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Voucher giảm giá ({coupon?.code}):</span>
                <span className="font-mono">
                  -{formatVND(discountAmount)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
              <div>
                <span className="font-heading font-black text-xs uppercase text-slate-900 dark:text-white block">
                  Tổng Tiền Thanh Toán:
                </span>
                <span className="text-[10px] text-slate-400">Đã bao gồm VAT &amp; bảo hành 36T</span>
              </div>
              <span className="font-heading font-black text-xl text-rose-600 dark:text-rose-400">
                {formatVND(netTotal)}
              </span>
            </div>
          </div>

          {/* 4. PERKS & GUARANTEES */}
          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            <div className="p-2.5 bg-sky-50/50 dark:bg-slate-800/40 rounded-xl border border-sky-100 dark:border-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Wrench className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
              <span>Miễn phí 100% công lắp ráp máy</span>
            </div>
            <div className="p-2.5 bg-sky-50/50 dark:bg-slate-800/40 rounded-xl border border-sky-100 dark:border-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Bảo hành 36 tháng 1 đổi 1</span>
            </div>
          </div>

        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer text-center"
          >
            ← Chọn Thêm Linh Kiện
          </button>

          <button
            type="button"
            onClick={() => onProceedToCheckout(coupon?.code)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#0284c7] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-heading font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Tiến Hành Thanh Toán Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
