import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#F8FAFC] border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and branding */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                Research<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Connecting researchers worldwide to break down barriers, share data, and build the future of scientific discovery.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-primary transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#stats" className="hover:text-primary transition">
                  Stats
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-xs text-muted-foreground font-medium">
            © {new Date().getFullYear()} Research Connect. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Designed for researchers, by researchers.
          </p>
        </div>
      </div>
    </footer>
  );
};
