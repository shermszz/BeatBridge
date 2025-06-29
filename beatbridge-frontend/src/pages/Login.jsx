import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import config from '../config';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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
              // If the URL is not absolute, prepend the backend URL
              const isAbsolute = userData.profile_pic_url.startsWith('http');
              const picUrl = isAbsolute
                ? userData.profile_pic_url
                : `${config.API_BASE_URL}${userData.profile_pic_url}`;
              localStorage.setItem('profile_pic', picUrl);
            } else {
              localStorage.setItem('profile_pic', require('../styles/images/loginIcon.svg'));
            }
            window.dispatchEvent(new Event('profilePicUpdated'));
          } else {
            // fallback to default if user fetch fails
            localStorage.setItem('profile_pic', require('../styles/images/loginIcon.svg'));
            window.dispatchEvent(new Event('profilePicUpdated'));
          }
        } catch (e) {
          localStorage.setItem('profile_pic', require('../styles/images/loginIcon.svg'));
          window.dispatchEvent(new Event('profilePicUpdated'));
        }
        //Navigate to the main home page once logged in
        navigate('/home');
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
      <hr className="login-divider" />
      <div className="login-redirect">
        <p>Don't have an account yet?</p>
        <a href="/register" className="login-btn">
          Sign up
        </a>
      </div>
    </form>
  </section>
  );
};

export default Login;