import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
// Authentication removed - admin access is open
import { invalidateCache, CACHE_KEYS } from '@/app/lib/redis';
import { broadcastProductUpdate } from '@/app/lib/sse-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin access is open - no authentication required

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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

    // Format the response
    const formattedProduct = {
      ...product,
      price: parseFloat(product.price.toString()),
      sizes: product.sizes.map((size: { price: { toString: () => string } }) => ({
        ...size,
        price: parseFloat(size.price.toString()),
      })),
      discount: product.discount
        ? {
            ...product.discount,
            percentage: parseFloat(product.discount.percentage.toString()),
          }
        : null,
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin access is open - no authentication required

    const { id } = await params;
    const data = await request.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it's unique
    if (data.slug && data.slug !== existingProduct.slug) {
      const productWithSlug = await prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (productWithSlug && productWithSlug.id !== id) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Extract sizes, images, and discount from the data
    const { sizes, images, discount, ...productData } = data;

    // Filter out fields that shouldn't be updated directly
    const {
      id: _,
      createdAt,
      updatedAt,
      category,
      collection,
      orderItems,
      ...updateableData
    } = productData;

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...updateableData,
        price: typeof updateableData.price === 'string'
          ? updateableData.price
          : updateableData.price?.toString(),
      },
    });

    // Update sizes if provided
    if (sizes && Array.isArray(sizes)) {
      // Delete existing sizes
      await prisma.productSize.deleteMany({
        where: { productId: id },
      });

      // Create new sizes
      if (sizes.length > 0) {
        await Promise.all(
          sizes.map((size: { size: string; price: string | number; stock?: number }) =>
            prisma.productSize.create({
              data: {
                productId: id,
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
    }

    // Update images if provided
    if (images && Array.isArray(images)) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      // Create new images
      if (images.length > 0) {
        await Promise.all(
          images.map((image: any, index: number) =>
            prisma.productImage.create({
              data: {
                productId: id,
                url: image.url,
                order: index,
              },
            })
          )
        );
      }
    }

    // Update discount if provided
    if (discount) {
      // Check if discount exists
      const existingDiscount = await prisma.discount.findUnique({
        where: { productId: id },
      });

      if (existingDiscount) {
        // Update existing discount
        await prisma.discount.update({
          where: { productId: id },
          data: {
            percentage: typeof discount.percentage === 'string'
              ? discount.percentage
              : discount.percentage.toString(),
            enabled: discount.enabled,
          },
        });
      } else {
        // Create new discount
        await prisma.discount.create({
          data: {
            productId: id,
            percentage: typeof discount.percentage === 'string'
              ? discount.percentage
              : discount.percentage.toString(),
            enabled: discount.enabled,
          },
        });
      }
    } else {
      // Delete discount if it exists
      await prisma.discount.deleteMany({
        where: { productId: id },
      });
    }

    // Invalidate cache for this product and the products list
    await Promise.all([
      invalidateCache(CACHE_KEYS.PRODUCTS),
      invalidateCache(CACHE_KEYS.PRODUCT_DETAIL(updatedProduct.slug))
    ]);
    
    // Broadcast product update to connected clients
    await broadcastProductUpdate({
      type: 'product_updated',
      slug: updatedProduct.slug,
      name: updatedProduct.name,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin access is open - no authentication required

    const { id } = await params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get the product slug before archiving
    const product = await prisma.product.findUnique({
      where: { id },
      select: { slug: true }
    });
    
    // Soft delete by marking as archived
    await prisma.product.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });
    
    // Invalidate cache for this product and the products list
    await Promise.all([
      invalidateCache(CACHE_KEYS.PRODUCTS),
      product ? invalidateCache(CACHE_KEYS.PRODUCT_DETAIL(product.slug)) : Promise.resolve()
    ]);
    
    // Broadcast product deletion to connected clients
    if (product) {
      await broadcastProductUpdate({
        type: 'product_deleted',
        slug: product.slug,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
