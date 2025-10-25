import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { expensesTypeMap, ExpenseTypeKey } from "../../constants/expensesTypes";
import {
  ExpensesFormValues,
  ExpensesResponse,
  Currency,
} from "../../utils/zodSchemas";
import ExpensesForm from "../../expenses/ExpensesForm";
import ExpensesList from "../../expenses/ExpensesList";
import { toast } from "sonner";
import { useMemo, useState, useRef, useEffect } from "react";

// ✅ shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, X } from "lucide-react";

const ExpensesPage = () => {
  const { type } = useParams<{ type: ExpenseTypeKey }>();
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<{ reset: () => void }>(null);

  if (!type || !(type in expensesTypeMap)) {
    return (
      <div className="p-4 text-destructive text-sm">
        Invalid expense type.
      </div>
    );
  }

  const { endpoint, label, route } = expensesTypeMap[type];

  const { data: expenses, mutate, isLoading } = useSWR<ExpensesResponse[]>(
    endpoint,
    fetcher
  );

  const { data: rawCurrencies, isLoading: currenciesLoading } = useSWR<
    Currency[]
  >("/api/currencies/currencies", fetcher);

  const currencies = useMemo(() => {
    if (!Array.isArray(rawCurrencies)) return [];
    return [...rawCurrencies].sort((a, b) => {
      if (a.is_local === b.is_local) return a.code.localeCompare(b.code);
      return a.is_local ? -1 : 1;
    });
  }, [rawCurrencies]);

  const handleCreate = async (payload: ExpensesFormValues) => {
    try {
      await axiosInstance.post(endpoint, payload);
      toast.success("Expense created.");
      await mutate();
      setShowForm(false);
      formRef.current?.reset();
    } catch (error: any) {
      if (error.response?.status === 400 && error.response.data) {
        return error.response.data;
      }
      toast.error("Failed to create expense.");
    }
  };

  useEffect(() => {
    setShowForm(false);
  }, [type]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-semibold">{label}</CardTitle>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Expense
            </Button>
          ) : (
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="gap-2"
            >
              <X className="w-4 h-4" /> Cancel
            </Button>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="space-y-6">
          {showForm && (
            <div className="p-4 border rounded-md bg-muted/30">
              {currenciesLoading ? (
                <div className="flex flex-col space-y-2">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <ExpensesForm
                  key={type}
                  onSubmit={handleCreate}
                  currencies={currencies}
                  ref={formRef}
                />
              )}
            </div>
          )}

          <Separator />

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : (
            <ExpensesList expenses={expenses || []} basePath={route} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpensesPage;
