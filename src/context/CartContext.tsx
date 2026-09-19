'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  coverImage: string;
  quantity: number;
  platform: string;
  productId: string;
  variantName?: string;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number | null;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, openDrawer?: boolean) => void;
  addMultipleToCart: (products: Array<Omit<CartItem, 'quantity'>>, openDrawer?: boolean) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  coupon: Coupon | null;
  applyCoupon: (code: string, customTotal?: number) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  getDiscountAmount: (customTotal?: number) => number;
  getNetAmount: (customTotal?: number) => number;
}

const PRIMARY_CART_KEY = 'drx_hardware_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Helper to get active user from localStorage safely
  const getActiveUserSafely = () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('drx_user_profile') || localStorage.getItem('drx_user');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  };

  // Helper to persist cart items to all storage mirrors
  const persistCart = (items: CartItem[], user?: any) => {
    if (typeof window === 'undefined') return;
    try {
      const dataStr = JSON.stringify(items);

      // 1. Primary storage keys (Single Source of Truth)
      localStorage.setItem(PRIMARY_CART_KEY, dataStr);
      sessionStorage.setItem(PRIMARY_CART_KEY, dataStr);
      localStorage.setItem('drx_guest_cart', dataStr);
      sessionStorage.setItem('drx_guest_cart', dataStr);

      // 2. User-specific backups if logged in
      const targetUser = user || currentUser || getActiveUserSafely();
      if (targetUser) {
        if (targetUser.id) localStorage.setItem(`drx_user_cart_${targetUser.id}`, dataStr);
        if (targetUser.email) localStorage.setItem(`drx_user_cart_${targetUser.email}`, dataStr);
      }
    } catch (e) {
      console.error('Failed to persist cart items', e);
    }
  };

  // Helper to load cart based on current session
  const loadActiveCart = (user?: any): CartItem[] => {
    if (typeof window === 'undefined') return [];

    // Clean up legacy cart keys
    try {
      localStorage.removeItem('kami_steam_cart');
      localStorage.removeItem('ods_cart');
    } catch (e) {}

    try {
      // 1. Check Primary storage first
      const primaryRaw = sessionStorage.getItem(PRIMARY_CART_KEY) || localStorage.getItem(PRIMARY_CART_KEY);
      if (primaryRaw !== null) {
        const parsed = JSON.parse(primaryRaw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }

      // 2. Check user-specific storage keys
      const targetUser = user || getActiveUserSafely();
      if (targetUser) {
        if (targetUser.id) {
          const userRaw = localStorage.getItem(`drx_user_cart_${targetUser.id}`);
          if (userRaw !== null) {
            const parsed = JSON.parse(userRaw);
            if (Array.isArray(parsed)) return parsed;
          }
        }
        if (targetUser.email) {
          const userRaw = localStorage.getItem(`drx_user_cart_${targetUser.email}`);
          if (userRaw !== null) {
            const parsed = JSON.parse(userRaw);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      }

      // 3. Fallback to guest cart
      const guestRaw = sessionStorage.getItem('drx_guest_cart') || localStorage.getItem('drx_guest_cart');
      if (guestRaw !== null) {
        const parsed = JSON.parse(guestRaw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load active cart', e);
    }

    return [];
  };

  // Initialize cart on mount & listen for Auth state changes
  useEffect(() => {
    const initAuthAndCart = async () => {
      try {
        const { getStoredSessionUser } = await import('@/lib/auth-client');
        const activeUser = getStoredSessionUser();
        setCurrentUser(activeUser);
        const initialCart = loadActiveCart(activeUser);
        setCartItems(initialCart);
      } catch (e) {
        const fallbackCart = loadActiveCart();
        setCartItems(fallbackCart);
      }
    };

    initAuthAndCart();

    // Listen for authentication changes (login, logout, switch user)
    const handleAuthChange = async () => {
      try {
        const { getStoredSessionUser } = await import('@/lib/auth-client');
        const newUser = getStoredSessionUser();
        setCurrentUser(newUser);

        // If user logged in and has stored cart, restore it
        const loaded = loadActiveCart(newUser);
        setCartItems(loaded);
      } catch (e) {}
    };

    const handleCartSync = () => {
      const loaded = loadActiveCart();
      setCartItems(loaded);
    };

    const handleCartCleared = () => {
      setCartItems([]);
      setCoupon(null);
    };

    window.addEventListener('ods_user_update', handleAuthChange);
    window.addEventListener('drx_cart_updated', handleCartSync);
    window.addEventListener('drx_cart_cleared', handleCartCleared);

    return () => {
      window.removeEventListener('ods_user_update', handleAuthChange);
      window.removeEventListener('drx_cart_updated', handleCartSync);
      window.removeEventListener('drx_cart_cleared', handleCartCleared);
    };
  }, []);

  const addToCart = (product: Omit<CartItem, 'quantity'>, openDrawer: boolean = true) => {
    const activeUser = currentUser || getActiveUserSafely();

    setCartItems((prev) => {
      const currentList = prev.length > 0 ? prev : loadActiveCart(activeUser);
      const existingIdx = currentList.findIndex(
        (item) => item.id === product.id || (item.productId && item.productId === product.productId)
      );
      let updatedItems: CartItem[];
      if (existingIdx >= 0) {
        updatedItems = currentList.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedItems = [...currentList, { ...product, quantity: 1 }];
      }

      persistCart(updatedItems, activeUser);
      return updatedItems;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('drx_cart_updated'));
    }

    if (openDrawer) {
      setCartOpen(true);
    }
  };

  const addMultipleToCart = (products: Array<Omit<CartItem, 'quantity'>>, openDrawer: boolean = false) => {
    if (!products || products.length === 0) return;

    const activeUser = currentUser || getActiveUserSafely();

    setCartItems((prev) => {
      const currentList = prev.length > 0 ? prev : loadActiveCart(activeUser);
      const merged = [...currentList];
      for (const prod of products) {
        const existIdx = merged.findIndex(
          (item) => item.id === prod.id || (item.productId && item.productId === prod.productId)
        );
        if (existIdx >= 0) {
          merged[existIdx] = {
            ...merged[existIdx],
            quantity: merged[existIdx].quantity + 1,
          };
        } else {
          merged.push({
            ...prod,
            quantity: 1,
          });
        }
      }

      persistCart(merged, activeUser);
      return merged;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('drx_cart_updated'));
    }

    if (openDrawer) {
      setCartOpen(true);
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => {
      const updatedItems = prev.filter((item) => item.id !== id);
      persistCart(updatedItems);
      return updatedItems;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('drx_cart_updated'));
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) => {
      const updatedItems = prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      persistCart(updatedItems);
      return updatedItems;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('drx_cart_updated'));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    const activeUser = currentUser || getActiveUserSafely();
    persistCart([], activeUser);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('drx_cart_cleared'));
      window.dispatchEvent(new Event('drx_cart_updated'));
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cartItems.reduce((total, item) => {
    const activePrice = item.discountPrice ?? item.price;
    return total + activePrice * item.quantity;
  }, 0);

  const applyCoupon = async (code: string, customTotal?: number): Promise<{ success: boolean; message: string }> => {
    const cleanedCode = code.toUpperCase().trim();
    if (!cleanedCode) return { success: false, message: 'Vui lòng nhập mã giảm giá!' };

    const effectiveTotal = typeof customTotal === 'number' && customTotal > 0 ? customTotal : cartTotal;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanedCode, orderTotal: effectiveTotal }),
      });

      const data = await res.json();

      if (res.ok && data.valid && data.coupon) {
        setCoupon({
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: Number(data.coupon.discountValue),
          minOrderValue: Number(data.coupon.minOrderValue || 0),
          maxDiscount: data.coupon.maxDiscount ? Number(data.coupon.maxDiscount) : null,
        });
        return { success: true, message: data.message || `Áp dụng mã ${cleanedCode} thành công!` };
      }

      return { success: false, message: data.message || `Mã giảm giá "${cleanedCode}" không hợp lệ hoặc không tồn tại.` };
    } catch (e) {
      console.warn('Lỗi gọi /api/coupons:', e);
      return { success: false, message: 'Lỗi kết nối máy chủ khi xác thực mã giảm giá.' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const getDiscountAmount = (customTotal?: number) => {
    if (!coupon) return 0;
    const baseTotal = typeof customTotal === 'number' && customTotal > 0 ? customTotal : cartTotal;
    let amt = 0;
    if (coupon.discountType === 'PERCENT') {
      amt = (baseTotal * coupon.discountValue) / 100;
    } else {
      amt = Math.min(coupon.discountValue, baseTotal);
    }
    if (coupon.maxDiscount && amt > coupon.maxDiscount) {
      amt = coupon.maxDiscount;
    }
    return amt;
  };

  const getNetAmount = (customTotal?: number) => {
    const baseTotal = typeof customTotal === 'number' && customTotal > 0 ? customTotal : cartTotal;
    return Math.max(0, baseTotal - getDiscountAmount(baseTotal));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setCartOpen,
        setIsOpen: setCartOpen,
        coupon,
        applyCoupon,
        removeCoupon,
        getDiscountAmount,
        getNetAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
