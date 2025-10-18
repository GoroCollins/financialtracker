import { useRef, useState } from "react";
import useSWR from "swr";
import { axiosInstance } from "../../../authentication/AuthenticationService";
import { fetcher } from "../../../utils/swrFetcher";
import { toast } from "sonner";
import InterestTypeForm, { InterestTypeFormHandle } from "../../../liabilities/interesttypes/InterestTypeForm";
import InterestTypeList from "../../../liabilities/interesttypes/InterestTypeList";
import { InterestTypeResponse, InterestTypeFormValues } from "../../../utils/zodSchemas";

const InterestTypePage = () => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<InterestTypeFormHandle>(null);

  const {
    data: interestTypes,
    mutate,
    isLoading,
  } = useSWR<InterestTypeResponse[]>("/api/liabilities/interesttypes/", fetcher);

  const handleCreate = async (payload: InterestTypeFormValues) => {
    try {
      await axiosInstance.post("/api/liabilities/interesttypes/", payload);
      toast.success("Interest type created.");
      await mutate();
      setShowForm(false);
      formRef.current?.reset();
    } catch {
      toast.error("Failed to create interest type.");
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Interest Types</h1>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Create Interest Type
        </button>
      )}

      {showForm && (
        <InterestTypeForm onSubmit={handleCreate} ref={formRef} />
      )}

      {isLoading ? (
        <p>Loading interest types...</p>
      ) : (
        <InterestTypeList interestTypes={interestTypes || []} basePath="/liabilities/interesttypes"/>

      )}
    </div>
  );
};

export default InterestTypePage;
