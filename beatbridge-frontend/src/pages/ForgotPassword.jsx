import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
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
    <section className="forgot-password-section">
      <h1 style={{ color: '#ff6f6f', marginBottom: '18px', fontWeight: 700 }}>Forgot Password</h1>
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
            style={{ fontSize: '1.1em', padding: '10px 12px' }}
          />
        </div>
        {error && (
          <div style={{
            color: '#d32f2f',
            background: '#ffd6d6',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontWeight: 500,
            textAlign: 'center',
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            color: '#388e3c',
            background: '#d0ffd6',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontWeight: 500,
            textAlign: 'center',
          }}>{success}</div>
        )}
        <button className="btn btn-primary buttondeco" type="submit" disabled={loading} style={{ width: '100%', fontWeight: 600, fontSize: '1.1em' }}>
          {loading ? 'Checking...' : 'Send OTP'}
        </button>
        <div style={{ marginTop: '18px', textAlign: 'center' }}>
          <a href="/login" style={{ color: '#007bff', textDecoration: 'underline', fontSize: '0.98em' }}>Back to Login</a>
        </div>
      </form>
    </section>
  );
};

export default ForgotPassword; 