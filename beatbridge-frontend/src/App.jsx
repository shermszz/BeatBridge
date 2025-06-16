import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Customisation from './pages/Customisation';
import Upload from './pages/Upload';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Landing page for new users */}
          <Route path="/" element={<Landing />} />

          {/* Home page for logged-in users */}
          <Route path="/home" element={<Home />} />

          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Page to gather user preferences after registration */}
          <Route path="/customisation" element={<Customisation />} />
          
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;