import { ExpensesResponse } from "../utils/zodSchemas";
import { Link } from "react-router-dom";

interface Props {
  expenses: ExpensesResponse[];
  basePath: string;
}

const ExpensesList: React.FC<Props> = ({ expenses, basePath }) => {
  return (
    <div className="space-y-4 mt-6">
      {expenses.map((expense) => (
        <div key={expense.id} className="border p-4 rounded shadow-sm">
          <div className="text-lg font-semibold">{expense.expense_name}</div>
          <div className="text-gray-600 text-sm">{expense.currency} {expense.amount}</div>

          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              to={`${basePath}/details/${expense.id}`}
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

export default ExpensesList;

