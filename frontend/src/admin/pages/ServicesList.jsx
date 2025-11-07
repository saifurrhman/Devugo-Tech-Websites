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
  
  // NEW: Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // NEW: Filter state
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const publishedCount = useMemo(() => items.filter(s => s.published !== false).length, [items]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // UPDATED: Filter by search term AND status
  const filtered = useMemo(() => {
    let result = items;
    
    // Filter by status
    if (statusFilter === 'published') {
      result = result.filter(s => s.published === true);
    } else if (statusFilter === 'draft') {
      result = result.filter(s => s.published !== true);
    }
    
    // Filter by search term
    const term = q.trim().toLowerCase();
    if (term) {
      result = result.filter(s => 
        (s.title || '').toLowerCase().includes(term) || 
        (s.description || '').toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [q, items, statusFilter]);

  // NEW: Toggle single selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // NEW: Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(s => s._id));
    }
  };

  // NEW: Delete selected services
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      alert('Please select services to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedIds.length} selected service(s)?`)) return;
    
    try {
      // Delete all selected services
      await Promise.all(selectedIds.map(id => ServiceAPI.remove(id)));
      
      // Update state
      setItems(prev => prev.filter(s => !selectedIds.includes(s._id)));
      setSelectedIds([]);
      
      alert('Selected services deleted successfully');
    } catch (err) { 
      alert(err.message || 'Failed to delete selected services'); 
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this service?')) return;
    try {
      await ServiceAPI.remove(id);
      setItems(prev => prev.filter(s => s._id !== id));
    } catch (err) { 
      alert(err.message || 'Failed to delete'); 
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published Only' },
    { value: 'draft', label: 'Draft Only' }
  ];

  const selectedOption = statusOptions.find(opt => opt.value === statusFilter);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
          <h1>Services</h1>
          <div style={{display:'flex',gap:'.6rem',alignItems:'center'}}>
            {/* NEW: Custom Card-Style Dropdown */}
            <div ref={dropdownRef} style={{position:'relative'}}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
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
                <span>{selectedOption.label}</span>
                <span style={{fontSize:'.75rem'}}>▼</span>
              </button>
              
              {dropdownOpen && (
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
                        setDropdownOpen(false);
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

            <Link to="/admin/services/new" className="btn">Add Service</Link>
          </div>
        </div>

        {/* Totals strip */}
        {!loading && !error && (
          <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center', flexWrap:'wrap'}}>
            <span className="badge">Total: {items.length}</span>
            <span className="badge">Published: {publishedCount}</span>
            <span className="badge">Showing: {filtered.length}</span>
            {selectedIds.length > 0 && (
              <span className="badge" style={{background:'#3b82f6'}}>Selected: {selectedIds.length}</span>
            )}
          </div>
        )}

        {/* NEW: Bulk Actions Bar */}
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
              {filtered.map(s => (
                <div 
                  className="card" 
                  key={s._id} 
                  style={{
                    display:'grid',
                    gap:'.5rem',
                    border: selectedIds.includes(s._id) ? '2px solid #3b82f6' : undefined,
                    background: selectedIds.includes(s._id) ? 'rgba(59, 130, 246, 0.1)' : undefined
                  }}
                >
                  {/* NEW: Checkbox for selection */}
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(s._id)}
                      onChange={() => toggleSelect(s._id)}
                      style={{cursor:'pointer',width:'18px',height:'18px'}}
                    />
                    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
                      <h3 style={{margin:0}}>{s.title || 'Untitled Service'}</h3>
                      <span className="badge">{s.published === true ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>
                  
                  {s.description && <p style={{margin:0,paddingLeft:'1.75rem'}}>{s.description}</p>}
                  
                  <div style={{display:'flex',gap:'.4rem',marginTop:'.25rem',paddingLeft:'1.75rem'}}>
                    <button className="btn-secondary" onClick={()=>navigate(`/admin/services/${s._id}`)}>Edit</button>
                    <button className="btn-secondary" onClick={()=>handleDelete(s._id)} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>
                {statusFilter !== 'all' 
                  ? `No ${statusFilter === 'published' ? 'Published' : 'Draft'} Services Found`
                  : 'No Services Yet'
                }
              </h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>
                {statusFilter !== 'all'
                  ? 'Try changing the filter or add a new service.'
                  : 'Add your first service to display on the public site.'
                }
              </p>
              <Link to="/admin/services/new" className="btn" style={{marginTop:'.5rem'}}>Add Service</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}