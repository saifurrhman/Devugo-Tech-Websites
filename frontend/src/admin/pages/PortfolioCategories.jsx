import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { PortfolioCategoryAPI } from '../../lib/api';

export default function PortfolioCategories(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  async function fetchAll(){
    setLoading(true); setError('');
    try{
      const { items } = await PortfolioCategoryAPI.list();
      setItems(items || []);
    }catch(err){ setError(err.message || 'Failed to load categories'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ fetchAll(); },[]);

  // Filter items by search
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(cat => 
      (cat.name || '').toLowerCase().includes(term) || 
      (cat.slug || '').toLowerCase().includes(term)
    );
  }, [q, items]);

  const total = useMemo(() => items.length, [items]);

  // Toggle single selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(cat => cat._id));
    }
  };

  // Delete selected categories
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      alert('Please select categories to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedIds.length} selected categor${selectedIds.length === 1 ? 'y' : 'ies'}?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => PortfolioCategoryAPI.remove(id)));
      setItems(prev => prev.filter(cat => !selectedIds.includes(cat._id)));
      setSelectedIds([]);
      alert('Selected categories deleted successfully');
    } catch (err) { 
      alert(err.message || 'Failed to delete selected categories'); 
    }
  }

  async function addCategory(e){
    e?.preventDefault?.();
    if(!name.trim()) return;
    try{
      await PortfolioCategoryAPI.create({ name: name.trim() });
      setName('');
      fetchAll();
    }catch(err){ alert(err.message || 'Failed to add'); }
  }

  async function removeCategory(id){
    if(!window.confirm('Delete this category?')) return;
    try{ 
      await PortfolioCategoryAPI.remove(id); 
      setItems(prev => prev.filter(cat => cat._id !== id));
    }
    catch(err){ alert(err.message || 'Failed to delete'); }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
          <h1>Portfolio Categories</h1>
          <div style={{display:'flex',gap:'.6rem',alignItems:'center',flexWrap:'wrap'}}>
            {/* Search Bar */}
            <div className="admin-search" style={{maxWidth:280}}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input className="admin-search__input" placeholder="Search categories..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            <Link to="/admin/portfolio" className="btn-secondary">Back to Portfolio</Link>
          </div>
        </div>

        {/* Add Category Form */}
        <form onSubmit={addCategory} className="card" style={{marginTop:'.75rem', padding:'1rem'}}>
          <label className="form-label" style={{marginBottom:'.5rem',display:'block'}}>Add New Category</label>
          <div style={{display:'flex',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
            <input 
              className="form-field" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="e.g. Websites" 
              required 
              onKeyPress={e => e.key === 'Enter' && addCategory(e)}
              style={{flex:1,minWidth:'200px'}}
            />
            <button type="submit" className="btn">Add Category</button>
          </div>
        </form>

        {/* Stats Badge */}
        {!loading && !error && (
          <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center', flexWrap:'wrap'}}>
            <span className="badge">Total: {total}</span>
            <span className="badge">Showing: {filtered.length}</span>
            {selectedIds.length > 0 && (
              <span className="badge" style={{background:'#3b82f6'}}>Selected: {selectedIds.length}</span>
            )}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {!loading && !error && filtered.length > 0 && (
          <div className="card" style={{
            marginTop:'.75rem', 
            padding:'.5rem 1rem', 
            display:'flex', 
            gap:'.6rem', 
            alignItems:'center',
            justifyContent:'space-between',
            flexWrap:'wrap'
          }}>
            <div style={{display:'flex',gap:'.6rem',alignItems:'center'}}>
              <input 
                type="checkbox" 
                checked={selectedIds.length === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                style={{cursor:'pointer',width:'18px',height:'18px'}}
              />
              <span style={{fontSize:'.9rem'}}>
                {selectedIds.length === filtered.length && filtered.length > 0 
                  ? 'Deselect All' 
                  : 'Select All'}
              </span>
            </div>
            
            {selectedIds.length > 0 && (
              <button 
                className="btn-secondary" 
                onClick={handleDeleteSelected}
                style={{
                  borderColor:'#ef4444',
                  color:'#ef4444',
                  fontWeight:'500'
                }}
              >
                Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {/* List */}
        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}
        
        {!loading && !error && (
          filtered.length ? (
            <div className="grid two" style={{marginTop:'1rem'}}>
              {filtered.map(cat => (
                <div 
                  key={cat._id} 
                  className="card" 
                  style={{
                    display:'grid',
                    gap:'.5rem',
                    border: selectedIds.includes(cat._id) ? '2px solid #3b82f6' : undefined,
                    background: selectedIds.includes(cat._id) ? 'rgba(59, 130, 246, 0.1)' : undefined
                  }}
                >
                  {/* Checkbox and Header */}
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(cat._id)}
                      onChange={() => toggleSelect(cat._id)}
                      style={{cursor:'pointer',width:'18px',height:'18px'}}
                    />
                    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
                      <h3 style={{margin:0}}>{cat.name}</h3>
                      <span className="badge" style={{fontSize:'.75rem'}}>{cat.slug}</span>
                    </div>
                  </div>
                  
                  <div style={{display:'flex',gap:'.4rem',paddingLeft:'1.75rem'}}>
                    <button className="btn-secondary" onClick={()=>removeCategory(cat._id)} style={{borderColor:'#ef4444', color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>
                {q.trim() ? 'No Categories Found' : 'No Categories Yet'}
              </h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>
                {q.trim() 
                  ? 'Try a different search term or add a new category above.'
                  : 'Add your first portfolio category using the form above.'
                }
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}