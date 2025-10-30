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
      await BlogAPI.create(payload);
      setMessage('Post created');
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
    if (!el.innerHTML || el.innerHTML === '' || el.innerHTML === '<br>' ){
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
        
        {/* Sticky Breadcrumb Bar */}
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
          {/* Basic Details */}
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

          {/* Featured Image */}
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

          {/* Categories */}
          <section className="section-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="m-0">Categories</h3>
              <button type="button" className="btn-secondary w-full sm:w-auto" onClick={handleAddCategory}>New Category</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat=>{
                const checked = form.categories.includes(cat._id);
                return (
                  <label key={cat._id} className="chip" style={{cursor:'pointer'}}>
                    <input type="checkbox" checked={checked} onChange={e=>setForm(f=>({...f,categories:e.target.checked? [...new Set([...(f.categories||[]), cat._id])]: f.categories.filter(x=>x!==cat._id)}))} style={{marginRight:'.4rem'}} />
                    <span>{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Gallery */}
          <section className="section-card">
            <h3>Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {form.galleryImages.map((g,i)=>(
                <div key={i} className="card relative" style={{padding:'.25rem',borderRadius:'12px'}}>
                  <img src={g} alt="gallery" className="w-full h-24 object-cover rounded-lg" />
                  <button type="button" className="uploader-remove absolute left-2 bottom-2" onClick={()=>setForm(f=>({...f,galleryImages:f.galleryImages.filter((_,x)=>x!==i)}))}>Remove</button>
                </div>
              ))}
              <button type="button" className="btn-secondary h-24 w-full flex items-center justify-center text-sm" onClick={async()=>{
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
              }}>+ Add image</button>
            </div>
          </section>

          {/* Post Cover */}
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

          {/* Content Editor */}
          <section className="section-card">
            <h3>Content</h3>
            <div className="editor mt-3">
              <div className="editor-toolbar overflow-x-auto flex flex-wrap gap-1 p-2">
                <button type="button" onClick={()=>setBlock('p')} className="whitespace-nowrap">P</button>
                <button type="button" onClick={()=>setBlock('h1')} className="whitespace-nowrap">H1</button>
                <button type="button" onClick={()=>setBlock('h2')} className="whitespace-nowrap">H2</button>
                <button type="button" onClick={()=>setBlock('h3')} className="whitespace-nowrap">H3</button>
                <button type="button" onClick={()=>setBlock('h4')} className="whitespace-nowrap">H4</button>
                <button type="button" onClick={()=>setBlock('h5')} className="whitespace-nowrap">H5</button>
                <button type="button" onClick={()=>exec('bold')} className="whitespace-nowrap">B</button>
                <button type="button" onClick={()=>exec('italic')} className="whitespace-nowrap">I</button>
                <button type="button" onClick={()=>exec('underline')} className="whitespace-nowrap">U</button>
                <button type="button" onClick={()=>exec('insertOrderedList')} className="whitespace-nowrap">1.</button>
                <button type="button" onClick={()=>exec('insertUnorderedList')} className="whitespace-nowrap">•</button>
                <button type="button" onClick={()=>setBlock('blockquote')} className="whitespace-nowrap">❝</button>
                <button type="button" onClick={()=>setBlock('pre')} className="whitespace-nowrap">{'{ }'}</button>
                <button type="button" onClick={()=>exec('justifyLeft')} className="whitespace-nowrap">⟸</button>
                <button type="button" onClick={()=>exec('justifyCenter')} className="whitespace-nowrap">⟺</button>
                <button type="button" onClick={()=>exec('justifyRight')} className="whitespace-nowrap">⟹</button>
                <button type="button" onClick={insertLink} className="whitespace-nowrap">Link</button>
                <button type="button" onClick={()=>exec('unlink')} className="whitespace-nowrap">Unlink</button>
                <button type="button" onClick={()=>exec('undo')} className="whitespace-nowrap">Undo</button>
                <button type="button" onClick={()=>exec('redo')} className="whitespace-nowrap">Redo</button>
                <button type="button" onClick={clearFormats} className="whitespace-nowrap">Clear</button>
                <button type="button" onClick={uploadAndInsertToContent} className="whitespace-nowrap">+ Image</button>
              </div>
              <div
                ref={editorRef}
                className="form-field min-h-[180px]"
                contentEditable
                suppressContentEditableWarning
                onInput={(e)=>{
                  const html = e.currentTarget?.innerHTML ?? e.target?.innerHTML ?? editorRef.current?.innerHTML ?? '';
                  setForm(f=>({...f, content: html }));
                }}
                dangerouslySetInnerHTML={{ __html: form.content || '' }}
                aria-label="Post content editor"
              />
              <div className="hint mt-2">Use headings, lists, and emphasis to format your post.</div>
            </div>
          </section>

          {/* Meta */}
          <section className="section-card">
            <h3>Meta</h3>
            <div className="space-y-4 mt-3">
              <div className="form-grid">
                <label className="form-label">Tags (comma separated)</label>
                <input className="form-field" value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="design, ux, product"/>
                <div className="hint">Separate with commas. Example: design, ux, product</div>
              </div>
              <div className="form-grid">
                <label className="form-label">SEO title</label>
                <input className="form-field" value={form.seoTitle} onChange={e=>setForm(f=>({...f,seoTitle:e.target.value}))} placeholder="SEO title"/>
                <div className="hint">Keep it under 60 characters.</div>
              </div>
              <div className="form-grid">
                <label className="form-label">SEO description</label>
                <input className="form-field" value={form.seoDescription} onChange={e=>setForm(f=>({...f,seoDescription:e.target.value}))} placeholder="SEO description"/>
                <div className="hint">About 150–160 characters describing the post.</div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} />
                  <span>Publish immediately</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={shareToSocial} onChange={e=>setShareToSocial(e.target.checked)} />
                  <span>Also share on social media</span>
                </label>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pb-4">
            <button 
              type="button" 
              className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-900 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={()=>navigate('/admin/blog')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Publishing...' : 'Save'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}