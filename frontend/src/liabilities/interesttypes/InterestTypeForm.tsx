import { useEffect, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { interestTypeSchema, InterestTypeFormValues } from "../../utils/zodSchemas";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    const form = useForm<InterestTypeFormValues>({
      resolver: zodResolver(interestTypeSchema),
      defaultValues: initialValues,
    });

    const { reset, handleSubmit, control } = form;

    useEffect(() => {
      if (initialValues) reset(initialValues);
    }, [initialValues, reset]);

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    return (
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 max-w-md mb-6"
        >
          <FormField
            control={control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Type Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Interest Type Code"
                    disabled={isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">
            {isEditing ? "Update" : "Create"}
          </Button>
        </form>
      </Form>
    );
  }
);

export default InterestTypeForm;
