import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { TechnologyAPI } from '../../lib/api';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'AI & Automation', 'DevOps', 'CMS/E-commerce', 'Other'];

// Sortable Row Component
function SortableRow({ id, item, selectedIds, toggleSelect, handleEdit, handleDelete, handleToggleStatus }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: selectedIds.includes(id) ? 'rgba(59, 130, 246, 0.1)' : undefined
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td {...attributes} {...listeners} style={{ cursor: 'grab', width: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
        ⋮⋮
      </td>
      <td style={{ width: '40px', textAlign: 'center' }}>
        <input 
          type="checkbox" 
          checked={selectedIds.includes(id)}
          onChange={() => toggleSelect(id)}
          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
        />
      </td>
      <td style={{ width: '60px' }}>
        {item.icon ? (
          item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.includes('base64') ? (
             <img src={item.icon} alt={item.name} style={{ height: '32px', maxWidth: '32px', objectFit: 'contain', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '4px' }} />
          ) : (
            <div style={{ height: '32px', width: '32px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} dangerouslySetInnerHTML={{ __html: item.icon }}></div>
          )
        ) : (
          <div style={{ height: '32px', width: '32px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{item.name.charAt(0)}</div>
        )}
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 500 }}>{item.name}</span>
          {item.featured && <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.3)' }}>FEATURED</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', border: 'none' }}>{item.category}</span>
          {item.proficiencyLevel > 0 && <span className="muted" style={{ fontSize: '0.75rem' }}>Proficiency: {item.proficiencyLevel}%</span>}
        </div>
      </td>
      <td style={{ textAlign: 'center' }}>
        <div className={`status-badge ${item.status ? 'success' : 'neutral'}`} onClick={() => handleToggleStatus(item._id)} style={{ cursor: 'pointer', display: 'inline-block' }}>
            {item.status ? 'Active' : 'Inactive'}
        </div>
      </td>
      <td style={{ textAlign: 'right' }}>
        <button className="btn-icon" onClick={() => handleEdit(item)} title="Edit">✏️</button>
        <button className="btn-icon danger" onClick={() => handleDelete(item._id)} title="Delete" style={{ marginLeft: '.5rem' }}>🗑️</button>
      </td>
    </tr>
  );
}

export default function TechnologiesList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '', icon: '', category: 'Other', description: '', proficiencyLevel: 80, websiteUrl: '', status: true, featured: false
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function fetchAll() {
    setLoading(true); setError('');
    try {
      const res = await TechnologyAPI.list();
      setItems(res.items || []);
    } catch(err) {
      setError(err.message || 'Failed to load technologies');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeCategory !== 'All') {
      result = result.filter(it => it.category === activeCategory);
    }
    if (q.trim()) {
      const term = q.trim().toLowerCase();
      result = result.filter(it => (it.name || '').toLowerCase().includes(term));
    }
    return result;
  }, [items, activeCategory, q]);

  // Drag and Drop handlers
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    // Check if we are filtering, if so prevent drag and drop reordering
    if (activeCategory !== 'All' || q.trim() !== '') {
      alert("Sorting is only available when viewing 'All' categories without search filters.");
      return;
    }

    const oldIndex = items.findIndex((it) => it._id === active.id);
    const newIndex = items.findIndex((it) => it._id === over.id);
    
    const newItems = arrayMove(items, oldIndex, newIndex);
    
    // Update local state immediately for snappy UI
    setItems(newItems);
    
    // Prepare payload for backend
    const reorderedPayload = newItems.map((item, index) => ({
      id: item._id,
      order: index
    }));
    
    try {
      await TechnologyAPI.reorder(reorderedPayload);
    } catch(err) {
      alert("Failed to save order: " + err.message);
      fetchAll(); // Revert on failure
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await TechnologyAPI.toggleStatus(id);
      setItems(items.map(it => it._id === id ? { ...it, status: !it.status } : it));
    } catch(err) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this technology?")) return;
    try {
      await TechnologyAPI.remove(id);
      setItems(items.filter(it => it._id !== id));
    } catch(err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected items?`)) return;
    try {
      await Promise.all(selectedIds.map(id => TechnologyAPI.remove(id)));
      setItems(items.filter(it => !selectedIds.includes(it._id)));
      setSelectedIds([]);
    } catch(err) {
      alert("Bulk delete failed: " + err.message);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '', icon: item.icon || '', category: item.category || 'Other',
        description: item.description || '', proficiencyLevel: item.proficiencyLevel || 0,
        websiteUrl: item.websiteUrl || '', status: item.status !== false, featured: !!item.featured
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '', icon: '', category: 'Frontend', description: '', proficiencyLevel: 80, websiteUrl: '', status: true, featured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await TechnologyAPI.update(editingItem._id, formData);
      } else {
        await TechnologyAPI.create(formData);
      }
      setIsModalOpen(false);
      fetchAll();
    } catch(err) {
      alert("Save failed: " + err.message);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(it => it._id));
    }
  };

  const stats = {
    total: items.length,
    active: items.filter(i => i.status).length,
    featured: items.filter(i => i.featured).length
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
          <div>
            <h1>Tools & Technologies</h1>
            <p className="sub">Manage the tech stack displayed on your website.</p>
          </div>
          <button onClick={() => openModal()} className="btn">
            + Add New Tool
          </button>
        </div>

        {/* Totals strip */}
        {!loading && !error && (
          <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center', flexWrap:'wrap'}}>
            <span className="badge">Total Tools: {stats.total}</span>
            <span className="badge" style={{background:'rgba(16, 185, 129, 0.2)', color:'#34d399'}}>Active: {stats.active}</span>
            <span className="badge" style={{background:'rgba(245, 158, 11, 0.2)', color:'#fbbf24'}}>Featured: {stats.featured}</span>
            {selectedIds.length > 0 && (
              <span className="badge" style={{background:'#3b82f6'}}>Selected: {selectedIds.length}</span>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'1rem', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap'}}>
          
          <div style={{display:'flex', gap:'.5rem', flexWrap:'wrap', alignItems:'center'}}>
            {['All', ...CATEGORIES].map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '.35rem .75rem',
                  borderRadius: '999px',
                  fontSize: '.85rem',
                  cursor: 'pointer',
                  border: activeCategory === cat ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
                  background: activeCategory === cat ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === cat ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                  transition: 'all .2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="admin-search" style={{maxWidth:280, margin:0}}>
            <span className="admin-search__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <input className="admin-search__input" placeholder="Search tools..." value={q} onChange={e=>setQ(e.target.value)} />
          </div>

        </div>

        {/* Bulk Actions Bar */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="card" style={{
            marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap'
          }}>
            <div style={{display:'flex',gap:'.6rem',alignItems:'center'}}>
              <input 
                type="checkbox" 
                checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                onChange={toggleSelectAll}
                style={{cursor:'pointer',width:'18px',height:'18px'}}
              />
              <span style={{fontSize:'.9rem'}}>
                {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? 'Deselect All' : 'Select All'}
              </span>
            </div>
            
            {selectedIds.length > 0 && (
              <button className="btn-secondary" onClick={handleDeleteSelected} style={{ borderColor:'#ef4444', color:'#ef4444', fontWeight:'500' }}>
                Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {/* List Card */}
        <div className="card" style={{ marginTop: '.75rem' }}>
            {loading ? <div className="muted" style={{ marginTop: '1rem', padding: '1rem' }}>Loading technologies...</div> : error ? <div style={{ color: '#ef4444', padding: '1rem' }}>{error}</div> : (
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '30px' }}></th>
                                <th style={{ width: '40px', textAlign: 'center' }}>
                                    <input type="checkbox" checked={selectedIds.length === filteredItems.length && filteredItems.length > 0} onChange={toggleSelectAll} style={{cursor:'pointer'}} />
                                </th>
                                <th colSpan={2} style={{ textAlign: 'left' }}>Technology</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        {filteredItems.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan="6" className="muted" style={{ textAlign: 'center', padding: '3rem' }}>
                                        {q || activeCategory !== 'All' ? "No technologies match your filters." : "Start building your tech stack by adding your first technology."}
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={filteredItems.map(i => i._id)} strategy={verticalListSortingStrategy}>
                              <tbody>
                                {filteredItems.map(item => (
                                  <SortableRow 
                                    key={item._id} 
                                    id={item._id} 
                                    item={item} 
                                    selectedIds={selectedIds}
                                    toggleSelect={toggleSelect}
                                    handleEdit={openModal}
                                    handleDelete={handleDelete}
                                    handleToggleStatus={handleToggleStatus}
                                  />
                                ))}
                              </tbody>
                            </SortableContext>
                          </DndContext>
                        )}
                    </table>
                </div>
            )}
        </div>

      </main>

      {/* Slide-over Modal Form - Restyled to match Admin Theme */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setIsModalOpen(false)}></div>
          
          <div className="card" style={{ 
            position: 'relative', width: '100%', maxWidth: '450px', height: '100%', margin: 0, borderRadius: 0, 
            display: 'flex', flexDirection: 'column', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.1)',
            transform: 'translateX(0)', transition: 'transform 0.3s ease-out', zIndex: 10
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{editingItem ? 'Edit Technology' : 'Add Technology'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.5rem' }}>
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontWeight: 500 }}>Name *</span>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="form-field"
                  placeholder="e.g., React"
                />
              </label>

              <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontWeight: 500 }}>Category</span>
                <select 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="form-field"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontWeight: 500 }}>Icon (URL or SVG String)</span>
                <textarea 
                  rows="2"
                  value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})}
                  className="form-field"
                  placeholder="https://.../icon.png OR <svg>...</svg>"
                  style={{ resize: 'none' }}
                ></textarea>
                {formData.icon && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="muted" style={{ fontSize: '0.85rem' }}>Preview:</span>
                    <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {formData.icon.startsWith('http') || formData.icon.includes('base64') ? (
                        <img src={formData.icon} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }} dangerouslySetInnerHTML={{__html: formData.icon}}></div>
                      )}
                    </div>
                  </div>
                )}
              </label>

              <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>Description</span>
                  <span className="muted" style={{ fontSize: '0.8rem' }}>{formData.description.length}/150</span>
                </div>
                <textarea 
                  maxLength={150} rows="3"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="form-field"
                  placeholder="Short description..."
                  style={{ resize: 'none' }}
                ></textarea>
              </label>

              <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500 }}>Proficiency Level</span>
                  <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{formData.proficiencyLevel}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={formData.proficiencyLevel} onChange={e => setFormData({...formData, proficiencyLevel: parseInt(e.target.value)})}
                  style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                />
              </label>

              <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontWeight: 500 }}>Website URL</span>
                <input 
                  type="url" 
                  value={formData.websiteUrl} onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
                  className="form-field"
                  placeholder="https://..."
                />
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 500, minWidth: '90px' }}>Featured</span>
                  <button
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, featured: !f.featured }))}
                    className={`toggle-btn ${formData.featured ? 'active' : ''}`}
                    style={{
                      width: '48px', height: '26px', borderRadius: '999px',
                      background: formData.featured ? 'linear-gradient(90deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)', position: 'relative',
                      transition: 'background .2s ease', cursor: 'pointer', flexShrink: 0
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                      left: formData.featured ? '24px' : '4px', width: '18px', height: '18px', borderRadius: '50%',
                      background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)', transition: 'left .2s ease'
                    }} />
                  </button>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>Highlight on homepage</span>
                </div>

                <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 500, minWidth: '90px' }}>Active</span>
                  <button
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, status: !f.status }))}
                    className={`toggle-btn ${formData.status ? 'active' : ''}`}
                    style={{
                      width: '48px', height: '26px', borderRadius: '999px',
                      background: formData.status ? 'linear-gradient(90deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)', position: 'relative',
                      transition: 'background .2s ease', cursor: 'pointer', flexShrink: 0
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                      left: formData.status ? '24px' : '4px', width: '18px', height: '18px', borderRadius: '50%',
                      background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)', transition: 'left .2s ease'
                    }} />
                  </button>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>{formData.status ? 'Visible to public' : 'Hidden'}</span>
                </div>
              </div>
              
            </form>

            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.1)' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button onClick={handleFormSubmit} className="btn" style={{ flex: 1, justifyContent: 'center' }}>
                {editingItem ? 'Save Changes' : 'Add Tool'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
