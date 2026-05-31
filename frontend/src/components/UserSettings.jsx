import React, { useState } from 'react';
import axios from 'axios';
import { Settings, Lock, User } from 'lucide-react';

export default function UserSettings({ auth, onUpdateAuth }) {
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const res = await axios.put('/api/users/username', { newUsername }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      onUpdateAuth(res.data);
      setMsg('Username updated successfully!');
      setNewUsername('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update username');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await axios.put('/api/users/password', { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password');
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Settings size={28} color="var(--primary)" />
        <h2>User Settings</h2>
      </div>

      {error && <div className="alert">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div style={{ marginBottom: '3rem' }}>
        <h3><User size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Change Username</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Current Username: <strong>{auth.username}</strong>
        </p>
        <form onSubmit={handleUpdateUsername}>
          <input 
            type="text" 
            placeholder="New Username" 
            value={newUsername} 
            onChange={e => setNewUsername(e.target.value)} 
            required 
          />
          <button type="submit" className="btn">Update Username</button>
        </form>
      </div>

      <div>
        <h3><Lock size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Change Password</h3>
        <form onSubmit={handleUpdatePassword} style={{ marginTop: '1rem' }}>
          <input 
            type="password" 
            placeholder="Current Password" 
            value={currentPassword} 
            onChange={e => setCurrentPassword(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="New Password" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="btn">Update Password</button>
        </form>
      </div>
        {/* Delete Account */}
        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <h3><Lock size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Delete Account</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            This action will permanently delete your account and all associated files. This cannot be undone.
          </p>
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
              try {
                await axios.delete('/api/users/me', { headers: { Authorization: `Bearer ${auth.token}` } });
                // Clear auth and redirect to login page
                onUpdateAuth(null);
                window.location.href = '/login';
              } catch (err) {
                setError(err.response?.data?.error || 'Failed to delete account');
              }
            }}
          >
            Delete My Account
          </button>
        </div>
        </div>
  );
}
