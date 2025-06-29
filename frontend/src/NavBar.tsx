import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useUserProfile } from './authentication/useUserProfile';
import placeholderProfileImage from './assets/placeholder.png';

const Navbar: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showIncomeMenu, setShowIncomeMenu] = useState(false);
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showExpensesMenu, setshowExpensesMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const incomeRef = useRef<HTMLDivElement | null>(null);
  const assetRef = useRef<HTMLDivElement | null>(null);
  const expensesRef = useRef<HTMLDivElement | null>(null); 
  const { profile, isLoading, isError } = useUserProfile();
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowDropdown(false);
    navigate('/logout');
  };

  const handlePasswordChange = () => {
    setShowDropdown(false);
    navigate('/changepassword');
  };

  const handleManageProfile = () => {
    setShowDropdown(false);
    navigate('/userprofile');
  };

  const profileImageUrl = profile?.profile_image || placeholderProfileImage;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !dropdownRef.current?.contains(target) &&
        !incomeRef.current?.contains(target) &&
        !assetRef.current?.contains(target) &&
        !expensesRef.current?.contains(target) &&
        !settingsRef.current?.contains(target)
      ) {
        setShowDropdown(false);
        setShowIncomeMenu(false);
        setShowAssetMenu(false);
        setshowExpensesMenu(false);
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom px-3">
      <div className="container-fluid">
        <Link to="/home" className="navbar-brand">Home</Link>

        <div className="d-flex align-items-center gap-4">
          {/* Income Menu */}
          <div className="position-relative" ref={incomeRef}>
            <button
              className="btn btn-link nav-link dropdown-toggle"
              onClick={() => setShowIncomeMenu(prev => !prev)}
            >
              Income
            </button>
            {showIncomeMenu && (
              <div className="dropdown-menu show position-absolute mt-2 p-2 border rounded bg-white shadow">
                <Link className="dropdown-item" to="/income/earned" onClick={() => setShowIncomeMenu(false)}>
                  Earned Income
                </Link>
                <Link className="dropdown-item" to="/income/portfolio" onClick={() => setShowIncomeMenu(false)}>
                  Portfolio Income
                </Link>
                <Link className="dropdown-item" to="/income/passive" onClick={() => setShowIncomeMenu(false)}>
                  Passive Income
                </Link>
              </div>
            )}
          </div>

          {/* Assets Menu */}
          <div className="position-relative" ref={assetRef}>
            <button
              className="btn btn-link nav-link dropdown-toggle"
              onClick={() => setShowAssetMenu(prev => !prev)}
            >
              Assets
            </button>
            {showAssetMenu && (
              <div className="dropdown-menu show position-absolute mt-2 p-2 border rounded bg-white shadow">
                <Link className="dropdown-item" to="/assets/liquid" onClick={() => setShowAssetMenu(false)}>
                  Liquid Assets
                </Link>
                <Link className="dropdown-item" to="/assets/equity" onClick={() => setShowAssetMenu(false)}>
                  Equities
                </Link>
                <Link className="dropdown-item" to="/assets/investment" onClick={() => setShowAssetMenu(false)}>
                  Investment Accounts
                </Link>
                <Link className="dropdown-item" to="/assets/retirement" onClick={() => setShowAssetMenu(false)}>
                  Retirement Accounts
                </Link>
              </div>
            )}
          </div>
            {/* Expenses Menu */}
          <div className="position-relative" ref={expensesRef}>
            <button
              className="btn btn-link nav-link dropdown-toggle"
              onClick={() => setshowExpensesMenu(prev => !prev)}
            >
              Expenses
            </button>
            {showExpensesMenu && (
              <div className="dropdown-menu show position-absolute mt-2 p-2 border rounded bg-white shadow">
                <Link className="dropdown-item" to="/expenses/fixed" onClick={() => setshowExpensesMenu(false)}>
                  Fixed Expenses
                </Link>
                <Link className="dropdown-item" to="/expenses/variable" onClick={() => setshowExpensesMenu(false)}>
                  Variable Expenses
                </Link>
                <Link className="dropdown-item" to="/expenses/discretionary" onClick={() => setshowExpensesMenu(false)}>
                  Discretionary Expenses
                </Link>
              </div>
            )}
          </div>

            {/* Settings Menu */}
            <div className="position-relative" ref={settingsRef}>
              <button
                className="btn btn-link nav-link dropdown-toggle"
                onClick={() => setShowSettingsMenu(prev => !prev)}
              >
                Settings
              </button>
              {showSettingsMenu && (
                <div className="dropdown-menu show position-absolute mt-2 p-2 border rounded bg-white shadow">
                  <Link className="dropdown-item" to="/currencies" onClick={() => setShowSettingsMenu(false)}>
                    Currencies
                  </Link>
                  <Link className="dropdown-item" to="/liabilities/interesttypes" onClick={() => setShowSettingsMenu(false)}>
                    Interest Types
                  </Link>
                </div>
              )}
            </div>

          {/* Profile Dropdown */}
          <div className="d-flex align-items-center" ref={dropdownRef}>
            {isLoading ? (
              <span className="me-3">Loading...</span>
            ) : isError ? (
              <span className="text-danger me-3">Profile error</span>
            ) : (
              <img
                src={profileImageUrl}
                alt="Profile"
                width={36}
                height={36}
                className="rounded-circle cursor-pointer border"
                style={{ objectFit: 'cover' }}
                onClick={() => setShowDropdown(prev => !prev)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderProfileImage;
                }}
              />
            )}

            {showDropdown && (
              <div className="dropdown-menu show position-absolute end-0 mt-2 p-2 border rounded bg-white shadow">
                <button className="dropdown-item" onClick={handleManageProfile}>
                  Manage User Profile
                </button>
                <button className="dropdown-item" onClick={handlePasswordChange}>
                  Change Password
                </button>
                <button className="dropdown-item d-flex align-items-center gap-2" onClick={handleLogout}>
                  <LogOut size={18} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
