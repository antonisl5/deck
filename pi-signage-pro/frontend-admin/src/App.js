import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import useStore from './store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MediaLibrary from './pages/MediaLibrary';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const Navigation = () => {
  const { setToken } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  return (
    <nav style={{ background: '#343a40', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ margin: 0, fontSize: '20px' }}>Pi Signage Pro Admin</h1>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard (Layouts)</Link>
        <Link to="/media" style={{ color: '#fff', textDecoration: 'none' }}>Media Library</Link>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

const App = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {isAuthenticated && <Navigation />}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/media"
              element={
                <ProtectedRoute>
                  <MediaLibrary />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
