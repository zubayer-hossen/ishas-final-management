import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAppSelector } from '../app/hooks';
import Spinner from '../components/ui/Spinner';

import LandingPage from '../pages/LandingPage';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

import DashboardHomePage from '../pages/dashboard/DashboardHomePage';
import ProfilePage from '../pages/dashboard/ProfilePage';
import DuesPage from '../pages/dashboard/DuesPage';
import NoticesPage from '../pages/dashboard/NoticesPage';
import EventsPage from '../pages/dashboard/EventsPage';
import MeetingsPage from '../pages/dashboard/MeetingsPage';
import MeetingRoomPage from '../pages/dashboard/MeetingRoomPage';
import BlogsPage from '../pages/dashboard/BlogsPage';
import GalleryPage from '../pages/dashboard/GalleryPage';
import GalleryAlbumPage from '../pages/dashboard/GalleryAlbumPage';
import SupportPage from '../pages/dashboard/SupportPage';
import TicketDetailPage from '../pages/dashboard/TicketDetailPage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import MembersManagementPage from '../pages/admin/MembersManagementPage';
import CommitteesPage from '../pages/admin/CommitteesPage';
import FundManagementPage from '../pages/admin/FundManagementPage';
import NoticeManagementPage from '../pages/admin/NoticeManagementPage';
import EventManagementPage from '../pages/admin/EventManagementPage';
import BlogManagementPage from '../pages/admin/BlogManagementPage';
import GalleryManagementPage from '../pages/admin/GalleryManagementPage';
import ReportsPage from '../pages/admin/ReportsPage';
import OrgSettingsPage from '../pages/admin/OrgSettingsPage';
import { ADMIN_ACCESS_ROLES, FINANCE_ROLES } from '../utils/roles';

import NotFoundPage from '../pages/NotFoundPage';

const RootRoute = () => {
  const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} className="text-primary-600" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRoute />} />

    <Route element={<PublicOnlyRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      {/* Fullscreen meeting room — no sidebar/topbar chrome */}
      <Route path="/dashboard/meetings/:id/room" element={<MeetingRoomPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardHomePage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/dues" element={<DuesPage />} />
        <Route path="/dashboard/notices" element={<NoticesPage />} />
        <Route path="/dashboard/events" element={<EventsPage />} />
        <Route path="/dashboard/meetings" element={<MeetingsPage />} />
        <Route path="/dashboard/blogs" element={<BlogsPage />} />
        <Route path="/dashboard/gallery" element={<GalleryPage />} />
        <Route path="/dashboard/gallery/:id" element={<GalleryAlbumPage />} />
        <Route path="/dashboard/support" element={<SupportPage />} />
        <Route path="/dashboard/support/tickets/:id" element={<TicketDetailPage />} />

        <Route element={<ProtectedRoute allowedRoles={ADMIN_ACCESS_ROLES} />}>
          <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
          <Route path="/dashboard/admin/committees" element={<CommitteesPage />} />
          <Route path="/dashboard/admin/notices" element={<NoticeManagementPage />} />
          <Route path="/dashboard/admin/events" element={<EventManagementPage />} />
          <Route path="/dashboard/admin/blogs" element={<BlogManagementPage />} />
          <Route path="/dashboard/admin/gallery" element={<GalleryManagementPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['owner', 'super_admin', 'admin']} />}>
          <Route path="/dashboard/admin/members" element={<MembersManagementPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={FINANCE_ROLES} />}>
          <Route path="/dashboard/admin/funds" element={<FundManagementPage />} />
          <Route path="/dashboard/admin/reports" element={<ReportsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
          <Route path="/dashboard/admin/settings" element={<OrgSettingsPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
