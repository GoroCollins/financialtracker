import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { axiosInstance } from "../../authentication/AuthenticationService";
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

const AssetPage = () => {
  const { type } = useParams<{ type: AssetTypeKey }>();
  const [showForm, setShowForm] = useState(false);

  if (!type || !(type in assetEndpointsMap)) {
    return (
      <div className="p-6 text-destructive text-sm font-medium bg-destructive/10 rounded-md">
        Invalid asset type.
      </div>
    );
  }

  const { endpoint, label, route } = assetEndpointsMap[type];

  const {
    data: assets,
    mutate,
    isLoading,
  } = useSWR(`${endpoint}`, fetcher);

  const {
    data: rawCurrencies,
    isLoading: currenciesLoading,
  } = useSWR<Currency[]>("/api/currencies/currencies", fetcher);

  const currencies = useMemo(() => {
    if (!rawCurrencies) return [];
    return [...rawCurrencies].sort((a, b) => {
      if (a.is_local === b.is_local) return a.code.localeCompare(b.code);
      return a.is_local ? -1 : 1;
    });
  }, [rawCurrencies]);

  const handleCreate = async (payload: AssetFormValues) => {
    try {
      await axiosInstance.post(endpoint, payload);
      toast.success("Asset created.");
      setShowForm(false);
      await mutate();
    } catch (error: any) {
      if (error.response?.status === 400 && error.response.data) {
        return error.response.data; // Field-level errors for form
      }
      toast.error("Failed to create asset.");
    }
  };

  useEffect(() => {
    setShowForm(false); // Reset when switching asset type
  }, [type]);

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
