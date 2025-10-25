import { useEffect, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExpensesFormValues, expensesSchema, Currency } from "../utils/zodSchemas";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ExpensesFormProps {
  initialValues?: ExpensesFormValues;
  onSubmit: (data: ExpensesFormValues) => Promise<Record<string, string[]> | undefined>;
  isEditing?: boolean;
  currencies: Currency[];
}

export interface ExpensesFormHandle {
  reset: () => void;
}

const ExpensesForm = forwardRef<ExpensesFormHandle, ExpensesFormProps>(
  ({ initialValues, onSubmit, isEditing = false, currencies }, ref) => {
    const form = useForm<ExpensesFormValues>({
      resolver: zodResolver(expensesSchema),
      defaultValues: initialValues
        ? { ...initialValues, amount: Number(initialValues.amount) }
        : undefined,
    });

    const { reset, setError, handleSubmit } = form;

    useEffect(() => {
      if (initialValues) {
        reset({ ...initialValues, amount: Number(initialValues.amount) });
      }
    }, [initialValues, reset]);

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    const handleFormSubmit = async (data: ExpensesFormValues) => {
      const backendErrors = await onSubmit(data);
      if (backendErrors) {
        Object.entries(backendErrors).forEach(([field, messages]) => {
          setError(field as keyof ExpensesFormValues, {
            type: "server",
            message: messages.join(" "),
          });
        });
      }
    };

    return (
      <Form {...form}>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-6 max-w-md mb-6"
        >
          {/* Currency Field */}
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.some((c) => c.is_local) && (
                      <SelectGroup>
                        <SelectLabel>Local</SelectLabel>
                        {currencies
                          .filter((c) => c.is_local)
                          .map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.description}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    )}
                    {currencies.some((c) => !c.is_local) && (
                      <SelectGroup>
                        <SelectLabel>Foreign</SelectLabel>
                        {currencies
                          .filter((c) => !c.is_local)
                          .map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.description}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expense Name Field */}
          <FormField
            control={form.control}
            name="expense_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Name</FormLabel>
                <FormControl>
                  <Input placeholder="Expense Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount Field */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes Field */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            {isEditing ? "Update" : "Create"}
          </Button>
        </form>
      </Form>
    );
  }
);

ExpensesForm.displayName = "ExpensesForm";

export default ExpensesForm;
