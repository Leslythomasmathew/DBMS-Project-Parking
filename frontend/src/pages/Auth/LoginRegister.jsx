import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './LoginRegister.css';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    newPassword: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (isForgotPassword) {
        const { data } = await api.put('/auth/reset-password', {
          email: formData.email,
          phone: formData.phone,
          newPassword: formData.newPassword
        });
        setSuccess(data.message);
        setTimeout(() => {
          setIsForgotPassword(false);
          setSuccess(null);
        }, 3000);
      } else if (isLogin) {
        const { data } = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        login(data);
        if(data.role === 'manager') {
          navigate('/manager');
        } else {
          navigate('/dashboard');
        }
      } else {
        const { data } = await api.post('/auth/register', formData);
        login(data);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <h2>{isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        
        {error && <div className="alert-error" style={{marginBottom: '1rem'}}>{error}</div>}
        {success && <div className="alert-success" style={{marginBottom: '1rem'}}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && !isForgotPassword && (
            <input 
              type="text" 
              name="name" 
              className="input-field" 
              placeholder="Full Name" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <input 
            type="email" 
            name="email" 
            className="input-field" 
            placeholder="Email Address" 
            value={formData.email}
            onChange={handleChange}
            required
          />

          {(!isLogin || isForgotPassword) && (
            <input 
              type="tel" 
              name="phone" 
              className="input-field" 
              placeholder="Registered Phone (10 digits)" 
              value={formData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              title="Phone number must be exactly 10 digits"
              maxLength="10"
              required
            />
          )}

          {!isForgotPassword && (
            <input 
              type="password" 
              name="password" 
              className="input-field" 
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          )}

          {isForgotPassword && (
            <input 
              type="password" 
              name="newPassword" 
              className="input-field" 
              placeholder="New Secure Password" 
              value={formData.newPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
          )}

          <button type="submit" className="btn btn-primary w-100 mt-4">
            {isForgotPassword ? 'Reset Password' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        {!isForgotPassword && (
          <p className="toggle-auth" style={{ marginTop: '1rem' }}>
            {isLogin ? "Forgot your password? " : ""}
            {isLogin && <span onClick={() => {setIsForgotPassword(true); setError(null);}} className="toggle-link">Reset it here</span>}
          </p>
        )}

        <p className="toggle-auth">
          {isForgotPassword ? "Back to " : isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => {
              isForgotPassword ? setIsForgotPassword(false) : setIsLogin(!isLogin);
              setError(null);
            }} 
            className="toggle-link"
          >
            {isForgotPassword ? 'Login' : isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>

      </div>
    </div>
  );
};

export default LoginRegister;
