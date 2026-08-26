import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Video, Upload, CheckCircle2, ShieldCheck, X, Trash2, Plus } from 'lucide-react';
import axios from 'axios';

export default function MediaLibraryModal({ isOpen, onClose, onSelectAssets, selectedAssetIds = [] }) {
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(selectedAssetIds);
  const [errorMsg, setErrorMsg] = useState(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedIds(selectedAssetIds);
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    try {
      const res = await axios.get('/api/social/media', getHeaders());
      if (res.data.success) {
        setAssets(res.data.assets);
      }
    } catch (err) {
      console.error('Failed to load media library', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/social/media/upload', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setAssets(prev => [res.data.asset, ...prev]);
        setSelectedIds(prev => [...prev, res.data.asset._id]);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirm = () => {
    const chosen = assets.filter(a => selectedIds.includes(a._id));
    if (onSelectAssets) onSelectAssets(chosen);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 900, width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Central Media Library</h3>
            <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>Browse uploaded assets or attach new images & videos to your posts.</p>
          </div>
          <button className="btn-secondary" style={{ padding: '0.4rem' }} onClick={onClose}><X size={20} /></button>
        </div>

        {errorMsg && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{errorMsg}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <label className="btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={18} />
            {uploading ? 'Scanning & Uploading...' : 'Upload Media Asset'}
            <input type="file" accept="image/*,video/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            {selectedIds.length} assets selected
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', paddingRight: '0.5rem' }}>
          {assets.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
              <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p className="muted">No media assets found. Upload your first image or video!</p>
            </div>
          ) : (
            assets.map(asset => {
              const isSelected = selectedIds.includes(asset._id);
              const isVideo = asset.mediaType === 'video' || (asset.mimetype && asset.mimetype.startsWith('video/'));

              return (
                <div
                  key={asset._id}
                  onClick={() => toggleSelect(asset._id)}
                  style={{
                    position: 'relative',
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                    background: '#0f172a',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isVideo ? (
                    <div style={{ height: 140, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Video size={36} style={{ opacity: 0.7 }} />
                    </div>
                  ) : (
                    <img src={asset.url} alt={asset.originalName} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                  )}

                  {isSelected && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: '#6366f1', borderRadius: '50%', padding: 2 }}>
                      <CheckCircle2 size={20} color="#fff" />
                    </div>
                  )}

                  <div style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {asset.originalName}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted, #94a3b8)', marginTop: '0.25rem' }}>
                      <span>{(asset.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                      <span style={{ color: '#4ade80', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <ShieldCheck size={12} /> {asset.scanStatus}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', pt: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleConfirm}>Attach {selectedIds.length} Assets</button>
        </div>
      </div>
    </div>
  );
}
