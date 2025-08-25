import { z } from 'zod';
import { idSchema, priceSchema, slugSchema, urlSchema, positiveIntSchema } from './common';

// Product size schema
export const productSizeSchema = z.object({
  id: idSchema.optional(),
  size: z.string().min(1, 'Size is required'),
  price: priceSchema,
  stock: positiveIntSchema,
});

// Product image schema
export const productImageSchema = z.object({
  id: idSchema.optional(),
  url: z.string().min(1, 'Image URL is required').refine((url) => {
    // Allow full URLs, relative paths starting with /uploads/, and Base64 data URLs
    return url.startsWith('http') || url.startsWith('/uploads/') || url.startsWith('data:image/');
  }, 'Please provide a valid image URL, upload path, or Base64 image data'),
  order: z.number().int().nonnegative().optional().default(0),
});

// Discount schema
export const discountSchema = z.object({
  percentage: z.number().min(0).max(100).or(
    z.string().regex(/^\d+(\.\d{1,2})?$/).transform(val => parseFloat(val))
  ),
  enabled: z.boolean().default(false),
});

// Product creation schema
export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: slugSchema.optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: priceSchema,
  inStock: z.boolean().default(true),
  categoryId: idSchema,
  collectionId: idSchema.optional().nullable(),
  displayOrder: z.number().int().optional(),
  sizes: z.array(productSizeSchema).optional(),
  images: z.array(productImageSchema).optional(),
  discount: discountSchema.optional(),
});

// Product update schema
export const updateProductSchema = createProductSchema.partial().extend({
  id: idSchema,
});

// Product query schema
export const productQuerySchema = z.object({
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  search: z.string().optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  inStock: z.boolean().optional(),
  sort: z.enum(['name_asc', 'name_desc', 'price_asc', 'price_desc', 'newest']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
});

// Product ID param schema
export const productIdParamSchema = z.object({
  id: idSchema,
});

// Product slug param schema
export const productSlugParamSchema = z.object({
  slug: slugSchema,
});

