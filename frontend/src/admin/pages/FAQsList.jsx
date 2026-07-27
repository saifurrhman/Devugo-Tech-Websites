import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ClientFaqAPI } from '../../lib/api';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useNotification } from '../../contexts/NotificationContext';
import CustomSelect from '../../components/CustomSelect';
import LoadingState from '../components/LoadingState';

export default function FAQsList(){
  const confirm = useConfirm();
  const notify = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
  const [categoryFilter, setCategoryFilter] = useState('all');

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
      notify.warning('Please select FAQs to delete');
      return;
    }
    
    await confirm.show({
      title: 'Delete FAQs',
      message: `Delete ${selectedIds.length} selected FAQ(s)?`,
      variant: 'danger',
      confirmText: 'Delete',
      action: async () => {
        await Promise.all(selectedIds.map(id => ClientFaqAPI.remove(id)));
        setItems(prev => prev.filter(f => !selectedIds.includes(f._id)));
        setSelectedIds([]);
        notify.success('Selected FAQs deleted successfully');
      }
    });
  }

  async function removeItem(id){
    await confirm.show({
      title: 'Delete FAQ',
      message: 'Delete this FAQ?',
      variant: 'danger',
      confirmText: 'Delete',
      action: async () => {
        await ClientFaqAPI.remove(id); 
        setItems(prev => prev.filter(f => f._id !== id));
        notify.success('FAQ deleted');
      }
    });
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
    ]).then(() => { fetchAll(); notify.success('Reordered'); }).catch(e=>notify.error(e.message||'Failed to reorder'));
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
            <div style={{ width: '180px' }}>
              <CustomSelect 
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
            
            <div style={{ width: '180px' }}>
              <CustomSelect 
                options={categories.map(c => ({ label: c === 'all' ? 'All Categories' : c, value: c }))}
                value={categoryFilter}
                onChange={setCategoryFilter}
              />
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

        {loading && <LoadingState message="Loading FAQs..." />}
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
                        <div style={{flex:'1 1 200px'}}>
                          <strong>{f.question}</strong>
                          <div className="muted" style={{fontSize:'.85rem',marginTop:'.25rem'}}>
                            {f.category || 'General'} • Order {f.order ?? 0} • {f.published? 'Published':'Draft'}
                          </div>
                        </div>
                        <div style={{display:'flex',gap:'.4rem', flexShrink: 0}}>
                          <button className="btn-secondary" onClick={()=>move(f._id,'up')} style={{padding: '0.2rem 0.5rem', minHeight: '32px'}}>↑</button>
                          <button className="btn-secondary" onClick={()=>move(f._id,'down')} style={{padding: '0.2rem 0.5rem', minHeight: '32px'}}>↓</button>
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