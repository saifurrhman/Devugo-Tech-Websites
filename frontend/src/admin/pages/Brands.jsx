import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { BrandAPI, UploadAPI } from '../../lib/api';

export default function Brands() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create Form
    const [form, setForm] = useState({ name: '', logo: '', url: '', isActive: true });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Edit State
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', logo: '', url: '', isActive: true });

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        try {
            const data = await BrandAPI.list();
            setItems(data || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    // --- Create Handlers ---
    function onChange(e) {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    }

    async function onUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await UploadAPI.uploadSingle(file);
            // Support both structures (nested data or direct url)
            const url = res.data?.url || res.url;

            if (url) {
                setForm(f => ({ ...f, logo: url }));
            } else {
                console.warn('Upload response missing URL:', res);
                if (res.message) alert('Upload issue: ' + res.message);
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed: ' + (err.message || 'Unknown error'));
        }
        setUploading(false);
    }

    async function onCreate(e) {
        e.preventDefault();
        if (!form.name || !form.logo) return alert('Name and Logo are required');

        setSaving(true);
        try {
            await BrandAPI.create(form);
            setForm({ name: '', logo: '', url: '', isActive: true });
            await load();
        } catch (e) {
            console.error('Create error:', e);
            // Alert detailed error if available
            const msg = e.response?.data?.message || e.message || 'Unknown error';
            alert('Failed to create brand: ' + msg);
        }
        setSaving(false);
    }

    // --- Edit Handlers ---
    function startEdit(item) {
        setEditId(item._id);
        setEditForm({
            name: item.name,
            logo: item.logo,
            url: item.url || '',
            isActive: item.isActive
        });
    }

    function cancelEdit() {
        setEditId(null);
    }

    async function onEditUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Use a separate loading state or just blocking? blocking for simplicity
        try {
            const res = await UploadAPI.uploadSingle(file);
            const url = res.data?.url || res.url;

            if (url) {
                setEditForm(f => ({ ...f, logo: url }));
            }
        } catch (err) {
            alert('Upload failed: ' + err.message);
        }
    }

    async function saveEdit() {
        try {
            await BrandAPI.update(editId, editForm);
            setEditId(null);
            await load();
        } catch (e) {
            console.error(e);
            alert('Failed to update brand');
        }
    }

    async function onDelete(id) {
        if (!window.confirm('Delete this brand?')) return;
        try {
            await BrandAPI.remove(id);
            await load();
        } catch (e) {
            console.error(e);
            alert('Failed to delete');
        }
    }

    async function onToggle(item) {
        try {
            await BrandAPI.update(item._id, { isActive: !item.isActive });
            load();
        } catch (e) { console.error(e); }
    }

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content">
                <AdminTopbar />
                <h1>Brands & Companies</h1>
                <p className="sub">Manage logos displayed on the homepage marquee</p>

                {/* Create Card */}
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <strong>Add New Brand</strong>
                    {/* Responsive Form Layout */}
                    <form onSubmit={onCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>

                        {/* Row 1: Name and Logo */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 500 }}>Brand Name *</span>
                                <input className="form-field" name="name" value={form.name} onChange={onChange} placeholder="e.g. Acme Corp" required style={{ width: '100%' }} />
                            </label>

                            <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 500 }}>Logo Image *</span>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {form.logo && <img src={form.logo} alt="preview" style={{ height: '40px', borderRadius: '4px', background: '#eee' }} />}
                                    <input type="file" onChange={onUpload} accept="image/*" style={{ fontSize: '0.9rem', maxWidth: '100%' }} />
                                    {uploading && <span className="muted">Uploading...</span>}
                                </div>
                            </label>
                        </div>

                        {/* Row 2: URL and Active Toggle */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                            <label className="form-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 500 }}>Website URL (Optional)</span>
                                <input className="form-field" name="url" value={form.url} onChange={onChange} placeholder="https://" style={{ width: '100%' }} />
                            </label>

                            <div className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '42px' }}>
                                <span style={{ fontWeight: 500 }}>Active Status</span>
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                                    className={`toggle-btn ${form.isActive ? 'active' : ''}`}
                                    style={{
                                        width: '48px', height: '26px', borderRadius: '999px',
                                        background: form.isActive ? 'linear-gradient(90deg,#3b82f6,#2563eb)' : 'rgba(255,255,255,0.15)',
                                        border: '1px solid rgba(255,255,255,0.2)', position: 'relative',
                                        transition: 'background .2s ease', cursor: 'pointer',
                                        flexShrink: 0
                                    }}
                                >
                                    <span style={{
                                        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                                        left: form.isActive ? '24px' : '4px', width: '18px', height: '18px', borderRadius: '50%',
                                        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)', transition: 'left .2s ease'
                                    }} />
                                </button>
                                <span className="muted" style={{ fontSize: '0.9rem' }}>{form.isActive ? 'Visible' : 'Hidden'}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '0.5rem' }}>
                            <button className="btn" disabled={saving || uploading} style={{ minWidth: '120px' }}>
                                {saving ? 'Saving...' : 'Add Brand'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List Card */}
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <strong>Existing Brands</strong>
                    {loading ? <div className="muted" style={{ marginTop: '1rem' }}>Loading...</div> : (
                        <div className="table-wrapper" style={{ marginTop: '1rem', overflowX: 'auto' }}>
                            <table className="table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>Logo</th>
                                        <th style={{ textAlign: 'left' }}>Name</th>
                                        <th style={{ textAlign: 'left' }}>URL</th>
                                        <th style={{ textAlign: 'center' }}>Active</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item._id}>
                                            {editId === item._id ? (
                                                // Edit Mode
                                                <>
                                                    <td>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
                                                            {editForm.logo && <img src={editForm.logo} alt="edit" style={{ height: '32px', objectFit: 'contain', background: '#333', padding: '2px', borderRadius: '4px' }} />}
                                                            <input type="file" onChange={onEditUpload} accept="image/*" style={{ width: '180px', fontSize: '.8rem' }} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <input className="form-field" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                                    </td>
                                                    <td>
                                                        <input className="form-field" value={editForm.url} onChange={e => setEditForm({ ...editForm, url: e.target.value })} />
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })} />
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button className="btn-sm" onClick={saveEdit}>Save</button>
                                                        <button className="btn-secondary-sm" onClick={cancelEdit} style={{ marginLeft: '.5rem' }}>Cancel</button>
                                                    </td>
                                                </>
                                            ) : (
                                                // View Mode
                                                <>
                                                    <td>
                                                        <img src={item.logo} alt={item.name} style={{ height: '40px', maxWidth: '100px', objectFit: 'contain', background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '4px' }} />
                                                    </td>
                                                    <td>{item.name}</td>
                                                    <td>
                                                        {item.url ? <a href={item.url} target="_blank" rel="noreferrer" className="link">{item.url}</a> : <span className="muted">-</span>}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <div className={`status-badge ${item.isActive ? 'success' : 'neutral'}`} onClick={() => onToggle(item)} style={{ cursor: 'pointer', display: 'inline-block' }}>
                                                            {item.isActive ? 'Active' : 'Inactive'}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button className="btn-icon" onClick={() => startEdit(item)} title="Edit">✏️</button>
                                                        <button className="btn-icon danger" onClick={() => onDelete(item._id)} title="Delete" style={{ marginLeft: '.5rem' }}>🗑️</button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="muted" style={{ textAlign: 'center', padding: '2rem' }}>No brands found. Add one above.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
