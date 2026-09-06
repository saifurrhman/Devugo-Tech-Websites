import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CareerAPI, TeamAPI, CompanyInfoAPI } from '../lib/api';
import { Rocket, Globe, DollarSign, Target, Search, Briefcase, MapPin, ArrowRight, Calendar } from 'lucide-react';
import SEO from '../components/SEO';

const TYPE_STYLE = {
  'Full-Time':  { bg: 'bg-blue-500/15', border: 'border-blue-500/35', text: 'text-blue-400', badgeBg: 'bg-blue-500/20' },
  'Part-Time':  { bg: 'bg-purple-500/15', border: 'border-purple-500/35', text: 'text-purple-400', badgeBg: 'bg-purple-500/20' },
  'Contract':   { bg: 'bg-amber-500/15', border: 'border-amber-500/35', text: 'text-amber-400', badgeBg: 'bg-amber-500/20' },
  'Internship': { bg: 'bg-emerald-500/15', border: 'border-emerald-500/35', text: 'text-emerald-400', badgeBg: 'bg-emerald-500/20' },
  'Freelance':  { bg: 'bg-rose-500/15', border: 'border-rose-500/35', text: 'text-rose-400', badgeBg: 'bg-rose-500/20' },
};

const PERKS = [
  { 
    icon: <Rocket size={22} className="text-blue-400" />, 
    title: 'Fast Growth', 
    desc: 'Learn and grow with cutting-edge tech', 
    boxBg: 'bg-blue-500/10 border-blue-500/30' 
  },
  { 
    icon: <Globe size={22} className="text-purple-400" />, 
    title: 'Remote First', 
    desc: 'Work from anywhere in the world', 
    boxBg: 'bg-purple-500/10 border-purple-500/30' 
  },
  { 
    icon: <DollarSign size={22} className="text-amber-400" />, 
    title: 'Competitive Pay', 
    desc: 'Market-leading salaries & bonuses', 
    boxBg: 'bg-amber-500/10 border-amber-500/30' 
  },
  { 
    icon: <Target size={22} className="text-rose-400" />, 
    title: 'Impactful Work', 
    desc: 'Build products used by thousands', 
    boxBg: 'bg-rose-500/10 border-rose-500/30' 
  },
];

const DEFAULT_SAMPLE_JOBS = [
  {
    _id: 'sample-1',
    title: 'Laravel Developer / PHP Developer',
    department: 'Engineering / Backend Development',
    location: 'Remotely',
    type: 'Full-Time',
    slug: 'laravel-developer',
    isActive: true
  },
  {
    _id: 'sample-2',
    title: 'SQA (Software Quality Assurance)',
    department: 'Quality Assurance / Engineering',
    location: 'Remotely',
    deadline: '2026-08-27',
    type: 'Internship',
    slug: 'sqa-engineer',
    isActive: true
  },
  {
    _id: 'sample-3',
    title: 'UI/UX Designer (Figma)',
    department: 'Design / Product',
    location: 'Remote',
    deadline: '2026-08-22',
    type: 'Internship',
    slug: 'ui-ux-designer',
    isActive: true
  },
  {
    _id: 'sample-4',
    title: 'Full Stack Developer (MERN Stack)',
    department: 'Engineering / Web Development',
    location: 'Remote',
    deadline: '2026-08-15',
    type: 'Part-Time',
    slug: 'full-stack-developer-mern',
    isActive: true
  },
  {
    _id: 'sample-5',
    title: 'Business Development Executive LinkedIn & Outbound Sales',
    department: 'Sales / Business Development',
    location: 'Remote',
    deadline: '2026-07-30',
    type: 'Internship',
    slug: 'business-development-executive',
    isActive: true
  }
];

