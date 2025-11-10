import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { TechStackAPI } from '../../lib/api';

export default function TechStack(){
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
      const { items } = await TechStackAPI.list();
      setItems(items || []);
    }catch(err){ setError(err.message || 'Failed to load tech stack'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ fetchAll(); },[]);

  // Filter items by search
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(it => 
      (it.name || '').toLowerCase().includes(term) || 
      (it.slug || '').toLowerCase().includes(term)
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
      setSelectedIds(filtered.map(it => it._id));
    }
  };

  // Delete selected items
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      alert('Please select technologies to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedIds.length} selected technolog${selectedIds.length === 1 ? 'y' : 'ies'}?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => TechStackAPI.remove(id)));
      setItems(prev => prev.filter(it => !selectedIds.includes(it._id)));
      setSelectedIds([]);
      alert('Selected technologies deleted successfully');
    } catch (err) { 
      alert(err.message || 'Failed to delete selected technologies'); 
    }
  }

  async function addItem(e){
    e?.preventDefault?.();
    if(!name.trim()) return;
    try{
      await TechStackAPI.create({ name: name.trim() });
      setName('');
      fetchAll();
    }catch(err){ alert(err.message || 'Failed to add'); }
  }

  async function removeItem(id){
    if(!window.confirm('Delete this item?')) return;
    try{ 
      await TechStackAPI.remove(id); 
      setItems(prev => prev.filter(it => it._id !== id));
    }
    catch(err){ alert(err.message || 'Failed to delete'); }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        {/* Toolbar */}
        <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
          <h1 className="text-2xl font-bold">Tech Stack</h1>
          <div className="flex gap-3 items-center flex-wrap">
            {/* Search Bar */}
            <div className="admin-search max-w-xs">
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input 
                className="admin-search__input" 
                placeholder="Search technologies..." 
                value={q} 
                onChange={e=>setQ(e.target.value)} 
              />
            </div>
            <Link to="/admin/portfolio" className="btn-secondary">Back to Portfolio</Link>
          </div>
        </div>

        {/* Add Tech Form */}
        <form onSubmit={addItem} className="card p-4 mb-3">
          <label className="form-label block mb-2">Add New Technology</label>
          <div className="flex items-center gap-3 flex-wrap">
            <input 
              className="form-field flex-1 min-w-[200px]" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="e.g. React" 
              required 
            />
            <button type="submit" className="btn">Add Technology</button>
          </div>
        </form>

        {/* Stats Badges */}
        {!loading && !error && (
          <div className="card p-3 mb-3 flex gap-3 items-center flex-wrap">
            <span className="badge">Total: {total}</span>
            <span className="badge">Showing: {filtered.length}</span>
            {selectedIds.length > 0 && (
              <span className="badge bg-blue-500 text-white">Selected: {selectedIds.length}</span>
            )}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {!loading && !error && filtered.length > 0 && (
          <div className="card p-3 mb-3 flex gap-3 items-center justify-between flex-wrap">
            <div className="flex gap-3 items-center">
              <input 
                type="checkbox" 
                checked={selectedIds.length === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                className="cursor-pointer w-5 h-5"
              />
              <span className="text-sm">
                {selectedIds.length === filtered.length && filtered.length > 0 
                  ? 'Deselect All' 
                  : 'Select All'}
              </span>
            </div>
            
            {selectedIds.length > 0 && (
              <button 
                className="btn-secondary border-red-400 text-red-500 font-medium hover:bg-red-50" 
                onClick={handleDeleteSelected}
              >
                Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {/* Loading & Error States */}
        {loading && <div className="card mt-4 p-4">Loading…</div>}
        {error && <div className="card mt-4 p-4 text-red-500">{error}</div>}
        
        {/* Tech Stack List */}
        {!loading && !error && (
          filtered.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {filtered.map(it => (
                <div 
                  key={it._id} 
                  className={`card p-4 space-y-2 transition-all ${
                    selectedIds.includes(it._id) 
                      ? 'border-2 border-blue-500 bg-blue-50' 
                      : ''
                  }`}
                >
                  {/* Checkbox and Header */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(it._id)}
                      onChange={() => toggleSelect(it._id)}
                      className="cursor-pointer w-5 h-5"
                    />
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold m-0">{it.name}</h3>
                      <span className="badge text-xs">{it.slug}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pl-7">
                    <button 
                      className="btn-secondary border-red-400 text-red-500 hover:bg-red-50" 
                      onClick={()=>removeItem(it._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card mt-4 text-center p-8">
              <h3 className="text-xl font-semibold mt-0 mb-2">
                {q.trim() ? 'No Technologies Found' : 'No Tech Stack Items Yet'}
              </h3>
              <p className="opacity-70 text-sm">
                {q.trim() 
                  ? 'Try a different search term or add a new technology above.'
                  : 'Add your first technology using the form above.'
                }
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}