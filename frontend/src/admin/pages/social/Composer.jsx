import React, { useState, useEffect } from 'react';
import { Send, Calendar, Save, Smile, Hash, AtSign, Link, Image as ImageIcon, X, AlertTriangle, Check } from 'lucide-react';
import LivePreview from './LivePreview';
import MediaLibraryModal from './MediaLibraryModal';
import axios from 'axios';

const COMMON_EMOJIS = ['🚀', '✨', '🔥', '💡', '📈', '🎯', '💻', '🌐', '🎉', '👇', '💬', '❤️'];

export default function Composer({ accounts = [], onPostCreated }) {
  const [globalText, setGlobalText] = useState('');
  const [platformOverrides, setPlatformOverrides] = useState({});
  const [activeOverrideTab, setActiveOverrideTab] = useState('global');
  const [selectedAccounts, setSelectedAccounts] = useState(accounts.map(a => a._id));
  const [mediaAssets, setMediaAssets] = useState([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [campaign, setCampaign] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [utmSource, setUtmSource] = useState('social');
  const [utmMedium, setUtmMedium] = useState('social');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [autoUtm, setAutoUtm] = useState(true);

  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  useEffect(() => {
    if (accounts.length > 0 && selectedAccounts.length === 0) {
      setSelectedAccounts(accounts.map(a => a._id));
    }
  }, [accounts]);

  // Perform real-time validation check
  useEffect(() => {
    runRealTimeValidation();
  }, [globalText, platformOverrides, selectedAccounts, mediaAssets, scheduledAt]);

  const runRealTimeValidation = async () => {
    const activeSelectedAccounts = accounts.filter(a => selectedAccounts.includes(a._id));
    try {
      const res = await axios.post('/api/social/posts/validate', {
        globalText,
        platformOverrides,
        selectedAccounts: activeSelectedAccounts,
        mediaAssets,
        scheduledAt
      }, getHeaders());

      setValidationErrors(res.data.errors || []);
      setValidationWarnings(res.data.warnings || []);
    } catch (_e) {}
  };

  const handleAccountToggle = (id) => {
    if (selectedAccounts.includes(id)) {
      setSelectedAccounts(selectedAccounts.filter(item => item !== id));
    } else {
      setSelectedAccounts([...selectedAccounts, id]);
    }
  };

  const handleInsertEmoji = (emoji) => {
    if (activeOverrideTab === 'global') {
      setGlobalText(prev => prev + emoji);
    } else {
      setPlatformOverrides(prev => ({
        ...prev,
        [activeOverrideTab]: {
          ...(prev[activeOverrideTab] || {}),
          text: ((prev[activeOverrideTab] && prev[activeOverrideTab].text) || globalText) + emoji
        }
      }));
    }
  };

  const handleInsertHashtag = () => {
    const tag = prompt('Enter hashtag name (without #):');
    if (!tag) return;
    const tagStr = ` #${tag.trim()}`;
    handleInsertEmoji(tagStr);
  };

  const handleInsertMention = () => {
    const handle = prompt('Enter account handle (without @):');
    if (!handle) return;
    const handleStr = ` @${handle.trim()}`;
    handleInsertEmoji(handleStr);
  };

  const handleSubmit = async (action) => {
    setSubmitting(true);
    setStatusMsg(null);
    try {
      const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const res = await axios.post('/api/social/posts', {
        globalText,
        platformOverrides,
        mediaAssets: mediaAssets.map(m => m._id),
        selectedAccounts,
        scheduledAt,
        action,
        campaign,
        tags: tagsArray,
        utmParams: {
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign || campaign,
          autoAppend: autoUtm
        }
      }, getHeaders());

      if (res.data.success) {
        setStatusMsg({ type: 'success', text: `Post successfully ${action === 'publish_now' ? 'published' : (action === 'schedule' ? 'scheduled' : 'saved as draft')}!` });
        // Reset form
        setGlobalText('');
        setPlatformOverrides({});
        setMediaAssets([]);
        setScheduledAt('');
        setCampaign('');
        setTagsInput('');
        if (onPostCreated) onPostCreated();
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to process post action' });
    } finally {
      setSubmitting(false);
    }
  };

  const activeSelectedAccounts = accounts.filter(a => selectedAccounts.includes(a._id));
  const activePlatforms = Array.from(new Set(activeSelectedAccounts.map(a => a.platform)));

  return (
    <div className="composer-grid">
      {/* Left Column: Post Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {statusMsg && (
          <div className={`alert alert-${statusMsg.type === 'error' ? 'danger' : 'success'}`}>
            {statusMsg.text}
          </div>
        )}

        {/* Target Accounts Selection */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem' }}>1. Select Target Accounts</h4>
          {accounts.length === 0 ? (
            <p className="muted" style={{ fontSize: '0.875rem' }}>No accounts connected yet. Connect an account first.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {accounts.map(acc => {
                const isChecked = selectedAccounts.includes(acc._id);
                return (
                  <label
                    key={acc._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.85rem',
                      borderRadius: 8,
                      border: isChecked ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                      background: isChecked ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAccountToggle(acc._id)}
                    />
                    <span style={{ fontWeight: 500 }}>{acc.accountName}</span>
                    <span className={`platform-badge platform-${acc.platform}`}>{acc.platform}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Post Text Editor */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>2. Compose Post Content</h4>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                className={`btn-secondary ${activeOverrideTab === 'global' ? 'active' : ''}`}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => setActiveOverrideTab('global')}
              >
                Global Base Text
              </button>
              {activePlatforms.map(plat => (
                <button
                  key={plat}
                  type="button"
                  className={`btn-secondary ${activeOverrideTab === plat ? 'active' : ''}`}
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', textTransform: 'capitalize' }}
                  onClick={() => setActiveOverrideTab(plat)}
                >
                  {plat} Override
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <textarea
              className="form-field"
              rows={5}
              placeholder={activeOverrideTab === 'global' ? "Write your global post text..." : `Customize caption specifically for ${activeOverrideTab}...`}
              value={activeOverrideTab === 'global' ? globalText : (platformOverrides[activeOverrideTab]?.text || '')}
              onChange={e => {
                const val = e.target.value;
                if (activeOverrideTab === 'global') {
                  setGlobalText(val);
                } else {
                  setPlatformOverrides(prev => ({
                    ...prev,
                    [activeOverrideTab]: { ...(prev[activeOverrideTab] || {}), text: val }
                  }));
                }
              }}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Quick Helper Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              {COMMON_EMOJIS.map(em => (
                <button key={em} type="button" onClick={() => handleInsertEmoji(em)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                  {em}
                </button>
              ))}
              <button type="button" className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={handleInsertHashtag}>
                <Hash size={14} /> Hashtag
              </button>
              <button type="button" className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={handleInsertMention}>
                <AtSign size={14} /> Tag Mention
              </button>
            </div>

            <button type="button" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setMediaModalOpen(true)}>
              <ImageIcon size={16} /> Central Media Library ({mediaAssets.length})
            </button>
          </div>

          {/* Attached Media List */}
          {mediaAssets.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {mediaAssets.map(asset => (
                <div key={asset._id} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={asset.url} alt="Media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => setMediaAssets(mediaAssets.filter(m => m._id !== asset._id))}
                    style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduling, UTM & Campaign Settings */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>3. Schedule, Traffic Attribution & Campaigns</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Schedule Date & Time</label>
              <input
                type="datetime-local"
                className="form-field"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Campaign Name</label>
              <input
                type="text"
                className="form-field"
                placeholder="e.g. Q3 Growth Campaign"
                value={campaign}
                onChange={e => setCampaign(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="form-field"
                placeholder="promo, tech, launch"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">UTM Tracking</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={autoUtm} onChange={e => setAutoUtm(e.target.checked)} /> Auto-append UTM query tags
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="alert alert-danger">
            <strong>Validation Errors ({validationErrors.length}):</strong>
            <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-secondary"
            disabled={submitting}
            onClick={() => handleSubmit('draft')}
          >
            <Save size={16} /> Save Draft
          </button>

          {scheduledAt && (
            <button
              type="button"
              className="btn"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' }}
              disabled={submitting || validationErrors.length > 0}
              onClick={() => handleSubmit('schedule')}
            >
              <Calendar size={16} /> Schedule Post
            </button>
          )}

          <button
            type="button"
            className="btn"
            disabled={submitting || validationErrors.length > 0}
            onClick={() => handleSubmit('publish_now')}
          >
            <Send size={16} /> {submitting ? 'Publishing...' : 'Publish Immediately'}
          </button>
        </div>
      </div>

      {/* Right Column: Live Mockup Preview */}
      <div>
        <LivePreview
          globalText={globalText}
          platformOverrides={platformOverrides}
          mediaAssets={mediaAssets}
          selectedAccounts={activeSelectedAccounts}
        />
      </div>

      {/* Media Library Selection Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        selectedAssetIds={mediaAssets.map(m => m._id)}
        onSelectAssets={chosen => setMediaAssets(chosen)}
      />
    </div>
  );
}
