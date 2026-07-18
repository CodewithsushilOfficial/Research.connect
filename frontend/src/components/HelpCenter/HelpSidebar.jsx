import React from 'react';
import { Mail, ShieldAlert, Heart, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const HelpSidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    {
      id: 'contact',
      label: 'Contact Support',
      icon: Mail,
      description: 'Submit a technical or account support ticket'
    },
    {
      id: 'grievance',
      label: 'Report a Problem / Grievance',
      icon: ShieldAlert,
      description: 'Submit Plagiarism, DMCA, or compliance requests'
    },
    {
      id: 'feedback',
      label: 'Share Feedback',
      icon: Heart,
      description: 'Help us improve Research Connect'
    },
    {
      id: 'info',
      label: 'Contact Information',
      icon: Info,
      description: 'Support emails, working hours, and response time'
    }
  ];

  return (
    <aside className="w-full md:w-80 bg-bg-card rounded-2xl border border-border p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow duration-300 h-fit">
      <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 md:gap-0 md:space-y-1 no-scrollbar scroll-smooth p-1 md:p-0 bg-bg-page/40 md:bg-transparent rounded-xl md:rounded-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`relative flex-shrink-0 flex items-center md:items-start gap-2.5 md:gap-4 p-3 md:p-3.5 rounded-xl transition-all duration-200 group focus:outline-none ${
                isActive
                  ? 'text-white'
                  : 'hover:bg-bg-page/80 text-text-primary hover:text-primary dark:hover:bg-slate-800'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeHelpTab"
                  className="absolute inset-0 bg-primary rounded-xl z-0 shadow-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center md:items-start gap-2.5 md:gap-4 w-full">
                <Icon className={`w-4.5 h-4.5 md:w-5 md:h-5 transition-colors ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-primary'}`} />
                <div className="text-left">
                  <span className="block text-xs md:text-sm font-semibold tracking-tight whitespace-nowrap transition-colors">{item.label}</span>
                  <span
                    className={`hidden md:block text-[11px] mt-0.5 transition-colors ${
                      isActive ? 'text-white/80' : 'text-text-secondary'
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default HelpSidebar;

