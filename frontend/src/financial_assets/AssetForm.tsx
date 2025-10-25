import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { AssetTypeKey } from "../constants/assetsTypes";
import { AssetFormValues, getAssetSchema, Currency } from "../utils/zodSchemas";

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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Props {
  assetType: AssetTypeKey;
  initialValues?: AssetFormValues;
  onSubmit: (data: AssetFormValues) => Promise<Record<string, string[]> | undefined>;
  isEditing?: boolean;
  currencies: Currency[];
}

const AssetForm: React.FC<Props> = ({
  assetType,
  initialValues,
  onSubmit,
  isEditing = false,
  currencies,
}) => {
  const schema = useMemo(() => getAssetSchema(assetType), [assetType]);

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues || {},
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (initialValues) {
      const base = {
        ...initialValues,
        amount: Number(initialValues.amount),
      };
      if (assetType === "equity" && "ratio" in initialValues) {
        (base as any).ratio = Number((initialValues as any).ratio);
      }
      reset(base);
    }
  }, [initialValues, reset, assetType]);

  const handleFormSubmit = async (data: AssetFormValues) => {
    const backendErrors = await onSubmit(data);
    if (backendErrors) {
      Object.entries(backendErrors).forEach(([field, messages]) => {
        setError(field as keyof AssetFormValues, {
          type: "server",
          message: messages.join(" "),
        });
      });
    }
  };

  const localCurrencies = currencies.filter((c) => c.is_local);
  const foreignCurrencies = currencies.filter((c) => !c.is_local);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6 max-w-md mb-8"
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
                  {localCurrencies.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Local</SelectLabel>
                      {localCurrencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.description}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {foreignCurrencies.length > 0 && (
                    <>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Foreign</SelectLabel>
                        {foreignCurrencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.description}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="Asset Name" {...field} />
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
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional Fields */}
        {assetType === "liquid" && (
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <Input placeholder="Source" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {assetType === "equity" && (
          <FormField
            control={form.control}
            name="ratio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ratio</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ratio"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {assetType === "retirement" && (
          <FormField
            control={form.control}
            name="employer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employer</FormLabel>
                <FormControl>
                  <Input placeholder="Employer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Notes (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" className="w-full">
          {isEditing ? "Update" : "Create"}
        </Button>
      </form>
    </Form>
  );
};

export default AssetForm;
