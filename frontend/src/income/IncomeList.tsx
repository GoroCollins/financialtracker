// components/income/IncomeList.tsx
import { IncomeResponse } from "../utils/zodSchemas";
import { Link } from "react-router-dom";

interface Props {
  incomes: IncomeResponse[];
  onDelete: (id: number) => void;
  basePath: string;
}

const IncomeList: React.FC<Props> = ({ incomes, onDelete, basePath }) => (
  <div className="space-y-4 mt-6">
    {incomes.map((income) => (
      <div key={income.id} className="border p-4 rounded shadow-sm">
        <div className="text-lg font-bold">{income.income_name}</div>
        <div>{income.currency} {income.amount} — {income.amount_lcy_display}</div>
        <div className="text-sm text-gray-500">
          Created by {income.created_by} on {income.created_at}
        </div>
        <div>
          {income.modified_by && (
            <span>
              Modified by {income.modified_by} on {income.modified_at}
            </span>
          )}
        </div>
        <div className="flex gap-4 mt-2">
          <Link to={`${basePath}/edit/${income.id}`} className="text-blue-600">Edit</Link>
          <button onClick={() => onDelete(income.id)} className="text-red-600">Delete</button>
        </div>
      </div>
    ))}
  </div>
);

export default IncomeList;
