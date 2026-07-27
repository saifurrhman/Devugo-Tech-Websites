import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ClientFaqAPI } from '../../lib/api';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingState from '../components/LoadingState';
import Spinner from '../../components/Spinner';

export default function FAQEdit(){
  const confirm = useConfirm();
  const notify = useNotification();
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ question:'', answer:'', category:'', order:0, published:true });

  useEffect(()=>{
    if(isNew) return;
    let mounted = true;
    (async()=>{
      setLoading(true);
      try{
        const { item } = await ClientFaqAPI.get(id);
        if(mounted) setForm({
          question: item.question||'',
          answer: item.answer||'',
          category: item.category||'',
          order: item.order || 0,
          published: !!item.published,
        });
      }catch(err){ if(mounted) notify.error(err.message||'Failed to load'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[id, isNew]);

  async function handleSave(e){
    e?.preventDefault?.();
    setSaving(true);
    try{
      const payload = { ...form, order: Number(form.order)||0 };
      if(isNew){ await ClientFaqAPI.create(payload); notify.success('FAQ created successfully.'); navigate('/admin/faqs'); }
      else { await ClientFaqAPI.update(id, payload); notify.success('FAQ saved successfully.'); }
    }catch(err){ notify.error(err.message||'Failed to save FAQ. Please try again.'); }
    finally{ setSaving(false); }
  }

  async function handleDelete(){
    if(isNew) return;
    await confirm.show({
      title: 'Delete FAQ',
      message: 'Delete this FAQ?',
      variant: 'danger',
      confirmText: 'Delete',
      action: async () => {
        await ClientFaqAPI.remove(id); 
        notify.success('FAQ deleted'); 
        navigate('/admin/faqs'); 
      }
    });
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="toolbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.6rem'}}>
          <h1>{isNew? 'Add FAQ':'Edit FAQ'}</h1>
        
        </div>

        {loading ? <LoadingState message="Loading FAQ details..." /> : (
          <form onSubmit={handleSave} className="create-post" style={{marginTop:'.9rem'}}>
            <div className="grid two" style={{alignItems:'start'}}>
              <section className="section-card">
                <h3>FAQ</h3>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Question</label>
                  <input className="form-field ux-input" value={form.question} onChange={e=>setForm(f=>({...f,question:e.target.value}))} placeholder="What is your question?" required />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Answer</label>
                  <textarea rows={6} className="form-field ux-input" value={form.answer} onChange={e=>setForm(f=>({...f,answer:e.target.value}))} placeholder="Enter detailed answer here..." required />
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
                  <input type="number" className="form-field ux-input" value={form.order} onChange={e=>setForm(f=>({...f,order:e.target.value}))} placeholder="0" />
                </div>
                <div className="form-grid" style={{marginTop:'.6rem'}}>
                  <label className="form-label">Published</label>
                  <input type="checkbox" checked={!!form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} />
                </div>
              </aside>
            </div>

          <div className="admin-sticky-footer">
            <button type="button" className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm text-gray-300" onClick={()=>navigate('/admin/faqs')}>Cancel</button>
            {!isNew && <button type="button" className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors text-sm" onClick={handleDelete}>Delete</button>}
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}>
              {saving && <Spinner size="sm" />}
              <span>{saving? 'Saving...':'Save'}</span>
            </button>
          </div>
          </form>
        )}
      </main>
    </div>
  );
}