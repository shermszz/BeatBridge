import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthFlow.css';
import config from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('OTP sent to your email. Please check your inbox.');
        setTimeout(() => {
          navigate('/verify-otp', { state: { email } });
        }, 1200);
      } else {
        setError(data.error || 'This email address does not exist. Try signing up instead.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="authflow-bg">
      <section className="authflow-card">
        <h1>Forgot Password</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control mx-auto w-auto inputdeco my-input"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <button className="btn btn-primary buttondeco" type="submit" disabled={loading}>
            {loading ? 'Checking...' : 'Send OTP'}
          </button>
          <div>
            <a href="/login" className="authflow-link">Back to Login</a>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ForgotPassword; 