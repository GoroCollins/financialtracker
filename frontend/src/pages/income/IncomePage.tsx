import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { incomeTypeMap, IncomeTypeKey } from "../../constants/incomeTypes";
import { IncomeFormValues, IncomeResponse, Currency } from "../../utils/zodSchemas";
import IncomeForm from "../../income/IncomeForm";
import IncomeList from "../../income/IncomeList";
import { toast } from "sonner";
import { useMemo, useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const IncomePage = () => {
  const { type } = useParams<{ type: IncomeTypeKey }>();
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<{ reset: () => void }>(null);

  if (!type || !(type in incomeTypeMap)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">
              Invalid income type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please verify the URL or choose a valid income type.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { endpoint, label, route } = incomeTypeMap[type];

  const {
    data: incomes,
    mutate,
    isLoading,
  } = useSWR<IncomeResponse[]>(endpoint, fetcher);

  const {
    data: rawCurrencies,
    isLoading: currenciesLoading,
  } = useSWR<Currency[]>("/api/currencies/currencies", fetcher);

  const currencies = useMemo(() => {
    if (!Array.isArray(rawCurrencies)) return [];
    return [...rawCurrencies].sort((a, b) => {
      if (a.is_local === b.is_local) return a.code.localeCompare(b.code);
      return a.is_local ? -1 : 1;
    });
  }, [rawCurrencies]);

  const handleCreate = async (payload: IncomeFormValues) => {
    try {
      await axiosInstance.post(endpoint, payload);
      toast.success("Income created.");
      await mutate();
      setShowForm(false);
      formRef.current?.reset();
    } catch (error: any) {
      if (error.response?.status === 400 && error.response.data) {
        return error.response.data; // return validation errors to the form
      }
      toast.error("Failed to create income.");
    }
  };

  useEffect(() => {
    setShowForm(false); // close the form on type change
  }, [type]);

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-semibold">{label}</CardTitle>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>+ Create Income</Button>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="space-y-6 pt-4">
          {showForm && (
            <div className="border rounded-md p-4 bg-muted/30">
              {currenciesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              ) : (
                <IncomeForm
                  onSubmit={handleCreate}
                  currencies={currencies}
                  ref={formRef}
                />
              )}
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          ) : (
            <IncomeList incomes={incomes || []} basePath={route} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomePage;
