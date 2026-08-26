import React, { useState } from 'react';
import { RefreshCw, Trash2, Eye, AlertCircle, CheckCircle2, Clock, XCircle, FileText, Send } from 'lucide-react';
import axios from 'axios';

export default function PostHistory({ posts = [], onPostUpdated }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [retryingTargetId, setRetryingTargetId] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  const filteredPosts = posts.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const handleSingleTargetRetry = async (postId, targetAccountId) => {
    setRetryingTargetId(targetAccountId);
    setActionMsg(null);
    try {
      const res = await axios.post(`/api/social/posts/${postId}/retry-target`, { targetAccountId }, getHeaders());
      if (res.data.success) {
        setActionMsg({ type: 'success', text: 'Target retried successfully!' });
        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost(res.data.post);
        }
        if (onPostUpdated) onPostUpdated();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Retry target failed' });
    } finally {
      setRetryingTargetId(null);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`/api/social/posts/${id}`, getHeaders());
      if (selectedPost?._id === id) setSelectedPost(null);
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="status-badge-connected" style={{ padding: '0.2rem 0.5rem', borderRadius: 12, fontSize: '0.75rem' }}><CheckCircle2 size={12} /> Published</span>;
      case 'scheduled':
        return <span className="status-badge-reconnect" style={{ padding: '0.2rem 0.5rem', borderRadius: 12, fontSize: '0.75rem' }}><Clock size={12} /> Scheduled</span>;
      case 'partial_failure':
        return <span className="status-badge-reconnect" style={{ padding: '0.2rem 0.5rem', borderRadius: 12, fontSize: '0.75rem', color: '#fbbf24' }}><AlertCircle size={12} /> Partial Failure</span>;
      case 'failed':
        return <span className="status-badge-error" style={{ padding: '0.2rem 0.5rem', borderRadius: 12, fontSize: '0.75rem' }}><XCircle size={12} /> Failed</span>;
      case 'draft':
      default:
        return <span className="muted" style={{ padding: '0.2rem 0.5rem', borderRadius: 12, fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)' }}><FileText size={12} /> Draft</span>;
    }
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Unified Post History & Drafts</h3>
          <p className="muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>Browse all past, scheduled, draft and failed social posts across accounts.</p>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['all', 'draft', 'scheduled', 'published', 'partial_failure', 'failed'].map(st => (
            <button
              key={st}
              className={`btn-secondary ${statusFilter === st ? 'active' : ''}`}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                textTransform: 'capitalize',
                background: statusFilter === st ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                borderColor: statusFilter === st ? '#6366f1' : 'rgba(255,255,255,0.1)'
              }}
              onClick={() => setStatusFilter(st)}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {actionMsg && (
        <div className={`alert alert-${actionMsg.type === 'error' ? 'danger' : 'success'}`} style={{ marginBottom: '1rem' }}>
          {actionMsg.text}
        </div>
      )}

      {/* Posts Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th>Content Snippet</th>
              <th>Target Accounts</th>
              <th>Status</th>
              <th>Date / Time</th>
              <th>Campaign</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem' }} className="muted">
                  No posts found matching the selected status filter.
                </td>
              </tr>
            ) : (
              filteredPosts.map(post => (
                <tr key={post._id}>
                  <td style={{ maxWidth: 280 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.globalText}
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="muted" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        {post.tags.map(t => `#${t}`).join(' ')}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {post.selectedAccounts?.map(acc => (
                        <span key={acc._id || acc} className={`platform-badge platform-${acc.platform || 'facebook'}`}>
                          {acc.accountName || acc.platform || 'Account'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{getStatusBadge(post.status)}</td>
                  <td className="muted" style={{ fontSize: '0.8rem' }}>
                    {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : (post.publishedAt ? new Date(post.publishedAt).toLocaleString() : new Date(post.createdAt).toLocaleString())}
                  </td>
                  <td>
                    {post.campaign ? <span className="badge">{post.campaign}</span> : <span className="muted">-</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => setSelectedPost(post)}
                        title="View Detailed Logs"
                      >
                        <Eye size={14} /> Detail
                      </button>
                      <button
                        className="btn-secondary danger"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleDeletePost(post._id)}
                        title="Delete Post"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Post Detail & Target Results Modal */}
      {selectedPost && (
        <div className="modal-backdrop" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Post Details & Publishing Logs</h3>
              <button className="btn-secondary" style={{ padding: '0.3rem' }} onClick={() => setSelectedPost(null)}>✕</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Global Text</label>
              <div className="card" style={{ padding: '0.75rem', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                {selectedPost.globalText}
              </div>
            </div>

            <h4 style={{ margin: '1rem 0 0.5rem 0', fontSize: '0.95rem' }}>Per-Target Publishing Results</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(!selectedPost.targetResults || selectedPost.targetResults.length === 0) ? (
                <p className="muted" style={{ fontSize: '0.85rem' }}>No target publishing logs recorded yet (Post is in draft/scheduled queue).</p>
              ) : (
                selectedPost.targetResults.map((tr, idx) => (
                  <div key={idx} className="card" style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`platform-badge platform-${tr.platform}`}>{tr.platform}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {tr.account?.accountName || 'Target Account'}
                        </span>
                        {tr.status === 'success' ? (
                          <span className="text-success" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <CheckCircle2 size={12} /> Success
                          </span>
                        ) : (
                          <span className="text-danger" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <XCircle size={12} /> Failed ({tr.errorCode})
                          </span>
                        )}
                      </div>
                      {tr.errorMessage && <div className="text-danger" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>{tr.errorMessage}</div>}
                      {tr.externalUrl && (
                        <a href={tr.externalUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#6366f1', marginTop: '0.2rem', display: 'inline-block' }}>
                          View Published Live Post ↗
                        </a>
                      )}
                    </div>

                    {tr.status === 'failed' && (
                      <button
                        className="btn"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        disabled={retryingTargetId === (tr.account?._id || tr.account)}
                        onClick={() => handleSingleTargetRetry(selectedPost._id, tr.account?._id || tr.account)}
                      >
                        <RefreshCw size={12} /> {retryingTargetId === (tr.account?._id || tr.account) ? 'Retrying...' : 'Retry Target'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setSelectedPost(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
