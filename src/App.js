import React, { Suspense, lazy, memo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import Loading from './components/common/Loading';

// Layout - loaded immediately as it's the shell
import Layout from './components/layout/Layout';

// Lazy load all pages for better performance
const Login = lazy(() => import('./pages/Auth/Login'));
const ClientLogin = lazy(() => import('./pages/Auth/ClientLogin'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const ProjectsList = lazy(() => import('./pages/Projects/ProjectsList'));
const MyProjects = lazy(() => import('./pages/Projects/MyProjects'));
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
        path="/client-login"
        element={
          <Suspense fallback={<AuthLoader />}>
            <ClientLogin />
          </Suspense>
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
        {/* Client-only route */}
        <Route
          path="my-projects"
          element={
            <ProtectedRoute roles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <MyProjects />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="my-projects/:id"
          element={
            <ProtectedRoute roles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <ProjectDetail />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Regular routes (exclude clients) */}
        <Route
          index
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="projects"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <ProjectsList />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/new"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <ProjectForm />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/:id"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <ProjectDetail />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="projects/:id/edit"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <ProjectForm />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="reports"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <ReportsList />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/new"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <ReportForm />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/:id"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <ReportDetail />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="reports/:id/edit"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <ReportForm />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Users */}
        <Route
          path="users"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <UsersList />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="users/new"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <UserForm />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="users/:id/edit"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <UserForm />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Other */}
        <Route
          path="notifications"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <Notifications />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="messages"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <Messages />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute excludeRoles={['client']}>
              <Suspense fallback={<PageLoader />}>
                <Profile />
              </Suspense>
            </ProtectedRoute>
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
