import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../config';
import '../styles/SharedLoops.css';

const SharedLoops = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sharedLoops, setSharedLoops] = useState(null);
  const [senderName, setSenderName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const fetchSharedLoops = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/shared-loops/${shareId}`, {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Not logged in - redirect to login
            navigate('/login', { state: { redirectTo: `/shared-loops/${shareId}` } });
            return;
          }
          throw new Error('Failed to fetch shared loops');
        }

        const data = await response.json();
        setSharedLoops(data.loops);
        setSenderName(data.sender_name);
      } catch (err) {
        setError(err.message || 'Failed to load shared loops');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedLoops();
  }, [shareId, navigate]);

  const handleAcceptLoops = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/shared-loops/${shareId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to accept shared loops');
      }

      alert('Loops have been added to your collection!');
      navigate('/jam-session');
    } catch (err) {
      setError(err.message || 'Failed to accept shared loops');
    }
  };

  const handleRejectLoops = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${config.API_BASE_URL}/api/shared-loops/${shareId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/jam-session');
    } catch (err) {
      console.error('Failed to reject shared loops:', err);
      // Still navigate away even if the reject API call fails
      navigate('/jam-session');
    }
  };

  if (loading) {
    return (
      <div className="shared-loops-container">
        <div className="loading-message">Loading shared loops...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-loops-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="shared-loops-container">
        <h2>Shared Loops</h2>
        <p>Please log in to view and accept these shared loops.</p>
        <button onClick={() => navigate('/login', { state: { redirectTo: `/shared-loops/${shareId}` } })}>
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="shared-loops-container">
      <h2>Shared Loops</h2>
      <p className="sender-info">{senderName} has shared {sharedLoops?.length} loop(s) with you:</p>
      
      <div className="shared-loops-list">
        {sharedLoops?.map(loop => (
          <div key={loop.id} className="shared-loop-item">
            <h3>{loop.title}</h3>
            <p>BPM: {loop.bpm}</p>
            <p>Time Signature: {loop.time_signature}</p>
            <p>Note Resolution: {loop.note_resolution}</p>
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button className="accept-button" onClick={handleAcceptLoops}>
          Add to My Loops
        </button>
        <button className="reject-button" onClick={handleRejectLoops}>
          No Thanks
        </button>
      </div>
    </div>
  );
};

export default SharedLoops; 