import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { AssetFormValues } from "../../utils/zodSchemas";
import { Currency } from "../../utils/zodSchemas";
import AssetForm from "../../financial_assets/AssetForm";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { assetEndpointsMap, AssetTypeKey } from "../../constants/assetsTypes";
import { useMemo } from "react";

const EditAsset = () => {
  const { type, id } = useParams<{ type: AssetTypeKey; id: string }>();
  const navigate = useNavigate();

  if (!type || !(type in assetEndpointsMap) || !id) {
    return <div className="p-4 text-red-600">Invalid asset type or ID.</div>;
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

  const handleUpdate = async (payload: AssetFormValues) => {
    try {
      await axiosInstance.put(`${endpoint}${id}/`, payload);
      toast.success("Asset updated.");
      navigate(route);
    } catch {
      toast.error("Failed to update asset.");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit {singularLabel}</h1>

      {isLoading || currenciesLoading ? (
        <p>Loading...</p>
      ) : asset ? (
        <AssetForm
          assetType={type}
          initialValues={asset}
          onSubmit={handleUpdate}
          isEditing
          currencies={currencies}
        />
      ) : (
        <p className="text-red-600">Asset not found.</p>
      )}
    </div>
  );
};

export default EditAsset;
