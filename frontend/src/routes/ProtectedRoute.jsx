import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }){
  // Simple client-side guard: require adminUser in localStorage
  let isAuthed = false;
  try { isAuthed = !!localStorage.getItem('adminUser'); } catch (e) { isAuthed = false; }
  const location = useLocation();

  if (!isAuthed){
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
