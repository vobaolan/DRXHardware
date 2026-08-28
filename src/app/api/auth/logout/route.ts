import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ message: 'Đăng xuất thành công!' }, { status: 200 });
  clearAuthCookie(response);
  return response;
}