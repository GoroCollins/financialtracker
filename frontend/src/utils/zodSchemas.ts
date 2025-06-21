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

export type CurrencyFormData = z.infer<typeof CurrencySchema>;
export type ExchangeRateFormData = z.infer<typeof ExchangeRateSchema>;