import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useUserProfile } from "./authentication/useUserProfile";
import placeholderProfileImage from "./assets/placeholder.png";
import { Button } from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import { HoverDropdown } from "./menuHover";

const Navbar = () => {
  const { profile, isLoading, isError } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const profileImageUrl = profile?.profile_image || placeholderProfileImage;
  const isProfileOpen = location.pathname === "/userprofile"

  const handleLogout = () => navigate("/logout");
  const handleProfileClick = () => {
    if (isProfileOpen) {
      navigate(-1) // go back to previous page
    } else {
      navigate("/userprofile")
    }
  };

  return (
    <nav className="w-full border-b bg-background px-4 py-2 flex items-center justify-between">
      {/* Left side brand */}
      <Link to="/home" className="font-bold text-lg">
        Home
      </Link>

      {/* Middle horizontal menu */}
        {/* Income */}
          <HoverDropdown
            label="Income"
            items={[
              { label: "Earned Income", to: "/income/earned" },
              { label: "Portfolio Income", to: "/income/portfolio" },
              { label: "Passive Income", to: "/income/passive" },
            ]}
          />

          {/* Assets */}
          <HoverDropdown
            label="Assets"
            items={[
              { label: "Liquid Assets", to: "/assets/liquid" },
              { label: "Equities", to: "/assets/equity" },
              { label: "Investment Accounts", to: "/assets/investment" },
              { label: "Retirement Accounts", to: "/assets/retirement" },
            ]}
          />

          {/* Expenses */}
          <HoverDropdown
            label="Expenses"
            items={[
              { label: "Fixed Expenses", to: "/expenses/fixed" },
              { label: "Variable Expenses", to: "/expenses/variable" },
              { label: "Discretionary Expenses", to: "/expenses/discretionary" },
            ]}
          />

          {/* Liabilities */}
          <HoverDropdown
            label="Liabilities"
            items={[
              { label: "Loans", to: "/liabilities/loans" },
            ]}
          />

          {/* Settings */}
          <HoverDropdown
            label="Settings"
            items={[
              { label: "Currencies", to: "/currencies" },
              { label: "Interest Types", to: "/liabilities/interesttypes" },
            ]}
          />

      {/* Right side profile */}
      <div className="flex items-center gap-3">
        {isLoading ? (
          <span>Loading...</span>
        ) : isError ? (
          <span className="text-red-500">Profile error</span>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  width={36}
                  height={36}
                  className={`rounded-full border-2 cursor-pointer transition-all duration-200 ${
                    isProfileOpen
                      ? "border-blue-500 ring-2 ring-blue-300"
                      : "border-gray-300 hover:ring-1 hover:ring-blue-200"
                  }`}
                  onClick={handleProfileClick}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholderProfileImage
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-sm">
                {isProfileOpen ? "Close Profile" : "View Profile"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut size={18} /> Logout
        </Button>
      </div>
    </nav>
  )
}

export default Navbar;
