import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_API_BASE_URL must be a valid URL' }),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default('GIFT KRO'),
  NEXT_PUBLIC_APP_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z
    .string()
    .default('rzp_test_giftkro_dev_key'),
});

export const validateClientEnv = () => {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  });

  if (!result.success) {
    if (typeof window !== 'undefined') {
      console.warn('Frontend Environment Warning:', result.error.format());
    }
  }

  return result.success
    ? result.data
    : {
        NEXT_PUBLIC_API_BASE_URL: 'http://localhost:5000/api',
        NEXT_PUBLIC_APP_NAME: 'GIFT KRO',
        NEXT_PUBLIC_APP_ENV: 'development',
      };
};

export const clientEnv = validateClientEnv();
