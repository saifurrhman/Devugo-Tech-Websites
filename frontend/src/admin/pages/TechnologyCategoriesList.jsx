import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { TechnologyCategoryAPI } from '../../lib/api';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useNotification } from '../../contexts/NotificationContext';

// Sortable Row Component
function SortableCategoryRow({ id, category, handleEdit, handleDelete, handleToggleStatus }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? 'rgba(59, 130, 246, 0.1)' : undefined
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td {...attributes} {...listeners} style={{ cursor: 'grab', width: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
        ⋮⋮
      </td>
      <td>
        <span style={{ fontWeight: 500 }}>{category.name}</span>
      </td>
      <td style={{ textAlign: 'center' }}>
        <div className={`status-badge ${category.status ? 'success' : 'neutral'}`} onClick={() => handleToggleStatus(category)} style={{ cursor: 'pointer', display: 'inline-block' }}>
            {category.status ? 'Active' : 'Inactive'}
        </div>
      </td>
      <td style={{ textAlign: 'right' }}>
        <button className="btn-icon" onClick={() => handleEdit(category)} title="Edit">✏️</button>
        <button className="btn-icon danger" onClick={() => handleDelete(category._id)} title="Delete" style={{ marginLeft: '.5rem' }}>🗑️</button>
      </td>
    </tr>
  );
}

export default function TechnologyCategoriesList() {
  const confirm = useConfirm();
  const notify = useNotification();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', status: true });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function fetchAll() {
    setLoading(true); setError('');
    try {
      const res = await TechnologyCategoryAPI.list();
      setCategories(res.items || []);
    } catch(err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((it) => it._id === active.id);
    const newIndex = categories.findIndex((it) => it._id === over.id);
    
    const newItems = arrayMove(categories, oldIndex, newIndex);
    
    // Optimistic UI update
    setCategories(newItems);
    
    const reorderedPayload = newItems.map((item, index) => ({
      id: item._id,
      order: index
    }));
    
    try {
      await TechnologyCategoryAPI.reorder(reorderedPayload);
      notify.success("Order saved");
    } catch(err) {
      notify.error("Failed to save order: " + err.message);
      fetchAll();
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      await TechnologyCategoryAPI.update(cat._id, { status: !cat.status });
      setCategories(categories.map(c => c._id === cat._id ? { ...c, status: !c.status } : c));
      notify.success("Status updated");
    } catch(err) {
      notify.error("Failed to toggle status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm.show({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category?',
      variant: 'danger',
      confirmText: 'Delete'
    });
    if (!confirmed) return;
    try {
      await TechnologyCategoryAPI.remove(id);
      setCategories(categories.filter(c => c._id !== id));
      notify.success("Category deleted");
    } catch(err) {
      notify.error("Delete failed: " + err.message);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name || '', status: category.status !== false });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', status: true });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await TechnologyCategoryAPI.update(editingCategory._id, formData);
        notify.success("Category updated");
      } else {
        await TechnologyCategoryAPI.create(formData);
        notify.success("Category created");
      }
      setIsModalOpen(false);
      fetchAll();
    } catch(err) {
      notify.error("Save failed: " + err.message);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        {/* Breadcrumbs */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <Link to="/admin" className="opacity-70 hover:opacity-100">Dashboard</Link>
            <span className="opacity-50">/</span>
            <Link to="/admin/technologies" className="opacity-70 hover:opacity-100">Tools & Technologies</Link>
            <span className="opacity-50">/</span>
            <strong>Categories</strong>
          </div>
          <Link to="/admin/technologies" className="btn-secondary">Back to Technologies</Link>
        </div>

        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
          <div>
            <h1>Technology Categories</h1>
            <p className="sub">Manage the categories used for tools and technologies.</p>
          </div>
          <button onClick={() => openModal()} className="btn">
            + Add Category
          </button>
        </div>

        {/* List Card */}
        <div className="card" style={{ marginTop: '.75rem' }}>
            {loading ? <div className="muted" style={{ marginTop: '1rem', padding: '1rem' }}>Loading categories...</div> : error ? <div style={{ color: '#ef4444', padding: '1rem' }}>{error}</div> : (
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '30px' }}></th>
                                <th style={{ textAlign: 'left' }}>Category Name</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        {categories.length === 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan="4" className="muted" style={{ textAlign: 'center', padding: '3rem' }}>
                                        No categories found. Create one to get started.
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={categories.map(c => c._id)} strategy={verticalListSortingStrategy}>
                              <tbody>
                                {categories.map(cat => (
                                  <SortableCategoryRow 
                                    key={cat._id} 
                                    id={cat._id} 
                                    category={cat} 
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

      {/* Centered Modal Form */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setIsModalOpen(false)}></div>
          
          <div className="card" style={{ 
            position: 'relative', width: '100%', maxWidth: '400px', margin: 0, padding: 0, 
            display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', zIndex: 10, overflow: 'hidden'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>
                ×
              </button>
            </div>

            <form id="cat-form" onSubmit={handleFormSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontWeight: 500 }}>Category Name *</span>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="form-field"
                  placeholder="e.g., Mobile Apps"
                />
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                  <span className="muted" style={{ fontSize: '0.85rem' }}>{formData.status ? 'Visible' : 'Hidden'}</span>
                </div>
              </div>
              
            </form>

            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.15)', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ padding: '0.5rem 1.5rem' }}>
                Cancel
              </button>
              <button form="cat-form" type="submit" className="btn" style={{ padding: '0.5rem 1.5rem' }}>
                {editingCategory ? 'Save' : 'Add Category'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
