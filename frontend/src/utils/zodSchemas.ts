import { z } from 'zod';

export const CurrencySchema = z.object({
  code: z.string().min(1, 'Currency code is required'),
  description: z.string().min(1, 'Description is required'),
  is_local: z.boolean(),
});

export type CurrencyFormData = z.infer<typeof CurrencySchema>;