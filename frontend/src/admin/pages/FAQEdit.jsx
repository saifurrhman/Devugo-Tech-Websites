import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ClientFaqAPI } from '../../lib/api';

export default function FAQEdit(){
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ question:'', answer:'', category:'', order:0, published:true });

  useEffect(()=>{
    if(isNew) return;
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { item } = await ClientFaqAPI.get(id);
        if(mounted) setForm({
          question: item.question||'',
          answer: item.answer||'',
          category: item.category||'',
          order: item.order || 0,
          published: !!item.published,
        });
      }catch(err){ if(mounted) setError(err.message||'Failed to load'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[id, isNew]);

  async function handleSave(e){
    e?.preventDefault?.();
    setSaving(true); setError(''); setMessage('');
    try{
      const payload = { ...form, order: Number(form.order)||0 };
      if(isNew){ await ClientFaqAPI.create(payload); navigate('/admin/faqs'); }
      else { await ClientFaqAPI.update(id, payload); setMessage('Saved'); }
    }catch(err){ setError(err.message||'Failed to save'); }
    finally{ setSaving(false); }
  }

  async function handleDelete(){
    if(isNew) return;
    if(!window.confirm('Delete this FAQ?')) return;
    try{ await ClientFaqAPI.remove(id); navigate('/admin/faqs'); }
    catch(err){ alert(err.message||'Failed to delete'); }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1>{isNew? 'Add FAQ':'Edit FAQ'}</h1>
          <Link to="/admin/faqs" className="btn-secondary">Back</Link>
        </div>

        {loading ? <div className="card" style={{marginTop:'1rem'}}>Loading…</div> : (
          <form onSubmit={handleSave} className="create-post" style={{marginTop:'.9rem'}}>
            <div className="grid two" style={{alignItems:'start'}}>
              <section className="section-card">
                <h3>FAQ</h3>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Question</label>
                  <input className="form-field ux-input" value={form.question} onChange={e=>setForm(f=>({...f,question:e.target.value}))} required />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Answer</label>
                  <textarea rows={6} className="form-field ux-input" value={form.answer} onChange={e=>setForm(f=>({...f,answer:e.target.value}))} required />
                </div>
              </section>

              <aside className="section-card">
                <h3>Settings</h3>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Category</label>
                  <input className="form-field ux-input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="General, Pricing, Services…" />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Order</label>
                  <input type="number" className="form-field ux-input" value={form.order} onChange={e=>setForm(f=>({...f,order:e.target.value}))} />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Published</label>
                  <input type="checkbox" checked={!!form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} />
                </div>
              </aside>
            </div>

            {error && <div className="card" style={{marginTop:'1rem', color:'#ef4444'}}>{error}</div>}
            {message && <div className="card" style={{marginTop:'1rem', color:'#16a34a'}}>{message}</div>}

            <div className="bottom-actions">
              <div className="container flex flex-row items-center justify-end gap-3">
                <Link to="/admin/faqs" className="btn-cancel">Cancel</Link>
                {!isNew && <button type="button" className="btn-secondary" onClick={handleDelete} style={{borderColor:'#ef4444', color:'#ef4444'}}>Delete</button>}
                <button type="submit" className="btn-save" disabled={saving}>{saving? 'Saving…':'Save'}</button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
