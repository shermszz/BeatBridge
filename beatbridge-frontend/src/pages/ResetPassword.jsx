import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../config';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/login', { state: { message: 'Password reset successful. Please log in.' } });
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <section className="reset-password-section">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="password"
            className="form-control mx-auto w-auto inputdeco my-input"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control mx-auto w-auto inputdeco my-input"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button className="btn btn-primary buttondeco" type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </section>
  );
};

export default ResetPassword; 