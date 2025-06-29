import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { axiosInstance } from "../../../authentication/AuthenticationService";
import LoanForm from "../../../liabilities/loans/LoanForm";
import { LoanFormValues, LoanItem } from "../../../utils/zodSchemas";
import { toast } from "react-hot-toast";

const EditLoan = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: loan, error, isLoading, mutate } = useSWR<LoanItem>(
    id ? `/api/liabilities/loans/${id}/` : null,
    fetcher
  );

  useEffect(() => {
    if (error) toast.error("Failed to load loan.");
  }, [error]);

  const handleUpdate = async (payload: LoanFormValues) => {
    try {
      await axiosInstance.put(`/api/liabilities/loans/${id}/`, payload);
      toast.success("Loan updated successfully.");
      await mutate();
      navigate(`/liabilities/loans/${id}`);
    } catch {
      toast.error("Failed to update loan.");
    }
  };

  if (isLoading || !loan) return <p>Loading loan...</p>;

  const initialValues: LoanFormValues = {
    source: loan.source,
    loan_date: loan.loan_date,
    currency: loan.currency,
    amount_taken: loan.amount_taken,
    reason: loan.reason ?? "",
    interest_type: loan.interest_type,
    compound_frequency: loan.compound_frequency ?? "",
    repayment_date: loan.repayment_date,
    interest_rate: loan.interest_rate,
    amount_paid: loan.amount_paid ?? 0,
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Edit Loan</h1>
      <LoanForm onSubmit={handleUpdate} initialValues={initialValues} />
    </div>
  );
};

export default EditLoan;
