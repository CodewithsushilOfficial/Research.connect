import React, { useState, useEffect } from 'react';
import { 
  Award, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Plus, 
  CheckCircle2, 
  ExternalLink,
  BookOpen, 
  User,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  BookMarked,
  Share2,
  Bookmark,
  ChevronDown,
  Trash2,
  Link2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useScholarImport } from '../../hooks/auth.hooks';
import api from '../../services/api';
import ScholarImportWizard from '../../features/profile/ScholarImportWizard.jsx';
import EditProfileModal from '../../features/profile/EditProfileModal.jsx';
import SyncMergeModal from '../../features/profile/SyncMergeModal.jsx';

const ProfilePage = () => {
  const { user } = useAuth();
  const { importProfile, loading: importLoading, error: importError } = useScholarImport();

  const [profileData, setProfileData] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scholarStatus, setScholarStatus] = useState(null);
  
  const [activeTab, setActiveTab] = useState('About');
  const [scholarIdInput, setScholarIdInput] = useState('');
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const tabs = ['About', 'Education', 'Experience', 'Research Interests', 'Publications', 'Projects', 'Achievements'];

  const handleUnlink = async (provider) => {
    if (window.confirm(`Are you sure you want to unlink your ${provider}?`)) {
      setLoading(true);
      try {
        if (provider === 'Google Scholar') {
          await api.delete('/profile/google-scholar/unlink');
        } else {
          // Clear field by updating profile
          const updatedAcademic = { ...profileData?.academicProfile };
          if (provider === 'ORCID') updatedAcademic.orcid = '';
          if (provider === 'Scopus') updatedAcademic.scopusId = '';
          if (provider === 'LinkedIn') updatedAcademic.linkedIn = '';
          if (provider === 'ResearchGate') updatedAcademic.researchGate = '';
          
          await api.put('/profile', {
            ...profileData,
            academicProfile: updatedAcademic
          });
        }
        await fetchProfileDetails();
        alert(`${provider} unlinked successfully.`);
      } catch (err) {
        alert(err.response?.data?.message || 'Unlink failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefreshSync = async (provider, syncEndpoint, payload) => {
    setLoading(true);
    try {
      if (provider === 'Google Scholar') {
        await api.put('/profile/google-scholar/sync');
      } else {
        await api.post(syncEndpoint, payload);
      }
      await fetchProfileDetails();
      alert(`${provider} synchronized successfully.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Sync failed.');
    } finally {
      setLoading(false);
    }
  };

  const identityProviders = [
    {
      name: 'ORCID',
      connected: !!profileData?.academicProfile?.orcid,
      value: profileData?.academicProfile?.orcid,
      url: profileData?.academicProfile?.orcid ? `https://orcid.org/${profileData.academicProfile.orcid}` : null,
      syncEndpoint: '/profile/import/orcid',
      syncPayload: { orcidId: profileData?.academicProfile?.orcid },
    },
    {
      name: 'Google Scholar',
      connected: !!profileData?.academicProfile?.googleScholar,
      value: profileData?.academicProfile?.googleScholar,
      url: profileData?.academicProfile?.googleScholar ? `https://scholar.google.com/citations?user=${profileData.academicProfile.googleScholar}` : null,
      syncEndpoint: '/profile/google-scholar/sync',
      syncPayload: {},
    },
    {
      name: 'Scopus',
      connected: !!profileData?.academicProfile?.scopusId,
      value: profileData?.academicProfile?.scopusId,
      url: profileData?.academicProfile?.scopusId ? `https://www.scopus.com/authid/detail.uri?authorId=${profileData.academicProfile.scopusId}` : null,
      syncEndpoint: '/profile/scopus',
      syncPayload: { scopusId: profileData?.academicProfile?.scopusId },
    },
    {
      name: 'LinkedIn',
      connected: !!profileData?.academicProfile?.linkedIn,
      value: profileData?.academicProfile?.linkedIn,
      url: profileData?.academicProfile?.linkedIn ? (profileData.academicProfile.linkedIn.startsWith('http') ? profileData.academicProfile.linkedIn : `https://linkedin.com/in/${profileData.academicProfile.linkedIn}`) : null,
      syncEndpoint: '/profile/import/linkedin',
      syncPayload: { linkedinUrl: profileData?.academicProfile?.linkedIn },
    },
    {
      name: 'ResearchGate',
      connected: !!profileData?.academicProfile?.researchGate || !!profileData?.socialLinks?.researchgate,
      value: profileData?.academicProfile?.researchGate || profileData?.socialLinks?.researchgate,
      url: (profileData?.academicProfile?.researchGate || profileData?.socialLinks?.researchgate) ? `https://researchgate.net/profile/${profileData.academicProfile?.researchGate || profileData.socialLinks?.researchgate}` : null,
    },
    {
      name: 'GitHub',
      connected: !!profileData?.socialLinks?.github,
      value: profileData?.socialLinks?.github,
      url: profileData?.socialLinks?.github ? (profileData.socialLinks.github.startsWith('http') ? profileData.socialLinks.github : `https://github.com/${profileData.socialLinks.github}`) : null,
    },
    {
      name: 'Website',
      connected: !!profileData?.website,
      value: profileData?.website,
      url: profileData?.website,
    }
  ];

  // Fetch real profile details and publications on mount
  const fetchProfileDetails = async () => {
    try {
      const response = await api.get('/profile/me');
      setProfileData(response.data.profile);
      setPublications(response.data.publications || []);

      // Fetch Google Scholar connection status
      try {
        const statusRes = await api.get('/profile/google-scholar/status');
        setScholarStatus(statusRes.data);
      } catch (err) {
        console.error('Failed to load Google Scholar status:', err);
      }
    } catch (err) {
      console.error('Failed to load profile details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [user]); // Re-fetch whenever context user changes

  const handleScholarImport = async (e) => {
    e.preventDefault();
    if (!scholarIdInput.trim()) return;
    
    let authorId = scholarIdInput.trim();
    if (authorId.includes('user=')) {
      authorId = authorId.split('user=')[1].split('&')[0];
    } else if (authorId.includes('author/')) {
      authorId = authorId.split('author/')[1].split('?')[0];
    }

    const result = await importProfile(authorId);
    if (result.success) {
      setImportSuccess(true);
      setScholarIdInput('');
      fetchProfileDetails(); // Force reload local state
      setTimeout(() => setImportSuccess(false), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-medium">Loading profile details...</p>
      </div>
    );
  }

  // Fallbacks mapping to Google Scholar mock data or real profiles
  const fullName = profileData?.user?.fullName || 'Sushil Kumar kushwaha';
  const designation = profileData?.designation || 'Associate Professor';
  const department = profileData?.department || 'Department of Computer Science & Engineering';
  const institution = profileData?.institution || 'Amity University';
  const locationText = profileData?.city && profileData?.country 
    ? `${profileData.city}, ${profileData.country}` 
    : (profileData?.country && profileData.country !== 'Not Specified' ? profileData.country : 'Noida, India');
  
  const bioText = profileData?.bio || 'I am an Associate Professor specializing in Machine Learning, Deep Learning, and Natural Language Processing. My research focuses on developing intelligent systems that solve real-world problems. I have published extensively in top-tier journals and conferences and actively collaborate on interdisciplinary research projects.';
  const emailText = profileData?.user?.email || 'sushil.kushwaha@amity.edu';
  
  return (
    <div className="flex flex-col gap-8">
      {/* Google Scholar Sync Banner Card */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-200/30 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" /> Google Scholar Integration
            {scholarStatus?.connected && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                scholarStatus.syncStatus === 'synced'
                  ? 'bg-green-50 text-green-700 border-green-200/50'
                  : 'bg-amber-50 text-amber-700 border-amber-200/50'
              }`}>
                {scholarStatus.syncStatus}
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-500 max-w-xl">
            {scholarStatus?.connected 
              ? `Connected with Scholar ID: ${scholarStatus.providerUserId}. Last synced: ${
                  scholarStatus.lastSyncedAt 
                    ? new Date(scholarStatus.lastSyncedAt).toLocaleString() 
                    : 'Never'
                }`
              : 'Auto-populate your academic metrics, citations index, co-authors network, and papers directly from your Google Scholar profile.'}
          </p>
        </div>
        
        {scholarStatus?.connected ? (
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setShowSyncModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-blue-500/10"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" /> Sync Latest
            </button>
            <button 
              onClick={async () => {
                if (window.confirm('Are you sure you want to unlink your Google Scholar profile?')) {
                  setLoading(true);
                  try {
                    await api.delete('/profile/google-scholar/unlink');
                    await fetchProfileDetails();
                    alert('Google Scholar profile unlinked.');
                  } catch (err) {
                    alert(err.response?.data?.message || 'Unlink failed.');
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              className="px-4 py-2 border border-red-200 hover:bg-red-55 text-red-600 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Unlink Account
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowImportPanel(!showImportPanel)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-sm shadow-blue-500/10"
          >
            <RefreshCw className="w-4 h-4" /> Link Profile Now
          </button>
        )}
      </div>

      {/* Interactive Scholar Import Input Panel */}
      {showImportPanel && !profileData?.academicProfile?.googleScholar && (
        <ScholarImportWizard 
          onImportComplete={async () => {
            setShowImportPanel(false);
            setLoading(true);
            await fetchProfileDetails();
            alert('Import completed successfully!');
          }}
          onCancel={() => setShowImportPanel(false)}
        />
      )}

      {/* Main Profile Header Banner */}
      <div className="glass-card rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-sm relative transition-all duration-300 hover:shadow-md">
        {/* Cover Photo */}
        <div className="h-64 sm:h-72 bg-slate-100 relative overflow-hidden group">
          <img 
            src={profileData?.coverPhoto || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200'}
            alt="Cover Banner"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
        </div>

        {/* Profile Details Container */}
        <div className="px-8 pb-8 pt-0 flex flex-col md:flex-row items-start gap-6 text-left relative -mt-20 z-10">
          {/* Profile Photo */}
          <div className="relative shrink-0 group">
            <img 
              src={profileData?.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
              alt={fullName}
              className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl bg-white group-hover:border-blue-600 transition-all duration-300"
            />
            {profileData?.academicProfile?.googleScholar && (
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow-md animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </span>
            )}
          </div>

          {/* User Text Info */}
          <div className="flex-1 pt-20 md:pt-24 space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 leading-none font-display">
                  {fullName}
                  <CheckCircle2 className="w-6 h-6 text-blue-600 fill-blue-50/50 hover:scale-110 transition-transform cursor-pointer" />
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/50 rounded-full text-[9px] font-extrabold tracking-wider uppercase font-sans">
                    Score {profileData?.profileCompletion || 92}%
                  </span>
                </h2>
                <p className="text-sm font-bold text-blue-600 mt-2 font-sans tracking-wide uppercase">{designation}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  Edit Profile
                </button>
                <button className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 cursor-pointer">
                  Share Profile
                </button>
                <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 cursor-pointer shadow-md shadow-slate-900/10">
                  Follow
                </button>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 cursor-pointer shadow-md shadow-indigo-500/10">
                  Collaborate
                </button>
              </div>
            </div>

            {/* Department Details */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-sans">
              <span className="flex items-center gap-1.5 font-medium"><Briefcase className="w-4 h-4 text-slate-400" /> {department}</span>
              <span className="flex items-center gap-1.5 font-medium"><Award className="w-4 h-4 text-slate-400" /> {institution}</span>
              <span className="flex items-center gap-1.5 font-medium"><MapPin className="w-4 h-4 text-slate-400" /> {locationText}</span>
            </div>

            {/* Academic Social Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {identityProviders.map((provider) => (
                <div key={provider.name} className="relative group">
                  <button className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1.5 border transition-all ${
                    provider.connected 
                      ? 'bg-green-50/60 text-green-700 border-green-200/50 hover:bg-green-100/60 shadow-sm' 
                      : 'bg-slate-50/50 text-slate-400 border-slate-200/40 hover:bg-slate-100/50'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${provider.connected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                    {provider.name}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-1.5 z-40 min-w-[140px] border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                    {provider.connected ? (
                      <>
                        {provider.url && (
                          <a href={provider.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-slate-700 transition-colors text-xs font-semibold">
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" /> Open Profile
                          </a>
                        )}
                        {provider.syncEndpoint && (
                          <button 
                            onClick={() => handleRefreshSync(provider.name, provider.syncEndpoint, provider.syncPayload)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-slate-700 text-left transition-colors cursor-pointer text-xs font-semibold"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Refresh Sync
                          </button>
                        )}
                        <button 
                          onClick={() => handleUnlink(provider.name)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 text-left transition-colors cursor-pointer text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" /> Unlink Account
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setShowEditModal(true)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-blue-600 text-left transition-colors cursor-pointer text-xs font-semibold"
                      >
                        <Link2 className="w-3.5 h-3.5 text-blue-500" /> Link Account
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="border-t border-slate-100 px-8 flex overflow-x-auto gap-6 shrink-0 bg-slate-50/50">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Changes dynamically based on activeTab) */}
        <div className="lg:col-span-2 flex flex-col gap-8 text-left">
          
          {activeTab === 'About' && (
            <>
              {/* About Section */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-display">About Me</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-sans">{bioText}</p>
                <a href="#" className="text-xs font-bold text-blue-600 hover:underline inline-block">Read more</a>
              </div>

              {/* Academic & Professional Information Details */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900 font-display">Academic & Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-sans">
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Full Name</span>
                      <span className="font-semibold text-slate-800">{profileData?.user?.fullName || 'Sushil Kumar kushwaha'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Date of Birth</span>
                      <span className="font-semibold text-slate-800">
                        {profileData?.dateOfBirth 
                          ? new Date(profileData.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) 
                          : '15 March 1985'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Designation</span>
                      <span className="font-semibold text-slate-800">{profileData?.designation || 'Associate Professor'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Department</span>
                      <span className="font-semibold text-slate-800">
                        {profileData?.department || 'Department of Computer Science & Engineering'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Institution</span>
                      <span className="font-semibold text-slate-800">{profileData?.institution || 'Amity University'}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">ORCID ID</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        {profileData?.academicProfile?.orcid || '0000-0002-1234-5678'} <ExternalLink className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Google Scholar</span>
                      <span className="font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                        {profileData?.academicProfile?.googleScholar || 'TYQH3qYAAAAJ'} <ExternalLink className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Scopus ID</span>
                      <span className="font-semibold text-slate-800">{profileData?.academicProfile?.scopusId || '57219908847'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">LinkedIn</span>
                      <a 
                        href={profileData?.academicProfile?.linkedIn || 'https://linkedin.com'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        View Profile <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">GitHub</span>
                      <span className="font-semibold text-slate-800 hover:underline flex items-center gap-1 cursor-pointer">
                        {profileData?.socialLinks?.github || 'github.com/arjunsharma'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-display">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</span>
                      <span className="font-semibold text-slate-800 truncate">{emailText}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</span>
                      <span className="font-semibold text-slate-800">+91 98765 43210</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Website</span>
                      <span className="font-semibold text-blue-600 hover:underline truncate cursor-pointer">
                        https://sushilkumar.in
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Education Timeline Section */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" /> Education
                  </h3>
                  <button onClick={() => setShowEditModal(true)} className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                    Manage
                  </button>
                </div>
                <div className="space-y-6 relative pl-6 border-l border-slate-100 ml-4 text-left">
                  {profileData?.educationList && profileData.educationList.length > 0 ? (
                    profileData.educationList.map((edu) => (
                      <div key={edu._id} className="relative group transition-all duration-300">
                        <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50 shadow-sm"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm font-sans">{edu.degree}</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-1">
                              {edu.university} • {edu.fieldOfStudy}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200/50 rounded-xl text-[10px] font-bold self-start sm:self-center">
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </span>
                        </div>
                        {edu.description && (
                          <p className="text-xs text-slate-400 mt-2 font-sans italic leading-relaxed">{edu.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    [
                      {
                        degree: 'Ph.D. in Computer Science & Engineering',
                        university: 'Amity University',
                        fieldOfStudy: 'Artificial Intelligence',
                        startYear: 2011,
                        endYear: 2016,
                        description: 'Thesis on Deep Learning Optimizations and Neural Architectures.'
                      },
                      {
                        degree: 'M.Tech. in Computer Science',
                        university: 'Indian Institute of Technology, Delhi',
                        fieldOfStudy: 'Computer Engineering',
                        startYear: 2009,
                        endYear: 2011,
                      },
                      {
                        degree: 'B.Tech. in Computer Science',
                        university: 'Delhi Technological University',
                        fieldOfStudy: 'Information Technology',
                        startYear: 2005,
                        endYear: 2009,
                      }
                    ].map((edu, idx) => (
                      <div key={idx} className="relative group transition-all duration-300">
                        <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50 shadow-sm"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm font-sans">{edu.degree}</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-1 font-sans">
                              {edu.university} • {edu.fieldOfStudy}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200/50 rounded-xl text-[10px] font-bold self-start sm:self-center">
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </span>
                        </div>
                        {edu.description && (
                          <p className="text-xs text-slate-400 mt-2 font-sans italic leading-relaxed">{edu.description}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Experience Timeline Section */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-600" /> Experience
                  </h3>
                  <button onClick={() => setShowEditModal(true)} className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                    Manage
                  </button>
                </div>
                <div className="space-y-6 relative pl-6 border-l border-slate-100 ml-4 text-left">
                  {profileData?.experienceList && profileData.experienceList.length > 0 ? (
                    profileData.experienceList.map((exp) => (
                      <div key={exp._id} className="relative group transition-all duration-300">
                        <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50 shadow-sm"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm font-sans">{exp.role}</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-1">
                              {exp.organization} • {exp.department || exp.employmentType}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200/50 rounded-xl text-[10px] font-bold self-start sm:self-center">
                            {exp.startYear} - {exp.endYear || 'Present'}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-slate-400 mt-2 font-sans italic leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    [
                      {
                        role: 'Associate Professor',
                        organization: 'Amity University',
                        department: 'Department of Computer Science & Engineering',
                        employmentType: 'full-time',
                        startYear: 2016,
                        endYear: null,
                        description: 'Teaching graduate classes in Deep Learning and Sensor Routing. Supervising Ph.D. candidates.'
                      },
                      {
                        role: 'Assistant Professor',
                        organization: 'IIT Delhi',
                        department: 'Department of Computer Science',
                        employmentType: 'full-time',
                        startYear: 2013,
                        endYear: 2016,
                      },
                      {
                        role: 'Research Scientist',
                        organization: 'TCS Research, Bangalore',
                        department: 'Innovation Lab',
                        employmentType: 'full-time',
                        startYear: 2011,
                        endYear: 2013,
                      }
                    ].map((exp, idx) => (
                      <div key={idx} className="relative group transition-all duration-300">
                        <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50 shadow-sm"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm font-sans">{exp.role}</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-1 font-sans">
                              {exp.organization} • {exp.department || exp.employmentType}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200/50 rounded-xl text-[10px] font-bold self-start sm:self-center">
                            {exp.startYear} - {exp.endYear || 'Present'}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-slate-400 mt-2 font-sans italic leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Research Interests Card */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" /> Research Interests
                  </h3>
                  <button onClick={() => setShowEditModal(true)} className="text-xs font-semibold text-blue-650 text-blue-600 hover:underline cursor-pointer">
                    Manage
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-left">
                  {profileData?.researchAreas && profileData.researchAreas.length > 0 ? (
                    profileData.researchAreas.map((area) => (
                      <span key={area._id} className="px-3.5 py-2 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all">
                        {area.researchArea?.areaName}
                      </span>
                    ))
                  ) : (
                    ['Wireless Sensor Network', 'Routing Protocol', 'Security', 'IoT', 'Artificial Intelligence', 'Deep Learning', 'Natural Language Processing'].map((area) => (
                      <span key={area} className="px-3.5 py-2 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all">
                        {area}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Publications Section */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" /> Publications
                  </h3>
                  <button onClick={() => setActiveTab('Publications')} className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                    View All ({publications.length})
                  </button>
                </div>
                <div className="space-y-6 divide-y divide-slate-100 text-left">
                  {publications.length > 0 ? (
                    publications.slice(0, 3).map((pub) => (
                      <div key={pub._id} className="pt-5 first:pt-0 space-y-2.5">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-bold text-slate-800 text-sm hover:text-blue-600 hover:underline cursor-pointer leading-snug">
                            {pub.title}
                          </h4>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-lg text-[9px] font-extrabold shrink-0">
                            {pub.citationCount} citations
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{pub.abstract}</p>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium">
                          {pub.journal && <span className="italic">{pub.journal}</span>}
                          <span>Year: {pub.publicationYear}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    [
                      {
                        title: 'Energy-Efficient Clustering and Routing Algorithms in Wireless Sensor Networks',
                        abstract: 'This paper proposes a hybrid cluster head selection algorithm that reduces energy dissipation in remote network setups and improves lifetime constraints.',
                        journal: 'IEEE Transactions on Wireless Communications',
                        publicationYear: 2022,
                        citationCount: 45,
                      },
                      {
                        title: 'An Autonomous Sensor Node Recovery Protocol for IoT-enabled Cities',
                        abstract: 'We introduce an autogenous recovery protocol that enables fast packet re-routing in degraded network topologies under dynamic environments.',
                        journal: 'ACM Computing Surveys',
                        publicationYear: 2020,
                        citationCount: 28,
                      }
                    ].map((pub, idx) => (
                      <div key={idx} className="pt-5 first:pt-0 space-y-2.5">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-bold text-slate-800 text-sm hover:text-blue-650 hover:underline cursor-pointer leading-snug">
                            {pub.title}
                          </h4>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-lg text-[9px] font-extrabold shrink-0">
                            {pub.citationCount} citations
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{pub.abstract}</p>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium">
                          {pub.journal && <span className="italic">{pub.journal}</span>}
                          <span>Year: {pub.publicationYear}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Projects Card */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" /> Projects
                  </h3>
                  <button onClick={() => setShowEditModal(true)} className="text-xs font-semibold text-blue-650 text-blue-600 hover:underline cursor-pointer">
                    Manage
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {[
                    {
                      title: 'Intelligent Routing Protocols for WSNs',
                      desc: 'Designing energy-efficient node cluster algorithms for large-scale heterogeneous networks.',
                      funding: '$45,000',
                      status: 'Active',
                    },
                    {
                      title: 'IoT-enabled Smart Cities Architecture',
                      desc: 'Collaboration on mesh routing frameworks for node recovery under dense city structures.',
                      funding: '$32,000',
                      status: 'Completed',
                    }
                  ].map((proj, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:shadow-sm transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wide ${
                          proj.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200/30' : 'bg-slate-200/50 text-slate-600'
                        }`}>
                          {proj.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{proj.funding}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs">{proj.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{proj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements Card */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                    <Award className="w-5 h-5 text-rose-500" /> Achievements
                  </h3>
                  <button onClick={() => setShowEditModal(true)} className="text-xs font-semibold text-blue-650 text-blue-600 hover:underline cursor-pointer">
                    Manage
                  </button>
                </div>
                <div className="space-y-4 text-left">
                  {[
                    {
                      title: 'IEEE Senior Member Designation',
                      desc: 'Awarded for significant contributions to wireless communication protocols.',
                      year: '2023'
                    },
                    {
                      title: 'Best Research Paper Award',
                      desc: 'Honored at the IEEE International Conference on Communications (ICC 2022).',
                      year: '2022'
                    },
                    {
                      title: 'Outstanding Faculty Researcher',
                      desc: 'Recognized by Amity University for high-impact publication metrics.',
                      year: '2021'
                    }
                  ].map((ach, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-xs leading-none">{ach.title}</h4>
                          <span className="text-[9px] font-bold text-slate-400">{ach.year}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{ach.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'Publications' && (
            <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 font-display">Publications ({publications.length})</h3>
                <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Publication
                </button>
              </div>

              {publications.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <BookMarked className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-500 font-medium">No publications found.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try syncing your Google Scholar profile at the top of the dashboard to auto-populate your publications.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 divide-y divide-slate-100">
                  {publications.map((pub, idx) => (
                    <div key={pub._id} className={`pt-6 ${idx === 0 ? 'pt-0' : ''} space-y-3 text-left group`}>
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                          {pub.title}
                        </h4>
                        
                        {/* Citations Badge */}
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-xl text-[10px] font-bold shrink-0">
                          {pub.citationCount} citations
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-sans">
                        {pub.abstract}
                      </p>

                      {/* Co-authors list */}
                      {pub.authors && pub.authors.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400 font-sans">
                          <span className="font-semibold text-slate-500">Authors:</span>
                          {pub.authors.map((author, index) => {
                            // Highlight the current user in bold
                            const isCurrentUser = author.user === user?.user?._id || author.authorName.toLowerCase().includes(fullName.toLowerCase());
                            return (
                              <span key={author._id}>
                                <span className={`${isCurrentUser ? 'font-bold text-blue-600' : 'text-slate-500'}`}>
                                  {author.authorName}
                                </span>
                                {index < pub.authors.length - 1 && ', '}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Paper details footer */}
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-medium font-sans">
                        {pub.journal && (
                          <span className="italic">{pub.journal}</span>
                        )}
                        <span>Year: {pub.publicationYear}</span>
                        {pub.doi && (
                          <span className="hover:text-blue-600 cursor-pointer flex items-center gap-0.5">
                            DOI: {pub.doi} <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {pub.pdfUrl && (
                          <a 
                            href={pub.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            View PDF <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Education' && (
            <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 font-display">Education History</h3>
                <button onClick={() => setShowEditModal(true)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Manage Education
                </button>
              </div>
              <div className="space-y-8 relative pl-6 border-l border-slate-100 ml-4 text-left">
                {profileData?.educationList && profileData.educationList.length > 0 ? (
                  profileData.educationList.map((edu) => (
                    <div key={edu._id} className="relative group transition-all duration-300">
                      <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50 shadow-sm"></div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm font-sans flex items-center gap-2">
                            {edu.degree}
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1">
                            {edu.university} • {edu.fieldOfStudy}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200/50 rounded-xl text-[10px] font-bold self-start sm:self-center">
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </span>
                      </div>
                      {edu.description && (
                        <p className="text-xs text-slate-400 mt-2 font-sans italic leading-relaxed">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  [
                    {
                      degree: 'Ph.D. in Computer Science & Engineering',
                      university: 'Amity University',
                      fieldOfStudy: 'Artificial Intelligence',
                      startYear: 2011,
                      endYear: 2016,
                      description: 'Thesis on Deep Learning Optimizations and Neural Architectures.'
                    },
                    {
                      degree: 'M.Tech. in Computer Science',
                      university: 'Indian Institute of Technology, Delhi',
                      fieldOfStudy: 'Computer Engineering',
                      startYear: 2009,
                      endYear: 2011,
                    },
                    {
                      degree: 'B.Tech. in Computer Science',
                      university: 'Delhi Technological University',
                      fieldOfStudy: 'Information Technology',
                      startYear: 2005,
                      endYear: 2009,
                    }
                  ].map((edu, idx) => (
                    <div key={idx} className="relative group transition-all duration-300">
                      <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50 shadow-sm"></div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm font-sans">
                            {edu.degree}
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1">
                            {edu.university} • {edu.fieldOfStudy}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200/50 rounded-xl text-[10px] font-bold self-start sm:self-center">
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </span>
                      </div>
                      {edu.description && (
                        <p className="text-xs text-slate-400 mt-2 font-sans italic leading-relaxed">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'Experience' && (
            <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 font-display">Professional Experience</h3>
                <button onClick={() => setShowEditModal(true)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Manage Experience
                </button>
              </div>
              <div className="space-y-8 relative pl-6 border-l border-slate-100 ml-4 text-left">
                {profileData?.experienceList && profileData.experienceList.length > 0 ? (
                  profileData.experienceList.map((exp) => (
                    <div key={exp._id} className="relative group transition-all duration-300">
                      <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50 shadow-sm"></div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm font-sans flex items-center gap-2">
                            {exp.role}
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1">
                            {exp.organization} • {exp.department || exp.employmentType}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200/50 rounded-xl text-[10px] font-bold self-start sm:self-center">
                          {exp.startYear} - {exp.endYear || 'Present'}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-slate-400 mt-2 font-sans italic leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  [
                    {
                      role: 'Associate Professor',
                      organization: 'Amity University',
                      department: 'Department of Computer Science & Engineering',
                      employmentType: 'full-time',
                      startYear: 2016,
                      endYear: null,
                      description: 'Teaching graduate classes in Deep Learning. Supervising Ph.D. candidates.'
                    },
                    {
                      role: 'Assistant Professor',
                      organization: 'IIT Delhi',
                      department: 'Department of Computer Science',
                      employmentType: 'full-time',
                      startYear: 2013,
                      endYear: 2016,
                    },
                    {
                      role: 'Research Scientist',
                      organization: 'TCS Research, Bangalore',
                      department: 'Innovation Lab',
                      employmentType: 'full-time',
                      startYear: 2011,
                      endYear: 2013,
                    }
                  ].map((exp, idx) => (
                    <div key={idx} className="relative group transition-all duration-300">
                      <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50 shadow-sm"></div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm font-sans">
                            {exp.role}
                          </h4>
                          <p className="text-xs text-slate-500 font-semibold mt-1">
                            {exp.organization} • {exp.department || exp.employmentType}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200/50 rounded-xl text-[10px] font-bold self-start sm:self-center">
                          {exp.startYear} - {exp.endYear || 'Present'}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-slate-400 mt-2 font-sans italic leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab !== 'About' && activeTab !== 'Publications' && activeTab !== 'Education' && activeTab !== 'Experience' && (
            <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-display">{activeTab}</h3>
              <p className="text-sm text-slate-500 font-sans">
                This section contains verified data from your institutional records. Click Edit Profile to add new {activeTab.toLowerCase()}.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (Metrics & Metadata Summary - Sticky) */}
        <div className="flex flex-col gap-8 text-left lg:sticky lg:top-6 self-start h-fit">
          
          {/* Research Metrics Dashboard Card */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-wide uppercase font-display">Research Metrics</h3>
              {profileData?.academicProfile?.googleScholar && (
                <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200/40 rounded-lg text-[9px] font-extrabold tracking-wider uppercase">
                  Scholar Synced
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-100/50 hover:shadow-md transition-all duration-300 group text-left">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Publications</span>
                  <BookOpen className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-display">{profileData?.publications || publications.length}</p>
                <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full w-[85%]"></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-100/50 hover:shadow-md transition-all duration-300 group text-left">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Citations</span>
                  <Sparkles className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-display">{profileData?.citations || 0}</p>
                <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full w-[70%]"></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-100/50 hover:shadow-md transition-all duration-300 group text-left">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">h-index</span>
                  <Award className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-display">{profileData?.hIndex || 0}</p>
                <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full w-[55%]"></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-100/50 hover:shadow-md transition-all duration-300 group text-left">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">i10-index</span>
                  <Layers className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-display">{profileData?.i10Index || 0}</p>
                <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full w-[65%]"></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/5 to-red-500/5 border border-rose-100/50 hover:shadow-md transition-all duration-300 group text-left">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Experience</span>
                  <User className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-display">{profileData?.experience || 10}+ Yrs</p>
                <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full w-[90%]"></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-sky-500/5 border border-cyan-100/50 hover:shadow-md transition-all duration-300 group text-left">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Areas</span>
                  <GraduationCap className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900 mt-2 font-display">
                  {profileData?.researchAreas?.length || 7}
                </p>
                <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full w-[75%]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Citation Graph Card */}
          {profileData?.researchMetrics?.citationsByYear && profileData.researchMetrics.citationsByYear.length > 0 && (
            <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 tracking-wide uppercase font-display border-b border-slate-100 pb-2 flex items-center justify-between">
                Citation History
                <span className="text-[9px] text-slate-400 capitalize font-medium">annual trends</span>
              </h3>
              <div className="relative w-full pt-2">
                {/* SVG Line/Bar Chart */}
                <svg viewBox="0 0 400 160" className="w-full h-auto overflow-visible">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="60" x2="380" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="100" x2="380" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="140" x2="380" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Graph Data */}
                  {(() => {
                    const data = [...profileData.researchMetrics.citationsByYear].sort((a, b) => a.year - b.year);
                    const maxCitations = Math.max(...data.map(d => d.citations), 5);
                    const points = data.map((d, index) => {
                      const x = 40 + (index * (340 / (data.length - 1 || 1)));
                      const y = 140 - (d.citations * (120 / maxCitations));
                      return { x, y, ...d };
                    });

                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const areaD = points.length > 0 
                      ? `${pathD} L ${points[points.length - 1].x} 140 L ${points[0].x} 140 Z` 
                      : '';

                    return (
                      <>
                        {/* Shaded Area */}
                        {areaD && <path d={areaD} fill="url(#citationGrad)" opacity="0.15" />}
                        {/* Smooth Line */}
                        {pathD && <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />}
                        
                        {/* Interactive Nodes */}
                        {points.map((p, i) => (
                          <g key={i} className="group/node cursor-pointer">
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r="4" 
                              fill="#ffffff" 
                              stroke="#2563EB" 
                              strokeWidth="2" 
                              className="transition-all duration-200 group-hover/node:r-6 group-hover/node:fill-blue-600"
                            />
                            {/* Hover tooltip */}
                            <g className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-200 pointer-events-none">
                              <rect 
                                x={p.x - 30} 
                                y={p.y - 32} 
                                width="60" 
                                height="22" 
                                rx="6" 
                                fill="#0f172a" 
                              />
                              <text 
                                x={p.x} 
                                y={p.y - 17} 
                                fill="#ffffff" 
                                fontSize="9" 
                                fontWeight="bold" 
                                textAnchor="middle"
                              >
                                {p.citations}
                              </text>
                            </g>
                            {/* X-axis labels */}
                            <text 
                              x={p.x} 
                              y="155" 
                              fill="#64748b" 
                              fontSize="8" 
                              fontWeight="bold" 
                              textAnchor="middle"
                            >
                              {p.year}
                            </text>
                          </g>
                        ))}

                        <defs>
                          <linearGradient id="citationGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          )}

          {/* Research Areas */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 tracking-wide uppercase font-display border-b border-slate-100 pb-2">Research Areas</h3>
            <div className="flex flex-wrap gap-2">
              {profileData?.researchAreas && profileData.researchAreas.length > 0 ? (
                profileData.researchAreas.map((area) => (
                  <span key={area._id} className="px-3 py-1.5 bg-blue-50/60 hover:bg-blue-100 text-blue-700 border border-blue-100/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                    {area.researchArea?.areaName}
                  </span>
                ))
              ) : (
                ['Artificial Intelligence', 'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Data Mining', 'AI Ethics', 'Healthcare AI'].map((area) => (
                  <span key={area} className="px-3 py-1.5 bg-blue-50/60 hover:bg-blue-100 text-blue-700 border border-blue-100/30 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105 duration-200">
                    {area}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Top Keywords */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 tracking-wide uppercase font-display border-b border-slate-100 pb-2">Top Keywords</h3>
            <div className="flex flex-wrap gap-1.5">
              {profileData?.keywords && profileData.keywords.length > 0 ? (
                profileData.keywords.map((kw) => (
                  <span key={kw._id} className="px-2.5 py-1 bg-slate-50 border border-slate-200/60 text-slate-600 rounded-lg text-xs font-medium">
                    {kw.keyword?.keyword}
                  </span>
                ))
              ) : (
                ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Mining', 'AI', 'Text Classification', 'Neural Networks'].map((kw) => (
                  <span key={kw} className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-600 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                    {kw}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Profile Completeness Card */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 tracking-wide uppercase font-display border-b border-slate-100 pb-2">Profile Completeness</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#E2E8F0"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#2563EB"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - (profileData?.profileCompletion || 92) / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-sm font-extrabold text-slate-800">{profileData?.profileCompletion || 92}%</span>
              </div>

              <div className="text-left space-y-1">
                <p className="text-xs font-bold text-slate-800">Excellent progress!</p>
                <p className="text-[10px] text-slate-400">Your profile ranks in the top 8% of computer science researchers.</p>
              </div>
            </div>

            {/* Items Checklist */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Basic Information</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Education History</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Professional Experience</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Research Interests</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Publications Uploaded</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Profile Photo & Cover</div>
            </div>
          </div>

        </div>
      </div>

      <EditProfileModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        initialData={{
          ...profileData,
          publications
        }} 
        onSaveSuccess={() => {
          fetchProfileDetails();
        }} 
      />
      <SyncMergeModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onSyncComplete={async () => {
          setLoading(true);
          await fetchProfileDetails();
          alert('Profile sync completed successfully!');
        }}
      />
    </div>
  );
};

export default ProfilePage;
