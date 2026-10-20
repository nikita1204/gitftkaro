import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, { message: 'Full name must be at least 2 characters long' })
      .max(50, { message: 'Full name cannot exceed 50 characters' }),
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email({ message: 'Please provide a valid email address' }),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(100, { message: 'Password cannot exceed 100 characters' })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, {
        message: 'Password must contain at least one letter and one number',
      }),
    phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal('')),
    city: z
      .string()
      .trim()
      .optional()
      .default('Raipur'),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email({ message: 'Please provide a valid email address' }),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, { message: 'Password is required' }),
  }),
};
