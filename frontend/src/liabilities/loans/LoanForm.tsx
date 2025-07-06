import { forwardRef, useEffect, useImperativeHandle } from "react";
import useSWR from "swr";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoanFormSchema, LoanFormValues, InterestTypeItem, Currency, LoanFormInput } from "../../utils/zodSchemas";
import { fetcher } from "../../utils/swrFetcher"; 
import { formatDateLocal } from "../../utils/dateUtils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


export interface LoanFormHandle {
  reset: () => void;
}

interface Props {
  onSubmit: (values: LoanFormValues) => Promise<Record<string, string[]> | undefined>;
  initialValues?: Partial<LoanFormInput>;
}

const LoanForm = forwardRef<LoanFormHandle, Props>(({ onSubmit, initialValues }, ref) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoanFormInput, any, LoanFormValues>({
    resolver: zodResolver(LoanFormSchema),
    defaultValues: initialValues as LoanFormInput,
  });

  const { data: interestTypes = [], error: interestError, isLoading: interestLoading, } = useSWR<InterestTypeItem[]>("/api/liabilities/interesttypes/", fetcher);
  const { data: currencies = [], error: currencyError, isLoading: currencyLoading, } = useSWR<Currency[]>("/api/currencies/currencies", fetcher);

  useImperativeHandle(ref, () => ({
    reset: () => reset(),
  }));

  const selectedInterestType = watch("interest_type");
  const loanDate = watch("loan_date");
  const repaymentDate = watch("repayment_date");

  // Custom validation: repayment date must be after loan date
  useEffect(() => {
    if (loanDate && repaymentDate && new Date(repaymentDate) < new Date(loanDate)) {
      setError("repayment_date", {
        type: "manual",
        message: "Repayment date must be after loan date",
      });
    } else {
      clearErrors("repayment_date");
    }
  }, [loanDate, repaymentDate, setError, clearErrors]);

  if (interestError || currencyError) { return <div className="text-danger">Failed to load form data.</div>; }
  if (interestLoading || currencyLoading ) { return <div>Loading form options...</div>; }

  const handleFormSubmit = async (data: LoanFormValues) => {
        const backendErrors = await onSubmit(data);
        if (backendErrors) { Object.entries(backendErrors).forEach(([field, messages]) => {
            setError(field as keyof LoanFormValues, { type: "server", message: messages.join(" "), });
    });
        }
      };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
      {errors.currency && <span className="text-danger">{errors.currency.message}</span>}
      <input aria-label="Loan Source" className="form-control" placeholder="Source" {...register("source")} />
      {errors.source && <span className="text-danger">{errors.source.message}</span>}

      {/* Loan Date */}
      <Controller
        control={control}
        name="loan_date"
        render={({ field }) => (
          <DatePicker
            placeholderText="Select loan date"
            className="form-control"
            selected={field.value ? new Date(field.value) : null}
            onChange={(date) => field.onChange(date ? formatDateLocal(date) : "")}
            dateFormat="yyyy-MM-dd" />
        )}
      />
      {errors.loan_date && <span className="text-danger">{errors.loan_date.message}</span>}

      <input type="number" step="0.01" className="form-control" placeholder="Amount Taken" {...register("amount_taken", { valueAsNumber: true })} />
      {errors.amount_taken && <span className="text-danger">{errors.amount_taken.message}</span>}
      <input className="form-control" placeholder="Reason" {...register("reason")} />
      {errors.reason && <span className="text-danger">{errors.reason.message}</span>}

      {/* Interest Type Dropdown */}
      <select className="form-control" {...register("interest_type")}>
        <option value="">Select Interest Type</option>
        {interestTypes.length === 0 ? (
          <option disabled>No interest types available</option>
        ) : (
          interestTypes.map((type) => (
            <option key={type.code} value={type.code}>
              {type.description}
            </option>
          ))
        )}
      </select>
      {errors.interest_type && <span className="text-danger">{errors.interest_type.message}</span>}

      {/* Compound Frequency input */}
      <input
        className="form-control"
        placeholder="Compound Frequency"
        {...register("compound_frequency", { setValueAs: (val) => (val === "" ? undefined : Number(val)), })}
        disabled={selectedInterestType !== "COMPOUND"}
      />
      {errors.compound_frequency && <span className="text-danger">{errors.compound_frequency.message}</span>}

      {/* Repayment Date */}
      <Controller
        control={control}
        name="repayment_date"
        render={({ field }) => (
          <DatePicker
            minDate={new Date()}
            placeholderText="Select repayment date"
            className="form-control"
            selected={field.value ? new Date(field.value) : null}
            onChange={(date) => field.onChange(date ? formatDateLocal(date) : "")}
            dateFormat="yyyy-MM-dd"
          />
        )}
      />
      {errors.repayment_date && <span className="text-danger">{errors.repayment_date.message}</span>}

      <input type="number" step="0.01" className="form-control" placeholder="Interest Rate (%)" {...register("interest_rate", { valueAsNumber: true })} />
      {errors.interest_rate && <span className="text-danger">{errors.interest_rate.message}</span>}
      <input type="number" step="0.01" className="form-control" placeholder="Amount Paid (Optional)" {...register("amount_paid", {
    setValueAs: (val) => (val === "" ? undefined : Number(val)), })} />
    {errors.amount_paid && <span className="text-danger">{errors.amount_paid.message}</span>}

      <button className="btn btn-primary" type="submit">Save Loan</button>
    </form>
  );
});

export default LoanForm;

