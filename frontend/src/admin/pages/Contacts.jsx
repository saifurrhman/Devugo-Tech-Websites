import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ContactAPI } from '../../lib/api';

export default function Contacts(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const res = await ContactAPI.list();
        const arr = Array.isArray(res) ? res : (res.items||[]);
        if(mounted) setItems((arr||[]).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)));
      }catch(err){ if(mounted) setError(err.message||'Failed to load contacts'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  const filtered = useMemo(()=>{
    const term = q.trim().toLowerCase();
    if(!term) return items;
    return items.filter(c => [c.name, c.email, c.subject, c.message, c.phone, c.source]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(term))
    );
  },[items, q]);

  function exportCsv(rows){
    const header = ['Name','Email','Phone','Subject','Message','Source','Date'];
    const lines = [header.join(',')];
    (rows||[]).forEach(c => {
      const vals = [c.name||'', c.email||'', c.phone||'', c.subject||'', c.message||'', c.source||'', c.createdAt? new Date(c.createdAt).toISOString(): ''];
      const escaped = vals.map(v => '"' + String(v).replace(/"/g,'""') + '"');
      lines.push(escaped.join(','));
    });
    // Prepend BOM for Excel compatibility (UTF-8)
    const csvContent = '\ufeff' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  async function exportPdf(rows){
    function loadScript(url){
      return new Promise((resolve, reject)=>{
        const s = document.createElement('script');
        s.src = url; s.async = true;
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    if(!(window.jspdf && window.jspdf.jsPDF)){
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }
    if(!(window.jspdf?.jsPDF?.prototype?.autoTable)){
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js');
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','pt');
    const pad = 32;
    doc.setFont('helvetica','bold');
    doc.setFontSize(16);
    doc.text('Devugo Tech Solutions', pad, 40);
    doc.setFont('helvetica','normal');
    doc.setFontSize(10);
    doc.text('Contacts Export', pad, 58);
    doc.text('Website: devugo.tech', pad, 74);
    doc.text('Email: hello@devugo.tech', pad, 88);
    doc.text('Phone: +92 300 123 4567', pad, 102);
    doc.text('Location: Lahore, Pakistan', pad, 116);
    const body = (rows||[]).map(c=>[
      c.name||'', c.email||'', c.phone||'', c.subject||'', c.message||'', c.source||'', c.createdAt? new Date(c.createdAt).toLocaleString(): ''
    ]);
    const head = [['Name','Email','Phone','Subject','Message','Source','Date']];
    doc.autoTable({ startY: 132, styles:{ fontSize:9, cellPadding:4, overflow:'linebreak' }, head, body, theme:'grid', headStyles:{ fillColor:[248,250,252], textColor:20 }, columnStyles:{ 4: { cellWidth: 180 } } });
    doc.save('contacts_export.pdf');
  }
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem',flexWrap:'wrap'}}>
          <h1>Contacts</h1>
          <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap',alignItems:'center'}}>
            <div className="admin-search" style={{minWidth:'260px'}}>
              <span className="admin-search__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input className="admin-search__input" placeholder="Search contacts…" value={q} onChange={e=>setQ(e.target.value)} />
            </div>
            <button className="btn-secondary" onClick={()=>exportCsv(filtered)}>Export CSV</button>
            <button className="btn-secondary" onClick={()=>exportPdf(filtered)}>Export PDF</button>
          </div>
        </div>

        <div className="card" style={{marginTop:'.75rem', padding:'.5rem 1rem', display:'flex', gap:'.6rem', alignItems:'center', flexWrap:'wrap'}}>
          <span className="badge">Total: {items.length}</span>
          {q && <span className="badge">Filtered: {filtered.length}</span>}
        </div>

        {loading && <div className="card" style={{marginTop:'1rem'}}>Loading…</div>}
        {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}
        {!loading && !error && (
          filtered.length ? (
            <div className="cards-grid two" style={{marginTop:'1rem'}}>
              {filtered.map((c,idx)=>{
                const initials = String(c.name||c.email||'?').trim().slice(0,1).toUpperCase();
                return (
                  <div key={c._id||idx} className="card" style={{display:'grid', gap:'.6rem', padding:'1rem'}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'.6rem'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'.6rem', minWidth:0}}>
                        <div style={{width:42,height:42,borderRadius:'999px',background:'rgba(255,255,255,0.12)',display:'grid',placeItems:'center',fontWeight:900}}>{initials}</div>
                        <div style={{minWidth:0}}>
                          <strong style={{display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.name||'—'}</strong>
                          <small className="muted" style={{display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.email||'—'}</small>
                        </div>
                      </div>
                      <div style={{display:'flex', gap:'.35rem', flexWrap:'wrap'}}>
                        {c.subject && <span className="badge">{c.subject}</span>}
                        {c.phone && <span className="badge" title={c.phone}>Phone</span>}
                        {c.source && <span className="badge" title={c.source}>{c.source}</span>}
                      </div>
                    </div>
                    {c.message && (
                      <p style={{margin:0, color:'var(--admin-text)', opacity:.95, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden'}} title={c.message}>{c.message}</p>
                    )}
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'.6rem', flexWrap:'wrap'}}>
                      <small className="muted">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</small>
                      <div style={{display:'flex', gap:'.4rem'}}>
                        {c.email && <a className="btn-secondary" href={`mailto:${c.email}`} target="_blank" rel="noreferrer">Email</a>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{marginTop:'1rem'}}>No contact submissions yet.</div>
          )
        )}
      </main>
    </div>
  );
}
