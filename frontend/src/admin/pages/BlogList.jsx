import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { Link, useNavigate } from 'react-router-dom';
import { BlogAPI } from '../../lib/api';

export default function BlogList(){
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all'); // all | published | drafts
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Dropdown state
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      try{
        // Admin view: load all (published + drafts)
        const { posts } = await BlogAPI.listAll();
        if(mounted) setPosts(posts||[]);
      }catch(err){
        if(mounted) setError(err.message||'Failed to load posts');
      }finally{
        if(mounted) setLoading(false);
      }
    })();
    return ()=>{ mounted = false };
  },[]);

  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    let list = posts;
    if (status === 'published') list = posts.filter(p=>!!p.published);
    if (status === 'drafts') list = posts.filter(p=>!p.published);
    if(!term) return list;
    return list.filter(p =>
      (p.title||'').toLowerCase().includes(term) ||
      (p.excerpt||'').toLowerCase().includes(term)
    );
  },[q, posts, status]);

  const publishedCount = useMemo(() => posts.filter(p => p.published).length, [posts]);
  const draftCount = useMemo(() => posts.filter(p => !p.published).length, [posts]);

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
      setSelectedIds(filtered.map(p => p._id));
    }
  };

  // Delete selected posts
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      alert('Please select posts to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedIds.length} selected post(s)?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => BlogAPI.remove(id)));
      setPosts(prev => prev.filter(p => !selectedIds.includes(p._id)));
      setSelectedIds([]);
      alert('Selected posts deleted successfully');
    } catch (err) { 
      alert(err.message || 'Failed to delete selected posts'); 
    }
  }

  async function handleDelete(id){
    if(!window.confirm('Delete this post?')) return;
    try{
      await BlogAPI.remove(id);
      setPosts(prev=>prev.filter(p=>p._id!==id));
    }catch(err){
      alert(err.message||'Failed to delete');
    }
  }

  async function togglePublish(p){
    try{
      const { post } = await BlogAPI.update(p._id, { published: !p.published });
      setPosts(prev=>prev.map(x=>x._id===p._id? post : x));
    }catch(err){
      alert(err.message||'Failed to update');
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Posts' },
    { value: 'published', label: 'Published Only' },
    { value: 'drafts', label: 'Drafts Only' }
  ];

  const selectedStatusOption = statusOptions.find(opt => opt.value === status);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',gap:'.6rem',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
          <h1>Blog</h1>
          <div style={{display:'flex',gap:'.6rem',alignItems:'center',flexWrap:'wrap'}}>
            <div className="admin-search" style={{maxWidth:280}}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input className="admin-search__input" placeholder="Search posts..." value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            
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
                        setStatus(option.value);
                        setStatusDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '.6rem .85rem',
                        background: status === option.value 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : 'transparent',
                        border: status === option.value 
                          ? '1px solid rgba(59, 130, 246, 0.5)' 
                          : '1px solid transparent',
                        borderRadius: '.375rem',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all .2s',
                        fontSize: '.9rem',
                        fontWeight: status === option.value ? '500' : '400',
                        marginBottom: '.25rem'
                      }}
                      onMouseEnter={(e) => {
                        if (status !== option.value) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (status !== option.value) {
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

            <Link to="/admin/blog/categories" className="btn-secondary">Categories</Link>
            <Link to="/admin/blog/create" className="btn">New Post</Link>
          </div>
        </div>

        {/* Totals strip */}
        {!loading && !error && (
          <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center', flexWrap:'wrap'}}>
            <span className="badge">Total: {posts.length}</span>
            <span className="badge">Published: {publishedCount}</span>
            <span className="badge">Drafts: {draftCount}</span>
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

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading posts…</div>}
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
                    {p.coverImage && (
                      <img src={p.coverImage} alt={p.title} style={{width:'100%',borderRadius:'12px'}} />
                    )}
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(p._id)}
                      onChange={() => toggleSelect(p._id)}
                      style={{
                        cursor:'pointer',
                        width:'20px',
                        height:'20px',
                        position: p.coverImage ? 'absolute' : 'static',
                        top: p.coverImage ? '0.5rem' : 'auto',
                        left: p.coverImage ? '0.5rem' : 'auto',
                        margin: p.coverImage ? '0' : '0 0 0.5rem 0'
                      }}
                    />
                  </div>
                  
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
                    <h3 style={{margin:0}}>{p.title}</h3>
                    <span className="badge">{p.published? 'Published' : 'Draft'}</span>
                  </div>
                  
                  {p.excerpt && <p style={{margin:0}}>{p.excerpt}</p>}
                  {p.publishedAt && <small style={{opacity:.8}}>Published {new Date(p.publishedAt).toLocaleDateString()}</small>}
                  
                  <div style={{display:'flex',gap:'.4rem',marginTop:'.25rem'}}>
                    <button className="btn-secondary" onClick={()=>navigate(`/admin/blog/${p._id}`)}>Edit</button>
                    <button className="btn-secondary" onClick={()=>togglePublish(p)}>{p.published? 'Unpublish' : 'Publish'}</button>
                    <button className="btn-secondary" onClick={()=>handleDelete(p._id)} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem',textAlign:'center',padding:'2rem'}}>
              <h3 style={{marginTop:0}}>
                {status !== 'all' 
                  ? `No ${status === 'published' ? 'Published Posts' : 'Draft Posts'} Found`
                  : 'No Posts Yet'
                }
              </h3>
              <p style={{opacity:.8,marginTop:'.25rem'}}>
                {status !== 'all'
                  ? 'Try changing the filter or create a new post.'
                  : 'Create Your First Blog Post To Show On The Public Blog Page.'
                }
              </p>
              <Link to="/admin/blog/create" className="btn" style={{marginTop:'.5rem'}}>Create a Post</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}