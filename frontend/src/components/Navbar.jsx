import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="nav-brand">
        <Link to="/">🚗 ParkSpot</Link>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            {user.role === 'manager' ? (
              <Link to="/manager" className={location.pathname.includes('/manager') ? 'active' : ''}>Manager Panel</Link>
            ) : (
              <>
                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
                <Link to="/my-bookings" className={location.pathname === '/my-bookings' ? 'active' : ''}>My Bookings</Link>
              </>
            )}
            <div className="user-profile">
              <span className="user-name">Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
            </div>
          </>
        ) : (
          <div className="auth-links">
            <Link to="/auth" className="btn btn-primary">Login / Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
