import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if system has users
    axios.get('/api/status').then(res => {
      setIsFirstSetup(!res.data.hasUsers);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isFirstSetup) {
        await axios.post('/api/register-first', { username, password });
        setIsFirstSetup(false);
        setError('Admin created! You can now log in.');
      } else {
        const res = await axios.post('/api/login', { username, password });
        onLogin(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'var(--primary)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Lock size={32} color="white" />
          </div>
          <h2>{isFirstSetup ? 'Initial Admin Setup' : 'Welcome Back'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {isFirstSetup ? 'Create the first administrator account.' : 'Log in to your account.'}
          </p>
        </div>

        {error && <div className={isFirstSetup && error.includes('created') ? 'alert alert-success' : 'alert'}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Username</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="admin"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>
            {isFirstSetup ? 'Create Admin' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
