import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { expensesTypeMap, ExpenseTypeKey } from "../../constants/expensesTypes";
import {
  ExpensesFormValues,
  ExpensesResponse,
  Currency,
} from "../../utils/zodSchemas";
import { axiosInstance } from "../../authentication/AuthenticationService";
import ExpensesForm from "../../expenses/ExpensesForm";
import { toast } from "sonner";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EditExpenses = () => {
  const { type, id } = useParams<{ type: ExpenseTypeKey; id: string }>();
  const navigate = useNavigate();

  if (!type || !(type in expensesTypeMap) || !id) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Alert variant="destructive">
          <AlertTitle>Invalid Request</AlertTitle>
          <AlertDescription>
            The expense type or ID is invalid. Please go back and try again.
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

  const { endpoint, label, route } = expensesTypeMap[type];

  const {
    data: expense,
    mutate,
    isLoading,
  } = useSWR<ExpensesResponse>(`${endpoint}${id}/`, fetcher);

  const {
    data: rawCurrencies,
    isLoading: currenciesLoading,
  } = useSWR<Currency[]>("/api/currencies/currencies", fetcher);

  const currencies = useMemo(() => {
    if (!rawCurrencies) return [];
    return [...rawCurrencies].sort((a, b) => {
      if (a.is_local === b.is_local) return a.code.localeCompare(b.code);
      return a.is_local ? -1 : 1;
    });
  }, [rawCurrencies]);

  const handleUpdate = async (
    payload: ExpensesFormValues
  ): Promise<Record<string, string[]> | undefined> => {
    try {
      await axiosInstance.put(`${endpoint}${id}/`, payload);
      toast.success("Expense updated successfully.");
      await mutate();
      navigate(route);
    } catch (error: any) {
      if (error.response?.status === 400 && error.response.data) {
        return error.response.data; // Pass validation errors back to form
      }
      toast.error("Failed to update expense.");
    }
  };

  const isBusy = isLoading || currenciesLoading;

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit {label}</CardTitle>
        </CardHeader>
        <Separator />

        <CardContent className="pt-6">
          {isBusy ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          ) : expense ? (
            <ExpensesForm
              initialValues={expense}
              onSubmit={handleUpdate}
              isEditing
              currencies={currencies}
            />
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Expense Not Found</AlertTitle>
              <AlertDescription>
                The requested expense record could not be loaded.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditExpenses;
