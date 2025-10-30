import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { TeamAPI } from '../../lib/api';

export default function TeamList(){
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const total = items.length;

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { members } = await TeamAPI.list();
        if(mounted) setItems(members||[]);
      }catch(err){ if(mounted) setError(err.message||'Failed to load team'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  async function handleDelete(id){
    if(!window.confirm('Remove this member?')) return;
    try{ await TeamAPI.remove(id); setItems(prev=>prev.filter(m=>m._id!==id)); }
    catch(err){ alert(err.message||'Failed to delete'); }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1>Team</h1>
          <Link to="/admin/team/new" className="btn">Add Member</Link>
        </div>

        {/* Totals strip */}
        {!loading && !error && (
          <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center'}}>
            <span className="badge">Total: {total}</span>
          </div>
        )}

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}

        {!loading && !error && (
          items.length ? (
            <div className="grid three" style={{marginTop:'1rem'}}>
              {items.map(m => (
                <div className="card" key={m._id} style={{display:'grid',gap:'.5rem'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
                    <h3 style={{margin:0}}>{m.name || 'Untitled Member'}</h3>
                    <span className="badge">{m.role || 'Member'}</span>
                  </div>
                  {m.bio && <p style={{margin:0}}>{m.bio}</p>}
                  <div style={{display:'flex',gap:'.4rem',marginTop:'.25rem'}}>
                    <button className="btn-secondary" onClick={()=>navigate(`/admin/team/${m._id}`)}>Edit</button>
                    <button className="btn-secondary" onClick={()=>handleDelete(m._id)} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>No Team Members</h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>Add your first team member.</p>
              <Link to="/admin/team/new" className="btn" style={{marginTop:'.5rem'}}>Add Member</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}