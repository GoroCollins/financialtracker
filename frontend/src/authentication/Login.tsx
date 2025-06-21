import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthService } from "./AuthenticationService";
import { toast } from "react-hot-toast";

interface LoginFormInputs {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useAuthService();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormInputs>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await login(data.username, data.password);
      toast.success("Login successful");
      navigate(state?.from?.pathname || "/home");
      reset();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.request) {
        toast.error("Network error. Please try again later.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3" controlId="username">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          {...register("username", { required: "This is required" })}
          placeholder="username"
        />
        {errors.username && (
          <p className="text-danger">{errors.username.message}</p>
        )}
      </Form.Group>

      <Form.Group className="mb-3" controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          {...register("password", { required: "This is required" })}
          placeholder="password"
        />
        {errors.password && (
          <p className="text-danger">{errors.password.message}</p>
        )}
      </Form.Group>

      <Button type="submit" variant="primary">
        Login
      </Button>
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
        style={{ marginLeft: "10px" }}
      >
        Back
      </Button>
    </form>
  );
};

export default Login;
