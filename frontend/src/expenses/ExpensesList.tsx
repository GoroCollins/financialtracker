import { Link } from "react-router-dom";
import { ExpensesResponse } from "../utils/zodSchemas";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  expenses: ExpensesResponse[];
  basePath: string;
}

const ExpensesList: React.FC<Props> = ({ expenses, basePath }) => {
  if (!expenses.length) {
    return (
      <div className="text-center text-muted-foreground mt-10">
        No expenses recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {expenses.map((expense) => (
        <Card key={expense.id} className="transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {expense.expense_name}
              </CardTitle>
              <Badge variant="outline" className="text-sm">
                {expense.currency}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Amount:{" "}
              <span className="font-medium">
                {expense.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          </CardContent>

          <CardFooter>
            <Button asChild variant="link" className="px-0 text-blue-600 hover:text-blue-800">
              <Link to={`${basePath}/details/${expense.id}`}>
                View Details
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ExpensesList;
