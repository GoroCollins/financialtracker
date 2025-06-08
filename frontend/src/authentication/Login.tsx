import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthService } from "./AuthenticationService";

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
  const [error, setError] = useState<string>("");

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      // Call the login function
      await login(data.username, data.password);
      
      // Navigate to the previous page or home if login is successful
      navigate(state?.from?.pathname || "/home");
      
      // Reset the form
      reset();
      
    } catch (error: any) {
      // Handle errors related to login
      if (error.response) {
        setError(error.response.data.message);
      } else if (error.request) {
        setError("Network error. Please try again later.");
      } else {
        console.log(error.message);
        setError("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            {...register("username", { required: "This is required" })}
            placeholder="username"
          />
          {errors.username && (
            <p className="errorMsg">{errors.username.message}</p>
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
            <p className="errorMsg">{errors.password.message}</p>
          )}
        </Form.Group>
        {error && <p className="error-msg">{error}</p>}
        <Button type="submit" variant="primary">
          Login
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)} style={{ marginLeft: '10px' }}>
          Back
        </Button>
      </form>
    </>
  );
};

export default Login;