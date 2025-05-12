import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./authentication/Signup";
import PublicHomePage from "./PublicHome";
import Login from "./authentication/Login";

const RoutesConfig: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicHomePage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default RoutesConfig;