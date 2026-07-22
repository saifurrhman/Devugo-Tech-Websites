import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CareerAPI, TeamAPI, CompanyInfoAPI } from '../lib/api';
import { Rocket, Globe, DollarSign, Target, Search, Briefcase, MapPin, ArrowRight, Calendar } from 'lucide-react';
import SEO from '../components/SEO';

const TYPE_COLOR = {
  'Full-Time':  { bg: 'rgba(67,133,205,0.18)', border: 'rgba(67,133,205,0.5)', color: '#60a5fa', glow: 'rgba(67,133,205,0.3)' },
  'Part-Time':  { bg: 'rgba(139,92,246,0.18)', border: 'rgba(139,92,246,0.5)', color: '#c084fc', glow: 'rgba(139,92,246,0.3)' },
  'Contract':   { bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.5)', color: '#fbbf24', glow: 'rgba(245,158,11,0.3)' },
  'Internship': { bg: 'rgba(16,185,129,0.18)', border: 'rgba(16,185,129,0.5)', color: '#34d399', glow: 'rgba(16,185,129,0.3)' },
  'Freelance':  { bg: 'rgba(239,68,68,0.18)',  border: 'rgba(239,68,68,0.5)',  color: '#f87171', glow: 'rgba(239,68,68,0.3)' },
};

