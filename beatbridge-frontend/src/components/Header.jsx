import React from 'react';
import { Link, useNavigate, useLocation} from 'react-router-dom';
import profileIcon from '../styles/images/loginIcon.svg';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('user_id');

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.removeItem('user_id');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const onLoginIconClick = () => {
    navigate('/login');
  }

  const isLanding = location.pathname === '/landing';

  return (
    <header className={isLanding ? 'landing-header' : ' '}>
      <div className="logo">
        BeatBridge
      </div>

      {/* If user is on landing page and not logged in, show login icon */}
      {isLanding && !isLoggedIn ? (
        <img src={profileIcon} alt = "Login" 
        className='login-icon' onClick={onLoginIconClick} />
      ) : (
      <nav>
        {/* Otherwise, Home link points to the landing page for logged-in users */}
        <Link to='/landing'>Home</Link>
        <Link to="/about">About</Link>
        {isLoggedIn ? (
          <>
            <Link to="/upload">Upload</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
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