import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    let orders: any[] = [];
    let foundInDb = false;

    // 1. Primary Authority: Direct pooled PostgreSQL connection via Prisma ORM (Ultra-Fast)
    try {
      orders = await prisma.order.findMany({
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
          serials: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      foundInDb = true;
    } catch (prismaErr) {
      console.warn('Prisma get all orders warning, trying Supabase fallback:', prismaErr);
    }

    // 2. Secondary Fallback: Supabase Cloud Database REST API
    if (!foundInDb) {
      try {
        const { data: supaOrders, error: supaErr } = await supabase
          .from('Order')
          .select('*, orderItems:OrderItem(*, product:Product(*))')
          .order('createdAt', { ascending: false });

        if (!supaErr && supaOrders && Array.isArray(supaOrders)) {
          orders = supaOrders;
        } else {
          const { data: simpleOrders, error: simpleErr } = await supabase
            .from('Order')
            .select('*')
            .order('createdAt', { ascending: false });
          if (!simpleErr && simpleOrders && Array.isArray(simpleOrders)) {
            orders = simpleOrders;
          }
        }
      } catch (supaErr) {
        console.error('Supabase fallback get orders error:', supaErr);
      }
    }

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi lấy lịch sử toàn bộ đơn hàng (Admin/Staff):', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau!', error: error.message },
      { status: 500 }
    );
  }
}

import { revalidatePath } from 'next/cache';
import { invalidateProductsCache } from '@/app/api/products/route';

