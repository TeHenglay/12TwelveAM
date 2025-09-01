import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    // Get real counts from database with proper error handling
    const [totalProducts, totalOrders, categories, collections] = await Promise.all([
      prisma.product.count({ where: { isArchived: false } }).catch(() => 0),
      prisma.order.count().catch(() => 0), 
      prisma.category.count().catch(() => 0),
      prisma.collection.count().catch(() => 0)
    ]);

    // Get low stock products count
    const lowStockProducts = await prisma.productSize.count({
      where: { stock: { lt: 5 } }
    }).catch(() => 0);

    // Calculate total customers (distinct customers from orders)
    const totalCustomers = await prisma.order.groupBy({
      by: ['customerEmail'],
      where: { customerEmail: { not: null } }
    }).then(users => users.length).catch(() => 0);

    // Calculate total revenue from completed orders
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { status: 'APPROVED' }
        ]
      },
      select: { total: true }
    }).catch(() => []);
    
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (parseFloat(order.total?.toString() || '0'));
    }, 0);

    // Calculate growth (mock data for now)
    const growth = {
      products: Math.floor(Math.random() * 20) + 5,
      orders: Math.floor(Math.random() * 15) + 8,
      customers: Math.floor(Math.random() * 25) + 10,
      revenue: Math.floor(Math.random() * 30) + 15,
    };

    console.log('Stats fetched:', {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      categories,
      collections,
      lowStockProducts
    });

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue: Math.round(totalRevenue),
      categories,
      collections,
      lowStockProducts,
      growth
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    
    // Return zeros if database fails completely
    return NextResponse.json({
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      categories: 0,
      collections: 0,
      lowStockProducts: 0,
      growth: {
        products: 0,
        orders: 0,
        customers: 0,
        revenue: 0,
      }
    });
  }
}

