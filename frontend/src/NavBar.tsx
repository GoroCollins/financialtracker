import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useUserProfile } from './authentication/useUserProfile';
import placeholderProfileImage from './assets/placeholder.png';

const Navbar: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showIncomeMenu, setShowIncomeMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const incomeRef = useRef<HTMLDivElement | null>(null);
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

  const handleSettings = () => {
    setShowDropdown(false);
    navigate('/currencies');
  };

  const profileImageUrl = profile?.profile_image || placeholderProfileImage;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        incomeRef.current && !incomeRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setShowIncomeMenu(false);
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
          <div className="position-relative" ref={incomeRef}>
            <button
              className="btn btn-link nav-link dropdown-toggle"
              onClick={() => setShowIncomeMenu(prev => !prev)}
            >
              Income
            </button>
            {showIncomeMenu && (
              <div className="dropdown-menu show position-absolute mt-2 p-2 border rounded bg-white shadow">
                <Link className="dropdown-item" to="/income/earned">Earned Income</Link>
                <Link className="dropdown-item" to="/income/portfolio">Portfolio Income</Link>
                <Link className="dropdown-item" to="/income/passive">Passive Income</Link>
              </div>
            )}
          </div>

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
                onClick={() => setShowDropdown((prev) => !prev)}
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
                <button className="dropdown-item" onClick={handleSettings}>
                  Settings
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
