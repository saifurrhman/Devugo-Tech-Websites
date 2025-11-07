import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { PricingAPI } from '../../lib/api';


function PlanForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    priceMonthly: initial?.priceMonthly ?? 0,
    priceYearly: initial?.priceYearly ?? 0,
    priceOneTime: initial?.priceOneTime ?? 0,
    features: (initial?.features || []).join(', '),
    recommended: !!initial?.recommended,
    published: initial?.published ?? true,
    order: initial?.order ?? 0,
    planType: initial?.planType || 'subscription',
  }));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name,
        priceMonthly: Number(form.priceMonthly) || 0,
        priceYearly: Number(form.priceYearly) || 0,
        priceOneTime: Number(form.priceOneTime) || 0,
        features: form.features.split(',').map(s => s.trim()).filter(Boolean),
        recommended: !!form.recommended,
        published: !!form.published,
        order: Number(form.order) || 0,
        planType: form.planType,
      };

      await onSave(payload);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-4 p-6 flex flex-col gap-6">
      {error && (
        <div className="bg-red-200 text-red-800 rounded p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <label className="flex flex-col gap-1">
          <span className="font-medium text-sm">Plan Name</span>
          <input
            className="form-field ux-input px-3 py-2 border rounded text-base"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Starter / Pro / Business"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-sm">Plan Type</span>
          <select
            className="form-field ux-input px-3 py-2 border rounded text-base"
            value={form.planType}
            onChange={e => setForm(f => ({ ...f, planType: e.target.value }))}
          >
            <option value="subscription">Subscription (Monthly/Yearly)</option>
            <option value="one-time">One-Time Setup</option>
            <option value="custom">Custom Quote</option>
          </select>
        </label>

        {form.planType === 'subscription' && (
          <>
            <label className="flex flex-col gap-1">
              <span className="font-medium text-sm">Price Monthly ($)</span>
              <input
                type="number"
                className="form-field ux-input px-3 py-2 border rounded text-base"
                value={form.priceMonthly}
                onChange={e => setForm(f => ({ ...f, priceMonthly: e.target.value }))}
                min="0"
                step="0.01"
              />
              <span className="text-xs text-gray-500">Monthly subscription price</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-medium text-sm">Price Yearly ($)</span>
              <input
                type="number"
                className="form-field ux-input px-3 py-2 border rounded text-base"
                value={form.priceYearly}
                onChange={e => setForm(f => ({ ...f, priceYearly: e.target.value }))}
                min="0"
                step="0.01"
              />
              <span className="text-xs text-gray-500">Usually 10x monthly with a discount</span>
            </label>
          </>
        )}

        {form.planType === 'one-time' && (
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="font-medium text-sm">One-Time Price ($)</span>
            <input
              type="number"
              className="form-field ux-input px-3 py-2 border rounded text-base"
              value={form.priceOneTime}
              onChange={e => setForm(f => ({ ...f, priceOneTime: e.target.value }))}
              min="0"
              step="0.01"
            />
            <span className="text-xs text-gray-500">One-time setup fee</span>
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="font-medium text-sm">Display Order</span>
          <input
            type="number"
            className="form-field ux-input px-3 py-2 border rounded text-base"
            value={form.order}
            onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
          />
          <span className="text-xs text-gray-500">Lower numbers appear first</span>
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="font-medium text-sm">Features (comma separated)</span>
          <textarea
            className="form-field ux-input px-3 py-2 border rounded text-base"
            value={form.features}
            onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
            placeholder="10 pages, Contact form, Basic SEO"
            rows="3"
          />
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.recommended}
              onChange={e => setForm(f => ({ ...f, recommended: e.target.checked }))}
            />
            Mark as Recommended
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
            />
            Published (visible on site)
          </label>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary" style={{backgroundColor: 'white', color: 'black', padding: '8px 16px', borderRadius: '8px'}} >
          Cancel
        </button>
        <button type="submit" className="btn" disabled={saving} >
          {saving ? 'Saving...' : initial ? 'Update Plan' : 'Create Plan'}
        </button>
      </div>
    </form>
  );
}


export default function PricingPlans() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'published', 'draft'
  const [planTypeFilter, setPlanTypeFilter] = useState('all'); // 'all', 'subscription', 'one-time', 'custom'
  
  // Dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [planTypeDropdownOpen, setPlanTypeDropdownOpen] = useState(false);
  
  const statusDropdownRef = useRef(null);
  const planTypeDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
      if (planTypeDropdownRef.current && !planTypeDropdownRef.current.contains(event.target)) {
        setPlanTypeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const total = items.length;
  const publishedCount = items.filter(p => !!p.published).length;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { items: fetchedItems } = await PricingAPI.list();
        if (mounted) {
          setItems(Array.isArray(fetchedItems) ? fetchedItems : []);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load plans');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let result = items;
    
    // Filter by status
    if (statusFilter === 'published') {
      result = result.filter(p => p.published === true);
    } else if (statusFilter === 'draft') {
      result = result.filter(p => !p.published);
    }
    
    // Filter by plan type
    if (planTypeFilter !== 'all') {
      result = result.filter(p => p.planType === planTypeFilter);
    }
    
    // Filter by search term
    const term = q.trim().toLowerCase();
    if (term) {
      result = result.filter(p => (p.name || '').toLowerCase().includes(term));
    }
    
    return result;
  }, [q, items, statusFilter, planTypeFilter]);

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

  // Delete selected plans
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) {
      alert('Please select plans to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedIds.length} selected plan(s)?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => PricingAPI.remove(id)));
      setItems(prev => prev.filter(p => !selectedIds.includes(p._id)));
      setSelectedIds([]);
      alert('Selected plans deleted successfully');
    } catch (err) { 
      alert(err.message || 'Failed to delete selected plans'); 
    }
  }

  async function handleCreate(payload) {
    const { item } = await PricingAPI.create(payload);
    setItems(prev => [item, ...prev]);
    setShowForm(false);
  }

  async function handleUpdate(id, payload) {
    const { item } = await PricingAPI.update(id, payload);
    setItems(prev => prev.map(p => (p._id === id ? item : p)));
    setEditItem(null);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this plan?')) return;
    await PricingAPI.remove(id);
    setItems(prev => prev.filter(p => p._id !== id));
  }

  async function toggleField(plan, field) {
    const { item } = await PricingAPI.update(plan._id, { [field]: !plan[field] });
    setItems(prev => prev.map(p => (p._id === plan._id ? item : p)));
  }

  function formatPrice(plan) {
    if (plan.planType === 'custom') return 'Custom';
    if (plan.planType === 'one-time') return `$${plan.priceOneTime || 0}`;
    return `$${plan.priceMonthly || 0}/mo`;
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published Only' },
    { value: 'draft', label: 'Draft Only' }
  ];

  const planTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'one-time', label: 'One-Time' },
    { value: 'custom', label: 'Custom' }
  ];

  const selectedStatusOption = statusOptions.find(opt => opt.value === statusFilter);
  const selectedPlanTypeOption = planTypeOptions.find(opt => opt.value === planTypeFilter);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content p-6 w-full overflow-auto">
        <AdminTopbar />

        <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
          <h1 className="m-0">Pricing Plans</h1>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="admin-search" style={{ maxWidth: 280 }}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                className="admin-search__input"
                placeholder="Search plans..."
                value={q}
                onChange={e => setQ(e.target.value)}
              />
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
                  minWidth: '140px',
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
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setStatusDropdownOpen(false);
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

            {/* Plan Type Filter Dropdown */}
            <div ref={planTypeDropdownRef} style={{position:'relative'}}>
              <button
                onClick={() => setPlanTypeDropdownOpen(!planTypeDropdownOpen)}
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
                <span>{selectedPlanTypeOption.label}</span>
                <span style={{fontSize:'.75rem'}}>▼</span>
              </button>
              
              {planTypeDropdownOpen && (
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
                  {planTypeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPlanTypeFilter(option.value);
                        setPlanTypeDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '.6rem .85rem',
                        background: planTypeFilter === option.value 
                          ? 'rgba(59, 130, 246, 0.3)' 
                          : 'transparent',
                        border: planTypeFilter === option.value 
                          ? '1px solid rgba(59, 130, 246, 0.5)' 
                          : '1px solid transparent',
                        borderRadius: '.375rem',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all .2s',
                        fontSize: '.9rem',
                        fontWeight: planTypeFilter === option.value ? '500' : '400',
                        marginBottom: '.25rem'
                      }}
                      onMouseEnter={(e) => {
                        if (planTypeFilter !== option.value) {
                          e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (planTypeFilter !== option.value) {
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

            <button onClick={() => { setShowForm(true); setEditItem(null); }} className="btn">
              + Add Plan
            </button>
          </div>
        </div>

        {!loading && !error && (
          <div className="card mt-3 p-3 flex flex-wrap gap-3 items-center">
            <span className="badge">Total: {total}</span>
            <span className="badge">Published: {publishedCount}</span>
            <span className="badge">Showing: {filtered.length}</span>
            {selectedIds.length > 0 && (
              <span className="badge" style={{background:'#3b82f6'}}>Selected: {selectedIds.length}</span>
            )}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {!loading && !error && !showForm && !editItem && filtered.length > 0 && (
          <div className="card mt-3 p-3 flex flex-wrap items-center justify-between gap-3">
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

        {loading && <div className="card mt-4">Loading...</div>}
        {error && <div className="card mt-4 text-red-500">{error}</div>}

        {!loading && !error && !showForm && !editItem && (
          filtered.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
              {filtered.map(p => (
                <div 
                  className="card flex flex-col gap-2" 
                  key={p._id}
                  style={{
                    border: selectedIds.includes(p._id) ? '2px solid #3b82f6' : undefined,
                    background: selectedIds.includes(p._id) ? 'rgba(59, 130, 246, 0.1)' : undefined
                  }}
                >
                  {/* Checkbox and Header */}
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(p._id)}
                      onChange={() => toggleSelect(p._id)}
                      style={{cursor:'pointer',width:'18px',height:'18px'}}
                    />
                    <div className="flex justify-between items-center gap-2" style={{flex:1}}>
                      <h3 className="m-0">{p.name}</h3>
                      <span className="badge">{p.planType}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2" style={{paddingLeft:'1.75rem'}}>
                    <strong>{formatPrice(p)}</strong>
                    {p.recommended && <span className="badge" style={{background:'#f59e0b'}}>⭐ Recommended</span>}
                    <span className="badge">{p.published ? 'Published' : 'Draft'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1" style={{paddingLeft:'1.75rem'}}>
                    <button className="btn-secondary" onClick={() => { setEditItem(p); setShowForm(false); }}>
                      Edit
                    </button>
                    <button className="btn-secondary" onClick={() => toggleField(p, 'recommended')}>
                      {p.recommended ? 'Unmark' : 'Recommend'}
                    </button>
                    <button className="btn-secondary" onClick={() => toggleField(p, 'published')}>
                      {p.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="btn-secondary text-red-500 border-red-500" onClick={() => handleDelete(p._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card mt-6 text-center p-6">
              <h3>
                {statusFilter !== 'all' || planTypeFilter !== 'all' || q.trim()
                  ? 'No Pricing Plans Found'
                  : 'No Pricing Plans Yet'
                }
              </h3>
              <p className="opacity-70">
                {statusFilter !== 'all' || planTypeFilter !== 'all' || q.trim()
                  ? 'Try changing the filters or search term.'
                  : 'Create your first pricing plan.'
                }
              </p>
              <button className="btn mt-3" onClick={() => { setShowForm(true); setEditItem(null); }}>
                {statusFilter !== 'all' || planTypeFilter !== 'all' || q.trim()
                  ? 'Create Plan'
                  : 'Create First Plan'
                }
              </button>
            </div>
          )
        )}

        {showForm && (
          <PlanForm
            initial={null}
            onCancel={() => setShowForm(false)}
            onSave={handleCreate}
          />
        )}

        {editItem && (
          <PlanForm
            initial={editItem}
            onCancel={() => setEditItem(null)}
            onSave={payload => handleUpdate(editItem._id, payload)}
          />
        )}
      </main>
    </div>
  );
}