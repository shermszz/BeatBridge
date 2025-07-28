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
import Chapter0pg4 from './pages/Chapter0/Chapter0pg4';
import Chapter0pg5 from './pages/Chapter0/Chapter0pg5';
import Chapter0pg6 from './pages/Chapter0/Chapter0pg6';
import Chapter0Dashboard from './pages/Chapter0/Chapter0Dashboard';
import JamSession from './pages/JamSession';
import SharedLoops from './pages/SharedLoops';
import ProgressProtectedRoute from './components/ProgressProtectedRoute';
import Chapter1ProgressProtectedRoute from './components/Chapter1ProgressProtectedRoute';
import Chapter1pg1 from './pages/Chapter1/Chapter1pg1';
import Chapter1pg2 from './pages/Chapter1/Chapter1pg2';
import Chapter1pg3 from './pages/Chapter1/Chapter1pg3';
import Chapter1pg4 from './pages/Chapter1/Chapter1pg4';
import Chapter1pg5 from './pages/Chapter1/Chapter1pg5';
import Chapter1pg6 from './pages/Chapter1/Chapter1pg6';
import Chapter3pg1 from './pages/Chapter3/Chapter3pg1';
import Chapter1Dashboard from './pages/Chapter1/Chapter1Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />

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
            <ProgressProtectedRoute requiredProgress={2}>
              <Chapter0pg2 />
            </ProgressProtectedRoute>
          } />
          <Route path="/chapter0pg3" element={
            <ProgressProtectedRoute requiredProgress={3}>
              <Chapter0pg3 />
            </ProgressProtectedRoute>
          } />
          <Route path="/chapter0pg4" element={
            <ProgressProtectedRoute requiredProgress={4}>
              <Chapter0pg4 />
            </ProgressProtectedRoute>
          } />
          <Route path="/chapter0pg5" element={
            <ProgressProtectedRoute requiredProgress={5}>
              <Chapter0pg5 />
            </ProgressProtectedRoute>
          } />
          <Route path="/chapter0-dashboard" element={
            <ProtectedRoute requireVerification={true}>
              <Chapter0Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/chapter0pg6" element={
            <ProtectedRoute requireVerification={true}>
              <Chapter0pg6 />
            </ProtectedRoute>
          } />
          <Route path="/jam-session" element={
            <ProtectedRoute requireVerification={true}>
              <JamSession />
            </ProtectedRoute>
          } />
          <Route path="/chapter1-dashboard" element={
            <ProtectedRoute requireVerification={true}>
              <Chapter1Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/chapter1pg1" element={
            <ProtectedRoute requireVerification={true}>
              <Chapter1pg1 />
            </ProtectedRoute>
          } />
          <Route path="/chapter1pg2" element={
            <Chapter1ProgressProtectedRoute requiredProgress={2}>
              <Chapter1pg2 />
            </Chapter1ProgressProtectedRoute>
          } />
          <Route path="/chapter1pg3" element={
            <Chapter1ProgressProtectedRoute requiredProgress={3}>
              <Chapter1pg3 />
            </Chapter1ProgressProtectedRoute>
          } />
          <Route path="/chapter1pg4" element={
            <Chapter1ProgressProtectedRoute requiredProgress={4}>
              <Chapter1pg4 />
            </Chapter1ProgressProtectedRoute>
          } />
          <Route path="/chapter1pg5" element={
            <Chapter1ProgressProtectedRoute requiredProgress={5}>
              <Chapter1pg5 />
            </Chapter1ProgressProtectedRoute>
          } />
          <Route path="/chapter1pg6" element={
            <ProtectedRoute requireVerification={true}>
              <Chapter1pg6 />
            </ProtectedRoute>
          } />
          <Route path="/chapter2-dashboard" element={
            <ProtectedRoute requireVerification={true}>
              <Chapter3pg1 />
            </ProtectedRoute>
          } />
          <Route path="/shared-loops/:shareId" element={<SharedLoops />} />
          
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;