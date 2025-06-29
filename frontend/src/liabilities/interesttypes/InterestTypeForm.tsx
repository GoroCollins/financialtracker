import  { useEffect, forwardRef, useImperativeHandle, } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { interestTypeSchema, InterestTypeFormValues, } from "../../utils/zodSchemas";

export interface InterestTypeFormHandle {
  reset: () => void;
}

interface Props {
  onSubmit: (data: InterestTypeFormValues) => void;
  initialValues?: InterestTypeFormValues;
  isEditing?: boolean;
}

const InterestTypeForm = forwardRef<InterestTypeFormHandle, Props>(
  ({ onSubmit, initialValues, isEditing = false }, ref) => {
    const { register, handleSubmit, reset, formState: { errors },
    } = useForm<InterestTypeFormValues>({ resolver: zodResolver(interestTypeSchema), defaultValues: initialValues, });

    useEffect(() => {
      if (initialValues) {
        reset(initialValues);
      }
    }, [initialValues, reset]);

    // Expose the reset method to parent
    useImperativeHandle(ref, () => ({ reset }), [reset]);

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mb-6">
        <input {...register("code")} placeholder="Interest Type Code" className="form-control" disabled={isEditing} />
        {errors.code && <p className="text-red-500">{errors.code.message}</p>}

        <input {...register("description")} placeholder="Description" className="form-control" />
        {errors.description && ( <p className="text-red-500">{errors.description.message}</p> )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isEditing ? "Update" : "Create"}
        </button>
      </form>
    );
  }
);

export default InterestTypeForm;
