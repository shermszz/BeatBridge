import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Fetch user info and store in localStorage
      fetch(`${config.API_BASE_URL}/api/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(user => {
          if (user && user.id) {
            localStorage.setItem('user_id', user.id);
            if (user.profile_pic_url) {
              localStorage.setItem('profile_pic', user.profile_pic_url);
            }
            setTimeout(() => {
              navigate('/customisation');
            }, 600);
          } else {
            setError('Failed to fetch user info. Please try logging in again.');
            setTimeout(() => navigate('/login'), 1200);
          }
        })
        .catch(() => {
          setError('Failed to fetch user info. Please try logging in again.');
          setTimeout(() => navigate('/login'), 1200);
        });
    } else {
      setError('No token found. Please try logging in again.');
      setTimeout(() => navigate('/login'), 1200);
    }
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #23243a 0%, #3a3b5a 100%)' }}>
      <div style={{ color: '#7b61ff', fontWeight: 600, fontSize: '1.3em', background: '#fff', padding: '32px 40px', borderRadius: '14px', boxShadow: '0 4px 32px rgba(44,62,80,0.12)' }}>
        {error ? error : 'Signing you in with Google...'}
      </div>
    </div>
  );
};

export default GoogleAuthSuccess; 