const PERKS = [
  { icon: <Rocket size={24} />, title: 'Fast Growth', desc: 'Learn and grow with cutting-edge tech', color: '#60a5fa' },
  { icon: <Globe size={24} />, title: 'Remote First', desc: 'Work from anywhere in the world', color: '#c084fc' },
  { icon: <DollarSign size={24} />, title: 'Competitive Pay', desc: 'Market-leading salaries & bonuses', color: '#fbbf24' },
  { icon: <Target size={24} />, title: 'Impactful Work', desc: 'Build products used by thousands', color: '#f87171' },
];

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [hoveredJob, setHoveredJob] = useState(null);
  const [teamCount, setTeamCount] = useState('50+');
  const [countriesCount, setCountriesCount] = useState('12+');

  useEffect(() => {
    CareerAPI.list()
      .then(data => setJobs(Array.isArray(data) ? data.filter(j => j.isActive) : []))
      .catch(() => setError('Failed to load open positions.'))
      .finally(() => setLoading(false));
      
    CompanyInfoAPI.getPublic()
      .then(res => {
        if (res?.info) {
          if (res.info.teamMembersCount) setTeamCount(res.info.teamMembersCount);
          if (res.info.countriesCount) setCountriesCount(res.info.countriesCount);
        }
      })
      .catch(() => {});
  }, []);

  const types = useMemo(() => ['All', ...new Set(jobs.map(j => j.type))], [jobs]);

  const filtered = useMemo(() => {
    let r = activeType === 'All' ? jobs : jobs.filter(j => j.type === activeType);
    const t = q.trim().toLowerCase();
    if (t) r = r.filter(j =>
      j.title.toLowerCase().includes(t) ||
      (j.department || '').toLowerCase().includes(t) ||
      (j.location || '').toLowerCase().includes(t)
    );
    return r;
  }, [jobs, activeType, q]);

  return (
    <>
      <SEO
        title="Careers | Join Devugo Tech Solutions"
        description="We're actively hiring! Join a team of brilliant minds building next-generation digital products, AI solutions, and SaaS platforms."
        url="/careers"
      />
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .careers-page * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-glow { 0%,100% { opacity:.5; } 50% { opacity:1; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
        @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        .careers-page { animation: fadeUp .5s ease both; }
        .job-card { transition: all .25s cubic-bezier(.4,0,.2,1); }
        .job-card:hover { transform: translateY(-3px); }
        .perk-card { transition: all .3s cubic-bezier(0.4, 0, 0.2, 1); }
        .perk-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 15px 40px rgba(0,0,0,0.4), 0 0 20px rgba(67,133,205,0.1) inset; border-color: rgba(255,255,255,0.15) !important; background: rgba(255,255,255,0.06) !important; }
        .stat-box { transition: all 0.3s ease; backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); }
        .stat-box:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.08) !important; }
        .search-bar { transition: all .3s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
        .search-bar:focus { outline:none; box-shadow: 0 0 0 2px rgba(67,133,205,0.6), 0 15px 40px rgba(0,0,0,0.4); border-color: rgba(67,133,205,0.8) !important; background: rgba(255,255,255,0.1) !important; }
        .type-pill { transition: all .2s cubic-bezier(0.4, 0, 0.2, 1); }
        .type-pill:hover { opacity:1 !important; transform:scale(1.03); }
        .apply-btn { transition: all .2s ease; }
        .apply-btn:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(67,133,205,0.4) !important; }
      `}</style>

      <div className="careers-page">

        {/* ─── HERO ─── */}
        <section style={{ paddingTop: '130px', paddingBottom: '80px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          {/* Background blobs */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:'900px', height:'500px', background:'radial-gradient(ellipse, rgba(67,133,205,0.2) 0%, transparent 65%)', animation:'pulse-glow 4s ease infinite' }} />
            <div style={{ position:'absolute', top:'60px', left:'5%', width:'350px', height:'350px', background:'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', animation:'float 6s ease infinite' }} />
            <div style={{ position:'absolute', top:'40px', right:'5%', width:'300px', height:'300px', background:'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', animation:'float 8s ease infinite reverse' }} />
          </div>

          <div style={{ position:'relative', maxWidth:'800px', margin:'0 auto', padding:'0 1.5rem' }}>
            {/* Badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', padding:'.35rem 1rem', borderRadius:'999px', border:'1px solid rgba(67,133,205,0.4)', background:'rgba(67,133,205,0.1)', marginBottom:'1.5rem' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#4385cd', animation:'pulse-glow 1.5s ease infinite', display:'inline-block' }} />
              <span style={{ fontSize:'.78rem', fontWeight:700, color:'#60a5fa', letterSpacing:'.1em', textTransform:'uppercase' }}>We&apos;re Actively Hiring</span>
            </div>

            <h1 style={{ fontSize:'clamp(2.2rem, 6vw, 4rem)', fontWeight:900, lineHeight:1.1, margin:'0 0 1.2rem', color:'#fff', letterSpacing:'-.02em' }}>
              Shape the Future<br />
              <span style={{ background:'linear-gradient(135deg, #4385cd, #a78bfa, #34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundSize:'200% 200%', animation:'shimmer 3s linear infinite' }}>
                of Technology
              </span>
            </h1>

            <p style={{ fontSize:'1.15rem', color:'rgba(255,255,255,0.6)', lineHeight:1.75, margin:'0 0 2.5rem', maxWidth:'560px', marginLeft:'auto', marginRight:'auto' }}>
              Join a team of brilliant minds building next-generation digital products. Work on meaningful projects, grow fast, and enjoy the journey.
            </p>

            {/* Stats */}
            <div style={{ display:'flex', justifyContent:'center', gap:'2.5rem', flexWrap:'wrap', marginBottom:'2.5rem' }}>
              {[{ n: jobs.length || '0', l: 'Open Roles' }, { n: teamCount, l: 'Team Members' }, { n: countriesCount, l: 'Countries' }].map(s => (
                <div key={s.l} className="stat-box" style={{ textAlign:'center', padding:'1.5rem 2.5rem', borderRadius:'20px', background:'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize:'2.2rem', fontWeight:800, background:'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1 }}>{s.n}</div>
                  <div style={{ fontSize:'.8rem', color:'rgba(255,255,255,0.5)', marginTop:'.6rem', letterSpacing:'.08em', textTransform:'uppercase', fontWeight:600 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div style={{ position:'relative', maxWidth:'520px', margin:'0 auto' }}>
              <span style={{ position:'absolute', left:'1.1rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.35)', pointerEvents:'none' }}>
                <Search size={17} />
              </span>
              <input className="search-bar" value={q} onChange={e => setQ(e.target.value)}
                placeholder="Search roles, departments, locations…"
                style={{ width:'100%', padding:'1rem 1.2rem 1rem 3.2rem', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'1.05rem', backdropFilter:'blur(16px)' }}
              />
            </div>
          </div>
        </section>

        {/* ─── PERKS ─── */}
        <section style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 1.5rem 5rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1rem', marginBottom:'4rem' }}>
            {PERKS.map(p => (
              <div key={p.title} className="perk-card" style={{ padding:'2rem 1.5rem', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.06)', background:'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', textAlign:'center', cursor:'default', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:`linear-gradient(90deg, transparent, ${p.color}, transparent)`, opacity:0.6 }} />
                <div style={{ marginBottom:'1.2rem', color: p.color, display:'flex', justifyContent:'center', filter:`drop-shadow(0 0 10px ${p.color}40)` }}>{p.icon}</div>
                <div style={{ fontWeight:800, color:'#fff', marginBottom:'.6rem', fontSize:'1.1rem', letterSpacing:'-.01em' }}>{p.title}</div>
                <div style={{ fontSize:'.88rem', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>

          {/* ─── Filter Pills ─── */}
          {!loading && jobs.length > 0 && (
            <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', alignItems:'center', marginBottom:'1.75rem' }}>
              <span style={{ fontSize:'.8rem', color:'rgba(255,255,255,0.4)', marginRight:'.25rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Filter:</span>
              {types.map(t => {
                const c = t !== 'All' ? TYPE_COLOR[t] : null;
                const active = activeType === t;
                return (
                  <button key={t} className="type-pill" onClick={() => setActiveType(t)}
                    style={{ padding:'.38rem .9rem', borderRadius:'999px', fontSize:'.82rem', fontWeight:active ? 700 : 500, cursor:'pointer', border: active ? `1px solid ${c ? c.border : 'rgba(255,255,255,0.5)'}` : '1px solid rgba(255,255,255,0.1)', background: active ? (c ? c.bg : 'rgba(255,255,255,0.12)') : 'transparent', color: active ? (c ? c.color : '#fff') : 'rgba(255,255,255,0.45)', opacity: active ? 1 : 0.8 }}
                  >
                    {active && t !== 'All' && <span style={{ width:6, height:6, borderRadius:'50%', background:c.color, display:'inline-block', marginRight:'.4rem', verticalAlign:'middle' }} />}
                    {t}
                  </button>
                );
              })}
              <span style={{ marginLeft:'auto', fontSize:'.82rem', color:'rgba(255,255,255,0.3)', fontWeight:600 }}>
                {filtered.length} position{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* ─── Loading ─── */}
          {loading && (
            <div style={{ textAlign:'center', padding:'5rem 2rem' }}>
              <div style={{ width:44, height:44, border:'3px solid rgba(67,133,205,0.25)', borderTopColor:'#4385cd', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 1.2rem' }} />
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'.9rem' }}>Loading open positions…</p>
            </div>
          )}

          {error && <div style={{ textAlign:'center', padding:'3rem', color:'rgba(239,68,68,0.7)', fontSize:'.95rem' }}>{error}</div>}

          {/* ─── Empty State ─── */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'4rem 2rem', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.07)', background:'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(67,133,205,0.04))' }}>
              <div style={{ marginBottom:'1rem', color:'rgba(255,255,255,0.2)', display:'flex', justifyContent:'center' }}><Search size={48} /></div>
              <h3 style={{ margin:'0 0 .5rem', color:'#fff', fontSize:'1.2rem', fontWeight:700 }}>
                {jobs.length === 0 ? 'No Open Positions Yet' : 'No Matching Roles'}
              </h3>
              <p style={{ color:'rgba(255,255,255,0.45)', margin:'0 0 1.75rem', fontSize:'.95rem', lineHeight:1.6 }}>
                {jobs.length === 0 ? "We don't have any open roles at the moment. Check back soon!" : 'Try adjusting your search or filter criteria.'}
              </p>
              {(q || activeType !== 'All')
                ? <button onClick={() => { setQ(''); setActiveType('All'); }} style={{ padding:'.55rem 1.4rem', borderRadius:'999px', border:'1px solid rgba(67,133,205,0.4)', background:'rgba(67,133,205,0.1)', color:'#60a5fa', fontWeight:600, cursor:'pointer', fontSize:'.9rem' }}>Clear Filters</button>
                : <a href="/contact" style={{ display:'inline-block', padding:'.65rem 1.8rem', borderRadius:'999px', background:'linear-gradient(135deg, #4385cd, #204188)', color:'#fff', fontWeight:700, textDecoration:'none', fontSize:'.9rem', boxShadow:'0 4px 20px rgba(67,133,205,0.3)' }}>Send Your Resume</a>
              }
            </div>
          )}

          {/* ─── Job Cards ─── */}
          {!loading && !error && filtered.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
              {filtered.map((job, i) => {
                const tc = TYPE_COLOR[job.type] || TYPE_COLOR['Full-Time'];
                const isHov = hoveredJob === i;
                return (
                  <Link key={job._id || i} to={`/careers/${job.slug || job._id}`} style={{ textDecoration:'none' }}>
                    <div className="job-card"
                      onMouseEnter={() => setHoveredJob(i)}
                      onMouseLeave={() => setHoveredJob(null)}
                      style={{ padding:'1.75rem 2rem', borderRadius:'20px', border:`1px solid ${isHov ? tc.border : 'rgba(255,255,255,0.06)'}`, background: isHov ? `linear-gradient(135deg, rgba(255,255,255,0.06), ${tc.bg})` : 'rgba(255,255,255,0.03)', display:'flex', alignItems:'center', gap:'1.5rem', justifyContent:'space-between', cursor:'pointer', animation:`fadeUp .4s ease ${i * .06}s both`, boxShadow: isHov ? `0 15px 40px ${tc.glow}` : 'none', backdropFilter: 'blur(8px)' }}
                    >
                      {/* Icon */}
                      <div style={{ width:56, height:56, borderRadius:'16px', border:`1px solid ${tc.border}`, background:tc.bg, display:'flex', alignItems:'center', justifyContent:'center', color:tc.color, flexShrink:0, boxShadow: isHov ? `0 0 25px ${tc.glow}` : 'none', transition:'all .3s ease' }}>
                        <Briefcase size={26} />
                      </div>

                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <h3 style={{ margin:'0 0 .5rem', fontSize:'1.2rem', fontWeight:800, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', letterSpacing:'-0.01em' }}>
                          {job.title}
                        </h3>
                        <div style={{ display:'flex', gap:'.9rem', flexWrap:'wrap' }}>
                          {job.department && (
                            <span style={{ display:'flex', alignItems:'center', gap:'.3rem', fontSize:'.8rem', color:'rgba(255,255,255,0.45)' }}>
                              <Briefcase size={12} />
                              {job.department}
                            </span>
                          )}
                          {job.location && (
                            <span style={{ display:'flex', alignItems:'center', gap:'.3rem', fontSize:'.8rem', color:'rgba(255,255,255,0.45)' }}>
                              <MapPin size={12} />
                              {job.location}
                            </span>
                          )}
                          {job.deadline && (
                            <span style={{ display:'flex', alignItems:'center', gap:'.3rem', fontSize:'.8rem', color:'rgba(255,255,255,0.45)' }}>
                              <Calendar size={12} />
                              Apply before: {new Date(job.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right */}
                      <div style={{ display:'flex', alignItems:'center', gap:'.85rem', flexShrink:0 }}>
                        <span style={{ padding:'.28rem .8rem', borderRadius:'999px', fontSize:'.77rem', fontWeight:700, background:tc.bg, border:`1px solid ${tc.border}`, color:tc.color, letterSpacing:'.02em' }}>
                          {job.type}
                        </span>
                        <div style={{ width:32, height:32, borderRadius:'8px', border:`1px solid ${isHov ? tc.border : 'rgba(255,255,255,0.1)'}`, background: isHov ? tc.bg : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', color: isHov ? tc.color : 'rgba(255,255,255,0.3)', transition:'all .2s' }}>
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ─── Bottom CTA ─── */}
          {!loading && (
            <div style={{ marginTop:'5rem', padding:'4rem 2rem', borderRadius:'24px', border:'1px solid rgba(167, 139, 250, 0.2)', background:'linear-gradient(135deg, rgba(67,133,205,0.1), rgba(139,92,246,0.1))', textAlign:'center', position:'relative', overflow:'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(167, 139, 250, 0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
              <div style={{ position:'relative', zIndex:1 }}>
                <h3 style={{ margin:'0 0 .8rem', color:'#fff', fontSize:'1.6rem', fontWeight:900, letterSpacing:'-0.02em' }}>
                  {"Don't see the perfect role?"}
                </h3>
                <p style={{ color:'rgba(255,255,255,0.6)', margin:'0 auto 2rem', fontSize:'1.05rem', lineHeight:1.6, maxWidth: '500px' }}>
                  {"We're always looking for exceptional talent. Drop us your resume and we'll reach out when the right opportunity arises."}
                </p>
                <a href="/contact" className="apply-btn" style={{ display:'inline-flex', alignItems:'center', gap:'.6rem', padding:'.85rem 2.5rem', borderRadius:'12px', background:'linear-gradient(135deg, #60a5fa, #a78bfa)', color:'#fff', fontWeight:800, textDecoration:'none', fontSize:'1rem', boxShadow:'0 8px 25px rgba(167, 139, 250, 0.4)', transition: 'all 0.3s ease' }}>
                  Get In Touch <ArrowRight size={18} />
                </a>
              </div>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </>
  );
}
