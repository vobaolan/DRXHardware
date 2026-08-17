'use client';

import React from 'react';

interface UiverseToggleProps {
  active: boolean;
  onToggle: (active: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const UiverseToggle: React.FC<UiverseToggleProps> = ({
  active,
  onToggle,
  label,
  disabled = false,
  className = ''
}) => {
  return (
    <label 
      onClick={() => !disabled && onToggle(!active)}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className={`uiverse-toggle-track ${active ? 'active' : ''}`}>
        <div className="uiverse-toggle-thumb" />
      </div>
      {label && <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</span>}
    </label>
  );
};

export default UiverseToggle;
