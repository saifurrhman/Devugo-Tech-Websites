import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ClientReviewAPI } from '../../lib/api';

export default function ReviewsList(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchAll(){
    setLoading(true); setError('');
    try{
      const { items } = await ClientReviewAPI.list();
      setItems(items || []);
    }catch(err){ setError(err.message||'Failed to load reviews'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ fetchAll(); },[]);

  async function removeItem(id){
    if(!window.confirm('Delete this review?')) return;
    try{ await ClientReviewAPI.remove(id); fetchAll(); }
    catch(err){ alert(err.message||'Failed to delete'); }
  }

  const total = useMemo(()=> items.length, [items]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1>Client Reviews</h1>
          <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
            <Link to="/admin/reviews/new" className="btn">Add Review</Link>
          </div>
        </div>

        <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem'}}>
          <span className="badge">Total: {total}</span>
        </div>

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}
        {!loading && !error && (
          items.length ? (
            <div className="grid two" style={{marginTop:'1rem'}}>
              {items.map(r => (
                <div key={r._id} className="card" style={{display:'grid',gap:'.5rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                      {r.avatar && <img alt={r.name} src={r.avatar} style={{width:42,height:42,borderRadius:'999px',objectFit:'cover'}}/>}
                      <div>
                        <strong>{r.name}</strong>
                        <div className="muted">{[r.role,r.company].filter(Boolean).join(' • ')}</div>
                      </div>
                    </div>
                    <span className="badge">{r.rating || 5}★</span>
                  </div>
                  {r.summary && <p style={{margin:0}}>{r.summary}</p>}
                  <div style={{display:'flex',gap:'.4rem'}}>
                    <Link to={`/admin/reviews/${r._id}`} className="btn-secondary">Edit</Link>
                    <button className="btn-secondary" onClick={()=>removeItem(r._id)} style={{borderColor:'#ef4444', color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem'}}>No reviews yet.</div>
          )
        )}
      </main>
    </div>
  );
}