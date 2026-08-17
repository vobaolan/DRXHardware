'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface UiverseCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const UiverseCheckbox: React.FC<UiverseCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = ''
}) => {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div 
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        className={`uiverse-checkbox-box ${checked ? 'checked' : ''}`}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />}
      </div>
      {label && <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</span>}
    </label>
  );
};

export default UiverseCheckbox;
