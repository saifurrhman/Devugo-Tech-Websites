import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { PortfolioAPI } from '../../lib/api';

export default function PortfolioList(){
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { items } = await PortfolioAPI.list();
        if(mounted) setItems(items||[]);
      }catch(err){ if(mounted) setError(err.message||'Failed to load portfolio'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  async function handleDelete(id){
    if(!window.confirm('Delete this item?')) return;
    try{ await PortfolioAPI.remove(id); setItems(prev=>prev.filter(i=>i._id!==id)); }
    catch(err){ alert(err.message||'Failed to delete'); }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1 style={{margin:0}}>Portfolio</h1>
          <Link to="/admin/portfolio/new" className="btn">Add Project</Link>
        </div>
        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}
        {!loading && !error && (
          items.length ? (
            <div className="grid three" style={{marginTop:'1rem'}}>
              {items.map(p => (
                <div className="card" key={p._id} style={{display:'grid',gap:'.5rem'}}>
                  {p.thumbnails?.[0] && <img src={p.thumbnails[0]} alt={p.title} style={{width:'100%',borderRadius:'12px'}} />}
                  <h3 style={{margin:0}}>{p.title}</h3>
                  {p.client && <small className="muted">Client: {p.client}</small>}
                  <div style={{display:'flex',gap:'.4rem',marginTop:'.25rem'}}>
                    <button className="btn-secondary" onClick={()=>navigate(`/admin/portfolio/${p._id}`)}>Edit</button>
                    <button className="btn-secondary" onClick={()=>handleDelete(p._id)} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>No Projects Yet</h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>Add your first portfolio item.</p>
              <Link to="/admin/portfolio/new" className="btn" style={{marginTop:'.5rem'}}>Add a Project</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}
