'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Clock, 
  Wrench, 
  Truck, 
  CheckCircle2, 
  Ban, 
  ChevronDown,
  Check
} from 'lucide-react';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

interface StatusOption {
  value: OrderStatus;
  label: string;
  subLabel: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  glowColor: string;
}

export const STATUS_CONFIG: Record<OrderStatus, StatusOption> = {
  PENDING: {
    value: 'PENDING',
    label: 'Chờ Xác Nhận',
    subLabel: 'Đơn mới tạo, chờ gọi điện',
    icon: Clock,
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/15 hover:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-400',
    badgeBorder: 'border-amber-400/40 dark:border-amber-500/30',
    dotColor: 'bg-amber-500 shadow-amber-500/50',
    glowColor: 'hover:shadow-amber-500/10',
  },
  CONFIRMED: {
    value: 'CONFIRMED',
    label: 'Đã Duyệt & Ráp PC',
    subLabel: 'Đã xác nhận, đang lắp ráp',
    icon: Wrench,
    badgeBg: 'bg-sky-500/10 dark:bg-sky-500/15 hover:bg-sky-500/20',
    badgeText: 'text-sky-700 dark:text-sky-400',
    badgeBorder: 'border-sky-400/40 dark:border-sky-500/30',
    dotColor: 'bg-sky-500 shadow-sky-500/50',
    glowColor: 'hover:shadow-sky-500/10',
  },
  SHIPPING: {
    value: 'SHIPPING',
    label: 'Đang Giao Hàng',
    subLabel: 'Đã bàn giao cho shipper',
    icon: Truck,
    badgeBg: 'bg-purple-500/10 dark:bg-purple-500/15 hover:bg-purple-500/20',
    badgeText: 'text-purple-700 dark:text-purple-400',
    badgeBorder: 'border-purple-400/40 dark:border-purple-500/30',
    dotColor: 'bg-purple-500 shadow-purple-500/50',
    glowColor: 'hover:shadow-purple-500/10',
  },
  COMPLETED: {
    value: 'COMPLETED',
    label: 'Đã Hoàn Tất',
    subLabel: 'Đã giao & thu tiền COD',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15 hover:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    badgeBorder: 'border-emerald-400/40 dark:border-emerald-500/30',
    dotColor: 'bg-emerald-500 shadow-emerald-500/50',
    glowColor: 'hover:shadow-emerald-500/10',
  },
  CANCELLED: {
    value: 'CANCELLED',
    label: 'Đã Hủy Đơn',
    subLabel: 'Khách từ chối / Đơn ảo spam',
    icon: Ban,
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/15 hover:bg-rose-500/20',
    badgeText: 'text-rose-700 dark:text-rose-400',
    badgeBorder: 'border-rose-400/40 dark:border-rose-500/30',
    dotColor: 'bg-rose-500 shadow-rose-500/50',
    glowColor: 'hover:shadow-rose-500/10',
  },
};

interface OrderStatusSelectorProps {
  currentStatus: string;
  onStatusChange: (newStatus: OrderStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function OrderStatusSelector({
  currentStatus,
  onStatusChange,
  disabled = false,
  size = 'md',
}: OrderStatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeStatus = (STATUS_CONFIG[currentStatus as OrderStatus] ? currentStatus : 'PENDING') as OrderStatus;
  const currentConfig = STATUS_CONFIG[safeStatus];
  const IconComponent = currentConfig.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[10px] gap-1.5',
    md: 'px-3 py-1.5 text-[11px] gap-2',
    lg: 'px-4 py-2.5 text-xs gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between rounded-xl border font-black uppercase tracking-wider transition-all duration-200 shadow-xs cursor-pointer select-none ${
          sizeClasses[size]
        } ${currentConfig.badgeBg} ${currentConfig.badgeText} ${currentConfig.badgeBorder} ${currentConfig.glowColor} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${currentConfig.dotColor} shadow-sm animate-pulse`} />
          <IconComponent className={`${iconSizes[size]} shrink-0`} />
          <span className="font-heading">{currentConfig.label}</span>
        </span>
        <ChevronDown
          className={`w-3 h-3 ml-1 opacity-70 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-64 origin-top-right rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
            <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              CHUYỂN TRẠNG THÁI ĐƠN
            </span>
          </div>

          <div className="space-y-1">
            {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((statusKey) => {
              const option = STATUS_CONFIG[statusKey];
              const OptionIcon = option.icon;
              const isSelected = safeStatus === statusKey;

              return (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => {
                    onStatusChange(statusKey);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? `${option.badgeBg} ${option.badgeText} font-black shadow-xs`
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg border ${option.badgeBg} ${option.badgeBorder} ${option.badgeText} shrink-0`}>
                      <OptionIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-heading text-xs font-bold block truncate">
                        {option.label}
                      </span>
                      <span className="text-[9.5px] opacity-70 block truncate">
                        {option.subLabel}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 shrink-0 text-current ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
