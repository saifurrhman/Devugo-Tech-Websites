import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { Link } from 'react-router-dom';
import { BlogAPI } from '../../lib/api';

export default function BlogList(){
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{
        // Using public list for now (published posts). We can switch to an admin endpoint later.
        const { posts } = await BlogAPI.list();
        if(mounted) setPosts(posts||[]);
      }catch(err){
        if(mounted) setError(err.message||'Failed to load posts');
      }finally{
        if(mounted) setLoading(false);
      }
    })();
    return ()=>{ mounted = false };
  },[]);

  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    if(!term) return posts;
    return posts.filter(p =>
      (p.title||'').toLowerCase().includes(term) ||
      (p.excerpt||'').toLowerCase().includes(term)
    );
  },[q, posts]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',gap:'.6rem',alignItems:'center',justifyContent:'space-between'}}>
          <h1 style={{margin:0}}>Blog</h1>
          <div style={{display:'flex',gap:'.5rem',alignItems:'center'}}>
            <div className="admin-search" style={{maxWidth:280}}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input className="admin-search__input" placeholder="Search posts..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            <Link to="/admin/blog/create" className="btn">New Post</Link>
          </div>
        </div>

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading posts…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}

        {!loading && !error && (
          filtered.length ? (
            <div className="grid three" style={{marginTop:'1rem'}}>
              {filtered.map(p => (
                <div className="card" key={p._id} style={{display:'grid',gap:'.5rem'}}>
                  {p.coverImage && <img src={p.coverImage} alt={p.title} style={{width:'100%',borderRadius:'12px'}} />}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
                    <h3 style={{margin:0}}>{p.title}</h3>
                    <span className="badge">{p.published? 'Published' : 'Draft'}</span>
                  </div>
                  {p.excerpt && <p style={{margin:0}}>{p.excerpt}</p>}
                  {p.publishedAt && <small style={{opacity:.8}}>Published {new Date(p.publishedAt).toLocaleDateString()}</small>}
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>No posts yet</h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>Create your first blog post to show on the public blog page.</p>
              <Link to="/admin/blog/create" className="btn" style={{marginTop:'.5rem'}}>Create a Post</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}
