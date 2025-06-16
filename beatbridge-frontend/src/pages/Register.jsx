import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
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
    const newErrors = {};
  
    // Client-side validation
    if (!formData.username) newErrors.username = "Username required";
    if (!formData.email) newErrors.email = "Email required";
    if (!formData.password) newErrors.password = "Password required";
    if (formData.password !== formData.confirmation) {
      newErrors.confirmation = "Passwords do not match";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop submission if errors exist
    }
  
    // Proceed with server request
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (response.ok) {
        //After successful registration, send user to the customisation page
        //This is where we gather their user preferences
        navigate('/customisation');
      } else {
        setErrors(data.errors || { general: "Registration failed." });
      }
    } catch (error) {
      setErrors({ general: "Network error. Try again later." });
    }
  };

  return (
    <section className="hero">
    <h1>Create your account!</h1>

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
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
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
      </div>
      <div className="mb-3">
        <input
          className="form-control mx-auto w-auto inputdeco my-input"
          name="confirmation"
          placeholder="Re-enter Password"
          type="password"
          value={formData.confirmation}
          onChange={handleChange}
        />
        {errors && errors.username && (
          <div className="error-message">{errors.username}</div>
        )}
        {errors && errors.email && (
          <div className="error-message">{errors.email}</div>
        )}
        {errors && errors.password && (
          <div className="error-message">{errors.password}</div>
        )}
        {errors && errors.confirmation && (
          <div className="error-message">{errors.confirmation}</div>
        )}
      </div>
      <button className="btn btn-primary buttondeco" type="submit">
        Register
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
        <p>Already have an account?</p>
        <a href="/login" className="login-btn">
          Log in
        </a>
      </div>
    </form>
  </section>
  );
};

export default Register;