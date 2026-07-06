import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../../store/slices/authSlice.js';

export const Navbar = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Research<span className="text-primary">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#stats" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition">
              Stats
            </a>
            <a href="#faq" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition">
              FAQ
            </a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-primary hover:bg-primary-600 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/20 transition duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold text-muted-foreground hover:text-foreground px-4 py-2.5 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-600 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/20 transition duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted-foreground hover:text-foreground focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-b border-border px-6 py-6 space-y-4">
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block text-base font-medium text-muted-foreground hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#stats"
            onClick={() => setIsOpen(false)}
            className="block text-base font-medium text-muted-foreground hover:text-foreground"
          >
            Stats
          </a>
          <a
            href="#faq"
            onClick={() => setIsOpen(false)}
            className="block text-base font-medium text-muted-foreground hover:text-foreground"
          >
            FAQ
          </a>
          <div className="pt-4 border-t border-border flex flex-col space-y-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="w-full text-center bg-primary hover:bg-primary-600 py-3 rounded-xl text-sm font-bold text-white"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground border border-border"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center bg-primary hover:bg-primary-600 py-3 rounded-xl text-sm font-bold text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