async function syncInventoryForOrder(
  existingOrder: any,
  targetStatus: string | undefined,
  targetPaymentDetails: any
) {
  try {
    const existingDetails = typeof existingOrder.paymentDetails === 'string'
      ? (() => { try { return JSON.parse(existingOrder.paymentDetails); } catch { return {}; } })()
      : (existingOrder.paymentDetails || {});

    const mergedDetails = {
      ...existingDetails,
      ...(typeof targetPaymentDetails === 'object' ? targetPaymentDetails : {}),
    };

    const effectiveStatus = targetStatus || existingOrder.status;

    // Check if Step 3 (check_packed), Step 4 (check_handed_over), Step 5 (check_collected_cod),
    // or shipping/completed status is reached
    const isStep3OrBeyond = Boolean(
      mergedDetails.check_packed ||
      mergedDetails.check_handed_over ||
      mergedDetails.check_collected_cod ||
      ['SHIPPING', 'DELIVERED', 'COMPLETED'].includes(effectiveStatus)
    );

    const alreadyDeducted = Boolean(existingDetails.inventoryDeducted || mergedDetails.inventoryDeducted);

    // Extract items list
    let itemsToProcess: Array<{ productId: string; quantity: number }> = [];

    if (existingOrder.orderItems && Array.isArray(existingOrder.orderItems) && existingOrder.orderItems.length > 0) {
      itemsToProcess = existingOrder.orderItems.map((oi: any) => ({
        productId: oi.productId || oi.product?.id || oi.id,
        quantity: Number(oi.quantity) || 1,
      }));
    } else if (mergedDetails.items && Array.isArray(mergedDetails.items) && mergedDetails.items.length > 0) {
      itemsToProcess = mergedDetails.items.map((i: any) => ({
        productId: i.productId || i.id,
        quantity: Number(i.quantity) || 1,
      }));
    }

    // Filter valid product IDs
    itemsToProcess = itemsToProcess.filter((i) => Boolean(i.productId));

    let inventoryChanged = false;

    // CASE 1: Order is cancelled -> restore stock if already deducted
    if (effectiveStatus === 'CANCELLED') {
      if (alreadyDeducted && itemsToProcess.length > 0) {
        for (const item of itemsToProcess) {
          try {
            // Prisma increment
            await prisma.product.updateMany({
              where: { id: item.productId },
              data: {
                stockQuantity: { increment: item.quantity },
                updatedAt: new Date(),
              },
            });

            // Serial restore Prisma
            try {
              await prisma.productSerial.updateMany({
                where: {
                  orderId: existingOrder.id,
                  productId: item.productId,
                  status: 'SOLD',
                },
                data: {
                  status: 'AVAILABLE',
                  orderId: null,
                  soldDate: null,
                },
              });
            } catch (sErr) {}

            // Supabase Serial restore
            try {
              await supabase
                .from('ProductSerial')
                .update({
                  status: 'AVAILABLE',
                  orderId: null,
                  soldDate: null,
                })
                .eq('orderId', existingOrder.id)
                .eq('productId', item.productId)
                .eq('status', 'SOLD');
            } catch (supaSerialRestoreErr) {
              console.warn(`Lỗi khôi phục serial Supabase khi hủy đơn:`, supaSerialRestoreErr);
            }

            // Supabase increment
            try {
              const { data: supaProd } = await supabase
                .from('Product')
                .select('stockQuantity')
                .eq('id', item.productId)
                .maybeSingle();
              if (supaProd && typeof supaProd.stockQuantity === 'number') {
                await supabase
                  .from('Product')
                  .update({
                    stockQuantity: supaProd.stockQuantity + item.quantity,
                    updatedAt: new Date().toISOString(),
                  })
                  .eq('id', item.productId);
              }
            } catch (supaErr) {}
          } catch (itemErr) {
            console.warn(`Lỗi khôi phục kho sản phẩm ${item.productId}:`, itemErr);
          }
        }
        mergedDetails.inventoryDeducted = false;
        mergedDetails.inventoryRestoredAt = new Date().toISOString();
        inventoryChanged = true;
      }
    } 
    // CASE 2: Step 3+ reached and stock NOT yet deducted
    else if (isStep3OrBeyond && !alreadyDeducted && effectiveStatus !== 'CANCELLED') {
      if (itemsToProcess.length > 0) {
        for (const item of itemsToProcess) {
          try {
            // Prisma decrement
            await prisma.product.updateMany({
              where: { id: item.productId },
              data: {
                stockQuantity: { decrement: item.quantity },
                updatedAt: new Date(),
              },
            });

            // Serial allocation Prisma
            try {
              const availSerials = await prisma.productSerial.findMany({
                where: { productId: item.productId, status: 'AVAILABLE' },
                select: { id: true },
                take: item.quantity,
              });

              if (availSerials.length > 0) {
                const sIds = availSerials.map((s) => s.id);
                await prisma.productSerial.updateMany({
                  where: { id: { in: sIds } },
                  data: {
                    status: 'SOLD',
                    orderId: existingOrder.id,
                    soldDate: new Date(),
                  },
                });
              }
            } catch (sErr) {}

            // Supabase Serial allocation
            try {
              const { data: supaSerials } = await supabase
                .from('ProductSerial')
                .select('id')
                .eq('productId', item.productId)
                .eq('status', 'AVAILABLE')
                .limit(item.quantity);

              if (supaSerials && supaSerials.length > 0) {
                const sIds = supaSerials.map((s: any) => s.id);
                await supabase
                  .from('ProductSerial')
                  .update({
                    status: 'SOLD',
                    orderId: existingOrder.id,
                    soldDate: new Date().toISOString(),
                  })
                  .in('id', sIds);
              }
            } catch (supaSerialErr) {
              console.warn(`Lỗi gán serial SOLD trong Supabase cho sản phẩm ${item.productId}:`, supaSerialErr);
            }

            // Supabase decrement
            try {
              const { data: supaProd } = await supabase
                .from('Product')
                .select('stockQuantity')
                .eq('id', item.productId)
                .maybeSingle();
              if (supaProd && typeof supaProd.stockQuantity === 'number') {
                const newStock = Math.max(0, supaProd.stockQuantity - item.quantity);
                await supabase
                  .from('Product')
                  .update({
                    stockQuantity: newStock,
                    updatedAt: new Date().toISOString(),
                  })
                  .eq('id', item.productId);
              }
            } catch (supaErr) {}
          } catch (itemErr) {
            console.warn(`Lỗi trừ kho sản phẩm ${item.productId}:`, itemErr);
          }
        }
        mergedDetails.inventoryDeducted = true;
        mergedDetails.inventoryDeductedAt = new Date().toISOString();
        inventoryChanged = true;
      }
    }

    if (inventoryChanged) {
      try {
        invalidateProductsCache();
        revalidatePath('/', 'layout');
        revalidatePath('/products', 'layout');
        revalidatePath('/admin', 'layout');
        revalidatePath('/staff', 'layout');
      } catch (e) {}
    }

    return mergedDetails;
  } catch (err) {
    console.error('Lỗi syncInventoryForOrder:', err);
    return targetPaymentDetails;
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, paymentStatus, paymentDetails, paymentMethod } = body;

    if (!orderId) {
      return NextResponse.json({ message: 'Thiếu mã đơn hàng' }, { status: 400 });
    }

    // Validate & sanitize paymentStatus for PostgreSQL enum (PENDING | PAID | FAILED | REFUNDED)
    let sanitizedPaymentStatus = paymentStatus;
    if (sanitizedPaymentStatus) {
      const upperPay = String(sanitizedPaymentStatus).toUpperCase();
      if (upperPay === 'CANCELLED') {
        sanitizedPaymentStatus = 'FAILED';
      } else if (!['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(upperPay)) {
        sanitizedPaymentStatus = undefined;
      }
    } else if (status === 'COMPLETED') {
      sanitizedPaymentStatus = 'PAID';
    }

    // Parse paymentDetails if passed as JSON string
    let parsedPaymentDetails = paymentDetails;
    if (typeof paymentDetails === 'string') {
      try {
        parsedPaymentDetails = JSON.parse(paymentDetails);
      } catch {
        parsedPaymentDetails = paymentDetails;
      }
    }

    let updatedOrder: any = null;

    // 1. Primary Authority: Direct lookup & update via Prisma ORM
    try {
      const cleanCode = String(orderId).replace(/^[#]/, '').trim();
      const existing = await prisma.order.findFirst({
        where: {
          OR: [
            { id: orderId },
            { orderCode: cleanCode },
            { orderCode: { contains: cleanCode, mode: 'insensitive' } },
            { id: { contains: cleanCode, mode: 'insensitive' } },
          ],
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (existing) {
        // Sync inventory if Step 3+ is reached or order is cancelled
        const finalPaymentDetails = await syncInventoryForOrder(existing, status, parsedPaymentDetails);

        const updatePayload: any = {
          ...(status ? { status } : {}),
          ...(sanitizedPaymentStatus ? { paymentStatus: sanitizedPaymentStatus } : {}),
          ...(paymentMethod ? { paymentMethod } : {}),
          ...(finalPaymentDetails !== undefined ? { paymentDetails: finalPaymentDetails } : {}),
          updatedAt: new Date(),
        };

        updatedOrder = await prisma.order.update({
          where: { id: existing.id },
          data: updatePayload,
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        });
      }
    } catch (prismaErr) {
      console.warn('Prisma update order warning, trying Supabase:', prismaErr);
    }

    // 2. Secondary Fallback / Background Sync to Supabase
    if (!updatedOrder) {
      try {
        let targetOrderId = orderId;
        const { data: directMatch } = await supabase
          .from('Order')
          .select('*, orderItems:OrderItem(*, product:Product(*))')
          .eq('id', orderId)
          .maybeSingle();

        let existingSupa = directMatch;
        if (directMatch) {
          targetOrderId = directMatch.id;
        } else {
          const cleanCode = String(orderId).replace(/^#/, '').trim();
          const { data: altMatch } = await supabase
            .from('Order')
            .select('*, orderItems:OrderItem(*, product:Product(*))')
            .or(`orderCode.eq.${cleanCode},id.ilike.%${cleanCode}%`)
            .limit(1)
            .maybeSingle();

          if (altMatch) {
            targetOrderId = altMatch.id;
            existingSupa = altMatch;
          }
        }

        let finalPaymentDetails = parsedPaymentDetails;
        if (existingSupa) {
          finalPaymentDetails = await syncInventoryForOrder(existingSupa, status, parsedPaymentDetails);
        }

        const supaPayload: any = {
          ...(status ? { status } : {}),
          ...(sanitizedPaymentStatus ? { paymentStatus: sanitizedPaymentStatus } : {}),
          ...(paymentMethod ? { paymentMethod } : {}),
          ...(finalPaymentDetails !== undefined ? { paymentDetails: finalPaymentDetails } : {}),
          updatedAt: new Date().toISOString(),
        };

        const { data: supaUpdated, error: supaErr } = await supabase
          .from('Order')
          .update(supaPayload)
          .eq('id', targetOrderId)
          .select('*')
          .single();

        if (!supaErr && supaUpdated) {
          updatedOrder = supaUpdated;
        }
      } catch (supaErr) {
        console.error('Supabase update order error:', supaErr);
      }
    }

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Không tìm thấy đơn hàng để cập nhật' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Đã cập nhật đơn hàng #${updatedOrder.orderCode || updatedOrder.id} thành công`,
      order: updatedOrder 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi update đơn hàng (Admin/Staff):', error);
    return NextResponse.json(
      { message: error.message || 'Lỗi xử lý cập nhật đơn hàng' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ message: 'Thiếu ID đơn hàng' }, { status: 400 });
    }

    // 1. Primary Authority: Direct delete via Prisma ORM
    let deleted = false;
    try {
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.delete({ where: { id: orderId } });
      deleted = true;
    } catch (prismaErr) {
      console.warn('Prisma delete order warning, trying Supabase:', prismaErr);
    }

    // 2. Secondary fallback via Supabase
    if (!deleted) {
      try {
        await supabase.from('OrderItem').delete().eq('orderId', orderId);
        const { error } = await supabase.from('Order').delete().eq('id', orderId);
        if (error) {
          return NextResponse.json({ message: 'Lỗi khi xóa đơn hàng: ' + error.message }, { status: 500 });
        }
      } catch (e: any) {
        return NextResponse.json({ message: 'Lỗi khi xóa đơn hàng: ' + e.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Đã xóa đơn hàng thành công' }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi xóa đơn hàng (Admin):', error);
    return NextResponse.json({ message: 'Lỗi xử lý xóa đơn', error: error.message }, { status: 500 });
  }
}
