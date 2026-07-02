import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LandingPage from '../modules/landing';
import ComingSoon from '../components/common/ComingSoon';

// Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Pages
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import OtpVerificationPage from '../modules/auth/pages/OtpVerificationPage';
import ForgotPasswordPage from '../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../modules/auth/pages/ResetPasswordPage';
import SuccessPage from '../modules/auth/pages/SuccessPage';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import PublishResearchPage from '../modules/dashboard/pages/PublishResearchPage/PublishResearchPage';
import PublicationListPage from '../modules/dashboard/pages/PublicationListPage/PublicationListPage';
import SettingsPage from '../modules/dashboard/pages/SettingsPage/SettingsPage';
import ProfilePage from '../modules/profile/pages/ProfilePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing / Public Website Layout */}
      <Route path="/" element={<LandingLayout />}>
        <Route index element={<LandingPage />} />
      </Route>

      {/* Authentication Layout */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        <Route path="otp" element={
          <PublicRoute>
            <OtpVerificationPage />
          </PublicRoute>
        } />
        <Route path="forgot-password" element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } />
        <Route path="reset-password" element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        } />
        <Route path="success" element={
          <PublicRoute>
            <SuccessPage />
          </PublicRoute>
        } />
      </Route>

      {/* Dashboard & Modules Layout */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="publish-research" element={<PublishResearchPage />} />
        <Route path="publication" element={<PublicationListPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="discovery" element={<ComingSoon title="Discovery Feed Coming Soon" message="Discovery Feed will surface the latest research, recommended papers, and trending topics tailored to your interests." />} />
        <Route path="projects" element={<ComingSoon title="Projects Coming Soon" message="Projects will let you manage research workspaces, milestones, and team collaborations in one place." />} />
        <Route path="collaborations" element={<ComingSoon title="Collaborations Coming Soon" message="Collaborations will centralize joint research work, shared proposals, and partnership tools." />} />
        <Route path="messages" element={<ComingSoon title="Messages Coming Soon" message="Messages will let you collaborate directly with colleagues, share updates, and manage research conversations." />} />
        <Route path="notifications" element={<ComingSoon title="Notifications Center Coming Soon" message="Notifications will surface collaboration invites, system alerts, and research updates in one place." />} />
        <Route path="bookmarks" element={<ComingSoon title="Bookmarks Coming Soon" message="Bookmarks will save publications, profiles, and important items for quick access later." />} />
        <Route path="following" element={<ComingSoon title="Following Coming Soon" message="Following will help you track researchers, topics, and projects that matter to you." />} />
        <Route path="followers" element={<ComingSoon title="Followers Coming Soon" message="Followers will show you who is following your profile, publications, and activity." />} />
        <Route path="admin" element={<ComingSoon title="Administration Panel Coming Soon" message="Administration tools will give you access control, user management, and audit logs when enabled." />} />
        <Route path="analytics" element={<ComingSoon title="System Analytics Coming Soon" message="Analytics will deliver research insights, usage metrics, and performance dashboards for your work." />} />
      </Route>

      {/* 404 & Wildcard Fallback */}
      <Route path="/404" element={<ComingSoon title="Page Not Found (404)" />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
