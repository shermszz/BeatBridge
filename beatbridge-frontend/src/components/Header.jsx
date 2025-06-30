import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation} from 'react-router-dom';
import profileIcon from '../styles/images/loginIcon.png';
import defaultProfile from '../styles/images/loginIcon.png';
import logo from '../styles/images/Beatbridge.png';
import '../styles/Header.css';
import config from '../config';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePic, setProfilePic] = useState(profileIcon);
  const dropdownRef = useRef(null);
  const dropdownTimeout = useRef();

  const getProfilePicUrl = (pic) => {
    if (!pic) return defaultProfile;
    if (typeof pic === 'string' && pic.startsWith('http')) return pic;
    if (typeof pic === 'string' && pic.startsWith('/')) return `${config.API_BASE_URL}${pic}`;
    return defaultProfile;
  };

  useEffect(() => {
    const updateProfilePic = () => {
      setProfilePic(getProfilePicUrl(localStorage.getItem('profile_pic')));
    };
    window.addEventListener('profilePicUpdated', updateProfilePic);
    return () => window.removeEventListener('profilePicUpdated', updateProfilePic);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${config.API_BASE_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      localStorage.removeItem('user_id');
      localStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('user_id');
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const onLoginIconClick = () => {
    navigate('/login');
  }

  const handleGetStarted = () => {
    navigate('/register');
  }

  const isLanding = location.pathname === '/landing';
  const isCustomisation = location.pathname === '/customisation';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isVerificationPage = location.pathname === '/verify-email';

  // Dropdown handlers with delay
  const handleProfileMouseEnter = () => {
    clearTimeout(dropdownTimeout.current);
    setShowDropdown(true);
  };
  const handleProfileMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setShowDropdown(false), 220);
  };
  const handleDropdownMouseEnter = () => {
    clearTimeout(dropdownTimeout.current);
    setShowDropdown(true);
  };
  const handleDropdownMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setShowDropdown(false), 220);
  };

  return (
    <header className={isLanding || isVerificationPage ? 'landing-header' : ' '}>
      <div
        className="logo-group"
        onClick={() => {
          if (isLanding || isAuthPage || isVerificationPage) navigate('/landing');
        }}
        style={{ cursor: (isLanding || isAuthPage || isVerificationPage) ? 'pointer' : 'default' }}
      >
        <img src={logo} alt="BeatBridge logo" className="header-logo-img" />
        <span className="logo">BeatBridge</span>
      </div>

      {/* Show navigation only if not on customisation page */}
      {!isCustomisation && (
        <>
          {/* If user is on landing page and not logged in, show register button and login icon */}
          {isLanding && !isLoggedIn ? (
            <div className="landing-actions">
              <button className="header-get-started-btn" onClick={handleGetStarted}>
                Let's Get Started
              </button>
              <button onClick={() => navigate('/login')} className="login-button">
                <img
                  src={profileIcon}
                  alt="Login"
                  className="login-icon"
                />
              </button>
            </div>
          ) : isVerificationPage ? (
            <nav>
              <Link to='/landing'>Home</Link>
              <Link to='/login'>Login</Link>
            </nav>
          ) : (!isLoggedIn && isAuthPage) ? (
            <nav>
              <Link to='/landing'>Home</Link>
              <Link to='/login'>Login</Link>
            </nav>
          ) : (
            <nav>
              {isLoggedIn && !isVerificationPage ? (
                <div className="dashboard-buttons">
                  <Link to="/home" className="dash-btn">Home</Link>
                  <Link to="/song-recommendation" className="dash-btn">Song Recommendation</Link>
                  <Link to="/rhythm-trainer" className="dash-btn">Rhythm Trainer</Link>
                  <Link to="/jam-session" className="dash-btn">Jam Session</Link>
                  {/* Profile Icon Dropdown */}
                  <div
                    className="profile-dropdown-wrapper"
                    onMouseEnter={handleProfileMouseEnter}
                    onMouseLeave={handleProfileMouseLeave}
                    ref={dropdownRef}
                  >
                    <img
                      src={profilePic || profileIcon}
                      alt="Profile"
                      className="header-profile-icon"
                      onClick={() => setShowDropdown(!showDropdown)}
                    />
                    {showDropdown && (
                      <div
                        className="profile-dropdown-menu"
                        onMouseEnter={handleDropdownMouseEnter}
                        onMouseLeave={handleDropdownMouseLeave}
                      >
                        <Link to="/profile" className="profile-dropdown-item">My Profile</Link>
                        <div className="profile-dropdown-item">
                          <button onClick={handleLogout}>Logout</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </nav>
          )}
        </>
      )}
    </header>
  );
};

export default Header;