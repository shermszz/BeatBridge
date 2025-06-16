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
        //Navigate to the main home page once logged in
        navigate('/home');
      } else {
        setErrors(data.errors || {});
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrors({ general: 'Login failed. Please try again.' });
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
        {errors && errors.username && (
          <div className="error-message">{errors.username}</div>
        )}
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
      <hr
        style={{
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
          border: "none",
          borderTop: "1.5px solid #fff",
          opacity: "0.3",
        }}
      />
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