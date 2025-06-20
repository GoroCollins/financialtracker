import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./authentication/Signup";
import PublicHomePage from "./PublicHome";
import Login from "./authentication/Login";
import VerifyEmailNotice from "./authentication/VerifyEmailNotice";
import ConfirmEmail from "./authentication/ConfirmEmail";
import Home from "./Home";
import { ProtectedRoute } from "./ProtectedRoutes";
import Logout from "./authentication/Logout";
import UserProfile from "./authentication/UserProfile";
const RoutesConfig: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicHomePage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmailNotice />} />
      <Route path="/confirm-email/:key" element={<ConfirmEmail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
      <Route path="/userprofile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
    </Routes>
  );
}

export default RoutesConfig;