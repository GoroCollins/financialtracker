import React from "react";
import { useAuthService } from "./hooks/useAuthService";
import useSWR from "swr";
import { fetcher } from "./utils/swrFetcher";
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const Home: React.FC = () => {
  const { user } = useAuthService();
  const { data: localCurrency, error: localcurrencyError, isLoading: localcurrencyLoading } = useSWR(
    "/api/currencies/get-localcurrency",
    fetcher
  );
  const { data: incomeTotals, error: incometotalsError, isLoading: incometotalsLoading } = useSWR(
    "/api/income/totalincome",
    fetcher
  );
  const { data: assetsTotals, error: assetstotalsError, isLoading: assetstotalsLoading } = useSWR(
    "/api/assets/totalassets",
    fetcher
  );
  const { data: expensesTotals, error: expensestotalsError, isLoading: expensestotalsLoading } = useSWR(
    "/api/expenses/totalexpenses",
    fetcher
  );
  const { data: liabilitiesTotals, error: liabilitiestotalsError, isLoading: liabilitiestotalsLoading } = useSWR(
    "/api/liabilities/totalliabilities",
    fetcher
  );

  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);
  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const formatCurrency = (amount: number) =>
    `${localCurrency?.local_currency_code ?? ""} ${Number(amount ?? 0).toFixed(2)}`;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const capitalize = (full_name: string) =>
    full_name
      .split(" ")
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
      .join(" ");

  if (localcurrencyLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48 mt-2" />
      </div>
    );
  }

  if (localcurrencyError) {
    return (
      <Alert variant="destructive" className="m-6">
        <div>Failed to load local currency.</div>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">
        {getGreeting()} {user?.full_name ? capitalize(user.full_name) : "there"}, welcome
      </h2>

      <Separator />

      {/* Totals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Income",
            value: incomeTotals?.total_income,
            section: "income",
            loading: incometotalsLoading,
            error: incometotalsError,
          },
          {
            title: "Assets",
            value: assetsTotals?.total_assets,
            section: "assets",
            loading: assetstotalsLoading,
            error: assetstotalsError,
          },
          {
            title: "Expenses",
            value: expensesTotals?.total_expenses,
            section: "expenses",
            loading: expensestotalsLoading,
            error: expensestotalsError,
          },
          {
            title: "Liabilities",
            value: liabilitiesTotals?.total_liabilities,
            section: "liabilities",
            loading: liabilitiestotalsLoading,
            error: liabilitiestotalsError,
          },
        ].map((item) => (
          <Card
            key={item.title}
            onClick={() => toggleSection(item.section)}
            className={`cursor-pointer transition hover:shadow-lg ${expandedSection === item.section ? "ring-2 ring-primary" : ""}`}
          >
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {item.loading ? (
                <Skeleton className="h-6 w-24" />
              ) : item.error ? (
                <div className="text-destructive">Failed to load</div>
              ) : (
                <div className="text-lg font-bold">
                  {item.value !== undefined ? formatCurrency(Number(item.value)) : "—"}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overview Bar Chart */}
      {incomeTotals && assetsTotals && expensesTotals && liabilitiesTotals && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: "Income", value: Number(incomeTotals.total_income ?? 0), key: "income" },
                  { name: "Assets", value: Number(assetsTotals.total_assets ?? 0), key: "assets" },
                  { name: "Expenses", value: Number(expensesTotals.total_expenses ?? 0), key: "expenses" },
                  { name: "Liabilities", value: Number(liabilitiesTotals.total_liabilities ?? 0), key: "liabilities" },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                onClick={(e) => {
                  const payload = (e as {
                    activePayload?: { payload?: { key?: string } }[];
                  })?.activePayload?.[0]?.payload;
                  const section = payload?.key;
                  if (section) toggleSection(section);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Expanded section charts (use LineChart/Line) */}
            {expandedSection === "income" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Income Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={[
                        { name: "Earned", value: Number(incomeTotals.earned_income ?? 0) },
                        { name: "Portfolio", value: Number(incomeTotals.portfolio_income ?? 0) },
                        { name: "Passive", value: Number(incomeTotals.passive_income ?? 0) },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="value" stroke="#10b981" activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {expandedSection === "assets" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Assets Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={[
                        { name: "Liquid", value: Number(assetsTotals.liquid_assets ?? 0) },
                        { name: "Equities", value: Number(assetsTotals.equities ?? 0) },
                        { name: "Investments", value: Number(assetsTotals.investment_accounts ?? 0) },
                        { name: "Retirement", value: Number(assetsTotals.retirement_accounts ?? 0) },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="value" stroke="#6366f1" activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {expandedSection === "expenses" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Expenses Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={[
                        { name: "Fixed", value: Number(expensesTotals.fixed_expenses ?? 0) },
                        { name: "Variable", value: Number(expensesTotals.variable_expenses ?? 0) },
                        { name: "Discretionary", value: Number(expensesTotals.discretionary_expenses ?? 0) },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="value" stroke="#dc2626" activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {expandedSection === "liabilities" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Liabilities Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={[{ name: "Loans", value: Number(liabilitiesTotals.loans ?? 0) }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="value" stroke="#6b7280" activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Home;
