import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { axiosInstance } from "../../services/apiClient";
import { assetEndpointsMap, AssetTypeKey } from "../../constants/assetsTypes";
import { AssetFormValues, Currency } from "../../utils/zodSchemas";
import { useMemo, useState, useEffect } from "react";
import AssetForm from "../../financial_assets/AssetForm";
import AssetList, { AssetListItem } from "../../financial_assets/AssetList";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { extractErrorMessage } from "../../utils/errorHandler";
import { AxiosError } from "axios";

const AssetPage = () => {
  const { type } = useParams<{ type: AssetTypeKey }>();
  const [showForm, setShowForm] = useState(false);
  const endpoint = type && assetEndpointsMap[type]?.endpoint;
  const label = type && assetEndpointsMap[type]?.label;
  const route = type && assetEndpointsMap[type]?.route || "";

  const {data: assets, mutate, isLoading,} = useSWR(endpoint ? `${endpoint}` : null, fetcher);

  const {data: rawCurrencies, isLoading: currenciesLoading,} = useSWR<Currency[]>("/api/currencies/currencies", fetcher);

  const currencies = useMemo(() => {
    if (!rawCurrencies) return [];
    return [...rawCurrencies].sort((a, b) => {
      if (a.is_local === b.is_local) return a.code.localeCompare(b.code);
      return a.is_local ? -1 : 1;
    });
  }, [rawCurrencies]);

useEffect(() => {
  setTimeout(() => setShowForm(false), 0);
}, [type]);

  const handleCreate = async (payload: AssetFormValues) => {
    try {
      if (!endpoint) return;
      await axiosInstance.post(endpoint, payload);
      toast.success("Asset created.");
      setShowForm(false);
      await mutate();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<Record<string, string[]>>;
      if (axiosError.response?.status === 400 && axiosError.response.data) {
        return axiosError.response.data; // Validation errors for form
      }
      toast.error(extractErrorMessage(error));
    }
  };

  if (!type || !(type in assetEndpointsMap)) {
    return (
      <div className="p-6 text-destructive text-sm font-medium bg-destructive/10 rounded-md">
        Invalid asset type.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ Create New Asset</Button>
        )}
      </div>

      <Separator />

      {showForm && (
        <Card className="max-w-xl">
          <CardContent className="pt-6">
            <AssetForm
              key={type}
              assetType={type}
              onSubmit={handleCreate}
              currencies={currencies}
            />
          </CardContent>
        </Card>
      )}

      {(currenciesLoading || isLoading) ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <AssetList
          assets={(assets || []).map(
            (asset: Omit<AssetListItem, "asset_type">) => ({
              ...asset,
              asset_type: type,
            })
          )}
          basePath={route}
        />
      )}
    </div>
  );
};

export default AssetPage;
