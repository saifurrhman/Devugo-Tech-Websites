import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AnalyticsAPI, ContactAPI } from '../../lib/api';

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

  const totals = summary?.totals || { visitors: 0, pageviews: 0, contacts: 0, conversions: 0, blogs: 0, leads: 0, emailsSent: 0, socialPosts: 0 };
  const contactsTotal = contactsCount != null ? contactsCount : totals.contacts;
  const last7 = summary?.last7 || { visitors: [], contacts: [] };
  const recent = summary?.recent || {};

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

        <div className="grid" style={{display:'grid',gridTemplateColumns:'repeat(4, minmax(0,1fr))',gap:'1rem',marginTop:'1rem'}}>
          <StatCard label="Total Blogs" value={Number(totals.blogs||0).toLocaleString()} />
          <StatCard label="Total Leads" value={Number(totals.leads||contactsTotal||0).toLocaleString()} />
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
      </main>
    </div>
  );
}
