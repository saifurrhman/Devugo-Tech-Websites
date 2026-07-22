import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, MapPin, Users, Clock, FileText, CheckSquare, ChevronDown, Calendar } from 'lucide-react';
import { CareerAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

const JOB_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'];

// All using the admin's own blue palette
const TYPE_META = {
  'Full-Time':  { dot: '#4385cd', badge: 'rgba(67,133,205,0.2)',  border: 'rgba(67,133,205,0.45)' },
  'Part-Time':  { dot: '#4385cd', badge: 'rgba(67,133,205,0.12)', border: 'rgba(67,133,205,0.3)'  },
  'Contract':   { dot: '#60a5fa', badge: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.4)'  },
  'Internship': { dot: '#93c5fd', badge: 'rgba(147,197,253,0.12)', border: 'rgba(147,197,253,0.35)' },
  'Freelance':  { dot: '#3b82f6', badge: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)'  },
};

// Shared input style matching admin panel inputs
const inp = {
  width: '100%',
  padding: '.6rem .85rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.04)',
  color: '#fff',
  fontSize: '.9rem',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color .18s, background .18s',
};

const lbl = {
  display: 'flex',
  alignItems: 'center',
  gap: '.35rem',
  marginBottom: '.45rem',
  fontSize: '.8rem',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.55)',
  letterSpacing: '.04em',
  textTransform: 'uppercase',
};

// Card matching admin .card class look
const cardStyle = {
  background: '#003560',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '1.35rem',
};

const sectionHead = {
  display: 'flex',
  alignItems: 'center',
  gap: '.5rem',
  marginBottom: '1.1rem',
  paddingBottom: '.7rem',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  fontSize: '.88rem',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.85)',
};

