import React, { useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { BookMarked } from 'lucide-react';

import profileService from '../../../services/profile.service';

import AuthenticatedNavbar from '../../../layouts/Navbar/AuthenticatedNavbar';
import ProfileSidebar from '../components/ProfileSidebar';
import Button from '../../../components/common/buttons/Button';

const ProfileLayout = () => {
  const { username } = useParams();
  const currentUser = useSelector((state) => state.auth.user);
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Normalize target username (resolves 'me', undefined, or empty params to currentUser profile identifier)
  const targetUsername = (!username || username === 'me' || username === 'undefined')
    ? (currentUser?.profileSlug || currentUser?.username || 'me')
    : username;

  // Determine if viewing own profile
  const isOwnProfile = !username || username === 'me' || username === 'undefined' || (currentUser && (
    currentUser.slug === targetUsername ||
    currentUser.profileSlug === targetUsername ||
    currentUser.username === targetUsername
  ));

  // Query to fetch profile details (hydrated from all collections)
  const { data: profileData, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['profile', targetUsername],
    queryFn: async () => {
      return await profileService.getPublicProfile(targetUsername);
    },
    staleTime: 1000 * 60, // 1 minute stale time
    enabled: !!targetUsername && targetUsername !== 'undefined',
    refetchOnWindowFocus: false,
    retry: (failureCount, err) => {
      if (err?.status === 404 || err?.statusCode === 404) return false;
      return failureCount < 2;
    }
  });

  const profile = profileData?.data;

  // Show spinner only on initial load without cached data
  if (isLoading && !profile) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-page">
        <AuthenticatedNavbar />
        <div className="flex flex-col items-center justify-center flex-grow gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Display error page ONLY if error is genuinely a non-existent or suspended profile (and not an aborted request)
  if (error && !error.isCanceled && !profile && !isRefetching) {
    return (
      <div className="flex flex-col min-h-screen bg-bg-page">
        <AuthenticatedNavbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
          <div className="p-4 bg-red-50 text-accent-red rounded-full w-fit mx-auto">
            <BookMarked className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-text-primary tracking-tight">Failed to Load Profile</h3>
          <p className="text-xs text-text-secondary leading-relaxed font-semibold">
            {error.message || 'The requested researcher profile does not exist or has been suspended.'}
          </p>
          <Button variant="ghost" onClick={() => refetch()} className="mx-auto">Retry Loading</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-page text-text-primary">
      <AuthenticatedNavbar
        onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
        isMobileMenuOpen={isMobileOpen}
      />
      <div className="flex flex-grow relative">
        <ProfileSidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="flex-grow overflow-x-hidden p-6 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {/* The individual sub-pages render here */}
            <Outlet context={{ profile, refetch, isOwnProfile, username }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileLayout;