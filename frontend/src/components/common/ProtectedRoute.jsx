import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, token } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their role home
    switch (user.role) {
      case 'restaurant':
        return <Navigate to="/owner" replace />;
      case 'delivery':
        return <Navigate to="/delivery" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
