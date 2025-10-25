import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { useMemo } from "react";
import { toast } from "sonner";
import { fetcher } from "../../utils/swrFetcher";
import { AssetFormValues, Currency } from "../../utils/zodSchemas";
import AssetForm from "../../financial_assets/AssetForm";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { assetEndpointsMap, AssetTypeKey } from "../../constants/assetsTypes";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

const EditAsset = () => {
  const { type, id } = useParams<{ type: AssetTypeKey; id: string }>();
  const navigate = useNavigate();

  if (!type || !(type in assetEndpointsMap) || !id) {
    return (
      <div className="p-6 text-center text-destructive">
        Invalid asset type or ID.
      </div>
    );
  }

  const { endpoint, singularLabel, route } = assetEndpointsMap[type];

  const { data: asset, isLoading } = useSWR<AssetFormValues>(
    `${endpoint}${id}/`,
    fetcher
  );

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

  const handleUpdate = async (
    payload: AssetFormValues
  ): Promise<Record<string, string[]> | undefined> => {
    try {
      await axiosInstance.put(`${endpoint}${id}/`, payload);
      toast.success(`${singularLabel} updated.`);
      navigate(route);
    } catch (error: any) {
      if (error.response?.status === 400 && error.response.data) {
        return error.response.data; // Return validation errors
      }
      toast.error(`Failed to update ${singularLabel}.`);
    }
  };

  if (isLoading || currenciesLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading {singularLabel}...
        </span>
      </div>
    );
  }

  if (!asset) {
    return <p className="text-center text-destructive py-6">Asset not found.</p>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit {singularLabel}</CardTitle>
          <CardDescription>Update details and save changes</CardDescription>
        </CardHeader>

        <CardContent>
          <AssetForm
            assetType={type}
            initialValues={asset}
            onSubmit={handleUpdate}
            isEditing
            currencies={currencies}
          />

          <div className="flex justify-end mt-4">
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => navigate(route)}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAsset;
