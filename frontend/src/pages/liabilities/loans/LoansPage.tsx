import { useState, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { LoanItem, LoanFormValues } from "../../../utils/zodSchemas";
import { axiosInstance } from "../../../services/apiClient";
import LoanForm, { LoanFormHandle } from "../../../liabilities/loans/LoanForm";
import LoanList from "../../../liabilities/loans/LoanList";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AxiosError } from "axios";
import { extractErrorMessage } from "../../../utils/errorHandler";

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
    } catch (error) {
        const axiosError = error as AxiosError<Record<string, string[] | string>>;
        const status = axiosError.response?.status;

        if (status === 400 && axiosError.response?.data) {
          // Return field-level validation errors to LoanForm
          return axiosError.response.data as Record<string, string[]>;
        }

        // For other errors — use global handler
        const message = extractErrorMessage(axiosError);
        toast.error(message);
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
