import { useNavigate, useParams, Link } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { expensesTypeMap, ExpenseTypeKey } from "../../constants/expensesTypes";
import { ExpensesResponse } from "../../utils/zodSchemas";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { useState } from "react";
import ConfirmModal from "../../ConfirmModal";
import { toast } from "react-hot-toast";

const ExpensesDetails = () => {
  const { type, id } = useParams<{ type: ExpenseTypeKey; id: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  if (!type || !id || !(type in expensesTypeMap)) {
    return <div className="p-4 text-red-600">Invalid expense type or ID.</div>;
  }

  const { endpoint, route, label } = expensesTypeMap[type];
  const { data: expense, isLoading } = useSWR<ExpensesResponse>(`${endpoint}${id}/`, fetcher);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`${endpoint}${id}/`);
      toast.success("Expense deleted.");
      navigate(route);
    } catch (error) {
      toast.error("Failed to delete expense.");
    }
  };

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (!expense) return <p className="p-4 text-red-600">Expense not found.</p>;

  return (
    <div className="p-4 max-w-xl mx-auto border rounded shadow-sm bg-white">
      <h2 className="text-2xl font-bold mb-1">{label.endsWith("s") ? label.slice(0, -1) : label} Details</h2>
      <p className="text-gray-600 mb-4 text-lg"><strong>Name:</strong> {expense.expense_name}</p>

      <p><strong>Currency:</strong> {expense.currency}</p>
      <p><strong>Amount:</strong> {expense.amount}</p>
      <p><strong>Amount (Local):</strong> {expense.amount_lcy_display}</p>
      <p><strong>Notes:</strong> {expense.notes || "—"}</p>
      <p><strong>Created by:</strong> {expense.created_by} on {expense.created_at}</p>
      {expense.modified_by && (
        <p><strong>Modified by:</strong> {expense.modified_by} on {expense.modified_at}</p>
      )}

      <div className="mt-6 flex gap-4">
        <Link
          to={`${route}/edit/${expense.id}`}
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
        message={`Are you sure you want to delete "${expense.expense_name}"?`}
        onCancel={() => setShowModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ExpensesDetails;
