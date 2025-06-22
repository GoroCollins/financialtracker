import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthService } from "./AuthenticationService";
import { Eye, EyeOff } from "lucide-react";

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
    setError,
  } = useForm<LoginFormInputs>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await login(data.username, data.password);
      navigate(state?.from?.pathname || "/home");
      reset();
    } catch (error: any) {
      setError("password", {
        type: "manual",
        message: "Invalid username or password.",
      });
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
        <InputGroup>
          <Form.Control
            type={showPassword ? "text" : "password"}
            {...register("password", { required: "This is required" })}
            placeholder="password"
          />
          <Button
            variant="outline-secondary"
            onClick={() => setShowPassword((prev) => !prev)}
            type="button"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </InputGroup>
        {errors.password && (
          <p className="text-danger mt-1">{errors.password.message}</p>
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
