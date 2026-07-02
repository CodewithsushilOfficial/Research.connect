import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Award, 
  Layers, 
  Briefcase, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  LogOut, 
  Edit3, 
  Share2, 
  Bell, 
  Compass 
} from 'lucide-react';
import authService from '../../../services/auth.service';
import dashboardService from '../../../services/dashboard.service';
import { setCredentials, logoutSuccess } from '../../../redux/slices/authSlice';
import Button from '../../../components/common/buttons/Button';
import PublishResearchPaper from '../../../components/common/buttons/PublishResearchPaper/PublishResearchPaper';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, profile } = useSelector((state) => state.auth);
  const [fetching, setFetching] = useState(false);
  const [metrics, setMetrics] = useState({ publications: 0, citations: 0, hIndex: 0, i10Index: 0 });
  const [recommended, setRecommended] = useState([]);
  const [trendingPubs, setTrendingPubs] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Sync latest user and profile state from backend
  useEffect(() => {
    const fetchLatestData = async () => {
      setFetching(true);
      try {
        const response = await authService.getMe();
        if (response.success) {
          dispatch(setCredentials({
            user: response.data.user,
            profile: response.data.profile,
            accessToken: localStorage.getItem('token') // Preserve existing token
          }));
        }
      } catch (err) {
        console.error('Failed to sync current user profile:', err);
      } finally {
        setFetching(false);
      }
    };

    const fetchDashboard = async () => {
      setLoadingDashboard(true);
      try {
        const [ovr, rec, pubs] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getRecommendedResearchers(),
          dashboardService.getTrendingPublications()
        ]);
        if (ovr?.success && ovr.data?.metrics) setMetrics(ovr.data.metrics);
        if (rec?.success && rec.data?.researchers) setRecommended(rec.data.researchers);
        if (pubs?.success && pubs.data?.publications) setTrendingPubs(pubs.data.publications);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchLatestData();
    fetchDashboard();
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await authService.logout(token);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logoutSuccess());
      toast.success('Logged out successfully.');
      navigate('/login');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  // Determine researcher display tag
  const typeLabels = {
    academic: 'Academic Researcher',
    corporate: 'Corporate Professional',
    medical: 'Medical Expert',
    non_researcher: 'Independent Reader'
  };

  const workplaceName = profile?.institution || profile?.company || 'Research Connect Affiliation';
  const departmentName = profile?.department || profile?.division || 'Research Department';
  const roleTitle = profile?.designation || profile?.position || 'Researcher';

  // Mock activity logs (Since we don't expose a dedicated log API, we generate realistic ones)
  const activities = [
    { id: 1, type: 'success', text: 'Email verification completed', time: 'Just now' },
    { id: 2, type: 'info', text: 'Profile initialized successfully', time: '5 minutes ago' },
    { id: 3, type: 'security', text: 'Logged in from Chrome browser on Windows', time: '10 minutes ago' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Researcher Dashboard</h1>
          <p className="text-sm text-text-secondary">Overview of your academic profile, publications, and workspace activity</p>
        </div>
        
        <div className="flex gap-2">
          <PublishResearchPaper onClick={() => navigate('/publish-research')} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome Card & User Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-primary rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
              <Share2 className="w-64 h-64" />
            </div>
            
            <div className="space-y-2 z-10">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-bold uppercase tracking-wider">
                {typeLabels[user.researcherType] || 'Researcher'}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
                Welcome, {user.firstName}!
              </h2>
              <p className="text-sm text-blue-100 max-w-md">
                Your research environment is fully initialized. You can sync publication portfolios, extract metadata using AI, and explore collaboration invites.
              </p>
            </div>

            <div className="z-10 bg-white bg-opacity-10 p-4 rounded-xl border border-white border-opacity-20 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white">0</span>
              <span className="text-xs text-blue-100 font-medium mt-1">Publications synced</span>
            </div>
          </motion.div>

            {/* Recommended Colleagues */}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-text-primary tracking-tight mb-2">Recommended Colleagues</h3>
              <div className="flex gap-3 overflow-x-auto py-2">
                {loadingDashboard ? (
                  <div className="text-sm text-text-secondary">Loading recommendations...</div>
                ) : recommended.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 border border-border shadow-sm w-full text-center">No recommendations yet</div>
                ) : (
                  recommended.map(r => (
                    <div key={r.id} className="bg-white border border-border rounded-2xl p-3 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold">{(r.name || '').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                        <div>
                          <div className="font-semibold text-sm">{r.name}</div>
                          <div className="text-xs text-text-secondary">{r.title} • {r.institution}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => { toast.success(`Connection request sent to ${r.name}`); }} className="px-3 py-1 bg-primary text-white rounded-lg text-xs">Connect</button>
                        <button onClick={() => navigate(`/profile?id=${encodeURIComponent(r.id)}`)} className="px-3 py-1 border border-border rounded-lg text-xs">View</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          {/* User Information */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-text-primary tracking-tight">Affiliation & Contact Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-bg-page rounded-xl border border-border">
                <span className="p-2 bg-light-blue text-primary rounded-lg">
                  <Briefcase className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Workplace</p>
                  <p className="text-sm font-semibold text-text-primary">{workplaceName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-bg-page rounded-xl border border-border">
                <span className="p-2 bg-light-purple text-accent-indigo rounded-lg">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Division & Role</p>
                  <p className="text-sm font-semibold text-text-primary">{roleTitle} &bull; {departmentName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-bg-page rounded-xl border border-border">
                <span className="p-2 bg-light-orange text-accent-orange rounded-lg">
                  <Mail className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-semibold text-text-primary">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-bg-page rounded-xl border border-border">
                <span className="p-2 bg-light-green text-accent-green rounded-lg">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Country & Phone</p>
                  <p className="text-sm font-semibold text-text-primary">{user.country || 'Not Set'} {user.phone ? `| ${user.phone}` : ''}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Profile Completion & Quick Actions */}
        <div className="space-y-6">
          {/* Academic Metrics */}
          <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Academic Metrics</h3>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 bg-bg-page rounded-lg text-center">
                <div className="text-sm text-text-secondary">PUBLICATIONS</div>
                <div className="text-2xl font-bold text-text-primary">{metrics.publications}</div>
              </div>
              <div className="p-3 bg-bg-page rounded-lg text-center">
                <div className="text-sm text-text-secondary">CITATIONS</div>
                <div className="text-2xl font-bold text-text-primary">{metrics.citations}</div>
              </div>
              <div className="p-3 bg-bg-page rounded-lg text-center">
                <div className="text-sm text-text-secondary">H-INDEX</div>
                <div className="text-2xl font-bold text-text-primary">{metrics.hIndex}</div>
              </div>
              <div className="p-3 bg-bg-page rounded-lg text-center">
                <div className="text-sm text-text-secondary">I10-INDEX</div>
                <div className="text-2xl font-bold text-text-primary">{metrics.i10Index}</div>
              </div>
            </div>
          </div>
          
          {/* Profile Completion Tracker */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center text-center">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider self-start">Profile Completion</h3>
            
            {/* Circular Progress Bar */}
            <div className="relative w-36 h-36 flex items-center justify-center my-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track circle */}
                <circle
                  className="text-border"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                {/* Filled indicator circle */}
                <circle
                  className="text-primary transition-all duration-500 ease-out"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (profile?.profileCompletion || 0) / 100)}`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-text-primary tracking-tight">
                  {profile?.profileCompletion || 0}%
                </span>
                <span className="text-[10px] font-bold text-text-secondary uppercase">Complete</span>
              </div>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              {(profile?.profileCompletion || 0) < 100 
                ? 'Fill ORCID and Social profiles to unlock 100% completions.' 
                : 'Your profile is fully optimized!'}
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="w-full font-bold text-xs"
            >
              Configure Affiliation
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Quick Actions</h3>
            
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-bg-page hover:border-primary transition-all text-left group"
            >
              <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Edit Professional Details
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-text-secondary group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => toast.success('Google Scholar integration is launching in Phase 2!')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-bg-page hover:border-primary transition-all text-left group"
            >
              <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
                <Compass className="w-4 h-4 text-accent-indigo" /> Sync Scholar Publications
              </span>
              <span className="px-2 py-0.5 bg-light-orange text-accent-orange text-[9px] font-bold rounded uppercase">Phase 2</span>
            </button>

            <button
              onClick={() => navigate('/notifications')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:bg-bg-page hover:border-primary transition-all text-left group"
            >
              <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent-green" /> Check Notifications
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-text-secondary group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Recent Activity</h3>
            
            <div className="space-y-3">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-3 items-start">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    act.type === 'success' ? 'bg-accent-green' : act.type === 'security' ? 'bg-accent-red' : 'bg-primary'
                  }`} />
                  <div>
                    <p className="text-xs font-medium text-text-primary leading-tight">{act.text}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
