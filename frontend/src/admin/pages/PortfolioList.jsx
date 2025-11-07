import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { PortfolioAPI } from '../../lib/api';

export default function PortfolioList(){
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filter states
  const [featuredFilter, setFeaturedFilter] = useState('all'); // 'all', 'featured', 'not-featured'
  
  // Dropdown state
  const [featuredDropdownOpen, setFeaturedDropdownOpen] = useState(false);
  const featuredDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (featuredDropdownRef.current && !featuredDropdownRef.current.contains(event.target)) {
        setFeaturedDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Filter items
  const filtered = useMemo(() => {
    let result = items;
    
    // Filter by featured status
    if (featuredFilter === 'featured') {
      result = result.filter(i => i.featured === true);
    } else if (featuredFilter === 'not-featured') {
      result = result.filter(i => !i.featured);
    }
    
    // Filter by search term
    const term = q.trim().toLowerCase();
    if (term) {
      result = result.filter(i => 
        (i.title || '').toLowerCase().includes(term) || 
        (i.client || '').toLowerCase().includes(term) ||
        (i.description || '').toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [q, items, featuredFilter]);

  const total = items.length;
  const featured = items.filter(i=>!!i.featured).length;

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
      setSelectedIds(filtered.map(i => i._id));
    }
  };

  // Delete selected items
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      alert('Please select projects to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedIds.length} selected project(s)?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => PortfolioAPI.remove(id)));
      setItems(prev => prev.filter(i => !selectedIds.includes(i._id)));
      setSelectedIds([]);
      alert('Selected projects deleted successfully');
    } catch (err) { 
      alert(err.message || 'Failed to delete selected projects'); 
    }
  }

  async function handleDelete(id){
    if(!window.confirm('Delete this item?')) return;
    try{ 
      await PortfolioAPI.remove(id); 
      setItems(prev=>prev.filter(i=>i._id!==id)); 
    }
    catch(err){ alert(err.message||'Failed to delete'); }
  }

  const featuredOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'featured', label: 'Featured Only' },
    { value: 'not-featured', label: 'Not Featured' }
  ];

  const selectedFeaturedOption = featuredOptions.find(opt => opt.value === featuredFilter);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
          <h1>Portfolio</h1>
          <div style={{display:'flex',gap:'.6rem',alignItems:'center',flexWrap:'wrap'}}>
            {/* Search Bar */}
            <div className="admin-search" style={{maxWidth:280}}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input className="admin-search__input" placeholder="Search projects..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>

            {/* Featured Filter Dropdown */}
            <div ref={featuredDropdownRef} style={{position:'relative'}}>
              <button
                onClick={() => setFeaturedDropdownOpen(!featuredDropdownOpen)}
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
                <span>{selectedFeaturedOption.label}</span>
                <span style={{fontSize:'.75rem'}}>▼</span>
              </button>
              
              {featuredDropdownOpen && (
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
                  {featuredOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFeaturedFilter(option.value);
                        setFeaturedDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '.6rem .85rem',
                        background: featuredFilter === option.value 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : 'transparent',
                        border: featuredFilter === option.value 
                          ? '1px solid rgba(59, 130, 246, 0.5)' 
                          : '1px solid transparent',
                        borderRadius: '.375rem',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all .2s',
                        fontSize: '.9rem',
                        fontWeight: featuredFilter === option.value ? '500' : '400',
                        marginBottom: '.25rem'
                      }}
                      onMouseEnter={(e) => {
                        if (featuredFilter !== option.value) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (featuredFilter !== option.value) {
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

            <Link to="/admin/portfolio-categories" className="btn-secondary">Categories</Link>
            <Link to="/admin/tech-stack" className="btn-secondary">Tech Stack</Link>
            <Link to="/admin/reviews" className="btn-secondary">Reviews</Link>
            <Link to="/admin/portfolio/new" className="btn">Add Project</Link>
          </div>
        </div>

        {/* Totals strip */}
        {!loading && !error && (
          <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center', flexWrap:'wrap'}}>
            <span className="badge">Total: {total}</span>
            <span className="badge">Featured: {featured}</span>
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
            <div className="grid three" style={{marginTop:'1rem'}}>
              {filtered.map(p => (
                <div 
                  className="card" 
                  key={p._id} 
                  style={{
                    display:'grid',
                    gap:'.5rem',
                    border: selectedIds.includes(p._id) ? '2px solid #3b82f6' : undefined,
                    background: selectedIds.includes(p._id) ? 'rgba(59, 130, 246, 0.1)' : undefined
                  }}
                >
                  {/* Checkbox and Image */}
                  <div style={{position:'relative'}}>
                    {p.thumbnails?.[0] && (
                      <img src={p.thumbnails[0]} alt={p.title} style={{width:'100%',borderRadius:'12px'}} />
                    )}
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(p._id)}
                      onChange={() => toggleSelect(p._id)}
                      style={{
                        cursor:'pointer',
                        width:'20px',
                        height:'20px',
                        position: p.thumbnails?.[0] ? 'absolute' : 'static',
                        top: p.thumbnails?.[0] ? '0.5rem' : 'auto',
                        left: p.thumbnails?.[0] ? '0.5rem' : 'auto',
                        margin: p.thumbnails?.[0] ? '0' : '0 0 0.5rem 0'
                      }}
                    />
                    {p.featured && (
                      <span 
                        className="badge" 
                        style={{
                          position: p.thumbnails?.[0] ? 'absolute' : 'static',
                          top: p.thumbnails?.[0] ? '0.5rem' : 'auto',
                          right: p.thumbnails?.[0] ? '0.5rem' : 'auto',
                          background: '#f59e0b',
                          marginLeft: p.thumbnails?.[0] ? '0' : 'auto'
                        }}
                      >
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  
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
              <h3 style={{marginTop:0}}>
                {featuredFilter !== 'all' || q.trim()
                  ? 'No Projects Found'
                  : 'No Projects Yet'
                }
              </h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>
                {featuredFilter !== 'all' || q.trim()
                  ? 'Try changing the filter or search term.'
                  : 'Add your first portfolio item.'
                }
              </p>
              <Link to="/admin/portfolio/new" className="btn" style={{marginTop:'.5rem'}}>Add a Project</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}