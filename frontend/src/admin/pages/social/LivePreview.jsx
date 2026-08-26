import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, Heart, Send, Bookmark, MoreHorizontal, Repeat2, ExternalLink } from 'lucide-react';

export default function LivePreview({ globalText, platformOverrides = {}, mediaAssets = [], selectedAccounts = [] }) {
  const [activePlatform, setActivePlatform] = useState('facebook');

  const platforms = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'twitter', label: 'X (Twitter)' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'pinterest', label: 'Pinterest' }
  ];

  // Get active text and media override
  const override = platformOverrides[activePlatform];
  const displayText = (override && override.text) ? override.text : globalText;

  // Account details if matching platform account is connected
  const matchingAccount = selectedAccounts.find(a => a.platform === activePlatform) || {
    accountName: 'Devugo Tech',
    accountHandle: '@devugotech',
    avatarUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&auto=format&fit=crop&q=80'
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>👁️ Live Platform Preview</span>
        </h4>
        <span className={`platform-badge platform-${activePlatform}`}>{activePlatform}</span>
      </div>

      {/* Platform Switcher */}
      <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {platforms.map(p => (
          <button
            key={p.id}
            type="button"
            className={`btn-secondary ${activePlatform === p.id ? 'active' : ''}`}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              background: activePlatform === p.id ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              borderColor: activePlatform === p.id ? '#6366f1' : 'rgba(255,255,255,0.1)',
              color: activePlatform === p.id ? '#fff' : 'var(--text-muted, #94a3b8)'
            }}
            onClick={() => setActivePlatform(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Mockup Card Container */}
      <div className="mockup-card">
        {/* Header */}
        <div className="mockup-header">
          <img src={matchingAccount.avatarUrl} alt={matchingAccount.accountName} className="mockup-avatar" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
              {matchingAccount.accountName}
            </div>
            <div className="muted" style={{ fontSize: '0.75rem' }}>
              {matchingAccount.accountHandle} • Just now
            </div>
          </div>
          <MoreHorizontal size={18} className="muted" />
        </div>

        {/* Text Body */}
        <div className="mockup-body">
          {displayText ? (
            displayText
          ) : (
            <span className="muted" style={{ fontStyle: 'italic' }}>Write post text to preview preview rendering...</span>
          )}
        </div>

        {/* Media Attachments */}
        {mediaAssets.length > 0 && (
          <div className="mockup-media-grid" style={{ padding: '0 1rem 1rem 1rem' }}>
            {mediaAssets.map((asset, idx) => (
              asset.mediaType === 'video' || (asset.mimetype && asset.mimetype.startsWith('video/')) ? (
                <div key={idx} style={{ position: 'relative', width: '100%', height: 220, background: '#000', borderRadius: 8, overflow: 'hidden' }}>
                  <video src={asset.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
                </div>
              ) : (
                <img key={idx} src={asset.url} alt="Post attachment" className="mockup-media-item" />
              )
            ))}
          </div>
        )}

        {/* Mockup Footer Actions */}
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-around', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>
          {activePlatform === 'facebook' && (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><ThumbsUp size={16} /> Like</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MessageSquare size={16} /> Comment</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Share2 size={16} /> Share</span>
            </>
          )}
          {activePlatform === 'instagram' && (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Heart size={16} /></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MessageSquare size={16} /></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Send size={16} /></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}><Bookmark size={16} /></span>
            </>
          )}
          {(activePlatform === 'twitter' || activePlatform === 'tiktok') && (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MessageSquare size={16} /> 12</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Repeat2 size={16} /> 4</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Heart size={16} /> 48</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Share2 size={16} /></span>
            </>
          )}
          {(activePlatform === 'linkedin' || activePlatform === 'youtube' || activePlatform === 'pinterest') && (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><ThumbsUp size={16} /> React</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MessageSquare size={16} /> Comment</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Share2 size={16} /> Repost</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
