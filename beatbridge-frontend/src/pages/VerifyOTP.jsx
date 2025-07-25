import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../config';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return <div>Email not provided. Please restart the password reset process.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        // Proceed to new password page
        navigate('/reset-password', { state: { email } });
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <section className="verify-otp-section">
      <h2>Verify OTP</h2>
      <p>Enter the OTP sent to your email address.</p>
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
        <button className="btn btn-primary buttondeco" type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
    </section>
  );
};

export default VerifyOTP; 