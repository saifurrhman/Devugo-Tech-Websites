import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AnalyticsAPI, ContactAPI, ServiceAPI, PricingAPI, PortfolioAPI, TeamAPI, BlogAPI } from '../../lib/api';

// Compact number formatter
const __fmtCompactIntl = typeof Intl !== 'undefined' ? new Intl.NumberFormat(undefined, { notation:'compact', maximumFractionDigits:1 }) : null;
function fmtCompact(n){
  const v = Number(n||0);
  return __fmtCompactIntl ? __fmtCompactIntl.format(v) : String(v);
}

// Icons
const IconEye = (props)=> (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6" {...props}>
    <path d="M2 12s4.2-7 10-7 10 7 10 7-4.2 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3.2" fill="currentColor"/>
  </svg>
);
const IconStack = (props)=> (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6" {...props}>
    <rect x="4" y="5" width="16" height="3.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
    <rect x="4" y="10.8" width="13" height="3.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
    <rect x="4" y="16.6" width="9" height="3.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const IconForm = (props)=> (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2.2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M8 8h8M8 12h8M8 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const IconTarget = (props)=> (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6" {...props}>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

function StatCard({ label, value, sub }){
  return (
    <div className="card stat-card p-3 sm:p-4 md:p-5">
      <div className="stat-label muted text-xs sm:text-sm">{label}</div>
      <div className="stat-value text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-1">{value}</div>
      {sub && <div className="stat-sub muted text-xs sm:text-sm mt-1 sm:mt-2">{sub}</div>}
    </div>
  );
}

function KpiCard({ label, value, sub, tone='sky', icon }){
  return (
    <div className={`kpi-card tone-${tone} p-3 sm:p-4 md:p-5`}>
      <div className="kpi-top flex items-center gap-2 sm:gap-3">
        <div className="kpi-icon w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0" aria-hidden="true">{icon}</div>
        <div className="kpi-meta flex-1 min-w-0">
          <div className="kpi-label text-xs sm:text-sm truncate">{label}</div>
          <div className="kpi-value text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mt-0.5 truncate">{value}</div>
        </div>
      </div>
      {sub && <div className="kpi-sub text-xs sm:text-sm mt-2 sm:mt-3 truncate">{sub}</div>}
    </div>
  );
}

// Lightweight area chart
function AreaChart({ data = [], labels = [], height = 180, color = '#7aa8ff', showValues=false }){
  const max = Math.max(1, ...data);
  const [vwState, setVwState] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 768);
  
  React.useEffect(()=>{
    if(typeof window === 'undefined') return;
    let t;
    const onR = ()=>{ clearTimeout(t); t = setTimeout(()=> setVwState(window.innerWidth), 120); };
    window.addEventListener('resize', onR);
    return ()=>{ clearTimeout(t); window.removeEventListener('resize', onR); };
  },[]);

  const vw = Math.max(280, vwState);
  const isMobile = vw < 640;
  const isTablet = vw >= 640 && vw < 1024;
  
  // Responsive dimensions
  const targetWidth = isMobile ? vw - 32 : (isTablet ? vw - 48 : Math.min(600, vw - 64));
  const computed = Math.floor(targetWidth / Math.max(1, (data.length - 1) || 1));
  const step = isMobile ? Math.max(24, Math.min(40, computed || 32)) : Math.max(28, Math.min(56, computed || 48));
  const pad = isMobile ? 12 : 16;
  const labelSpace = isMobile ? 18 : 22;
  const hEff = isMobile ? Math.max(120, height - 40) : (isTablet ? Math.max(140, height - 20) : height);
  const width = Math.max(pad * 2 + (Math.max(0, data.length - 1)) * step, isMobile ? 200 : 220);
  const bottom = hEff - pad - labelSpace;
  const top = pad;
  
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = bottom - (v / max) * (bottom - top);
    return [x, y];
  });
  
  const pathD = points.length ? 'M ' + points.map(p => p.join(' ')).join(' L ') : '';
  const areaD = points.length ? `M ${points[0][0]} ${bottom} L ` + points.map(p => p.join(' ')).join(' L ') + ` L ${points[points.length - 1][0]} ${bottom} Z` : '';
  const gradId = React.useMemo(() => 'g' + Math.random().toString(36).slice(2), []);
  const last = points[points.length - 1];
  const [hover, setHover] = React.useState(null);
  
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let idx = 0, best = Infinity;
    points.forEach((p, i)=>{ const d = Math.abs(p[0]-mx); if(d<best){ best=d; idx=i; } });
    setHover({ i: idx, x: points[idx]?.[0]||0, y: points[idx]?.[1]||0 });
  };
  
  const onLeave = ()=> setHover(null);
  
  // Responsive label display
  const labelSkip = isMobile ? (data.length > 7 ? 2 : 1) : (isTablet && data.length > 10 ? 2 : 1);
  
  return (
    <div className="area-chart overflow-x-auto overflow-y-hidden w-full" style={{ position:'relative', minWidth: isMobile ? '100%' : width, height: hEff }}>
      <svg width={width} height={hEff} viewBox={`0 0 ${width} ${hEff}`} onMouseMove={onMove} onMouseLeave={onLeave} className="w-full">
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Y-axis grid */}
        {Array.from({length: isMobile ? 3 : 4}).map((_,i)=>{
          const gridLines = isMobile ? 2 : 3;
          const y = top + ((bottom-top)/gridLines)*i;
          const val = Math.round(max - (max/gridLines)*i);
          return (
            <g key={i}>
              <line x1={pad} y1={y} x2={width - pad} y2={y} stroke="var(--admin-border)" opacity="0.25" />
              <text className="y-tick" x={pad-4} y={y+3} textAnchor="end" fontSize={isMobile ? "8" : "10"} fill="var(--admin-muted)">{isMobile && val > 999 ? fmtCompact(val) : val.toLocaleString()}</text>
            </g>
          );
        })}
        {/* baseline */}
        <line x1={pad} y1={bottom} x2={width - pad} y2={bottom} stroke="var(--admin-border)" />
        {/* area + line */}
        {points.length > 1 && <path d={areaD} fill={`url(#${gradId})`} stroke="none" />}
        {points.length > 1 && <path d={pathD} fill="none" stroke={color} strokeWidth={isMobile ? "2" : "2.5"} />}
        {/* dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={isMobile ? 2.5 : 3} fill={color} />
            {(showValues && step >= (isMobile ? 30 : 36)) && (
              <text className="pt-val" x={p[0]} y={p[1]-(isMobile ? 6 : 8)} textAnchor="middle" fontSize={isMobile ? "8" : "10"} fill="var(--admin-muted)">
                {fmtCompact(Number(data[i]||0))}
              </text>
            )}
          </g>
        ))}
        {/* hover cursor line */}
        {hover && <line x1={hover.x} y1={top} x2={hover.x} y2={bottom} stroke={color} strokeOpacity="0.25" />}
        {/* highlight last */}
        {last && <circle cx={last[0]} cy={last[1]} r={isMobile ? 4 : 5} fill="#fff" stroke={color} strokeWidth="2" />}
        {/* X-axis labels */}
        {labels.map((lab, i)=> {
          if(i % labelSkip !== 0 && i !== labels.length - 1) return null;
          return (
            <text className="x-lab" key={i} x={pad + i*step} y={bottom + (isMobile ? 12 : 14)} textAnchor="middle" fontSize={isMobile ? "8" : "10"} fill="var(--admin-muted)">
              {isMobile ? lab.slice(0, 3) : lab}
            </text>
          );
        })}
      </svg>
      {hover && (
        <div className="chart-tooltip text-xs sm:text-sm" style={{ left: Math.min(Math.max(hover.x+8, 6), width-120), top: Math.max(hover.y-38, 6) }}>
          <div className="tt-label">{labels[hover.i] || `Point ${hover.i+1}`}</div>
          <div className="tt-value">{fmtCompact(Number(data[hover.i]||0))}</div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [contactsCount, setContactsCount] = useState(null);
  const [entityTotals, setEntityTotals] = useState({ services: 0, pricing: 0, portfolio: 0, team: 0, blogs: 0 });
  const [publishedTotals, setPublishedTotals] = useState({ services: 0, portfolio: 0, blogs: 0 });
  const [range, setRange] = useState('7');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [recentFeed, setRecentFeed] = useState([]);

  useEffect(()=>{
    let mounted = true;
    async function load(){
      setLoading(true); setError('');
      try{
        let s;
        try{
          if(range === 'custom' && from && to){
            s = await AnalyticsAPI.summaryRange({ from, to });
          }else{
            s = await AnalyticsAPI.summaryRange({ range });
          }
        }catch(_e){
          s = await AnalyticsAPI.summary();
        }
        if(mounted) setSummary(s);
      }catch(e){
        if(mounted) setSummary({
          totals: { visitors: 15230, pageviews: 39210, contacts: 84, conversions: 27, blogs: 0, leads: 0, emailsSent: 0, socialPosts: 0 },
          last7: {
            visitors: [210,260,230,280,300,340,390],
            contacts: [2, 1, 3, 4, 5, 6, 7]
          },
          recent: { blog: null, lead: null, email: null, social: null }
        });
      }finally{
        if(mounted) setLoading(false);
      }
    }
    load();
    
    (async()=>{
      try{
        const list = await ContactAPI.list();
        if(mounted) setContactsCount(Array.isArray(list)? list.length : (list?.items?.length||0));
      }catch(_e){ if(mounted) setContactsCount(null); }
    })();
    
    (async()=>{
      try{
        const [servicesRes, pricingRes, portfolioRes, teamRes, blogRes, contactsRes] = await Promise.all([
          ServiceAPI.list().catch(()=>({ items: [] })),
          PricingAPI.list().catch(()=>({ items: [] })),
          PortfolioAPI.list().catch(()=>({ items: [] })),
          TeamAPI.list().catch(()=>({ members: [] })),
          BlogAPI.list().catch(()=>({ posts: [] })),
          ContactAPI.list().catch(()=>([]))
        ]);
        if(mounted){
          setEntityTotals({
            services: (servicesRes.items||[]).length,
            pricing: (pricingRes.items||[]).length,
            portfolio: (portfolioRes.items||[]).length,
            team: (teamRes.members||[]).length,
            blogs: (blogRes.posts || blogRes.items || blogRes || []).length
          });
          
          const servicesArr = servicesRes.items || [];
          const portfolioArr = portfolioRes.items || [];
          const blogsArr = (blogRes.posts || blogRes.items || blogRes || []);
          setPublishedTotals({
            services: servicesArr.filter(it=>it.published).length,
            portfolio: portfolioArr.filter(it=>it.published).length,
            blogs: blogsArr.filter(it=>it.published).length,
          });
          
          const pricingArr = pricingRes.items || [];
          const teamArr = teamRes.members || [];
          const contactsArr = Array.isArray(contactsRes) ? contactsRes : (contactsRes.items||[]);
          const normalize = (list, type) => (list||[]).map(it=>({
            id: it._id || it.id,
            type,
            title: it.title || it.name || it.subject || it.email || 'Untitled',
            status: typeof it.published === 'boolean' ? (it.published ? 'Published' : 'Draft') : undefined,
            date: new Date(it.updatedAt || it.createdAt || it.publishedAt || it.sentAt || it.date || Date.now()),
          }));
          const combined = [
            ...normalize(blogsArr, 'Blog'),
            ...normalize(servicesArr, 'Service'),
            ...normalize(pricingArr, 'Pricing'),
            ...normalize(portfolioArr, 'Portfolio'),
            ...normalize(teamArr, 'Team'),
            ...normalize(contactsArr, 'Contact'),
          ]
          .filter(x=>x.date)
          .sort((a,b)=> b.date - a.date)
          .slice(0, 10);
          setRecentFeed(combined);
        }
      }catch(_e){ /* ignore */ }
    })();
    
    return ()=>{ mounted=false };
  },[range, from, to]);

  const totals = {
    visitors: 0, pageviews: 0, contacts: 0, conversions: 0, blogs: 0, leads: 0, services: 0, pricing: 0, portfolio: 0, team: 0, emailsSent: 0, socialPosts: 0,
    ...(summary?.totals || {})
  };
  
  const mergedTotals = {
    ...totals,
    blogs: entityTotals.blogs || totals.blogs,
    services: entityTotals.services || totals.services,
    pricing: entityTotals.pricing || totals.pricing,
    portfolio: entityTotals.portfolio || totals.portfolio,
    team: entityTotals.team || totals.team,
  };
  
  const contactsTotal = contactsCount != null ? contactsCount : totals.contacts;
  const rawSeries = summary?.last7 || summary?.series || { visitors: [], contacts: [] };
  
  function normalizePoints(input){
    if(!input) return [];
    if(Array.isArray(input) && input.length && typeof input[0] === 'object'){
      return input.map(it=>({ d: new Date(it.date || it.ts || it.d || it[0]), v: Number(it.value ?? it.v ?? it[1] ?? 0) }))
        .filter(p=>!isNaN(p.d.getTime()));
    }
    if(Array.isArray(input)){
      const n = input.length;
      const out=[]; const end = new Date();
      for(let i=0;i<n;i++){
        const d = new Date(end); d.setDate(end.getDate() - (n-1-i));
        out.push({ d, v: Number(input[i]||0) });
      }
      return out;
    }
    return [];
  }
  
  const pointsVisitors = normalizePoints(rawSeries.visitors);
  const pointsContacts = normalizePoints(rawSeries.contacts);
  
  function bucket(points=[], mode='daily'){
    if(mode==='daily'){
      return { values: points.map(p=>p.v), labels: points.map(p=> new Intl.DateTimeFormat(undefined,{ month:'short', day:'numeric'}).format(p.d)) };
    }
    return { values: [], labels: [] };
  }
  
  const granularity = (range==='7' || range==='custom') ? 'daily' : (range==='30' ? 'weekly' : 'monthly');
  const visitorsBucket = bucket(pointsVisitors, granularity);
  const contactsBucket = bucket(pointsContacts, granularity);
  const series = { visitors: visitorsBucket.values, contacts: contactsBucket.values };
  const labels = { visitors: visitorsBucket.labels, contacts: contactsBucket.labels };

  function percentChange(vals=[]){
    if(!vals || vals.length < 2) return null;
    const first = Number(vals[0]||0);
    const last = Number(vals[vals.length-1]||0);
    if(first === 0) return last>0 ? 100 : 0;
    return ((last - first) / first) * 100;
  }
  
  const visitorsPct = percentChange(series.visitors);
  const contactsPct = percentChange(series.contacts);

  function trendPct(arr){
    if(!arr || arr.length < 2) return null;
    const prev = Number(arr[arr.length-2]||0);
    const curr = Number(arr[arr.length-1]||0);
    if(prev === 0) return { pct: null, up: curr>0 };
    const pct = ((curr - prev) / prev) * 100;
    return { pct, up: pct >= 0 };
  }
  
  const visitorsTrend = trendPct(rawSeries.visitors);
  const contactsTrend = trendPct(rawSeries.contacts);

  return (
    <div className="admin-layout min-h-screen">
      <AdminSidebar />
      <main className="admin-content w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <AdminTopbar />
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold mt-2 sm:mt-3 mb-3 sm:mb-4 md:mb-6">Admin Dashboard</h1>

        {error && <div className="card danger mb-3 sm:mb-4 p-3 sm:p-4 text-sm sm:text-base">{error}</div>}

        {/* Top KPI strip - Fully Responsive Grid */}
        <div className="kpi-grid grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
          {loading && (
            <>
              <div className="kpi-card skeleton h-24 sm:h-28 md:h-32" />
              <div className="kpi-card skeleton h-24 sm:h-28 md:h-32" />
              <div className="kpi-card skeleton h-24 sm:h-28 md:h-32" />
              <div className="kpi-card skeleton h-24 sm:h-28 md:h-32" />
            </>
          )}
          {!loading && (
            <>
              <KpiCard
                tone="sky"
                label="Visitors"
                value={fmtCompact(mergedTotals.visitors)}
                sub={visitorsTrend && visitorsTrend.pct!=null ? `${visitorsTrend.up? '▲':'▼'} ${Math.abs(visitorsTrend.pct).toFixed(1)}% vs prev` : 'All time'}
                icon={<IconEye />}
              />
              <KpiCard
                tone="violet"
                label="Pageviews"
                value={fmtCompact(mergedTotals.pageviews)}
                sub="All time"
                icon={<IconStack />}
              />
              <KpiCard
                tone="green"
                label="Forms"
                value={fmtCompact(Number(contactsTotal||0))}
                sub={contactsTrend && contactsTrend.pct!=null ? `${contactsTrend.up? '▲':'▼'} ${Math.abs(contactsTrend.pct).toFixed(1)}% vs prev` : 'Live'}
                icon={<IconForm />}
              />
              <KpiCard
                tone="amber"
                label="Conversions"
                value={fmtCompact(mergedTotals.conversions)}
                sub="Goals"
                icon={<IconTarget />}
              />
            </>
          )}
        </div>

        {/* Quick actions - Mobile optimized */}
        <div className="card quick-links rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 mb-3 sm:mb-4" >
          <div className="ql-wrap grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2" >
            <a className="ql text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 text-center" href="/admin/services" style={{ color: 'white', textDecoration: 'none' }}>Services</a>
            <a className="ql text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 text-center" href="/admin/pricing" style={{ color: 'white', textDecoration: 'none' }}>Pricing</a>
            <a className="ql text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 text-center" href="/admin/portfolio" style={{ color: 'white', textDecoration: 'none' }}>Portfolio</a>
            <a className="ql text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 text-center" href="/admin/blog" style={{ color: 'white', textDecoration: 'none' }}>Blog</a>
            <a className="ql text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 text-center" href="/admin/team" style={{ color: 'white', textDecoration: 'none' }}>Team</a>
            <a className="ql text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 text-center" href="/admin/contacts" style={{ color: 'white', textDecoration: 'none' }}>Contacts</a>
          </div>
        </div>

        {/* Entity totals - Fully Responsive grid */}
        <div className="cards-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <StatCard label="Blogs" value={fmtCompact(Number(mergedTotals.blogs||0))} sub={publishedTotals.blogs? `${publishedTotals.blogs} live` : undefined} />
          <StatCard label="Leads" value={fmtCompact(Number(mergedTotals.leads||contactsTotal||0))} />
          <StatCard label="Services" value={fmtCompact(Number(mergedTotals.services||0))} sub={publishedTotals.services? `${publishedTotals.services} live` : undefined} />
          <StatCard label="Pricing" value={fmtCompact(Number(mergedTotals.pricing||0))} />
          <StatCard label="Portfolio" value={fmtCompact(Number(mergedTotals.portfolio||0))} sub={publishedTotals.portfolio? `${publishedTotals.portfolio} live` : undefined} />
          <StatCard label="Team" value={fmtCompact(Number(mergedTotals.team||0))} />
          <StatCard label="Emails" value={fmtCompact(Number(totals.emailsSent||0))} />
          <StatCard label="Social" value={fmtCompact(Number(totals.socialPosts||0))} />
        </div>

        {/* Range selector - Mobile optimized */}
        <div className="card seg-bar sticky top-14 sm:top-16 z-10 p-2 sm:p-3 mb-3 sm:mb-4">
          <div className="seg flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {['7','30','90','365'].map(opt => (
              <button key={opt} className={`seg-btn text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1.5 sm:py-2${range===opt?' active':''}`} onClick={()=>setRange(opt)}>{opt}d</button>
            ))}
            <button className={`seg-btn text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1.5 sm:py-2${range==='custom'?' active':''}`} onClick={()=>setRange('custom')}>Custom</button>
            {range==='custom' && (
              <div className="seg-custom flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <input type="date" className="ux-input text-xs sm:text-sm px-2 py-1.5" value={from} onChange={e=>setFrom(e.target.value)} />
                <span className="muted hidden sm:inline text-sm">to</span>
                <input type="date" className="ux-input text-xs sm:text-sm px-2 py-1.5" value={to} onChange={e=>setTo(e.target.value)} />
                <button className="btn-secondary text-xs sm:text-sm px-3 py-1.5" onClick={()=>setRange('custom')}>Apply</button>
              </div>
            )}
          </div>
        </div>

        {/* Charts - Fully Responsive */}
        <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 md:mb-6">
          <div className="card p-3 sm:p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2 mb-2 sm:mb-3">
              <strong className="text-sm sm:text-base md:text-lg">Visitors (last {range==='custom' && from && to ? 'range' : `${range}d`})</strong>
              <span className="muted text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-wrap">
                {loading ? 'loading...' : 'Daily'}
                {visitorsPct!=null && (
                  <span className={`chip text-xs ${visitorsPct>=0 ? 'chip-success' : 'chip-error'} px-1.5 py-0.5`}>
                    {visitorsPct>=0 ? '▲' : '▼'} {Math.abs(visitorsPct).toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
            <div className="chart-body overflow-x-auto -mx-1 sm:mx-0">
              <AreaChart data={series.visitors} labels={labels.visitors} height={180} color="#7aa8ff" showValues />
            </div>
          </div>
          
          <div className="card p-3 sm:p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2 mb-2 sm:mb-3">
              <strong className="text-sm sm:text-base md:text-lg">Form submissions (last {range==='custom' && from && to ? 'range' : `${range}d`})</strong>
              <span className="muted text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-wrap">
                {loading ? 'loading...' : 'Daily'}
                {contactsPct!=null && (
                  <span className={`chip text-xs ${contactsPct>=0 ? 'chip-success' : 'chip-error'} px-1.5 py-0.5`}>
                    {contactsPct>=0 ? '▲' : '▼'} {Math.abs(contactsPct).toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
            <div className="chart-body overflow-x-auto -mx-1 sm:mx-0">
              <AreaChart data={series.contacts} labels={labels.contacts} height={180} color="#4ade80" showValues />
            </div>
          </div>
        </div>

        {/* Recent Activity - Mobile optimized */}
        <div className="card p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
          <strong className="text-sm sm:text-base md:text-lg block mb-2 sm:mb-3">Recent Activity</strong>
          {recentFeed.length > 0 ? (
            <ul className="activity-list space-y-2 sm:space-y-3">
              {recentFeed.slice(0, 8).map((it, idx)=>{
                const title = it.title || 'Untitled';
                const date = it.date;
                return (
                  <li key={it.id||idx} className="flex flex-col xs:flex-row xs:justify-between xs:items-start gap-1.5 xs:gap-2 sm:gap-3 border-b border-gray-200 pb-2 sm:pb-3 last:border-0">
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-xs sm:text-sm md:text-base">{title}</strong>
                      {date && <small className="muted text-xs block mt-0.5">{new Date(date).toLocaleString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</small>}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-wrap xs:flex-nowrap">
                      <span className="badge text-xs px-2 py-0.5">{it.type}</span>
                      {it.status && <span className="badge text-xs px-2 py-0.5">{it.status}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="muted text-xs sm:text-sm text-center py-4">No recent activity.</div>
          )}
        </div>
      </main>
    </div>
  );
}