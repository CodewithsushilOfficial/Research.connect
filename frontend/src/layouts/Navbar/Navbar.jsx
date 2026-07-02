import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMobileMenu, closeMobileMenu } from '../../redux/slices/appSlice';
import { Menu, X, Share2, Bell, User as UserIcon, LogOut } from 'lucide-react';
import Button from '../../components/common/buttons/Button';
import { logoutSuccess } from '../../redux/slices/authSlice';
import authService from '../../services/auth.service';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isMobileMenuOpen } = useSelector((state) => state.app);
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  const landingLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'Researchers', path: '/#researchers' },
    { name: 'About', path: '/#about' },
    { name: 'Contact', path: '/#contact' }
  ];

  const dashboardLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/profile' },
    { name: 'Notifications', path: '/notifications' }
  ];

  const navLinks = isAuthenticated ? dashboardLinks : landingLinks;

  const handleLogoClick = () => {
    dispatch(closeMobileMenu());
    navigate('/');
  };

  function ProfileMenu({ user }) {
    const dispatchLocal = useDispatch();
    const nav = useNavigate();
    const [open, setOpen] = React.useState(false);

    const initials = user ? ((user.firstName || '').charAt(0) + (user.lastName || '').charAt(0)).toUpperCase() : 'Q';

    const handleLogout = async () => {
      try {
        await authService.logout(localStorage.getItem('token'));
      } catch (e) {
        console.warn('Logout API failed, continuing to clear local state', e);
      }
      dispatchLocal(logoutSuccess());
      nav('/');
    };

    return (
      <div className="relative">
        <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-bg-page">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-sm font-semibold flex items-center justify-center">{initials}</div>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg py-2 z-50">
            <button onClick={() => { setOpen(false); nav('/profile'); }} className="w-full text-left px-3 py-2 text-sm hover:bg-bg-page flex items-center gap-2"><UserIcon className="w-4 h-4" />Profile</button>
            <div className="border-t border-border my-1" />
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-bg-page flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <nav className="sticky top-0 z-50 glass-nav shadow-sm">
      <div className="w-full px-6 lg:px-8">
  <div className="h-16 grid grid-cols-[220px_1fr_420px_100px] items-center gap-6">
          {/* Logo */}
          <div className="flex items-center">
  <Link
    to="/"
    onClick={handleLogoClick}
    className="flex items-center gap-3"
  >
    <span className="p-2 rounded-xl bg-gradient-primary text-white">
      <Share2 className="w-5 h-5" />
    </span>

    <span className="font-bold text-2xl">
      Research<span className="text-primary">Connect</span>
    </span>
  </Link>
</div>

          {/* Desktop Nav links */}
          <div className="hidden md:flex justify-center">
  <div className="flex items-center gap-10">
    {navLinks.map((link) => (
      <Link
        key={link.name}
        to={link.path}
        className="font-medium text-[15px] text-text-secondary hover:text-primary transition"
      >
        {link.name}
      </Link>
    ))}
  </div>
</div>

          {/* Center search (desktop) */}
          <div className="hidden lg:flex justify-center">
  <form
    onSubmit={(e) => {
      e.preventDefault();
      const q = e.target.elements.q.value.trim();

      if (q)
        navigate(`/search?q=${encodeURIComponent(q)}`);
    }}
    className="w-full"
  >
    <input
      name="q"
      type="text"
      placeholder="Search researchers, publications, keywords..."
      className="w-full h-11 rounded-xl border border-gray-200 px-5 text-sm outline-none focus:ring-2 focus:ring-primary"
    />
  </form>
</div>

          {/* Action buttons */}
          <div className="hidden md:flex justify-end items-center gap-4">

  {isAuthenticated ? (
    <>
      <button
        onClick={() => navigate("/notifications")}
        className="p-2 rounded-lg hover:bg-gray-100"
      >
        <Bell className="w-5 h-5" />
      </button>

      <ProfileMenu user={user} />
    </>
  ) : (
    <>
      <Button
        variant="ghost"
        onClick={() => navigate("/login")}
      >
        Login
      </Button>

      <Button
        variant="primary"
        onClick={() => navigate("/register")}
      >
        Sign Up
      </Button>
    </>
  )}

</div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="text-text-secondary hover:text-text-primary focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-nav border-t border-border py-4 px-6 space-y-4 shadow-inner">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                onClick={() => dispatch(closeMobileMenu())}
                className="text-base font-medium text-text-secondary hover:text-primary transition-colors py-2"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    dispatch(closeMobileMenu());
                    navigate('/profile');
                  }}
                >
                  Profile
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    dispatch(closeMobileMenu());
                    navigate('/notifications');
                  }}
                >
                  Notifications
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    dispatch(closeMobileMenu());
                    navigate('/login');
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    dispatch(closeMobileMenu());
                    navigate('/register');
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
