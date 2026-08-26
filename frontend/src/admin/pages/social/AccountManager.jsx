import React, { useState } from 'react';
import { Share2, Plus, RefreshCw, Trash2, CheckCircle2, AlertTriangle, XCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook Page', color: '#1877f2', icon: 'Facebook' },
  { id: 'instagram', name: 'Instagram Business', color: '#e1306c', icon: 'Instagram' },
  { id: 'linkedin', name: 'LinkedIn Page/Profile', color: '#0a66c2', icon: 'Linkedin' },
  { id: 'twitter', name: 'X (Twitter)', color: '#1da1f2', icon: 'Twitter' },
  { id: 'tiktok', name: 'TikTok Account', color: '#00f2fe', icon: 'Video' },
  { id: 'youtube', name: 'YouTube Channel', color: '#ff0000', icon: 'Youtube' },
  { id: 'pinterest', name: 'Pinterest Business', color: '#e60023', icon: 'Pin' }
];

export default function AccountManager({ accounts = [], onRefreshAccounts }) {
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0].id);
  const [accountName, setAccountName] = useState('');
  const [accountHandle, setAccountHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await axios.post('/api/social/accounts/connect', {
        platform: selectedPlatform,
        accountName: accountName || `${selectedPlatform} Account`,
        accountHandle
      }, getHeaders());

      if (res.data.success) {
        setActionMessage({ type: 'success', text: `Successfully connected ${res.data.account.accountName}!` });
        setConnectModalOpen(false);
        setAccountName('');
        setAccountHandle('');
        if (onRefreshAccounts) onRefreshAccounts();
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to connect account' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (id, name) => {
    if (!window.confirm(`Are you sure you want to disconnect ${name}?`)) return;
    try {
      await axios.delete(`/api/social/accounts/${id}`, getHeaders());
      setActionMessage({ type: 'success', text: `Disconnected ${name}` });
      if (onRefreshAccounts) onRefreshAccounts();
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to disconnect account' });
    }
  };

  const handleRefreshToken = async (id) => {
    try {
      const res = await axios.post(`/api/social/accounts/${id}/refresh`, {}, getHeaders());
      if (res.data.success) {
        setActionMessage({ type: 'success', text: 'Token refreshed successfully!' });
        if (onRefreshAccounts) onRefreshAccounts();
      } else {
        setActionMessage({ type: 'error', text: 'Refresh failed. Please reconnect.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Error refreshing token' });
    }
  };

  return (
    <div className="account-manager">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Connected Social Accounts</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #94a3b8)', fontSize: '0.875rem' }}>
            Connect and manage OAuth credentials for Facebook, Instagram, LinkedIn, X, TikTok, YouTube & Pinterest.
          </p>
        </div>
        <button className="btn" onClick={() => setConnectModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Connect New Account
        </button>
      </div>

      {actionMessage && (
        <div className={`alert alert-${actionMessage.type === 'error' ? 'danger' : 'success'}`} style={{ marginBottom: '1rem' }}>
          {actionMessage.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {accounts.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
            <Share2 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3>No Accounts Connected</h3>
            <p className="muted">Connect your first social media page or channel to start publishing and scheduling posts.</p>
            <button className="btn" onClick={() => setConnectModalOpen(true)} style={{ marginTop: '1rem' }}>
              Connect Account
            </button>
          </div>
        ) : (
          accounts.map(acc => (
            <div key={acc._id} className="card" style={{ padding: '1.25rem', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <img
                  src={acc.avatarUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&auto=format&fit=crop&q=80'}
                  alt={acc.accountName}
                  style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {acc.accountName}
                    </h4>
                    <span className={`platform-badge platform-${acc.platform}`}>
                      {acc.platform}
                    </span>
                  </div>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>{acc.accountHandle || '@account'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {acc.status === 'connected' && <CheckCircle2 size={16} className="text-success" />}
                  {acc.status === 'needs_reconnect' && <AlertTriangle size={16} className="text-warning" />}
                  {acc.status === 'error' && <XCircle size={16} className="text-danger" />}
                  <span style={{ textTransform: 'capitalize' }}>{acc.status.replace('_', ' ')}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => handleRefreshToken(acc._id)}
                    title="Silent Token Refresh"
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                  <button
                    className="btn-secondary danger"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444' }}
                    onClick={() => handleDisconnect(acc._id, acc.accountName)}
                    title="Disconnect Account"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Followers: {acc.followersCount?.toLocaleString() || 0}</span>
                <span>Encrypted AES-256</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Connect Modal */}
      {connectModalOpen && (
        <div className="modal-backdrop" onClick={() => setConnectModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '90%' }}>
            <h3>Connect Social Account</h3>
            <p className="muted" style={{ fontSize: '0.875rem' }}>Select a social network and authorize OAuth connection.</p>
            
            <form onSubmit={handleConnect} style={{ marginTop: '1rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Target Platform</label>
                <select
                  className="form-field"
                  value={selectedPlatform}
                  onChange={e => setSelectedPlatform(e.target.value)}
                >
                  {PLATFORMS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Account Name / Page Title</label>
                <input
                  className="form-field"
                  type="text"
                  placeholder="e.g. Devugo Tech Official Page"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Account Handle (Optional)</label>
                <input
                  className="form-field"
                  type="text"
                  placeholder="e.g. @devugotech"
                  value={accountHandle}
                  onChange={e => setAccountHandle(e.target.value)}
                />
              </div>

              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: 8, fontSize: '0.8rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ShieldCheck size={20} style={{ color: '#6366f1', flexShrink: 0 }} />
                <span>Tokens are encrypted at rest with AES-256-GCM and refreshed automatically.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setConnectModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Connecting OAuth...' : 'Authorize & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
