'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle, Trash2, HelpCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  confirmAction: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let globalShowToast: (message: string, type?: ToastType) => void = () => {};
let globalShowConfirm: (options: ConfirmOptions) => void = () => {};

export const showToast = (message: string, type: ToastType = 'info') => {
  if (globalShowToast) {
    globalShowToast(message, type);
  }
};

export const showConfirm = (options: ConfirmOptions) => {
  if (globalShowConfirm) {
    globalShowConfirm(options);
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  } | null>(null);

  const triggerToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const triggerConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmConfig({
      isOpen: true,
      title: options.title || 'Xác Nhận Thao Tác',
      message: options.message,
      confirmText: options.confirmText || 'Xác Nhận',
      cancelText: options.cancelText || 'Hủy Bỏ',
      variant: options.variant || 'danger',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    });
  }, []);

  useEffect(() => {
    globalShowToast = triggerToast;
    globalShowConfirm = triggerConfirm;
  }, [triggerToast, triggerConfirm]);

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmConfig?.isOpen) {
        if (confirmConfig.onCancel) confirmConfig.onCancel();
        setConfirmConfig(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmConfig]);

  return (
    <ToastContext.Provider value={{ showToast: triggerToast, confirmAction: triggerConfirm }}>
      {children}

      {/* TOAST NOTIFICATION STACK */}
      <div className="fixed bottom-5 right-5 z-[999999] flex flex-col space-y-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`flex items-center space-x-3 rounded-2xl p-3.5 shadow-2xl border text-xs font-semibold pointer-events-auto backdrop-blur-md ${
                t.type === 'success'
                  ? 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-950/30'
                  : t.type === 'error'
                  ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-950/30'
                  : 'bg-slate-900/95 text-white border-sky-500/40 shadow-sky-950/30'
              }`}
            >
              {t.type === 'success' && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />}
              {t.type === 'info' && <Info className="h-4.5 w-4.5 text-sky-400 shrink-0" />}
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* IN-WEBSITE BEAUTIFUL CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {confirmConfig?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (confirmConfig.onCancel) confirmConfig.onCancel();
              setConfirmConfig(null);
            }}
            className="fixed inset-0 z-[9999999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl shadow-slate-950/20 relative overflow-hidden space-y-5"
            >
              {/* Close 'X' Button in Top Right */}
              <button
                type="button"
                onClick={() => {
                  if (confirmConfig.onCancel) confirmConfig.onCancel();
                  setConfirmConfig(null);
                }}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4 pr-6">
                {/* Icon Badge */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    confirmConfig.variant === 'danger'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60'
                      : confirmConfig.variant === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60'
                      : 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/60'
                  }`}
                >
                  {confirmConfig.variant === 'danger' ? (
                    <Trash2 className="w-6 h-6" />
                  ) : confirmConfig.variant === 'warning' ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <Info className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 dark:bg-sky-950/80 text-[#0284c7] dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
                    DRX HARDWARE
                  </div>
                  <h3 className="font-heading text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {confirmConfig.title}
                  </h3>
                </div>
              </div>

              {/* Message Content */}
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-0.5">
                {confirmConfig.message}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    if (confirmConfig.onCancel) confirmConfig.onCancel();
                    setConfirmConfig(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  {confirmConfig.cancelText}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const action = confirmConfig.onConfirm;
                    setConfirmConfig(null);
                    await action();
                  }}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                    confirmConfig.variant === 'danger'
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/20'
                      : confirmConfig.variant === 'warning'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/20'
                      : 'bg-gradient-to-r from-[#0284c7] to-blue-600 hover:from-[#0369a1] hover:to-blue-700 shadow-sky-500/20'
                  }`}
                >
                  {confirmConfig.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
