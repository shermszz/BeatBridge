import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Login.css';
import config from '../config';
import defaultProfileImage from '../styles/images/loginIcon.svg';
import googleIcon from '../styles/images/googleIcon.png';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Client-side validation
    if (!formData.username) newErrors.username = "Username required";
    if (!formData.password) newErrors.password = "Password required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop submission if errors exist
    }

    // Proceed with server request
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials:'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('token', data.token); // Store JWT token
        
        // Fetch user profile to get profile_pic
        try {
          const userResponse = await fetch(`${config.API_BASE_URL}/api/user`, { 
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.profile_pic_url) {
              localStorage.setItem('profile_pic', userData.profile_pic_url);
            } else {
              localStorage.setItem('profile_pic', defaultProfileImage);
            }
            window.dispatchEvent(new Event('profilePicUpdated'));
          } else {
            // fallback to default if user fetch fails
            localStorage.setItem('profile_pic', defaultProfileImage);
            window.dispatchEvent(new Event('profilePicUpdated'));
          }
        } catch (e) {
          localStorage.setItem('profile_pic', defaultProfileImage);
          window.dispatchEvent(new Event('profilePicUpdated'));
        }
        //Navigate to the main home page once logged in
        navigate('/home');
      } else if (response.status === 403 && data.errors?.general?.includes('verify your email')) {
        // User is not verified, redirect to verification page
        setErrors({ general: 'Please verify your email first. Redirecting to verification page...' });
        setTimeout(() => {
          navigate('/verify-email');
        }, 2000);
      } else {
        setErrors(data.errors || { general: 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: "Network error. Try again later." });
    }
  };

  return (
    <section className="hero">
    <h1>Log in</h1>

    {successMessage && (
      <div style={{ 
        color: '#4CAF50', 
        backgroundColor: '#4CAF5020', 
        padding: '10px', 
        borderRadius: '5px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        {successMessage}
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <input
          autoComplete="off"
          autoFocus
          className="form-control mx-auto w-auto inputdeco my-input"
          name="username"
          placeholder="Username"
          type="text"
          value={formData.username}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <input
          className="form-control mx-auto w-auto inputdeco my-input"
          name="password"
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors && errors.username && (
          <div className="error-message">{errors.username}</div>
        )}
        {errors && errors.password && (
          <div className="error-message">{errors.password}</div>
        )}
        {errors && errors.general && (
          <div className="error-message">{errors.general}</div>
        )}
      </div>
      <button className="btn btn-primary buttondeco" type="submit">
        Log in
      </button>
      <div style={{ margin: '18px 0 0 0', textAlign: 'center' }}>
        <button
          type="button"
          className="btn btn-google-auth"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            background: 'linear-gradient(90deg, #fff 0%, #f5f5f5 100%)',
            color: '#444',
            border: '1.5px solid #e0e0e0',
            borderRadius: '7px',
            fontWeight: 600,
            fontSize: '1.08em',
            padding: '12px 0',
            margin: '0 auto',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(44,62,80,0.06)',
            gap: '10px',
          }}
          onClick={() => window.location.href = `${config.API_BASE_URL}/api/google-login`}
        >
          <img src={googleIcon} alt="Google" style={{ width: 22, height: 22, marginRight: 8 }} />
          Sign in with Google
        </button>
      </div>
      <hr className="login-divider" />
      <div className="login-redirect">
        <p>Don't have an account yet?</p>
        <a href="/register" className="login-btn">
          Sign up
        </a>
      </div>
      <div className="forgot-password-link" style={{ textAlign: 'center', marginTop: '16px' }}>
        <a href="/forgot-password" style={{ textDecoration: 'underline', color: '#007bff', cursor: 'pointer' }}>
          Forgot password?
        </a>
      </div>
    </form>
  </section>
  );
};

export default Login;