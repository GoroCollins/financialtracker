import { z } from 'zod';
import { AssetTypeKey } from '../constants/assetsTypes';
import { parsePhoneNumberFromString } from "libphonenumber-js";

const kenyanPhoneNumberSchema = z
  .string()
  .min(10, "Phone number is too short")
  .refine((val) => {
    const phone = parsePhoneNumberFromString(val, "KE");
    return phone?.isValid();
  }, {
    message: "Invalid Kenyan phone number",
  })
  .transform((val) => {
    const phone = parsePhoneNumberFromString(val, "KE");
    return phone ? phone.number : val; // returns E.164 format, e.g. +254723456891
  });

export const CurrencySchema = z.object({
  code: z.string().min(1, 'Currency code is required'),
  description: z.string().min(1, 'Description is required'),
  is_local: z.boolean(),
});

export type CurrencyFormData = z.infer<typeof CurrencySchema>;

export interface Currency extends CurrencyFormData {
  code: string;
  description: string;
  is_local: boolean;
  created_by: string;
  created_at: string;
  modified_by: string | null;
  modified_at: string;
};

export const ExchangeRateSchema = z.object({
  currency: z.string().optional(), // Still optional since it's derived from `useParams`
  rate: z.number({ invalid_type_error: 'Rate must be a number' }).min(0.1, 'Rate must be at least 0.1'),
  is_current: z.boolean({required_error: 'Please specify if this is the current exchange rate',}),
});

export type ExchangeRateFormData = z.infer<typeof ExchangeRateSchema>;

export interface ExchangeRate {
  id: number;
  rate: string;
  created_by: string;
  created_at: string;
  is_current: boolean;
}

export const userProfileSchema = z.object({
  username: z.string(),
  email: z.string().email({ message: 'Invalid email address' }),
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: kenyanPhoneNumberSchema.optional(),
  profile_image: z.any().optional(),
});

export type UserProfileForm = z.infer<typeof userProfileSchema>;

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

// Base fields for all assets
const baseAssetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  currency: z.string().min(1, "Currency is required"),
  amount: z.number().nonnegative("Amount must be non-negative"),
  notes: z.string().optional(),
});

// Additional fields per asset type
const liquidAssetFields = z.object({
  source: z.string().min(1, "Source is required"),
});

const equityAssetFields = z.object({
  ratio: z
    .number({
      required_error: "Ratio is required",
      invalid_type_error: "Ratio must be a number",
    })
    .gt(0, "Ratio must be greater than 0")
    .lte(1, "Ratio must be less than or equal to 1"), });

const retirementAccountFields = z.object({
  employer: z.string().min(1, "Employer is required"),
});

export const getAssetSchema = (assetType: AssetTypeKey) => {
  switch (assetType) {
    case "liquid":
      return baseAssetSchema.merge(liquidAssetFields);
    case "equity":
      return baseAssetSchema.merge(equityAssetFields);
    case "retirement":
      return baseAssetSchema.merge(retirementAccountFields);
    default:
      return baseAssetSchema; // "investment"
  }
};

export type AssetFormValues =
  | z.infer<typeof baseAssetSchema & typeof liquidAssetFields>
  | z.infer<typeof baseAssetSchema & typeof equityAssetFields>
  | z.infer<typeof baseAssetSchema & typeof retirementAccountFields>
  | z.infer<typeof baseAssetSchema>;

export const expensesSchema = z.object({
  expense_name: z.string().min(1),
  currency: z.string().min(1),
  amount: z.number().nonnegative(),
  notes: z.string().optional(),
});

export type ExpensesFormValues = z.infer<typeof expensesSchema>;

export interface ExpensesResponse extends ExpensesFormValues {
  id: number;
  amount_lcy_display: string;
  created_by: string;
  created_at: string;
  modified_by: string | null;
  modified_at: string | null;
}

export const interestTypeSchema = z.object({
  code: z.string().min(1, "Code is required").max(10),
  description: z.string().min(1, "Description is required"),
});

export type InterestTypeFormValues = z.infer<typeof interestTypeSchema>;

export interface InterestTypeItem {
  code: string;
  description: string;
  created_by: string;
  created_at: string;
  modified_by: string | null;
  modified_at: string;
}

export const interestTypeResponseSchema = interestTypeSchema.extend({
  created_by: z.string(),
  created_at: z.string(),
  modified_by: z.string().nullable(),
  modified_at: z.string(),
});

export type InterestTypeResponse = z.infer<typeof interestTypeResponseSchema>;

export const LoanFormSchema = z.object({
  source: z.string().min(1),
  loan_date: z.string(), // ISO string (from date input)
  currency: z.string(),
  amount_taken: z.number().nonnegative(),
  reason: z.string().optional(),
  interest_type: z.string(),
  compound_frequency: z.number().nonnegative().optional().transform((val) => val ?? 0),
  repayment_date: z.string(),
  interest_rate: z.number().nonnegative(),
  amount_paid: z.number().nonnegative("Amount paid must not be negative").optional().transform((val) => val ?? 0),
});

// export type LoanFormValues = z.output<typeof LoanFormSchema>;
export type LoanFormInput = z.input<typeof LoanFormSchema>;   // optional amount_paid
export type LoanFormValues = z.output<typeof LoanFormSchema>; // required amount_paid



export interface LoanItem {
  id: number;
  source: string;
  loan_date: string;
  currency: string;
  amount_taken: number;
  reason?: string;
  interest_type: string;
  compound_frequency?: number;
  repayment_date: string;
  interest_rate: number;
  interest: number;
  in_default: boolean;
  created_by: string;
  created_at: string;
  modified_by: string | null;
  modified_at: string | null;
  amount_taken_lcy_display: string | null;
  interest_lcy_display: string | null;
  amount_repay: number;
  amount_repay_lcy_display: string | null;
  amount_paid: number;
  amount_paid_lcy_display: string | null;
  due_balance: number;
  due_balance_lcy_display: string | null;
}