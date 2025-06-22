// components/income/IncomeForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IncomeFormValues, incomeSchema } from "../utils/zodSchemas";
import { useEffect } from "react";
import { Currency } from "../utils/zodSchemas";

interface IncomeFormProps {
  initialValues?: IncomeFormValues;
  onSubmit: (data: IncomeFormValues) => void;
  isEditing?: boolean;
  currencies: Currency[];  // 👈 Add this prop
}

const IncomeForm: React.FC<IncomeFormProps> = ({ initialValues, onSubmit, isEditing = false, currencies }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: initialValues
  });

  useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <input {...register("income_name")} placeholder="Income Name" />
      {errors.income_name && <p className="text-red-500">{errors.income_name.message}</p>}

      <select {...register("currency")} className="form-select">
        <option value="">Select Currency</option>

        {/* Group Local Currencies */}
        {currencies
            .filter((c) => c.is_local)
            .map((currency) => (
            <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.description}
            </option>
            ))}

        {/* Separator */}
        {currencies.some((c) => !c.is_local) && (
            <option disabled>──────────</option>
        )}

        {/* Group Foreign Currencies */}
        {currencies
            .filter((c) => !c.is_local)
            .map((currency) => (
            <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.description}
            </option>
            ))}
        </select>
      {errors.currency && <p className="text-red-500">{errors.currency.message}</p>}

      <input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} placeholder="Amount" />
      {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}

      <textarea {...register("notes")} placeholder="Notes (optional)" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {isEditing ? "Update" : "Create"}
      </button>
    </form>
  );
};

export default IncomeForm;
