import React from 'react';

export interface HardwareIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

// 1. LAPTOP (Clean thin-bezel laptop with trackpad - Tabler DeviceLaptop standard)
export function IconLaptop({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <circle cx="12" cy="6" r="0.5" fill="currentColor" />
      <path d="M2 19h20" />
      <path d="M9 16v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1 -1v-1" />
    </svg>
  );
}

// 2. LAPTOP GAMING (Performance gaming laptop with D-pad & gaming controls on screen)
export function IconLaptopGaming({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M2 19h20" />
      <path d="M9 16v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1 -1v-1" />
      <path d="M6.5 19.5h2.5m6 0h2.5" />
      {/* Gaming crosshair & AB buttons */}
      <path d="M7 10h2.5m-1.25 -1.25v2.5" />
      <circle cx="15" cy="9.25" r="0.75" fill="currentColor" />
      <circle cx="16.75" cy="10.75" r="0.75" fill="currentColor" />
    </svg>
  );
}

// 3. CPU / PROCESSOR (Authentic chip with IHS heatspreader & motherboard contact pins)
export function IconCpu({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1" />
      <path d="M5 8l3 -3" />
      {/* Contact pins */}
      <path d="M9 2v3m3 -3v3m3 -3v3" />
      <path d="M9 19v3m3 -3v3m3 -3v3" />
      <path d="M2 9h3m-3 3h3m-3 3h3" />
      <path d="M19 9h3m-3 3h3m-3 3h3" />
    </svg>
  );
}

// 4. MAINBOARD / MOTHERBOARD (Circuit board with CPU socket, PCIe slot, and RAM traces)
export function IconMainboard({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      {/* CPU Socket */}
      <rect x="6" y="6" width="6" height="6" rx="0.75" />
      <path d="M12 6.5h1v5" />
      {/* RAM Slots */}
      <path d="M15 6v7m2.5 -7v7" />
      {/* PCIe GPU slot */}
      <path d="M6 16h12" />
      {/* Audio & Power capacitors */}
      <circle cx="8" cy="13.5" r="0.75" fill="currentColor" />
      <circle cx="10.5" cy="13.5" r="0.75" fill="currentColor" />
      <path d="M15 16v2m2.5 -2v2" />
    </svg>
  );
}

// 5. VGA / GRAPHICS CARD (Dedicated GPU with dual fans, PCIe fingers & bracket)
export function IconVga({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Shroud Body */}
      <path d="M3 7h16a2 2 0 0 1 2 2v7a2 2 0 0 1 -2 2h-16a1 1 0 0 1 -1 -1v-9a1 1 0 0 1 1 -1z" />
      {/* Bracket */}
      <path d="M2 5v14" />
      <path d="M2 9.5h1m-1 3h1" />
      {/* Dual Fans */}
      <circle cx="8" cy="12.5" r="2.75" />
      <circle cx="8" cy="12.5" r="0.75" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="2.75" />
      <circle cx="14.5" cy="12.5" r="0.75" fill="currentColor" />
      {/* PCIe Fingers */}
      <path d="M7 18v2m2.5 -2v2m2.5 -2v2m2.5 -2v2" />
      {/* 8-Pin Power */}
      <path d="M15 7v-1.5h3v1.5" />
    </svg>
  );
}

// 6. RAM / MEMORY STICK (Desktop DIMM Module with memory ICs, notch & gold contacts)
export function IconRam({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* DIMM PCB */}
      <path d="M2 8a1 1 0 0 1 1 -1h18a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-18a1 1 0 0 1 -1 -1z" />
      {/* DRAM Chips */}
      <rect x="4.5" y="9.5" width="2.75" height="4" rx="0.5" />
      <rect x="8.5" y="9.5" width="2.75" height="4" rx="0.5" />
      <rect x="12.75" y="9.5" width="2.75" height="4" rx="0.5" />
      <rect x="16.75" y="9.5" width="2.75" height="4" rx="0.5" />
      {/* Gold Contact Pins & DIMM Key Notch */}
      <path d="M3 17v1.5m2 -1.5v1.5m2 -1.5v1.5m6 -1.5v1.5m2 -1.5v1.5m2 -1.5v1.5m2 -1.5v1.5" />
      <path d="M10 17v-1.25a0.5 0.5 0 0 1 1 0v1.25" />
    </svg>
  );
}

// 7. STORAGE / SSD NVMe M.2 (Ultra-fast NVMe stick with NAND & M-Key pins)
export function IconStorage({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 7a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z" />
      {/* Screw cutout */}
      <path d="M3 10.5a1.5 1.5 0 0 1 0 3" />
      {/* NVMe Controller */}
      <rect x="6.5" y="9.5" width="3.5" height="5" rx="0.5" />
      {/* NAND Flash packages */}
      <rect x="12" y="9" width="4.5" height="2.75" rx="0.5" />
      <rect x="12" y="12.25" width="4.5" height="2.75" rx="0.5" />
      {/* Gold Fingers */}
      <path d="M21 9.5h-1.5m1.5 2.5h-1.5m1.5 2.5h-1.5" />
    </svg>
  );
}

