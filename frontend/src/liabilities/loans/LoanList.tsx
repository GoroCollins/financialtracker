import { LoanItem } from "../../utils/zodSchemas";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  loans: LoanItem[];
  basePath: string;
}

const LoanList: React.FC<Props> = ({ loans, basePath }) => {
  if (!loans.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
        <p>No loans found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {loans.map((loan) => (
        <Card key={loan.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{loan.source}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Amount: </span>
              {loan.amount_taken_lcy_display}
            </p>
            <p>
              <span className="font-medium text-foreground">Interest: </span>
              {loan.interest_lcy_display}
            </p>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button asChild variant="link" className="text-primary px-0">
              <Link to={`${basePath}/${loan.id}`}>View</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default LoanList;
