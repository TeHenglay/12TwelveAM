import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
// Authentication removed - admin access is open
import { updateCategorySchema, categoryIdParamSchema, validateBody, validateParams, validationErrorResponse } from '@/app/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin access is open - no authentication required

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl,
      productCount: category._count.products,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
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

    const resolvedParams = await params;
    // Validate path parameters
    const paramResult = validateParams(resolvedParams, categoryIdParamSchema);
    if (!paramResult.success) {
      return validationErrorResponse(paramResult);
    }

    const { id } = paramResult.data as { id: string };

    // Validate request body
    const validationResult = await validateBody(request, updateCategorySchema);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult);
    }

    const data = validationResult.data as {
      name?: string;
      imageUrl?: string;
    };

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if another category with the same name exists
    if (data.name && data.name !== existingCategory.name) {
      const categoryWithSameName = await prisma.category.findUnique({
        where: { name: data.name },
      });

      if (categoryWithSameName && categoryWithSameName.id !== id) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        imageUrl: data.imageUrl || null, // Handle empty strings
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: updatedCategory.id,
      name: updatedCategory.name,
      imageUrl: updatedCategory.imageUrl,
      productCount: updatedCategory._count.products,
      createdAt: updatedCategory.createdAt.toISOString(),
      updatedAt: updatedCategory.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
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

    const resolvedParams = await params;
    // Validate path parameters
    const paramResult = validateParams(resolvedParams, categoryIdParamSchema);
    if (!paramResult.success) {
      return validationErrorResponse(paramResult);
    }

    const { id } = paramResult.data as { id: string };

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products' },
        { status: 400 }
      );
    }

    // Delete the category
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
