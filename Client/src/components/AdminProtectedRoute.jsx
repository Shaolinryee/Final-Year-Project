import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const AdminProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  if (session.user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
