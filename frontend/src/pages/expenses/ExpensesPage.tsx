import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { expensesTypeMap, ExpenseTypeKey } from "../../constants/expensesTypes";
import { ExpensesFormValues, ExpensesResponse } from "../../utils/zodSchemas";
import ExpensesForm from "../../expenses/ExpensesForm";
import ExpensesList from "../../expenses/ExpensesList";
import { toast } from "react-hot-toast";
import { Currency } from "../../utils/zodSchemas";
import { useMemo, useState, useRef, useEffect } from "react";

const ExpensesPage = () => {
  const { type } = useParams<{ type: ExpenseTypeKey }>();
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<{ reset: () => void }>(null);

  if (!type || !(type in expensesTypeMap)) {
    return <div className="p-4 text-red-600">Invalid expense type.</div>;
  }

  const { endpoint, label, route } = expensesTypeMap[type];

  const {
    data: expenses,
    mutate,
    isLoading,
  } = useSWR<ExpensesResponse[]>(endpoint, fetcher);

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

  const handleCreate = async (payload: ExpensesFormValues) => {
    try {
      await axiosInstance.post(endpoint, payload);
      toast.success("Expense created.");
      await mutate();
      setShowForm(false);
      formRef.current?.reset();
    } catch (_) {}
  };
 useEffect(() => {
    setShowForm(false);  // Close the form
    }, [type]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">{label}</h1>

      {!showForm && (
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowForm(true)}
        >
          + Create Income
        </button>
      )}

      {showForm && (
        <>
          {currenciesLoading ? (
            <p>Loading currencies...</p>
          ) : (
            <ExpensesForm key={type}
              onSubmit={handleCreate}
              currencies={currencies}
              ref={formRef}
            />
          )}
        </>
      )}

      {isLoading ? (
        <p>Loading expenses...</p>
      ) : (
        <ExpensesList expenses={expenses || []} basePath={route} />
      )}
    </div>
  );
};

export default ExpensesPage;
