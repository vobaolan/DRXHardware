'use client';

import React from 'react';

interface UiverseTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const UiverseTooltip: React.FC<UiverseTooltipProps> = ({
  content,
  children,
  className = ''
}) => {
  return (
    <div className={`uiverse-tooltip-container ${className}`}>
      {children}
      <div className="uiverse-tooltip-popup">
        {content}
      </div>
    </div>
  );
};

export default UiverseTooltip;
