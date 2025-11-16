import useSWR from "swr";
import { fetcher } from "../utils/swrFetcher";

// Default SWR options for all financial data
const swrOptions = {
  revalidateOnFocus: false,      // don't refetch on window focus
  revalidateIfStale: true,       // refetch if data is stale
  refreshInterval: 60000,        // auto-refresh every 60 seconds
  shouldRetryOnError: true,      // retry if fetch fails
};

export const useFinancialData = () => {
  const { data: localCurrency, error: localCurrencyError, isLoading: localCurrencyLoading } = useSWR(
    "/api/currencies/get-localcurrency",
    fetcher,
    swrOptions
  );

  const { data: incomeTotals, error: incomeTotalsError, isLoading: incomeTotalsLoading } = useSWR(
    "/api/income/totalincome",
    fetcher,
    swrOptions
  );

  const { data: assetsTotals, error: assetsTotalsError, isLoading: assetsTotalsLoading } = useSWR(
    "/api/assets/totalassets",
    fetcher,
    swrOptions
  );

  const { data: expensesTotals, error: expensesTotalsError, isLoading: expensesTotalsLoading } = useSWR(
    "/api/expenses/totalexpenses",
    fetcher,
    swrOptions
  );

  const { data: liabilitiesTotals, error: liabilitiesTotalsError, isLoading: liabilitiesTotalsLoading } = useSWR(
    "/api/liabilities/totalliabilities",
    fetcher,
    swrOptions
  );
  

  const isLoading =
    localCurrencyLoading ||
    incomeTotalsLoading ||
    assetsTotalsLoading ||
    expensesTotalsLoading ||
    liabilitiesTotalsLoading;

  const hasError =
    localCurrencyError ||
    incomeTotalsError ||
    assetsTotalsError ||
    expensesTotalsError ||
    liabilitiesTotalsError;

  return {
    localCurrency,
    incomeTotals,
    assetsTotals,
    expensesTotals,
    liabilitiesTotals,
    isLoading,
    hasError,
    errors: {
      localCurrencyError,
      incomeTotalsError,
      assetsTotalsError,
      expensesTotalsError,
      liabilitiesTotalsError,
    },
  };
};
