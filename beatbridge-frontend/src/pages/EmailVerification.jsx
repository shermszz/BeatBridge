import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import '../styles/Register.css';
import config from '../config';

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState(''); //To store the verification code
  const [error, setError] = useState(''); //To store the error message
  const [success, setSuccess] = useState(false); //To store the success message
  const [isLoading, setIsLoading] = useState(true); //To show a loading state while checking the verification status
  const navigate = useNavigate(); //To navigate to the next page
  const [searchParams] = useSearchParams(); //To get the search params from the URL
  const location = useLocation(); //To get the location of the current page

    // Check if user is already verified on component mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');
      
      // If no user ID, user needs to register first
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        if (token) {
          // If we have a token, check via the user endpoint
          const response = await fetch(`${config.API_BASE_URL}/api/user`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            if (userData.is_verified) {
              // User is already verified, check if they have completed customization
              try {
                const customizationResponse = await fetch(`${config.API_BASE_URL}/api/get-customization`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                
                if (customizationResponse.ok) {
                  // User has completed customization, redirect to home or intended destination
                  const from = location.state?.from?.pathname || '/home';
                  navigate(from, { replace: true });
                } else {
                  // User hasn't completed customization, redirect to customisation page
                  navigate('/customisation', { replace: true });
                }
              } catch (error) {
                console.error('Error checking customization status:', error);
                // Default to customisation page if check fails
                navigate('/customisation', { replace: true });
              }
              return;
            }
          }
        } else {
          // If no token, check via the verification status endpoint
          const response = await fetch(`${config.API_BASE_URL}/api/check-verification-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.is_verified) {
              // User is verified but we don't have a token, redirect to login
              navigate('/login', { 
                state: { 
                  message: 'Email verified successfully. Please log in.' 
                } 
              });
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerificationStatus();
  }, [navigate, location.state]);

  // Handle email verification form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Send verification code to backend
      const response = await fetch(`${config.API_BASE_URL}/api/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the JWT token for authenticated requests
        localStorage.setItem('token', data.token);
        setSuccess(true);
        
        // Check if user has completed customization to determine redirect destination
        try {
          const customizationResponse = await fetch(`${config.API_BASE_URL}/api/get-customization`, {
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });
          
          if (customizationResponse.ok) {
            // User has completed customization, redirect to home or intended destination
            const from = location.state?.from?.pathname || '/home';
            navigate(from, { replace: true });
          } else {
            // User hasn't completed customization, redirect to customisation page
            navigate('/customisation', { replace: true });
          }
        } catch (error) {
          console.error('Error checking customization status:', error);
          // Default to customisation page if check fails
          navigate('/customisation', { replace: true });
        }
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };



  // Show loading state while checking verification status
  if (isLoading) {
    return (
      <section className="hero">
        <div style={{ textAlign: 'center', color: '#fff' }}>
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section className="hero">
      <h1>Verify Your Email</h1>
      <p>Please enter the verification code sent to your email.</p>

      {/* Email verification form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            autoComplete="off"
            autoFocus
            className="form-control mx-auto w-auto inputdeco my-input"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            type="text"
            maxLength="6"
          />
          {error && (
            <div className="error-message">{error}</div>
          )}
        </div>
        <button className="btn btn-primary buttondeco" type="submit">
          Verify Email
        </button>
      </form>
    </section>
  );
};

export default EmailVerification; 