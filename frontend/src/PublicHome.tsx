import { Link } from "react-router-dom";

const PublicHomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Top-left Signup Link */}
      <div className="absolute top-4 left-4">
        <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
          Sign Up
        </Link>
      </div>
      <div className="absolute top-4 left-4">
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Log in
        </Link>
      </div>

      {/* Main Content */}
      <div className="text-center p-6 bg-white shadow-md rounded-lg max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to FinanceTracker</h1>
        <p className="text-gray-600">
          Track your expenses, manage your budget, and achieve financial freedom with ease.
        </p>
      </div>
      <footer>© {new Date().getFullYear()} SkyLimTech Inc™ All rights reserved.</footer>
    </div>
  );
};

export default PublicHomePage;
