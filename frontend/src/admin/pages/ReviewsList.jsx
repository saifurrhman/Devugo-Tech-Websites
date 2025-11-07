import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ClientReviewAPI } from '../../lib/api';

export default function ReviewsList(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filter state
  const [ratingFilter, setRatingFilter] = useState('all'); // 'all', '5', '4', '3', '2', '1'
  
  // Dropdown state
  const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false);
  const ratingDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target)) {
        setRatingDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchAll(){
    setLoading(true); setError('');
    try{
      const { items } = await ClientReviewAPI.list();
      setItems(items || []);
    }catch(err){ setError(err.message||'Failed to load reviews'); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ fetchAll(); },[]);

  // Filter items
  const filtered = useMemo(() => {
    let result = items;
    
    // Filter by rating
    if (ratingFilter !== 'all') {
      const targetRating = parseInt(ratingFilter);
      result = result.filter(r => (r.rating || 5) === targetRating);
    }
    
    // Filter by search term
    const term = q.trim().toLowerCase();
    if (term) {
      result = result.filter(r => 
        (r.name || '').toLowerCase().includes(term) || 
        (r.company || '').toLowerCase().includes(term) ||
        (r.role || '').toLowerCase().includes(term) ||
        (r.summary || '').toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [q, items, ratingFilter]);

  const total = useMemo(() => items.length, [items]);
  const avgRating = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, r) => acc + (r.rating || 5), 0);
    return (sum / items.length).toFixed(1);
  }, [items]);

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
      setSelectedIds(filtered.map(r => r._id));
    }
  };

  // Delete selected reviews
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      alert('Please select reviews to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedIds.length} selected review(s)?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => ClientReviewAPI.remove(id)));
      setItems(prev => prev.filter(r => !selectedIds.includes(r._id)));
      setSelectedIds([]);
      alert('Selected reviews deleted successfully');
    } catch (err) { 
      alert(err.message || 'Failed to delete selected reviews'); 
    }
  }

  async function removeItem(id){
    if(!window.confirm('Delete this review?')) return;
    try{ 
      await ClientReviewAPI.remove(id); 
      setItems(prev => prev.filter(r => r._id !== id));
    }
    catch(err){ alert(err.message||'Failed to delete'); }
  }

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  const selectedRatingOption = ratingOptions.find(opt => opt.value === ratingFilter);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
          <h1>Client Reviews</h1>
          <div style={{display:'flex',gap:'.6rem',alignItems:'center',flexWrap:'wrap'}}>
            {/* Search Bar */}
            <div className="admin-search" style={{maxWidth:280}}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input className="admin-search__input" placeholder="Search reviews..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>

            {/* Rating Filter Dropdown */}
            <div ref={ratingDropdownRef} style={{position:'relative'}}>
              <button
                onClick={() => setRatingDropdownOpen(!ratingDropdownOpen)}
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
                <span>{selectedRatingOption.label}</span>
                <span style={{fontSize:'.75rem'}}>▼</span>
              </button>
              
              {ratingDropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + .5rem)',
                    right: 0,
                    minWidth: '160px',
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
                  {ratingOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setRatingFilter(option.value);
                        setRatingDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '.6rem .85rem',
                        background: ratingFilter === option.value 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : 'transparent',
                        border: ratingFilter === option.value 
                          ? '1px solid rgba(59, 130, 246, 0.5)' 
                          : '1px solid transparent',
                        borderRadius: '.375rem',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all .2s',
                        fontSize: '.9rem',
                        fontWeight: ratingFilter === option.value ? '500' : '400',
                        marginBottom: '.25rem'
                      }}
                      onMouseEnter={(e) => {
                        if (ratingFilter !== option.value) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (ratingFilter !== option.value) {
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

            <Link to="/admin/reviews/new" className="btn">Add Review</Link>
          </div>
        </div>

        {/* Stats Badge */}
        {!loading && !error && (
          <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center', flexWrap:'wrap'}}>
            <span className="badge">Total: {total}</span>
            <span className="badge">Average: {avgRating}★</span>
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
              {filtered.map(r => (
                <div 
                  key={r._id} 
                  className="card" 
                  style={{
                    display:'grid',
                    gap:'.5rem',
                    border: selectedIds.includes(r._id) ? '2px solid #3b82f6' : undefined,
                    background: selectedIds.includes(r._id) ? 'rgba(59, 130, 246, 0.1)' : undefined
                  }}
                >
                  {/* Checkbox and Header */}
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(r._id)}
                      onChange={() => toggleSelect(r._id)}
                      style={{cursor:'pointer',width:'18px',height:'18px'}}
                    />
                    <div style={{flex:1,display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                        {r.avatar && <img alt={r.name} src={r.avatar} style={{width:42,height:42,borderRadius:'999px',objectFit:'cover'}}/>}
                        <div>
                          <strong>{r.name}</strong>
                          <div className="muted" style={{fontSize:'.85rem'}}>{[r.role,r.company].filter(Boolean).join(' • ')}</div>
                        </div>
                      </div>
                      <span className="badge" style={{background:'#f59e0b'}}>{r.rating || 5}★</span>
                    </div>
                  </div>
                  
                  {r.summary && <p style={{margin:0,paddingLeft:'1.75rem'}}>{r.summary}</p>}
                  
                  <div style={{display:'flex',gap:'.4rem',paddingLeft:'1.75rem'}}>
                    <Link to={`/admin/reviews/${r._id}`} className="btn-secondary">Edit</Link>
                    <button className="btn-secondary" onClick={()=>removeItem(r._id)} style={{borderColor:'#ef4444', color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>
                {ratingFilter !== 'all' || q.trim()
                  ? 'No Reviews Found'
                  : 'No Reviews Yet'
                }
              </h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>
                {ratingFilter !== 'all' || q.trim()
                  ? 'Try changing the filter or search term.'
                  : 'Add your first client review.'
                }
              </p>
              <Link to="/admin/reviews/new" className="btn" style={{marginTop:'.5rem'}}>Add Review</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}