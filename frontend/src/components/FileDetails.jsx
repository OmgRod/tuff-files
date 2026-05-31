import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, Download, AlertTriangle } from 'lucide-react';

export default function FileDetails() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`/api/files/${id}/metadata`, { headers });
        setFile(res.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError('This file is private. Please log in if you are the owner.');
        } else {
          setError('File not found or unavailable.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, [id]);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return <div className="container" style={{ textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      {error ? (
        <div style={{ padding: '2rem' }}>
          <AlertTriangle size={48} color="var(--error)" style={{ marginBottom: '1rem' }} />
          <h2>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{error}</p>
          <Link to="/" className="btn" style={{ marginTop: '2rem' }}>Go to Homepage</Link>
        </div>
      ) : (
        <div style={{ padding: '2rem' }}>
          <FileText size={64} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ wordBreak: 'break-all', marginBottom: '0.5rem' }}>{file.filename}</h2>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', margin: '1.5rem 0', textAlign: 'left' }}>
            <p style={{ margin: '0.5rem 0' }}><strong>Size:</strong> {formatSize(file.size)}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Uploaded By:</strong> {file.uploadedBy}</p>
            <p style={{ margin: '0.5rem 0' }}><strong>Date:</strong> {new Date(file.uploadDate).toLocaleString()}</p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Visibility:</strong> <span className={`badge badge-${file.visibility}`}>{file.visibility}</span>
            </p>
          </div>

          <a 
            href={`/api/files/${file.id}/download`} 
            className="btn" 
            style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }} 
            download
          >
            <Download size={24} /> Download File
          </a>
        </div>
      )}
    </div>
  );
}
