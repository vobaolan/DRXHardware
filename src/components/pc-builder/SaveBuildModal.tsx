'use client';

import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Bookmark, 
  Sparkles, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { showToast } from '@/components/Toast';
import { HardwareProduct } from '@/lib/hardware-data';
import Link from 'next/link';

interface SaveBuildModalProps {
  build: Record<string, HardwareProduct | null>;
  totalCost: number;
  defaultBuildName?: string;
  onClose: () => void;
  onSaved: (savedBuild: any) => void;
}

const formatVND = (num: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

export function SaveBuildModal({
  build,
  totalCost,
  defaultBuildName,
  onClose,
  onSaved
}: SaveBuildModalProps) {
  const [buildName, setBuildName] = useState(defaultBuildName || 'Cấu Hình DRX Build Gaming');
  const [note, setNote] = useState('');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  const selectedItems = Object.entries(build)
    .filter(([_, item]) => item !== null)
    .map(([key, item]) => ({
      stepKey: key,
      category: (item as HardwareProduct).category,
      product: item as HardwareProduct
    }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildName.trim()) {
      showToast('Vui lòng nhập tên cho cấu hình PC!', 'error');
      return;
    }

    const newSavedBuild = {
      id: `build-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: buildName.trim(),
      savedAt: new Date().toISOString(),
      totalPrice: totalCost,
      note: note.trim(),
      itemCount: selectedItems.length,
      items: selectedItems,
      buildState: build, // full state to reload later
    };

    try {
      const existingRaw = localStorage.getItem('drx_saved_pc_builds');
      let list: any[] = [];
      if (existingRaw) {
        try {
          list = JSON.parse(existingRaw);
          if (!Array.isArray(list)) list = [];
        } catch {
          list = [];
        }
      }

      // Add to beginning
      const updatedList = [newSavedBuild, ...list.filter(b => b.id !== newSavedBuild.id)];
      localStorage.setItem('drx_saved_pc_builds', JSON.stringify(updatedList));

      showToast(`Đã lưu cấu hình "${newSavedBuild.name}" vào tài khoản!`, 'success');
      setIsSavedSuccess(true);
      onSaved(newSavedBuild);
    } catch (e) {
      showToast('Lỗi khi lưu cấu hình vào bộ nhớ máy.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl text-slate-900 dark:text-slate-100 relative overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">
                LƯU CẤU HÌNH VÀO TÀI KHOẢN
              </h3>
              <p className="text-[11px] text-slate-500">
                Hiển thị trong mục "Cấu Hình DRX Build" của Profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSavedSuccess ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h4 className="font-heading text-sm font-black uppercase text-slate-900 dark:text-white">
                ĐÃ LƯU CẤU HÌNH THÀNH CÔNG!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Cấu hình <strong>"{buildName}"</strong> đã được lưu an toàn vào tài khoản của bạn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <Link
                href="/profile"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black uppercase tracking-wider shadow-md text-center flex items-center justify-center gap-1.5"
              >
                <span>Xem Trong Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Tiếp Tục Dựng PC
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Summary Preview */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-slate-500">
                <span>Số lượng linh kiện đã chọn:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedItems.length} Linh Kiện</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span>Tổng giá trị cấu hình:</span>
                <span className="font-mono font-black text-sm text-[#0284c7]">{formatVND(totalCost)}</span>
              </div>
            </div>

            {/* Input Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                Đặt Tên Cho Cấu Hình PC:
              </label>
              <input
                type="text"
                required
                placeholder="VD: PC Gaming RTX 4070 Ti Super, PC Render 3D..."
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#0284c7]"
              />
            </div>

            {/* Input Note */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                Ghi chú thêm (Tùy chọn):
              </label>
              <textarea
                rows={2}
                placeholder="VD: Cấu hình chuẩn bị nâng cấp cho em trai vào tháng sau..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-[#0284c7]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Cấu Hình</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
