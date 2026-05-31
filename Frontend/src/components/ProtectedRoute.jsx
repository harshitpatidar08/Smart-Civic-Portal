import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserProfile } from '../services/api';

const ProtectedRoute = ({ children, allowedRoles = [], requireGuest = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        // Silently validate session via API
        const res = await getUserProfile();
        if (res.success && res.data) {
          if (isMounted) {
            setIsAuthenticated(true);
            setUserRole(res.data.role || 'citizen');
          }
        } else {
          if (isMounted) {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-50">
        <div className="relative">
          <div className="w-12 h-12 rounded-full absolute border-4 border-slate-200"></div>
          <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-primary-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Handle guest-only routes like /login
  if (requireGuest) {
    if (isAuthenticated) {
      // Redirect to correct dashboard based on role
      const defaultDash = userRole === 'state_admin' ? '/dashboard/state-admin' 
                        : userRole === 'district_admin' ? '/dashboard/admin' 
                        : '/dashboard/citizen';
      return <Navigate to={defaultDash} replace />;
    }
    return children;
  }

  // Handle protected dashboard routes
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect wrong role to their dedicated dashboard instead of kicking them out
    const defaultDash = userRole === 'state_admin' ? '/dashboard/state-admin' 
                      : userRole === 'district_admin' ? '/dashboard/admin' 
                      : '/dashboard/citizen';
    return <Navigate to={defaultDash} replace />;
  }

  return children;
};

export default ProtectedRoute;
