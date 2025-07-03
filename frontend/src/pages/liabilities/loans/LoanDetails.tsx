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
  const { data: loan, error } = useSWR<LoanItem>(`/api/liabilities/loans/${id}/`, fetcher);

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

  if (error) return <p className="text-danger">Error loading loan.</p>;
  if (!loan) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Loan Details</h2>
      <div className="space-y-1">
        <p><strong>Source:</strong> {loan.source}</p>
        <p><strong>Amount Taken:</strong> {loan.amount_taken_lcy_display}</p>
        <p><strong>Interest Rate:</strong> {loan.interest_rate}%</p>
        <p><strong>Due Balance:</strong> {loan.due_balance_lcy_display}</p>
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
