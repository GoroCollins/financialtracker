import { useNavigate, useParams, Link } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../utils/swrFetcher";
import { IncomeTypeKey, incomeTypeMap } from "../../constants/incomeTypes";
import { IncomeResponse } from "../../utils/zodSchemas";
import { axiosInstance } from "../../authentication/AuthenticationService";
import { toast } from "sonner";
import { useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const IncomeDetails = () => {
  const { type, id } = useParams<{ type: IncomeTypeKey; id: string }>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!type || !id || !(type in incomeTypeMap)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">
              Invalid income type or ID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please verify the link and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { endpoint, route, label } = incomeTypeMap[type];
  const { data: income, isLoading } = useSWR<IncomeResponse>(
    `${endpoint}${id}/`,
    fetcher
  );

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`${endpoint}${id}/`);
      toast.success("Income deleted.");
      navigate(route);
    } catch {
      toast.error("Failed to delete income.");
    } finally {
      setOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl py-8">
        <Card className="p-6 space-y-3">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-1/4" />
        </Card>
      </div>
    );
  }

  if (!income) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Income not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The requested income record could not be located.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {label} Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>Income Name:</strong> {income.income_name}
          </div>
          <div>
            <strong>Currency:</strong> {income.currency}
          </div>
          <div>
            <strong>Amount:</strong> {income.amount}
          </div>
          <div>
            <strong>Amount (Local):</strong> {income.amount_lcy_display}
          </div>
          <div>
            <strong>Notes:</strong> {income.notes || "—"}
          </div>
          <div>
            <strong>Created by:</strong> {income.created_by} on{" "}
            {income.created_at}
          </div>
          {income.modified_by && (
            <div>
              <strong>Modified by:</strong> {income.modified_by} on{" "}
              {income.modified_at}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pt-4">
          <Link to={`${route}/edit/${income.id}`}>
            <Button variant="default">Update</Button>
          </Link>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <strong>{income.income_name}</strong>? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Link to={route}>
            <Button variant="outline">Back</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IncomeDetails;
