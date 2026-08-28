'use client';
import React, { useState, useEffect } from 'react';

export default function LoaderOverlay() {
  const [mounted, setMounted] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Prevent scrolling while loading screen is active
    document.body.style.overflow = 'hidden';

    // Slide the doors open after page loads
    const timer = setTimeout(() => {
      setIsOpen(true);

      // Remove from DOM and restore scrolling after 0.8s transition
      const removeTimer = setTimeout(() => {
        document.body.style.overflow = '';
        setMounted(false);
      }, 800);

      return () => clearTimeout(removeTimer);
    }, 400);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted) return null;

  return (
    <div 
      id="fullPageLoading" 
      className="fixed inset-0 z-[999999] pointer-events-none flex items-center justify-center overflow-hidden"
    >
      {/* 1. Left Door (50vw width, slides to -100%) */}
      <div 
        id="doorLeft"
        className="absolute top-0 left-0 w-1/2 h-full bg-white dark:bg-[#070a13] shadow-2xl pointer-events-auto border-r border-slate-100 dark:border-slate-800/40"
        style={{
          transform: isOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
        }}
      />

      {/* 2. Right Door (50vw width, slides to 100%) */}
      <div 
        id="doorRight"
        className="absolute top-0 right-0 w-1/2 h-full bg-white dark:bg-[#070a13] shadow-2xl pointer-events-auto border-l border-slate-100 dark:border-slate-800/40"
        style={{
          transform: isOpen ? 'translateX(100%)' : 'translateX(0)',
          transition: 'transform 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
        }}
      />

      {/* 3. Center DRX Brand Emblem (Exact match to teamdrx.vercel.app reference) */}
      <div 
        className="relative z-10 flex items-center justify-center transition-all duration-400 ease-out"
        style={{
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scale(0.95)' : 'scale(1)',
          pointerEvents: 'none',
        }}
      >
        <div className="flex items-center gap-4 sm:gap-6 px-6 py-4">
          {/* DRX Symbol Icon */}
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
            <img 
              src="/logo/symbol-white.png"
              alt="DRX Symbol"
              className="max-h-12 sm:max-h-16 object-contain hidden dark:inline-block"
            />
            <img 
              src="/logo/symbol-black.png"
              alt="DRX Symbol"
              className="max-h-12 sm:max-h-16 object-contain inline-block dark:hidden"
            />
          </div>

          {/* DRX Wordmark Typography */}
          <div className="flex items-center">
            <span className="font-heading font-black italic tracking-tighter text-3xl sm:text-5xl text-[#102284] dark:text-white select-none drop-shadow-xs">
              DRX
            </span>
          </div>

          {/* Sleek Vertical Divider Bar */}
          <div className="w-[3px] h-10 sm:h-14 bg-[#102284] dark:bg-[#38bdf8] rounded-full self-center ml-1" />
        </div>
      </div>
    </div>
  );
}
