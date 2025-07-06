import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { Currency } from "../utils/zodSchemas";
import { AssetTypeKey } from "../constants/assetsTypes";
import { AssetFormValues, getAssetSchema } from "../utils/zodSchemas";

interface Props {
  assetType: AssetTypeKey;
  initialValues?: AssetFormValues;
  onSubmit: (data: AssetFormValues) => Promise<Record<string, string[]> | undefined>;
  isEditing?: boolean;
  currencies: Currency[];
}

const AssetForm: React.FC<Props> = ({
  assetType,
  initialValues,
  onSubmit,
  isEditing = false,
  currencies
}) => {
  // Dynamically get schema for selected asset type
  const schema = useMemo(() => getAssetSchema(assetType), [assetType]);

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<AssetFormValues>({resolver: zodResolver(schema), defaultValues: initialValues || {} });

useEffect(() => {
  if (initialValues) {
    const base = {
      ...initialValues,
      amount: Number(initialValues.amount),
    };

    if (assetType === "equity" && "ratio" in initialValues) {
      (base as any).ratio = Number((initialValues as any).ratio);
    }

    reset(base);
  }
}, [initialValues, reset, assetType]);

  const handleFormSubmit = async (data: AssetFormValues) => {
    const backendErrors = await onSubmit(data);
    if (backendErrors) { Object.entries(backendErrors).forEach(([field, messages]) => {
        setError(field as keyof AssetFormValues, {
          type: "server",
          message: messages.join(" "),
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

      <input {...register("name")} placeholder="Asset Name" className="form-control" />
      {errors.name && <p className="text-red-500">{errors.name.message}</p>}

      <input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} placeholder="Amount" className="form-control" />
      {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}

      {assetType === "liquid" && (
        <>
          <input {...register("source")} placeholder="Source" className="form-control" />
          {"source" in errors && <p className="text-red-500">{errors.source?.message}</p>}
        </>
      )}

      {assetType === "equity" && (
        <>
          <input type="number" step="0.01" {...register("ratio", { valueAsNumber: true })} placeholder="Ratio" className="form-control" />
          {"ratio" in errors && <p className="text-red-500">{errors.ratio?.message}</p>}
        </>
      )}

      {assetType === "retirement" && (
        <>
          <input {...register("employer")} placeholder="Employer" className="form-control" />
          {"employer" in errors && <p className="text-red-500">{errors.employer?.message}</p>}
        </>
      )}

      <textarea {...register("notes")} placeholder="Notes (optional)" className="form-control" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {isEditing ? "Update" : "Create"}
      </button>
    </form>
  );
};

export default AssetForm;
