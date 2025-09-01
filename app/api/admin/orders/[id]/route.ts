import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
// Authentication removed - admin access is open
import { reduceStock, restoreStock, type StockUpdateItem } from '@/app/lib/stockManagement';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin access is open - no authentication required

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedOrder = {
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
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin access is open - no authentication required

    const { id } = await params;
    const data = await request.json();

    // Check if order exists and get current status
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const oldStatus = existingOrder.status;
    const newStatus = data.status;

    // Prepare stock update items
    const stockItems: StockUpdateItem[] = existingOrder.items.map(item => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity
    }));

    // Handle stock changes based on status transition
    if (oldStatus === 'PENDING' && newStatus === 'APPROVED') {
      // Reduce stock when approving order
      console.log(`Approving order ${existingOrder.orderNumber}, reducing stock...`);
      const stockResult = await reduceStock(stockItems);
      
      if (!stockResult.success) {
        return NextResponse.json(
          { 
            error: 'Cannot approve order: Insufficient stock',
            details: stockResult.errors 
          },
          { status: 400 }
        );
      }
    } else if (oldStatus === 'APPROVED' && newStatus === 'PENDING') {
      // Restore stock when reverting to pending
      console.log(`Reverting order ${existingOrder.orderNumber} to pending, restoring stock...`);
      const stockResult = await restoreStock(stockItems);
      
      if (!stockResult.success) {
        console.error('Failed to restore stock:', stockResult.errors);
        // Still allow the status change but log the error
      }
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
      },
      include: {
        items: true,
      },
    });

    // Format the response
    const formattedOrder = {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      total: parseFloat(updatedOrder.total.toString()),
      status: updatedOrder.status,
      customerName: updatedOrder.customerName,
      customerEmail: updatedOrder.customerEmail,
      customerPhone: updatedOrder.customerPhone,
      shippingAddress: updatedOrder.shippingAddress,
      paymentProofUrl: updatedOrder.paymentProofUrl,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      items: updatedOrder.items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: parseFloat(item.price.toString()),
        size: item.size,
        quantity: item.quantity,
      })),
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
