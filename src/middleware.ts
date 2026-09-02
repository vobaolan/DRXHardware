import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight Edge-compatible JWT Payload Decoder
function parseJwtPayload(token: string): any | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Extract Token from HttpOnly Cookie or Authorization Header
  const cookieToken = request.cookies.get('drx_auth_token')?.value;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : undefined;
  const token = cookieToken || bearerToken;

  const user = token ? parseJwtPayload(token) : null;
  const userRole = String(user?.role || '').toUpperCase();
  const userEmail = String(user?.email || '').toLowerCase();

  const isAdmin = userRole === 'ADMIN' || userEmail === 'admin@drx.vn' || (userEmail.includes('admin') && !userEmail.includes('staff'));
  const isStaff = isAdmin || userRole === 'STAFF' || userRole === 'WAREHOUSE' || userRole === 'MANAGER' || userEmail === 'staff@drx.vn' || userEmail.includes('staff');

  // 2. Protect Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!user || !isAdmin) {
      return NextResponse.json(
        { message: 'Truy cập bị từ chối: Yêu cầu quyền Quản Trị Viên (ADMIN) của DRX Hardware!' },
        { status: 403 }
      );
    }
  }

  // 3. Protect Admin Web Portal (/admin)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!user) {
      const loginUrl = new URL('/profile', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      // If user is Staff trying to access Admin, redirect to Staff Portal
      if (isStaff) {
        return NextResponse.redirect(new URL('/staff', request.url));
      }
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  // 4. Protect Staff Web Portal (/staff)
  if (pathname === '/staff' || pathname.startsWith('/staff/')) {
    if (!user) {
      const loginUrl = new URL('/profile', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isStaff) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  // 5. Append Strict Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/api/admin/:path*',
  ],
};
