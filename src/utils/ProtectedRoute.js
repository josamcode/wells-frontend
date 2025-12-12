import React, { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = memo(({ children, roles, excludeRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth (App.js shows the loading state)
  if (loading) {
    return null;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Exclude specific roles
  if (excludeRoles && excludeRoles.length > 0 && excludeRoles.includes(user.role)) {
    // Clients should be redirected to /my-projects
    if (user.role === 'client') {
      return <Navigate to="/my-projects" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Role-based access check
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
});

ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;
