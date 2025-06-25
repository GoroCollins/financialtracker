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

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().nonempty('Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().nonempty('Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type FormInputs = z.infer<typeof ChangePasswordSchema>;
export type CurrencyFormData = z.infer<typeof CurrencySchema>;
export type ExchangeRateFormData = z.infer<typeof ExchangeRateSchema>;
export type UserProfileForm = z.infer<typeof userProfileSchema>;


export const incomeSchema = z.object({
  income_name: z.string().min(1),
  currency: z.string().min(1),
  amount: z.number().nonnegative(),
  notes: z.string().optional(),
});

export type IncomeFormValues = z.infer<typeof incomeSchema>;

export interface IncomeResponse extends IncomeFormValues {
  id: number;
  amount_lcy_display: string;
  created_by: string;
  created_at: string;
  modified_by: string | null;
  modified_at: string | null;
}

export interface  Currency extends CurrencyFormData {
  code: string;
  description: string;
  is_local: boolean;
  created_by: string;
  created_at: string;
  modified_by: string | null;
  modified_at: string;
};
