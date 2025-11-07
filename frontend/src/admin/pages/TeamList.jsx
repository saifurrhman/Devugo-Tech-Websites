import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { TeamAPI } from '../../lib/api';

export default function TeamList(){
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filter state
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Dropdown state
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
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
        const { members } = await TeamAPI.list();
        if(mounted) setItems(members||[]);
      }catch(err){ if(mounted) setError(err.message||'Failed to load team'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  // Get unique roles
  const roles = useMemo(() => {
    const roleSet = new Set(items.map(m => m.role || 'Member'));
    return ['all', ...Array.from(roleSet)];
  }, [items]);

  // Filter items
  const filtered = useMemo(() => {
    let result = items;
    
    // Filter by role
    if (roleFilter !== 'all') {
      result = result.filter(m => (m.role || 'Member') === roleFilter);
    }
    
    // Filter by search term
    const term = q.trim().toLowerCase();
    if (term) {
      result = result.filter(m => 
        (m.name || '').toLowerCase().includes(term) || 
        (m.role || '').toLowerCase().includes(term) ||
        (m.bio || '').toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [q, items, roleFilter]);

  const total = items.length;

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
      setSelectedIds(filtered.map(m => m._id));
    }
  };

  // Delete selected members
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      alert('Please select team members to remove');
      return;
    }
    
    if (!window.confirm(`Remove ${selectedIds.length} selected team member(s)?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => TeamAPI.remove(id)));
      setItems(prev => prev.filter(m => !selectedIds.includes(m._id)));
      setSelectedIds([]);
      alert('Selected team members removed successfully');
    } catch (err) { 
      alert(err.message || 'Failed to remove selected members'); 
    }
  }

  async function handleDelete(id){
    if(!window.confirm('Remove this member?')) return;
    try{ 
      await TeamAPI.remove(id); 
      setItems(prev=>prev.filter(m=>m._id!==id)); 
    }
    catch(err){ alert(err.message||'Failed to delete'); }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
          <h1>Team</h1>
          <div style={{display:'flex',gap:'.6rem',alignItems:'center',flexWrap:'wrap'}}>
            {/* Search Bar */}
            <div className="admin-search" style={{maxWidth:280}}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input className="admin-search__input" placeholder="Search members..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>

            {/* Role Filter Dropdown */}
            <div ref={roleDropdownRef} style={{position:'relative'}}>
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
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
                <span>{roleFilter === 'all' ? 'All Roles' : roleFilter}</span>
                <span style={{fontSize:'.75rem'}}>▼</span>
              </button>
              
              {roleDropdownOpen && (
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
                  {roles.map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        setRoleFilter(role);
                        setRoleDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '.6rem .85rem',
                        background: roleFilter === role 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : 'transparent',
                        border: roleFilter === role 
                          ? '1px solid rgba(59, 130, 246, 0.5)' 
                          : '1px solid transparent',
                        borderRadius: '.375rem',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all .2s',
                        fontSize: '.9rem',
                        fontWeight: roleFilter === role ? '500' : '400',
                        marginBottom: '.25rem'
                      }}
                      onMouseEnter={(e) => {
                        if (roleFilter !== role) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (roleFilter !== role) {
                          e.target.style.background = 'transparent';
                          e.target.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {role === 'all' ? 'All Roles' : role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/admin/team/new" className="btn">Add Member</Link>
          </div>
        </div>

        {/* Totals strip */}
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
                Remove Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}

        {!loading && !error && (
          filtered.length ? (
            <div className="grid three" style={{marginTop:'1rem'}}>
              {filtered.map(m => (
                <div 
                  className="card" 
                  key={m._id} 
                  style={{
                    display:'grid',
                    gap:'.5rem',
                    border: selectedIds.includes(m._id) ? '2px solid #3b82f6' : undefined,
                    background: selectedIds.includes(m._id) ? 'rgba(59, 130, 246, 0.1)' : undefined
                  }}
                >
                  {/* Checkbox and Header */}
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(m._id)}
                      onChange={() => toggleSelect(m._id)}
                      style={{cursor:'pointer',width:'18px',height:'18px'}}
                    />
                    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
                      <h3 style={{margin:0}}>{m.name || 'Untitled Member'}</h3>
                      <span className="badge">{m.role || 'Member'}</span>
                    </div>
                  </div>
                  
                  {m.bio && <p style={{margin:0,paddingLeft:'1.75rem'}}>{m.bio}</p>}
                  
                  <div style={{display:'flex',gap:'.4rem',marginTop:'.25rem',paddingLeft:'1.75rem'}}>
                    <button className="btn-secondary" onClick={()=>navigate(`/admin/team/${m._id}`)}>Edit</button>
                    <button className="btn-secondary" onClick={()=>handleDelete(m._id)} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>
                {roleFilter !== 'all' || q.trim()
                  ? 'No Team Members Found'
                  : 'No Team Members'
                }
              </h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>
                {roleFilter !== 'all' || q.trim()
                  ? 'Try changing the filter or search term.'
                  : 'Add your first team member.'
                }
              </p>
              <Link to="/admin/team/new" className="btn" style={{marginTop:'.5rem'}}>Add Member</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}