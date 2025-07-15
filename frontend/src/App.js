import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Button, Badge } from 'react-bootstrap';
import { useQueryClient } from '@tanstack/react-query';

import Login from './components/Login/Login';
import NotificationToast from './components/shared/ToastContainer';
import InstallationPage from './components/InstallationPage/InstallationPage'

import './App.css';
import { useAuth } from './hooks/useAuth';

function App() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const queryClient = useQueryClient();

  const [user, setUser] = useState(() => {
    if (!localStorage.getItem('token')) return null
    return {
      username: localStorage.getItem('username'),
    }
  })
  const [showWarningToast, setShowWarningToast] = useState(false)

  useEffect(() => {
    const onSessionExpired = () => {
      setShowWarningToast(true)
      handleLogout()
    }

    window.addEventListener('session-expired', onSessionExpired)
    return () => window.removeEventListener('session-expired', onSessionExpired)
  }, [navigate])

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    localStorage.setItem('token', authToken);
    localStorage.setItem('username', userData.username);
    // In an app with many routes and redirects, we could define each route as a constant for reuse.
    // Example: const DASHBOARD_URL = '/dashboard'
    navigate('/dashboard', { replace: true })
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    queryClient.clear();
  };

  return (
    <div className="App">
      <NotificationToast
        show={showWarningToast}
        onClose={() => setShowWarningToast(false)}
        title="Session expired"
        message="Your session has expired. Please log in again."
      />

      {user ? (<header className="App-header">
        {user && (
          <div className="user-info d-flex align-items-center gap-2">
            <div className="profile-pic me-2">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#ccc" />
                <circle cx="16" cy="12" r="6" fill="#eee" />
                <path
                  d="M16 20c-6 0-8 4-8 6v2h16v-2c0-2-2-6-8-6z"
                  fill="#eee"
                />
              </svg>
            </div>
            <div className="d-flex flex-column align-items-start">
              <div>
                <span>Welcome, {user.username}</span>
              </div>
              <div className="mt-1">
                You’re logged as <Badge bg="primary" className="ms-2">{role}</Badge>
              </div>
            </div>
            <Button className="btn-gradient ms-auto" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </header>) : (<></>)}

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <InstallationPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
