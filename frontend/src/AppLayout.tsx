import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';

const AppLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <main className="container mt-4">
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;