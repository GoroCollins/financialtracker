import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { LoanItem } from "../../../utils/zodSchemas";

const LoanDetails = () => {
  const { id } = useParams();
  const { data: loan, error } = useSWR<LoanItem>(`/api/liabilities/loans/${id}/`, fetcher);

  if (error) return <p>Error loading loan.</p>;
  if (!loan) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-bold">Loan Details</h2>
      <p><strong>Source:</strong> {loan.source}</p>
      <p><strong>Amount Taken:</strong> {loan.amount_taken_lcy_display}</p>
      <p><strong>Interest Rate:</strong> {loan.interest_rate}%</p>
      <p><strong>Due Balance:</strong> {loan.due_balance_lcy_display}</p>
    </div>
  );
};

export default LoanDetails;
