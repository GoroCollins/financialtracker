import React from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface BreakdownChartProps {
  title: string;
  data: { name: string; value: number }[];
  color: string;
  formatCurrency: (value: number) => string;
}

export const BreakdownChart: React.FC<BreakdownChartProps> = ({
  title,
  data,
  color,
  formatCurrency,
}) => (
  <Card className="mt-4">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Line type="monotone" dataKey="value" stroke={color} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

