import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/Register.css';
import config from '../config';

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the JWT token
        localStorage.setItem('token', data.token);
        setSuccess(true);
        navigate('/customisation');
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <section className="hero">
      <h1>Verify Your Email</h1>
      <p>Please enter the verification code sent to your email.</p>

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