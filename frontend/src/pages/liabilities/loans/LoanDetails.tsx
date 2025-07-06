import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { LoanItem } from "../../../utils/zodSchemas";
import { useState } from "react";
import ConfirmModal from "../../../ConfirmModal";
import { axiosInstance } from "../../../authentication/AuthenticationService";
import toast from "react-hot-toast";

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: loan, error: loanError, isLoading: loanLoading } = useSWR<LoanItem>(`/api/liabilities/loans/${id}/`, fetcher);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await axiosInstance.delete(`/api/liabilities/loans/${id}/`);
      toast.success("Loan deleted.");
      navigate("/liabilities/loans");
    } catch (err) {
      toast.error("Failed to delete loan.");
    }
  };

  if (loanError) return <p className="text-danger">Error loading loan.</p>;
  if  (loanLoading) return <p>Loading loan details...</p>;
  if (!loan) return <p>Loan not found.</p>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Loan Details</h2>
      <div className="space-y-1">
        <p><strong>Source:</strong> {loan.source}</p>
        <p><strong>Amount Taken:</strong>{loan.currency} {loan.amount_taken}</p>
        <p><strong>Amount Taken(LCY):</strong> {loan.amount_taken_lcy_display}</p>
        <p><strong>Interest Rate:</strong> {loan.interest_rate}%</p>
        <p><strong>Interest:</strong>{loan.interest_lcy_display}</p>
        <p><strong>Amount to Repay:</strong>{loan.amount_repay_lcy_display}</p>
        <p><strong>Loan Date:</strong> {loan.loan_date}</p>
        <p><strong>Reason:</strong>{loan.reason}</p>
        <p><strong>Interest Type:</strong>{loan.interest_type}</p>
        {loan.interest_type === "COMPOUND" && ( <p> <strong>Compound Frequency:</strong> {loan.compound_frequency} </p> )}
        <p><strong>Repayment Date:</strong>{loan.repayment_date}</p>
        <p><strong>Amount Paid:</strong>{loan.amount_paid_lcy_display}</p>
        <p><strong>Due Balance:</strong> {loan.due_balance_lcy_display}</p>
        <p><strong>In Default:</strong><input type="checkbox" checked={loan.in_default} readOnly className="ml-2 accent-primary" aria-label="In Default" /> </p>
      </div>

      <div className="pt-4 space-x-2">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/liabilities/loans")}
        >
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/liabilities/loans/edit/${id}`)}
        >
          Edit
        </button>
        <button
          className="btn btn-danger"
          onClick={() => setIsModalOpen(true)}
        >
          Delete
        </button>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Delete Loan"
        message="Are you sure you want to delete this loan? This action cannot be undone."
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default LoanDetails;
