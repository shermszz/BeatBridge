import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmation: ''
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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setErrors(data.errors || {});
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ general: 'Registration failed. Please try again.' });
    }
  };

  return (
    <div className="hero">
      <form onSubmit={handleSubmit}>
        <h1>Create your account!</h1>
        
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

        <input
          type="password"
          name="confirmation"
          placeholder="Confirm Password"
          value={formData.confirmation}
          onChange={handleChange}
        />
        {errors.confirmation && <div className="error-message">{errors.confirmation}</div>}

        <button type="submit">Register</button>
        
        <div className="login-redirect">
          <p>Already have an account? <a href="/login" className="login-btn">Log in</a></p>
        </div>
      </form>
    </div>
  );
};

export default Register;