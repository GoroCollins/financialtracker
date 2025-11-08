import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useSWR from "swr";
import { axiosInstance } from "../services/apiClient";
import { Currency } from "../utils/zodSchemas";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);
const PAGE_SIZE = 15;

export default function CurrenciesList() {
  const { data: currencies, error } = useSWR<Currency[]>("/api/currencies/currencies/", fetcher);
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultTab =
    (searchParams.get("tab") as "local" | "other") ||
    (localStorage.getItem("activeCurrencyTab") as "local" | "other") ||
    "local";

  const [activeTab, setActiveTab] = useState<"local" | "other">(defaultTab);
  const [otherPage, setOtherPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
    localStorage.setItem("activeCurrencyTab", activeTab);
  }, [activeTab, setSearchParams]);

  const localCurrency = currencies?.find((c) => c.is_local);
  const otherCurrencies = currencies?.filter((c) => !c.is_local) ?? [];

  const filteredOthers = useMemo(() => {
    const term = debouncedSearchTerm.toLowerCase();
    return otherCurrencies.filter(
      (c) =>
        c.code.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
    );
  }, [otherCurrencies, debouncedSearchTerm]);

  const start = (otherPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const paginatedOthers = filteredOthers.slice(start, end);
  const hasNext = end < filteredOthers.length;
  const hasPrev = otherPage > 1;

  useEffect(() => setOtherPage(1), [searchTerm]);

  if (error) {
    return <div className="text-red-600">Error loading currencies.</div>;
  }

  if (!currencies) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Currencies</h1>

      <Accordion
        type="single"
        collapsible
        value={activeTab}
        onValueChange={(value) => setActiveTab((value as "local" | "other") || "local")}
        className="space-y-4"
      >
        {/* Local Currency */}
        <AccordionItem value="local">
          <AccordionTrigger>Local Currency</AccordionTrigger>
          <AccordionContent>
            <Card className="border border-muted mt-2">
              <CardContent className="p-4">
                {localCurrency ? (
                  <Link
                    to={`/currencies/${localCurrency.code}`}
                    className="text-lg font-semibold text-green-700 hover:underline"
                  >
                    {localCurrency.code} — {localCurrency.description} (Local)
                  </Link>
                ) : (
                  <div className="text-red-600 font-medium">
                    ⚠️ No local currency defined.
                  </div>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Other Currencies */}
        <AccordionItem value="other">
          <AccordionTrigger>
            Other Currencies ({otherCurrencies.length})
          </AccordionTrigger>
          <AccordionContent>
            <Card className="border border-muted mt-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Available Currencies</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 🔍 Search */}
                <div className="mb-4">
                  <Input
                    type="text"
                    placeholder="Search by code or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                {paginatedOthers.length > 0 ? (
                  <ul className="space-y-2">
                    {paginatedOthers.map((currency) => (
                      <li
                        key={currency.code}
                        className="border rounded px-3 py-2 hover:bg-muted transition"
                      >
                        <Link
                          to={`/currencies/${currency.code}`}
                          className="text-lg font-medium"
                        >
                          {currency.code} — {currency.description}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground">
                    No other currencies found.
                  </div>
                )}

                {/* Pagination */}
                {filteredOthers.length > PAGE_SIZE && (
                  <div className="flex justify-between items-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasPrev}
                      onClick={() => setOtherPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {otherPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!hasNext}
                      onClick={() => setOtherPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
