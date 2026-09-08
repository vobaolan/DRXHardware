export interface AuthUser {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: string;
  phone?: string;
  address?: string;
  provider?: string;
}

const SESSION_KEY = 'drx_user_profile';
const SESSION_COOKIE = 'drx_session_active';
const TOKEN_KEY = 'drx_auth_bearer';

/**
 * Check if the current browser session cookie is active.
 * Session cookies (without expires/max-age) persist across all tabs while Chrome is open,
 * and are automatically deleted by the browser when Chrome is completely closed.
 */
export function isBrowserSessionActive(): boolean {
  if (typeof document === 'undefined') return false;

  // 1. Check if browser session cookie is present
  const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith(`${SESSION_COOKIE}=`));
  if (hasCookie) return true;

  // 2. Fallback: If this tab was already active, re-seed the session cookie
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('drx_tab_session') === 'active') {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax${isHttps ? '; Secure' : ''}`;
    return true;
  }

  // 3. Fallback: If user profile exists in localStorage, maintain session for current browser window
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(SESSION_KEY) || localStorage.getItem('drx_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u && u.id && u.email) {
          const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
          document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax${isHttps ? '; Secure' : ''}`;
          return true;
        }
      } catch (e) {}
    }
  }

  return false;
}

/**
 * Get current authenticated user shared across all tabs during the Chrome session
 */
export function getStoredSessionUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY) || localStorage.getItem('drx_user') || sessionStorage.getItem('drx_user');
    if (!raw) return null;

    const user = JSON.parse(raw);
    if (user && user.id && user.email) {
      return user;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Set authenticated user for the current Chrome session (shared across all tabs)
 * Save user to localStorage, sessionStorage and session cookie
 */
export function setSessionUser(user: AuthUser, token?: string, broadcast: boolean = true): void {
  if (typeof window === 'undefined') return;

  try {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    // Set browser session cookie: no expires & no max-age => destroyed when Chrome is closed completely
    document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax${isHttps ? '; Secure' : ''}`;

    // Save to localStorage so ALL tabs share the active session
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem('drx_user', JSON.stringify(user));
    sessionStorage.setItem('drx_tab_session', 'active');
    sessionStorage.setItem('drx_user', JSON.stringify(user));

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_KEY, token);
    }

    // Only notify other components & tabs when broadcast is true (e.g. login, logout, profile update)
    if (broadcast) {
      window.dispatchEvent(new Event('ods_user_update'));
    }
  } catch (e) {
    console.error('Failed to save session user:', e);
  }
}

/**
 * Clear user session (Manual Logout)
 */
export async function clearSessionUser(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Expire the session cookie immediately
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${isHttps ? '; Secure' : ''}`;

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('drx_user');
    localStorage.removeItem('ods_user');
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('drx_tab_session');
    sessionStorage.removeItem('drx_user');
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('drx_auth_provider');

    // Invalidate server-side HttpOnly JWT cookie
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});

    window.dispatchEvent(new Event('ods_user_update'));
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

/**
 * Verify session with server API (/api/auth/me)
 */
export async function verifyCurrentSession(): Promise<AuthUser | null> {
  if (typeof window === 'undefined') return null;

  try {
    const token = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null)
      || (typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/auth/me', {
      cache: 'no-store',
      credentials: 'include',
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        // Silent update to avoid re-triggering ods_user_update event loops
        setSessionUser(data.user, data.token, false);
        return data.user;
      }
    }
  } catch (e) {
    console.warn('verifyCurrentSession network warning:', e);
  }

  return getStoredSessionUser();
}

/**
 * Log in with email and password
 */
export async function loginUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setSessionUser(data.user, data.token);
        return data.user;
      }
    }
    return null;
  } catch (e) {
    console.error('Login error:', e);
    return null;
  }
}

/**
 * Register with email, password, and full name
 */
export async function registerUser(email: string, password: string, name?: string): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setSessionUser(data.user, data.token);
        return data.user;
      }
    }
    return null;
  } catch (e) {
    console.error('Register error:', e);
    return null;
  }
}

/**
 * Authenticate with Google account
 */
export async function loginWithGoogle(payload?: {
  email?: string;
  name?: string;
  avatar?: string;
  credential?: string;
  accessToken?: string;
}): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload || {}),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setSessionUser(data.user, data.token);
        return data.user;
      }
    }
    return null;
  } catch (e) {
    console.error('Google login error:', e);
    return null;
  }
}

/**
 * Update user profile (name, phone, address) to backend & Supabase
 */
export async function updateUserProfile(payload: {
  name: string;
  phone?: string;
  address?: string;
}): Promise<AuthUser | null> {
  try {
    const token = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null)
      || (typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setSessionUser(data.user, data.token);
        return data.user;
      }
    }
    return null;
  } catch (e) {
    console.error('Update profile error:', e);
    return null;
  }
}

/**
 * Change user password via backend & Supabase
 */
export async function changeUserPassword(payload: {
  currentPassword?: string;
  newPassword: string;
  confirmNewPassword?: string;
  email?: string;
}): Promise<{ success: boolean; message: string; user?: AuthUser }> {
  try {
    const token = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null)
      || (typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      if (data.user) {
        setSessionUser(data.user, data.token);
      }
      return { success: true, message: data.message || 'Đổi mật khẩu thành công!', user: data.user };
    } else {
      return { success: false, message: data.message || 'Không thể đổi mật khẩu lúc này.' };
    }
  } catch (e: any) {
    console.error('Change password error:', e);
    return { success: false, message: 'Lỗi kết nối máy chủ: ' + e.message };
  }
}