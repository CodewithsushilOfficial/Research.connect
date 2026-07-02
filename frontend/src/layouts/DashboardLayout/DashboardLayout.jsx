import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-page text-text-primary">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-grow">
        <Sidebar />
        <main className="flex-grow p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
