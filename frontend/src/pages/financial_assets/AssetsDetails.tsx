import { useParams, useNavigate, Link } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../../authentication/AuthenticationService";
import ConfirmModal from "../../ConfirmModal";
import { assetEndpointsMap, AssetTypeKey } from "../../constants/assetsTypes";
import { useState } from "react";

interface AssetDetail {
  id: number;
  name: string;
  currency: string;
  amount: number;
  amount_lcy_display: string;
  notes?: string;
  source?: string;
  ratio?: number;
  employer?: string;
  created_by: string;
  created_at: string;
  modified_by?: string;
  modified_at?: string;
}

const AssetDetails = () => {
  const { type, id } = useParams<{ type: AssetTypeKey; id: string }>();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);


    if (!type || !(type in assetEndpointsMap) || !id) {
    return <div className="p-4 text-red-600">Invalid asset type or ID.</div>;
    }

    const { endpoint, route, label } = assetEndpointsMap[type];
    const assetDetailUrl = `${endpoint}${id}/`;

  const { data: asset, isLoading } = useSWR<AssetDetail>(assetDetailUrl, fetcher);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(assetDetailUrl);
      toast.success("Asset deleted.");
      navigate(route);
    } catch {
      toast.error("Failed to delete asset.");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {isLoading ? (
        <p>Loading asset details...</p>
      ) : asset ? (
        <>
          <h2 className="text-2xl font-bold mb-1">{label} Details</h2>
          <p className="text-2xl font-bold mb-4">{asset.name}</p>

          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Name:</strong> {asset.name.toUpperCase()}</p>
            <p><strong>Currency:</strong> {asset.currency}</p>
            <p><strong>Amount:</strong> {asset.amount}</p>
            <p><strong>Amount (LCY):</strong> {asset.amount_lcy_display}</p>
            {asset.source && <p><strong>Source:</strong> {asset.source}</p>}
            {asset.ratio !== undefined && <p><strong>Ratio:</strong> {asset.ratio}</p>}
            {asset.employer && <p><strong>Employer:</strong> {asset.employer}</p>}
            {asset.notes && <p><strong>Notes:</strong> {asset.notes}</p>}
            <p><strong>Created By:</strong> {asset.created_by} on {asset.created_at}</p>
            {asset.modified_by && <p><strong>Modified By:</strong> {asset.modified_by} on {asset.modified_at}</p>}
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              to={`/assets/${type}/edit/${id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update
            </Link>
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => navigate(`/assets/${type}`)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Back
            </button>
          </div>

          <ConfirmModal
            isOpen={showConfirm}
            title="Confirm Deletion"
            message={`Are you sure you want to delete "${asset.name}"?`}
            onCancel={() => setShowConfirm(false)}
            onConfirm={handleDelete}
          />
        </>
      ) : (
        <p className="text-red-600">Asset not found.</p>
      )}
    </div>
  );
};

export default AssetDetails;
