import React from 'react';
import { Outlet } from 'react-router-dom';
import AuthenticatedNavbar from './Navbar/AuthenticatedNavbar';

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-page text-text-primary">
      <AuthenticatedNavbar />
      <div className="flex flex-grow relative">
        <main className="flex-grow overflow-x-hidden p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
