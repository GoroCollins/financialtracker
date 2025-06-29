import { IncomeResponse } from "../utils/zodSchemas";
import { Link } from "react-router-dom";

interface Props {
  incomes: IncomeResponse[];
  basePath: string;
}

const IncomeList: React.FC<Props> = ({ incomes, basePath }) => {
  return (
    <div className="space-y-4 mt-6">
      {incomes.map((income) => (
        <div key={income.id} className="border p-4 rounded shadow-sm">
          <div className="text-lg font-semibold">{income.income_name}</div>
          <div className="text-gray-600 text-sm">{income.currency} {income.amount}</div>

          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              to={`${basePath}/details/${income.id}`}
              className="text-blue-600 underline hover:text-blue-800"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
      </div>

  );
};

export default IncomeList;

