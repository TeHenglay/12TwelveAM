import { z } from 'zod';
import { idSchema, priceSchema, emailSchema, phoneSchema, urlSchema } from './common';

// Order status enum
export const orderStatusEnum = z.enum(['PENDING', 'APPROVED']);

// Order item schema
export const orderItemSchema = z.object({
  productId: idSchema,
  name: z.string().min(1, 'Product name is required'),
  price: priceSchema,
  size: z.string(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

// Order creation schema
export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
  shippingAddress: z.string().min(5, 'Address must be at least 5 characters'),
  paymentProofUrl: urlSchema,
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
});

// Order update schema (for admin)
export const updateOrderSchema = z.object({
  status: orderStatusEnum,
  receiptId: z.string().optional(),
});

// Order ID param schema
export const orderIdParamSchema = z.object({
  id: idSchema,
});

// Order number param schema
export const orderNumberParamSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
});

// Order query schema
export const orderQuerySchema = z.object({
  status: orderStatusEnum.optional(),
  search: z.string().optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
});

