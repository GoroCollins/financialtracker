import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { toast } from "sonner";
import { axiosInstance } from "../../../authentication/AuthenticationService";
import { InterestTypeFormValues, InterestTypeResponse } from "../../../utils/zodSchemas";
import InterestTypeForm from "../../../liabilities/interesttypes/InterestTypeForm";

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
      <h1 className="text-2xl font-bold mb-4">Edit Interest Type</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : interestType ? (
        <InterestTypeForm onSubmit={handleUpdate} initialValues={interestType} isEditing />
      ) : (
        <p className="text-red-600">Interest type not found.</p>
      )}
    </div>
  );
};

export default EditInterestType;
