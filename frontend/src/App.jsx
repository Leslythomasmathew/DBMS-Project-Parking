import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginRegister from './pages/Auth/LoginRegister';
import Dashboard from './pages/User/Dashboard';
import MyBookings from './pages/User/MyBookings';
import ManagerDashboard from './pages/Manager/ManagerDashboard';
import './App.css';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="loader">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" />;
  
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'manager' ? '/manager' : '/dashboard'} />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<LoginRegister />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute role="user">
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute role="user">
                <MyBookings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manager/*" 
            element={
              <ProtectedRoute role="manager">
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
