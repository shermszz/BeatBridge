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
  const [hasAccepted, setHasAccepted] = useState(false);

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
        
        // Check if user has already accepted these loops
        if (token) {
          checkIfAlreadyAccepted();
        }
      } catch (err) {
        setError(err.message || 'Failed to load shared loops');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedLoops();
  }, [shareId, navigate]);

  const checkIfAlreadyAccepted = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/shared-loops/${shareId}/check-accepted`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasAccepted(data.has_accepted);
      }
    } catch (err) {
      console.error('Failed to check acceptance status:', err);
    }
  };

  const handleAcceptLoops = async () => {
    if (hasAccepted) {
      alert('You have already accepted these loops. You cannot accept them again.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/shared-loops/${shareId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 409) {
          alert('You have already accepted these loops. You cannot accept them again.');
          setHasAccepted(true);
          return;
        }
        throw new Error('Failed to accept shared loops');
      }

      setHasAccepted(true);
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
        <div className="shared-loops-card">
          <h2 className="shared-loops-title">Shared Loops</h2>
          <p className="login-info">
            Someone has shared some amazing drum loops with you! To view and accept these shared loops, 
            you'll need to log in to your BeatBridge account first.
          </p>
          <button 
            className="login-button"
            onClick={() => navigate('/login', { state: { redirectTo: `/shared-loops/${shareId}` } })}
          >
            Log In
          </button>
          <p className="signup-prompt">
            Don't have an account yet? <span className="signup-link" onClick={() => navigate('/register')}>Sign up here</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-loops-container">
      <div className="shared-loops-card">
        <h2 className="shared-loops-title">Shared Loops</h2>
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
          <button 
            className={`accept-button ${hasAccepted ? 'disabled' : ''}`} 
            onClick={handleAcceptLoops}
            disabled={hasAccepted}
          >
            {hasAccepted ? 'Already Accepted' : 'Add to My Loops'}
          </button>
          <button className="reject-button" onClick={handleRejectLoops}>
            No Thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharedLoops; 