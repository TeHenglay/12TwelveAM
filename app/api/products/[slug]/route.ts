import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { getCachedData, cacheData, CACHE_KEYS } from '@/app/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Try to get product from cache
    const cacheKey = CACHE_KEYS.PRODUCT_DETAIL(slug);
    const cachedProduct = await getCachedData(cacheKey);
    
    if (cachedProduct) {
      return NextResponse.json(cachedProduct);
    }
    
    // If not in cache, fetch from database
    const product = await prisma.product.findUnique({
      where: {
        slug,
        isArchived: false,
      },
      include: {
        category: true,
        collection: true,
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        sizes: true,
        discount: true,
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Format the product data
    const formattedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: parseFloat(product.price.toString()),
      inStock: product.inStock,
      category: {
        id: product.category.id,
        name: product.category.name,
      },
      collection: product.collection ? {
        id: product.collection.id,
        name: product.collection.name,
      } : null,
      images: product.images.map(image => ({
        id: image.id,
        url: image.url,
        order: image.order,
      })),
      sizes: product.sizes.map(size => ({
        id: size.id,
        size: size.size,
        price: parseFloat(size.price.toString()),
        stock: size.stock,
        inStock: size.stock > 0,
      })),
      discount: product.discount ? {
        percentage: parseFloat(product.discount.percentage.toString()),
        enabled: product.discount.enabled,
      } : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
    
    // Cache the formatted product
    await cacheData(cacheKey, formattedProduct, 3600); // Cache for 1 hour
    
    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

