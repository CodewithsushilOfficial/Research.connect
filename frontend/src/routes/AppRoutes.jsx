import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LandingPage from '../modules/landing';
import ComingSoon from '../components/common/ComingSoon';
import HomeHub from './HomeHub';

// Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Pages
import LoginPage from '../modules/authentication/pages/LoginPage';
import RegisterPage from '../modules/authentication/pages/RegisterPage';
import OtpVerificationPage from '../modules/authentication/pages/OtpVerificationPage';
import ForgotPasswordPage from '../modules/authentication/pages/ForgotPasswordPage';
import ResetPasswordPage from '../modules/authentication/pages/ResetPasswordPage';
import SuccessPage from '../modules/authentication/pages/SuccessPage';
import ProfilePage from '../modules/profile/pages/ProfilePage';
import ResearchIdentityPage from '../modules/profile/pages/ResearchIdentityPage';
import ProfileRedirect from '../modules/profile/components/ProfileRedirect';
import PublicationCreatePage from '../modules/publication/pages/PublicationCreatePage';
import PublicationDetailPage from '../modules/publication/pages/PublicationDetailPage';
import PublicationsLibraryPage from '../modules/publication/pages/PublicationsLibraryPage';
import PublicationEditPage from '../modules/publication/pages/PublicationEditPage';
import MessagesRoute from './MessagesRoute';

// AI Workspace Lazy Components
const AIWorkspace = React.lazy(() => import('../modules/ai-workspace/pages/AIWorkspace'));
const LiteratureReview = React.lazy(() => import('../modules/ai-workspace/pages/LiteratureReview'));
const ResearchAssistant = React.lazy(() => import('../modules/ai-workspace/pages/ResearchAssistant'));
const PaperSummary = React.lazy(() => import('../modules/ai-workspace/pages/PaperSummary'));
const CitationGenerator = React.lazy(() => import('../modules/ai-workspace/pages/CitationGenerator'));
const ResearchGap = React.lazy(() => import('../modules/ai-workspace/pages/ResearchGap'));
const MethodologyGenerator = React.lazy(() => import('../modules/ai-workspace/pages/MethodologyGenerator'));
const PaperReviewer = React.lazy(() => import('../modules/ai-workspace/pages/PaperReviewer'));
const ProposalGenerator = React.lazy(() => import('../modules/ai-workspace/pages/ProposalGenerator'));
const ThesisAssistant = React.lazy(() => import('../modules/ai-workspace/pages/ThesisAssistant'));
const PDFChat = React.lazy(() => import('../modules/ai-workspace/pages/PDFChat'));
const DatasetFinder = React.lazy(() => import('../modules/ai-workspace/pages/DatasetFinder'));
const JournalRecommendation = React.lazy(() => import('../modules/ai-workspace/pages/JournalRecommendation'));
const ConferenceRecommendation = React.lazy(() => import('../modules/ai-workspace/pages/ConferenceRecommendation'));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Dynamic Landing / Feed Hub */}
      <Route path="/" element={<HomeHub />} />

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
        <Route path="profile" element={<ProfileRedirect />} />
        <Route path="research-identity" element={<ResearchIdentityPage />} />
        <Route path="publications/create" element={<PublicationCreatePage />} />
        <Route path="projects/create" element={<ComingSoon title="Create Project Coming Soon" />} />
        <Route path="datasets/create" element={<ComingSoon title="Share Dataset Coming Soon" />} />
        <Route path="questions/create" element={<ComingSoon title="Ask Question Coming Soon" />} />
        <Route path="communities/create" element={<ComingSoon title="Create Community Coming Soon" />} />
        <Route path="collaborations/create" element={<ComingSoon title="Create Collaboration Coming Soon" />} />
        <Route path="patents/create" element={<ComingSoon title="Upload Patent Coming Soon" />} />
        <Route path="articles/create" element={<ComingSoon title="Write Article Coming Soon" />} />
        <Route path="events/create" element={<ComingSoon title="Create Event Coming Soon" />} />
        <Route path="publication/:slug/edit" element={<PublicationEditPage />} />
        <Route path="messages" element={<MessagesRoute />} />
        <Route path="search" element={<ComingSoon title="Research Discovery Search Coming Soon" />} />
        <Route path="settings" element={<ComingSoon title="System Settings Coming Soon" />} />
        <Route path="notifications" element={<ComingSoon title="Notifications Center Coming Soon" />} />
        <Route path="admin" element={<ComingSoon title="Administration Panel Coming Soon" />} />
        <Route path="analytics" element={<ComingSoon title="System Analytics Coming Soon" />} />
      </Route>

      {/* Public Profile & AI Workspace Route */}
      <Route element={<DashboardLayout />}>
        <Route path="ai-workspace" element={
          <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650"></div>
            </div>
          }>
            <AIWorkspace />
          </React.Suspense>
        }>
          <Route index element={<Navigate to="literature-review" replace />} />
          <Route path="literature-review" element={<LiteratureReview />} />
          <Route path="research-assistant" element={<ResearchAssistant />} />
          <Route path="paper-summary" element={<PaperSummary />} />
          <Route path="citation-generator" element={<CitationGenerator />} />
          <Route path="research-gap" element={<ResearchGap />} />
          <Route path="methodology-generator" element={<MethodologyGenerator />} />
          <Route path="paper-reviewer" element={<PaperReviewer />} />
          <Route path="proposal-generator" element={<ProposalGenerator />} />
          <Route path="thesis-assistant" element={<ThesisAssistant />} />
          <Route path="pdf-chat" element={<PDFChat />} />
          <Route path="dataset-finder" element={<DatasetFinder />} />
          <Route path="journal-recommendation" element={<JournalRecommendation />} />
          <Route path="conference-recommendation" element={<ConferenceRecommendation />} />
        </Route>
        <Route path="/profile/:profileSlug" element={<ProfilePage />} />
        <Route path="/profile/:profileSlug/publications" element={<PublicationsLibraryPage />} />
        <Route path="/profile/:profileSlug/projects" element={<ComingSoon title="Researcher Projects Coming Soon" />} />
        <Route path="/profile/:profileSlug/patents" element={<ComingSoon title="Researcher Patents Coming Soon" />} />
        <Route path="/profile/:profileSlug/datasets" element={<ComingSoon title="Researcher Datasets Coming Soon" />} />
        <Route path="/profile/:profileSlug/books" element={<ComingSoon title="Researcher Books Coming Soon" />} />
        <Route path="/profile/:profileSlug/analytics" element={<ComingSoon title="Researcher Analytics Coming Soon" />} />
        <Route path="/publication/:publicationSlug" element={<PublicationDetailPage />} />
      </Route>

      {/* 404 & Wildcard Fallback */}
      <Route path="/404" element={<ComingSoon title="Page Not Found (404)" />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
