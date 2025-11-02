import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { axiosInstance } from "../services/apiClient";
import { CurrencySchema, CurrencyFormData } from "../utils/zodSchemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AxiosError } from "axios";
import { extractErrorMessage } from "../utils/errorHandler";

export default function CreateCurrency() {
  const navigate = useNavigate();

  const form = useForm<CurrencyFormData>({
    resolver: zodResolver(CurrencySchema),
    defaultValues: {
      code: "",
      description: "",
      is_local: false,
    },
  });

  const onSubmit = async (data: CurrencyFormData) => {
    try {
      await axiosInstance.post("/api/currencies/currencies/", data);
      toast.success("Currency created successfully");
      navigate("/currencies");
    } catch (error: unknown) {
      const message = extractErrorMessage(error as AxiosError);
      toast.error(message)
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Create Currency</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Code Field */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. USD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. US Dollar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Is Local Checkbox */}
          <FormField
            control={form.control}
            name="is_local"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-medium leading-none">
                  Is Local Currency
                </FormLabel>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </Form>
    </div>
  );
}
