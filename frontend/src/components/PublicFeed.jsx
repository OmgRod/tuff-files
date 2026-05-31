import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Globe, ExternalLink } from 'lucide-react';

export default function PublicFeed() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  const fetchFiles = async () => {
    try {
      const res = await axios.get('/api/public/files');
      setFiles(res.data);
    } catch (err) {
      setError('Failed to fetch public files');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Globe size={28} color="var(--primary)" />
        <h2>Public Feed</h2>
      </div>
      {error && <div className="alert">{error}</div>}
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Size</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map(f => (
              <tr key={f.id}>
                <td>{f.filename}</td>
                <td>{formatSize(f.size)}</td>
                <td>{f.uploadedBy}</td>
                <td>{new Date(f.uploadDate).toLocaleDateString()}</td>
                <td>
                  <Link to={`/file/${f.id}`} className="btn btn-outline" style={{ padding: '0.5rem' }}>
                    <ExternalLink size={16} /> View Details
                  </Link>
                </td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No public files found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
