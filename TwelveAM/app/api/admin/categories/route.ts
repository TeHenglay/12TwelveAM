import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
// Authentication removed - admin access is open
import { createCategorySchema, validateBody, validationErrorResponse } from '@/app/lib/validations';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    // const isAdmin = true; // Admin access is open
    // Authentication removed

    // Get categories with product count
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Format the response
    const formattedCategories = categories.map((category: {
      id: string;
      name: string;
      imageUrl: string | null;
      _count: { products: number };
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl,
      productCount: category._count.products,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    // const isAdmin = true; // Admin access is open
    // Authentication removed

    // Validate request body against schema
    const validationResult = await validateBody(request, createCategorySchema);
    if (!validationResult.success) {
      return validationErrorResponse(validationResult);
    }

    const data = validationResult.data as { name: string; imageUrl?: string };
    
    // Check if category with same name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl || null, // Handle empty strings
      },
    });

    return NextResponse.json({
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl,
      productCount: 0,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

