import { useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "../utils/swrFetcher";

export function useCurrencyFormatter(defaultCurrency = "USD") {
  const { data, error } = useSWR("/api/currencies/?is_local=true", fetcher);

  const currencyCode = useMemo(() => {
    if (data && data.length > 0) return data[0].code;
    return defaultCurrency;
  }, [data, defaultCurrency]);

  // Return a memoized formatter function
  const formatCurrency = useMemo(() => {
    return (amount: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 2,
      }).format(amount);
  }, [currencyCode]);

  return { formatCurrency, currencyCode, loading: !data && !error, error };
}
