import { useParams, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { axiosInstance } from "../../../services/apiClient";
import { toast } from "sonner";
import { useState } from "react";
import ConfirmModal from "../../../ConfirmModal";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface InterestType {
  code: string;
  description: string;
  created_by: string;
  created_at: string;
  modified_by?: string;
  modified_at?: string;
}

const InterestTypeDetails = () => {
  const { code } = useParams<{ code: string }>();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = useSWR<InterestType>(
    code ? `/api/liabilities/interesttypes/${code}/` : null,
    fetcher
  );

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/liabilities/interesttypes/${code}/`);
      toast.success("Interest type deleted.");
      navigate("/liabilities/interesttypes");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Spinner className="w-8 h-8" />
      </div>
    );

  if (!data)
    return <p className="text-red-600 text-center py-10">Interest type not found.</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Interest Type Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <span className="font-medium">Code:</span> {data.code}
          </p>
          <p>
            <span className="font-medium">Description:</span> {data.description}
          </p>
          <p>
            <span className="font-medium">Created By:</span> {data.created_by} on {data.created_at}
          </p>
          {data.modified_by && (
            <p>
              <span className="font-medium">Modified By:</span> {data.modified_by} on {data.modified_at}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 justify-end">
          <Button
            variant="default"
            onClick={() => navigate(`/liabilities/interesttypes/edit/${data.code}`)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowModal(true)}
          >
            Delete
          </Button>
          <Button variant="secondary" onClick={() => navigate("/liabilities/interesttypes")}>
            Back
          </Button>
        </CardFooter>
      </Card>

      <ConfirmModal
        isOpen={showModal}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${data.description}"?`}
        onCancel={() => setShowModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default InterestTypeDetails;