function getCategoryStyle(department = '', type = '') {
  const d = (department || '').toLowerCase();
  if (d.includes('design') || d.includes('product') || d.includes('ui/ux')) {
    return { bg: 'bg-purple-500/15', border: 'border-purple-500/35', text: 'text-purple-400', badgeBg: 'bg-purple-500/20' };
  }
  if (d.includes('quality') || d.includes('sqa') || d.includes('testing')) {
    return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/35', text: 'text-emerald-400', badgeBg: 'bg-emerald-500/20' };
  }
  if (d.includes('sales') || d.includes('business') || d.includes('outbound')) {
    return { bg: 'bg-amber-500/15', border: 'border-amber-500/35', text: 'text-amber-400', badgeBg: 'bg-amber-500/20' };
  }
  return { bg: 'bg-blue-500/15', border: 'border-blue-500/35', text: 'text-blue-400', badgeBg: 'bg-blue-500/20' };
}

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [teamCount, setTeamCount] = useState('50+');
  const [countriesCount, setCountriesCount] = useState('12+');

  useEffect(() => {
    CareerAPI.list()
      .then(data => {
        const fetched = Array.isArray(data) ? data.filter(j => j.isActive) : [];
        setJobs(fetched.length > 0 ? fetched : DEFAULT_SAMPLE_JOBS);
      })
      .catch(() => {
        setJobs(DEFAULT_SAMPLE_JOBS);
      })
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

  const types = useMemo(() => ['All', 'Full-Time', 'Internship', 'Part-Time'], []);

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

      <div className="bg-[#061c39] text-white min-h-screen pt-28 pb-16">

        {/* ─── HERO ─── */}
        <section className="relative overflow-hidden pt-8 pb-12 text-center px-4 flex flex-col items-center justify-center">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl w-full mx-auto z-10 flex flex-col items-center text-center">
            
            {/* Top Hiring Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-[#0f2444]/80 backdrop-blur-md mb-6 shadow-md mx-auto">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span className="text-[11px] font-extrabold text-blue-400 tracking-wider uppercase">
                • We're Actively Hiring
              </span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 leading-tight text-center">
              Shape the Future<br />
              <span className="text-blue-400">
                of Technology
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed font-normal text-center">
              Join a team of brilliant minds building next-generation digital products. Work on meaningful projects, grow fast, and enjoy the journey.
            </p>

            {/* Stat Counters Row */}
            <div className="flex justify-center items-center gap-4 sm:gap-6 flex-wrap w-full max-w-2xl mx-auto mb-8">
              <div className="bg-[#0f223f]/90 border border-slate-700/60 rounded-2xl py-4 px-6 sm:px-8 flex-1 min-w-[140px] text-center shadow-lg backdrop-blur-md hover:border-blue-500/40 transition-all">
                <div className="text-3xl md:text-4xl font-black text-white">
                  {jobs.length}
                </div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                  Open Roles
                </div>
              </div>
              <div className="bg-[#0f223f]/90 border border-slate-700/60 rounded-2xl py-4 px-6 sm:px-8 flex-1 min-w-[140px] text-center shadow-lg backdrop-blur-md hover:border-blue-500/40 transition-all">
                <div className="text-3xl md:text-4xl font-black text-white">
                  {teamCount}
                </div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                  Team Members
                </div>
              </div>
              <div className="bg-[#0f223f]/90 border border-slate-700/60 rounded-2xl py-4 px-6 sm:px-8 flex-1 min-w-[140px] text-center shadow-lg backdrop-blur-md hover:border-blue-500/40 transition-all">
                <div className="text-3xl md:text-4xl font-black text-white">
                  {countriesCount}
                </div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">
                  Countries
                </div>
              </div>
            </div>

            {/* Search Input Bar with Icon and Search Button */}
            <div className="relative w-full max-w-lg mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input 
                value={q} 
                onChange={e => setQ(e.target.value)}
                placeholder="Search roles, departments, locations..."
                className="w-full pl-11 pr-24 py-3.5 rounded-xl bg-[#0f223f]/90 border border-slate-700/60 text-white placeholder-slate-400 text-sm md:text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xl backdrop-blur-md"
              />
              <button 
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-lg transition-all shadow-md"
              >
                Search
              </button>
            </div>

          </div>
        </section>

        {/* ─── PERKS GRID ─── */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-12">
            {PERKS.map(p => (
              <div 
                key={p.title} 
                className="bg-[#0f223f]/80 border border-slate-700/60 rounded-2xl p-6 text-center shadow-md backdrop-blur-md hover:border-blue-500/50 hover:bg-[#132747] transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${p.boxBg} border flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  {p.icon}
                </div>
                <h3 className="text-white font-extrabold text-base mb-1.5">
                  {p.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ─── FILTER BAR ─── */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mr-2">
                FILTER:
              </span>
              {types.map(t => {
                const active = activeType === t;
                return (
                  <button 
                    key={t} 
                    onClick={() => setActiveType(t)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                      active 
                        ? 'bg-blue-600 text-white border border-blue-400/50 shadow-blue-600/30' 
                        : 'bg-[#0f223f]/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Showing {filtered.length} of {jobs.length} open roles
            </span>
          </div>

          {/* ─── LOADING ─── */}
          {loading && (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading positions...</p>
            </div>
          )}

          {/* ─── JOB CARDS LIST ─── */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-3.5">
              {filtered.map((job, i) => {
                const catStyle = getCategoryStyle(job.department, job.type);
                const typeStyle = TYPE_STYLE[job.type] || TYPE_STYLE['Full-Time'];
                return (
                  <Link 
                    key={job._id || i} 
                    to={`/careers/${job.slug || job._id}`} 
                    className="block group"
                  >
                    <div className="bg-[#0f223f]/80 border border-slate-700/60 hover:border-blue-500/60 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200 hover:bg-[#132747] hover:shadow-xl backdrop-blur-md">
                      
                      <div className="flex items-start md:items-center gap-4 flex-1">
                        {/* Distinct Icon Color according to Category */}
                        <div className={`w-12 h-12 rounded-xl ${catStyle.bg} ${catStyle.border} border flex items-center justify-center shrink-0 shadow-sm`}>
                          <Briefcase size={22} className={catStyle.text} />
                        </div>
                        <div className="min-w-0">
                          {/* Strong Visual Hierarchy: Bold Prominent Title */}
                          <h3 className="text-lg md:text-xl font-extrabold text-white group-hover:text-blue-400 transition-colors mb-1.5">
                            {job.title}
                          </h3>
                          {/* Muted Compact Details */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-normal">
                            {job.department && (
                              <span className="flex items-center gap-1.5">
                                <Briefcase size={13} className="text-slate-500" />
                                {job.department}
                              </span>
                            )}
                            {job.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin size={13} className="text-slate-500" />
                                {job.location}
                              </span>
                            )}
                            {job.deadline && (
                              <span className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-slate-500" />
                                Apply before: {new Date(job.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/40">
                        {/* Synchronized Job Badges */}
                        <span className={`px-3.5 py-1 rounded-full text-xs font-bold border ${typeStyle.bg} ${typeStyle.border} ${typeStyle.text}`}>
                          {job.type}
                        </span>
                        {/* High Contrast Prominent Action Arrow Button */}
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 flex items-center justify-center transition-all shadow-md shrink-0">
                          <ArrowRight size={18} />
                        </div>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ─── BOTTOM CTA BANNER ─── */}
          {!loading && (
            <div className="bg-[#0f223f] border border-slate-700/60 rounded-3xl p-8 md:p-12 text-center shadow-2xl backdrop-blur-md mt-16 relative overflow-hidden">
              <div className="relative z-10 max-w-xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                  Don't see the perfect role?
                </h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                  We're always looking for exceptional talent. Drop us your resume and we'll reach out when the right opportunity arises.
                </p>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-8 py-3.5 rounded-full shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                >
                  Get In Touch <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}

        </section>

      </div>

      <Footer />
    </>
  );
}
