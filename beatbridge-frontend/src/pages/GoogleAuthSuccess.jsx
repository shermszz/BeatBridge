import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Optionally, fetch user info and store it as well
      setTimeout(() => {
        navigate('/customisation');
      }, 800);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #23243a 0%, #3a3b5a 100%)' }}>
      <div style={{ color: '#7b61ff', fontWeight: 600, fontSize: '1.3em', background: '#fff', padding: '32px 40px', borderRadius: '14px', boxShadow: '0 4px 32px rgba(44,62,80,0.12)' }}>
        Signing you in with Google...
      </div>
    </div>
  );
};

export default GoogleAuthSuccess; 