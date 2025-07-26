import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import config from '../config';

export default function Chapter1ProgressProtectedRoute({ requiredProgress, children }) {
  const [allowed, setAllowed] = useState(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkProgress = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setShouldRedirect(true);
        return;
      }
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/chapter-progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const progress = parseInt(data.chapter1_page_progress || '1', 10);
          setAllowed(progress >= requiredProgress);
        } else {
          setAllowed(false);
        }
      } catch (err) {
        setAllowed(false);
      }
    };
    checkProgress();
  }, [requiredProgress]);

  if (shouldRedirect) return <Navigate to="/login" replace />;
  if (allowed === null) return null; // Optionally, show a spinner
  return allowed ? children : <Navigate to="/chapter1-dashboard" replace />;
} 