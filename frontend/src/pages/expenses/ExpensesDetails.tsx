import { useNavigate, useParams, Link } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { expensesTypeMap, ExpenseTypeKey } from "../../constants/expensesTypes";
import { ExpensesResponse } from "../../utils/zodSchemas";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

const ExpensesDetails = () => {
  const { type, id } = useParams<{ type: ExpenseTypeKey; id: string }>();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Validate route params early
  if (!type || !id || !(type in expensesTypeMap)) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Alert variant="destructive">
          <AlertTitle>Invalid Request</AlertTitle>
          <AlertDescription>
            Invalid expense type or ID. Please check your link and try again.
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { endpoint, route, label } = expensesTypeMap[type];
  const { data: expense, isLoading } = useSWR<ExpensesResponse>(
    `${endpoint}${id}/`,
    fetcher
  );

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`${endpoint}${id}/`);
      toast.success("Expense deleted successfully.");
      navigate(route);
    } catch (error) {
      toast.error("Failed to delete expense.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Alert variant="destructive">
          <AlertTitle>Expense Not Found</AlertTitle>
          <AlertDescription>
            The requested expense record could not be found.
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => navigate(route)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
          </Button>
        </div>
      </div>
    );
  }

  const singularLabel = label.endsWith("s") ? label.slice(0, -1) : label;

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {singularLabel} Details
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Name:</span>{" "}
            {expense.expense_name}
          </p>
          <p>
            <span className="font-medium text-foreground">Currency:</span>{" "}
            {expense.currency}
          </p>
          <p>
            <span className="font-medium text-foreground">Amount:</span>{" "}
            {expense.amount}
          </p>
          <p>
            <span className="font-medium text-foreground">Amount (Local):</span>{" "}
            {expense.amount_lcy_display}
          </p>
          <p>
            <span className="font-medium text-foreground">Notes:</span>{" "}
            {expense.notes || "—"}
          </p>
          <p>
            <span className="font-medium text-foreground">Created by:</span>{" "}
            {expense.created_by} on {expense.created_at}
          </p>
          {expense.modified_by && (
            <p>
              <span className="font-medium text-foreground">Modified by:</span>{" "}
              {expense.modified_by} on {expense.modified_at}
            </p>
          )}

          <Separator className="my-4" />

          <div className="flex gap-3 flex-wrap">
            <Link to={`${route}/edit/${expense.id}`}>
              <Button>
                <Pencil className="h-4 w-4 mr-2" /> Update
              </Button>
            </Link>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete “{expense.expense_name}”? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" onClick={() => navigate(route)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesDetails;
