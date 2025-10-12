import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ClientFaqAPI } from '../../lib/api';

export default function FAQsList(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchAll(){
    setLoading(true); setError('');
    try{
      const { items } = await ClientFaqAPI.list();
      setItems(items || []);
    }catch(err){ setError(err.message||'Failed to load FAQs'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ fetchAll(); },[]);

  async function removeItem(id){
    if(!window.confirm('Delete this FAQ?')) return;
    try{ await ClientFaqAPI.remove(id); fetchAll(); }
    catch(err){ alert(err.message||'Failed to delete'); }
  }

  const total = useMemo(()=> items.length, [items]);

  function move(id, dir){
    const idx = items.findIndex(x=>x._id===id);
    if(idx<0) return;
    const swapIdx = dir==='up' ? idx-1 : idx+1;
    if(swapIdx<0 || swapIdx>=items.length) return;
    const a = items[idx]; const b = items[swapIdx];
    // swap order values (fallback to index if missing)
    const aOrder = a.order ?? idx; const bOrder = b.order ?? swapIdx;
    Promise.all([
      ClientFaqAPI.update(a._id, { order: bOrder }),
      ClientFaqAPI.update(b._id, { order: aOrder }),
    ]).then(fetchAll).catch(e=>alert(e.message||'Failed to reorder'));
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1>FAQs</h1>
          <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
            <Link to="/admin/faqs/new" className="btn">Add FAQ</Link>
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
              {items.map(f => (
                <div key={f._id} className="card" style={{display:'grid',gap:'.5rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
                    <div>
                      <strong>{f.question}</strong>
                      <div className="muted">{f.category || 'General'} • Order {f.order ?? 0} • {f.published? 'Published':'Draft'}</div>
                    </div>
                    <div style={{display:'flex',gap:'.4rem'}}>
                      <button className="btn-secondary" onClick={()=>move(f._id,'up')}>↑</button>
                      <button className="btn-secondary" onClick={()=>move(f._id,'down')}>↓</button>
                    </div>
                  </div>
                  <div className="muted" style={{whiteSpace:'pre-wrap'}}>{f.answer}</div>
                  <div style={{display:'flex',gap:'.4rem'}}>
                    <Link to={`/admin/faqs/${f._id}`} className="btn-secondary">Edit</Link>
                    <button className="btn-secondary" onClick={()=>removeItem(f._id)} style={{borderColor:'#ef4444', color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem'}}>No FAQs yet.</div>
          )
        )}
      </main>
    </div>
  );
}
