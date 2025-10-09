
import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AnalyticsAPI, ContactAPI, ServiceAPI, PricingAPI, PortfolioAPI, TeamAPI, BlogAPI } from '../../lib/api';

function StatCard({ label, value, sub }){
  return (
    <div className="card" style={{padding:'1rem'}}>
      <div className="muted" style={{fontSize:'.9rem'}}>{label}</div>
      <div style={{fontSize:'1.8rem', fontWeight:800}}>{value}</div>
      {sub && <div className="muted" style={{marginTop:'.25rem'}}>{sub}</div>}
    </div>
  );
}

function MiniBars({ data=[], height=120, color='#8ab8ff' }){
  const max = Math.max(1, ...data);
  const w = 12, gap = 6;
  const svgWidth = data.length * (w + gap) + gap;
  return (
    <svg width={svgWidth} height={height} viewBox={`0 0 ${svgWidth} ${height}`}>
      {data.map((v, i)=>{
        const h = Math.round((v/max) * (height-16));
        const x = gap + i*(w+gap);
        const y = height - h;
        return <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill={color} opacity={0.9}/>;
      })}
    </svg>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [contactsCount, setContactsCount] = useState(null);
  const [activeTab, setActiveTab] = useState('services');
  const [tabData, setTabData] = useState({}); // { services: [], pricing: [], portfolio: [], blog: [], team: [], contacts: [] }

  useEffect(()=>{
    let mounted = true;
    async function load(){
      setLoading(true); setError('');
      try{
        const s = await AnalyticsAPI.summary();
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
    return ()=>{ mounted=false };
  },[]);

  const totals = summary?.totals || { visitors: 0, pageviews: 0, contacts: 0, conversions: 0, blogs: 0, leads: 0, services: 0, pricing: 0, portfolio: 0, team: 0, emailsSent: 0, socialPosts: 0 };
  const contactsTotal = contactsCount != null ? contactsCount : totals.contacts;
  const last7 = summary?.last7 || { visitors: [], contacts: [] };
  const recent = summary?.recent || {};

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
    return ()=>{ mounted=false };
  }, [activeTab, tabData]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Admin Dashboard</h1>

        {error && <div className="card danger" style={{marginTop:'1rem'}}>{error}</div>}

        <div className="grid" style={{display:'grid',gridTemplateColumns:'repeat(4, minmax(0,1fr))',gap:'1rem',marginTop:'1rem'}}>
          <StatCard label="Visitors" value={totals.visitors.toLocaleString()} sub="All time" />
          <StatCard label="Pageviews" value={totals.pageviews.toLocaleString()} sub="All time" />
          <StatCard label="Form Submissions" value={Number(contactsTotal||0).toLocaleString()} sub={contactsCount!=null? 'Live (from ContactAPI)':'From analytics'} />
          <StatCard label="Conversions" value={totals.conversions.toLocaleString()} sub="Leads / Goals" />
        </div>

        <div className="grid" style={{display:'grid',gridTemplateColumns:'repeat(6, minmax(0,1fr))',gap:'1rem',marginTop:'1rem'}}>
          <StatCard label="Blogs" value={Number(totals.blogs||0).toLocaleString()} />
          <StatCard label="Leads" value={Number(totals.leads||contactsTotal||0).toLocaleString()} />
          <StatCard label="Services" value={Number(totals.services||0).toLocaleString()} />
          <StatCard label="Pricing Plans" value={Number(totals.pricing||0).toLocaleString()} />
          <StatCard label="Portfolio Items" value={Number(totals.portfolio||0).toLocaleString()} />
          <StatCard label="Team Members" value={Number(totals.team||0).toLocaleString()} />
        </div>
        <div className="grid" style={{display:'grid',gridTemplateColumns:'repeat(4, minmax(0,1fr))',gap:'1rem',marginTop:'1rem'}}>
          <StatCard label="Email Sent" value={Number(totals.emailsSent||0).toLocaleString()} />
          <StatCard label="Social Posts" value={Number(totals.socialPosts||0).toLocaleString()} />
        </div>

        <div className="grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginTop:'1rem', alignItems:'end'}}>
          <div className="card" style={{padding:'1rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <strong>Visitors (last 7 days)</strong>
              <span className="muted">{loading ? 'loading...' : 'daily'}</span>
            </div>
            <div style={{marginTop:'.5rem', overflowX:'auto'}}>
              <MiniBars data={last7.visitors} height={120} color="#8ab8ff" />
            </div>
          </div>
          <div className="card" style={{padding:'1rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <strong>Form submissions (last 7 days)</strong>
              <span className="muted">{loading ? 'loading...' : 'daily'}</span>
            </div>
            <div style={{marginTop:'.5rem', overflowX:'auto'}}>
              <MiniBars data={last7.contacts} height={120} color="#7ee787" />
            </div>
          </div>
        </div>

        <div className="grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginTop:'1rem'}}>
          <div className="card" style={{padding:'1rem'}}>
            <strong>Recent activity</strong>
            <div className="divider" style={{margin:'.5rem 0'}}></div>
            <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:'.5rem'}}>
              <li>
                <div className="muted" style={{fontSize:'.85rem'}}>Last blog post</div>
                {recent.blog ? (
                  <div><strong>{recent.blog.title}</strong> <span className="badge" style={{marginLeft:'.5rem'}}>{recent.blog.published? 'Published':'Draft'}</span><br/>
                  <small className="muted">{new Date(recent.blog.publishedAt).toLocaleString()}</small></div>
                ) : (
                  <div className="muted">No blog posts yet</div>
                )}
              </li>
              <li>
                <div className="muted" style={{fontSize:'.85rem'}}>Last portfolio update</div>
                {recent.portfolio ? (
                  <div><strong>{recent.portfolio.title}</strong><br/>
                  <small className="muted">{new Date(recent.portfolio.updatedAt).toLocaleString()}</small></div>
                ) : (
                  <div className="muted">No portfolio items yet</div>
                )}
              </li>
              <li>
                <div className="muted" style={{fontSize:'.85rem'}}>Last lead</div>
                {recent.lead ? (
                  <div><strong>{recent.lead.name}</strong> <span className="muted">{recent.lead.email}</span><br/>
                  <small className="muted">{new Date(recent.lead.createdAt).toLocaleString()}</small></div>
                ) : (
                  <div className="muted">No leads yet</div>
                )}
              </li>
            </ul>
          </div>
          <div className="card" style={{padding:'1rem'}}>
            <strong>Campaigns</strong>
            <div className="divider" style={{margin:'.5rem 0'}}></div>
            <div className="muted">Last email campaign and social post</div>
            <div style={{marginTop:'.5rem'}}>
              <div style={{marginBottom:'.5rem'}}>
                <div className="muted" style={{fontSize:'.85rem'}}>Last email</div>
                {recent.email ? (
                  <div><strong>{recent.email.subject}</strong><br/>
                  <small className="muted">{new Date(recent.email.sentAt).toLocaleString()}</small></div>
                ) : (
                  <div className="muted">No email campaigns yet</div>
                )}
              </div>
              <div>
                <div className="muted" style={{fontSize:'.85rem'}}>Last social post</div>
                {recent.social ? (
                  <div><strong>{recent.social.platform}</strong> — {recent.social.message}<br/>
                  <small className="muted">{new Date(recent.social.publishedAt).toLocaleString()}</small></div>
                ) : (
                  <div className="muted">No social posts yet</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modules Activity Tabs */}
        <div className="card" style={{padding:'1rem', marginTop:'1rem'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem',flexWrap:'wrap'}}>
            <strong>Modules Activity</strong>
            <div style={{display:'flex',gap:'.35rem',flexWrap:'wrap'}}>
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
