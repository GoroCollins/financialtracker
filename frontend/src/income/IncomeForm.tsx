import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IncomeFormValues,
  incomeSchema,
  Currency,
} from "../utils/zodSchemas";
import { useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IncomeFormProps {
  initialValues?: IncomeFormValues;
  onSubmit: (data: IncomeFormValues) => Promise<Record<string, string[]> | undefined>;
  isEditing?: boolean;
  currencies: Currency[];
}

export interface IncomeFormHandle {
  reset: () => void;
}

const IncomeForm = forwardRef<IncomeFormHandle, IncomeFormProps>(
  ({ initialValues, onSubmit, isEditing = false, currencies }, ref) => {
    const form = useForm<IncomeFormValues>({
      resolver: zodResolver(incomeSchema),
      defaultValues: initialValues
        ? { ...initialValues, amount: Number(initialValues.amount) }
        : undefined,
    });

    const { reset, setError } = form;

    useEffect(() => {
      if (initialValues) {
        reset({
          ...initialValues,
          amount: Number(initialValues.amount),
        });
      }
    }, [initialValues, reset]);

    useImperativeHandle(ref, () => ({ reset }), [reset]);

    const handleFormSubmit = async (data: IncomeFormValues) => {
      const backendErrors = await onSubmit(data);
      if (backendErrors && typeof backendErrors === "object") {
        Object.entries(backendErrors).forEach(([field, messages]) => {
          setError(field as keyof IncomeFormValues, {
            type: "server",
            message: Array.isArray(messages) ? messages[0] : String(messages),
          });
        });
      }
    };

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-6 max-w-md mb-6"
        >
          {/* Currency */}
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies
                      .filter((c) => c.is_local)
                      .map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.description}
                        </SelectItem>
                      ))}
                    {currencies.some((c) => !c.is_local) && (
                      <div className="border-t my-1" />
                    )}
                    {currencies
                      .filter((c) => !c.is_local)
                      .map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.description}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Income Name */}
          <FormField
            control={form.control}
            name="income_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Income Name</FormLabel>
                <FormControl>
                  <Input placeholder="Income Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Amount */}
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

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {isEditing ? "Update" : "Create"}
          </Button>
        </form>
      </Form>
    );
  }
);

IncomeForm.displayName = "IncomeForm";
export default IncomeForm;
