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
import ChangePassword from "./authentication/ChangePassword";
import AppLayout from "./AppLayout";
import CurrenciesList from "./currencies/CurrenciesList";
import CreateCurrency from "./currencies/NewCurrency";
import CurrencyDetail from "./currencies/CurrencyDetail";
import CreateExchangeRate from "./currencies/NewExchangeRate";
import IncomePage from "./pages/income/IncomePage";
import EditIncome from "./pages/income/EditIncome";
import IncomeDetails from "./pages/income/IncomeDetails";
import AssetPage from "./pages/financial_assets/AssetPage";
import AssetDetails from "./pages/financial_assets/AssetsDetails";
import EditAsset from "./pages/financial_assets/EditAsset";
import ExpensesPage from "./pages/expenses/ExpensesPage";
import ExpensesDetails from "./pages/expenses/ExpensesDetails";
import EditExpenses from "./pages/expenses/EditExpenses";
const RoutesConfig: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicHomePage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmailNotice />} />
      <Route path="/confirm-email/:key" element={<ConfirmEmail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
      {/* Protected Routes under AppLayout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/home" element={<Home />} />
      <Route path="/userprofile" element={<UserProfile />} />
      <Route path="/changepassword" element={<ChangePassword />} />
      <Route path="/currencies" element={<CurrenciesList />} /> 
      <Route path="/currencies/create" element={<CreateCurrency />} />
      <Route path="/currencies/:code" element={<CurrencyDetail />} />
      <Route path="/currencies/:code/exchange-rate/create" element={<CreateExchangeRate />} />
      <Route path="/income/:type" element={<IncomePage />} />
      <Route path="/income/:type/edit/:id" element={<EditIncome />} />
      <Route path="/income/:type/details/:id" element={<IncomeDetails />} />
      <Route path="/assets/:type" element={<AssetPage />} />
      <Route path="/assets/:type/details/:id" element={<AssetDetails />} />
      <Route path="/assets/:type/edit/:id" element={<EditAsset />} />
      <Route path="/expenses/:type" element={<ExpensesPage />} />
      <Route path="/expenses/:type/details/:id" element={<ExpensesDetails />} />
      <Route path="/expenses/:type/edit/:id" element={<EditExpenses />} />
      {/* Add more protected routes here */}
      </Route>
    </Routes>
  );
}

export default RoutesConfig;