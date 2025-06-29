import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { assetEndpointsMap, AssetTypeKey } from "../../constants/assetsTypes";
import { AssetFormValues } from "../../utils/zodSchemas";
import { Currency } from "../../utils/zodSchemas";
import { useMemo, useState } from "react";
import AssetForm from "../../financial_assets/AssetForm";
import AssetList, { AssetListItem} from "../../financial_assets/AssetList";
import { toast } from "react-hot-toast";

const AssetPage = () => {
  const { type } = useParams<{ type: AssetTypeKey }>();
  const [showForm, setShowForm] = useState(false);

  if (!type || !(type in assetEndpointsMap)) {
    return <div className="p-4 text-red-600">Invalid asset type.</div>;
  }

  const { endpoint, label, route } = assetEndpointsMap[type];

  const {
    data: assets,
    mutate,
    isLoading
  } = useSWR(`${endpoint}`, fetcher);

  const {
    data: rawCurrencies,
    isLoading: currenciesLoading
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
    } catch (_) {}
  };

  // const handleDelete = async (id: number) => {
  //   try {
  //     await axiosInstance.delete(`${endpoint}${id}/`);
  //     toast.success("Asset deleted.");
  //     await mutate();
  //   } catch (_) {}
  // };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">{label}</h1>

      <div className="mb-4">
        {!showForm ? (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setShowForm(true)}
          >
            + Create New Asset
          </button>
        ) : (
          <AssetForm assetType={type} onSubmit={handleCreate} currencies={currencies} />
        )}
      </div>

      {currenciesLoading || isLoading ? (
        <p>Loading...</p>
      ) : (
        <AssetList assets={(assets || []).map((asset: Omit<AssetListItem, "asset_type">) => ({ ...asset, asset_type: type }))} basePath={route} />
      )}
    </div>
  );
};

export default AssetPage;
