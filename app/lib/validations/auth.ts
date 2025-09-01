import { z } from 'zod';
import { emailSchema } from './common';

// User registration schema
export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema.refine(val => val !== '', { message: 'Email is required' }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// User login schema
export const userLoginSchema = z.object({
  email: emailSchema.refine(val => val !== '', { message: 'Email is required' }),
  password: z.string().min(1, 'Password is required'),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema.refine(val => val !== '', { message: 'Email is required' }),
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

