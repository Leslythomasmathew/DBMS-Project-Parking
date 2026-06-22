import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-content">
        <h1 className="hero-title">
          The future of <span className="highlight">Parking</span> is here.
        </h1>
        <p className="hero-subtitle">
          Experience seamless, real-time parking slot management with our premium dashboard. Book, Pay, and Monitor effortlessly.
        </p>
        <div className="hero-actions">
          <Link to="/auth" className="btn btn-primary btn-lg">Get Started</Link>
          <Link to="/auth" className="btn btn-outline btn-lg">Manager Login</Link>
        </div>
      </div>
      <div className="hero-visual">
        <div className="visual-circle circle-1"></div>
        <div className="visual-circle circle-2"></div>
      </div>
    </div>
  );
};

export default Home;
