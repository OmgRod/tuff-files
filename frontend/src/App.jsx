import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LogOut, Shield, HardDrive, Globe, LogIn, Settings, ShieldAlert } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import PublicFeed from './components/PublicFeed';
import UserSettings from './components/UserSettings';
import FileDetails from './components/FileDetails';
import Policies from './components/Policies';

function Navigation({ auth, handleLogout }) {
  const location = useLocation();
  return (
    <nav className="nav-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <HardDrive size={32} color="#818cf8" />
        <h1><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>TuffFiles</Link></h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/public" className="btn btn-outline">
          <Globe size={18} /> Public Feed
        </Link>
        {auth ? (
          <>
            <span>Welcome, <strong>{auth.username}</strong></span>
            <Link to="/" className="btn btn-outline">My Files</Link>
            <Link to="/settings" className="btn btn-outline" title="Settings">
              <Settings size={18} />
            </Link>
            {auth.isAdmin && (
              <Link to="/admin" className="btn btn-outline" title="Admin Panel">
                <Shield size={18} />
              </Link>
            )}
            <button className="btn btn-danger" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          location.pathname !== '/login' && (
            <Link to="/login" className="btn btn-outline">
              <LogIn size={18} /> Login
            </Link>
          )
        )}
      </div>
    </nav>
  );
}

function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (token) {
      setAuth({ token, username, isAdmin });
    }
    setLoading(false);
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('isAdmin', data.isAdmin);
    setAuth(data);
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuth(null);
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <div className="container">
        <Navigation auth={auth} handleLogout={handleLogout} />
        
        <Routes>
          <Route path="/public" element={<PublicFeed />} />
          <Route path="/file/:id" element={<FileDetails />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/login" element={!auth ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={auth ? <Dashboard auth={auth} /> : <Navigate to="/public" />} />
          <Route path="/settings" element={auth ? <UserSettings auth={auth} onUpdateAuth={handleLogin} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={auth?.isAdmin ? <AdminPanel auth={auth} /> : <Navigate to="/" />} />
        </Routes>

        <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: '2rem', paddingBottom: '2rem' }}>
          <p>© 2026 TuffFiles. All rights reserved.</p>
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/policies" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms of Service & Privacy Policy</Link>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
