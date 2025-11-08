import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { BlogAPI, UploadAPI, BlogCategoryAPI } from '../../lib/api';

export default function BlogEdit(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [shareToSocial, setShareToSocial] = useState(false);
  const editorRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    featuredImage: '',
    galleryImages: [],
    categories: [],
    tags: '',
    published: false,
    publishedAt: null,
  });
  const [categories, setCategories] = useState([]);

  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true); setError('');
      try{
        const cats = await BlogCategoryAPI.list().catch(()=>({items:[]}));
        const { post } = await BlogAPI.get(id);
        if(!mounted) return;
        setForm({
          title: post.title || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          coverImage: post.coverImage || '',
          featuredImage: post.featuredImage || '',
          galleryImages: post.galleryImages || [],
          categories: (post.categories||[]).map(c=>c._id||c),
          tags: (post.tags||[]).join(', '),
          published: !!post.published,
          publishedAt: post.publishedAt || null,
        });
        setCategories(cats.items||[]);
      }catch(err){
        if(mounted) setError(err.message || 'Failed to load post');
      }finally{
        if(mounted) setLoading(false);
      }
    })();
    return ()=>{ mounted = false };
  },[id]);

  function exec(cmd, val){
    const el = editorRef.current; if(!el) return;
    if (!el.innerHTML || el.innerHTML === '' || el.innerHTML === '<br>'){
      el.innerHTML = '<p><br></p>';
    }
    const sel = window.getSelection && window.getSelection();
    if (sel && (!sel.anchorNode || !el.contains(sel.anchorNode))){
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    el.focus();
    document.execCommand(cmd,false,val);
    setForm(f=>({...f,content:el.innerHTML}));
  }

  function setBlock(tag){ const t = String(tag||'').toUpperCase(); exec('formatBlock', t); }
  function insertLink(){ const url = window.prompt('Enter URL (https://...)'); if(!url) return; exec('createLink', url); }
  function clearFormats(){ exec('removeFormat'); }

  // ✅ FIXED: Upload image using actual file upload
  async function uploadAndSet(field){
    const input = document.createElement('input'); 
    input.type = 'file'; 
    input.accept = 'image/*';
    
    input.onchange = async (ev) => { 
      const file = ev.target.files?.[0]; 
      if (!file) return;
      
      setUploading(true);
      setMessage('Uploading image...');
      
      try {
        // ✅ Use uploadSingle instead of base64
        const { data } = await UploadAPI.uploadSingle(file);
        
        if (data && data.url) {
          setForm(f => ({ ...f, [field]: data.url }));
          setMessage('Image uploaded successfully!');
          setTimeout(() => setMessage(''), 2000);
        } else {
          throw new Error('Upload failed - no URL returned');
        }
      } catch (err) {
        setError(err.message || 'Image upload failed');
        setTimeout(() => setError(''), 3000);
      } finally {
        setUploading(false);
      }
    };
    
    input.click();
  }

  // ✅ FIXED: Insert image to content editor
  async function uploadAndInsertToContent(){
    const input = document.createElement('input'); 
    input.type = 'file'; 
    input.accept = 'image/*';
    
    input.onchange = async (ev) => { 
      const file = ev.target.files?.[0]; 
      if (!file) return;
      
      setUploading(true);
      setMessage('Uploading image...');
      
      try {
        // ✅ Use uploadSingle instead of base64
        const { data } = await UploadAPI.uploadSingle(file);
        
        if (data && data.url) {
          const el = editorRef.current; 
          if (el) { 
            el.focus(); 
            document.execCommand('insertHTML', false, `<img src="${data.url}" alt="" style="max-width:100%;height:auto;" />`); 
            setForm(f => ({ ...f, content: el.innerHTML })); 
          }
          setMessage('Image inserted successfully!');
          setTimeout(() => setMessage(''), 2000);
        } else {
          throw new Error('Upload failed - no URL returned');
        }
      } catch (err) {
        setError(err.message || 'Image upload failed');
        setTimeout(() => setError(''), 3000);
      } finally {
        setUploading(false);
      }
    };
    
    input.click();
  }

  // ✅ FIXED: Upload gallery image
  async function uploadGalleryImage() {
    const input = document.createElement('input'); 
    input.type = 'file'; 
    input.accept = 'image/*';
    
    input.onchange = async (ev) => { 
      const file = ev.target.files?.[0]; 
      if (!file) return;
      
      setUploading(true);
      setMessage('Uploading gallery image...');
      
      try {
        // ✅ Use uploadSingle instead of base64
        const { data } = await UploadAPI.uploadSingle(file);
        
        if (data && data.url) {
          setForm(f => ({ ...f, galleryImages: [...f.galleryImages, data.url] }));
          setMessage('Gallery image uploaded!');
          setTimeout(() => setMessage(''), 2000);
        } else {
          throw new Error('Upload failed - no URL returned');
        }
      } catch (err) {
        setError(err.message || 'Gallery image upload failed');
        setTimeout(() => setError(''), 3000);
      } finally {
        setUploading(false);
      }
    };
    
    input.click();
  }

  async function handleSave(e){
    e?.preventDefault?.();
    setSaving(true); setError(''); setMessage('');
    try{
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage,
        featuredImage: form.featuredImage,
        galleryImages: form.galleryImages,
        categories: form.categories,
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

  // ✅ FIXED: Cover image upload
  async function onFileChange(e){
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setMessage('Uploading cover image...');
    
    try {
      // ✅ Use uploadSingle instead of base64
      const { data } = await UploadAPI.uploadSingle(file);
      
      if (data && data.url) {
        setForm(f => ({ ...f, coverImage: data.url }));
        setMessage('Cover image uploaded!');
        setTimeout(() => setMessage(''), 2000);
      } else {
        throw new Error('Upload failed - no URL returned');
      }
    } catch (err) {
      setError(err.message || 'Cover image upload failed');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-content create-post">
          <AdminTopbar />
          <div className="card" style={{marginTop:'1rem'}}>Loading…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content create-post">
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
        {uploading && (<div className="chip" style={{marginTop:'.5rem'}}>Uploading...</div>)}

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
            <h3>Featured image</h3>
            <div className="uploader" onClick={()=>uploadAndSet('featuredImage')}>
              {form.featuredImage ? (
                <div className="uploader-has-image">
                  <img src={form.featuredImage} alt="featured" className="uploader-preview" />
                  <button type="button" className="uploader-remove" onClick={(e)=>{ e.stopPropagation(); setForm(f=>({...f,featuredImage:''})); }}>Remove photo</button>
                  <span className="uploader-badge">1200×630</span>
                </div>
              ) : (
                <div className="uploader-empty">
                  <div className="uploader-icon">⬆</div>
                  <div>
                    <strong>Click to upload</strong> or drag and drop
                    <div className="muted">SVG, JPG, PNG, or GIF (recommended 1200×630)</div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="section-card">
            <h3>Gallery</h3>
            <div style={{display:'flex',flexWrap:'wrap',gap:'.6rem'}}>
              {form.galleryImages.map((g,i)=>(
                <div key={i} className="card" style={{padding:'.25rem',borderRadius:'12px',position:'relative'}}>
                  <img src={g} alt="gallery" style={{width:160,height:100,objectFit:'cover',borderRadius:'8px'}} />
                  <button type="button" className="uploader-remove" onClick={()=>setForm(f=>({...f,galleryImages:f.galleryImages.filter((_,x)=>x!==i)}))} style={{left:6,bottom:6}}>Remove</button>
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={uploadGalleryImage} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Add image'}
              </button>
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
                <button type="button" onClick={()=>setBlock('p')}>P</button>
                <button type="button" onClick={()=>setBlock('h1')}>H1</button>
                <button type="button" onClick={()=>setBlock('h2')}>H2</button>
                <button type="button" onClick={()=>setBlock('h3')}>H3</button>
                <button type="button" onClick={()=>setBlock('h4')}>H4</button>
                <button type="button" onClick={()=>setBlock('h5')}>H5</button>
                <button type="button" onClick={()=>exec('bold')}>B</button>
                <button type="button" onClick={()=>exec('italic')}>I</button>
                <button type="button" onClick={()=>exec('underline')}>U</button>
                <button type="button" onClick={()=>exec('insertOrderedList')}>1.</button>
                <button type="button" onClick={()=>exec('insertUnorderedList')}>•</button>
                <button type="button" onClick={()=>setBlock('blockquote')}>❝</button>
                <button type="button" onClick={()=>setBlock('pre')}>{'{ }'}</button>
                <button type="button" onClick={()=>exec('justifyLeft')}>⟸</button>
                <button type="button" onClick={()=>exec('justifyCenter')}>⟺</button>
                <button type="button" onClick={()=>exec('justifyRight')}>⟹</button>
                <button type="button" onClick={insertLink}>Link</button>
                <button type="button" onClick={()=>exec('unlink')}>Unlink</button>
                <button type="button" onClick={()=>exec('undo')}>Undo</button>
                <button type="button" onClick={()=>exec('redo')}>Redo</button>
                <button type="button" onClick={clearFormats}>Clear</button>
                <button type="button" onClick={uploadAndInsertToContent} disabled={uploading}>
                  {uploading ? 'Uploading...' : '+ Image'}
                </button>
              </div>
              <div
                ref={editorRef}
                className="form-field"
                style={{minHeight:180}}
                contentEditable
                suppressContentEditableWarning
                onInput={(e)=>{
                  const html = e.currentTarget?.innerHTML ?? e.target?.innerHTML ?? editorRef.current?.innerHTML ?? '';
                  setForm(f=>({...f, content: html }));
                }}
                dangerouslySetInnerHTML={{ __html: form.content || '' }}
                aria-label="Post content editor"
              />
              <div className="hint">Use headings, lists, and emphasis to format your post.</div>
            </div>
          </section>

          <section className="section-card">
            <h3>Categories</h3>
            <div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>
              {categories.map(cat=>{
                const checked = form.categories.includes(cat._id);
                return (
                  <label key={cat._id} className="chip" style={{cursor:'pointer'}}>
                    <input type="checkbox" checked={checked} onChange={(e)=>{
                      const v=e.target.checked; setForm(f=>({ ...f, categories: v ? [...f.categories, cat._id] : f.categories.filter(id=>id!==cat._id) }));
                    }} style={{marginRight:'.4rem'}} />
                    {cat.name}
                  </label>
                );
              })}
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
              <button type="button" className="btn-secondary" onClick={handleSave} disabled={saving || uploading}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button type="submit" className="btn" disabled={saving || uploading}>
                {saving ? 'Saving…' : 'Save & Stay'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleDelete} style={{borderColor:'#ef4444',color:'#ef4444'}}>Delete</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}