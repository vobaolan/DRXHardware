export interface AuthUser {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: string;
  phone?: string;
  provider?: string;
}

const SESSION_KEY = 'drx_user';
const SESSION_FLAG = 'drx_tab_session';

/**
 * Get current authenticated user from active tab session
 */
export function getStoredSessionUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    // Check if the tab session is still active
    const isTabActive = sessionStorage.getItem(SESSION_FLAG) === 'active';
    if (!isTabActive) {
      // If user closed tab and reopened, sessionStorage is cleared by the browser.
      // Clean up legacy localStorage if any exists
      localStorage.removeItem('ods_user');
      return null;
    }

    const raw = sessionStorage.getItem(SESSION_KEY);
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
 * Set authenticated user for the current tab session
 */
export function setSessionUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(SESSION_FLAG, 'active');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    
    // Clean up persistent localStorage so sensitive data is NEVER stored in F12 Local Storage
    localStorage.removeItem('ods_user');

    // Notify other components
    window.dispatchEvent(new Event('ods_user_update'));
  } catch (e) {
    console.error('Failed to save session user:', e);
  }
}

/**
 * Clear user session (Logout)
 */
export async function clearSessionUser(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(SESSION_FLAG);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('ods_user');

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

  const currentLocal = getStoredSessionUser();
  if (!currentLocal) {
    return null;
  }

  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        setSessionUser(data.user);
        return data.user;
      }
    } else if (res.status === 401) {
      // Token expired or invalid
      await clearSessionUser();
      return null;
    }
  } catch (e) {}

  return currentLocal;
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
export async function loginWithGoogle(userInfo?: { email: string; name: string; avatar?: string }): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo || {}),
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