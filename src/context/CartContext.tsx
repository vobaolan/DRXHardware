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
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  setIsOpen: (isOpen: boolean) => void;
  coupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  getDiscountAmount: () => number;
  getNetAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Helper to generate user storage key
  const getUserCartKey = (user: any) => {
    if (!user) return null;
    return `drx_user_cart_${user.id || user.email}`;
  };

  // Helper to load cart based on current session
  const loadActiveCart = (user: any): CartItem[] => {
    if (typeof window === 'undefined') return [];

    // Clean up any legacy cart keys
    try {
      localStorage.removeItem('kami_steam_cart');
      localStorage.removeItem('ods_cart');
    } catch (e) {}

    if (user && (user.id || user.email)) {
      // 1. LOGGED-IN USERS: Cart is connected directly to user account
      const userKey = getUserCartKey(user);
      if (userKey) {
        try {
          const savedUserCart = localStorage.getItem(userKey);
          if (savedUserCart) {
            return JSON.parse(savedUserCart);
          }
        } catch (e) {
          console.error('Failed to parse user cart data', e);
        }
      }
      return [];
    } else {
      // 2. GUESTS (Khách): Stored in sessionStorage
      // - F5 (Page Refresh): Preserved within current tab session!
      // - Close tab / Open new tab: Automatically wiped/reset by the browser!
      try {
        const guestCart = sessionStorage.getItem('drx_guest_cart');
        if (guestCart) {
          return JSON.parse(guestCart);
        }
      } catch (e) {
        console.error('Failed to parse guest cart data', e);
      }
      return [];
    }
  };

  // Helper to persist cart changes
  const persistCart = (items: CartItem[], user: any) => {
    if (typeof window === 'undefined') return;

    if (user && (user.id || user.email)) {
      // Save directly to user's persistent cart
      const userKey = getUserCartKey(user);
      if (userKey) {
        try {
          localStorage.setItem(userKey, JSON.stringify(items));
        } catch (e) {}
      }
    } else {
      // Save to guest session storage (persists on F5, cleared on tab close)
      try {
        sessionStorage.setItem('drx_guest_cart', JSON.stringify(items));
      } catch (e) {}
    }
  };

  // Initialize cart on mount & listen for Auth state changes
  useEffect(() => {
    let activeUser: any = null;

    const initAuthAndCart = async () => {
      try {
        const { getStoredSessionUser } = await import('@/lib/auth-client');
        activeUser = getStoredSessionUser();
        setCurrentUser(activeUser);
        const initialCart = loadActiveCart(activeUser);
        setCartItems(initialCart);
      } catch (e) {
        setCartItems([]);
      }
    };

    initAuthAndCart();

    // Listen for authentication changes (login, logout, switch user)
    const handleAuthChange = async () => {
      try {
        const { getStoredSessionUser } = await import('@/lib/auth-client');
        const newUser = getStoredSessionUser();

        // If guest had items in sessionStorage and just logged in, merge items into user cart!
        if (newUser && !activeUser) {
          let guestItems: CartItem[] = [];
          try {
            const guestRaw = sessionStorage.getItem('drx_guest_cart');
            if (guestRaw) guestItems = JSON.parse(guestRaw);
          } catch (e) {}

          const userKey = getUserCartKey(newUser);
          let userItems: CartItem[] = [];
          if (userKey) {
            try {
              const userRaw = localStorage.getItem(userKey);
              if (userRaw) userItems = JSON.parse(userRaw);
            } catch (e) {}
          }

          if (guestItems.length > 0) {
            const merged = [...userItems];
            for (const gItem of guestItems) {
              const existIdx = merged.findIndex((i) => i.id === gItem.id);
              if (existIdx >= 0) {
                merged[existIdx].quantity += gItem.quantity;
              } else {
                merged.push(gItem);
              }
            }
            if (userKey) {
              localStorage.setItem(userKey, JSON.stringify(merged));
            }
            sessionStorage.removeItem('drx_guest_cart');
            setCartItems(merged);
            activeUser = newUser;
            setCurrentUser(newUser);
            return;
          }
        }

        activeUser = newUser;
        setCurrentUser(newUser);
        const loaded = loadActiveCart(newUser);
        setCartItems(loaded);
      } catch (e) {}
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('ods_user_update', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('ods_user_update', handleAuthChange);
    };
  }, []);

  // Save cart state
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    persistCart(items, currentUser);
  };

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    let updatedItems: CartItem[];
    if (existingItem) {
      updatedItems = cartItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedItems = [...cartItems, { ...product, quantity: 1 }];
    }
    saveCart(updatedItems);
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    saveCart(updatedItems);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const updatedItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    saveCart(updatedItems);
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    persistCart([], currentUser);
    if (!currentUser) {
      try {
        sessionStorage.removeItem('drx_guest_cart');
      } catch (e) {}
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cartItems.reduce((total, item) => {
    const activePrice = item.discountPrice ?? item.price;
    return total + activePrice * item.quantity;
  }, 0);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanedCode = code.toUpperCase().trim();
    if (!cleanedCode) return { success: false, message: 'Vui lòng nhập mã giảm giá!' };

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanedCode, orderTotal: cartTotal }),
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

      return { success: false, message: data.message || `Mã giảm giá "${cleanedCode}" không tồn tại.` };
    } catch (e) {
      console.warn('Lỗi gọi /api/coupons:', e);
      return { success: false, message: 'Lỗi kết nối máy chủ khi xác thực mã giảm giá.' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const getDiscountAmount = () => {
    if (!coupon) return 0;
    let amt = 0;
    if (coupon.discountType === 'PERCENT') {
      amt = (cartTotal * coupon.discountValue) / 100;
    } else {
      amt = Math.min(coupon.discountValue, cartTotal);
    }
    if (coupon.maxDiscount && amt > coupon.maxDiscount) {
      amt = coupon.maxDiscount;
    }
    return amt;
  };

  const getNetAmount = () => {
    return Math.max(0, cartTotal - getDiscountAmount());
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
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
