import React, { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useUserProfile } from './authentication/useUserProfile';
import placeholderProfileImage from './assets/placeholder.png';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { profile, isLoading, isError } = useUserProfile();
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowDropdown(false);
    navigate('/logout');
  };

  const handleManageProfile = () => {
    setShowDropdown(false);
    navigate('/userprofile');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileImageUrl = profile?.profile_image || placeholderProfileImage;

  return (
    <div className="container mt-5 position-relative">
      <div className="position-absolute top-0 end-0 p-3" ref={dropdownRef}>
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
        {showDropdown && (
          <div className="dropdown-menu show position-absolute end-0 mt-2 p-2 border rounded bg-white shadow">
            <button className="dropdown-item" onClick={handleManageProfile}>
              Manage User Profile
            </button>
            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        )}
      </div>

      <h2 className="pt-4">Welcome to the Home Page</h2>
      {isLoading && <p>Loading profile...</p>}
      {isError && <p className="text-danger">Failed to load user profile.</p>}
    </div>
  );
};

export default Home;
