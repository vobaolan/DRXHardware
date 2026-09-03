import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Secret key for verifying webhooks
const WEBHOOK_SECRET = process.env.PAYOS_CHECKSUM_KEY || 'nzxt_game_shop_secret_key';

function verifySignature(data: any, signature: string): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true; 
  }
  
  try {
    const sortedKeys = Object.keys(data).sort();
    const dataString = sortedKeys
      .map((key) => `${key}=${typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]}`)
      .join('&');

    const calculatedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(dataString)
      .digest('hex');

    return calculatedSignature === signature;
  } catch (error) {
    console.error('Signature verification failed', error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-signature') || '';

    // Log incoming webhook data for tracking/debugging
    console.log('Incoming webhook payment payload:', JSON.stringify(body));

    // Verify webhook authenticity
    if (!verifySignature(body.data, signature)) {
      return NextResponse.json({ error: 'Invalid signature verification' }, { status: 400 });
    }

    const { description, amount, referenceId, orderCode } = body.data || body;
    const descriptionStr = String(description).toUpperCase();

    // 1. Nạp tiền vào ví
    if (descriptionStr.startsWith('NAP_')) {
      const userId = descriptionStr.replace('NAP_', '').trim();
      
      const { data: user } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!user) {
        return NextResponse.json({ error: 'User not found for wallet deposit' }, { status: 404 });
      }

      const txId = 'tx-' + Date.now();
      await supabase.from('Transaction').insert([{
        id: txId,
        userId: user.id,
        amount: Number(amount),
        type: 'DEPOSIT',
        status: 'SUCCESS',
        paymentGateway: 'VIETQR',
        referenceId: referenceId || String(orderCode),
        description: `Nạp tiền tự động qua VietQR: +${amount} VND`,
        createdAt: new Date().toISOString(),
      }]);

      await supabase.from('User').update({
        balance: (Number(user.balance) || 0) + Number(amount),
        updatedAt: new Date().toISOString(),
      }).eq('id', user.id);

      return NextResponse.json({ success: true, message: 'Deposit completed successfully', transactionId: txId });
    }

    // 2. Thanh toán đơn hàng
    let orderId = '';
    if (descriptionStr.startsWith('ORDER_')) {
      orderId = descriptionStr.replace('ORDER_', '').trim();
    } else {
      orderId = referenceId || String(orderCode);
    }

    const { data: order } = await supabase
      .from('Order')
      .select('*')
      .or(`id.eq.${orderId},orderCode.eq.${orderId}`)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'COMPLETED' || order.paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, message: 'Order was already processed' });
    }

    await supabase.from('Order').update({
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paymentDetails: body.data || {},
      updatedAt: new Date().toISOString(),
    }).eq('id', order.id);

    return NextResponse.json({
      success: true,
      message: 'Payment received successfully',
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
