import { useRef, useState } from "react";
import useSWR from "swr";
import { axiosInstance } from "../../../authentication/AuthenticationService";
import { fetcher } from "../../../utils/swrFetcher";
import { toast } from "sonner";
import InterestTypeForm, { InterestTypeFormHandle } from "../../../liabilities/interesttypes/InterestTypeForm";
import InterestTypeList from "../../../liabilities/interesttypes/InterestTypeList";
import { InterestTypeResponse, InterestTypeFormValues } from "../../../utils/zodSchemas";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const InterestTypePage = () => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<InterestTypeFormHandle>(null);

  const { data: interestTypes, mutate, isLoading } = useSWR<InterestTypeResponse[]>(
    "/api/liabilities/interesttypes/",
    fetcher
  );

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
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <CardTitle>Interest Types</CardTitle>
          {!showForm && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowForm(true)}
              className="mt-2 sm:mt-0"
            >
              + Create Interest Type
            </Button>
          )}
        </CardHeader>
        {showForm && (
          <CardContent className="pt-0">
            <InterestTypeForm onSubmit={handleCreate} ref={formRef} />
          </CardContent>
        )}
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner className="w-8 h-8" />
        </div>
      ) : (
        <InterestTypeList interestTypes={interestTypes || []} basePath="/liabilities/interesttypes" />
      )}
    </div>
  );
};

export default InterestTypePage;
