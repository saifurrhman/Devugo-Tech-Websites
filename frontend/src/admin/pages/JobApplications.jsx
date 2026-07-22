import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, ExternalLink, Calendar, Trash2, CheckCircle, XCircle, FileDown } from 'lucide-react';
import { JobApplicationAPI, CareerAPI } from '../../lib/api';
import { API_BASE } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

const cardStyle = {
  background: '#003560',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '1.25rem',
  marginBottom: '1rem'
};

const badgeColors = {
  new: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.4)' },
  shortlisted: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.4)' },
  rejected: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.4)' },
  hired: { bg: 'rgba(139,92,246,0.15)', text: '#c084fc', border: 'rgba(139,92,246,0.4)' }
};

export default function JobApplications() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { success, error: notifyError } = useNotification();
  
  // Custom Email Composer State
  const [emailComposeId, setEmailComposeId] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appData, careerData] = await Promise.all([
        JobApplicationAPI.list({ careerId: id }),
        CareerAPI.get(id).catch(() => null)
      ]);
      setApplications(appData || []);
      setCareer(careerData);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await JobApplicationAPI.updateStatus(appId, newStatus);
      success(`Status updated to ${newStatus}`);
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      notifyError(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await JobApplicationAPI.remove(appId);
      success('Application deleted');
      setApplications(prev => prev.filter(a => a._id !== appId));
    } catch (err) {
      notifyError(err.message || 'Failed to delete');
    }
  };

  const handleOpenComposer = (app) => {
    if (emailComposeId === app._id) {
      setEmailComposeId(null);
    } else {
      setEmailComposeId(app._id);
      setEmailSubject(`Update on your application for ${career?.title || 'Devugo'}`);
      setEmailBody(`Hi ${app.fullName},\n\n\n\nBest regards,\nDevugo Tech Solutions Team`);
    }
  };

  const handleSendEmail = async (appId) => {
    if (!emailSubject.trim() || !emailBody.trim()) return notifyError('Subject and Body are required');
    try {
      setSendingEmail(true);
      await JobApplicationAPI.sendEmail(appId, { subject: emailSubject, body: emailBody });
      success('Email sent successfully!');
      setEmailComposeId(null);
    } catch (err) {
      notifyError(err.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div style={cardStyle}>Loading applications…</div>
      </main>
    </div>
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', marginBottom: '1.4rem' }}>
          <Link to="/admin/careers"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'background .15s, color .15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Job Applications
              </h1>
              <span style={{ padding: '.18rem .6rem', borderRadius: '999px', fontSize: '.72rem', fontWeight: 700, background: 'rgba(67,133,205,0.15)', border: '1px solid rgba(67,133,205,0.4)', color: '#60a5fa' }}>
                {applications.length} Total
              </span>
            </div>
            <p style={{ margin: '.1rem 0 0', fontSize: '.85rem', color: 'rgba(255,255,255,0.5)' }}>
              {career ? `Applicants for ${career.title} (${career.type})` : 'Viewing job applications'}
            </p>
          </div>
        </div>

        {error && <div style={{ ...cardStyle, color: '#ef4444' }}>{error}</div>}

        {!loading && !error && applications.length === 0 && (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
            No applications received for this job yet.
          </div>
        )}

        {/* ── Applications List ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {applications.map(app => {
            const bc = badgeColors[app.status] || badgeColors['new'];
            const isComposing = emailComposeId === app._id;
            return (
              <div key={app._id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Top Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '2rem', alignItems: 'start' }}>
                  
                  {/* Applicant Info */}
                  <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>
                      {app.fullName}
                    </h3>
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                      style={{ padding: '.2rem .6rem', borderRadius: '999px', fontSize: '.75rem', fontWeight: 600, background: bc.bg, color: bc.text, border: `1px solid ${bc.border}`, outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="new">New</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '.75rem', marginBottom: '1.25rem' }}>
                    <button onClick={() => handleOpenComposer(app)} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.85rem', color: '#60a5fa', background: isComposing ? 'rgba(96,165,250,0.1)' : 'transparent', border: 'none', padding: '.4rem .6rem', borderRadius: '6px', cursor: 'pointer', transition: 'background .2s', margin: '-.4rem -.6rem' }} onMouseEnter={e => !isComposing && (e.currentTarget.style.background = 'rgba(96,165,250,0.05)')} onMouseLeave={e => !isComposing && (e.currentTarget.style.background = 'transparent')}>
                      <Mail size={14} />
                      {app.email}
                    </button>
                    {app.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.85rem', color: 'rgba(255,255,255,0.7)' }}>
                        <Phone size={14} color="#34d399" />
                        {app.phone}
                      </div>
                    )}
                    {app.experience && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.85rem', color: 'rgba(255,255,255,0.7)' }}>
                        <Calendar size={14} color="#c084fc" />
                        {app.experience} Exp
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {app.linkedin && (
                      <a href={app.linkedin} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.8rem', color: '#60a5fa', textDecoration: 'none', background: 'rgba(96,165,250,0.1)', padding: '.4rem .8rem', borderRadius: '6px' }}>
                        <ExternalLink size={13} /> LinkedIn
                      </a>
                    )}
                    {app.portfolio && (
                      <a href={app.portfolio} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.8rem', color: '#fbbf24', textDecoration: 'none', background: 'rgba(251,191,36,0.1)', padding: '.4rem .8rem', borderRadius: '6px' }}>
                        <ExternalLink size={13} /> Portfolio
                      </a>
                    )}
                    {app.resume && (
                      <a href={`${API_BASE}${app.resume}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.8rem', color: '#34d399', textDecoration: 'none', background: 'rgba(52,211,153,0.1)', padding: '.4rem .8rem', borderRadius: '6px' }}>
                        <FileDown size={13} /> Download CV
                      </a>
                    )}
                  </div>
                </div>

                {/* Cover Letter & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '1.5rem', height: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '.5rem' }}>
                      Cover Letter
                    </div>
                    <div style={{ fontSize: '.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxHeight: '120px', overflowY: 'auto', paddingRight: '.5rem', whiteSpace: 'pre-wrap' }}>
                      {app.coverLetter || 'No cover letter provided.'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button onClick={() => handleDelete(app._id)} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '.8rem', cursor: 'pointer', padding: '.4rem', borderRadius: '6px', transition: 'background .2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
                </div>

                {/* Email Composer */}
                {isComposing && (
                  <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', animation: 'fadeUp .3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem', color: '#60a5fa' }}>
                      <Mail size={16} /> <span style={{ fontSize: '.9rem', fontWeight: 600 }}>Compose Email to {app.fullName}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '.3rem', textTransform: 'uppercase' }}>Subject</label>
                        <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} style={{ width: '100%', padding: '.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '.9rem', outline: 'none' }} placeholder="Email subject..." />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: '.3rem', textTransform: 'uppercase' }}>Message Body</label>
                        <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} style={{ width: '100%', padding: '.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '.9rem', minHeight: '120px', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} placeholder="Write your message here..." />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem', marginTop: '.5rem' }}>
                        <button onClick={() => setEmailComposeId(null)} style={{ padding: '.5rem 1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: '.85rem', cursor: 'pointer', transition: 'background .2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Cancel</button>
                        <button onClick={() => handleSendEmail(app._id)} disabled={sendingEmail} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1.25rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', fontSize: '.85rem', fontWeight: 600, cursor: sendingEmail ? 'not-allowed' : 'pointer', opacity: sendingEmail ? 0.7 : 1, transition: 'background .2s' }} onMouseEnter={e => !sendingEmail && (e.currentTarget.style.background = '#2563eb')} onMouseLeave={e => !sendingEmail && (e.currentTarget.style.background = '#3b82f6')}>
                          {sendingEmail ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <Mail size={14} />}
                          {sendingEmail ? 'Sending...' : 'Send Email'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
