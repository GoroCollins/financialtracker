import { IncomeResponse } from "../utils/zodSchemas";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  incomes: IncomeResponse[];
  basePath: string;
}

const IncomeList: React.FC<Props> = ({ incomes, basePath }) => {
  if (!incomes.length) {
    return (
      <Card className="mt-6 text-center py-10">
        <CardContent>
          <p className="text-muted-foreground">No income records found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 mt-6">
      {incomes.map((income) => (
        <Card
          key={income.id}
          className="hover:shadow-md transition-shadow duration-200"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {income.income_name}
              </CardTitle>
              <Badge variant={income.amount_lcy_display ? "default" : "secondary"}>
                {income.currency}
              </Badge>
            </div>
            <CardDescription className="text-base font-medium mt-1">
              {income.currency} {income.amount.toLocaleString()}
            </CardDescription>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Created by {income.created_by} on{" "}
                {new Date(income.created_at).toLocaleDateString()}
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to={`${basePath}/details/${income.id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default IncomeList;
