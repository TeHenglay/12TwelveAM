import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
// Authentication removed - admin access is open
import { productQuerySchema, validateQuery, validateBody, validationErrorResponse, createProductSchema } from '@/app/lib/validations';
import { invalidateCache, CACHE_KEYS } from '@/app/lib/redis';
import { broadcastProductUpdate } from '@/app/api/sse/product-updates/route';

export async function GET(request: NextRequest) {
  try {
    // Admin access is open - no authentication required

    // Validate query parameters
    const queryResult = validateQuery(request, productQuerySchema);
    if (!queryResult.success) {
      return NextResponse.json(
        { error: queryResult.error },
        { status: queryResult.status }
      );
    }

    const { 
      categoryId, 
      search, 
      minPrice, 
      maxPrice, 
      inStock, 
      sort,
      page = 1,
      limit = 10
    } = queryResult.data as any;

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    // Build where clause based on filters
    const whereClause: any = { isArchived: false };
    
    if (filter === 'in-stock') {
      whereClause.inStock = true;
    } else if (filter === 'out-of-stock') {
      whereClause.inStock = false;
    } else if (inStock !== undefined) {
      whereClause.inStock = inStock;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
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
    let orderBy: any = { updatedAt: 'desc' };
    if (sort) {
      switch (sort) {
        case 'name_asc':
          orderBy = { name: 'asc' };
          break;
        case 'name_desc':
          orderBy = { name: 'desc' };
          break;
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get products with related data
    let products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        sizes: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.product.count({
      where: whereClause,
    });

    // Handle low-stock filter separately
    if (filter === 'low-stock') {
      products = products.filter(product => 
        product.sizes.some(size => size.stock > 0 && size.stock < 5)
      );
    }

    // Format the response
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: parseFloat(product.price.toString()),
      inStock: product.inStock,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      images: product.images,
      sizes: product.sizes.map(size => ({
        id: size.id,
        size: size.size,
        price: parseFloat(size.price.toString()),
        stock: size.stock,
      })),
    }));

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Admin access is open - no authentication required

    // Validate request body against schema
    const validationResult = await validateBody(request, createProductSchema);
    
    if (!validationResult.success) {
      return validationErrorResponse(validationResult);
    }
    
    const data = validationResult.data as any;
    
    // Generate slug from name if not provided
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Extract sizes, images, and discount from the data
    const { sizes, images, discount, ...productData } = data;

    // Create the product
    const product = await prisma.product.create({
      data: {
        ...productData,
        price: typeof productData.price === 'string' 
          ? productData.price 
          : productData.price.toString(),
      },
    });

    // Add sizes if provided
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      await Promise.all(
        sizes.map((size) =>
          prisma.productSize.create({
            data: {
              productId: product.id,
              size: size.size,
              price: typeof size.price === 'string' 
                ? size.price 
                : size.price.toString(),
              stock: size.stock || 0,
            },
          })
        )
      );
    }

    // Add images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      await Promise.all(
        images.map((image, index) =>
          prisma.productImage.create({
            data: {
              productId: product.id,
              url: image.url,
              order: index,
            },
          })
        )
      );
    }

    // Add discount if provided
    if (discount) {
      await prisma.discount.create({
        data: {
          productId: product.id,
          percentage: typeof discount.percentage === 'string'
            ? discount.percentage
            : discount.percentage.toString(),
          enabled: discount.enabled,
        },
      });
    }

    // Invalidate product cache to ensure frontend gets updated data
    await invalidateCache(CACHE_KEYS.PRODUCTS);
    
    // Broadcast product update to connected clients
    await broadcastProductUpdate({
      type: 'product_created',
      slug: product.slug,
      name: product.name,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

