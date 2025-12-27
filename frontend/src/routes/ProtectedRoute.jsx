import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const userStr = localStorage.getItem('adminUser');
  let user = null;

  try { user = JSON.parse(userStr); } catch (e) { }

  const isAuthed = !!user;
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  // Check Role Access
  if (allowedRoles) {
    const userRole = user.role || 'user';

    // Super Admin bypass
    if (userRole === 'admin') {
      return children;
    }

    if (!allowedRoles.includes(userRole)) {
      // Redirect to dashboard if authorized but wrong role
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
}
