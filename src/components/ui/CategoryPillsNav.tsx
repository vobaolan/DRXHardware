'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Grid, Cpu, Layers, HardDrive, Zap, Box, Fan, 
  Monitor, Gamepad2, Laptop, Sparkles, ChevronLeft, ChevronRight 
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const HARDWARE_CATEGORIES: CategoryItem[] = [
  { id: 'ALL', label: 'TẤT CẢ', icon: <Grid className="w-3.5 h-3.5" /> },
  { id: 'CPU', label: 'CPU / VI XỬ LÝ', icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: 'VGA', label: 'VGA / CARD ĐỒ HỌA', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'MAINBOARD', label: 'BO MẠCH CHỦ', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'RAM', label: 'BỘ NHỚ RAM', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'STORAGE', label: 'SSD / HDD', icon: <HardDrive className="w-3.5 h-3.5" /> },
  { id: 'PSU', label: 'NGUỒN PSU', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'CASE', label: 'VỎ CASE', icon: <Box className="w-3.5 h-3.5" /> },
  { id: 'COOLING', label: 'TẢN NHIỆT', icon: <Fan className="w-3.5 h-3.5" /> },
  { id: 'MONITOR', label: 'MÀN HÌNH', icon: <Monitor className="w-3.5 h-3.5" /> },
  { id: 'GEAR', label: 'GAMING GEAR', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  { id: 'LAPTOP', label: 'LAPTOP', icon: <Laptop className="w-3.5 h-3.5" /> },
  { id: 'PREBUILT_PC', label: 'PC ĐỒNG BỘ', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

interface CategoryPillsNavProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  categories?: CategoryItem[];
  className?: string;
}

export const CategoryPillsNav: React.FC<CategoryPillsNavProps> = ({
  selectedCategory,
  onSelectCategory,
  categories = HARDWARE_CATEGORIES,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 280;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className={`relative w-full group ${className}`}>
      {/* LEFT SCROLL BUTTON */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#0284c7] hover:border-[#0284c7] transition-all cursor-pointer"
          title="Cuộn sang trái"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* LEFT FADE GRADIENT */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent pointer-events-none z-10" />
      )}

      {/* SCROLLABLE PILLS CONTAINER */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth"
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold uppercase transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-md shadow-sky-500/20 scale-[1.02] ring-2 ring-sky-400/30'
                  : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 hover:border-[#0284c7] hover:text-[#0284c7] hover:bg-sky-50/50 dark:hover:bg-slate-800 shadow-2xs'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                {cat.icon}
              </span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* RIGHT FADE GRADIENT */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent pointer-events-none z-10" />
      )}

      {/* RIGHT SCROLL BUTTON */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-[#0284c7] hover:border-[#0284c7] transition-all cursor-pointer"
          title="Cuộn sang phải"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
