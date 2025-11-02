import { useParams, useNavigate, Link } from "react-router-dom";
import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { fetcher } from "../../utils/swrFetcher";
import { axiosInstance } from "../../services/apiClient";
import { assetEndpointsMap, AssetTypeKey } from "../../constants/assetsTypes";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Trash2, Pencil, ArrowLeft } from "lucide-react";
import { extractErrorMessage } from "../../utils/errorHandler";
import { AxiosError } from "axios";

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

    // ✅ Define safe defaults before hooks
  const validType = type && type in assetEndpointsMap ? type : undefined;
  const endpoint = validType ? assetEndpointsMap[validType].endpoint : undefined;
  const route = validType ? assetEndpointsMap[validType].route : "/";
  const singularLabel = validType
    ? assetEndpointsMap[validType].singularLabel
    : "Asset";

  const assetDetailUrl =
    validType && id ? `${endpoint}${id}/` : null; 
  const { data: asset, isLoading } = useSWR<AssetDetail>(
    assetDetailUrl,
    fetcher
  );

  const handleDelete = async () => {
    if (!assetDetailUrl) return;
    try {
      await axiosInstance.delete(assetDetailUrl);
      toast.success(`${singularLabel} deleted.`);
      navigate(route);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<Record<string, string[]>>;
      if (axiosError.response?.status === 400 && axiosError.response.data) {
        return axiosError.response.data;
      }
      toast.error(extractErrorMessage(error));
      // toast.error(`Failed to delete ${singularLabel}.`);
    }
  };

    if (!validType || !id) {
    return (
      <div className="p-6 text-center text-destructive">
        Invalid asset type or ID.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading asset details...
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
          <CardTitle>{singularLabel} Details</CardTitle>
          <CardDescription>
            Created by {asset.created_by} on {asset.created_at}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <p><strong>Name:</strong> {asset.name}</p>
          <p><strong>Currency:</strong> {asset.currency}</p>
          <p><strong>Amount:</strong> {asset.amount}</p>
          <p><strong>Amount (LCY):</strong> {asset.amount_lcy_display}</p>
          {asset.source && <p><strong>Source:</strong> {asset.source}</p>}
          {asset.ratio !== undefined && (
            <p><strong>Ratio:</strong> {(asset.ratio * 100).toFixed(2)}%</p>
          )}
          {asset.employer && <p><strong>Employer:</strong> {asset.employer}</p>}
          {asset.notes && <p><strong>Notes:</strong> {asset.notes}</p>}
          {asset.modified_by && (
            <p>
              <strong>Modified By:</strong> {asset.modified_by} on{" "}
              {asset.modified_at}
            </p>
          )}

          <div className="flex gap-3 mt-4">
            <Link to={`/assets/${type}/edit/${id}`}>
              <Button variant="default" className="flex items-center gap-2">
                <Pencil className="h-4 w-4" /> Update
              </Button>
            </Link>

            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={() => setShowConfirm(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>

            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => navigate(`/assets/${type}`)}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Deletion Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{asset.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetDetails;
