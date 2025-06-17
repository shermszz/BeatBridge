import React, { useRef, useState } from 'react';
import defaultProfile from '../styles/images/loginIcon.svg';
import '../styles/Profile.css';

const Profile = () => {
  // Example user data (replace with real data fetching in production)
  const [profilePic, setProfilePic] = useState(defaultProfile);
  const [form, setForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const fileInputRef = useRef();

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: Save changes to backend
    alert('Changes saved!');
  };

  return (
    <div className="profile-container">
      <h2>My account</h2>
      <hr className="profile-divider" />
      <div className="profile-content">
        <div className="profile-pic-section">
          <img src={profilePic} alt="Profile" className="profile-pic" />
          <input
            type="file"
            accept="image/*"
            className="profile-file-input"
            ref={fileInputRef}
            onChange={handleProfilePicChange}
          />
          <button
            className="profile-pic-btn"
            type="button"
            onClick={() => fileInputRef.current.click()}
          >
            Change profile picture
          </button>
        </div>
        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-row">
            <div className="profile-field">
              <label>Username</label>
              <input type="text" name="username" value={form.username} onChange={handleInputChange} disabled />
            </div>
            <div className="profile-field">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleInputChange} disabled />
            </div>
          </div>
          <div className="profile-row">
            <div className="profile-field">
              <label>First name</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleInputChange} />
            </div>
            <div className="profile-field">
              <label>Last name</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleInputChange} />
            </div>
          </div>
          <div className="profile-row">
            <div className="profile-field">
              <label>Change password</label>
              <input type="password" name="password" value={form.password} onChange={handleInputChange} />
            </div>
            <div className="profile-field">
              <label>Confirm new password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleInputChange} />
            </div>
          </div>
          <div className="profile-save-row">
            <button className="profile-save-btn" type="submit">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile; 