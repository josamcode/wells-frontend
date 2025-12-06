import React, { Suspense, lazy, memo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import Loading from './components/common/Loading';

// Layout - loaded immediately as it's the shell
import Layout from './components/layout/Layout';

// Lazy load all pages for better performance
const Login = lazy(() => import('./pages/Auth/Login'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const ProjectsList = lazy(() => import('./pages/Projects/ProjectsList'));
const ProjectDetail = lazy(() => import('./pages/Projects/ProjectDetail'));
const ProjectForm = lazy(() => import('./pages/Projects/ProjectForm'));
const ReportsList = lazy(() => import('./pages/Reports/ReportsList'));
const ReportDetail = lazy(() => import('./pages/Reports/ReportDetail'));
const ReportForm = lazy(() => import('./pages/Reports/ReportForm'));
const UsersList = lazy(() => import('./pages/Users/UsersList'));
const UserForm = lazy(() => import('./pages/Users/UserForm'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));
const Messages = lazy(() => import('./pages/Messages/Messages'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Profile = lazy(() => import('./pages/Profile/Profile'));

const Unauthorized = lazy(() => import('./pages/Errors/Unauthorized'));
const NotFound = lazy(() => import('./pages/Errors/NotFound'));

// Page loading fallback
const PageLoader = memo(() => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loading size="lg" text="Loading..." />
  </div>
));

PageLoader.displayName = 'PageLoader';

// Full screen loading for auth
const AuthLoader = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-secondary-100">
    <Loading size="xl" text="Loading..." />
  </div>
));

AuthLoader.displayName = 'AuthLoader';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-secondary-100">
        <div className="text-center animate-fade-in">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-secondary-200 mx-auto" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
          </div>
          <p className="text-secondary-600 font-medium animate-pulse-soft">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/" />
          ) : (
            <Suspense fallback={<AuthLoader />}>
              <Login />
            </Suspense>
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<AuthLoader />}>
            <ForgotPassword />
          </Suspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<AuthLoader />}>
            <ResetPassword />
          </Suspense>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />

        {/* Projects */}
        <Route
          path="projects"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProjectsList />
            </Suspense>
          }
        />
        <Route
          path="projects/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProjectForm />
            </Suspense>
          }
        />
        <Route
          path="projects/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProjectDetail />
            </Suspense>
          }
        />
        <Route
          path="projects/:id/edit"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProjectForm />
            </Suspense>
          }
        />

        {/* Reports */}
        <Route
          path="reports"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReportsList />
            </Suspense>
          }
        />
        <Route
          path="reports/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReportForm />
            </Suspense>
          }
        />
        <Route
          path="reports/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReportDetail />
            </Suspense>
          }
        />
        <Route
          path="reports/:id/edit"
          element={
            <Suspense fallback={<PageLoader />}>
              <ReportForm />
            </Suspense>
          }
        />

        {/* Users */}
        <Route
          path="users"
          element={
            <Suspense fallback={<PageLoader />}>
              <UsersList />
            </Suspense>
          }
        />
        <Route
          path="users/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <UserForm />
            </Suspense>
          }
        />
        <Route
          path="users/:id/edit"
          element={
            <Suspense fallback={<PageLoader />}>
              <UserForm />
            </Suspense>
          }
        />

        {/* Other */}
        <Route
          path="notifications"
          element={
            <Suspense fallback={<PageLoader />}>
              <Notifications />
            </Suspense>
          }
        />
        <Route
          path="messages"
          element={
            <Suspense fallback={<PageLoader />}>
              <Messages />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <Settings />
            </Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<PageLoader />}>
              <Profile />
            </Suspense>
          }
        />
      </Route>

      {/* Error Routes */}
      <Route
        path="/unauthorized"
        element={
          <Suspense fallback={<AuthLoader />}>
            <Unauthorized />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <Suspense fallback={<AuthLoader />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
