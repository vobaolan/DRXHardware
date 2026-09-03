import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let notifications: any[] = [];

    // 1. Primary: Supabase Cloud Database
    try {
      const { data, error } = await supabase
        .from('Notification')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(50);

      if (!error && data) {
        notifications = data;
      }
    } catch (e) {}

    // 2. Fallback to Prisma
    if (notifications.length === 0) {
      try {
        notifications = await prisma.notification.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
        });
      } catch (e) {}
    }

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const notifData = {
      id: 'notif-' + Date.now(),
      orderId: body.orderId || null,
      customerId: body.customerId || null,
      customerName: body.customerName || 'Khách hàng DRX',
      isGift: body.isGift || false,
      productNames: body.productNames || [],
      read: false,
      createdAt: new Date().toISOString(),
    };

    let created: any = null;

    // 1. Insert to Supabase
    try {
      const { data } = await supabase
        .from('Notification')
        .insert([notifData])
        .select()
        .single();
      if (data) created = data;
    } catch (e) {}

    // 2. Also sync to Prisma
    try {
      const pCreated = await prisma.notification.create({
        data: notifData,
      });
      if (!created) created = pCreated;
    } catch (e) {}

    return NextResponse.json(created || notifData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    
    // 1. Update in Supabase
    try {
      if (id) {
        await supabase.from('Notification').update({ read: true }).eq('id', id);
      } else {
        await supabase.from('Notification').update({ read: true }).eq('read', false);
      }
    } catch (e) {}

    // 2. Also sync to Prisma
    try {
      if (id) {
        await prisma.notification.update({
          where: { id },
          data: { read: true },
        });
      } else {
        await prisma.notification.updateMany({
          where: { read: false },
          data: { read: true },
        });
      }
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    // 1. Delete from Supabase
    try {
      if (id) {
        await supabase.from('Notification').delete().eq('id', id);
      } else {
        await supabase.from('Notification').delete().neq('id', '');
      }
    } catch (e) {}

    // 2. Also delete from Prisma
    try {
      if (id) {
        await prisma.notification.delete({
          where: { id },
        });
      } else {
        await prisma.notification.deleteMany();
      }
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
  }
}
