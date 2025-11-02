import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { axiosInstance } from "../../../services/apiClient";
import LoanForm, { LoanFormHandle } from "../../../liabilities/loans/LoanForm";
import { LoanFormValues, LoanItem } from "../../../utils/zodSchemas";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AxiosError } from "axios";
import { extractErrorMessage } from "../../../utils/errorHandler";

const EditLoan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const formRef = useRef<LoanFormHandle>(null);

  const { data: loan, error, isLoading, mutate } = useSWR<LoanItem>(
    id ? `/api/liabilities/loans/${id}/` : null,
    fetcher
  );

  useEffect(() => {
    if (error) toast.error("Failed to load loan.");
  }, [error]);

  const handleUpdate = async (
    payload: LoanFormValues
  ): Promise<Record<string, string[]> | undefined> => {
    try {
      await axiosInstance.put(`/api/liabilities/loans/${id}/`, payload);
      toast.success("Loan updated successfully.");
      await mutate();
      navigate(`/liabilities/loans/${id}`);
    } catch (error) {
        const axiosError = error as AxiosError<Record<string, string[] | string>>;
        const status = axiosError.response?.status;

        if (status === 400 && axiosError.response?.data) {
          // Return field-level validation errors to LoanForm
          return axiosError.response.data as Record<string, string[]>;
        }

        // For other errors — use global handler
        const message = extractErrorMessage(axiosError);
        toast.error(message);
      }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Spinner className="w-8 h-8" />
      </div>
    );

  if (!loan) return <p className="text-red-600 text-center py-10">Loan not found.</p>;

  const initialValues: LoanFormValues = {
    source: loan.source,
    loan_date: loan.loan_date,
    currency: loan.currency,
    amount_taken: loan.amount_taken,
    reason: loan.reason ?? "",
    interest_type: loan.interest_type,
    compound_frequency: loan.compound_frequency ?? 0,
    repayment_date: loan.repayment_date,
    interest_rate: loan.interest_rate,
    amount_paid: loan.amount_paid ?? 0,
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Loan</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <LoanForm ref={formRef} onSubmit={handleUpdate} initialValues={initialValues} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditLoan;
