import { useParams, useNavigate, Link } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { incomeTypeMap, IncomeTypeKey } from "../../constants/incomeTypes";
import { IncomeFormValues, IncomeResponse, Currency } from "../../utils/zodSchemas";
import { axiosInstance } from "../../services/apiClient";
import IncomeForm from "../../income/IncomeForm";
import { toast } from "sonner";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "../../utils/errorHandler";
import { AxiosError } from "axios";

const EditIncome = () => {
  const { type, id } = useParams<{ type: IncomeTypeKey; id: string }>();
  const navigate = useNavigate();

    const isInvalid = !type || !(type in incomeTypeMap) || !id;

  // Provide fallbacks for invalid case to keep hooks order consistent
  const { endpoint, label, route } = isInvalid
    ? { endpoint: "", label: "", route: "" }
    : incomeTypeMap[type as IncomeTypeKey];

  const { data: income, mutate, isLoading } = useSWR<IncomeResponse>(
    isInvalid ? null : `${endpoint}${id}/`,
    fetcher
  );

  const { data: rawCurrencies, isLoading: currenciesLoading } = useSWR<Currency[]>(
    "/api/currencies/currencies",
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
    payload: IncomeFormValues
  ): Promise<Record<string, string[]> | undefined> => {
    try {
      await axiosInstance.put(`${endpoint}${id}/`, payload);
      toast.success("Income updated.");
      await mutate();
      navigate(route);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<Record<string, string[]>>;
      if (axiosError.response?.status === 400 && axiosError.response.data) {
        return axiosError.response.data;
      }
      toast.error(extractErrorMessage(error));
    }
  };

  if (isInvalid) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md p-6 text-center border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Request</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The income type or ID provided is invalid.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Edit {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || currenciesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          ) : (
            income && (
              <IncomeForm
                initialValues={income}
                onSubmit={handleUpdate}
                isEditing
                currencies={currencies}
              />
            )
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pt-4">
          <Link to={route}>
            <Button variant="outline">Back</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditIncome;
