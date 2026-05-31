import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Trash2, Link as LinkIcon, Edit2, Check } from 'lucide-react';

export default function Dashboard({ auth }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibility, setVisibility] = useState('private');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editVisibility, setEditVisibility] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchFiles = async () => {
    try {
      const res = await axios.get('/api/files', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setFiles(res.data);
    } catch (err) {
      setError('Failed to fetch files');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e) => {
    if (!e.target.files[0]) return;
    setUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('visibility', visibility);

    try {
      await axios.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${auth.token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      fetchFiles();
      e.target.value = null; // reset input
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/files/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      fetchFiles();
    } catch (err) {
      setError('Delete failed. You may not have permission.');
    }
  };

  const handleUpdateVisibility = async (id) => {
    try {
      await axios.put(`/api/files/${id}/visibility`, { visibility: editVisibility }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setEditingId(null);
      fetchFiles();
    } catch (err) {
      setError('Failed to update visibility');
    }
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/file/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-panel">
      <h2>Your Dashboard</h2>
      {error && <div className="alert">{error}</div>}
      
      <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Upload New File</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <select value={visibility} onChange={e => setVisibility(e.target.value)}>
            <option value="private">Private (Only You)</option>
            <option value="public">Public (Shows in Feed)</option>
            <option value="unlisted">Unlisted (Hidden but Accessible via Link)</option>
          </select>

          <label className="btn" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Select & Upload File'}
            <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        {uploading && (
          <div className="progress-bg">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Visibility</th>
              <th>Size</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(f => (
              <tr key={f.id}>
                <td style={{ wordBreak: 'break-all' }}>{f.filename}</td>
                <td>
                  {editingId === f.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <select 
                        value={editVisibility} 
                        onChange={e => setEditVisibility(e.target.value)}
                        style={{ padding: '0.25rem', margin: 0, fontSize: '0.8rem' }}
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                      </select>
                      <button className="btn btn-outline" style={{ padding: '0.25rem' }} onClick={() => handleUpdateVisibility(f.id)}>
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge badge-${f.visibility || 'private'}`}>
                        {f.visibility || 'private'}
                      </span>
                      {(auth.isAdmin || auth.username === f.uploadedBy) && (
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.25rem', border: 'none' }} 
                          onClick={() => { setEditingId(f.id); setEditVisibility(f.visibility || 'private'); }}
                          title="Edit Visibility"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td>{formatSize(f.size)}</td>
                <td>{f.uploadedBy}</td>
                <td>{new Date(f.uploadDate).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.5rem' }} 
                      onClick={() => copyLink(f.id)}
                      title="Copy Share Link"
                    >
                      {copiedId === f.id ? <Check size={16} color="var(--success)" /> : <LinkIcon size={16} />}
                    </button>
                    {(auth.isAdmin || auth.username === f.uploadedBy) && (
                      <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDelete(f.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No files uploaded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
