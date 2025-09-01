import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { checkPurchaseLimit, recordPurchase, getClientIP } from '@/app/lib/purchaseLimit';
import { sendOrderNotification, type OrderNotificationData } from '@/app/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    // Check purchase limits first
    const limitInfo = await checkPurchaseLimit(request);
    
    if (!limitInfo.allowed) {
      return NextResponse.json(
        { 
          error: 'Purchase limit exceeded',
          message: `You have reached the maximum of ${limitInfo.limit} purchases. Please wait ${limitInfo.timeoutRemaining ? Math.ceil(limitInfo.timeoutRemaining / 60) : 30} minutes before placing another order.`,
          timeoutRemaining: limitInfo.timeoutRemaining,
        },
        { status: 429 }
      );
    }

    const orderData = await request.json();
    
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    
    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        total: orderData.total,
        customerName: orderData.fullName,
        customerEmail: orderData.email,
        customerPhone: orderData.phone,
        shippingAddress: `${orderData.address}, ${orderData.province}`,
        paymentProofUrl: orderData.paymentProofUrl,
        items: {
          create: orderData.items.map((item: any) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.variant?.size || 'One Size',
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Record the purchase for IP limiting
    const clientIP = getClientIP(request);
    await recordPurchase(clientIP);

    // Send Telegram notification
    console.log('🔄 Order created successfully, attempting to send Telegram notification...');
    try {
      const notificationData: OrderNotificationData = {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail || undefined,
        total: Number(order.total),
        items: order.items.map(item => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: Number(item.price)
        })),
        shippingAddress: order.shippingAddress,
        paymentProofUrl: order.paymentProofUrl || undefined,
        createdAt: order.createdAt
      };

      console.log('📋 Notification data prepared:', {
        orderNumber: notificationData.orderNumber,
        customerName: notificationData.customerName,
        total: notificationData.total,
        itemCount: notificationData.items.length
      });

      const telegramResult = await sendOrderNotification(notificationData);
      console.log('📤 Telegram notification result:', telegramResult);
    } catch (telegramError) {
      console.error('❌ Failed to send Telegram notification:', telegramError);
      // Don't fail the order creation if Telegram fails
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('id');

  if (orderId) {
    // This will be replaced with PostgreSQL query
    const order = {
      id: orderId,
      status: 'pending',
      items: [],
      total: 0,
      createdAt: new Date().toISOString()
    };
    return NextResponse.json(order);
  }

  return NextResponse.json(
    { error: 'Order ID is required' },
    { status: 400 }
  );
}