export default function CareerEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const typeRef = useRef(null);

  const [form, setForm] = useState({
    title: '', department: '', location: '',
    type: 'Full-Time', experience: 'Not specified', description: '', requirementsText: '', deadline: '', isActive: true
  });

  useEffect(() => {
    const h = e => { if (typeRef.current && !typeRef.current.contains(e.target)) setTypeOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { if (!isNew) fetchCareer(); }, [id]);

  const fetchCareer = async () => {
    try {
      const data = await CareerAPI.get(id);
      setForm({
        title: data.title || '', department: data.department || '',
        location: data.location || '', type: data.type || 'Full-Time',
        experience: data.experience || 'Not specified',
        description: data.description || '',
        requirementsText: data.requirements ? data.requirements.join('\n') : '',
        deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
        isActive: data.isActive !== false,
      });
    } catch (err) {
      notifyError('Failed to fetch job details');
      navigate('/admin/careers');
    } finally { setLoading(false); }
  };

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const requirements = form.requirementsText.split('\n').map(r => r.trim()).filter(Boolean);
      const payload = { ...form, requirements };
      if (isNew) { await CareerAPI.create(payload); notifySuccess('Job posting created!'); }
      else { await CareerAPI.update(id, payload); notifySuccess('Job posting updated!'); }
      navigate('/admin/careers');
    } catch (err) { notifyError(err?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const focus = e => { e.target.style.borderColor = 'rgba(67,133,205,0.6)'; e.target.style.background = 'rgba(67,133,205,0.07)'; };
  const blur  = e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; };

  const tm = TYPE_META[form.type] || TYPE_META['Full-Time'];

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div style={{ ...cardStyle, marginTop: '1rem' }}>Loading…</div>
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
                {isNew ? 'Add Job Posting' : 'Edit Job Posting'}
              </h1>
              <span style={{ padding: '.18rem .6rem', borderRadius: '999px', fontSize: '.72rem', fontWeight: 700, background: tm.badge, border: `1px solid ${tm.border}`, color: '#fff', letterSpacing: '.02em' }}>
                {form.type}
              </span>
            </div>
            <p style={{ margin: '.1rem 0 0', fontSize: '.83rem', color: 'rgba(255,255,255,0.45)' }}>
              {isNew ? 'Fill in the details to publish a new job' : form.title || 'Editing job posting'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.1rem', alignItems: 'start' }}>

            {/* ──── LEFT ──── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              {/* Basic Info */}
              <div style={cardStyle}>
                <div style={sectionHead}>
                  <Briefcase size={14} style={{ color: '#4385cd' }} />
                  Basic Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.9rem' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>
                      <Briefcase size={11} /> Job Title
                      <span style={{ color: 'rgba(239,68,68,0.8)', fontWeight: 400, textTransform: 'none', fontSize: '.78rem', marginLeft: '.2rem' }}>*</span>
                    </label>
                    <input type="text" required value={form.title}
                      onChange={e => set('title', e.target.value)}
                      placeholder="e.g. Senior React Developer"
                      style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={lbl}><Users size={11} /> Department</label>
                    <input type="text" value={form.department}
                      onChange={e => set('department', e.target.value)}
                      placeholder="e.g. Engineering"
                      style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={lbl}><MapPin size={11} /> Location</label>
                    <input type="text" value={form.location}
                      onChange={e => set('location', e.target.value)}
                      placeholder="e.g. Remote, Karachi…"
                      style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={lbl}><Clock size={11} /> Required Experience</label>
                    <input type="text" value={form.experience}
                      onChange={e => set('experience', e.target.value)}
                      placeholder="e.g. 3-5 years"
                      style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={lbl}><Calendar size={11} /> Closing Date (Optional)</label>
                    <input type="date" value={form.deadline}
                      onChange={e => set('deadline', e.target.value)}
                      style={{ ...inp, color: form.deadline ? '#fff' : 'rgba(255,255,255,0.45)' }} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={cardStyle}>
                <div style={sectionHead}>
                  <FileText size={14} style={{ color: '#4385cd' }} />
                  Job Description
                  <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                    {form.description.length} chars
                  </span>
                </div>
                <textarea required rows={10} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, what the candidate will work on, team culture…"
                  style={{ ...inp, resize: 'vertical', lineHeight: 1.7, minHeight: '180px' }}
                  onFocus={focus} onBlur={blur} />
              </div>

              {/* Requirements */}
              <div style={cardStyle}>
                <div style={sectionHead}>
                  <CheckSquare size={14} style={{ color: '#4385cd' }} />
                  Requirements & Qualifications
                  <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                    one per line
                  </span>
                </div>
                <textarea rows={7} value={form.requirementsText}
                  onChange={e => set('requirementsText', e.target.value)}
                  placeholder={'3+ years experience with React\nStrong TypeScript skills\nFamiliarity with Git & CI/CD'}
                  style={{ ...inp, resize: 'vertical', lineHeight: 1.8, minHeight: '140px' }}
                  onFocus={focus} onBlur={blur} />
                {form.requirementsText && (
                  <p style={{ margin: '.45rem 0 0', fontSize: '.78rem', color: 'rgba(255,255,255,0.35)' }}>
                    {form.requirementsText.split('\n').filter(Boolean).length} requirement(s)
                  </p>
                )}
              </div>
            </div>

            {/* ──── RIGHT ──── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              {/* Publish */}
              <div style={cardStyle}>
                <div style={sectionHead}>
                  <Save size={13} style={{ color: '#4385cd' }} />
                  Publish
                </div>

                {/* Status toggle */}
                <div
                  onClick={() => set('isActive', !form.isActive)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem .9rem', borderRadius: '8px', border: `1px solid ${form.isActive ? 'rgba(67,133,205,0.4)' : 'rgba(255,255,255,0.08)'}`, background: form.isActive ? 'rgba(67,133,205,0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', userSelect: 'none', transition: 'all .2s', marginBottom: '1rem' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.88rem', color: form.isActive ? '#4385cd' : 'rgba(255,255,255,0.5)' }}>
                      {form.isActive ? '● Published' : '○ Draft'}
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.38)', marginTop: '.12rem' }}>
                      {form.isActive ? 'Visible on public website' : 'Hidden from public'}
                    </div>
                  </div>
                  {/* Toggle pill */}
                  <div style={{ width: 42, height: 22, borderRadius: '999px', background: form.isActive ? '#4385cd' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 3, left: form.isActive ? 22 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                  </div>
                </div>

                {/* Save button */}
                <button type="submit" disabled={saving}
                  style={{ width: '100%', padding: '.68rem', borderRadius: '8px', border: 'none', background: saving ? 'rgba(67,133,205,0.45)' : '#4385cd', color: '#fff', fontWeight: 700, fontSize: '.9rem', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.45rem', transition: 'background .15s, opacity .15s', opacity: saving ? 0.7 : 1 }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#3a78bb'; }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#4385cd'; }}
                >
                  <Save size={15} />
                  {saving ? 'Saving…' : isNew ? 'Publish Job' : 'Save Changes'}
                </button>

                <Link to="/admin/careers"
                  style={{ display: 'block', textAlign: 'center', marginTop: '.6rem', padding: '.55rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '.88rem', transition: 'background .15s, color .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                >
                  Cancel
                </Link>
              </div>

              {/* Job Type */}
              <div style={cardStyle}>
                <div style={sectionHead}>
                  <Clock size={13} style={{ color: '#4385cd' }} />
                  Job Type
                </div>

                {/* Custom dropdown */}
                <div ref={typeRef} style={{ position: 'relative' }}>
                  <button type="button" onClick={() => setTypeOpen(p => !p)}
                    style={{ width: '100%', padding: '.6rem .85rem', borderRadius: '8px', border: `1px solid ${typeOpen ? 'rgba(67,133,205,0.6)' : 'rgba(255,255,255,0.08)'}`, background: typeOpen ? 'rgba(67,133,205,0.07)' : 'rgba(255,255,255,0.04)', color: '#fff', fontWeight: 600, fontSize: '.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .18s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4385cd', display: 'inline-block', flexShrink: 0 }} />
                      {form.type}
                    </div>
                    <ChevronDown size={14} style={{ opacity: .55, transition: 'transform .2s', transform: typeOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                  </button>

                  {typeOpen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + .4rem)', left: 0, right: 0, zIndex: 200, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#002747', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', overflow: 'hidden', padding: '.3rem' }}>
                      {JOB_TYPES.map(t => {
                        const active = form.type === t;
                        return (
                          <button key={t} type="button"
                            onClick={() => { set('type', t); setTypeOpen(false); }}
                            style={{ width: '100%', padding: '.58rem .8rem', borderRadius: '7px', border: 'none', background: active ? 'rgba(67,133,205,0.2)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.65)', fontWeight: active ? 700 : 400, fontSize: '.88rem', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.15rem', transition: 'background .12s, color .12s' }}
                            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; } }}
                            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; } }}
                          >
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? '#4385cd' : 'rgba(255,255,255,0.2)', flexShrink: 0, transition: 'background .12s' }} />
                            {t}
                            {active && <span style={{ marginLeft: 'auto', fontSize: '.72rem', color: '#4385cd', fontWeight: 700 }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick type pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginTop: '.85rem' }}>
                  {JOB_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => set('type', t)}
                      style={{ padding: '.2rem .55rem', borderRadius: '999px', fontSize: '.73rem', fontWeight: form.type === t ? 700 : 400, border: `1px solid ${form.type === t ? 'rgba(67,133,205,0.6)' : 'rgba(255,255,255,0.1)'}`, background: form.type === t ? 'rgba(67,133,205,0.18)' : 'transparent', color: form.type === t ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all .15s' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