// 8. PSU / POWER SUPPLY (ATX Power Supply Unit with intake fan and power outlet)
export function IconPsu({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="11" cy="12" r="5" />
      <circle cx="11" cy="12" r="1.5" />
      <path d="M11 7.5v2.5m0 4v2.5m-4.5 -4.5h2.5m4 0h2.5" />
      {/* AC Inlet & Rocker Switch */}
      <rect x="17.5" y="7" width="2" height="4" rx="0.5" />
      <path d="M18.5 14v3" />
    </svg>
  );
}

// 9. CASE / CHASSIS (Gaming PC Case with panoramic glass & front mesh)
export function IconCase({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 6.5h8v11h-8z" />
      <path d="M6.5 7v10" />
      <circle cx="16" cy="4.75" r="0.6" fill="currentColor" />
      <path d="M7 21v1m10 -1v1" />
    </svg>
  );
}

// 10. COOLING / AIO WATER COOLER (Aerodynamic fan blades with AIO radiator loop)
export function IconCooling({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.5" />
      {/* 4 aerodynamic curved fan blades */}
      <path d="M12 9.5c0 -2.5 1.5 -4.5 4.2 -4.2c0 2.5 -1.5 4.5 -4.2 4.2z" />
      <path d="M14.5 12c2.5 0 4.5 1.5 4.2 4.2c-2.5 0 -4.5 -1.5 -4.2 -4.2z" />
      <path d="M12 14.5c0 2.5 -1.5 4.5 -4.2 4.2c0 -2.5 1.5 -4.5 4.2 -4.2z" />
      <path d="M9.5 12c-2.5 0 -4.5 -1.5 -4.2 -4.2c2.5 0 4.5 1.5 4.2 4.2z" />
    </svg>
  );
}

// 11. MONITOR (Ultra-slim bezel Gaming Monitor with ergonomic base)
export function IconMonitor({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M12 16v4" />
      <path d="M7 20h10" />
    </svg>
  );
}

// 12. KEYBOARD (Mechanical Keyboard with switches & spacebar)
export function IconKeyboard({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M5.5 10h.01m3.49 0h.01m3.49 0h.01m3.49 0h.01m3.49 0h.01" />
      <path d="M5.5 14h.01m12.99 0h.01" />
      <path d="M8.5 14h7" />
    </svg>
  );
}

// 13. MOUSE (Ergonomic gaming mouse with scroll wheel & thumb buttons)
export function IconMouse({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="6" y="3" width="12" height="18" rx="6" />
      <path d="M12 3v5" />
      <rect x="10.5" y="6" width="3" height="4" rx="1.5" />
      <path d="M6 9.5h-1m1 3h-1" />
    </svg>
  );
}

// 14. HEADSET (Over-ear gaming headset with boom microphone)
export function IconHeadset({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 14a8 8 0 0 1 16 0" />
      <rect x="3" y="13" width="4" height="6" rx="2" />
      <rect x="17" y="13" width="4" height="6" rx="2" />
      <path d="M5 19a3 3 0 0 0 3 3h3" />
      <circle cx="12" cy="22" r="1" fill="currentColor" />
    </svg>
  );
}

// 15. GAMEPAD (Console & PC Gaming controller)
export function IconGamepad({ size = 24, className = '', strokeWidth = 1.8, ...props }: HardwareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 11h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -5 2.2l-1.5 -1.2h-5l-1.5 1.2a3 3 0 0 1 -5 -2.2v-2a3 3 0 0 1 3 -3z" />
      <path d="M7 14h2.5m-1.25 -1.25v2.5" />
      <circle cx="15.5" cy="13.5" r="0.75" fill="currentColor" />
      <circle cx="17.5" cy="14.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

// Helper mapping for category IDs
export function getHardwareCategoryIcon(categoryId: string): React.ComponentType<HardwareIconProps> {
  const normalized = (categoryId || '').toUpperCase();
  switch (normalized) {
    case 'LAPTOP':
      return IconLaptop;
    case 'LAPTOP_GAMING':
      return IconLaptopGaming;
    case 'CORE_PARTS':
    case 'CPU':
      return IconCpu;
    case 'MAINBOARD':
      return IconMainboard;
    case 'VGA':
    case 'GPU':
      return IconVga;
    case 'RAM':
      return IconRam;
    case 'STORAGE':
    case 'SSD':
    case 'HDD':
      return IconStorage;
    case 'PSU':
    case 'POWER':
      return IconPsu;
    case 'CASE':
      return IconCase;
    case 'COOLING':
      return IconCooling;
    case 'CASE_COOLING':
      return IconCase;
    case 'MONITOR':
      return IconMonitor;
    case 'KEYBOARD':
      return IconKeyboard;
    case 'MOUSE':
      return IconMouse;
    case 'HEADSET':
    case 'HEADPHONES':
      return IconHeadset;
    case 'GAMEPAD':
    case 'GEAR':
      return IconGamepad;
    default:
      return IconCpu;
  }
}
