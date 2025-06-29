import { LoanItem } from "../../utils/zodSchemas";
import { Link } from "react-router-dom";

interface Props {
  loans: LoanItem[];
  basePath: string;
}

const LoanList: React.FC<Props> = ({ loans, basePath }) => {
  if (!loans.length) return <p>No loans found.</p>;

  return (
    <ul className="space-y-3">
      {loans.map(loan => (
        <li key={loan.id} className="border p-3 rounded shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">{loan.source}</p>
              <p>Amount: {loan.amount_taken_lcy_display}</p>
              <p>Interest: {loan.interest_lcy_display}</p>
            </div>
            <Link to={`${basePath}/${loan.id}`} className="text-blue-600 underline">
              View
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default LoanList;
