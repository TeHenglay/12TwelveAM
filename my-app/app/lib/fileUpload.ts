import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

// Constants
export const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
export const PAYMENT_PROOFS_DIR = join(UPLOAD_DIR, 'payment-proofs');
export const PRODUCT_IMAGES_DIR = join(UPLOAD_DIR, 'products');

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Allowed image MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Allowed payment proof MIME types (images + PDF)
export const ALLOWED_PAYMENT_PROOF_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
];

// File upload error types
export enum FileUploadErrorType {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

// File upload error class
export class FileUploadError extends Error {
  type: FileUploadErrorType;
  
  constructor(message: string, type: FileUploadErrorType) {
    super(message);
    this.type = type;
    this.name = 'FileUploadError';
  }
}

// Interface for file metadata
export interface FileMetadata {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  hash: string;
  publicUrl: string;
}

// Ensure upload directories exist
export async function ensureUploadDirectories() {
  // Create base upload directory if it doesn't exist
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  
  // Create payment proofs directory if it doesn't exist
  if (!existsSync(PAYMENT_PROOFS_DIR)) {
    await mkdir(PAYMENT_PROOFS_DIR, { recursive: true });
  }
  
  // Create product images directory if it doesn't exist
  if (!existsSync(PRODUCT_IMAGES_DIR)) {
    await mkdir(PRODUCT_IMAGES_DIR, { recursive: true });
  }
}

// Generate a hash-based filename
export function generateHashFilename(originalName: string, buffer: Buffer): string {
  // Get file extension
  const extension = originalName.split('.').pop()?.toLowerCase() || '';
  
  // Generate hash from file content + timestamp for uniqueness
  const hash = crypto
    .createHash('sha256')
    .update(buffer)
    .update(Date.now().toString())
    .digest('hex')
    .slice(0, 16); // Use first 16 chars of hash
  
  return `${hash}.${extension}`;
}

// Validate file size
export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

// Validate file type
export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(mimeType);
}

// Upload a file to the local filesystem
export async function uploadFile(
  file: File,
  directory: string,
  allowedTypes: string[]
): Promise<FileMetadata> {
  try {
    // Ensure upload directories exist
    await ensureUploadDirectories();
    
    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Validate file size
    if (!validateFileSize(buffer.length)) {
      throw new FileUploadError(
        `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        FileUploadErrorType.FILE_TOO_LARGE
      );
    }
    
    // Validate file type
    if (!validateFileType(file.type, allowedTypes)) {
      throw new FileUploadError(
        `File type ${file.type} is not allowed`,
        FileUploadErrorType.INVALID_FILE_TYPE
      );
    }
    
    // Generate hash-based filename
    const hashedFilename = generateHashFilename(file.name, buffer);
    
    // Create full path
    const fullPath = join(directory, hashedFilename);
    
    // Write file to disk
    await writeFile(fullPath, buffer);
    
    // Generate public URL - ensure it starts with /uploads/
    const relativePath = fullPath.replace(join(process.cwd(), 'public'), '');
    let publicUrl = relativePath.replace(/\\/g, '/'); // Replace backslashes with forward slashes for URLs
    
    // Ensure the URL starts with /uploads/ for proper serving
    if (!publicUrl.startsWith('/uploads/')) {
      publicUrl = '/uploads' + publicUrl;
    }
    
    // Return file metadata
    return {
      filename: hashedFilename,
      originalName: file.name,
      path: fullPath,
      size: buffer.length,
      mimeType: file.type,
      hash: hashedFilename.split('.')[0],
      publicUrl,
    };
  } catch (error) {
    // Rethrow FileUploadError
    if (error instanceof FileUploadError) {
      throw error;
    }
    
    // Wrap other errors
    throw new FileUploadError(
      `Failed to upload file: ${(error as Error).message}`,
      FileUploadErrorType.UPLOAD_FAILED
    );
  }
}

// Upload a payment proof
export async function uploadPaymentProof(file: File): Promise<FileMetadata> {
  return uploadFile(file, PAYMENT_PROOFS_DIR, ALLOWED_PAYMENT_PROOF_TYPES);
}

// Upload a product image
export async function uploadProductImage(file: File): Promise<FileMetadata> {
  return uploadFile(file, PRODUCT_IMAGES_DIR, ALLOWED_IMAGE_TYPES);
}
