'use client';

import React from 'react';

interface UiverseLoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UiverseLoader: React.FC<UiverseLoaderProps> = ({
  text,
  size = 'md',
  className = ''
}) => {
  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}>
      <div className="uiverse-loader-dots">
        <div className="uiverse-loader-dot" />
        <div className="uiverse-loader-dot" />
        <div className="uiverse-loader-dot" />
      </div>
      {text && <span className="text-[11px] font-bold text-[#0284c7] dark:text-[#6EC2F7] tracking-wide">{text}</span>}
    </div>
  );
};

export default UiverseLoader;
