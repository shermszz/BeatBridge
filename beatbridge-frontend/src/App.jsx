import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import Customisation from './pages/Customisation';
import Profile from './pages/Profile';
import SongRecommendation from './pages/SongRecommendation';
import RhythmTrainer from './pages/RhythmTrainer';
import RhythmTrainerChapters from './pages/RhythmTrainerChapters';
import Chapter0pg1 from './pages/Chapter0/Chapter0pg1';
import Chapter0pg2 from './pages/Chapter0/Chapter0pg2';
import Chapter0pg3 from './pages/Chapter0/Chapter0pg3';
import JamSession from './pages/JamSession';
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
          <Route path="/home" element={
            <ProtectedRoute requireVerification={true}>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<EmailVerification />} />

          {/* Page to gather user preferences after registration and email verification */}
          <Route path="/customisation" element={
            <ProtectedRoute requireVerification={true}>
              <Customisation />
            </ProtectedRoute>
          } />

          {/* Pages to Features */}
          <Route path="/profile" element={
            <ProtectedRoute requireVerification={true}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/song-recommendation" element={
            <ProtectedRoute requireVerification={true}>
              <SongRecommendation />
            </ProtectedRoute>
          } />
          <Route path="/rhythm-trainer" element={
            <ProtectedRoute requireVerification={true}>
              <RhythmTrainer />
            </ProtectedRoute>
          } />
          <Route path="/rhythm-trainer-chapters" element={
            <ProtectedRoute requireVerification={true}>
              <RhythmTrainerChapters />
            </ProtectedRoute>
          } />
          <Route path="/chapter-0" element={
            <ProtectedRoute requireVerification={true}>
              <Chapter0pg1 />
            </ProtectedRoute>
          } />
          <Route path="/chapter0pg2" element={
            <ProtectedRoute requireVerification={true}>
              <Chapter0pg2 />
            </ProtectedRoute>
          } />
          <Route path="/chapter0pg3" element={
            <ProtectedRoute requireVerification={true}>
              <Chapter0pg3 />
            </ProtectedRoute>
          } />
          <Route path="/jam-session" element={
            <ProtectedRoute requireVerification={true}>
              <JamSession />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;