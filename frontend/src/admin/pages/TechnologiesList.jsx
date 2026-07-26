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
import { Search, Plus, Filter, GripVertical, Edit, Trash2, Link as LinkIcon, CheckCircle, XCircle } from 'lucide-react';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'AI & Automation', 'DevOps', 'CMS/E-commerce', 'Other'];

// Sortable Row Component
function SortableRow({ id, item, selectedIds, toggleSelect, handleEdit, handleDelete, handleToggleStatus }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-4 p-4 border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors ${selectedIds.includes(id) ? 'bg-blue-900/20' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-gray-300 px-1">
        <GripVertical size={20} />
      </div>
      
      <div className="flex-shrink-0">
        <input 
          type="checkbox" 
          checked={selectedIds.includes(id)}
          onChange={() => toggleSelect(id)}
          className="cursor-pointer w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
        />
      </div>

      <div className="flex-shrink-0 w-10 h-10 rounded bg-gray-800 flex items-center justify-center overflow-hidden">
        {item.icon ? (
          item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.includes('base64') ? (
             <img src={item.icon} alt={item.name} className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-xl" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
          )
        ) : (
          <span className="text-gray-500 font-bold">{item.name.charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium text-gray-100 truncate">{item.name}</h3>
          {item.featured && <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-300 bg-yellow-900/30 rounded-full border border-yellow-700/50">Featured</span>}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span className="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700">{item.category}</span>
          {item.proficiencyLevel > 0 && <span>Proficiency: {item.proficiencyLevel}%</span>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => handleToggleStatus(item._id)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${item.status ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20' : 'text-gray-400 bg-gray-800 hover:bg-gray-700'}`}
        >
          {item.status ? <><CheckCircle size={14} /> Active</> : <><XCircle size={14} /> Inactive</>}
        </button>

        <div className="flex items-center gap-2">
          <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors" title="Edit">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(item._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
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
    
    // Prepare payload for backend (id and new order)
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

  // Stats
  const stats = useMemo(() => {
    return {
      total: items.length,
      active: items.filter(i => i.status).length,
      featured: items.filter(i => i.featured).length
    };
  }, [items]);

  return (
    <div className="admin-layout bg-gray-900 text-gray-200 min-h-screen">
      <AdminSidebar />
      <main className="admin-content flex-1 p-6 lg:ml-64 transition-all duration-300">
        <AdminTopbar />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Tools & Technologies</h1>
            <p className="text-gray-400 text-sm mt-1">Manage the tech stack displayed on your website.</p>
          </div>
          <button onClick={() => openModal()} className="btn flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all">
            <Plus size={18} /> Add New Tool
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
            <p className="text-gray-400 text-sm font-medium">Total Tools</p>
            <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
            <p className="text-gray-400 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">{stats.active}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
            <p className="text-gray-400 text-sm font-medium">Featured</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.featured}</p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {['All', ...CATEGORIES].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-900/50 text-gray-400 border border-transparent hover:bg-gray-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search tools..." 
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-gray-500"
                />
              </div>
            </div>

          </div>

          {selectedIds.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-300">{selectedIds.length} items selected</span>
              <button onClick={handleDeleteSelected} className="text-sm bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                <Trash2 size={16} /> Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* List View with DnD */}
        <div className="bg-gray-800/80 border border-gray-700 rounded-xl shadow-xl overflow-hidden mb-12">
          
          <div className="flex items-center gap-4 p-4 border-b border-gray-700 bg-gray-800/90 text-sm font-semibold text-gray-400">
            <div className="w-6"></div>
            <div className="flex-shrink-0">
              <input 
                type="checkbox" 
                checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                onChange={toggleSelectAll}
                className="cursor-pointer w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="w-10">Icon</div>
            <div className="flex-1">Technology</div>
            <div className="w-32 text-right">Actions</div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading technologies...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 mb-4 text-gray-400">
                <Filter size={32} />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No technologies found</h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                {q || activeCategory !== 'All' 
                  ? "We couldn't find anything matching your current filters."
                  : "Start building your tech stack by adding your first technology."}
              </p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredItems.map(i => i._id)} strategy={verticalListSortingStrategy}>
                <div className="divide-y divide-gray-700/50">
                  {filteredItems.map(item => (
                    <SortableRow 
                      key={item._id} 
                      id={item._id} 
                      item={item} 
                      selectedIds={selectedIds}
                      toggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i=>i!==id) : [...prev, id])}
                      handleEdit={openModal}
                      handleDelete={handleDelete}
                      handleToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

      </main>

      {/* Slide-over Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl h-full flex flex-col transform transition-transform animate-slide-in-right">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">{editingItem ? 'Edit Technology' : 'Add Technology'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., React"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Icon (URL or SVG String)</label>
                <textarea 
                  rows="2"
                  value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-xs"
                  placeholder="https://.../icon.png OR <svg>...</svg>"
                ></textarea>
                {formData.icon && (
                  <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700 flex items-center gap-3">
                    <span className="text-sm text-gray-400">Preview:</span>
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded">
                      {formData.icon.startsWith('http') || formData.icon.includes('base64') ? (
                        <img src={formData.icon} alt="icon preview" className="w-6 h-6 object-contain" />
                      ) : (
                        <span dangerouslySetInnerHTML={{__html: formData.icon}}></span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-300">Description</label>
                  <span className={`text-xs ${formData.description.length > 150 ? 'text-red-400' : 'text-gray-500'}`}>
                    {formData.description.length}/150
                  </span>
                </div>
                <textarea 
                  maxLength={150} rows="3"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Short description..."
                ></textarea>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Proficiency Level</label>
                  <span className="text-sm font-bold text-blue-400">{formData.proficiencyLevel}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={formData.proficiencyLevel} onChange={e => setFormData({...formData, proficiencyLevel: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Website URL</label>
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="url" 
                    value={formData.websiteUrl} onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-800 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">Featured Tool</span>
                    <span className="block text-xs text-gray-400">Highlight this tool on the homepage</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:bg-gray-800 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.status} onChange={e => setFormData({...formData, status: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-white">Active Status</span>
                    <span className="block text-xs text-gray-400">Show this tool to the public</span>
                  </div>
                </label>
              </div>
              
            </form>

            <div className="p-6 border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={handleFormSubmit} className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-500/20 transition-all">
                  {editingItem ? 'Save Changes' : 'Add Technology'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
