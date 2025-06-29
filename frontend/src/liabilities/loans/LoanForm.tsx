import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoanFormSchema, LoanFormValues } from "../../utils/zodSchemas";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { InterestTypeItem } from "../../utils/zodSchemas";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export interface LoanFormHandle {
  reset: () => void;
}

interface Props {
  onSubmit: (values: LoanFormValues) => void;
  initialValues?: Partial<LoanFormValues>;
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
  } = useForm<LoanFormValues>({
    resolver: zodResolver(LoanFormSchema),
    defaultValues: initialValues,
  });

  const [interestTypes, setInterestTypes] = useState<InterestTypeItem[]>([]);

  useImperativeHandle(ref, () => ({
    reset: () => reset(),
  }));

  const selectedInterestType = watch("interest_type");
  const loanDate = watch("loan_date");
  const repaymentDate = watch("repayment_date");

  useEffect(() => {
    const fetchInterestTypes = async () => {
      try {
        const response = await axiosInstance.get("/api/liabilities/interesttypes/");
        setInterestTypes(response.data);
      } catch (error) {
        console.error("Failed to fetch interest types", error);
      }
    };
    fetchInterestTypes();
  }, []);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input className="form-control" placeholder="Source" {...register("source")} />
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
            onChange={(date) => field.onChange(date?.toISOString().slice(0, 10))}
            dateFormat="yyyy-MM-dd"
          />
        )}
      />
      {errors.loan_date && <span className="text-danger">{errors.loan_date.message}</span>}

      <input className="form-control" placeholder="Currency" {...register("currency")} />
      <input type="number" step="0.01" className="form-control" placeholder="Amount Taken" {...register("amount_taken")} />
      <input className="form-control" placeholder="Reason" {...register("reason")} />

      {/* Interest Type Dropdown */}
      <select className="form-control" {...register("interest_type")}>
        <option value="">Select Interest Type</option>
        {interestTypes.map((type) => (
          <option key={type.code} value={type.code}>
            {type.description}
          </option>
        ))}
      </select>
      {errors.interest_type && <span className="text-danger">{errors.interest_type.message}</span>}

      {/* Compound Frequency input */}
      <input
        className="form-control"
        placeholder="Compound Frequency"
        {...register("compound_frequency")}
        disabled={selectedInterestType !== "COMPOUND"}
      />
      {errors.compound_frequency && <span className="text-danger">{errors.compound_frequency.message}</span>}

      {/* Repayment Date */}
      <Controller
        control={control}
        name="repayment_date"
        render={({ field }) => (
          <DatePicker
            placeholderText="Select repayment date"
            className="form-control"
            selected={field.value ? new Date(field.value) : null}
            onChange={(date) => field.onChange(date?.toISOString().slice(0, 10))}
            dateFormat="yyyy-MM-dd"
          />
        )}
      />
      {errors.repayment_date && <span className="text-danger">{errors.repayment_date.message}</span>}

      <input type="number" step="0.01" className="form-control" placeholder="Interest Rate (%)" {...register("interest_rate")} />
      <input type="number" step="0.01" className="form-control" placeholder="Amount Paid" {...register("amount_paid")} />

      <button className="btn btn-primary" type="submit">Save Loan</button>
    </form>
  );
});

export default LoanForm;
