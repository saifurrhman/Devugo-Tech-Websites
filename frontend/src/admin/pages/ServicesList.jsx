import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ServiceAPI } from '../../lib/api';
import { API_BASE } from '../../lib/api';

export default function ServicesList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const publishedCount = useMemo(() => items.filter(s => s.published !== false).length, [items]);

  async function fetchServices() {
    setLoading(true);
    setError('');
    try {
      console.log('[ServicesList] 🔵 Fetching services...');
      const res = await ServiceAPI.list();
      
      console.log('[ServicesList] 📦 Response:', res);
      
      let data = [];
      
      // Handle different response formats
      if (Array.isArray(res)) {
        data = res;
      } else if (res && typeof res === 'object') {
        if (res.items && Array.isArray(res.items)) {
          data = res.items;
        } else if (res.data && Array.isArray(res.data)) {
          data = res.data;
        }
      }
      
      console.log('[ServicesList] ✅ Final data:', data.length, 'items');
      setItems(data);
      
    } catch (err) {
      console.error('[ServicesList] ❌ Error:', err);
      setError(err.message || 'Failed to load services');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const didFetchRef = useRef(false);
  useEffect(() => {
    if (!didFetchRef.current) {
      didFetchRef.current = true;
      fetchServices();
    }
    
    const onUpdated = () => fetchServices();
    window.addEventListener('services:updated', onUpdated);
    return () => window.removeEventListener('services:updated', onUpdated);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(s => 
      (s.title || '').toLowerCase().includes(term) || 
      (s.description || '').toLowerCase().includes(term)
    );
  }, [q, items]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this service?')) return;
    try {
      await ServiceAPI.remove(id);
      setItems(prev => prev.filter(s => s._id !== id));
    } catch (err) { 
      alert(err.message || 'Failed to delete'); 
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1>Services</h1>
          <Link to="/admin/services/new" className="btn">Add Service</Link>
        </div>

        {/* Totals strip */}
        {!loading && !error && (
          <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center'}}>
            <span className="badge">Total: {items.length}</span>
            <span className="badge">Published: {publishedCount}</span>
          </div>
        )}

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}

        {!loading && !error && (
          filtered.length ? (
            <div className="grid three" style={{marginTop:'1rem'}}>
              {filtered.map(s => (
                <div className="card" key={s._id} style={{display:'grid',gap:'.5rem'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
                    <h3 style={{margin:0}}>{s.title || 'Untitled Service'}</h3>
                    <span className="badge">{s.published === true ? 'Published' : 'Draft'}</span>
                  </div>
                  {s.description && <p style={{margin:0}}>{s.description}</p>}
                  <div style={{display:'flex',gap:'.4rem',marginTop:'.25rem'}}>
                    <button className="btn-secondary" onClick={()=>navigate(`/admin/services/${s._id}`)}>Edit</button>
                    <button className="btn-secondary" onClick={()=>handleDelete(s._id)} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>No Services Yet</h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>Add your first service to display on the public site.</p>
              <Link to="/admin/services/new" className="btn" style={{marginTop:'.5rem'}}>Add Service</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}