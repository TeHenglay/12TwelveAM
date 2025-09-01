import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
// Authentication removed - admin access is open

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    // const isAdmin = true; // Admin access is open
    // Authentication removed

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    // Build where clause based on filters
    const whereClause: any = {};
    
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get orders with related data
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      total: parseFloat(order.total.toString()),
      status: order.status,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      paymentProofUrl: order.paymentProofUrl,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: parseFloat(item.price.toString()),
        size: item.size,
        quantity: item.quantity,
      })),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

