import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Field, FieldError, FieldGroup, FieldLabel, FieldDescription,} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "./AuthenticationService";

// ✅ Define form validation schema
const resetPasswordSchema = z
  .object({
    new_password1: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    new_password2: z.string(),
  })
  .refine((data) => data.new_password1 === data.new_password2, {
    message: "Passwords do not match",
    path: ["new_password2"],
  });

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();

  const form = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password1: "",
      new_password2: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    try {
      await axiosInstance.post("/dj-rest-auth/password/reset/confirm/", {
        uid,
        token,
        ...data,
      });

      alert("Password reset successful. You can now log in with your new password.");
      navigate("/login");
      // navigate("/login", { state: { message: "Password reset successful. Please log in." } });
    } catch (error: any) {
      console.error("Password reset failed:", error.response?.data || error);
      alert("Password reset failed. Please try again or request a new reset link.");
    }
  };

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below to reset your account credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new_password1">New Password</FieldLabel>
              <Input
                type="password"
                placeholder="Enter new password"
                {...form.register("new_password1")}
              />
              {form.formState.errors.new_password1 && (
                <FieldError
                  errors={[{ message: form.formState.errors.new_password1.message }]}
                />
              )}
              <FieldDescription>
                Password must have at least 8 characters, a number, and a mix of upper/lowercase letters.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="new_password2">Confirm New Password</FieldLabel>
              <Input
                type="password"
                placeholder="Confirm new password"
                {...form.register("new_password2")}
              />
              {form.formState.errors.new_password2 && (
                <FieldError
                  errors={[{ message: form.formState.errors.new_password2.message }]}
                />
              )}
            </Field>

            <div className="flex justify-center mt-4 gap-2">
              <Button type="submit">Reset Password</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetPasswordForm;
