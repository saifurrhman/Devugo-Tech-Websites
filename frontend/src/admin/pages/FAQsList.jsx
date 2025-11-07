import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ClientFaqAPI } from '../../lib/api';

export default function FAQsList(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  const statusDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchAll(){
    setLoading(true); setError('');
    try{
      const { items } = await ClientFaqAPI.list();
      setItems(items || []);
    }catch(err){ setError(err.message||'Failed to load FAQs'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ fetchAll(); },[]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(items.map(f => f.category || 'General'));
    return ['all', ...Array.from(cats)];
  }, [items]);

  // Filter items
  const filtered = useMemo(() => {
    let result = items;
    
    // Filter by status
    if (statusFilter === 'published') {
      result = result.filter(f => f.published === true);
    } else if (statusFilter === 'draft') {
      result = result.filter(f => f.published !== true);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      result = result.filter(f => (f.category || 'General') === categoryFilter);
    }
    
    return result;
  }, [items, statusFilter, categoryFilter]);

  const publishedCount = useMemo(() => items.filter(f => f.published === true).length, [items]);
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
      setSelectedIds(filtered.map(f => f._id));
    }
  };

  // Delete selected FAQs
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      alert('Please select FAQs to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedIds.length} selected FAQ(s)?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => ClientFaqAPI.remove(id)));
      setItems(prev => prev.filter(f => !selectedIds.includes(f._id)));
      setSelectedIds([]);
      alert('Selected FAQs deleted successfully');
    } catch (err) { 
      alert(err.message || 'Failed to delete selected FAQs'); 
    }
  }

  async function removeItem(id){
    if(!window.confirm('Delete this FAQ?')) return;
    try{ 
      await ClientFaqAPI.remove(id); 
      setItems(prev => prev.filter(f => f._id !== id));
    }
    catch(err){ alert(err.message||'Failed to delete'); }
  }

  function move(id, dir){
    const idx = items.findIndex(x=>x._id===id);
    if(idx<0) return;
    const swapIdx = dir==='up' ? idx-1 : idx+1;
    if(swapIdx<0 || swapIdx>=items.length) return;
    const a = items[idx]; const b = items[swapIdx];
    const aOrder = a.order ?? idx; const bOrder = b.order ?? swapIdx;
    Promise.all([
      ClientFaqAPI.update(a._id, { order: bOrder }),
      ClientFaqAPI.update(b._id, { order: aOrder }),
    ]).then(fetchAll).catch(e=>alert(e.message||'Failed to reorder'));
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published Only' },
    { value: 'draft', label: 'Draft Only' }
  ];

  const selectedStatusOption = statusOptions.find(opt => opt.value === statusFilter);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
          <h1>FAQs</h1>
          <div style={{display:'flex',gap:'.6rem',alignItems:'center',flexWrap:'wrap'}}>
            {/* Status Filter Dropdown */}
            <div ref={statusDropdownRef} style={{position:'relative'}}>
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                style={{
                  padding: '.5rem .75rem',
                  borderRadius: '.375rem',
                  border: '1px solid rgba(55, 65, 81, 0.5)',
                  background: 'rgba(31, 41, 55, 0.4)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.5rem',
                  minWidth: '160px',
                  justifyContent: 'space-between'
                }}
              >
                <span>{selectedStatusOption.label}</span>
                <span style={{fontSize:'.75rem'}}>▼</span>
              </button>
              
              {statusDropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + .5rem)',
                    right: 0,
                    minWidth: '180px',
                    padding: '.4rem',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '.5rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                  }}
                >
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setStatusDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '.6rem .85rem',
                        background: statusFilter === option.value 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : 'transparent',
                        border: statusFilter === option.value 
                          ? '1px solid rgba(59, 130, 246, 0.5)' 
                          : '1px solid transparent',
                        borderRadius: '.375rem',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all .2s',
                        fontSize: '.9rem',
                        fontWeight: statusFilter === option.value ? '500' : '400',
                        marginBottom: '.25rem'
                      }}
                      onMouseEnter={(e) => {
                        if (statusFilter !== option.value) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (statusFilter !== option.value) {
                          e.target.style.background = 'transparent';
                          e.target.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter Dropdown */}
            <div ref={categoryDropdownRef} style={{position:'relative'}}>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                style={{
                  padding: '.5rem .75rem',
                  borderRadius: '.375rem',
                  border: '1px solid rgba(55, 65, 81, 0.5)',
                  background: 'rgba(31, 41, 55, 0.4)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.5rem',
                  minWidth: '140px',
                  justifyContent: 'space-between'
                }}
              >
                <span>{categoryFilter === 'all' ? 'All Categories' : categoryFilter}</span>
                <span style={{fontSize:'.75rem'}}>▼</span>
              </button>
              
              {categoryDropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + .5rem)',
                    right: 0,
                    minWidth: '180px',
                    padding: '.4rem',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '.5rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                >
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategoryFilter(cat);
                        setCategoryDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '.6rem .85rem',
                        background: categoryFilter === cat 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : 'transparent',
                        border: categoryFilter === cat 
                          ? '1px solid rgba(59, 130, 246, 0.5)' 
                          : '1px solid transparent',
                        borderRadius: '.375rem',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all .2s',
                        fontSize: '.9rem',
                        fontWeight: categoryFilter === cat ? '500' : '400',
                        marginBottom: '.25rem'
                      }}
                      onMouseEnter={(e) => {
                        if (categoryFilter !== cat) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (categoryFilter !== cat) {
                          e.target.style.background = 'transparent';
                          e.target.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/admin/faqs/new" className="btn">Add FAQ</Link>
          </div>
        </div>

        {/* Totals strip */}
        {!loading && !error && (
          <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center', flexWrap:'wrap'}}>
            <span className="badge">Total: {total}</span>
            <span className="badge">Published: {publishedCount}</span>
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

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}
        
        {!loading && !error && (
          filtered.length ? (
            <div className="grid two" style={{marginTop:'1rem'}}>
              {filtered.map(f => (
                <div 
                  key={f._id} 
                  className="card" 
                  style={{
                    display:'grid',
                    gap:'.5rem',
                    border: selectedIds.includes(f._id) ? '2px solid #3b82f6' : undefined,
                    background: selectedIds.includes(f._id) ? 'rgba(59, 130, 246, 0.1)' : undefined
                  }}
                >
                  {/* Checkbox and Header */}
                  <div style={{display:'flex',alignItems:'flex-start',gap:'.5rem'}}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(f._id)}
                      onChange={() => toggleSelect(f._id)}
                      style={{cursor:'pointer',width:'18px',height:'18px',marginTop:'.2rem'}}
                    />
                    <div style={{flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'.6rem',flexWrap:'wrap'}}>
                        <div style={{flex:1}}>
                          <strong>{f.question}</strong>
                          <div className="muted" style={{fontSize:'.85rem',marginTop:'.25rem'}}>
                            {f.category || 'General'} • Order {f.order ?? 0} • {f.published? 'Published':'Draft'}
                          </div>
                        </div>
                        <div style={{display:'flex',gap:'.4rem'}}>
                          <button className="btn-secondary" onClick={()=>move(f._id,'up')}>↑</button>
                          <button className="btn-secondary" onClick={()=>move(f._id,'down')}>↓</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="muted" style={{whiteSpace:'pre-wrap',paddingLeft:'1.75rem'}}>{f.answer}</div>
                  
                  <div style={{display:'flex',gap:'.4rem',paddingLeft:'1.75rem'}}>
                    <Link to={`/admin/faqs/${f._id}`} className="btn-secondary">Edit</Link>
                    <button className="btn-secondary" onClick={()=>removeItem(f._id)} style={{borderColor:'#ef4444', color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>
                {statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No FAQs Found'
                  : 'No FAQs Yet'
                }
              </h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>
                {statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try changing the filters or add a new FAQ.'
                  : 'Add your first FAQ to display on the public site.'
                }
              </p>
              <Link to="/admin/faqs/new" className="btn" style={{marginTop:'.5rem'}}>Add FAQ</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}