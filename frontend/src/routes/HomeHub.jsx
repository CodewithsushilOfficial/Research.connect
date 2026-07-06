import React from 'react';
import { useSelector } from 'react-redux';
import Home from '../pages/Home/Home';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer/Footer';
import AuthenticatedNavbar from '../layouts/Navbar/AuthenticatedNavbar';
import HomeFeed from '../modules/home/pages/HomeFeed';

const HomeHub = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-page text-text-primary transition-colors duration-300">
        <AuthenticatedNavbar />
        <div className="flex flex-grow relative">
          <main className="flex-grow overflow-x-hidden">
            <HomeFeed />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-page text-text-primary transition-colors duration-300">
      <main className="flex-grow">
        <Home />
      </main>
    </div>
  );
};

export default HomeHub;
