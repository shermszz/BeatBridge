// Prevents users from accessing pages without being logged in or verified email
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import config from '../config';

const ProtectedRoute = ({ children, requireVerification = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${config.API_BASE_URL}/api/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
          
          // Check if user is verified (if verification is required)
          if (requireVerification) {
            setIsVerified(userData.is_verified || false);
          } else {
            setIsVerified(true);
          }
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireVerification]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#fff'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireVerification && !isVerified) {
    // Redirect to email verification if not verified
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 