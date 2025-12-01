import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import { DEBUG } from './utils/debug';

// Layout
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard/Dashboard';
import ProjectsList from './pages/Projects/ProjectsList';
import ProjectDetail from './pages/Projects/ProjectDetail';
import ProjectForm from './pages/Projects/ProjectForm';
import ReportsList from './pages/Reports/ReportsList';
import ReportDetail from './pages/Reports/ReportDetail';
import ReportForm from './pages/Reports/ReportForm';
import UsersList from './pages/Users/UsersList';
import UserForm from './pages/Users/UserForm';
import Notifications from './pages/Notifications/Notifications';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';

// Error Pages
import Unauthorized from './pages/Errors/Unauthorized';
import NotFound from './pages/Errors/NotFound';

function App() {
  const { user, loading } = useAuth();

  // Debug logging - always call hook, make logic conditional
  React.useEffect(() => {
    if (DEBUG) {
      console.log('🔍 [App] Render', { user: user?.email, loading, role: user?.role });
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Projects */}
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/new" element={<ProjectForm />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/:id/edit" element={<ProjectForm />} />

        {/* Reports */}
        <Route path="reports" element={<ReportsList />} />
        <Route path="reports/new" element={<ReportForm />} />
        <Route path="reports/:id" element={<ReportDetail />} />
        <Route path="reports/:id/edit" element={<ReportForm />} />

        {/* Users */}
        <Route path="users" element={<UsersList />} />
        <Route path="users/new" element={<UserForm />} />
        <Route path="users/:id/edit" element={<UserForm />} />

        {/* Other */}
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
