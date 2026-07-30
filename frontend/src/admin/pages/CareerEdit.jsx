import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, MapPin, Users, Clock, FileText, CheckSquare, ChevronDown, Calendar, List, Plus, Trash2 } from 'lucide-react';
import { CareerAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import CustomSelect from '../../components/CustomSelect';
import LoadingState from '../components/LoadingState';
import Spinner from '../../components/Spinner';

const JOB_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'];

const DEFAULT_FIELDS = [
  { key: 'phone', label: 'Phone Number', type: 'text', required: false, enabled: true },
  { key: 'experience', label: 'Experience', type: 'select', options: ['0-1 year', '1-2 years', '3-5 years', '5+ years'], required: false, enabled: true },
  { key: 'linkedin', label: 'LinkedIn URL', type: 'text', required: false, enabled: true },
  { key: 'portfolio', label: 'Portfolio / GitHub URL', type: 'text', required: false, enabled: true },
  { key: 'resume', label: 'Resume / CV Upload', type: 'file', required: false, enabled: true },
  { key: 'coverLetter', label: 'Cover Letter', type: 'textarea', required: false, enabled: true },
];

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

  const [form, setForm] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-Time',
    experience: 'Not specified',
    description: '',
    requirementsText: '',
    deadline: '',
    applicationFields: DEFAULT_FIELDS,
    isActive: true
  });
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
        applicationFields: data.applicationFields?.length ? data.applicationFields : DEFAULT_FIELDS,
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
        <LoadingState message="Loading job posting..." />
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

              {/* Application Form Fields */}
              <div style={cardStyle}>
                <div style={sectionHead}>
                  <List size={14} style={{ color: '#4385cd' }} />
                  Application Form Fields
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Standard Locked Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Standard Fields (Always Required)</div>
                    {['Full Name', 'Email Address'].map(lbl => (
                      <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.6rem .85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                         <div style={{ width: 34, height: 18, borderRadius: '999px', background: '#4385cd', position: 'relative', opacity: 0.5 }}>
                           <div style={{ position: 'absolute', top: 2, left: 18, width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
                         </div>
                         <div style={{ flex: 1, fontSize: '.9rem', color: 'rgba(255,255,255,0.6)' }}>{lbl}</div>
                         <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,0.4)' }}>Required</div>
                      </div>
                    ))}
                  </div>

                  {/* Configurable Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                    <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Optional & Custom Fields</div>
                    {form.applicationFields.map((field, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', padding: '.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {/* Toggle */}
                          <div onClick={() => {
                            const newFields = [...form.applicationFields];
                            newFields[idx].enabled = !newFields[idx].enabled;
                            set('applicationFields', newFields);
                          }} style={{ width: 36, height: 20, borderRadius: '999px', background: field.enabled ? '#4385cd' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'background .2s', cursor: 'pointer', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', top: 2, left: field.enabled ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                          </div>

                          {/* Label & Type Edit */}
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                            {field.isCustom ? (
                              <>
                                <input type="text" value={field.label} onChange={e => {
                                  const newFields = [...form.applicationFields];
                                  newFields[idx].label = e.target.value;
                                  newFields[idx].key = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_');
                                  set('applicationFields', newFields);
                                }} placeholder="Field Label" style={{ ...inp, padding: '.4rem .6rem', width: '200px' }} />
                                
                                <div style={{ width: '140px' }}>
                                  <CustomSelect
                                    value={field.type}
                                    onChange={val => {
                                      const newFields = [...form.applicationFields];
                                      newFields[idx].type = val;
                                      set('applicationFields', newFields);
                                    }}
                                    options={[
                                      { value: 'text', label: 'Short Text' },
                                      { value: 'textarea', label: 'Long Text' },
                                      { value: 'number', label: 'Number' },
                                      { value: 'date', label: 'Date' },
                                      { value: 'select', label: 'Dropdown' },
                                      { value: 'checkbox', label: 'Yes-No' },
                                      { value: 'file', label: 'File Upload' }
                                    ]}
                                  />
                                </div>
                              </>
                            ) : (
                              <span style={{ fontSize: '.9rem', color: field.enabled ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{field.label}</span>
                            )}
                          </div>

                          {/* Required Checkbox */}
                          <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.8rem', color: field.enabled ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', cursor: field.enabled ? 'pointer' : 'default' }}>
                            <input type="checkbox" checked={field.required} onChange={e => {
                              const newFields = [...form.applicationFields];
                              newFields[idx].required = e.target.checked;
                              set('applicationFields', newFields);
                            }} disabled={!field.enabled} style={{ cursor: field.enabled ? 'pointer' : 'default' }} />
                            Required?
                          </label>

                          {/* Delete */}
                          {field.isCustom && (
                            <button type="button" onClick={() => {
                              const newFields = form.applicationFields.filter((_, i) => i !== idx);
                              set('applicationFields', newFields);
                            }} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '.2rem' }}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        {/* Dropdown Options */}
                        {field.isCustom && field.type === 'select' && (
                          <div style={{ paddingLeft: '3.25rem', paddingTop: '.25rem' }}>
                            <input type="text" placeholder="Comma separated options (e.g. Remote, On-site)" value={(field.options || []).join(', ')} onChange={e => {
                              const newFields = [...form.applicationFields];
                              newFields[idx].options = e.target.value.split(',').map(s => s.trim());
                              set('applicationFields', newFields);
                            }} style={{ ...inp, padding: '.4rem .6rem', fontSize: '.8rem' }} />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <button type="button" onClick={() => {
                      set('applicationFields', [...form.applicationFields, {
                        key: `custom_${Date.now()}`,
                        label: 'New Custom Field',
                        type: 'text',
                        required: false,
                        enabled: true,
                        isCustom: true
                      }]);
                    }} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', alignSelf: 'flex-start', padding: '.5rem .85rem', borderRadius: '8px', background: 'rgba(67,133,205,0.1)', border: '1px solid rgba(67,133,205,0.3)', color: '#60a5fa', fontSize: '.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      <Plus size={14} /> Add Custom Field
                    </button>
                  </div>
                </div>
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

              </div>

              {/* Job Type */}
              <div style={cardStyle}>
                <div style={sectionHead}>
                  <Clock size={13} style={{ color: '#4385cd' }} />
                  Job Type
                </div>

                {/* Custom dropdown */}
                <CustomSelect
                  options={JOB_TYPES.map(t => ({ label: t, value: t }))}
                  value={form.type}
                  onChange={val => set('type', val)}
                />

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
          
          <div className="admin-sticky-footer" style={{ background: 'rgba(6,28,57, 0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Link to="/admin/careers" style={{ padding: '.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '.85rem', transition: 'all .2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
              Cancel
            </Link>
            {!isNew && (
              <button type="button" onClick={() => {
                confirm.show({
                  title: 'Delete Job',
                  message: 'Are you sure you want to delete this job posting?',
                  variant: 'danger',
                  confirmText: 'Delete',
                  action: async () => {
                    navigate('/admin/careers');
                  }
                });
              }} style={{ padding: '.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontSize: '.85rem', cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Delete
              </button>
            )}
            <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.5rem 1.25rem', borderRadius: '8px', border: 'none', background: '#4385cd', color: '#fff', fontSize: '.85rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all .2s', boxShadow: '0 2px 10px rgba(67,133,205,0.3)' }} onMouseEnter={e => !saving && (e.currentTarget.style.background = '#3273b5')} onMouseLeave={e => !saving && (e.currentTarget.style.background = '#4385cd')}>
              {saving && <Spinner size="sm" />}
              <span>{saving ? 'Saving...' : isNew ? 'Publish Job' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
