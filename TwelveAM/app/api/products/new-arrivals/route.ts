import { NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { getCachedData, cacheData } from '@/app/lib/redis';

export async function GET() {
  try {
    // Try to get from cache first
    const cacheKey = 'new-arrivals:latest:5';
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    const newArrivals = await prisma.product.findMany({
      where: {
        isArchived: false,
        inStock: true, // Only fetch in-stock items for better performance
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: {
          take: 1,
          orderBy: {
            order: 'asc',
          },
          select: {
            url: true,
          },
        },
        sizes: {
          select: {
            size: true,
            price: true,
          },
          orderBy: {
            size: 'asc',
          },
        },
        inStock: true,
        discount: {
          select: {
            percentage: true,
            enabled: true,
          },
        },
      },
    });

    const formattedProducts = newArrivals.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price.toString()),
      image: product.images[0]?.url || null,
      inStock: product.inStock,
      sizes: product.sizes.map(s => s.size),
      minPrice: product.sizes.length > 0
        ? Math.min(...product.sizes.map(s => parseFloat(s.price.toString())))
        : parseFloat(product.price.toString()),
      maxPrice: product.sizes.length > 0
        ? Math.max(...product.sizes.map(s => parseFloat(s.price.toString())))
        : parseFloat(product.price.toString()),
      discount: product.discount ? {
        percentage: parseFloat(product.discount.percentage.toString()),
        enabled: product.discount.enabled,
      } : null,
    }));

    // Cache the response for 5 minutes
    await cacheData(cacheKey, formattedProducts, 300);

    return NextResponse.json(formattedProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new arrivals' },
      { status: 500 }
    );
  }
}