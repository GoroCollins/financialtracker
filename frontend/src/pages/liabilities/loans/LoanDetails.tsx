import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { LoanItem } from "../../../utils/zodSchemas";
import { useState } from "react";
import ConfirmModal from "../../../ConfirmModal";
import { axiosInstance } from "../../../authentication/AuthenticationService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: loan, error: loanError, isLoading: loanLoading } = useSWR<LoanItem>(
    id ? `/api/liabilities/loans/${id}/` : null,
    fetcher
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await axiosInstance.delete(`/api/liabilities/loans/${id}/`);
      toast.success("Loan deleted.");
      navigate("/liabilities/loans");
    } catch {
      toast.error("Failed to delete loan.");
    }
  };

  if (loanError) return <p className="text-red-600">Error loading loan.</p>;
  if (loanLoading) return <p>Loading loan details...</p>;
  if (!loan) return <p>Loan not found.</p>;

  return (
    <Card className="p-4 max-w-2xl mx-auto space-y-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Loan Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <p><strong>Source:</strong> {loan.source}</p>
        <p><strong>Amount Taken:</strong> {loan.currency} {loan.amount_taken}</p>
        <p><strong>Amount Taken (LCY):</strong> {loan.amount_taken_lcy_display}</p>
        <p><strong>Interest Rate:</strong> {loan.interest_rate}%</p>
        <p><strong>Interest:</strong> {loan.interest_lcy_display}</p>
        <p><strong>Amount to Repay:</strong> {loan.amount_repay_lcy_display}</p>
        <p><strong>Loan Date:</strong> {loan.loan_date}</p>
        <p><strong>Reason:</strong> {loan.reason}</p>
        <p><strong>Interest Type:</strong> {loan.interest_type}</p>
        {loan.interest_type === "COMPOUND" && (
          <p><strong>Compound Frequency:</strong> {loan.compound_frequency}</p>
        )}
        <p><strong>Repayment Date:</strong> {loan.repayment_date}</p>
        <p><strong>Amount Paid:</strong> {loan.amount_paid_lcy_display}</p>
        <p><strong>Due Balance:</strong> {loan.due_balance_lcy_display}</p>
        <p>
          <strong>In Default:</strong>
          <input
            type="checkbox"
            checked={loan.in_default}
            readOnly
            className="ml-2 accent-primary"
            aria-label="In Default"
          />
        </p>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="secondary" onClick={() => navigate("/liabilities/loans")}>
          Back
        </Button>
        <Button variant="default" onClick={() => navigate(`/liabilities/loans/edit/${id}`)}>
          Edit
        </Button>
        <Button variant="destructive" onClick={() => setIsModalOpen(true)}>
          Delete
        </Button>
      </CardFooter>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Delete Loan"
        message="Are you sure you want to delete this loan? This action cannot be undone."
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
      />
    </Card>
  );
};

export default LoanDetails;
