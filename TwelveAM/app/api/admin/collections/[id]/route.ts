import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';
// Authentication removed - admin access is open
import { updateCollectionSchema, validateBody, validationErrorResponse } from '@/app/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin access is open - no authentication required

    const { id } = await params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedCollection = {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      available: collection.available,
      collectionType: collection.collectionType,
      discontinuedDate: collection.discontinuedDate,
      productCount: collection._count.products,
      createdAt: collection.createdAt.toISOString(),
      updatedAt: collection.updatedAt.toISOString(),
    };

    return NextResponse.json(formattedCollection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
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

    // Check if collection exists
    const existingCollection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Validate request body against schema
    const validationResult = await validateBody(request, updateCollectionSchema);
    
    if (!validationResult.success) {
      return validationErrorResponse(validationResult);
    }
    
    const data = validationResult.data as { 
      name?: string; 
      description?: string; 
      available?: boolean; 
      collectionType?: 'CURRENT' | 'DISCONTINUED'; 
      discontinuedDate?: string;
    };

    // Update the collection
    const updatedCollection = await prisma.collection.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        available: data.available !== undefined ? data.available : existingCollection.available,
        collectionType: data.collectionType || existingCollection.collectionType,
        discontinuedDate: data.discontinuedDate ? new Date(data.discontinuedDate) : null,
      },
    });

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
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

    // Check if collection exists
    const existingCollection = await prisma.collection.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Check if collection has products
    if (existingCollection._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete collection with associated products' },
        { status: 400 }
      );
    }

    // Delete the collection
    await prisma.collection.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
