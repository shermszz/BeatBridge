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
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors(data.errors || { general: "Login failed. Please check your credentials." });
      } else {
        // Success: navigate to home or dashboard
        navigate('/'); // or wherever you want to redirect after login
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