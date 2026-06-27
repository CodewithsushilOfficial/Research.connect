import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Microscope } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[var(--color-brand-bg)]">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="w-12 h-12 bg-[var(--color-brand-light-blue)] text-[var(--color-brand-blue)] border border-blue-200 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5">
              <Microscope className="w-7 h-7" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold font-display text-[var(--color-brand-text-primary)] tracking-wide">
            ResearchConnect
          </h2>
          <p className="text-xs text-[var(--color-brand-text-secondary)] mt-1.5 font-sans tracking-wide uppercase">
            Platform for Scientific Cooperation
          </p>
        </div>

        {/* Card containing Login/Register components */}
        <div className="glass-card rounded-2xl p-8 border border-[var(--color-brand-border)] shadow-xl relative overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
