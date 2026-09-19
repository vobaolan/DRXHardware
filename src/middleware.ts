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

    // Check expiration (with 7 days grace period for active sessions)
    const now = Math.floor(Date.now() / 1000);
    const GRACE_PERIOD_SECONDS = 7 * 24 * 60 * 60; // 7 days grace
    if (payload.exp && (payload.exp + GRACE_PERIOD_SECONDS) < now) {
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

  // 2. Protect Admin & Staff API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!user) {
      return NextResponse.json(
        { message: 'Truy cập bị từ chối: Yêu cầu đăng nhập tài khoản Quản trị hoặc Nhân viên!' },
        { status: 401 }
      );
    }

    // High-Privilege Endpoints: Only ADMIN can view Revenue Stats & User Permissions
    if (pathname.startsWith('/api/admin/stats') || pathname.startsWith('/api/admin/users')) {
      if (!isAdmin) {
        return NextResponse.json(
          { message: 'Truy cập bị từ chối: Chỉ Quản Trị Viên (ADMIN) mới có quyền truy cập dữ liệu doanh thu & người dùng!' },
          { status: 403 }
        );
      }
    } else {
      // Operational Endpoints (products, serials, orders): Both ADMIN and STAFF are authorized
      if (!isStaff && !isAdmin) {
        return NextResponse.json(
          { message: 'Truy cập bị từ chối: Yêu cầu quyền Nhân Viên (STAFF) hoặc Quản Trị Viên (ADMIN)!' },
          { status: 403 }
        );
      }
    }
  }

  // 3. Protect Admin Web Portal (/admin)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (user && !isAdmin) {
      // If user is Staff trying to access Admin, redirect to Staff Portal
      if (isStaff) {
        return NextResponse.redirect(new URL('/staff', request.url));
      }
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  // 4. Protect Staff Web Portal (/staff)
  if (pathname === '/staff' || pathname.startsWith('/staff/')) {
    if (user && !isStaff && !isAdmin) {
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
