import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { BlogAPI, UploadAPI } from '../../lib/api';

export default function BlogEdit(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [shareToSocial, setShareToSocial] = useState(false);
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    tags: '',
    published: false,
    publishedAt: null,
  });

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const { post } = await BlogAPI.get(id);
        if(!mounted) return;
        setForm({
          title: post.title || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          coverImage: post.coverImage || '',
          tags: (post.tags||[]).join(', '),
          published: !!post.published,
          publishedAt: post.publishedAt || null,
        });
      }catch(err){
        if(mounted) setError(err.message || 'Failed to load post');
      }finally{
        if(mounted) setLoading(false);
      }
    })();
    return ()=>{ mounted = false };
  },[id]);

  async function handleSave(e){
    e?.preventDefault?.();
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
      const { post } = await BlogAPI.update(id, payload);
      setMessage('Changes saved');
      setForm(f=>({...f, publishedAt: post.publishedAt || f.publishedAt }));
    }catch(err){
      setError(err.message || 'Failed to save changes');
    }finally{
      setSaving(false);
    }
  }

  async function handleDelete(){
    if(!window.confirm('Delete this post?')) return;
    setSaving(true); setError(''); setMessage('');
    try{
      await BlogAPI.remove(id);
      navigate('/admin/blog');
    }catch(err){
      setError(err.message || 'Failed to delete post');
    }finally{
      setSaving(false);
    }
  }

  function onFileChange(e){
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try{
        const dataUrl = reader.result;
        const { url } = await UploadAPI.image(dataUrl, file.name);
        setForm(f=>({...f, coverImage: url }));
        setMessage('Cover image uploaded');
      }catch(err){
        setError(err.message || 'Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-content">
          <AdminTopbar />
          <div className="card" style={{marginTop:'1rem'}}>Loading…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <div className="page-bar sticky">
          <div className="breadcrumbs" aria-label="Breadcrumbs">
            <Link to="/admin">Dashboard</Link>
            <span>/</span>
            <Link to="/admin/blog">Blog</Link>
            <span>/</span>
            <strong className="active" aria-current="page">Edit</strong>
          </div>
        </div>

        <h1 className="page-title" style={{marginTop:'.25rem'}}>Edit Post</h1>

        {error && (<div className="chip chip-error" style={{marginTop:'.5rem'}}>{error}</div>)}
        {message && (<div className="chip chip-success" style={{marginTop:'.5rem'}}>{message}</div>)}

        <form onSubmit={handleSave} style={{marginTop:'1rem', display:'grid', gap:'1rem'}}>
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
            <div className="uploader" onClick={()=>document.getElementById('file-input-edit').click()}>
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
              <input id="file-input-edit" type="file" accept="image/*" onChange={onFileChange} style={{display:'none'}} />
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
                <button type="button" onClick={()=>document.execCommand('formatBlock', false, 'h2')}>H2</button>
                <button type="button" onClick={()=>document.execCommand('formatBlock', false, 'h3')}>H3</button>
              </div>
              <div
                ref={editorRef}
                className="form-field"
                style={{minHeight:180}}
                contentEditable
                suppressContentEditableWarning
                onInput={(e)=> setForm(f=>({...f, content: e.currentTarget.innerHTML}))}
                dangerouslySetInnerHTML={{ __html: form.content }}
                aria-label="Post content editor"
              />
              <div className="hint">Use headings, lists, and emphasis to format your post.</div>
            </div>
          </section>

          <section className="section-card">
            <h3>Meta</h3>
            <div className="form-grid">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-field" value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="design, ux, product"/>
              <div className="hint">Separate with commas. Example: design, ux, product</div>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:'.5rem',marginTop:'.75rem'}}>
              <input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} />
              Publish
              {form.publishedAt && <small className="muted" style={{marginLeft:'.5rem'}}>(since {new Date(form.publishedAt).toLocaleString()})</small>}
            </label>
            <label style={{display:'flex',alignItems:'center',gap:'.5rem',marginTop:'.5rem'}}>
              <input type="checkbox" checked={shareToSocial} onChange={e=>setShareToSocial(e.target.checked)} />
              Also share on social media
            </label>
          </section>

          <div className="settings-actions" style={{display:'flex',justifyContent:'space-between',gap:'.5rem'}}>
            <div>
              <button type="button" className="btn-secondary" onClick={()=>navigate('/admin/blog')}>Back</button>
            </div>
            <div style={{display:'flex', gap:'.5rem'}}>
              <button type="button" className="btn-secondary" onClick={handleSave} disabled={saving}>{saving? 'Saving…' : 'Save changes'}</button>
              <button type="submit" className="btn" disabled={saving}>{saving? 'Saving…' : 'Save & Stay'}</button>
              <button type="button" className="btn-secondary" onClick={handleDelete} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
