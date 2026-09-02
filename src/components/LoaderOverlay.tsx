'use client';
import React, { useState, useEffect } from 'react';

export default function LoaderOverlay() {
  const [mounted, setMounted] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Prevent scrolling while loading screen is active
    document.body.classList.add('loading-active');
    document.body.style.overflow = 'hidden';

    // Slide the doors open after page loads (matching teamdrx timing)
    const timer = setTimeout(() => {
      setIsOpen(true);

      // Remove from DOM and restore scrolling after 0.8s transition
      const removeTimer = setTimeout(() => {
        document.body.style.overflow = '';
        document.body.classList.remove('loading-active');
        setMounted(false);
      }, 800);

      return () => clearTimeout(removeTimer);
    }, 150);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      document.body.classList.remove('loading-active');
    };
  }, []);

  if (!mounted) return null;

  return (
    <div 
      id="fullPageLoading" 
      className="fixed inset-0 z-[999999] pointer-events-none overflow-hidden"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '150vh',
        minHeight: '150vh',
      }}
    >
      {/* 1. Left Door (covers left half + 1px seam, 150vh tall to prevent bottom leak) */}
      <div 
        id="doorLeft"
        className="absolute top-0 left-0 w-[50.5%] min-h-[150vh] h-[150vh] bg-white dark:bg-[#070a13] shadow-2xl pointer-events-auto border-r border-slate-100/50 dark:border-slate-800/30"
        style={{
          transform: isOpen ? 'translateX(-102%)' : 'translateX(0)',
          transition: 'transform 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
        }}
      />

      {/* 2. Right Door (covers right half + 1px seam, 150vh tall to prevent bottom leak) */}
      <div 
        id="doorRight"
        className="absolute top-0 right-0 w-[50.5%] min-h-[150vh] h-[150vh] bg-white dark:bg-[#070a13] shadow-2xl pointer-events-auto border-l border-slate-100/50 dark:border-slate-800/30"
        style={{
          transform: isOpen ? 'translateX(102%)' : 'translateX(0)',
          transition: 'transform 0.8s cubic-bezier(0.77, 0, 0.175, 1)',
        }}
      />
    </div>
  );
}
