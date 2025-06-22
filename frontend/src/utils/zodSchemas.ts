import { z } from 'zod';

export const CurrencySchema = z.object({
  code: z.string().min(1, 'Currency code is required'),
  description: z.string().min(1, 'Description is required'),
  is_local: z.boolean(),
});

export const ExchangeRateSchema = z.object({
  currency: z.string().optional(), // <- Mark as optional
  rate: z
    .number({ invalid_type_error: 'Rate must be a number' })
    .min(0.1, 'Rate must be at least 0.1'),
});

export const userProfileSchema = z.object({
  username: z.string(),
  email: z.string().email({ message: 'Invalid email address' }),
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  profile_image: z.any().optional(),
});

export type CurrencyFormData = z.infer<typeof CurrencySchema>;
export type ExchangeRateFormData = z.infer<typeof ExchangeRateSchema>;
export type UserProfileForm = z.infer<typeof userProfileSchema>;