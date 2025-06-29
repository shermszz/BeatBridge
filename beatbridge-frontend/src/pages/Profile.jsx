import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';
import config from '../config';

const Profile = () => {
  const navigate = useNavigate();
  const defaultProfile = '/loginIcon.svg';
  const [profilePic, setProfilePic] = useState(defaultProfile);
  const [selectedProfilePic, setSelectedProfilePic] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [customizations, setCustomizations] = useState({
    skill_level: '',
    practice_frequency: '',
    favorite_genres: []
  });
  const [isEditingCustomizations, setIsEditingCustomizations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef();

  // Check if user is logged in
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchUserData();
    fetchCustomizations();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setForm(prev => ({
          ...prev,
          username: userData.username,
          email: userData.email
        }));
        // Set profile picture if available
        if (userData.profile_pic_url) {
          const isAbsolute = userData.profile_pic_url.startsWith('http');
          let picUrl = isAbsolute
            ? userData.profile_pic_url
            : `${config.API_BASE_URL}${userData.profile_pic_url}`;
          // Add cache-busting query string
          picUrl += `?t=${Date.now()}`;
          setProfilePic(picUrl);
          localStorage.setItem('profile_pic', picUrl);
        } else {
          setProfilePic(defaultProfile);
          localStorage.setItem('profile_pic', defaultProfile);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCustomizations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/get-customization`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCustomizations({
          skill_level: data.skill_level || '',
          practice_frequency: data.practice_frequency || '',
          favorite_genres: data.favorite_genres ? data.favorite_genres.split(',') : []
        });
      }
    } catch (error) {
      console.error('Error fetching customizations:', error);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedProfilePic(file);
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    setPasswordError('');
    // Password match validation
    if (form.password !== form.confirmPassword) {
      setPasswordError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }
    try {
      // 1. Upload profile picture if selected
      if (selectedProfilePic) {
        const formData = new FormData();
        formData.append('profile_pic', selectedProfilePic);
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.API_BASE_URL}/api/upload-profile-pic`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const data = await response.json();
        if (response.ok && data.profile_pic_url) {
          const isAbsolute = data.profile_pic_url.startsWith('http');
          let picUrl = isAbsolute
            ? data.profile_pic_url
            : `${config.API_BASE_URL}${data.profile_pic_url}`;
          // Add cache-busting query string
          picUrl += `?t=${Date.now()}`;
          setProfilePic(picUrl);
          localStorage.setItem('profile_pic', picUrl);
          window.dispatchEvent(new Event('profilePicUpdated'));
        } else {
          alert(data.error || 'Failed to upload profile picture');
        }
      }
      // 2. Save other profile changes (username, email, password)
      const payload = {
        username: form.username,
        email: form.email
      };
      if (form.password) {
        payload.password = form.password;
      }
      
      const token = localStorage.getItem('token');
      const updateResponse = await fetch(`${config.API_BASE_URL}/api/update-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await updateResponse.json();
      if (updateResponse.ok) {
        alert('Profile changes saved!');
        setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setSelectedProfilePic(null);
      } else if (data.errors) {
        setFormErrors(data.errors);
      } else {
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomizationChange = (type, value) => {
    if (type === 'genres') {
      setCustomizations(prev => ({
        ...prev,
        favorite_genres: prev.favorite_genres.includes(value)
          ? prev.favorite_genres.filter(g => g !== value)
          : [...prev.favorite_genres, value]
      }));
    } else {
      setCustomizations(prev => ({
        ...prev,
        [type]: value
      }));
    }
  };

  const handleSaveCustomizations = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/save-customization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skill_level: customizations.skill_level,
          practice_frequency: customizations.practice_frequency,
          favorite_genres: customizations.favorite_genres
        })
      });

      if (response.ok) {
        setIsEditingCustomizations(false);
        alert('Customizations saved successfully!');
      } else {
        alert('Failed to save customizations');
      }
    } catch (error) {
      console.error('Error saving customizations:', error);
      alert('Error saving customizations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const skillOptions = [
    { value: 'First-timer', description: 'I\'m new to my instrument' },
    { value: 'Beginner', description: 'I only know some basics' },
    { value: 'Intermediate', description: 'I can play many songs' },
    { value: 'Advanced', description: 'I can play most songs & solos' }
  ];

  const practiceOptions = [
    { value: 'Casual', description: '1-2 days / week' },
    { value: 'Regular', description: '3 days / week' },
    { value: 'Unstoppable', description: '4+ days / week' },
    { value: 'Not sure yet', description: 'I\'ll decide later' }
  ];

  const genreOptions = [
    'Rock', 'Pop', 'Blues', 'Funk', 'Jazz', 
    'Metal', 'Hip-Hop', 'Electronic', 'Classical',
    'Alternative & Indie', 'World', 'Country & Roots'
  ];

  return (
    <div className="profile-container">
      {/* My Account Section */}
      <div className="my-account-section">
        <h2>My Account</h2>
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
              Edit profile picture
            </button>
          </div>
          <form className="profile-form" onSubmit={handleSave}>
            <div className="profile-row">
              <div className="profile-field">
                <label>Username</label>
                <input type="text" name="username" value={form.username} onChange={handleInputChange} />
                {formErrors.username && <div className="profile-error">{formErrors.username}</div>}
              </div>
              <div className="profile-field">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleInputChange} />
                {formErrors.email && <div className="profile-error">{formErrors.email}</div>}
              </div>
            </div>
            <div className="profile-row">
              <div className="profile-field">
                <label>Change password</label>
                <input type="password" name="password" value={form.password} onChange={handleInputChange} />
                {passwordError && <div className="profile-error">{passwordError}</div>}
              </div>
              <div className="profile-field">
                <label>Confirm new password</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleInputChange} />
              </div>
            </div>
            <div className="profile-save-row">
              <button className="profile-save-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* My Customizations Section */}
      <div className="customizations-section">
        <h3>My Customisations</h3>
        {!isEditingCustomizations ? (
          <div className="customizations-grid">
            <div className="customization-option">
              <div className="customization-label">Skill Level</div>
              <div className="customization-value">{customizations.skill_level || 'Not set'}</div>
            </div>
            <div className="customization-option">
              <div className="customization-label">Practice Frequency</div>
              <div className="customization-value">{customizations.practice_frequency || 'Not set'}</div>
            </div>
            <div className="customization-option">
              <div className="customization-label">Favorite Genres</div>
              <div className="genre-tags">
                {customizations.favorite_genres.length > 0 ? (
                  customizations.favorite_genres.map(genre => (
                    <span key={genre} className="genre-tag">{genre}</span>
                  ))
                ) : (
                  <span style={{ color: '#888' }}>Not set</span>  
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Skill Level Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <div className="customization-label">What's your current level?</div>
              <div className="customizations-grid">
                {skillOptions.map(({ value, description }) => (
                  <button
                    key={value}
                    type="button"
                    className={`customization-option${customizations.skill_level === value ? ' selected' : ''}`}
                    onClick={() => handleCustomizationChange('skill_level', value)}
                  >
                    <div className="customization-value">{value}</div>
                    <div style={{ fontSize: '0.9rem', color: '#ddd' }}>{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Practice Frequency Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <div className="customization-label">What practice suits you?</div>
              <div className="customizations-grid">
                {practiceOptions.map(({ value, description }) => (
                  <button
                    key={value}
                    type="button"
                    className={`customization-option${customizations.practice_frequency === value ? ' selected' : ''}`}
                    onClick={() => handleCustomizationChange('practice_frequency', value)}
                  >
                    <div className="customization-value">{value}</div>
                    <div style={{ fontSize: '0.9rem', color: '#ddd' }}>{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <div className="customization-label">Pick 1 or more you'd like to play</div>
              <div className="customizations-grid">
                {genreOptions.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    className={`customization-option${customizations.favorite_genres.includes(genre) ? ' selected' : ''}`}
                    onClick={() => handleCustomizationChange('genres', genre)}
                  >
                    {genre}
                    {customizations.favorite_genres.includes(genre) && <span style={{ color: '#ff4f4f', marginLeft: '0.5rem' }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <button
          className="customizations-save-btn"
          onClick={() => {
            if (isEditingCustomizations) {
              handleSaveCustomizations();
            } else {
              setIsEditingCustomizations(true);
            }
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (isEditingCustomizations ? 'Save customizations' : 'Edit customizations')}
        </button>
        
        {isEditingCustomizations && (
          <button
            style={{
              marginLeft: '1rem',
              padding: '0.7rem 2.2rem',
              borderRadius: '2rem',
              border: '2px solid #666',
              background: 'transparent',
              color: '#ddd',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              setIsEditingCustomizations(false);
              fetchCustomizations(); // Reset to original values
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile; 