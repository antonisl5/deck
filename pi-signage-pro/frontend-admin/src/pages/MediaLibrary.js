import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useStore from '../store';

const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:3001`;

const MediaLibrary = () => {
  const [media, setMedia] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const token = useStore((state) => state.token);

  const fetchMedia = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedia(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post(`${API_URL}/api/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setFile(null);
      fetchMedia();
    } catch (err) {
      alert('Upload failed. Note: Max file size is 100MB.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await axios.delete(`${API_URL}/api/media/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMedia();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Media Library</h2>

      <div style={{ marginBottom: '30px', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>Upload Media</h3>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*,video/*"
            style={{ marginBottom: '10px', display: 'block' }}
          />
          <button
            type="submit"
            disabled={!file || uploading}
            style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {media.map(m => (
          <div key={m.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
            {m.mimetype.startsWith('video') ? (
              <video src={`${API_URL}/uploads/${m.filename}`} style={{ width: '100%', height: '150px', objectFit: 'cover' }} controls />
            ) : (
              <img src={`${API_URL}/uploads/${m.filename}`} alt={m.originalname} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            )}
            <div style={{ padding: '10px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.originalname}</p>
              <button
                onClick={() => handleDelete(m.id)}
                style={{ width: '100%', padding: '5px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
