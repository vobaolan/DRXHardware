'use client';

import React, { useRef } from 'react';
import { 
  CheckCircle2, Flame, Sparkles, Shield, 
  Clock, AlertCircle, Zap, ShieldCheck 
} from 'lucide-react';

/* ==============================================================
   1. CYBER ACTION BUTTON (UIVERSE CONIC & SHIMMER)
   ============================================================== */
export type CyberButtonVariant = 'cyan' | 'emerald' | 'crimson' | 'amber' | 'ghost' | 'shimmer';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CyberButtonVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<CyberButtonVariant, { border: string; glow: string; text: string; bg: string }> = {
  cyan: {
    border: 'from-[#0284c7] via-cyan-400 to-[#0284c7]',
    glow: 'group-hover:shadow-[0_0_20px_rgba(2,132,199,0.4)]',
    text: 'text-[#0284c7] dark:text-sky-300',
    bg: 'bg-white dark:bg-slate-950',
  },
  emerald: {
    border: 'from-emerald-500 via-teal-400 to-emerald-500',
    glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    text: 'text-emerald-600 dark:text-emerald-300',
    bg: 'bg-white dark:bg-slate-950',
  },
  crimson: {
    border: 'from-rose-500 via-pink-500 to-rose-500',
    glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]',
    text: 'text-rose-600 dark:text-rose-300',
    bg: 'bg-white dark:bg-slate-950',
  },
  amber: {
    border: 'from-amber-500 via-yellow-400 to-amber-500',
    glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    text: 'text-amber-600 dark:text-amber-300',
    bg: 'bg-white dark:bg-slate-950',
  },
  ghost: {
    border: 'from-slate-300 via-slate-200 to-slate-300 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700',
    glow: 'group-hover:shadow-[0_0_15px_rgba(148,163,184,0.2)]',
    text: 'text-slate-700 dark:text-slate-200',
    bg: 'bg-white/80 dark:bg-slate-900/80',
  },
  shimmer: {
    border: 'from-sky-400 to-[#0284c7]',
    glow: 'shadow-md shadow-sky-500/25 group-hover:shadow-sky-500/40',
    text: 'text-white',
    bg: 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9]',
  },
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2 text-xs font-extrabold rounded-xl',
  lg: 'px-6 py-3 text-sm font-extrabold rounded-2xl',
};

export const CyberButton: React.FC<CyberButtonProps> = ({
  variant = 'cyan',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}) => {
  const v = variantStyles[variant];

  if (variant === 'shimmer') {
    return (
      <button
        {...props}
        className={`uiverse-btn-shimmer relative inline-flex items-center justify-center gap-2 cursor-pointer select-none active:scale-95 will-change-transform ${sizeStyles[size]} ${className}`}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </button>
    );
  }

  return (
    <button
      {...props}
      className={`group relative inline-flex items-center justify-center p-[1.5px] rounded-xl overflow-hidden font-extrabold transition-all duration-300 active:scale-95 will-change-transform cursor-pointer select-none ${v.glow} ${className}`}
    >
      {/* Conic Shimmer Beam */}
      <span className={`absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0%,#0000_50%,currentColor_100%)] opacity-70 ${v.text}`} />
      
      {/* Inner Button Surface */}
      <span className={`relative z-10 flex items-center justify-center gap-2 ${sizeStyles[size]} ${v.bg} ${v.text} backdrop-blur-md transition-colors duration-200 group-hover:bg-opacity-90`}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </span>
    </button>
  );
};

/* ==============================================================
   2. LIVE RADAR PULSE STATUS BADGE
   ============================================================== */
export type StatusBadgeVariant = 
  | 'in-stock' 
  | 'out-of-stock' 
  | 'hot-deal' 
  | 'flash-sale' 
  | 'new-arrival' 
  | 'staff-verified' 
  | 'admin-master'
  | 'warranty'
  | 'available'
  | 'sold';

