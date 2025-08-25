import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
// Authentication removed - admin access is open
import { createCollectionSchema, validateBody, validationErrorResponse } from '@/app/lib/validations';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated as admin
    // const isAdmin = true; // Admin access is open
    // Authentication removed

    // Get collections with product count
    const collections = await prisma.collection.findMany({
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
    const formattedCollections = collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      available: collection.available,
      collectionType: collection.collectionType,
      discontinuedDate: collection.discontinuedDate,
      productCount: collection._count.products,
      createdAt: collection.createdAt.toISOString(),
      updatedAt: collection.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedCollections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
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
    const validationResult = await validateBody(request, createCollectionSchema);
    
    if (!validationResult.success) {
      return validationErrorResponse(validationResult);
    }
    
    const data = validationResult.data as { 
      name: string; 
      description: string; 
      available?: boolean; 
      collectionType?: 'CURRENT' | 'DISCONTINUED'; 
      discontinuedDate?: string;
    };

    // Create the collection
    const collection = await prisma.collection.create({
      data: {
        name: data.name,
        description: data.description,
        available: data.available !== undefined ? data.available : true,
        collectionType: data.collectionType || 'CURRENT',
        discontinuedDate: data.discontinuedDate ? new Date(data.discontinuedDate) : null,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}


