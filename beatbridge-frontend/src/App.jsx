import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import Customisation from './pages/Customisation';
import Profile from './pages/Profile';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Default route redirects to the landing page */}
          <Route path="/" element={<Navigate to="/landing" replace />} />

          {/* Landing page for new users */}
          <Route path="/landing" element={<Landing />} />

          {/* Home page for logged-in users */}
          <Route path="/home" element={<Home />} />

          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<EmailVerification />} />

          {/* Page to gather user preferences after registration */}
          <Route path="/customisation" element={<Customisation />} />

          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;