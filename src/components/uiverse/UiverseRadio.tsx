'use client';

import React from 'react';

interface UiverseRadioProps {
  checked: boolean;
  onChange: () => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const UiverseRadio: React.FC<UiverseRadioProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = ''
}) => {
  return (
    <label 
      onClick={() => !disabled && onChange()}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className={`uiverse-radio-box ${checked ? 'checked' : ''}`} />
      {label && <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</span>}
    </label>
  );
};

export default UiverseRadio;
