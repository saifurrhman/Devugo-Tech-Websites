import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CareerAPI, JobApplicationAPI } from '../lib/api';
import { Briefcase, MapPin, Search, ArrowLeft, Info, CheckCircle, Gift, User, Mail, Phone, Calendar, Linkedin, Link as LinkIcon, FileText, Send, AlertTriangle } from 'lucide-react';

const TYPE_COLOR = {
  'Full-Time':  { bg: 'rgba(67,133,205,0.18)', border: 'rgba(67,133,205,0.5)', color: '#60a5fa', glow: 'rgba(67,133,205,0.25)' },
  'Part-Time':  { bg: 'rgba(139,92,246,0.18)', border: 'rgba(139,92,246,0.5)', color: '#c084fc', glow: 'rgba(139,92,246,0.25)' },
  'Contract':   { bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.5)', color: '#fbbf24', glow: 'rgba(245,158,11,0.25)' },
  'Internship': { bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.5)', color: '#34d399', glow: 'rgba(16,185,129,0.25)' },
  'Freelance':  { bg: 'rgba(239,68,68,0.18)',  border: 'rgba(239,68,68,0.5)',  color: '#f87171', glow: 'rgba(239,68,68,0.25)' },
};

const EXP_OPTIONS = ['Less than 1 year', '1–2 years', '3–5 years', '5–8 years', '8+ years'];

