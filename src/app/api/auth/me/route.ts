import { NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ message: 'Chưa đăng nhập' }, { status: 401 });
    }

    // Master Admin fallback
    if (authUser.email === 'admin@drx.vn' || authUser.role === 'ADMIN') {
      return NextResponse.json(
        {
          user: {
            id: authUser.sub,
            name: authUser.name || 'DRX Admin',
            email: authUser.email,
            role: 'ADMIN',
            balance: 0,
          },
        },
        { status: 200 }
      );
    }

    // Fetch fresh user balance and status from Supabase
    try {
      const { data, error } = await supabase
        .from('User')
        .select('id, name, email, role, balance')
        .eq('id', authUser.sub)
        .single();

      if (!error && data) {
        return NextResponse.json(
          {
            user: {
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role,
              balance: Number(data.balance || 0),
            },
          },
          { status: 200 }
        );
      }
    } catch (e) {}

    // Fallback to JWT payload
    return NextResponse.json(
      {
        user: {
          id: authUser.sub,
          name: authUser.name,
          email: authUser.email,
          role: authUser.role,
          balance: 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: 'Lỗi xác thực: ' + error.message }, { status: 500 });
  }
}