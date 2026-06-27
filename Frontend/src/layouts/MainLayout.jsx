import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Microscope, LogOut, User, Compass, HelpCircle } from 'lucide-react';

const MainLayout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-40 w-full glass-card border-b border-[var(--color-brand-border)] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[var(--color-brand-light-blue)] text-[var(--color-brand-blue)] border border-blue-200/50 rounded-xl flex items-center justify-center transition-all group-hover:scale-105">
              <Microscope className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold font-display text-gradient tracking-tight">
              ResearchConnect
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors">
              Home
            </Link>
            <a href="#discover" className="text-sm font-medium text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors">
              Discover
            </a>
            <a href="#collaborate" className="text-sm font-medium text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors">
              Collaborate
            </a>
          </nav>

          {/* Auth Controls */}
          <div className="flex items-center gap-4">
            {token && user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-[var(--color-brand-text-primary)]">{user.username}</span>
                  <span className="text-[10px] text-[var(--color-brand-text-secondary)] capitalize">{user.role}</span>
                </div>
                
                <div className="w-8 h-8 rounded-full bg-[var(--color-brand-light-blue)] border border-[var(--color-brand-border)] flex items-center justify-center text-[var(--color-brand-blue)]">
                  <User className="w-4 h-4" />
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-red)] transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] rounded-xl shadow-lg shadow-blue-500/10 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--color-brand-border)] py-8 bg-[var(--color-brand-bg)] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-brand-text-secondary)] font-sans">
              &copy; {new Date().getFullYear()} ResearchConnect. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
