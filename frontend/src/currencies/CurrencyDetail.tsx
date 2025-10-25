import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import useSWR from "swr";
import {
  CurrencySchema,
  CurrencyFormData,
  ExchangeRate,
} from "../utils/zodSchemas";
import { axiosInstance } from "../authentication/AuthenticationService";
import { fetcher } from "../utils/swrFetcher";
import ConfirmModal from "../ConfirmModal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function CurrencyDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CurrencyFormData>({
    resolver: zodResolver(CurrencySchema),
  });

  const {
    data: currency,
    error: currencyError,
    mutate: refreshCurrency,
  } = useSWR(`/api/currencies/currencies/${code}/`, fetcher, {
    onSuccess: (data) => reset(data),
  });

  const {
    data: exchangeRates,
    error: exchangeRateError,
    mutate: refreshRates,
  } = useSWR(
    currency?.is_local === false
      ? `/api/currencies/exchangerates/?currency=${currency.code}`
      : null,
    fetcher
  );

  const onSubmit = async (data: CurrencyFormData) => {
    try {
      await axiosInstance.put(`/api/currencies/currencies/${code}/`, data);
      toast.success("Currency updated successfully");
      await refreshCurrency();
    } catch {
      toast.error("Failed to update currency");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/currencies/currencies/${code}/`, {
        suppressGlobalError: true,
      });
      toast.success("Currency deleted successfully");
      setShowModal(false);
      navigate("/currencies");
    } catch (error: any) {
      setShowModal(false);
      const responseData = error?.response?.data;
      if (Array.isArray(responseData)) toast.error(responseData[0]);
      else if (responseData?.detail) toast.error(responseData.detail);
      else toast.error("Failed to delete currency");
    }
  };

  if (currencyError)
    return <p className="text-destructive">Error loading currency</p>;
  if (exchangeRateError)
    return <p className="text-destructive">Error loading exchange rates</p>;
  if (!currency) return <p>Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Currency Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" disabled {...register("code")} />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register("description")} />
              {errors.description && (
                <p className="text-destructive text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="is_local"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="is_local"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
                    ${field.value ? "bg-green-500" : "bg-gray-300"}
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out
                      ${field.value ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </Switch>
                    <Label
                      htmlFor="is_local"
                      className="text-sm font-medium text-gray-700"
                    >
                      Is Local
                    </Label>
                  </div>
                )}
              />
              {/* <Label htmlFor="is_local">Is Local</Label> */}
            </div>

            <div className="flex gap-2">
              <Button type="submit">Update</Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowModal(true)}
              >
                Delete
              </Button>
            </div>
          </form>

          <ConfirmModal
            isOpen={showModal}
            title="Confirm Deletion"
            message={`Are you sure you want to delete "${code}"?`}
            onCancel={() => setShowModal(false)}
            onConfirm={handleDelete}
          />

          {!currency.is_local && exchangeRates && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Exchange Rates</h3>
                <Link to={`/currencies/${code}/exchange-rate/create`}>
                  <Button size="sm">Add Exchange Rate</Button>
                </Link>
              </div>

              {exchangeRates.length === 0 ? (
                <p className="text-muted-foreground">
                  No exchange rates recorded yet.
                </p>
              ) : (
                <>
                  {exchangeRates
                    .filter((r: ExchangeRate) => r.is_current)
                    .map((rate: ExchangeRate) => (
                      <Card
                        key={rate.id}
                        className="border-green-400 bg-green-50 mb-3"
                      >
                        <CardContent className="pt-4">
                          <p>
                            <strong>Rate:</strong> {rate.rate}
                          </p>
                          <p>
                            <strong>Created by:</strong> {rate.created_by}
                          </p>
                          <p>
                            <strong>Created at:</strong>{" "}
                            {new Date(rate.created_at).toLocaleString()}
                          </p>

                          <div className="flex items-center gap-2 mt-3">
                            <Switch
                              checked={rate.is_current}
                              onCheckedChange={async () => {
                                const optimisticRates = exchangeRates.map(
                                  (r: ExchangeRate) =>
                                    r.id === rate.id
                                      ? { ...r, is_current: !r.is_current }
                                      : r
                                );
                                await refreshRates(optimisticRates, false);

                                try {
                                  await axiosInstance.patch(
                                    `/api/currencies/exchangerates/${rate.id}/`,
                                    { is_current: !rate.is_current }
                                  );
                                  toast.success(
                                    `Exchange rate ${
                                      !rate.is_current ? "marked" : "unmarked"
                                    } as current`
                                  );
                                  await refreshRates();
                                } catch (error: any) {
                                  const msg =
                                    error?.response?.data?.detail ||
                                    "Failed to update current status";
                                  toast.error(msg);
                                  await refreshRates();
                                }
                              }}
                            />
                            <Label>Current</Label>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  <Button
                    variant="link"
                    onClick={() => setShowHistory((prev) => !prev)}
                    className="mt-2 text-indigo-600"
                  >
                    {showHistory ? "Hide History" : "Show History"}
                  </Button>

                  {showHistory && (
                    <div className="space-y-2 mt-3">
                      {exchangeRates
                        .filter((r: ExchangeRate) => !r.is_current)
                        .map((rate: ExchangeRate) => (
                          <Card key={rate.id} className="bg-gray-50">
                            <CardContent className="pt-4">
                              <p>
                                <strong>Rate:</strong> {rate.rate}
                              </p>
                              <p>
                                <strong>Created by:</strong> {rate.created_by}
                              </p>
                              <p>
                                <strong>Created at:</strong>{" "}
                                {new Date(rate.created_at).toLocaleString()}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="mt-6">
            <Button variant="secondary" onClick={() => navigate("/currencies")}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
