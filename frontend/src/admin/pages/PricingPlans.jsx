import React, { useEffect, useMemo, useState } from 'react';
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
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(p => (p.name || '').toLowerCase().includes(term));
  }, [q, items]);

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

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content p-6 w-full overflow-auto">
        <AdminTopbar />

        <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
          <h1 className="m-0">Pricing Plans</h1>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="admin-search" style={{ maxWidth: 280 }}>
              <input
                className="admin-search__input"
                placeholder="Search plans..."
                value={q}
                onChange={e => setQ(e.target.value)}
              />
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
            <span className="badge">Draft: {total - publishedCount}</span>
          </div>
        )}

        {loading && <div className="card mt-4">Loading...</div>}
        {error && <div className="card mt-4 text-red-500">{error}</div>}

        {!loading && !error && !showForm && !editItem && (
          filtered.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
              {filtered.map(p => (
                <div className="card flex flex-col gap-2" key={p._id}>
                  <div className="flex justify-between items-center gap-2">
                    <h3 className="m-0">{p.name}</h3>
                    <span className="badge">{p.planType}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{formatPrice(p)}</strong>
                    {p.recommended && <span className="badge">Recommended</span>}
                    <span className="badge">{p.published ? 'Published' : 'Draft'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1">
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
              <h3>No Pricing Plans Yet</h3>
              <p className="opacity-70">Create your first pricing plan.</p>
              <button className="btn mt-3" onClick={() => { setShowForm(true); setEditItem(null); }}>
                Create First Plan
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
