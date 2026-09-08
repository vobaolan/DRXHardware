'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  description?: string;
}

interface ModernSelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (val: any) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
  searchable?: boolean;
  searchPlaceholder?: string;
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export const ModernSelect: React.FC<ModernSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn một mục...',
  className = '',
  disabled = false,
  align = 'left',
  searchable,
  searchPlaceholder = 'Tìm kiếm nhanh...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number; openUpward: boolean }>({
    left: 0,
    width: 260,
    openUpward: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const isSearchEnabled = searchable !== undefined ? searchable : options.length > 7;
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update popup position
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const minSpaceBelow = 240;
    const openUpward = spaceBelow < minSpaceBelow && rect.top > minSpaceBelow;
    const popoverWidth = Math.max(rect.width, 280);

    let left = rect.left;
    if (align === 'right') {
      left = rect.right - popoverWidth;
    }
    // Clamp horizontally to stay inside viewport
    left = Math.max(12, Math.min(left, window.innerWidth - popoverWidth - 12));

    if (openUpward) {
      setCoords({
        bottom: window.innerHeight - rect.top + 6,
        left,
        width: popoverWidth,
        openUpward: true,
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        left,
        width: popoverWidth,
        openUpward: false,
      });
    }
  };

  // When open state changes
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      setSearchTerm('');
      setTimeout(() => {
        searchInputRef.current?.focus();
        if (listContainerRef.current) {
          const selectedEl = listContainerRef.current.querySelector('[data-selected="true"]');
          if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest' });
          }
        }
      }, 60);

      const handleScroll = (e: Event) => {
        if (popoverRef.current && popoverRef.current.contains(e.target as Node)) return;
        updatePosition();
      };
      const handleResize = () => updatePosition();
      const handleClickOutside = (e: MouseEvent) => {
        if (
          popoverRef.current &&
          !popoverRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
  };

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const cleanSearch = removeVietnameseTones(searchTerm.trim());
    return options.filter((opt) => {
      const labelMatch = removeVietnameseTones(opt.label).includes(cleanSearch);
      const valMatch = removeVietnameseTones(String(opt.value)).includes(cleanSearch);
      const descMatch = opt.description ? removeVietnameseTones(opt.description).includes(cleanSearch) : false;
      return labelMatch || valMatch || descMatch;
    });
  }, [options, searchTerm]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* TRIGGER BUTTON */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        title={selectedOption ? selectedOption.label : placeholder}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 outline-none select-none cursor-pointer ${
          isOpen
            ? 'bg-white dark:bg-slate-900 border-[#0284c7] ring-2 ring-[#0284c7]/20 shadow-md text-slate-900 dark:text-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-100 shadow-2xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0 flex-1">
          {selectedOption?.icon && <span className="shrink-0 text-slate-400">{selectedOption.icon}</span>}
          <span className="truncate block font-bold text-slate-900 dark:text-white">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] border border-sky-200 dark:border-sky-800 shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="shrink-0 text-slate-400 dark:text-slate-500"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* FLOATING PORTAL POPOVER */}
      {mounted && isOpen && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: coords.top !== undefined ? `${coords.top}px` : undefined,
            bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            zIndex: 99999,
          }}
          className="rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* SEARCH BAR */}
          {isSearchEnabled && (
            <div className="relative mb-2 px-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0284c7]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* LIST OF OPTIONS */}
          <div ref={listContainerRef} className="max-h-60 overflow-y-auto space-y-1 pr-1 overscroll-contain">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    data-selected={isSelected ? 'true' : undefined}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left cursor-pointer group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-xs font-black'
                        : 'text-slate-800 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-[#0284c7] dark:hover:text-sky-300 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                      {opt.icon && (
                        <span className={`shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-[#0284c7]'}`}>
                          {opt.icon}
                        </span>
                      )}
                      <div className="truncate">
                        <span className="block truncate">{opt.label}</span>
                        {opt.description && (
                          <span className={`text-[10px] block font-normal truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                Không tìm thấy kết quả phù hợp
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
