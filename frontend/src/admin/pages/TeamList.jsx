import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { TeamAPI, getFileUrl } from '../../lib/api';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useNotification } from '../../contexts/NotificationContext';
import CustomSelect from '../../components/CustomSelect';
import LoadingState from '../components/LoadingState';

export default function TeamList(){
  const confirm = useConfirm();
  const notify = useNotification();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filter state
  const [roleFilter, setRoleFilter] = useState('all');
  

  
  // ✅ Track broken images
  const [brokenImages, setBrokenImages] = useState(new Set());



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
      notify.warning('Please select team members to remove');
      return;
    }
    
    await confirm.show({
      title: 'Remove Team Members',
      message: `Remove ${selectedIds.length} selected team member(s)?`,
      variant: 'danger',
      confirmText: 'Remove',
      action: async () => {
        await Promise.all(selectedIds.map(id => TeamAPI.remove(id)));
        setItems(prev => prev.filter(m => !selectedIds.includes(m._id)));
        setSelectedIds([]);
        notify.success('Selected team members removed successfully');
      }
    });
  }

  async function handleDelete(id){
    await confirm.show({
      title: 'Remove Member',
      message: 'Remove this member?',
      variant: 'danger',
      confirmText: 'Remove',
      action: async () => {
        await TeamAPI.remove(id); 
        setItems(prev=>prev.filter(m=>m._id!==id)); 
        notify.success('Team member removed');
      }
    });
  }
  
  // ✅ Handle image error
  const handleImageError = (id) => {
    setBrokenImages(prev => new Set([...prev, id]));
  };

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

            <div style={{ width: '160px' }}>
              <CustomSelect
                options={roles.map(r => ({ label: r === 'all' ? 'All Roles' : r, value: r }))}
                value={roleFilter}
                onChange={setRoleFilter}
              />
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

        {loading && <LoadingState message="Loading team..." />}
        
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
                    gap:'.75rem',
                    border: selectedIds.includes(m._id) ? '2px solid #3b82f6' : undefined,
                    background: selectedIds.includes(m._id) ? 'rgba(59, 130, 246, 0.1)' : undefined
                  }}
                >
                  {/* ✅ AVATAR + CHECKBOX ROW */}
                  <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(m._id)}
                      onChange={() => toggleSelect(m._id)}
                      style={{cursor:'pointer',width:'18px',height:'18px'}}
                    />
                    
                    {/* ✅ AVATAR IMAGE */}
                    <div style={{width:56,height:56,borderRadius:'50%',overflow:'hidden',flexShrink:0}}>
                      {m.avatar && !brokenImages.has(m._id) ? (
                        <img 
                          src={getFileUrl(m.avatar)} 
                          alt={m.name || 'Avatar'} 
                          onError={() => handleImageError(m._id)}
                          style={{width:'100%',height:'100%',objectFit:'cover'}} 
                        />
                      ) : (
                        <div 
                          style={{
                            width:'100%',
                            height:'100%',
                            display:'flex',
                            alignItems:'center',
                            justifyContent:'center',
                            background:'#eef2f7',
                            color:'#0f172a',
                            fontWeight:800,
                            fontSize:'1.25rem'
                          }}
                        >
                          {(m.name || '?').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {/* NAME + ROLE */}
                    <div style={{flex:1,minWidth:0}}>
                      <h3 style={{margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {m.name || 'Untitled Member'}
                      </h3>
                      <span className="badge" style={{marginTop:'.25rem',display:'inline-block'}}>
                        {m.role || 'Member'}
                      </span>
                    </div>
                  </div>
                  
                  {/* BIO */}
                  {m.bio && (
                    <p style={{
                      margin:0,
                      fontSize:'.9rem',
                      lineHeight:1.5,
                      color:'rgba(255,255,255,0.8)'
                    }}>
                      {m.bio}
                    </p>
                  )}
                  
                  {/* ACTIONS */}
                  <div style={{display:'flex',gap:'.4rem',marginTop:'.25rem'}}>
                    <button className="btn-secondary" onClick={()=>navigate(`/admin/team/${m._id}`)}>Edit</button>
                    <button 
                      className="btn-secondary" 
                      onClick={()=>handleDelete(m._id)} 
                      style={{borderColor:'#ef4444',color:'#ef4444'}}
                    >
                      Delete
                    </button>
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