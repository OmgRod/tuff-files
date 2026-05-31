import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Settings, Check, Edit2 } from 'lucide-react';

export default function AdminPanel({ auth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // New state for user list and cap editing
  const [users, setUsers] = useState([]);
  const [capInputs, setCapInputs] = useState({}); // {userId: {capMB, enabled}}

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setUsers(res.data);
      // Initialize capInputs
      const init = {};
      res.data.forEach(u => {
        init[u.id] = { capMB: u.storageCap, enabled: u.storageCapEnabled };
      });
      setCapInputs(init);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleCapUpdate = async (userId) => {
    const { capMB, enabled } = capInputs[userId];
    try {
      await axios.put(`/api/admin/users/${userId}/cap`, { capMB: Number(capMB), storageCapEnabled: enabled }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setMsg('Storage cap updated');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update cap');
    }
  };

  const updateCapInput = (userId, field, value) => {
    setCapInputs(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value }
    }));
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <UserPlus size={28} color="var(--primary)" />
        <h2>Create New User</h2>
      </div>

      {error && <div className="alert">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label htmlFor="username" className="mb-1">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="input"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isAdmin"
            type="checkbox"
            checked={isAdminUser}
            onChange={e => setIsAdminUser(e.target.checked)}
          />
          <label htmlFor="isAdmin" style={{ cursor: 'pointer' }}>Grant Admin Privileges</label>
        </div>
        <button type="submit" className="btn">
          Create User
        </button>
      </form>

      {/* Users table with storage cap editing */}
      <table className="mt-6 w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Username</th>
            <th className="p-2 text-left">Cap (MB)</th>
            <th className="p-2 text-left">Enabled</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td className="p-2">{user.username}</td>
              <td className="p-2">
                <input
                  type="number"
                  value={capInputs[user.id]?.capMB || ''}
                  onChange={e => updateCapInput(user.id, 'capMB', e.target.value)}
                  className="input w-20"
                />
              </td>
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={capInputs[user.id]?.enabled || false}
                  onChange={e => updateCapInput(user.id, 'enabled', e.target.checked)}
                />
              </td>
              <td className="p-2">
                <button
                  className="btn btn-sm"
                  onClick={() => handleCapUpdate(user.id)}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
