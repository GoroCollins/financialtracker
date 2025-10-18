import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { incomeTypeMap, IncomeTypeKey } from "../../constants/incomeTypes";
import { IncomeFormValues, IncomeResponse } from "../../utils/zodSchemas";
import IncomeForm from "../../income/IncomeForm";
import IncomeList from "../../income/IncomeList";
import { toast } from "sonner";
import { Currency } from "../../utils/zodSchemas";
import { useMemo, useState, useRef, useEffect } from "react";

const IncomePage = () => {
  const { type } = useParams<{ type: IncomeTypeKey }>();
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<{ reset: () => void }>(null);

  if (!type || !(type in incomeTypeMap)) {
    return <div className="p-4 text-red-600">Invalid income type.</div>;
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
        return error.response.data; // Return field-level errors to the form
      }
      // If it's not a 400 validation error, fallback to global toast
      toast.error("Failed to create income.");
    }
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
            <IncomeForm
              onSubmit={handleCreate}
              currencies={currencies}
              ref={formRef}
            />
          )}
        </>
      )}

      {isLoading ? (
        <p>Loading income...</p>
      ) : (
        <IncomeList incomes={incomes || []} basePath={route} />
      )}
    </div>
  );
};

export default IncomePage;
