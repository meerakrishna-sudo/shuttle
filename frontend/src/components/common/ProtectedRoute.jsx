import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute wraps any route that requires authentication (and optionally a role).
 *
 * If not logged in → redirect to /login (and remember where they were trying to go)
 * If logged in but wrong role → redirect to their own dashboard
 * If logged in and correct role → render the page
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const dashboardMap = { Admin: '/admin', Driver: '/driver', Passenger: '/passenger' };
    return <Navigate to={dashboardMap[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
