"use client";

import { useEffect } from 'react';
import { showToast } from '@/components/Toast';

/**
 * SecurityShield Component
 * Protects DRX Hardware website from:
 * 1. F12 DevTools inspection shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
 * 2. Unauthorized right-click context menu inspection
 * 3. Leaking sensitive data / debug objects into Console
 * 4. Self-XSS attacks via Console warning banner
 */
export function SecurityShield() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    let lastToastTime = 0;
    const showSecurityNotice = (message: string) => {
      const now = Date.now();
      if (now - lastToastTime > 3000) {
        lastToastTime = now;
        showToast(message, 'info');
      }
    };

    // 1. Keyboard Shortcut Blocker
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityNotice('Hệ thống DRX Hardware đã khóa phím tắt F12 để bảo vệ an toàn dữ liệu.');
        return false;
      }

      // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
      // Mac: Cmd+Option+I, Cmd+Option+J, Cmd+Option+C
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')
      ) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityNotice('Tính năng kiểm tra mã nguồn (Inspect DevTools) đã được vô hiệu hóa vì lý do an ninh.');
        return false;
      }

      // Ctrl+U (View Page Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        showSecurityNotice('Tính năng xem mã nguồn trực tiếp (View Source) đã bị khóa.');
        return false;
      }

      // Ctrl+S (Save Page HTML)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          return true;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 2. Right-click Context Menu Protection
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Allow user to right-click inside form inputs and textareas for copy/paste
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return true;
      }

      e.preventDefault();
      showSecurityNotice('Bảo vệ bản quyền & an ninh mã nguồn: Thao tác nhấp chuột phải đã được bảo vệ.');
      return false;
    };

    // 3. Cyber Defense Console Banner & Overwrite in Production
    const printSecurityBanner = () => {
      try {
        console.log(
          '%c🛡️ DRX HARDWARE CYBER DEFENSE SYSTEM 🛡️',
          'color: #0284c7; font-size: 22px; font-weight: 900; background: #0b1329; padding: 10px 20px; border-radius: 8px; border: 2px solid #0284c7;'
        );
        console.log(
          '%c⚠️ CẢNH BÁO AN NINH (SECURITY WARNING):\n%cĐây là khu vực kỹ thuật dành riêng cho quản trị viên hệ thống.\nTuyệt đối KHÔNG dán (Paste) bất kỳ mã lệnh script nào vào đây. Hành vi này có thể khiến tài khoản của bạn bị đánh cắp (Self-XSS) hoặc bị khóa vĩnh viễn.',
          'color: #ef4444; font-size: 15px; font-weight: bold;',
          'color: #f59e0b; font-size: 13px; font-weight: 500; line-height: 1.6;'
        );
      } catch (err) {}
    };

    // In production, sanitize console outputs
    if (process.env.NODE_ENV === 'production') {
      try {
        const noop = () => {};
        console.log = noop;
        console.info = noop;
        console.debug = noop;
      } catch (err) {}
    } else {
      printSecurityBanner();
    }

    // 4. DevTools Detection via Dimension Monitoring
    let isDevToolsOpen = false;
    const checkDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;

      if (widthDiff || heightDiff) {
        if (!isDevToolsOpen) {
          isDevToolsOpen = true;
          printSecurityBanner();
        }
      } else {
        isDevToolsOpen = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('resize', checkDevTools);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('resize', checkDevTools);
    };
  }, []);

  return null;
}
export default SecurityShield;