interface StatusBadgeProps {
  type: StatusBadgeVariant;
  text?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  type, 
  text, 
  size = 'md',
  className = '' 
}) => {
  const configs: Record<StatusBadgeVariant, { bg: string; dot: string; ping: string; label: string; icon?: React.ReactNode }> = {
    'in-stock': {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      label: text || 'CÒN HÀNG',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    'available': {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      label: text || 'SẴN SÀNG TRONG KHO',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    'out-of-stock': {
      bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      dot: 'bg-rose-500',
      ping: 'hidden',
      label: text || 'HẾT HÀNG',
      icon: <AlertCircle className="w-3 h-3" />,
    },
    'sold': {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-400',
      ping: 'hidden',
      label: text || 'ĐÃ XUẤT BÁN',
    },
    'warranty': {
      bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
      ping: 'bg-amber-400',
      label: text || 'ĐANG BẢO HÀNH',
      icon: <Clock className="w-3 h-3" />,
    },
    'hot-deal': {
      bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-xs shadow-amber-500/10',
      dot: 'bg-amber-500',
      ping: 'bg-amber-400 animate-ping duration-700',
      label: text || 'HOT DEAL',
      icon: <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />,
    },
    'flash-sale': {
      bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 shadow-xs shadow-rose-500/10',
      dot: 'bg-rose-500',
      ping: 'bg-rose-400 animate-ping duration-500',
      label: text || 'FLASH SALE',
      icon: <Zap className="w-3 h-3 fill-rose-500 text-rose-500" />,
    },
    'new-arrival': {
      bg: 'bg-sky-50 dark:bg-sky-950/50 text-[#0284c7] dark:text-sky-300 border-sky-200 dark:border-sky-800',
      dot: 'bg-[#0284c7]',
      ping: 'bg-sky-400 animate-ping',
      label: text || 'MỚI VỀ',
      icon: <Sparkles className="w-3 h-3" />,
    },
    'staff-verified': {
      bg: 'bg-sky-50 dark:bg-sky-950/50 text-[#0284c7] dark:text-sky-300 border-sky-200 dark:border-sky-800',
      dot: 'bg-[#0284c7]',
      ping: 'bg-sky-400 animate-ping',
      label: text || 'NHÂN VIÊN (STAFF)',
      icon: <ShieldCheck className="w-3 h-3" />,
    },
    'admin-master': {
      bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      dot: 'bg-purple-500',
      ping: 'bg-purple-400 animate-ping',
      label: text || 'QUẢN TRỊ VIÊN (ADMIN)',
      icon: <Shield className="w-3 h-3" />,
    },
  };

  const cfg = configs[type];
  const sizeCls = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-mono font-black tracking-wider border backdrop-blur-md shadow-2xs select-none ${sizeCls} ${cfg.bg} ${className}`}>
      <span className="relative flex h-2 w-2 shrink-0">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.ping}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
      </span>
      {cfg.icon && <span className="shrink-0">{cfg.icon}</span>}
      <span>{cfg.label}</span>
    </span>
  );
};

/* ==============================================================
   3. KPI STAT CARD WITH CIRCUIT BACKGROUND (ADMIN / STAFF)
   ============================================================== */
interface KPISparkCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  subValue?: string;
  isPositive?: boolean;
  accentColor?: 'emerald' | 'sky' | 'amber' | 'purple' | 'rose';
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

const accentConfig = {
  emerald: {
    border: 'hover:border-emerald-500/50',
    topLine: 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    flare: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    circuit: 'text-emerald-500',
  },
  sky: {
    border: 'hover:border-[#0284c7]/50',
    topLine: 'bg-gradient-to-r from-transparent via-sky-400 to-transparent',
    iconBg: 'bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-400 border-sky-200 dark:border-sky-800',
    flare: 'bg-sky-500/10 group-hover:bg-sky-500/20',
    circuit: 'text-sky-500',
  },
  amber: {
    border: 'hover:border-amber-500/50',
    topLine: 'bg-gradient-to-r from-transparent via-amber-400 to-transparent',
    iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    flare: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    circuit: 'text-amber-500',
  },
  purple: {
    border: 'hover:border-purple-500/50',
    topLine: 'bg-gradient-to-r from-transparent via-purple-400 to-transparent',
    iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    flare: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    circuit: 'text-purple-500',
  },
  rose: {
    border: 'hover:border-rose-500/50',
    topLine: 'bg-gradient-to-r from-transparent via-rose-400 to-transparent',
    iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    flare: 'bg-rose-500/10 group-hover:bg-rose-500/20',
    circuit: 'text-rose-500',
  },
};

export const KPISparkCard: React.FC<KPISparkCardProps> = ({
  title,
  value,
  subtitle,
  subValue,
  isPositive,
  accentColor = 'sky',
  icon: Icon,
  className = '',
}) => {
  const cfg = accentConfig[accentColor];

  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 backdrop-blur-xl shadow-xs transition-all duration-300 ${cfg.border} hover:-translate-y-1 hover:shadow-xl will-change-transform ${className}`}>
      {/* Top Hologram Line */}
      <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${cfg.topLine}`} />

      {/* Ambient Corner Flare */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all duration-500 ${cfg.flare}`} />

      {/* Cyber Circuit Vector Trace */}
      <svg className={`absolute right-1 bottom-1 w-28 h-28 opacity-[0.04] dark:opacity-[0.08] pointer-events-none ${cfg.circuit}`} viewBox="0 0 100 100">
        <path d="M10 90 L50 90 L70 70 L90 70" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="90" cy="70" r="3" fill="currentColor" />
        <path d="M20 10 L60 10 L80 30" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="80" cy="30" r="3" fill="currentColor" />
      </svg>

      <div className="relative flex items-center justify-between">
        <div className="space-y-1 min-w-0 pr-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate font-heading">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
          {(subtitle || subValue) && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold mt-1.5">
              {subValue && (
                <span className={isPositive === undefined ? 'text-slate-500 dark:text-slate-400' : isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                  {subValue}
                </span>
              )}
              {subtitle && (
                <span className="text-slate-500 dark:text-slate-400 truncate">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={`p-3 rounded-2xl border shrink-0 transition-transform duration-300 group-hover:scale-110 ${cfg.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
