import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus } from 'lucide-react';

export default function AdminPanel({ auth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await axios.post('/api/admin/users', { username, password, isAdminUser }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setMsg('User created successfully!');
      setUsername('');
      setPassword('');
      setIsAdminUser(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <UserPlus size={28} color="var(--primary)" />
        <h2>Create New User</h2>
      </div>

      {error && <div className="alert">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <form onSubmit={handleCreateUser}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Username</label>
          <input 
            type="text" 
            required 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
          <input 
            type="checkbox" 
            id="isAdmin"
            checked={isAdminUser}
            onChange={e => setIsAdminUser(e.target.checked)}
            style={{ width: 'auto', marginBottom: 0 }}
          />
          <label htmlFor="isAdmin" style={{ cursor: 'pointer' }}>Grant Admin Privileges</label>
        </div>
        <button type="submit" className="btn">
          Create User
        </button>
      </form>
    </div>
  );
}
