import { z } from 'zod';
import { emailSchema, phoneSchema, urlSchema } from './common';

// Cart item schema
export const cartItemSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  image: z.string().nullable(),
  variant: z.object({
    size: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
});

// Checkout form schema
export const checkoutFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: phoneSchema,
  email: emailSchema,
  instagram: z.string().optional(),
  province: z.string().min(1, 'Province/City is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  paymentProofUrl: z.string().min(1, 'Please upload a payment proof').refine((url) => {
    // Allow both full URLs and relative paths that start with /uploads/
    return url.startsWith('http') || url.startsWith('/uploads/');
  }, 'Please upload a valid payment proof'),
});

// Checkout submission schema (combines form and cart)
export const checkoutSubmissionSchema = checkoutFormSchema.extend({
  items: z.array(cartItemSchema).min(1, 'Cart must contain at least one item'),
  subtotal: z.number().positive(),
  deliveryFee: z.number().nonnegative(),
  total: z.number().positive(),
});

