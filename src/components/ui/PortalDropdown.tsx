'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface PortalDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  minSpaceBelow?: number;
}

export function PortalDropdown({
  isOpen,
  onClose,
  triggerRef,
  children,
  width = 240,
  align = 'left',
  className = '',
  minSpaceBelow = 220,
}: PortalDropdownProps) {
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; openUpward: boolean }>({
    left: 0,
    openUpward: false,
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = typeof width === 'number' ? width : 240;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < minSpaceBelow && rect.top > minSpaceBelow;

    let left = rect.left;
    if (align === 'right') {
      left = rect.right - popoverWidth;
    } else if (align === 'center') {
      left = rect.left + rect.width / 2 - popoverWidth / 2;
    }

    // Clamp horizontally to stay inside viewport with 12px margin
    left = Math.max(12, Math.min(left, window.innerWidth - popoverWidth - 12));

    if (openUpward) {
      setCoords({
        bottom: window.innerHeight - rect.top + 6,
        left,
        openUpward: true,
      });
    } else {
      setCoords({
        top: rect.bottom + 6,
        left,
        openUpward: false,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
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
          onClose();
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
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: coords.top !== undefined ? `${coords.top}px` : undefined,
        bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
        left: `${coords.left}px`,
        width: typeof width === 'number' ? `${width}px` : width,
        zIndex: 99999,
      }}
      className={`rounded-2xl bg-white/98 dark:bg-slate-900/98 border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 ${className}`}
    >
      {children}
    </div>,
    document.body
  );
}
