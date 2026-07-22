import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { CareerAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function CareersList() {
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const typeDropdownRef = useRef(null);
  const { success: notifySuccess, error: notifyError } = useNotification();

  useEffect(() => {
    function handleClickOutside(event) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setTypeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { fetchCareers(); }, []);

  const fetchCareers = async () => {
    setLoading(true); setError('');
    try {
      const data = await CareerAPI.list();
      setCareers(Array.isArray(data) ? data : (data.careers || []));
    } catch (err) {
      setError(err.message || 'Failed to fetch careers');
      notifyError('Failed to fetch careers');
    } finally {
      setLoading(false);
    }
  };

  const types = useMemo(() => {
    const s = new Set(careers.map(c => c.type || 'Full-Time'));
    return ['all', ...Array.from(s)];
  }, [careers]);

  const filtered = useMemo(() => {
    let result = careers;
    if (typeFilter !== 'all') result = result.filter(c => c.type === typeFilter);
    const term = q.trim().toLowerCase();
    if (term) result = result.filter(c =>
      (c.title || '').toLowerCase().includes(term) ||
      (c.department || '').toLowerCase().includes(term) ||
      (c.location || '').toLowerCase().includes(term)
    );
    return result;
  }, [careers, typeFilter, q]);

  const toggleSelect = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(c => c._id));

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await CareerAPI.remove(id);
      notifySuccess('Career deleted successfully');
      fetchCareers();
    } catch (err) {
      notifyError('Failed to delete career');
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} job posting(s)?`)) return;
    try {
      await Promise.all(selectedIds.map(id => CareerAPI.remove(id)));
      notifySuccess(`${selectedIds.length} career(s) deleted`);
      setSelectedIds([]);
      fetchCareers();
    } catch (err) {
      notifyError('Failed to delete selected careers');
    }
  };

  const toggleStatus = async (career) => {
    try {
      await CareerAPI.update(career._id, { isActive: !career.isActive });
      notifySuccess(`Career marked as ${!career.isActive ? 'Active' : 'Inactive'}`);
      fetchCareers();
    } catch (err) {
      notifyError('Failed to update status');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
          <h1>Careers</h1>
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>

            <div className="admin-search" style={{ maxWidth: 280 }}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <input className="admin-search__input" placeholder="Search jobs..." value={q} onChange={e => setQ(e.target.value)} />
            </div>

            <div ref={typeDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                style={{ padding: '.5rem .75rem', borderRadius: '.375rem', border: '1px solid rgba(55,65,81,0.5)', background: 'rgba(31,41,55,0.4)', backdropFilter: 'blur(10px)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.5rem', minWidth: '140px', justifyContent: 'space-between' }}
              >
                <span>{typeFilter === 'all' ? 'All Types' : typeFilter}</span>
                <span style={{ fontSize: '.75rem' }}>▼</span>
              </button>
              {typeDropdownOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + .5rem)', right: 0, minWidth: '180px', padding: '.4rem', zIndex: 1000, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
                  {types.map(t => (
                    <button key={t} onClick={() => { setTypeFilter(t); setTypeDropdownOpen(false); }}
                      style={{ width: '100%', padding: '.6rem .85rem', marginBottom: '.25rem', background: typeFilter === t ? 'rgba(59,130,246,0.3)' : 'transparent', border: typeFilter === t ? '1px solid rgba(59,130,246,0.5)' : '1px solid transparent', borderRadius: '.375rem', color: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '.9rem', fontWeight: typeFilter === t ? '500' : '400' }}>
                      {t === 'all' ? 'All Types' : t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/admin/careers/new" className="btn">Add Job</Link>
          </div>
        </div>

        {!loading && !error && (
          <div className="card" style={{ marginTop: '.75rem', padding: '.5rem 1rem', display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge">Total: {careers.length}</span>
            <span className="badge">Showing: {filtered.length}</span>
            <span className="badge" style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>Active: {careers.filter(c => c.isActive).length}</span>
            {selectedIds.length > 0 && <span className="badge" style={{ background: '#3b82f6' }}>Selected: {selectedIds.length}</span>}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="card" style={{ marginTop: '.75rem', padding: '.5rem 1rem', display: 'flex', gap: '.6rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer', width: '18px', height: '18px' }} />
              <span style={{ fontSize: '.9rem' }}>{selectedIds.length === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}</span>
            </div>
            {selectedIds.length > 0 && (
              <button className="btn-secondary" onClick={handleDeleteSelected} style={{ borderColor: '#ef4444', color: '#ef4444', fontWeight: '500' }}>
                Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        )}

        {loading && <div className="card" style={{ marginTop: '1rem' }}>Loading careers…</div>}
        {error && <div className="card" style={{ marginTop: '1rem', color: '#ef4444' }}>{error}</div>}

        {!loading && !error && (
          filtered.length ? (
            <div className="card" style={{ marginTop: '1rem', padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                    <th style={{ padding: '.75rem 1rem', textAlign: 'left', width: 36 }}>
                      <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                    </th>
                    {['Title', 'Department', 'Location', 'Type', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '.75rem 1rem', textAlign: h === 'Actions' ? 'right' : 'left', fontSize: '.85rem', opacity: .7 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((career, idx) => (
                    <tr key={career._id}
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: selectedIds.includes(career._id) ? 'rgba(59,130,246,0.08)' : 'transparent', transition: 'background .15s' }}
                      onMouseEnter={e => { if (!selectedIds.includes(career._id)) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={e => { if (!selectedIds.includes(career._id)) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '.75rem 1rem' }}>
                        <input type="checkbox" checked={selectedIds.includes(career._id)} onChange={() => toggleSelect(career._id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '.75rem 1rem', fontWeight: 600 }}>{career.title}</td>
                      <td style={{ padding: '.75rem 1rem', opacity: .8 }}>{career.department || '—'}</td>
                      <td style={{ padding: '.75rem 1rem', opacity: .8 }}>{career.location || '—'}</td>
                      <td style={{ padding: '.75rem 1rem' }}><span className="badge">{career.type}</span></td>
                      <td style={{ padding: '.75rem 1rem' }}>
                        <button onClick={() => toggleStatus(career)} className="badge"
                          style={{ cursor: 'pointer', border: 'none', background: career.isActive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: career.isActive ? '#4ade80' : '#f87171' }}>
                          {career.isActive ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '.4rem', justifyContent: 'flex-end' }}>
                          <button className="btn-secondary" onClick={() => navigate(`/admin/careers/${career._id}/applications`)} style={{ borderColor: '#60a5fa', color: '#60a5fa' }}>Applications</button>
                          <button className="btn-secondary" onClick={() => navigate(`/admin/careers/${career._id}`)}>Edit</button>
                          <button className="btn-secondary" onClick={() => handleDelete(career._id)} style={{ borderColor: '#ef4444', color: '#ef4444' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card" style={{ marginTop: '1rem', textAlign: 'center', padding: '2rem' }}>
              <h3 style={{ marginTop: 0 }}>{typeFilter !== 'all' || q.trim() ? 'No Jobs Found' : 'No Job Postings'}</h3>
              <p style={{ opacity: .8, marginTop: '.25rem' }}>{typeFilter !== 'all' || q.trim() ? 'Try changing the filter or search term.' : 'Create your first job posting.'}</p>
              <Link to="/admin/careers/new" className="btn" style={{ marginTop: '.5rem' }}>Add Job</Link>
            </div>
          )
        )}
      </main>
    </div>
  );
}
