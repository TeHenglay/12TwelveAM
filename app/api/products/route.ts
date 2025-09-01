import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
import { getCachedData, cacheData, invalidateCache, CACHE_KEYS } from '@/app/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const collection = searchParams.get('collection');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    
    // Create cache key based on query parameters
    const cacheKey = `${CACHE_KEYS.PRODUCTS}:${category || ''}:${collection || ''}:${search || ''}:${sort}:${page}:${limit}:${minPrice || ''}:${maxPrice || ''}`;
    
    // Try to get from cache
    const cachedProducts = await getCachedData(cacheKey);
    if (cachedProducts) {
      return NextResponse.json(cachedProducts);
    }
    
    // Build where clause
    const whereClause: any = { isArchived: false };
    
    if (category) {
      whereClause.categoryId = category;
    }
    
    if (collection) {
      whereClause.collectionId = collection;
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      
      if (minPrice !== undefined) {
        whereClause.price.gte = minPrice.toString();
      }
      
      if (maxPrice !== undefined) {
        whereClause.price.lte = maxPrice.toString();
      }
    }
    
    // Determine sort order
    let orderBy: any;
    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch products from database
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            orderBy: {
              order: 'asc',
            },
            take: 1, // Only get the first image for list view
          },
          sizes: {
            select: {
              id: true,
              size: true,
              price: true,
              stock: true,
            },
          },
          discount: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);
    
    // Format products for response
    const formattedProducts = products.map(product => ({
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
      image: product.images.length > 0 ? product.images[0].url : null,
      hasSizes: product.sizes.length > 0,
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
    
    // Prepare response with pagination
    const response = {
      products: formattedProducts,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
    
    // Cache the response
    await cacheData(cacheKey, response, 1800); // Cache for 30 minutes
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// This endpoint is only for admin use
export async function POST(request: NextRequest) {
  try {
    // This is just a stub - the actual implementation is in the admin API
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 400 }
    );
  }
}
