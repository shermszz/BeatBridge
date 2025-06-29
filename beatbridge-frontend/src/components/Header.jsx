import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation} from 'react-router-dom';
import profileIcon from '../styles/images/loginIcon.svg';
import defaultProfile from '../styles/images/loginIcon.svg';
import logo from '../styles/images/Beatbridge.png';
import '../styles/Header.css';
import config from '../config';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('user_id');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeout = useRef();
  const getProfilePicUrl = (pic) => {
    if (!pic) return defaultProfile;
    if (typeof pic === 'string' && pic.startsWith('http')) return pic;
    if (typeof pic === 'string' && pic.startsWith('/')) return `${config.API_BASE_URL}${pic}`;
    return defaultProfile;
  };
  const [profilePic, setProfilePic] = useState(getProfilePicUrl(localStorage.getItem('profile_pic')));
  const dropdownRef = useRef();

  useEffect(() => {
    const updateProfilePic = () => {
      setProfilePic(getProfilePicUrl(localStorage.getItem('profile_pic')));
    };
    window.addEventListener('profilePicUpdated', updateProfilePic);
    return () => window.removeEventListener('profilePicUpdated', updateProfilePic);
  }, []);

  const handleLogout = async () => {
    try {
     await fetch(`${config.API_BASE_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.removeItem('user_id');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
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
    setDropdownOpen(true);
  };
  const handleProfileMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 220);
  };
  const handleDropdownMouseEnter = () => {
    clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };
  const handleDropdownMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 220);
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
              <img
                src={profileIcon}
                alt="Login"
                className="login-icon"
                onClick={onLoginIconClick}
              />
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
                      src={profilePic}
                      alt="Profile"
                      className="header-profile-icon"
                    />
                    {dropdownOpen && (
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