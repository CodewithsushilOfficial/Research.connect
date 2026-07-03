import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess } from '../../redux/slices/authSlice';
import authService from '../../services/auth.service';
import { setQuery } from '../../redux/slices/searchSlice';
import { setChatOpen } from '../../redux/slices/messageSlice';
import {
  Bell, MessageSquare, UserPlus, Plus, ChevronDown,
  Search, LogOut, User, Compass, X,
  FileText, Briefcase, Award, Settings, BookOpen, HelpCircle,
  Share2, Users, Bookmark
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AuthenticatedNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth);
  const searchState = useSelector((state) => state.search);

  // Dropdown states
  const [profileOpen, setProfileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const profileRef = useRef(null);
  const createRef = useRef(null);
  const notifRef = useRef(null);
  const reqRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (createRef.current && !createRef.current.contains(e.target)) setCreateOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (reqRef.current && !reqRef.current.contains(e.target)) setReqOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) mobileSearchInputRef.current?.focus();
  }, [mobileSearchOpen]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      dispatch(logoutSuccess());
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  const handleSearchChange = (e) => {
    dispatch(setQuery(e.target.value));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchState.query.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchState.query)}`);
      setMobileSearchOpen(false);
    }
  };

  const mockNotifications = [
    { id: 1, text: 'David Chen liked your publication.', time: '10m ago', unread: true },
    { id: 2, text: 'Elena Rostova cited your multi-modal search paper.', time: '2h ago', unread: true },
    { id: 3, text: 'You have a new follower: Robert Miller.', time: '1d ago', unread: false }
  ];

  const mockRequests = [
    { id: 1, sender: 'David Chen', type: 'Collaboration', desc: 'AcuITY Assess Project', time: '1h ago' },
    { id: 2, sender: 'Elena Rostova', type: 'Co-Author Request', desc: 'Attention Multi-Modal Search', time: '1d ago' }
  ];

  const createLinks = [
    { icon: FileText, label: 'Upload Publication', to: '/publications/create' },
    { icon: Briefcase, label: 'Create Research Project', to: '/projects/create' },
    { icon: BookOpen, label: 'Share Dataset', to: '/datasets/create' },
    { icon: HelpCircle, label: 'Ask Question', to: '/questions/create' },
    { icon: Users, label: 'Create Community', to: '/communities/create' },
    { icon: Plus, label: 'Create Collaboration', to: '/collaborations/create' },
    { icon: Award, label: 'Upload Patent', to: '/patents/create' },
    { icon: FileText, label: 'Write Article', to: '/articles/create' },
    { icon: Compass, label: 'Create Event', to: '/events/create' }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-[95%] xl:max-w-[92%] mx-auto pl-1.5 pr-3 sm:px-4 lg:px-6">
        {/* Mobile search overlay row — replaces the whole row when active */}
        {mobileSearchOpen ? (
          <div className="flex items-center h-16 gap-2 md:hidden">
            <form onSubmit={handleSearchSubmit} className="flex-grow relative">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="Search researchers, papers..."
                value={searchState.query}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-950 placeholder-slate-400"
              />
            </form>
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="flex-shrink-0 p-2.5 rounded-full hover:bg-slate-100 text-slate-500"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">

            {/* Logo — icon-only on mobile, wordmark from sm up */}
            <div className="flex-shrink-0 flex items-center -ml-1 sm:-ml-2">
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
                <span className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white items-center justify-center hidden sm:flex">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </span>
                <span className="font-bold text-base sm:text-xl tracking-tight text-slate-900 whitespace-nowrap">
                  Research <span className="text-blue-600">Connect</span>
                </span>
              </Link>
            </div>

            {/* Quick Links — desktop only */}
            <div className="hidden lg:flex items-center space-x-2 text-xs font-semibold text-slate-600">
              <Link to="/" className="px-3 py-2 rounded-lg hover:bg-slate-55 hover:text-blue-600 transition-all duration-150">Home</Link>
              <Link to="/#research" className="px-3 py-2 rounded-lg hover:bg-slate-55 hover:text-blue-600 transition-all duration-150">Research</Link>
              <Link to="/#communities" className="px-3 py-2 rounded-lg hover:bg-slate-55 hover:text-blue-600 transition-all duration-150">Communities</Link>
            </div>

            {/* Large Global Search — tablet/desktop only */}
            <form onSubmit={handleSearchSubmit} className="flex-grow max-w-xl relative hidden md:block">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search researchers, papers, patents, keywords..."
                value={searchState.query}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-950 placeholder-slate-400 shadow-inner hover:bg-slate-100/50 focus:bg-white transition-all duration-200"
              />
            </form>

            {/* Utility Buttons */}
            <div className="flex items-center gap-0.5">

              {/* Mobile search trigger — hidden once md search bar takes over */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-all md:hidden"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Create Dropdown */}
              <div className="relative" ref={createRef}>
                <button
                  onClick={() => setCreateOpen(!createOpen)}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-full sm:rounded-lg shadow-sm active:scale-[0.98] transition-all"
                  aria-label="Create"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 hidden sm:inline" />
                </button>
                {createOpen && (
                  <div className="fixed inset-x-0 top-16 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-60 bg-white border border-slate-200 sm:rounded-xl rounded-none border-x-0 sm:border-x shadow-lg py-1.5 z-50 text-left text-sm font-semibold text-slate-700 max-h-[70vh] overflow-y-auto">
                    {createLinks.map(({ icon: Icon, label, to }) => (
                      <button
                        key={to}
                        onClick={() => { setCreateOpen(false); navigate(to); }}
                        className="w-full px-4 py-2.5 hover:bg-slate-55 hover:text-blue-600 text-left flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4 text-slate-400" /> {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Requests — collapsed into overflow on small phones, visible from sm up */}
              <div className="relative hidden sm:block" ref={reqRef}>
                <button
                  onClick={() => setReqOpen(!reqOpen)}
                  className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-all relative"
                  title="Requests"
                  aria-label="Requests"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                </button>
                {reqOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4">
                    <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                      <span>Pending Requests</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">2 New</span>
                    </h4>
                    <div className="space-y-3">
                      {mockRequests.map(req => (
                        <div key={req.id} className="text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0 text-left">
                          <p className="font-bold text-slate-800">{req.sender}</p>
                          <p className="text-slate-500 mt-0.5">{req.type}: <span className="font-medium text-slate-700">{req.desc}</span></p>
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => { setReqOpen(false); toast.success('Accepted Request'); }} className="bg-blue-600 text-white font-bold px-3 py-1 rounded-md hover:bg-blue-700">Accept</button>
                            <button onClick={() => setReqOpen(false)} className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-md hover:bg-slate-200">Ignore</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages — original position, hidden on phones (rolled into Notifications panel there) */}
              <button
                onClick={() => dispatch(setChatOpen(true))}
                className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-all relative"
                title="Messages"
                aria-label="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full"></span>
              </button>

              {/* Notifications — always visible, even on smallest phones */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-all relative"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-600 rounded-full"></span>
                </button>
                {notifOpen && (
                  <div className="fixed inset-x-0 top-16 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-80 bg-white border border-slate-200 sm:rounded-xl rounded-none border-x-0 sm:border-x shadow-lg z-50 p-4 max-h-[70vh] overflow-y-auto">
                    <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                      <span>Notifications</span>
                      <button className="text-xs text-blue-600 font-bold hover:underline">Mark all read</button>
                    </h4>
                    <div className="space-y-3">
                      {mockNotifications.map(n => (
                        <div key={n.id} className={`text-xs p-2 rounded-lg text-left ${n.unread ? 'bg-blue-50/50 font-medium' : ''}`}>
                          <p className="text-slate-800">{n.text}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                    {/* Requests rolls into this panel on small phones */}
                    <div className="sm:hidden mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => { setNotifOpen(false); setReqOpen(true); }}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 py-2 rounded-lg"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Requests
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-full border border-slate-200 hover:border-blue-600 hover:bg-slate-50 focus:outline-none transition-all shadow-sm duration-200 group"
                  aria-label="Profile menu"
                >
                  <img
                    src={profile?.profileImage || user?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition-all shrink-0"
                  />
                  <span className="hidden lg:block text-xs font-bold text-slate-700 group-hover:text-blue-600 max-w-[90px] truncate transition-colors duration-150">
                    {user?.fullName?.split(' ')[0] || 'Scholar'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-150 hidden sm:block" />
                </button>
                {profileOpen && (
                  <div className="fixed top-16 right-3 w-64 sm:absolute sm:top-auto sm:right-0 sm:mt-2 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 text-left text-sm font-semibold text-slate-700">
                    <div className="px-4 py-2 border-b border-slate-150">
                      <p className="font-extrabold text-slate-900 truncate">{user?.fullName || 'Researcher'}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-1 grid grid-cols-1 gap-0.5">
                      <Link to={user?.profileSlug ? `/profile/${user.profileSlug}` : '/profile'} onClick={() => setProfileOpen(false)} className="px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
                        <User className="w-4 h-4 text-slate-400" /> My Profile
                      </Link>
                      <Link to="/certificates" onClick={() => setProfileOpen(false)} className="px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
                        <Award className="w-4 h-4 text-slate-400" /> Certificates
                      </Link>
                      <Link to="/achievements" onClick={() => setProfileOpen(false)} className="px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
                        <Award className="w-4 h-4 text-slate-400" /> Achievements
                      </Link>
                      <Link to="/help" onClick={() => setProfileOpen(false)} className="px-4 py-2.5 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
                        <HelpCircle className="w-4 h-4 text-slate-400" /> Help Center
                      </Link>
                    </div>
                    <div className="border-t border-slate-150 pt-1 px-1 pb-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;