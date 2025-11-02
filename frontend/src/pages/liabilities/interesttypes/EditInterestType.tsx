import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { toast } from "sonner";
import { axiosInstance } from "../../../services/apiClient";
import { InterestTypeFormValues, InterestTypeResponse } from "../../../utils/zodSchemas";
import InterestTypeForm from "../../../liabilities/interesttypes/InterestTypeForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const EditInterestType = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const { data: interestType, isLoading } = useSWR<InterestTypeResponse>(
    code ? `/api/liabilities/interesttypes/${code}/` : null,
    fetcher
  );

  const handleUpdate = async (payload: InterestTypeFormValues) => {
    try {
      await axiosInstance.put(`/api/liabilities/interesttypes/${code}/`, payload);
      toast.success("Interest type updated.");
      navigate("/liabilities/interesttypes");
    } catch {
      toast.error("Failed to update interest type.");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Interest Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="w-8 h-8" />
            </div>
          ) : interestType ? (
            <InterestTypeForm
              onSubmit={handleUpdate}
              initialValues={interestType}
              isEditing
            />
          ) : (
            <p className="text-red-600 text-center">Interest type not found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditInterestType;
