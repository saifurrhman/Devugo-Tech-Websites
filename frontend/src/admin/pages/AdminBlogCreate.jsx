import React, { useEffect, useRef, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { BlogAPI, UploadAPI, BlogCategoryAPI } from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminBlogCreate(){
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
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
    seoTitle: '',
    seoDescription: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [shareToSocial, setShareToSocial] = useState(false);
  const editorRef = useRef(null);
  const [categories, setCategories] = useState([]);

  useEffect(()=>{
    (async()=>{
      try{ const { items } = await BlogCategoryAPI.list(); setCategories(items||[]); }catch(_e){}
    })();
  },[]);

  async function handleSubmit(e){
    e.preventDefault();
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
        seo: { metaTitle: form.seoTitle, metaDescription: form.seoDescription },
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

  async function handleAddCategory(){
    const name = window.prompt('New category name');
    if(!name) return;
    try{
      const { item } = await BlogCategoryAPI.create({ name });
      setCategories(prev => [...prev, item]);
      setForm(f=>({ ...f, categories: [...new Set([...(f.categories||[]), item._id])] }));
    }catch(err){
      alert(err.message || 'Failed to create category');
    }
  }


  function exec(cmd, val){
    const el = editorRef.current;
    if (!el) return;
    // Ensure editor has at least one paragraph and caret inside
    if (!el.innerHTML || el.innerHTML === '' || el.innerHTML === '<br>' ){
      el.innerHTML = '<p><br></p>';
    }
    // Place caret at end if selection is outside
    const sel = window.getSelection && window.getSelection();
    if (sel && (!sel.anchorNode || !el.contains(sel.anchorNode))){
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    el.focus();
    document.execCommand(cmd, false, val);
    setForm(f=>({ ...f, content: el.innerHTML }));
  }

  function setBlock(tag){
    const t = String(tag||'').toUpperCase();
    exec('formatBlock', t);
  }

  function insertLink(){
    const url = window.prompt('Enter URL (https://...)');
    if(!url) return;
    exec('createLink', url);
  }

  function clearFormats(){
    exec('removeFormat');
  }

  async function uploadAndSet(field){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (ev)=>{
      const file = ev.target.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        const { url } = await UploadAPI.image(dataUrl, file.name);
        setForm(f=>({ ...f, [field]: url }));
        setMessage(`${field} uploaded`);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  async function uploadAndInsertToContent(){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (ev)=>{
      const file = ev.target.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        const { url } = await UploadAPI.image(dataUrl, file.name);
        // insert <img> at caret
        const img = `<img src="${url}" alt="" />`;
        const current = editorRef.current;
        if (current) {
          current.focus();
          document.execCommand('insertHTML', false, img);
          setForm(f=>({ ...f, content: current.innerHTML }));
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function onFileChange(e){
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try{
        const dataUrl = reader.result;
        // call backend upload API to get a hosted URL
        const { url } = await UploadAPI.image(dataUrl, file.name);
        setForm(f=>({...f, coverImage: url }));
        setMessage('Cover image uploaded');
      }catch(err){
        setError(err.message || 'Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
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
            <strong className="active" aria-current="page">Create</strong>
          </div>
          
        </div>

        <h1 className="page-title" style={{marginTop:'.25rem'}}>Create a New Post</h1>
        

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
            <h3>Categories</h3>
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:'.5rem'}}>
              <button type="button" className="btn-secondary" onClick={handleAddCategory}>New Category</button>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>
              {categories.map(cat=>{
                const checked = form.categories.includes(cat._id);
                return (
                  <label key={cat._id} className="chip" style={{cursor:'pointer'}}>
                    <input type="checkbox" checked={checked} onChange={e=>setForm(f=>({...f,categories:e.target.checked? [...new Set([...(f.categories||[]), cat._id])]: f.categories.filter(x=>x!==cat._id)}))} />
                    <span>{cat.name}</span>
                  </label>
                );
              })}
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
              <button type="button" className="btn-secondary" onClick={async()=>{
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (ev)=>{
                  const file = ev.target.files?.[0]; if(!file) return;
                  const reader = new FileReader();
                  reader.onload = async ()=>{
                    const dataUrl = reader.result;
                    const { url } = await UploadAPI.image(dataUrl, file.name);
                    setForm(f=>({...f, galleryImages:[...f.galleryImages, url]}));
                  };
                  reader.readAsDataURL(file);
                };
                input.click();
              }}>Add image</button>
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
                <button type="button" onClick={uploadAndInsertToContent}>+ Image</button>
              </div>
              <div
                ref={editorRef}
                className="form-field"
                style={{minHeight:180}}
                contentEditable
                suppressContentEditableWarning
                onInput={(e)=>{
                  // Guard against null currentTarget in edge cases
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
            <label style={{display:'flex',alignItems:'center',gap:'.5rem',marginTop:'.5rem'}}>
              <input type="checkbox" checked={shareToSocial} onChange={e=>setShareToSocial(e.target.checked)} />
              Also share on social media
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

// EOF
