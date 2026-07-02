import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AuthenticatedNavbar from '../Navbar/AuthenticatedNavbar';
import Sidebar from '../Sidebar';

const DashboardLayout = () => {
  const location = useLocation();
  const isAiWorkspace = location.pathname.startsWith('/ai-workspace');

  return (
    <div className="flex flex-col min-h-screen bg-bg-page text-text-primary">
      <AuthenticatedNavbar />
      <div className="flex flex-grow relative">
        {!isAiWorkspace && <Sidebar />}
        <main className={`flex-grow overflow-x-hidden ${isAiWorkspace ? "p-0" : "p-6 md:p-8"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
