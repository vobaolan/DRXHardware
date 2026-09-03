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

/**
 * Check if the current browser session cookie is active.
 * Session cookies (without expires/max-age) persist across all tabs while Chrome is open,
 * and are automatically deleted by the browser when Chrome is completely closed.
 */
export function isBrowserSessionActive(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some(c => c.trim().startsWith(`${SESSION_COOKIE}=`));
}

/**
 * Get current authenticated user shared across all tabs during the Chrome session
 */
export function getStoredSessionUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check if the browser session cookie is still active
    if (!isBrowserSessionActive()) {
      // If Chrome was completely closed and reopened, session cookie is gone!
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('drx_user');
      localStorage.removeItem('ods_user');
      sessionStorage.removeItem('drx_tab_session');
      sessionStorage.removeItem('drx_user');
      return null;
    }

    // 2. Read from localStorage (shared across all tabs of the browser)
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
 */
export function setSessionUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;

  try {
    // Set browser session cookie: no expires & no max-age => destroyed when Chrome is closed completely
    document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax`;

    // Save to localStorage so ALL tabs share the active session
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem('drx_user', JSON.stringify(user));
    sessionStorage.setItem('drx_tab_session', 'active');
    sessionStorage.setItem('drx_user', JSON.stringify(user));

    // Notify other components & tabs
    window.dispatchEvent(new Event('ods_user_update'));
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
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('drx_user');
    localStorage.removeItem('ods_user');
    sessionStorage.removeItem('drx_tab_session');
    sessionStorage.removeItem('drx_user');

    // Invalidate server-side HttpOnly JWT cookie
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});

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
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setSessionUser(data.user);
        return data.user;
      }
    } else if (res.status === 401) {
      // Server token expired, invalid, or browser session ended
      await clearSessionUser();
      return null;
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
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setSessionUser(data.user);
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
      body: JSON.stringify({ email, password, name }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setSessionUser(data.user);
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
      body: JSON.stringify(payload || {}),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setSessionUser(data.user);
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
    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setSessionUser(data.user);
        return data.user;
      }
    }
    return null;
  } catch (e) {
    console.error('Update profile error:', e);
    return null;
  }
}