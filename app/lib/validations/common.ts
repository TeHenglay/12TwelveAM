import { z } from 'zod';

// Common validation patterns
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .optional()
  .or(z.literal(''));

export const phoneSchema = z
  .string()
  .min(7, 'Phone number is too short')
  .max(20, 'Phone number is too long')
  .regex(/^[+]?[\d\s()-]+$/, 'Please enter a valid phone number');

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must be at most 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

export const priceSchema = z
  .number()
  .positive('Price must be positive')
  .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(val => parseFloat(val)));

export const positiveIntSchema = z
  .number()
  .int('Must be a whole number')
  .nonnegative('Must be zero or positive')
  .or(z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)));

export const idSchema = z.string().min(1, 'ID is required');

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
});

