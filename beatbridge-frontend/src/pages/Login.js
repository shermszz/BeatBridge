import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    setErrors({});

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user_id', data.user_id);
        navigate('/');
      } else {
        setErrors(data.errors || {});
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({ general: 'Login failed. Please try again.' });
    }
  };

  return (
    <div className="hero">
      <form onSubmit={handleSubmit}>
        <h1>Log in</h1>
        
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <div className="error-message">{errors.username}</div>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <div className="error-message">{errors.password}</div>}
        {errors.general && <div className="error-message">{errors.general}</div>}

        <button type="submit">Log in</button>
        
        <div className="login-redirect">
          <p>Don't have an account yet? <a href="/register" className="login-btn">Sign up</a></p>
        </div>
      </form>
    </div>
  );
};

export default Login;