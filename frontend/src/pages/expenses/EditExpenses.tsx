import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { expensesTypeMap, ExpenseTypeKey } from "../../constants/expensesTypes";
import { ExpensesFormValues, ExpensesResponse, Currency } from "../../utils/zodSchemas";
import { axiosInstance } from "../../authentication/AuthenticationService";
import ExpensesForm from "../../expenses/ExpensesForm";
import { toast } from "sonner";
import { useMemo } from "react";

const EditExpenses = () => {
  const { type, id } = useParams<{ type: ExpenseTypeKey; id: string }>();
  const navigate = useNavigate();

  if (!type || !(type in expensesTypeMap) || !id) {
    return <div className="p-4 text-red-600">Invalid request.</div>;
  }

  const { endpoint, label, route } = expensesTypeMap[type];

  const { data: expense, mutate, isLoading } = useSWR<ExpensesResponse>(`${endpoint}${id}/`, fetcher);
  const { data: rawCurrencies, isLoading: currenciesLoading } = useSWR<Currency[]>("/api/currencies/currencies", fetcher);

  const currencies = useMemo(() => {
    if (!rawCurrencies) return [];
    return [...rawCurrencies].sort((a, b) => {
      if (a.is_local === b.is_local) return a.code.localeCompare(b.code);
      return a.is_local ? -1 : 1;
    });
  }, [rawCurrencies]);

  const handleUpdate = async (payload: ExpensesFormValues): Promise<Record<string, string[]> | undefined>  => {
    try {
      await axiosInstance.put(`${endpoint}${id}/`, payload);
      toast.success("Income updated.");
      await mutate();
      navigate(route);
    } catch (error: any) {
    if (error.response?.status === 400 && error.response.data) {
      return error.response.data; // Return validation errors
    }
    toast.error("Failed to update expense.");
  }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Edit {label}</h1>
      {isLoading || currenciesLoading ? (
        <p>Loading...</p>
      ) : (
        expense && (
          <ExpensesForm
            initialValues={expense}
            onSubmit={handleUpdate}
            isEditing
            currencies={currencies}
          />
        )
      )}
    </div>
  );
};

export default EditExpenses;
