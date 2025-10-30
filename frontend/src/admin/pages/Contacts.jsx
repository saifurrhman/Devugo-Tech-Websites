import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ContactAPI } from '../../lib/api';

// Professional SVG Icons
const IconPhone = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMail = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconGlobe = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const IconFileText = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDownload = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconUser = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const IconTag = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="7" cy="7" r="2" fill="currentColor" />
  </svg>
);

const IconClock = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const IconSearch = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.5" />
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const IconFilter = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Contacts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filterSource, setFilterSource] = useState('all');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await ContactAPI.list();
        const arr = Array.isArray(res) ? res : (res.items || []);
        if (mounted) setItems((arr || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) { if (mounted) setError(err.message || 'Failed to load contacts'); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let result = items;

    if (term) {
      result = result.filter(c => [c.name, c.email, c.subject, c.message, c.phone, c.source]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
      );
    }

    if (filterSource !== 'all') {
      result = result.filter(c => c.source === filterSource);
    }

    return result;
  }, [items, q, filterSource]);

  const sources = useMemo(() => {
    const sourceSet = new Set(items.map(c => c.source).filter(Boolean));
    return ['all', ...Array.from(sourceSet)];
  }, [items]);

  function exportCsv(rows) {
    const header = ['Name', 'Email', 'Phone', 'Subject', 'Message', 'Source', 'Date'];
    const lines = [header.join(',')];
    (rows || []).forEach(c => {
      const vals = [c.name || '', c.email || '', c.phone || '', c.subject || '', c.message || '', c.source || '', c.createdAt ? new Date(c.createdAt).toISOString() : ''];
      const escaped = vals.map(v => '"' + String(v).replace(/"/g, '""') + '"');
      lines.push(escaped.join(','));
    });
    const csvContent = '\ufeff' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPdf(rows) {
    function loadScript(url) {
      return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url; s.async = true;
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    if (!(window.jspdf && window.jspdf.jsPDF)) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }
    if (!(window.jspdf?.jsPDF?.prototype?.autoTable)) {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js');
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt');
    const pad = 40;

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, doc.internal.pageSize.width, 140, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Devugo Tech Solutions', pad, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Contacts Export Report', pad, 75);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pad, 95);
    doc.text('Website: devugo.tech', pad, 110);
    doc.text('Email: hello@devugo.tech  |  Phone: +92 300 123 4567', pad, 125);

    doc.setTextColor(0, 0, 0);

    const body = (rows || []).map(c => [
      c.name || '',
      c.email || '',
      c.phone || '',
      c.subject || '',
      (c.message || '').substring(0, 100) + ((c.message || '').length > 100 ? '...' : ''),
      c.source || '',
      c.createdAt ? new Date(c.createdAt).toLocaleString() : ''
    ]);
    const head = [['Name', 'Email', 'Phone', 'Subject', 'Message', 'Source', 'Date']];

    doc.autoTable({
      startY: 160,
      styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak', textColor: 50 },
      head,
      body,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 4: { cellWidth: 150 } },
      margin: { left: pad, right: pad }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 20, { align: 'center' });
    }

    doc.save(`contacts_export_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  return (
    <div className="admin-layout min-h-screen">
      <AdminSidebar />
      <main className="admin-content w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <AdminTopbar />

        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-1 sm:mb-2"
                style={{
                  
                  color:'#ffffff'
                }}>
                Contacts
              </h1>
              <p className="text-xs sm:text-sm font-medium" style={{ color: '#ffffff' }}>
                Manage and export your contact submissions
              </p>
            </div>

            {/* Export buttons */}
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                className="btn-secondary flex-1 sm:flex-none text-xs sm:text-sm px-4 py-2.5 flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:scale-105"
                onClick={() => exportCsv(filtered)}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1.5px solid rgba(59, 130, 246, 0.3)',
                  color: '#ffffff',
                  borderRadius: '10px'
                }}
              >
                <IconFileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Export CSV</span>
              </button>
              <button
                className="btn-secondary flex-1 sm:flex-none text-xs sm:text-sm px-4 py-2.5 flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:scale-105"
                onClick={() => exportPdf(filtered)}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1.5px solid rgba(59, 130, 246, 0.3)',
                  color: '#ffffff',
                  borderRadius: '10px'
                }}
              >
                <IconDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="card p-3 sm:p-4 mb-4 sm:mb-6" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
        }}>
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#ffffff' }} />
              <input
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium rounded-xl transition-all duration-200"
                placeholder="Search by name, email, subject, message..."
                value={q}
                onChange={e => setQ(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              />
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-2">
              <IconFilter className="w-5 h-5" style={{ color: '#ffffff' }} />
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  outline: 'none',
                  minWidth: '150px'
                }}
              >
                {sources.map(src => (
                  <option key={src} value={src} style={{ background: '#0f172a' }}>
                    {src === 'all' ? 'All Sources' : src}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Bar - Glass Morphism White Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="card p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
          }}>
            <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#ffffff' }}>{items.length}</div>
            <div className="text-xs sm:text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Total Contacts</div>
          </div>

          <div className="card p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
          }}>
            <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#ffffff' }}>{filtered.length}</div>
            <div className="text-xs sm:text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Filtered</div>
          </div>

          <div className="card p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
          }}>
            <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#ffffff' }}>{items.filter(c => c.email).length}</div>
            <div className="text-xs sm:text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>With Email</div>
          </div>

          <div className="card p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105" style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
          }}>
            <div className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#ffffff' }}>{items.filter(c => c.phone).length}</div>
            <div className="text-xs sm:text-sm font-semibold" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>With Phone</div>
          </div>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="card p-6 text-center" style={{ borderRadius: '16px' }}>
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-sm font-semibold" style={{ color: '#9ca3af' }}>Loading contacts...</div>
          </div>
        )}

        {error && (
          <div className="card p-4 sm:p-6 text-center font-semibold" style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            color: '#ef4444'
          }}>
            {error}
          </div>
        )}

        {/* Contacts Grid - Glass Morphism White Cards */}
        {!loading && !error && (
          filtered.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pb-6">
              {filtered.map((c, idx) => {
                const initials = String(c.name || c.email || '?').trim().slice(0, 1).toUpperCase();

                return (
                  <div
                    key={c._id || idx}
                    className="card p-4 sm:p-5 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1.5px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '20px',
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
                    }}
                  >
                    {/* Header with Avatar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Glass Avatar */}
                        <div
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-base sm:text-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            color: '#FFFFFF',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 24px rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <strong className="block text-base sm:text-lg truncate font-black" style={{ color: '#ffffff' }}>
                            {c.name || 'Unknown'}
                          </strong>
                          <small className="flex items-center gap-1.5 text-xs sm:text-sm truncate font-semibold mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                            <IconMail className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{c.email || 'No email'}</span>
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Badges Row - Glass Badges */}
                    <div className="flex gap-2 flex-wrap">
                      {c.subject && (
                        <span className="badge text-xs px-3 py-1.5 flex items-center gap-1.5 font-bold rounded-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '1.5px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            backdropFilter: 'blur(8px)'
                          }}>
                          <IconTag className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{c.subject}</span>
                        </span>
                      )}
                      {c.phone && (
                        <span className="badge text-xs px-3 py-1.5 flex items-center gap-1.5 font-bold rounded-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '1.5px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            backdropFilter: 'blur(8px)'
                          }}>
                          <IconPhone className="w-3.5 h-3.5" />
                          <span>Phone</span>
                        </span>
                      )}
                      {c.source && (
                        <span className="badge text-xs px-3 py-1.5 flex items-center gap-1.5 font-bold rounded-lg"
                          style={{
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '1.5px solid rgba(255, 255, 255, 0.2)',
                            color: '#ffffff',
                            backdropFilter: 'blur(8px)'
                          }}>
                          <IconGlobe className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[100px]">{c.source}</span>
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    {c.message && (
                      <div className="p-3 rounded-xl" style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(8px)'
                      }}>
                        <p
                          className="text-xs sm:text-sm m-0 leading-relaxed"
                          style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                          title={c.message}
                        >
                          {c.message}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 pt-3"
                      style={{ borderTop: '1.5px solid rgba(255, 255, 255, 0.1)' }}>
                      <small className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        <IconClock className="w-3.5 h-3.5" />
                        <span>
                          {c.createdAt ? new Date(c.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </span>
                      </small>

                      <div className="flex gap-2">
                        {c.email && (
                          <a
                            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-bold rounded-lg transition-all duration-200 hover:scale-105"
                            href={`mailto:${c.email}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              background: 'rgba(255, 255, 255, 0.12)',
                              border: '1.5px solid rgba(255, 255, 255, 0.2)',
                              color: '#ffffff',
                              backdropFilter: 'blur(8px)'
                            }}
                          >
                            <IconMail className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </a>
                        )}
                        {c.phone && (
                          <a
                            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-bold rounded-lg transition-all duration-200 hover:scale-105"
                            href={`tel:${c.phone}`}
                            style={{
                              background: 'rgba(255, 255, 255, 0.12)',
                              border: '1.5px solid rgba(255, 255, 255, 0.2)',
                              color: '#ffffff',
                              backdropFilter: 'blur(8px)'
                            }}
                          >
                            <IconPhone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-8 sm:p-12 text-center" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              backdropFilter: 'blur(12px)'
            }}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)'
                  }}>
                  <IconUser className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl mb-2 font-black" style={{ color: '#ffffff' }}>
                    {q || filterSource !== 'all' ? 'No matches found' : 'No contact submissions yet'}
                  </p>
                  <p className="text-sm sm:text-base font-semibold" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {q || filterSource !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Contact submissions will appear here when users fill out your contact form'
                    }
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}