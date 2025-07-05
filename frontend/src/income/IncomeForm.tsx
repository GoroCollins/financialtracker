import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IncomeFormValues, incomeSchema, Currency } from "../utils/zodSchemas";
import { useEffect, forwardRef, useImperativeHandle } from "react";

interface IncomeFormProps {
  initialValues?: IncomeFormValues;
  onSubmit: (data: IncomeFormValues) => Promise<Record<string, string[]> | undefined>;
  isEditing?: boolean;
  currencies: Currency[];
}

export interface IncomeFormHandle {
  reset: () => void;
}

const IncomeForm = forwardRef<IncomeFormHandle, IncomeFormProps>(
  ({ initialValues, onSubmit, isEditing = false, currencies }, ref) => {
    const {
      register,
      handleSubmit,
      reset,
      setError,
      formState: { errors },
    } = useForm<IncomeFormValues>({
      resolver: zodResolver(incomeSchema),
      defaultValues: initialValues
        ? { ...initialValues, amount: Number(initialValues.amount) }
        : undefined,
    });

    useEffect(() => {
      if (initialValues) {
        reset({
          ...initialValues,
          amount: Number(initialValues.amount),
        });
      }
    }, [initialValues, reset]);

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    const handleFormSubmit = async (data: IncomeFormValues) => {
      const backendErrors = await onSubmit(data);
      if (backendErrors && typeof backendErrors === "object") {
        Object.entries(backendErrors).forEach(([field, messages]) => {
          setError(field as keyof IncomeFormValues, {
            type: "server",
            message: Array.isArray(messages) ? messages[0] : String(messages),
          });
        });
      }
    };

    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-w-md mb-6">
        <select {...register("currency")} className="form-select">
          <option value="">Select Currency</option>
          {currencies
            .filter((c) => c.is_local)
            .map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.description}
              </option>
            ))}
          {currencies.some((c) => !c.is_local) && <option disabled>──────────</option>}
          {currencies
            .filter((c) => !c.is_local)
            .map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.description}
              </option>
            ))}
        </select>
        {errors.currency && <p className="text-red-500">{errors.currency.message}</p>}

        <input {...register("income_name")} placeholder="Income Name" className="form-control" />
        {errors.income_name && <p className="text-red-500">{errors.income_name.message}</p>}

        <input
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
          placeholder="Amount"
          className="form-control"
        />
        {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}

        <textarea {...register("notes")} placeholder="Notes (optional)" className="form-control" />
        {errors.notes && <p className="text-red-500">{errors.notes.message}</p>}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {isEditing ? "Update" : "Create"}
        </button>
      </form>
    );
  }
);

export default IncomeForm;
