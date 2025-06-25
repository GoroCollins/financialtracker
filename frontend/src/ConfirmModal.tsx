import React from "react";

interface ConfirmModalProps {
  title: string;
  message: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
