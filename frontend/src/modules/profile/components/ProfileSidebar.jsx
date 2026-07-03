import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutSuccess } from '../../../redux/slices/authSlice';
import authService from '../../../services/auth.service';
import { 
  Home, User, Compass, FileText, Briefcase, 
  Users, MessageSquare, Bookmark, UserCheck, 
  UserPlus, Settings, LogOut, Upload, ChevronLeft, 
  ChevronRight, BarChart2, Globe, Database, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProfileSidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username } = useParams();
  const { user } = useSelector((state) => state.auth);

  // Fallback to current user's profileSlug/username if not viewing a specific profile
  const profileSlug = username || user?.profileSlug || 'me';

  const links = [
    { name: 'Home Feed', path: '/', icon: Home, end: true },
    { name: 'Profile', path: `/profile/${profileSlug}`, icon: User, end: true },
    { name: 'Research Identity', path: `/profile/${profileSlug}/research-identity`, icon: Globe },
    { name: 'Publications', path: `/profile/${profileSlug}/publications`, icon: FileText },
    { name: 'Projects', path: `/profile/${profileSlug}/projects`, icon: Briefcase },
    { name: 'Explore', path: '/search', icon: Compass },
    { name: 'Messages', path: `/profile/${profileSlug}/messages`, icon: MessageSquare },
    { name: 'Datasets', path: `/profile/${profileSlug}/datasets`, icon: Database },
    { name: 'Communities', path: '/communities', icon: Users },
    { name: 'Bookmarks', path: `/profile/${profileSlug}/bookmarks`, icon: Bookmark },
    { name: 'Saved', path: `/profile/${profileSlug}/saved`, icon: Bookmark },
    { name: 'Followers', path: `/profile/${profileSlug}/followers`, icon: UserCheck },
    { name: 'Following', path: `/profile/${profileSlug}/following`, icon: UserPlus },
    { name: 'Analytics', path: `/profile/${profileSlug}/analytics`, icon: BarChart2 },
    { name: 'Settings', path: `/profile/${profileSlug}/settings`, icon: Settings }
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      dispatch(logoutSuccess());
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const handleUploadPublication = () => {
    navigate('/publications/create');
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full fixed top-0 left-0 z-50 flex flex-col justify-between transition-all duration-300 md:sticky md:top-[65px] md:h-[calc(100vh-65px)] overflow-y-auto scrollbar-none
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        <div>
          {/* Collapse/Expand Toggle Button (Desktop/Tablet Only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-sm hover:bg-slate-55 dark:hover:bg-slate-800 transition-colors text-slate-500 z-40 hidden md:block"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Close Button (Mobile Only) */}
          <div className="flex md:hidden justify-end p-4">
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sidebar Spacer on Desktop */}
          <div className="h-10 hidden md:flex items-center justify-center" />

          {/* Navigation List */}
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
            <ul className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.name}>
                    <NavLink
                      to={link.path}
                      end={link.end}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        } ${isCollapsed ? 'md:justify-center' : ''}`
                      }
                      title={isCollapsed ? link.name : ''}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className={`${isCollapsed ? 'md:hidden' : 'block'}`}>{link.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Sidebar Footer Operations */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-55/50 dark:bg-slate-950/20">
          {(!isCollapsed) ? (
            <button
              onClick={handleUploadPublication}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Publication</span>
            </button>
          ) : (
            <button
              onClick={handleUploadPublication}
              className="w-full flex md:hidden lg:flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all md:p-2.5"
              title="Upload Publication"
            >
              <Upload className="w-4 h-4" />
              <span className="md:hidden">Upload Publication</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-55 dark:hover:bg-rose-950/20 rounded-xl transition-all ${
              isCollapsed ? 'md:justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className={`${isCollapsed ? 'md:hidden' : 'block'}`}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProfileSidebar;