export default function CareerDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ fullName:'', email:'', phone:'', linkedin:'', portfolio:'', experience:'', coverLetter:'', resume: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    CareerAPI.get(id)
      .then(data => { setJob(data); document.title = `${data.title} — Careers at Devugo`; })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true); setFormError('');
    try {
      const formData = new FormData();
      formData.append('careerId', job._id);
      Object.keys(form).forEach(k => {
        if (form[k] !== null && form[k] !== undefined && form[k] !== '') {
          formData.append(k, form[k]);
        }
      });
      await JobApplicationAPI.create(formData);
      setSubmitted(true);
    } catch (err) { setFormError(err.message || 'Something went wrong. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '.7rem 1rem', borderRadius: '10px',
    border: `1px solid ${focused === field ? 'rgba(67,133,205,0.6)' : 'rgba(255,255,255,0.08)'}`,
    background: focused === field ? 'rgba(67,133,205,0.06)' : 'rgba(255,255,255,0.04)',
    color: '#fff', fontSize: '.92rem', boxSizing: 'border-box', outline: 'none',
    fontFamily: 'inherit', transition: 'all .2s', lineHeight: 1.5,
  });

  if (loading) return (
    <>
      <Navbar />
      <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem' }}>
        <div style={{ width:44, height:44, border:'3px solid rgba(67,133,205,0.25)', borderTopColor:'#4385cd', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'.9rem' }}>Loading job details…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
      <Footer />
    </>
  );

  if (notFound || !job) return (
    <>
      <Navbar />
      <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'2rem' }}>
        <div style={{ fontSize:'4rem', marginBottom:'1rem', color:'rgba(255,255,255,0.2)' }}><Search size={64} /></div>
        <h2 style={{ color:'#fff', margin:'0 0 .5rem', fontSize:'1.5rem' }}>Position Not Found</h2>
        <p style={{ color:'rgba(255,255,255,0.45)', margin:'0 0 1.75rem' }}>This role may have been removed or filled.</p>
        <Link to="/careers" style={{ padding:'.65rem 1.8rem', borderRadius:'10px', background:'linear-gradient(135deg,#4385cd,#204188)', color:'#fff', fontWeight:700, textDecoration:'none', boxShadow:'0 4px 20px rgba(67,133,205,0.3)' }}>View All Positions</Link>
      </div>
      <Footer />
    </>
  );

  const tc = TYPE_COLOR[job.type] || TYPE_COLOR['Full-Time'];

  return (
    <>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .career-detail * { font-family:'Inter',sans-serif; box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse-glow { 0%,100%{opacity:.6} 50%{opacity:1} }
        .career-detail { animation:fadeUp .4s ease both; }
        .career-detail select option { background-color: #0b1121; color: #ffffff; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px) !important; }
        .req-item { transition:all .15s; }
        .req-item:hover { transform:translateX(4px); }
        .back-link { transition:all .15s; }
        .back-link:hover { color:#4385cd !important; transform:translateX(-2px); }
      `}</style>

      <div className="career-detail">

        {/* ─── HERO ─── */}
        <section style={{ paddingTop:'120px', paddingBottom:'52px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
            <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'1000px', height:'450px', background:`radial-gradient(ellipse at center, ${tc.glow} 0%, transparent 65%)`, animation:'pulse-glow 3s ease infinite' }} />
          </div>

          <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 2rem', position:'relative' }}>
            {/* Breadcrumb */}
            <Link to="/careers" className="back-link" style={{ display:'inline-flex', alignItems:'center', gap:'.45rem', color:'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:'.85rem', fontWeight:500, marginBottom:'2rem' }}>
              <ArrowLeft size={16} />
              Back to Careers
            </Link>

            {/* Badges */}
            <div style={{ display:'flex', gap:'.6rem', flexWrap:'wrap', marginBottom:'1rem', alignItems:'center' }}>
              <span style={{ padding:'.28rem .85rem', borderRadius:'999px', fontSize:'.78rem', fontWeight:700, background:tc.bg, border:`1px solid ${tc.border}`, color:tc.color, boxShadow:`0 0 12px ${tc.glow}` }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:tc.color, display:'inline-block', marginRight:'.4rem', verticalAlign:'middle', animation:'pulse-glow 1.5s ease infinite' }} />
                {job.type}
              </span>
              {!job.isActive && (
                <span style={{ padding:'.28rem .85rem', borderRadius:'999px', fontSize:'.78rem', fontWeight:700, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.4)', color:'#f87171' }}>
                  Closed
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontSize:'clamp(2rem, 5vw, 3.2rem)', fontWeight:900, color:'#fff', margin:'0 0 .85rem', lineHeight:1.15, letterSpacing:'-.02em' }}>
              {job.title}
            </h1>

            {/* Meta */}
            <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', marginBottom:'2rem' }}>
              {job.department && (
                <div style={{ display:'flex', alignItems:'center', gap:'.4rem', color:'rgba(255,255,255,0.5)', fontSize:'.9rem' }}>
                  <Briefcase size={15} />
                  {job.department}
                </div>
              )}
              {job.location && (
                <div style={{ display:'flex', alignItems:'center', gap:'.4rem', color:'rgba(255,255,255,0.5)', fontSize:'.9rem' }}>
                  <MapPin size={15} />
                  {job.location}
                </div>
              )}
              {job.deadline && (
                <div style={{ display:'flex', alignItems:'center', gap:'.4rem', color:'rgba(255,255,255,0.5)', fontSize:'.9rem' }}>
                  <Calendar size={15} />
                  Apply before: {new Date(job.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── BODY ─── */}
        <section style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 2rem 6rem', display:'grid', gridTemplateColumns:'1fr 420px', gap:'2rem', alignItems:'start' }}>

          {/* LEFT: Job Details */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* About */}
            <div style={{ padding:'2rem', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(67,133,205,0.04))' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'1.4rem' }}>
                <div style={{ width:36, height:36, borderRadius:'10px', background:'rgba(67,133,205,0.15)', border:'1px solid rgba(67,133,205,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#60a5fa' }}><Info size={18} /></div>
                <h2 style={{ margin:0, fontSize:'1.05rem', fontWeight:700, color:'#fff' }}>About This Role</h2>
              </div>
              <div style={{ color:'rgba(255,255,255,0.7)', lineHeight:1.85, fontSize:'.93rem', whiteSpace:'pre-wrap' }}>
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div style={{ padding:'2rem', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(16,185,129,0.03))' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'1.4rem' }}>
                  <div style={{ width:36, height:36, borderRadius:'10px', background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#34d399' }}><CheckCircle size={18} /></div>
                  <h2 style={{ margin:0, fontSize:'1.05rem', fontWeight:700, color:'#fff' }}>Requirements & Qualifications</h2>
                </div>
                <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:'.7rem' }}>
                  {job.requirements.map((req, i) => (
                    <li key={i} className="req-item" style={{ display:'flex', gap:'.85rem', alignItems:'flex-start', color:'rgba(255,255,255,0.7)', fontSize:'.92rem', lineHeight:1.65 }}>
                      <span style={{ flexShrink:0, width:22, height:22, borderRadius:'6px', background:`rgba(${tc.color === '#60a5fa' ? '67,133,205' : '16,185,129'},0.15)`, border:`1px solid ${tc.border}`, display:'flex', alignItems:'center', justifyContent:'center', marginTop:'.1rem' }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:tc.color }} />
                      </span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What we offer */}
            <div style={{ padding:'2rem', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(139,92,246,0.03))' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'1.4rem' }}>
                <div style={{ width:36, height:36, borderRadius:'10px', background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#c084fc' }}><Gift size={18} /></div>
                <h2 style={{ margin:0, fontSize:'1.05rem', fontWeight:700, color:'#fff' }}>What We Offer</h2>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                {['Competitive Salary', 'Remote-Friendly', 'Learning Budget', 'Health Benefits', 'Flexible Hours', 'Career Growth'].map(b => (
                  <div key={b} style={{ display:'flex', alignItems:'center', gap:'.5rem', padding:'.6rem .85rem', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.03)', fontSize:'.83rem', color:'rgba(255,255,255,0.65)', fontWeight:500 }}>
                    <span style={{ color:'#34d399', fontSize:'.9rem' }}>✓</span> {b}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Application Form */}
          <div style={{ position:'sticky', top:'100px' }}>
            {submitted ? (
              <div style={{ padding:'3rem 2rem', borderRadius:'20px', border:'1px solid rgba(52,211,153,0.35)', background:'linear-gradient(135deg, rgba(52,211,153,0.07), rgba(16,185,129,0.04))', textAlign:'center', animation:'fadeUp .4s ease' }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(52,211,153,0.15)', border:'2px solid rgba(52,211,153,0.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem', color:'#34d399' }}>
                  <CheckCircle size={36} />
                </div>
                <h3 style={{ margin:'0 0 .6rem', color:'#34d399', fontSize:'1.25rem', fontWeight:800 }}>Application Sent!</h3>
                <p style={{ color:'rgba(255,255,255,0.55)', margin:'0 0 1.75rem', lineHeight:1.75, fontSize:'.9rem' }}>
                  Thank you, <strong style={{ color:'#fff' }}>{form.fullName}</strong>! We have received your application and will review it within 3–5 business days. Check your email for a confirmation.
                </p>
                <Link to="/careers" style={{ display:'inline-block', padding:'.6rem 1.6rem', borderRadius:'999px', background:'rgba(52,211,153,0.15)', border:'1px solid rgba(52,211,153,0.4)', color:'#34d399', textDecoration:'none', fontWeight:700, fontSize:'.9rem' }}>
                  View Other Positions
                </Link>
              </div>
            ) : (
              <div style={{ padding:'1.85rem', borderRadius:'20px', border:`1px solid ${job.isActive ? 'rgba(67,133,205,0.2)' : 'rgba(255,255,255,0.07)'}`, background:`linear-gradient(135deg, rgba(255,255,255,0.04), ${job.isActive ? 'rgba(67,133,205,0.04)' : 'rgba(255,255,255,0.02)'})` }}>

                {/* Form Header */}
                <div style={{ marginBottom:'1.5rem', paddingBottom:'1.1rem', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  <h2 style={{ margin:'0 0 .3rem', fontSize:'1.15rem', fontWeight:800, color:'#fff' }}>
                    Apply for This Position
                  </h2>
                  <p style={{ margin:0, fontSize:'.82rem', color:'rgba(255,255,255,0.4)', lineHeight:1.5 }}>
                    {job.isActive ? 'Fill in the form below and we will get back to you soon.' : 'This position is currently closed.'}
                  </p>
                </div>

                {!job.isActive && (
                  <div style={{ padding:'.85rem 1rem', borderRadius:'10px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', fontSize:'.85rem', marginBottom:'1.25rem', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:'.5rem' }}>
                    <AlertTriangle size={16} /> This position is no longer accepting applications.
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>

                  {/* Full Name + Email */}
                  {[
                    { k:'fullName', label:'Full Name', type:'text', placeholder:'John Doe', required:true, icon:<User size={13} /> },
                    { k:'email', label:'Email Address', type:'email', placeholder:'john@example.com', required:true, icon:<Mail size={13} /> },
                  ].map(({ k, label, type, placeholder, required, icon }) => (
                    <div key={k}>
                      <label style={{ display:'flex', alignItems:'center', gap:'.35rem', marginBottom:'.4rem', fontSize:'.78rem', fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'.05em' }}>
                        {icon} {label} {required && <span style={{ color:'#f87171', fontWeight:400, textTransform:'none' }}>*</span>}
                      </label>
                      <input required={required} type={type} value={form[k]} onChange={e => set(k, e.target.value)}
                        placeholder={placeholder} style={inputStyle(k)} disabled={!job.isActive}
                        onFocus={() => setFocused(k)} onBlur={() => setFocused(null)} />
                    </div>
                  ))}

                  {/* Phone + Experience (2 col) */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                    <div>
                      <label style={{ display:'flex', alignItems:'center', gap:'.35rem', marginBottom:'.4rem', fontSize:'.78rem', fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'.05em' }}>
                        <Phone size={13} /> Phone
                      </label>
                      <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                        placeholder="+92 300…" style={inputStyle('phone')} disabled={!job.isActive}
                        onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} />
                    </div>
                    <div>
                      <label style={{ display:'flex', alignItems:'center', gap:'.35rem', marginBottom:'.4rem', fontSize:'.78rem', fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'.05em' }}>
                        <Calendar size={13} /> Experience
                      </label>
                      <select value={form.experience} onChange={e => set('experience', e.target.value)}
                        style={{ ...inputStyle('experience'), cursor:'pointer', background: focused === 'experience' ? 'rgba(67,133,205,0.06)' : 'rgba(6,28,57,0.8)' }}
                        disabled={!job.isActive} onFocus={() => setFocused('experience')} onBlur={() => setFocused(null)}>
                        <option value="">Select…</option>
                        {EXP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* LinkedIn + Portfolio */}
                  {[
                    { k:'linkedin', label:'LinkedIn', placeholder:'linkedin.com/in/yourprofile', icon:<Linkedin size={13} /> },
                    { k:'portfolio', label:'Portfolio / GitHub', placeholder:'github.com/yourprofile', icon:<LinkIcon size={13} /> },
                  ].map(({ k, label, placeholder, icon }) => (
                    <div key={k}>
                      <label style={{ display:'flex', alignItems:'center', gap:'.35rem', marginBottom:'.4rem', fontSize:'.78rem', fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'.05em' }}>
                        {icon} {label}
                      </label>
                      <input type="url" value={form[k]} onChange={e => set(k, e.target.value)}
                        placeholder={placeholder} style={inputStyle(k)} disabled={!job.isActive}
                        onFocus={() => setFocused(k)} onBlur={() => setFocused(null)} />
                    </div>
                  ))}

                  {/* Resume Upload */}
                  <div>
                    <label style={{ display:'flex', alignItems:'center', gap:'.35rem', marginBottom:'.4rem', fontSize:'.78rem', fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'.05em' }}>
                      <FileText size={13} /> Resume / CV (PDF, DOCX)
                    </label>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={e => set('resume', e.target.files[0])}
                      style={{ ...inputStyle('resume'), padding: '.5rem', cursor: 'pointer' }} disabled={!job.isActive}
                      onFocus={() => setFocused('resume')} onBlur={() => setFocused(null)} />
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.4rem' }}>
                      <span style={{ fontSize:'.78rem', fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'.05em', display:'flex', alignItems:'center', gap:'.35rem' }}>
                        <FileText size={13} /> Cover Letter
                      </span>
                      <span style={{ fontSize:'.72rem', color:'rgba(255,255,255,0.25)' }}>{form.coverLetter.length}/2000</span>
                    </label>
                    <textarea rows={5} value={form.coverLetter} onChange={e => set('coverLetter', e.target.value)}
                      placeholder="Tell us why you are a great fit for this role, your key strengths, and what excites you about this opportunity…"
                      maxLength={2000}
                      style={{ ...inputStyle('coverLetter'), resize:'vertical', lineHeight:1.7 }}
                      disabled={!job.isActive} onFocus={() => setFocused('coverLetter')} onBlur={() => setFocused(null)} />
                  </div>

                  {formError && (
                    <div style={{ padding:'.75rem 1rem', borderRadius:'10px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', fontSize:'.85rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                      <AlertTriangle size={16} /> {formError}
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={submitting || !job.isActive}
                    style={{ width:'100%', padding:'.8rem', borderRadius:'12px', border:'none', background: job.isActive ? 'linear-gradient(135deg, #4385cd, #204188)' : 'rgba(255,255,255,0.08)', color: job.isActive ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight:800, fontSize:'1rem', cursor: job.isActive && !submitting ? 'pointer' : 'not-allowed', transition:'all .2s', boxShadow: job.isActive ? '0 4px 20px rgba(67,133,205,0.3)' : 'none', marginTop:'.25rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'.5rem', letterSpacing:'.01em' }}
                  >
                    {submitting ? (
                      <>
                        <div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
                        Submitting…
                      </>
                    ) : job.isActive ? <><Send size={16} /> Submit Application</> : 'Applications Closed'}
                  </button>

                  <p style={{ margin:0, fontSize:'.73rem', color:'rgba(255,255,255,0.25)', textAlign:'center', lineHeight:1.5 }}>
                    🔒 Your data is safe with us. We never share your info with third parties.
                  </p>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
