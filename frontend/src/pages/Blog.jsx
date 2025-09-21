import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BlogAPI } from '../lib/api';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{
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

  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Blog</h1>
        {loading && <p>Loading posts…</p>}
        {error && <p style={{color:'#ef4444'}}>{error}</p>}
        {!loading && !error && (
          <div className="grid three" style={{marginTop:'1rem'}}>
            {posts.length === 0 && (
              <div className="card">No posts yet.</div>
            )}
            {posts.map(p => (
              <article key={p._id} className="card" style={{display:'grid', gap:'.5rem'}}>
                {p.coverImage && (
                  <img src={p.coverImage} alt={p.title} style={{width:'100%',borderRadius:'12px'}} />
                )}
                <h3 style={{marginTop:'.25rem'}}>{p.title}</h3>
                {p.excerpt && <p style={{margin:0}}>{p.excerpt}</p>}
                {p.publishedAt && <small style={{opacity:.8}}>Published {new Date(p.publishedAt).toLocaleDateString()}</small>}
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
