import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./authentication/Signup";
import PublicHomePage from "./PublicHome";

const RoutesConfig: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicHomePage />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default RoutesConfig;