import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useUserProfile } from "./authentication/useUserProfile";
import placeholderProfileImage from "./assets/placeholder.png";
import {NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, 
  NavigationMenuTrigger,} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";

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
      <NavigationMenu>
        <NavigationMenuList className="flex space-x-4">
          {/* Income */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="flex items-center gap-1">Income</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="flex flex-col p-2 space-y-2">
                <NavigationMenuLink asChild>
                  <Link to="/income/earned">Earned Income</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/income/portfolio">Portfolio Income</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/income/passive">Passive Income</Link>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Assets */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="flex items-center gap-1">Assets</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="flex flex-col p-2 space-y-2">
                <NavigationMenuLink asChild>
                  <Link to="/assets/liquid">Liquid Assets</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/assets/equity">Equities</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/assets/investment">Investment Accounts</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/assets/retirement">Retirement Accounts</Link>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Expenses */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="flex items-center gap-1">Expenses</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="flex flex-col p-2 space-y-2">
                <NavigationMenuLink asChild>
                  <Link to="/expenses/fixed">Fixed Expenses</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/expenses/variable">Variable Expenses</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/expenses/discretionary">Discretionary Expenses</Link>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Liabilities */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="flex items-center gap-1">Liabilities</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="flex flex-col p-2 space-y-2">
                <NavigationMenuLink asChild>
                  <Link to="/liabilities/loans">Loans</Link>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Settings */}
          <NavigationMenuItem>
            <NavigationMenuTrigger className="flex items-center gap-1">Settings</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="flex flex-col p-2 space-y-2">
                <NavigationMenuLink asChild>
                  <Link to="/currencies">Currencies</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link to="/liabilities/interesttypes">Interest Types</Link>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

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
