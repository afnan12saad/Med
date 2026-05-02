import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'patient' | 'doctor';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile) {
    // If user is authenticated but has no profile, they need onboarding
    if (location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
  } else if (allowedRole && profile.role !== allowedRole) {
    // Role mismatch
    return <Navigate to={profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} replace />;
  }

  return <>{children}</>;
}
