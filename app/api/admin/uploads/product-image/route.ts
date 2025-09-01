import { NextRequest, NextResponse } from 'next/server';
import { uploadProductImage, FileUploadError, FileUploadErrorType } from '@/app/lib/fileUpload';
// Authentication removed - admin access is open

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated as admin
    // const isAdmin = true; // Admin access is open
    // Authentication removed

    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Check if file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload the file
    const fileMetadata = await uploadProductImage(file);

    // Return the file metadata
    return NextResponse.json({ success: true, file: fileMetadata });
  } catch (error) {
    console.error('Error uploading product image:', error);

    // Handle specific file upload errors
    if (error instanceof FileUploadError) {
      const status = 
        error.type === FileUploadErrorType.FILE_TOO_LARGE ||
        error.type === FileUploadErrorType.INVALID_FILE_TYPE
          ? 400
          : 500;

      return NextResponse.json(
        { 
          error: error.message,
          type: error.type 
        },
        { status }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Failed to upload product image' },
      { status: 500 }
    );
  }
}

