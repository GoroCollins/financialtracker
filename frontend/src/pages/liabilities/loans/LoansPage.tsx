import { useState, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { LoanItem, LoanFormValues } from "../../../utils/zodSchemas";
import { axiosInstance } from "../../../authentication/AuthenticationService";
import LoanForm, { LoanFormHandle } from "../../../liabilities/loans/LoanForm";
import LoanList from "../../../liabilities/loans/LoanList";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LoanPage = () => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<LoanFormHandle>(null);

  const { data: loans, error, mutate } = useSWR<LoanItem[]>("/api/liabilities/loans/", fetcher);

  const handleCreate = async (values: LoanFormValues) => {
    try {
      await axiosInstance.post("/api/liabilities/loans/", values);
      toast.success("Loan created.");
      await mutate();
      formRef.current?.reset();
      setShowForm(false);
    } catch (error: any) {
      if (error.response?.status === 400 && error.response.data) {
        return error.response.data; // Return field-level errors to the form
      }
      toast.error("Failed to create loan.");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Loans</h1>

      {!showForm && (
        <Button variant="default" className="mb-4" onClick={() => setShowForm(true)}>
          + New Loan
        </Button>
      )}

      {showForm && (
        <Card className="p-4 mb-4">
          <CardContent>
            <LoanForm onSubmit={handleCreate} ref={formRef} />
          </CardContent>
        </Card>
      )}

      {error ? (
        <p className="text-red-600">Failed to load loans.</p>
      ) : loans ? (
        <LoanList loans={loans} basePath="/liabilities/loans" />
      ) : (
        <p>Loading loans...</p>
      )}
    </div>
  );
};

export default LoanPage;
