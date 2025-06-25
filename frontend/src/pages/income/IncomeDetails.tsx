import { useNavigate, useParams, Link } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { IncomeTypeKey, incomeTypeMap } from "../../constants/incomeTypes";
import { IncomeResponse } from "../../utils/zodSchemas";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { useState } from "react";
import ConfirmModal from "../../ConfirmModal";
import { toast } from "react-hot-toast";

const IncomeDetails = () => {
  const { type, id } = useParams<{ type: IncomeTypeKey; id: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  if (!type || !id || !(type in incomeTypeMap)) {
    return <div className="p-4 text-red-600">Invalid income type or ID.</div>;
  }

  const { endpoint, route } = incomeTypeMap[type];
  const { data: income, isLoading } = useSWR<IncomeResponse>(`${endpoint}${id}/`, fetcher);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`${endpoint}${id}/`);
      toast.success("Income deleted.");
      navigate(route);
    } catch (error) {
      toast.error("Failed to delete income.");
    }
  };

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (!income) return <p className="p-4 text-red-600">Income not found.</p>;

  return (
    <div className="p-4 max-w-xl mx-auto border rounded shadow-sm bg-white">
      <h2 className="text-2xl font-bold mb-4">{income.income_name}</h2>

      <p><strong>Currency:</strong> {income.currency}</p>
      <p><strong>Amount:</strong> {income.amount}</p>
      <p><strong>Amount (Local):</strong> {income.amount_lcy_display}</p>
      <p><strong>Notes:</strong> {income.notes || "—"}</p>
      <p><strong>Created by:</strong> {income.created_by} on {income.created_at}</p>
      {income.modified_by && (
        <p><strong>Modified by:</strong> {income.modified_by} on {income.modified_at}</p>
      )}

      <div className="mt-6 flex gap-4">
        <Link
          to={`${route}/edit/${income.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update
        </Link>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete
        </button>
        <Link
          to={route}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Back
        </Link>
      </div>

      <ConfirmModal
        isOpen={showModal}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${income.income_name}"?`}
        onCancel={() => setShowModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default IncomeDetails;
