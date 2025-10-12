
import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AnalyticsAPI, ContactAPI, ServiceAPI, PricingAPI, PortfolioAPI, TeamAPI, BlogAPI } from '../../lib/api';

// Compact number formatter (global)
const __fmtCompactIntl = typeof Intl !== 'undefined' ? new Intl.NumberFormat(undefined, { notation:'compact', maximumFractionDigits:1 }) : null;
function fmtCompact(n){
  const v = Number(n||0);
  return __fmtCompactIntl ? __fmtCompactIntl.format(v) : String(v);
}

// Professional minimal icons (no external deps)
const IconEye = (props)=> (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M2 12s4.2-7 10-7 10 7 10 7-4.2 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3.2" fill="currentColor"/>
  </svg>
);
const IconStack = (props)=> (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="4" y="5" width="16" height="3.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
    <rect x="4" y="10.8" width="13" height="3.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
    <rect x="4" y="16.6" width="9" height="3.4" rx="1.2" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const IconForm = (props)=> (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2.2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M8 8h8M8 12h8M8 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);
const IconTarget = (props)=> (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

function StatCard({ label, value, sub }){
  return (
    <div className="card stat-card" style={{padding:'1rem'}}>
      <div className="stat-label muted">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub muted">{sub}</div>}
    </div>
  );
}

// New colorful KPI card used at the top of the dashboard
function KpiCard({ label, value, sub, tone='sky', icon }){
  return (
    <div className={`kpi-card tone-${tone}`}>
      <div className="kpi-top">
        <div className="kpi-icon" aria-hidden>{icon}</div>
        <div className="kpi-meta">
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
        </div>
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
// Remove or comment out MiniBars if not used
// function MiniBars({ data=[], height=120, color='#8ab8ff' }){
//   const max = Math.max(1, ...data);
//   const w = 12, gap = 6;
//   const svgWidth = data.length * (w + gap) + gap;
//   return (
//     <svg width={svgWidth} height={height} viewBox={`0 0 ${svgWidth} ${height}`}>
//       {data.map((v, i)=>{
//         const h = Math.round((v/max) * (height-16));
//         const x = gap + i*(w+gap);
//         const y = height - h;
//         return <rect key={i} x={x} y={y} width={w} height={h} rx="5" fill={color} opacity={0.9}/>;
//       })}
//     </svg>
//   );
// }

// Lightweight responsive-ish area chart with simple tooltip
function AreaChart({ data = [], labels = [], height = 180, color = '#7aa8ff', showValues=false }){
  const max = Math.max(1, ...data);
  // Track viewport width with light debounce for smoother responsiveness
  const [vwState, setVwState] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 768);
  React.useEffect(()=>{
    if(typeof window === 'undefined') return;
    let t;
    const onR = ()=>{ clearTimeout(t); t = setTimeout(()=> setVwState(window.innerWidth), 120); };
    window.addEventListener('resize', onR);
    return ()=>{ clearTimeout(t); window.removeEventListener('resize', onR); };
  },[]);
  // Responsive step based on viewport width and number of points
  const vw = Math.max(320, Math.min(768, vwState));
  const targetWidth = Math.min(600, vw - 64);
  const computed = Math.floor(targetWidth / Math.max(1, (data.length - 1) || 1));
  const step = Math.max(28, Math.min(56, computed || 48));
  const pad = 16;
  const labelSpace = 22; // space for x-axis labels
  // Auto-tune height on very small phones
  const hEff = vw < 420 ? Math.max(140, height - 30) : height;
  const width = Math.max(pad * 2 + (Math.max(0, data.length - 1)) * step, 220);
  const bottom = hEff - pad - labelSpace; // reserve space for x labels
  const top = pad;
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = bottom - (v / max) * (bottom - top);
    return [x, y];
  });
  const pathD = points.length
    ? 'M ' + points.map(p => p.join(' ')).join(' L ')
    : '';
  const areaD = points.length
    ? `M ${points[0][0]} ${bottom} L ` + points.map(p => p.join(' ')).join(' L ') + ` L ${points[points.length - 1][0]} ${bottom} Z`
    : '';
  const gradId = React.useMemo(() => 'g' + Math.random().toString(36).slice(2), []);
  const last = points[points.length - 1];
  const [hover, setHover] = React.useState(null); // {i,x,y}
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    // find nearest index by x
    let idx = 0, best = Infinity;
    points.forEach((p, i)=>{ const d = Math.abs(p[0]-mx); if(d<best){ best=d; idx=i; } });
    setHover({ i: idx, x: points[idx]?.[0]||0, y: points[idx]?.[1]||0 });
  };
  const onLeave = ()=> setHover(null);
  return (
    <div className="area-chart" style={{ position:'relative', width, height: hEff, overflowY:'hidden', overflowX:'auto' }}>
      <svg width={width} height={hEff} viewBox={`0 0 ${width} ${hEff}`} onMouseMove={onMove} onMouseLeave={onLeave}>
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Y-axis grid (4 ticks) */}
        {Array.from({length:4}).map((_,i)=>{
          const y = top + ((bottom-top)/3)*i;
          const val = Math.round(max - (max/3)*i);
          return (
            <g key={i}>
              <line x1={pad} y1={y} x2={width - pad} y2={y} stroke="var(--admin-border)" opacity="0.25" />
              <text className="y-tick" x={pad-6} y={y+4} textAnchor="end" fontSize="10" fill="var(--admin-muted)">{val.toLocaleString()}</text>
            </g>
          );
        })}
        {/* baseline */}
        <line x1={pad} y1={bottom} x2={width - pad} y2={bottom} stroke="var(--admin-border)" />
        {/* area + line */}
        {points.length > 1 && <path d={areaD} fill={`url(#${gradId})`} stroke="none" />}
        {points.length > 1 && <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" />}
        {/* dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={3} fill={color} />
            {(showValues && step >= 36) && (
              <text className="pt-val" x={p[0]} y={p[1]-8} textAnchor="middle" fontSize="10" fill="var(--admin-muted)">
                {fmtCompact(Number(data[i]||0))}
              </text>
            )}
          </g>
        ))}
        {/* hover cursor line */}
        {hover && <line x1={hover.x} y1={top} x2={hover.x} y2={bottom} stroke={color} strokeOpacity="0.25" />}
        {/* highlight last */}
        {last && <circle cx={last[0]} cy={last[1]} r={5} fill="#fff" stroke={color} strokeWidth="2" />}
        {/* X-axis labels */}
        {labels.map((lab, i)=> {
          const hideDense = (vw < 380) && (i % 2 === 1); // fewer labels on very small screens
          if(hideDense) return null;
          return (
            <text className="x-lab" key={i} x={pad + i*step} y={bottom + 14} textAnchor="middle" fontSize="10" fill="var(--admin-muted)">
              {lab}
            </text>
          );
        })}
      </svg>
      {hover && (
        <div className="chart-tooltip" style={{ left: Math.min(Math.max(hover.x+8, 6), width-160), top: Math.max(hover.y-38, 6) }}>
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
  const [activeTab, setActiveTab] = useState('services');
  const [tabData, setTabData] = useState({}); // { services: [], pricing: [], portfolio: [], blog: [], team: [], contacts: [] }
  const [entityTotals, setEntityTotals] = useState({ services: 0, pricing: 0, portfolio: 0, team: 0, blogs: 0 });
  const [publishedTotals, setPublishedTotals] = useState({ services: 0, portfolio: 0, blogs: 0 });
  const [range, setRange] = useState('7'); // '7' | '30' | '90' | 'custom'
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [recentFeed, setRecentFeed] = useState([]);
  const [legendVisitors, setLegendVisitors] = useState({ current: true, previous: true });
  const [legendContacts, setLegendContacts] = useState({ current: true, previous: true });
  // Submissions widget state
  const [subs, setSubs] = useState({ items: [], totals: { today: 0, last7: 0, last30: 0 } });
  const [toast, setToast] = useState(null); // {title, sub}

  useEffect(()=>{
    let mounted = true;
    async function load(){
      setLoading(true); setError('');
      try{
        // Prefer range API if available
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
        // Fallback mock data if backend not ready
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
    // fetch live contacts count in parallel
    (async()=>{
      try{
        const list = await ContactAPI.list();
        if(mounted) setContactsCount(Array.isArray(list)? list.length : (list?.items?.length||0));
      }catch(_e){ if(mounted) setContactsCount(null); }
    })();
    // fetch latest totals for entities to show on KPI cards
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
          // published counts when available
          const servicesArr = servicesRes.items || [];
          const portfolioArr = portfolioRes.items || [];
          const blogsArr = (blogRes.posts || blogRes.items || blogRes || []);
          setPublishedTotals({
            services: servicesArr.filter(it=>it.published).length,
            portfolio: portfolioArr.filter(it=>it.published).length,
            blogs: blogsArr.filter(it=>it.published).length,
          });
          // unified recent feed
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

  // Submissions widget loader + lightweight polling for new items
  useEffect(()=>{
    let mounted = true;
    let lastSeenId = null;
    function computeTotals(list){
      const now = Date.now();
      const day = 24*60*60*1000;
      const startToday = new Date(); startToday.setHours(0,0,0,0);
      const t0 = startToday.getTime();
      const t7 = now - 7*day;
      const t30 = now - 30*day;
      const today = list.filter(x=> new Date(x.createdAt||0).getTime() >= t0).length;
      const last7 = list.filter(x=> new Date(x.createdAt||0).getTime() >= t7).length;
      const last30 = list.filter(x=> new Date(x.createdAt||0).getTime() >= t30).length;
      return { today, last7, last30 };
    }
    async function loadOnce(){
      try{
        const res = await ContactAPI.list();
        const arr = Array.isArray(res) ? res : (res.items||[]);
        const items = (arr||[]).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
        if(!mounted) return;
        setSubs({ items: items.slice(0,5), totals: computeTotals(arr) });
        lastSeenId = items[0]?._id || items[0]?.id || null;
      }catch(_e){ /* ignore */ }
    }
    async function poll(){
      try{
        const res = await ContactAPI.list();
        const arr = Array.isArray(res) ? res : (res.items||[]);
        const items = (arr||[]).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
        if(!mounted) return;
        // New submission toast
        const newest = items[0];
        const newestId = newest?._id || newest?.id || null;
        if(lastSeenId && newestId && newestId !== lastSeenId){
          setToast({ title: 'New submission received', sub: `${newest.name||newest.email||'Contact'} • ${new Date(newest.createdAt).toLocaleString()}` });
          setTimeout(()=> setToast(null), 4000);
        }
        lastSeenId = newestId || lastSeenId;
        setSubs({ items: items.slice(0,5), totals: computeTotals(arr) });
      }catch(_e){ /* ignore */ }
    }
    loadOnce();
    const id = setInterval(poll, 30000);
    return ()=>{ mounted=false; clearInterval(id); };
  },[]);

  const totals = {
    visitors: 0, pageviews: 0, contacts: 0, conversions: 0, blogs: 0, leads: 0, services: 0, pricing: 0, portfolio: 0, team: 0, emailsSent: 0, socialPosts: 0,
    ...(summary?.totals || {})
  };
  // prefer live counts for entity totals when available
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
  // Normalize to array of {d: Date, v: number}
  function normalizePoints(input, daysHint){
    if(!input) return [];
    // objects with date/value
    if(Array.isArray(input) && input.length && typeof input[0] === 'object'){
      return input.map(it=>({ d: new Date(it.date || it.ts || it.d || it[0]), v: Number(it.value ?? it.v ?? it[1] ?? 0) }))
        .filter(p=>!isNaN(p.d.getTime()));
    }
    // plain numbers: synthesize dates ending today
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
  const pointsVisitors = normalizePoints(rawSeries.visitors, Number(range));
  const pointsContacts = normalizePoints(rawSeries.contacts, Number(range));
  // Aggregation helpers
  function bucket(points=[], mode='daily'){
    if(mode==='daily'){
      return { values: points.map(p=>p.v), labels: points.map(p=> new Intl.DateTimeFormat(undefined,{ month:'short', day:'numeric'}).format(p.d)) };
    }
    const map = new Map();
    const fmtMonth = new Intl.DateTimeFormat(undefined,{ month:'short', year:'numeric'});
    const fmtDay = new Intl.DateTimeFormat(undefined,{ month:'short', day:'numeric'});
    const weekStart = (d)=>{ const x=new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x; };
    for(const p of points){
      let key,label;
      if(mode==='weekly'){
        const start=weekStart(p.d); key='w'+start.toISOString().slice(0,10); const end=new Date(start); end.setDate(start.getDate()+6);
        label=`${start.toLocaleDateString(undefined,{weekday:'short'})}-${end.toLocaleDateString(undefined,{weekday:'short'})} ${fmtDay.format(start)} – ${fmtDay.format(end)}`;
      }else if(mode==='monthly' || mode==='yearly'){
        const y=p.d.getFullYear(); const m=p.d.getMonth()+1; key=`m${y}-${m.toString().padStart(2,'0')}`; label=fmtMonth.format(p.d);
      }
      const prev = map.get(key) || { sum:0, label };
      prev.sum += p.v; prev.label = label; map.set(key, prev);
    }
    const entries = Array.from(map.entries()).sort((a,b)=> a[0] > b[0] ? 1 : -1);
    return { values: entries.map(e=>e[1].sum), labels: entries.map(e=>e[1].label) };
  }
  // Decide granularity by range
  const granularity = (range==='7' || range==='custom')
    ? 'daily'
    : (range==='30' ? 'weekly' : 'monthly'); // 90/365 aggregate monthly
  const displayGran = (
    range==='7' || range==='custom' ? 'Daily' :
    range==='30' ? 'Weekly' :
    range==='90' ? 'Monthly' :
    range==='365' ? 'Yearly' : 'Daily'
  );
  const visitorsBucket = bucket(pointsVisitors, granularity);
  const contactsBucket = bucket(pointsContacts, granularity);
  const series = { visitors: visitorsBucket.values, contacts: contactsBucket.values };
  const labels = { visitors: visitorsBucket.labels, contacts: contactsBucket.labels };
  // Previous period overlay: take same number of buckets immediately before current window from normalized points
  function previousPeriod(points, mode){
    // build buckets over full normalized timeline
    const all = bucket(points, mode);
    const n = (mode==='daily') ? points.length : all.values.length;
    const curLen = (mode==='daily') ? series.visitors.length : (mode ? series.visitors.length : 0);
    // Use length of current bucketed series for alignment
    const L = curLen || all.values.length;
    const end = all.values.length - L;
    const start = Math.max(0, end - L);
    return {
      values: all.values.slice(start, end),
      labels: all.labels.slice(start, end)
    };
  }
  const prevVisitors = previousPeriod(pointsVisitors, granularity);
  const prevContacts = previousPeriod(pointsContacts, granularity);
  const recent = summary?.recent || {};

  // Percent change helpers for displayed series
  function percentChange(vals=[]){
    if(!vals || vals.length < 2) return null;
    const first = Number(vals[0]||0);
    const last = Number(vals[vals.length-1]||0);
    if(first === 0) return last>0 ? 100 : 0;
    return ((last - first) / first) * 100;
  }
  const visitorsPct = percentChange(series.visitors);
  const contactsPct = percentChange(series.contacts);

  // Simple trend vs previous day
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

  // Lazy-load tab data on demand
  useEffect(()=>{
    let mounted = true;
    async function loadTab(key){
      try{
        if (tabData[key]) return; // already loaded
        let items = [];
        if (key === 'services'){ const res = await ServiceAPI.list(); items = (res.items||[]).sort((a,b)=> new Date(b.updatedAt||b.createdAt) - new Date(a.updatedAt||a.createdAt)); }
        if (key === 'pricing'){ const res = await PricingAPI.list(); items = (res.items||[]).sort((a,b)=> new Date(b.updatedAt||b.createdAt) - new Date(a.updatedAt||a.createdAt)); }
        if (key === 'portfolio'){ const res = await PortfolioAPI.list(); items = (res.items||[]).sort((a,b)=> new Date(b.updatedAt||b.createdAt) - new Date(a.updatedAt||a.createdAt)); }
        if (key === 'blog'){
          const res = await BlogAPI.list();
          items = (res.items || res.posts || res || []);
          items = items.sort((a,b)=> new Date(b.updatedAt||b.createdAt||b.publishedAt) - new Date(a.updatedAt||a.createdAt||a.publishedAt));
        }
        if (key === 'team'){ const res = await TeamAPI.list(); items = (res.members||[]).sort((a,b)=> new Date(b.updatedAt||b.createdAt) - new Date(a.updatedAt||a.createdAt)); }
        if (key === 'contacts'){ const res = await ContactAPI.list(); items = (Array.isArray(res)? res : (res.items||[])).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)); }
        if(mounted) setTabData(prev=>({ ...prev, [key]: items.slice(0,5) }));
      }catch(_e){ /* ignore */ }
    }
    loadTab(activeTab);
    // Prefetch for Blogs & Leads section so they render immediately
    if (activeTab !== 'blog') loadTab('blog');
    if (activeTab !== 'contacts') loadTab('contacts');
    return ()=>{ mounted=false };
  }, [activeTab, tabData]);

  // Auto-refresh recent activity feed every 60s (reactive updates)
  useEffect(()=>{
    let mounted = true;
    async function refresh(){
      try{
        const [servicesRes, pricingRes, portfolioRes, teamRes, blogRes, contactsRes] = await Promise.all([
          ServiceAPI.list().catch(()=>({ items: [] })),
          PricingAPI.list().catch(()=>({ items: [] })),
          PortfolioAPI.list().catch(()=>({ items: [] })),
          TeamAPI.list().catch(()=>({ members: [] })),
          BlogAPI.list().catch(()=>({ posts: [] })),
          ContactAPI.list().catch(()=>([]))
        ]);
        if(!mounted) return;
        const servicesArr = servicesRes.items || [];
        const pricingArr = pricingRes.items || [];
        const portfolioArr = portfolioRes.items || [];
        const teamArr = teamRes.members || [];
        const blogsArr = (blogRes.posts || blogRes.items || blogRes || []);
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
      }catch(_e){ /* ignore */ }
    }
    refresh();
    const id = setInterval(refresh, 60000);
    return ()=>{ mounted = false; clearInterval(id); };
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1 className="text-xl md:text-2xl font-extrabold mt-1">Admin Dashboard</h1>

        {error && <div className="card danger" style={{marginTop:'1rem'}}>{error}</div>}

        {/* Top KPI strip */}
        <div className="kpi-grid grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4" style={{marginTop:'1rem'}}>
          {loading && (
            <>
              <div className="kpi-card skeleton" />
              <div className="kpi-card skeleton" />
              <div className="kpi-card skeleton" />
              <div className="kpi-card skeleton" />
            </>
          )}
          {!loading && (
            <>
          <KpiCard
            tone="sky"
            label="Visitors"
            value={fmtCompact(mergedTotals.visitors)}
            sub={visitorsTrend && visitorsTrend.pct!=null ? `${visitorsTrend.up? '▲':'▼'} ${Math.abs(visitorsTrend.pct).toFixed(1)}% vs prev day` : 'All time'}
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
            label="Form Submissions"
            value={fmtCompact(Number(contactsTotal||0))}
            sub={contactsTrend && contactsTrend.pct!=null ? `${contactsTrend.up? '▲':'▼'} ${Math.abs(contactsTrend.pct).toFixed(1)}% vs prev day` : (contactsCount!=null? 'Live (Contacts)':'From Analytics')}
            icon={<IconForm />}
          />
          <KpiCard
            tone="amber"
            label="Conversions"
            value={fmtCompact(mergedTotals.conversions)}
            sub="Leads / Goals"
            icon={<IconTarget />}
          />
            </>
          )}
        </div>

        {/* Quick actions */}
        <div className="card quick-links rounded-xl" style={{marginTop:'.9rem', padding:'.6rem .8rem'}}>
          <div className="ql-wrap">
            <a className="ql" href="/admin/services">Services</a>
            <a className="ql" href="/admin/pricing">Pricing</a>
            <a className="ql" href="/admin/portfolio">Portfolio</a>
            <a className="ql" href="/admin/blog">Blog</a>
            <a className="ql" href="/admin/team">Team</a>
            <a className="ql" href="/admin/contacts">Contacts</a>
          </div>
        </div>

        {/* Entity totals (two columns) */}
        <div className="cards-grid two grid grid-cols-1 sm:grid-cols-2 gap-3" style={{marginTop:'1rem'}}>
          <StatCard label="Blogs" value={fmtCompact(Number(mergedTotals.blogs||0))} sub={publishedTotals.blogs? `${publishedTotals.blogs} published` : undefined} />
          <StatCard label="Leads" value={fmtCompact(Number(mergedTotals.leads||contactsTotal||0))} />
          <StatCard label="Services" value={fmtCompact(Number(mergedTotals.services||0))} sub={publishedTotals.services? `${publishedTotals.services} live` : undefined} />
          <StatCard label="Pricing Plans" value={fmtCompact(Number(mergedTotals.pricing||0))} />
          <StatCard label="Portfolio Items" value={fmtCompact(Number(mergedTotals.portfolio||0))} sub={publishedTotals.portfolio? `${publishedTotals.portfolio} live` : undefined} />
          <StatCard label="Team Members" value={fmtCompact(Number(mergedTotals.team||0))} />
        </div>
        <div className="cards-grid two grid grid-cols-1 sm:grid-cols-2 gap-3" style={{marginTop:'1rem'}}>
          <StatCard label="Email Sent" value={fmtCompact(Number(totals.emailsSent||0))} />
          <StatCard label="Social Posts" value={fmtCompact(Number(totals.socialPosts||0))} />
        </div>

        {/* Charts with range filter */}
        <div className="card seg-bar sticky top-16 z-10" style={{padding:'.6rem .8rem', marginTop:'1rem'}}>
          <div className="seg flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            {['7','30','90','365'].map(opt => (
              <button key={opt} className={`seg-btn${range===opt?' active':''}`} onClick={()=>setRange(opt)}>{opt}d</button>
            ))}
            <button className={`seg-btn${range==='custom'?' active':''}`} onClick={()=>setRange('custom')}>Custom</button>
            {range==='custom' && (
              <div className="seg-custom w-full sm:w-auto">
                <input type="date" className="ux-input" value={from} onChange={e=>setFrom(e.target.value)} />
                <span className="muted">to</span>
                <input type="date" className="ux-input" value={to} onChange={e=>setTo(e.target.value)} />
                <button className="btn-secondary" onClick={()=>setRange('custom')}>Apply</button>
              </div>
            )}
          </div>
        </div>
        <div className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4" style={{marginTop:'.8rem'}}>
          <div className="card p-3 sm:p-4">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <strong>Visitors (last {range==='custom' && from && to ? 'custom range' : `${range} days`})</strong>
              <span className="muted" style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                {loading ? 'loading...' : displayGran}
                {visitorsPct!=null && (
                  <span className={`chip ${visitorsPct>=0 ? 'chip-success' : 'chip-error'}`}>
                    {visitorsPct>=0 ? '▲' : '▼'} {Math.abs(visitorsPct).toFixed(1)}%
                  </span>
                )}
              </span>
              {/* Legend toggles for Visitors */}
              <div style={{display:'flex', gap:'.4rem', alignItems:'center'}}>
                <button className={`seg-btn${legendVisitors.current? ' active':''}`} onClick={()=>setLegendVisitors(s=>({...s, current:!s.current}))}>Current</button>
                <button className={`seg-btn${legendVisitors.previous? ' active':''}`} onClick={()=>setLegendVisitors(s=>({...s, previous:!s.previous}))}>Previous</button>
              </div>
            </div>
            <div className="chart-body overflow-x-auto" style={{marginTop:'.5rem', overflowX:'auto'}}>
              <AreaChart data={legendVisitors.current? series.visitors : []} labels={labels.visitors} height={180} color="#7aa8ff" showValues />
              {legendVisitors.previous && prevVisitors.values.length === series.visitors.length && (
                <div style={{marginTop:'.35rem'}}>
                  <AreaChart data={prevVisitors.values} labels={prevVisitors.labels} height={120} color="#a3bffa" />
                </div>
              )}
            </div>
          </div>
          <div className="card p-3 sm:p-4">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <strong>Form submissions (last {range==='custom' && from && to ? 'custom range' : `${range} days`})</strong>
              <span className="muted" style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                {loading ? 'loading...' : displayGran}
                {contactsPct!=null && (
                  <span className={`chip ${contactsPct>=0 ? 'chip-success' : 'chip-error'}`}>
                    {contactsPct>=0 ? '▲' : '▼'} {Math.abs(contactsPct).toFixed(1)}%
                  </span>
                )}
              </span>
              {/* Legend toggles for Contacts */}
              <div style={{display:'flex', gap:'.4rem', alignItems:'center'}}>
                <button className={`seg-btn${legendContacts.current? ' active':''}`} onClick={()=>setLegendContacts(s=>({...s, current:!s.current}))}>Current</button>
                <button className={`seg-btn${legendContacts.previous? ' active':''}`} onClick={()=>setLegendContacts(s=>({...s, previous:!s.previous}))}>Previous</button>
              </div>
            </div>
            <div className="chart-body overflow-x-auto" style={{marginTop:'.5rem', overflowX:'auto'}}>
              <AreaChart data={legendContacts.current? series.contacts : []} labels={labels.contacts} height={180} color="#4ade80" showValues />
              {legendContacts.previous && prevContacts.values.length === series.contacts.length && (
                <div style={{marginTop:'.35rem'}}>
                  <AreaChart data={prevContacts.values} labels={prevContacts.labels} height={120} color="#6ee7b7" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blogs & Leads two-column section */}
        <div className="cards-grid two grid grid-cols-1 md:grid-cols-2 gap-4" style={{marginTop:'1rem'}}>
          <div className="card" style={{padding:'1rem'}}>
            <strong>Blogs</strong>
            <div className="divider" style={{margin:'.5rem 0'}}></div>
            <ActivityList items={tabData.blog||[]} type="blog" />
          </div>
          <div className="card" style={{padding:'1rem'}}>
            <strong>Leads</strong>
            <div className="divider" style={{margin:'.5rem 0'}}></div>
            <ActivityList items={tabData.contacts||[]} type="contact" />
          </div>
        </div>

        {/* Modules Activity Tabs */}
        <div className="card" style={{padding:'1rem', marginTop:'1rem'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem',flexWrap:'wrap'}}>
            <strong>Modules Activity</strong>
            <div className="flex flex-wrap gap-2" style={{display:'flex',gap:'.35rem',flexWrap:'wrap'}}>
              {['services','pricing','portfolio','blog','team','contacts'].map(key => (
                <button key={key} className={`btn-secondary${activeTab===key? ' active':''}`} onClick={()=>setActiveTab(key)}>{key[0].toUpperCase()+key.slice(1)}</button>
              ))}
            </div>
          </div>
          <div className="divider" style={{margin:'.5rem 0'}}></div>
          <div>
            {activeTab==='services' && <ActivityList items={tabData.services} type="service" />}
            {activeTab==='pricing' && <ActivityList items={tabData.pricing} type="pricing" />}
            {activeTab==='portfolio' && <ActivityList items={tabData.portfolio} type="portfolio" />}
            {activeTab==='blog' && <ActivityList items={tabData.blog} type="blog" />}
            {activeTab==='team' && <ActivityList items={tabData.team} type="team" />}
            {activeTab==='contacts' && <ActivityList items={tabData.contacts} type="contact" />}
          </div>
        </div>
      </main>
      {/* Toast */}
      {toast && (
        <div style={{position:'fixed', right:'16px', bottom:'16px', zIndex:9999}}>
          <div className="card" style={{background:'rgba(15,23,42,0.92)', color:'#fff', border:'1px solid rgba(255,255,255,0.18)', padding:'.75rem 1rem', borderRadius:'12px', boxShadow:'0 10px 26px rgba(0,0,0,.35)'}}>
            <strong style={{display:'block'}}>{toast.title}</strong>
            <small className="muted" style={{color:'#cbd5e1'}}>{toast.sub}</small>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityList({ items=[], type }){
  if(!items || !items.length) return <div className="muted">No recent items.</div>;
  return (
    <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:'.5rem'}}>
      {items.map((it, idx)=>{
        const title = it.title || it.name || it.subject || it.email || 'Untitled';
        const date = it.updatedAt || it.createdAt || it.publishedAt;
        const right = type==='pricing' ? `$${it.priceMonthly||0}/mo` : (type==='blog' ? (it.published? 'Published':'Draft') : (type==='service'? (it.published? 'Published':'Draft') : undefined));
        return (
          <li key={it._id||idx} style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:'.5rem',borderBottom:'1px solid var(--admin-border)',paddingBottom:'.35rem'}}>
            <div style={{minWidth:0}}>
              <strong style={{display:'block',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</strong>
              {date && <small className="muted">{new Date(date).toLocaleString()}</small>}
            </div>
            {right && <span className="badge">{right}</span>}
          </li>
        );
      })}
    </ul>
  );
}
