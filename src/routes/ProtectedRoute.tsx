import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div className="animate-spin" style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    // User doesn't have required role, redirect to appropriate dashboard
    const redirectPath = user.role === 'admin' ? '/admin' : user.role === 'agent' ? '/agent' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

