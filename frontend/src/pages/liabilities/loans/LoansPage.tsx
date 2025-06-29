import { useState, useRef } from "react";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { LoanItem, LoanFormValues } from "../../../utils/zodSchemas";
import { axiosInstance } from "../../../authentication/AuthenticationService";
import LoanForm, { LoanFormHandle } from "../../../liabilities/loans/LoanForm";
import LoanList from "../../../liabilities/loans/LoanList";
import { toast } from "react-hot-toast";

const LoanPage = () => {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<LoanFormHandle>(null);

  const { data: loans, mutate } = useSWR<LoanItem[]>("/api/liabilities/loans/", fetcher);

  const handleCreate = async (values: LoanFormValues) => {
    try {
      await axiosInstance.post("/api/liabilities/loans/", values);
      toast.success("Loan created.");
      await mutate();
      formRef.current?.reset();
      setShowForm(false);
    } catch {
      toast.error("Error creating loan.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Loans</h1>

      {!showForm && (
        <button className="btn btn-primary mb-4" onClick={() => setShowForm(true)}>
          + New Loan
        </button>
      )}

      {showForm && (
        <LoanForm onSubmit={handleCreate} ref={formRef} />
      )}

      {loans ? (
        <LoanList loans={loans} basePath="/liabilities/loans" />
      ) : (
        <p>Loading loans...</p>
      )}
    </div>
  );
};

export default LoanPage;
