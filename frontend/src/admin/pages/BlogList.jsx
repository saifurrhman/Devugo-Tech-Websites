import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { Link, useNavigate } from 'react-router-dom';
import { BlogAPI } from '../../lib/api';

export default function BlogList(){
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all'); // all | published | drafts

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{
        // Admin view: load all (published + drafts)
        const { posts } = await BlogAPI.listAll();
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
    let list = posts;
    if (status === 'published') list = posts.filter(p=>!!p.published);
    if (status === 'drafts') list = posts.filter(p=>!p.published);
    if(!term) return list;
    return list.filter(p =>
      (p.title||'').toLowerCase().includes(term) ||
      (p.excerpt||'').toLowerCase().includes(term)
    );
  },[q, posts]);

  async function handleDelete(id){
    if(!window.confirm('Delete this post?')) return;
    try{
      await BlogAPI.remove(id);
      setPosts(prev=>prev.filter(p=>p._id!==id));
    }catch(err){
      alert(err.message||'Failed to delete');
    }
  }

  async function togglePublish(p){
    try{
      const { post } = await BlogAPI.update(p._id, { published: !p.published });
      setPosts(prev=>prev.map(x=>x._id===p._id? post : x));
    }catch(err){
      alert(err.message||'Failed to update');
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',gap:'.6rem',alignItems:'center',justifyContent:'space-between'}}>
          <h1>Blog</h1>
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
            <select
              className={`form-field filter-select status-${status}`}
              value={status}
              onChange={e=>setStatus(e.target.value)}
              style={{padding:'.5rem .9rem', borderRadius:9999, fontWeight:700}}
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="drafts">Drafts</option>
            </select>
            <Link to="/admin/blog/categories" className="btn-secondary" style={{ color: 'white', textDecoration: 'none' }}>Blog Categories</Link>
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
                  <div style={{display:'flex',gap:'.4rem',marginTop:'.25rem'}}>
                    <button className="btn-secondary" onClick={()=>navigate(`/admin/blog/${p._id}`)}>Edit</button>
                    <button className="btn-secondary" onClick={()=>togglePublish(p)}>{p.published? 'Unpublish' : 'Publish'}</button>
                    <button className="btn-secondary" onClick={()=>handleDelete(p._id)} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>No Posts Yet</h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>Create Your First Blog Post To Show On The Public Blog Page.</p>
              <Link to="/admin/blog/create" className="btn" style={{marginTop:'.5rem'}}>Create a Post</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}