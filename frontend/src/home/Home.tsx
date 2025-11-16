import React, {useMemo} from "react";
import { useAuthService } from "../hooks/useAuthService";
import { useFinancialData } from "./useFinancialData";
import { DashboardCard } from "./DashboardCard";
import { BreakdownChart } from "./BreakdownChart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
// import { Wallet, PiggyBank, TrendingUp, CreditCard } from "lucide-react"; - to use latter
import { motion, AnimatePresence } from "framer-motion";
// import { formatCurrency } from "@/utils/formatCurrency";

const Home: React.FC = () => {
  const { user } = useAuthService();
  const {
    localCurrency,
    incomeTotals,
    assetsTotals,
    expensesTotals,
    liabilitiesTotals,
    isLoading,
    hasError,
  } = useFinancialData();

  // const currencyCode = localCurrency?.code || "USD";

  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);
  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

//   const formatCurrency = (amount: number) =>
//     `${localCurrency?.local_currency_code ?? ""} ${Number(amount ?? 0).toFixed(2)}`;

  const formatCurrency = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: localCurrency?.local_currency_code ?? "USD",
  }).format(amount ?? 0);

// const formatCurrency = useMemo(
//     () =>
//       (amount: number) =>
//         new Intl.NumberFormat(undefined, {
//           style: "currency",
//           currency: localCurrency?.local_currency_code ?? "USD",
//         }).format(amount ?? 0),
//     [localCurrency]
//   );

const sections = useMemo(
  () => [
    { title: "Income", value: incomeTotals?.total_income, section: "income" },
    { title: "Assets", value: assetsTotals?.total_assets, section: "assets" },
    { title: "Expenses", value: expensesTotals?.total_expenses, section: "expenses" },
    { title: "Liabilities", value: liabilitiesTotals?.total_liabilities, section: "liabilities" },
  ],
  [incomeTotals, assetsTotals, expensesTotals, liabilitiesTotals]
);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 16) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const capitalize = (full_name: string) =>
    full_name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-48 mt-2" />
      </div>
    );
  }

if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertCircle className="w-8 h-8 text-destructive mb-2" aria-hidden="true" />
        <p className="text-destructive font-medium">Failed to load financial data.</p>
        <p className="text-muted-foreground text-sm">Please try refreshing the page.</p>
      </div>
    );
  }
if (!incomeTotals && !assetsTotals && !expensesTotals && !liabilitiesTotals) {
  return (
    <div className="p-6 text-center text-muted-foreground">
      No financial data available yet. Start by adding income or assets!
    </div>
  );
}

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">
        {getGreeting()} {user?.full_name ? capitalize(user.full_name) : "there"}, Welcome
      </h2>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((item) => (
          <DashboardCard
            key={item.section}
            title={item.title}
            value={item.value}
            formatCurrency={formatCurrency}
            onClick={() => toggleSection(item.section)}
            active={expandedSection === item.section}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sections.map((s) => ({
                name: s.title,
                value: Number(s.value ?? 0),
                key: s.section,
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onClick={(e) => {
                const payload = (e as any)?.activePayload?.[0]?.payload;
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

        <AnimatePresence initial={false}>
          {expandedSection === "income" && (
            <motion.div
             id={`${expandedSection}-content`}
                key={expandedSection}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
            <CardContent className="p-4">
            <BreakdownChart
              title="Income Breakdown"
              data={[
                { name: "Earned", value: incomeTotals?.earned_income ?? 0 },
                { name: "Portfolio", value: incomeTotals?.portfolio_income ?? 0 },
                { name: "Passive", value: incomeTotals?.passive_income ?? 0 },
              ]}
              color="#10b981"
              formatCurrency={formatCurrency}
            />
            </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {expandedSection === "assets" && (
            <motion.div
             id={`${expandedSection}-content`}
                key={expandedSection}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <CardContent className="p-4">
            <BreakdownChart
              title="Assets Breakdown"
              data={[
                { name: "Liquid", value: assetsTotals?.liquid_assets ?? 0 },
                { name: "Equities", value: assetsTotals?.equities ?? 0 },
                { name: "Investments", value: assetsTotals?.investment_accounts ?? 0 },
                { name: "Retirement", value: assetsTotals?.retirement_accounts ?? 0 },
              ]}
              color="#6366f1"
              formatCurrency={formatCurrency}
            />
            </CardContent>
            </motion.div>
          )}
          </AnimatePresence>

  <AnimatePresence initial={false}>
          {expandedSection === "expenses" && (
            <motion.div
             id={`${expandedSection}-content`}
                key={expandedSection}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
            <CardContent className="p-4">
            <BreakdownChart
              title="Expenses Breakdown"
              data={[
                { name: "Fixed", value: expensesTotals?.fixed_expenses ?? 0 },
                { name: "Variable", value: expensesTotals?.variable_expenses ?? 0 },
                { name: "Discretionary", value: expensesTotals?.discretionary_expenses ?? 0 },
              ]}
              color="#dc2626"
              formatCurrency={formatCurrency}
            />
            </CardContent>
            </motion.div>
          )}
  </AnimatePresence>
          <AnimatePresence initial={false}>
          {expandedSection === "liabilities" && (
            <motion.div
             id={`${expandedSection}-content`}
                key={expandedSection}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
            <CardContent className="p-4">
            <BreakdownChart
              title="Liabilities Breakdown"
              data={[{ name: "Loans", value: liabilitiesTotals?.loans ?? 0 }]}
              color="#6b7280"
              formatCurrency={formatCurrency}
            />
            </CardContent>
            </motion.div>
          )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;