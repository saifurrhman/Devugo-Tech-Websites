import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { BlogAPI } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function AdminBlogCreate(){
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    tags: '',
    published: false,
    seoTitle: '',
    seoDescription: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e){
    e.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try{
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage,
        tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
        published: form.published,
      };
      const { post } = await BlogAPI.create(payload);
      setMessage('Post created');
      // Go back to admin blog list
      navigate('/admin/blog');
    }catch(err){
      setError(err.message || 'Failed to create post');
    }finally{
      setSaving(false);
    }
  }

  function onFileChange(e){
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f=>({...f, coverImage: reader.result }));
    reader.readAsDataURL(file);
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content create-post">
        <AdminTopbar />
        <div className="page-bar sticky">
          <div className="breadcrumbs">
            <span>Dashboard</span>
            <span>/</span>
            <span>Blog</span>
            <span>/</span>
            <strong>Create</strong>
          </div>
          <div className="page-actions">
            <button type="button" className="btn-secondary" onClick={()=>navigate('/admin/blog')}>Cancel</button>
            <button type="button" className="btn" onClick={handleSubmit} disabled={saving}>{saving? 'Publishing…' : 'Publish changes'}</button>
          </div>
        </div>

        <h1 className="page-title" style={{marginTop:'.25rem'}}>Create a new post</h1>
        <div className="greeting-card">
          <span>Hello, Admin</span>
        </div>

        {error && (<div className="chip chip-error" style={{marginTop:'.5rem'}}>{error}</div>)}
        {message && (<div className="chip chip-success" style={{marginTop:'.5rem'}}>{message}</div>)}

        <form onSubmit={handleSubmit} style={{marginTop:'1rem', display:'grid', gap:'1rem'}}>
          <section className="section-card">
            <h3>Basic details</h3>
            <div className="form-grid" style={{marginTop:'.75rem'}}>
              <label className="form-label">Post title</label>
              <input className="form-field" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required />
              <div className="hint">A clear, descriptive headline works best (50–70 characters).</div>
            </div>
            <div className="form-grid" style={{marginTop:'.75rem'}}>
              <label className="form-label">Short description</label>
              <input className="form-field" value={form.excerpt} onChange={e=>setForm(f=>({...f,excerpt:e.target.value}))} />
              <div className="hint">1–2 lines to summarize the post. This may appear on the blog list.</div>
            </div>
          </section>

          <section className="section-card">
            <h3>Post cover</h3>
            <div className="uploader" onClick={()=>document.getElementById('file-input').click()}>
              {form.coverImage ? (
                <div className="uploader-has-image">
                  <img src={form.coverImage} alt="cover" className="uploader-preview" />
                  <button type="button" className="uploader-remove" onClick={(e)=>{ e.stopPropagation(); setForm(f=>({...f,coverImage:''})); }}>Remove photo</button>
                  <span className="uploader-badge">900×400</span>
                </div>
              ) : (
                <div className="uploader-empty">
                  <div className="uploader-icon">⬆</div>
                  <div>
                    <strong>Click to upload</strong> or drag and drop
                    <div className="muted">SVG, JPG, PNG, or GIF (min 900×400)</div>
                  </div>
                </div>
              )}
              <input id="file-input" type="file" accept="image/*" onChange={onFileChange} style={{display:'none'}} />
            </div>
          </section>

          <section className="section-card">
            <h3>Content</h3>
            <div className="editor" style={{marginTop:'.5rem'}}>
              <div className="editor-toolbar">
                <button type="button" onClick={()=>document.execCommand('bold',false)}>B</button>
                <button type="button" onClick={()=>document.execCommand('italic',false)}>I</button>
                <button type="button" onClick={()=>document.execCommand('underline',false)}>U</button>
                <button type="button" onClick={()=>document.execCommand('insertUnorderedList',false)}>• List</button>
              </div>
              <textarea rows={10} className="form-field" value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} placeholder="Write something..." />
              <div className="hint">Use short paragraphs, subheadings, and bullets for readability.</div>
            </div>
          </section>

          <section className="section-card">
            <h3>Meta</h3>
            <div className="form-grid">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-field" value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="design, ux, product"/>
              <div className="hint">Separate with commas. Example: design, ux, product</div>
            </div>
            <div className="form-grid" style={{marginTop:'.9rem'}}>
              <label className="form-label">SEO title</label>
              <input className="form-field" value={form.seoTitle} onChange={e=>setForm(f=>({...f,seoTitle:e.target.value}))} placeholder="SEO title"/>
              <div className="hint">Keep it under 60 characters.</div>
            </div>
            <div className="form-grid" style={{marginTop:'.75rem'}}>
              <label className="form-label">SEO description</label>
              <input className="form-field" value={form.seoDescription} onChange={e=>setForm(f=>({...f,seoDescription:e.target.value}))} placeholder="SEO description"/>
              <div className="hint">About 150–160 characters describing the post.</div>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:'.5rem',marginTop:'.75rem'}}>
              <input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} />
              Publish immediately
            </label>
          </section>

          <div className="settings-actions" style={{display:'flex',justifyContent:'flex-end',gap:'.5rem'}}>
            <button type="button" className="btn-secondary" onClick={()=>navigate('/admin/blog')}>Cancel</button>
            <button type="submit" className="btn" disabled={saving}>{saving? 'Publishing...' : 'Publish changes'}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
