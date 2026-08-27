'use client';
import React, { useState, useEffect } from 'react';

export default function LoaderOverlay() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // show for 1.5s
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 dark:bg-[#090d16] transition-opacity duration-500">
      <div className="flex items-center gap-6">
        {/* Logo Image */}
        <div className="w-[72px] h-[72px] shrink-0 animate-pulse">
          {/* Use the blue logo for light mode, and invert it to white for dark mode */}
          <img 
            src="/logo/loader-logo-blue.png" 
            className="w-full h-full object-contain dark:brightness-0 dark:invert" 
            alt="DRX Logo" 
          />
        </div>
        
        {/* Animated Text */}
        <div className="loader mt-2" data-text="DRX">
          DRX
        </div>
      </div>
    </div>
  );
}
