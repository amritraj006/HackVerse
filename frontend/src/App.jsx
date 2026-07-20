import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Loader } from './components/common/UI';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Hackathons from './pages/Hackathons';
import HackathonDetail from './pages/HackathonDetail';
import Teams from './pages/Teams';
import JudgeReviews from './pages/JudgeReviews';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import SubmissionDetail from './pages/SubmissionDetail';
import OrganizerRegistrations from './pages/OrganizerRegistrations';
import OrganizerSubmissions from './pages/OrganizerSubmissions';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader className="w-10 h-10" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Dashboard Pages */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="hackathons" element={<Hackathons />} />
        <Route path="hackathons/:id" element={<HackathonDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="submissions/:id" element={<SubmissionDetail />} />

        {/* Participant Routes */}
        <Route
          path="participant/teams"
          element={
            <ProtectedRoute allowedRoles={['participant']}>
              <Teams />
            </ProtectedRoute>
          }
        />

        {/* Organizer Routes */}
        <Route
          path="organizer/registrations"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <OrganizerRegistrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="organizer/submissions"
          element={
            <ProtectedRoute allowedRoles={['organizer', 'admin']}>
              <OrganizerSubmissions />
            </ProtectedRoute>
          }
        />

        {/* Judge Routes */}
        <Route
          path="judge/reviews"
          element={
            <ProtectedRoute allowedRoles={['judge', 'admin']}>
              <JudgeReviews />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch All Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
