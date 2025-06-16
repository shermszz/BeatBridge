import React from 'react';
import { Link, useNavigate, useLocation} from 'react-router-dom';
import profileIcon from '../styles/images/loginIcon.svg';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('user_id');

  const handleLogout = async () => {
    try {
     await fetch('http://localhost:5000/api/logout', {
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

  //To detect when the user is on login / register pages and conditionally render simplified navigation links
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className={isLanding ? 'landing-header' : ' '}>
      <div className="logo">
        BeatBridge
      </div>

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
      ) : (!isLoggedIn && isAuthPage) ? ( //If not logged in and on the Login / Register pages, show only the Home button and Login link
        <nav>
          <Link to='/landing'>Home</Link>
          <Link to='/login'>Login</Link>
        </nav>
      ) : (
      <nav>
        {isLoggedIn ? (
          <div className="dashboard-buttons">
            <Link to="/home" className="dash-btn">Home</Link>
            <Link to="/song-recommendation" className="dash-btn">Song Recommendation</Link>
            <Link to="/rhythm-trainer" className="dash-btn">Rhythm Trainer</Link>
            <Link to="/jam-session" className="dash-btn">Jam Session</Link>
            <Link to="/profile" className="dash-btn">Profile</Link>
            <button className="dash-btn" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      )}
    </header>
  );
};

export default Header;