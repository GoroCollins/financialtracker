import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { axiosInstance } from "../authentication/AuthenticationService";
import { ExchangeRateSchema, ExchangeRateFormData } from "../utils/zodSchemas";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function CreateExchangeRate() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<ExchangeRateFormData>({
    resolver: zodResolver(ExchangeRateSchema),
    // defaultValues: {
    //   is_current: true,
    // },
  });

  const onSubmit = async (data: ExchangeRateFormData) => {
    try {
      await axiosInstance.post("/api/currencies/exchangerates/", {
        ...data,
        currency: code,
      });
      toast.success("Exchange rate saved!");
      form.reset();
      navigate(`/currencies/${code}`);
    } catch (error: any) {
      if (error.response?.data) {
        const messages = Object.values(error.response.data).flat().join(" ");
        setErrorMessage(messages);
        toast.error(messages || "Failed to save exchange rate");
      } else {
        setErrorMessage("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">
        Create Exchange Rate for {code}
      </h2>

      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Rate Field */}
          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter rate"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Is Current Switch */}
          <FormField
            control={form.control}
            name="is_current"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Is Current?</FormLabel>
                  <FormMessage />
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => navigate(`/currencies/${code}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
