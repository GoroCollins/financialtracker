import React, { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuthService } from "../hooks/useAuthService";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel,} from "@/components/ui/field";
import { Input,  } from "@/components/ui/input";
import { AxiosError } from "axios";

interface LoginFormInputs {
  username: string;
  password: string;
}

interface LoginErrorResponse {
  detail?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useAuthService();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormInputs>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await login(data.username, data.password);
      navigate(state?.from?.pathname || "/home");
      form.reset();
    } catch (err) {
      const error = err as AxiosError<LoginErrorResponse>;
      const message =
        error.response?.data?.detail || "Invalid username or password.";

      form.setError("password", {
        type: "manual",
        message,
      });
    }
  };

  return (
      <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your username below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    {/* Flex container for label and input */}
                    <div className="flex items-center justify-between gap-4">
                      <FieldLabel htmlFor={field.name} className="whitespace-nowrap">
                        Username
                      </FieldLabel>
                    </div>
                    <div className="relative mt-1">
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        required
                        type="text"
                        placeholder="Enter your username"
                        className="pr-10"
                      />
                      </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Link
                        to="/forgotpassword"
                        className="text-sm text-blue-600 underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>

                    {/* Wrap input + button in a relative container */}
                    <div className="relative mt-1">
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Field>
                <div className="flex gap-4 mt-4 items-center justify-center">
                  <Button type="submit">Login</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </Button>
                  <div className="tw-:bg-blue-500 tw-:text-white tw-:p-4 tw-:rounded-lg">
  Tailwind is working if this box is blue.
</div>

                </div>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link
                        to="/signup"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
      </CardContent>
    </Card>
  );
};

export default Login;