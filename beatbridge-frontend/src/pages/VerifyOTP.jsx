import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/AuthFlow.css';
import config from '../config';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return <div className="authflow-bg"><div className="authflow-card">Email not provided. Please restart the password reset process.</div></div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('OTP verified! You may now reset your password.');
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 1200);
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="authflow-bg">
      <section className="authflow-card">
        <h1>Verify OTP</h1>
        <p style={{ color: '#555', marginBottom: 18 }}>Enter the OTP sent to your email address.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control mx-auto w-auto inputdeco my-input"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button className="btn btn-primary buttondeco" type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <div>
            <a href="/login" className="authflow-link">Back to Login</a>
          </div>
        </form>
      </section>
    </div>
  );
};

export default VerifyOTP; 