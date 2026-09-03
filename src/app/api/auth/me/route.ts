import { NextResponse } from 'next/server';
import { getAuthUserFromRequest, signJWT, setAuthCookie } from '@/lib/jwt';
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
    let userPhone: string | null = null;
    let userAddress: string | null = null;
    let userId = authUser.sub;

    // 1. Fetch fresh user data & balance from Supabase Cloud PostgreSQL
    try {
      let query = supabase.from('User').select('id, name, email, role, balance, phone, address').limit(1);
      if (authUser.sub && authUser.sub !== 'admin-id-master') {
        query = query.eq('id', authUser.sub);
      } else if (authUser.email) {
        query = query.eq('email', authUser.email);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        userBalance = Number(data[0].balance || 0);
        if (data[0].id) userId = data[0].id;
        if (data[0].name) userName = data[0].name;
        if (data[0].role) userRole = data[0].role;
        if (data[0].phone) userPhone = data[0].phone;
        if (data[0].address) userAddress = data[0].address;
      } else if (authUser.email && authUser.email !== 'admin@drx.vn' && authUser.email !== 'staff@drx.vn') {
        // Auto-heal: ensure user is persisted in Supabase User table
        try {
          const autoId = (authUser.sub && authUser.sub.startsWith('user-')) ? authUser.sub : ('user-' + Date.now());
          const { data: supaNew } = await supabase
            .from('User')
            .insert([{
              id: autoId,
              name: authUser.name || authUser.email.split('@')[0],
              email: authUser.email.toLowerCase().trim(),
              role: authUser.role || 'USER',
              balance: 0.0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }])
            .select('*')
            .maybeSingle();

          if (supaNew) {
            userId = supaNew.id;
          }
        } catch (healErr) {}
      }
    } catch (e) {}

    // 2. Fallback to Prisma if not fetched from REST
    if (authUser.email) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: { email: authUser.email },
          select: { id: true, balance: true, name: true, role: true, phone: true, address: true },
        });
        if (dbUser) {
          if (dbUser.id) userId = dbUser.id;
          if (dbUser.balance !== null && dbUser.balance !== undefined) userBalance = Number(dbUser.balance);
          if (dbUser.name) userName = dbUser.name;
          if (dbUser.role) userRole = dbUser.role;
          if (dbUser.phone) userPhone = dbUser.phone;
          if (dbUser.address) userAddress = dbUser.address;
        }
      } catch (e) {}
    }

    return NextResponse.json(
      {
        user: {
          id: userId || authUser.sub,
          name: userName,
          email: authUser.email,
          role: userRole,
          balance: userBalance,
          phone: userPhone || '',
          address: userAddress || '',
          provider: authUser.provider,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: 'Lỗi xác thực: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ message: 'Chưa đăng nhập hoặc phiên hết hạn' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address } = body;

    const trimmedName = typeof name === 'string' && name.trim() ? name.trim() : authUser.name;
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : null;
    const trimmedAddress = typeof address === 'string' ? address.trim() : null;

    let updatedUserRecord: any = null;

    // 1. Update directly in Supabase Cloud via Prisma
    try {
      updatedUserRecord = await prisma.user.upsert({
        where: { email: authUser.email },
        update: {
          name: trimmedName,
          phone: trimmedPhone,
          address: trimmedAddress,
        },
        create: {
          email: authUser.email,
          name: trimmedName,
          phone: trimmedPhone,
          address: trimmedAddress,
          role: (authUser.role as any) || 'USER',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          balance: true,
          phone: true,
          address: true,
        },
      });
    } catch (prismaErr) {
      console.warn('Prisma profile update warning, falling back to direct Supabase REST:', prismaErr);
    }

    // 2. Also ensure updated in Supabase REST API
    try {
      await supabase
        .from('User')
        .update({
          name: trimmedName,
          phone: trimmedPhone,
          address: trimmedAddress,
        })
        .eq('email', authUser.email);
    } catch (e) {}

    const resolvedName = updatedUserRecord?.name || trimmedName;
    const resolvedRole = updatedUserRecord?.role || authUser.role || 'USER';
    const resolvedBalance = updatedUserRecord ? Number(updatedUserRecord.balance || 0) : 0;
    const resolvedPhone = updatedUserRecord?.phone || trimmedPhone || '';
    const resolvedAddress = updatedUserRecord?.address || trimmedAddress || '';
    const resolvedId = updatedUserRecord?.id || authUser.sub;

    // Generate refreshed JWT with updated name
    const newToken = signJWT({
      sub: resolvedId,
      email: authUser.email,
      name: resolvedName,
      role: resolvedRole,
      provider: authUser.provider,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Cập nhật thông tin cá nhân thành công!',
        user: {
          id: resolvedId,
          name: resolvedName,
          email: authUser.email,
          role: resolvedRole,
          balance: resolvedBalance,
          phone: resolvedPhone,
          address: resolvedAddress,
          provider: authUser.provider,
        },
      },
      { status: 200 }
    );

    setAuthCookie(response, newToken);
    return response;
  } catch (error: any) {
    console.error('Lỗi khi cập nhật profile lên Supabase:', error);
    return NextResponse.json({ message: 'Lỗi cập nhật: ' + error.message }, { status: 500 });
  }
}