import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { expensesTypeMap, ExpenseTypeKey, ExpenseTypeConfig } from "../../constants/expensesTypes";
import {
  ExpensesFormValues,
  ExpensesResponse,
  Currency,
} from "../../utils/zodSchemas";
import { axiosInstance } from "../../services/apiClient";
import ExpensesForm from "../../expenses/ExpensesForm";
import { toast } from "sonner";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { extractErrorMessage } from "../../utils/errorHandler";
import { AxiosError } from "axios";


const EditExpenses = () => {
  const { type, id } = useParams<{ type: ExpenseTypeKey; id: string }>();
  const navigate = useNavigate();
  const isInvalid = !type || !(type in expensesTypeMap) || !id;
  const config: ExpenseTypeConfig | null = !isInvalid ? expensesTypeMap[type] : null;

  const { data: expense, mutate, isLoading } = useSWR<ExpensesResponse>(
    !isInvalid && config ? `${config.endpoint}${id}/` : null,
    fetcher
  );

  const { data: rawCurrencies, isLoading: currenciesLoading } = useSWR<Currency[]>(
    !isInvalid ? "/api/currencies/currencies" : null,
    fetcher
  );

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
    if (!config || !id) return;

    try {
      await axiosInstance.put(`${config.endpoint}${id}/`, payload);
      toast.success("Expense updated successfully.");
      await mutate();
      navigate(config.route);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<Record<string, string[]>>;
      if (axiosError.response?.status === 400 && axiosError.response.data) {
        return axiosError.response.data; // Validation errors for form
      }
      toast.error(extractErrorMessage(error));
    }
  };

  if (isInvalid || !config) {
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

  const isBusy = isLoading || currenciesLoading;

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit {config.label}</CardTitle>
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
