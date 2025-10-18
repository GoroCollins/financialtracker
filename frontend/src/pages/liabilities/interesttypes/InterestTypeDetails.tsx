import { useParams, useNavigate, Link } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../../utils/swrFetcher";
import { axiosInstance } from "../../../authentication/AuthenticationService";
import { toast } from "sonner";
import { useState } from "react";
import ConfirmModal from "../../../ConfirmModal";

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

  const { data, isLoading } = useSWR<InterestType>(`/api/liabilities/interesttypes/${code}/`, fetcher);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/liabilities/interesttypes/${code}/`);
      toast.success("Interest type deleted.");
      navigate("/liabilities/interesttypes");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p className="text-red-600">Interest type not found.</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-2">
      <h1 className="text-2xl font-bold mb-2">Interest Type Details</h1>
      <p><strong>Code:</strong> {data.code}</p>
      <p><strong>Description:</strong> {data.description}</p>
      <p><strong>Created By:</strong> {data.created_by} on {data.created_at}</p>
      {data.modified_by && <p><strong>Modified By:</strong> {data.modified_by} on {data.modified_at}</p>}

      <div className="mt-4 flex gap-4">
        <Link to={`/liabilities/interesttypes/edit/${data.code}`} className="bg-blue-600 text-white px-4 py-2 rounded">
          Edit
        </Link>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete
        </button>
        <button onClick={() => navigate("/liabilities/interesttypes")} className="bg-gray-500 text-white px-4 py-2 rounded">
          Back
        </button>
      </div>
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
