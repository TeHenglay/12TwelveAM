import { z } from 'zod';
import { idSchema, urlSchema } from './common';

// Category creation schema
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  imageUrl: urlSchema,
});

// Category update schema
export const updateCategorySchema = createCategorySchema.partial().extend({
  id: idSchema,
});

// Category ID param schema
export const categoryIdParamSchema = z.object({
  id: idSchema,
});

// Collection type enum
export const collectionTypeEnum = z.enum(['CURRENT', 'DISCONTINUED']);

// Collection creation schema
export const createCollectionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  available: z.boolean().default(true),
  collectionType: collectionTypeEnum.default('CURRENT'),
  discontinuedDate: z.date().optional().nullable(),
});

// Collection update schema
export const updateCollectionSchema = createCollectionSchema.partial().extend({
  id: idSchema,
});

// Collection ID param schema
export const collectionIdParamSchema = z.object({
  id: idSchema,
});

