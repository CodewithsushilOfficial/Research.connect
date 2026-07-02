import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  User,
  FileText,
  Briefcase,
  Users,
  MessageCircle,
  Bell,
  Bookmark,
  UserPlus,
  UserCheck,
  Settings,
  PlusCircle
} from 'lucide-react';

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Discovery Feed', path: '/discovery', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Publications', path: '/publication', icon: FileText },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Collaborations', path: '/collaborations', icon: Users },
    { name: 'Messages', path: '/messages', icon: MessageCircle },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Following', path: '/following', icon: UserPlus },
    { name: 'Followers', path: '/followers', icon: UserCheck },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <aside className="hidden md:flex md:w-72 lg:w-80 bg-white border-r border-border min-h-screen sticky top-0 overflow-y-auto">
      <div className="flex h-full flex-col justify-between p-4 md:p-6">
        <div className="space-y-3">
          <ul className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-primary text-white shadow-2xl shadow-primary/20'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-page'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
