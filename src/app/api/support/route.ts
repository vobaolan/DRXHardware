import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    let query = supabase.from('ChatMessage').select('*');
    if (orderId) {
      query = query.eq('orderId', orderId).order('createdAt', { ascending: true });
    } else {
      query = query.order('createdAt', { ascending: false }).limit(100);
    }

    const { data: messages, error } = await query;
    if (error) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(messages || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const msgData = {
      id: 'msg-' + Date.now(),
      orderId: body.orderId || null,
      senderId: body.senderId,
      receiverId: body.receiverId,
      content: body.content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const { data: message, error } = await supabase
      .from('ChatMessage')
      .insert([msgData])
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(msgData, { status: 201 });
    }

    return NextResponse.json(message || msgData, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const body = await request.json();
    const receiverId = body.receiverId;

    if (receiverId) {
      let query = supabase.from('ChatMessage').update({ isRead: true }).eq('receiverId', receiverId);
      if (orderId && orderId !== 'all') {
        query = query.eq('orderId', orderId);
      }
      await query;
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update messages' }, { status: 500 });
  }
}
