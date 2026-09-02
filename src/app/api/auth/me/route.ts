import { NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
    }

    let userBalance = 0;
    let userName = authUser.name;
    let userRole = authUser.role || 'USER';

    // 1. Fetch fresh user data & balance from Supabase
    try {
      let query = supabase.from('User').select('id, name, email, role, balance').limit(1);
      if (authUser.sub && authUser.sub !== 'admin-id-master') {
        query = query.eq('id', authUser.sub);
      } else if (authUser.email) {
        query = query.eq('email', authUser.email);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        userBalance = Number(data[0].balance || 0);
        if (data[0].name) userName = data[0].name;
        if (data[0].role) userRole = data[0].role;
      }
    } catch (e) {}

    // 2. Fallback to Prisma if balance not found
    if (userBalance === 0 && authUser.email) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: { email: authUser.email },
          select: { balance: true, name: true, role: true },
        });
        if (dbUser && dbUser.balance !== null && dbUser.balance !== undefined) {
          userBalance = Number(dbUser.balance);
          if (dbUser.name) userName = dbUser.name;
          if (dbUser.role) userRole = dbUser.role;
        }
      } catch (e) {}
    }

    // Master Admin fallback
    if (authUser.email === 'admin@drx.vn' || authUser.role === 'ADMIN') {
      return NextResponse.json(
        {
          user: {
            id: authUser.sub || 'admin-id-master',
            name: userName || 'DRX Admin',
            email: authUser.email,
            role: 'ADMIN',
            balance: userBalance,
            provider: authUser.provider,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: authUser.sub,
          name: userName,
          email: authUser.email,
          role: userRole,
          balance: userBalance,
          provider: authUser.provider,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: 'Lỗi xác thực: ' + error.message }, { status: 500 });
  }
}