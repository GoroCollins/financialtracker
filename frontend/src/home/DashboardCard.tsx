import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardCardProps {
  title: string;
  value?: number;
  loading?: boolean;
  error?: boolean;
  formatCurrency: (amount: number) => string;
  onClick?: () => void;
  active?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  loading,
  error,
  formatCurrency,
  onClick,
  active,
}) => (
  <Card
    onClick={onClick}
    className={`cursor-pointer transition hover:shadow-lg ${active ? "ring-2 ring-primary" : ""}`}
  >
    <CardHeader role="button">
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-6 w-24" />
      ) : error ? (
        <div className="text-destructive">Failed to load</div>
      ) : (
        <div className="text-lg font-bold">
          {value !== undefined ? formatCurrency(Number(value)) : "—"}
        </div>
      )}
    </CardContent>
  </Card>
);
