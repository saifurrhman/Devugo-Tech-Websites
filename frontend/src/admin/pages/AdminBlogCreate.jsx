import React, { useEffect, useRef, useState } from 'react';

import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import AIPanel from '../../components/AIPanel';
import BlogGeneratorModal from '../../components/BlogGeneratorModal';
import { BlogAPI, UploadAPI, BlogCategoryAPI, AIAPI } from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminBlogCreate() {
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
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false); // Legacy support if needed
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    document.title = 'Create Blog - Devugo Tech';
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const { items } = await BlogCategoryAPI.list();
        setCategories(items || []);
      } catch (_e) { }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage,
        featuredImage: form.featuredImage,
        galleryImages: form.galleryImages,
        categories: form.categories,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        published: form.published,
        seo: { metaTitle: form.seoTitle, metaDescription: form.seoDescription },
      };
      await BlogAPI.create(payload);
      setMessage('Post created');
      navigate('/admin/blog');
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCategory() {
    const name = window.prompt('New category name');
    if (!name) return;
    try {
      const { item } = await BlogCategoryAPI.create({ name });
      setCategories(prev => [...prev, item]);
      setForm(f => ({ ...f, categories: [...new Set([...(f.categories || []), item._id])] }));
    } catch (err) {
      alert(err.message || 'Failed to create category');
    }
  }

  function exec(cmd, val) {
    const el = editorRef.current;
    if (!el) return;
    if (!el.innerHTML || el.innerHTML === '' || el.innerHTML === '<br>') {
      el.innerHTML = '<p><br></p>';
    }
    const sel = window.getSelection && window.getSelection();
    if (sel && (!sel.anchorNode || !el.contains(sel.anchorNode))) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    el.focus();
    document.execCommand(cmd, false, val);
    setForm(f => ({ ...f, content: el.innerHTML }));
  }

  function setBlock(tag) {
    const t = String(tag || '').toUpperCase();
    exec('formatBlock', t);
  }

  function insertLink() {
    const url = window.prompt('Enter URL (https://...)');
    if (!url) return;
    exec('createLink', url);
  }

  function clearFormats() {
    exec('removeFormat');
  }

  async function uploadAndSet(field) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (ev) => {
      const file = ev.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        const { url } = await UploadAPI.image(dataUrl, file.name);
        setForm(f => ({ ...f, [field]: url }));
        setMessage(`${field} uploaded`);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  async function uploadAndInsertToContent() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (ev) => {
      const file = ev.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        const { url } = await UploadAPI.image(dataUrl, file.name);
        const img = `<img src="${url}" alt="" style="max-width:100%;height:auto;" />`;
        const current = editorRef.current;
        if (current) {
          current.focus();
          document.execCommand('insertHTML', false, img);
          setForm(f => ({ ...f, content: current.innerHTML }));
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result;
        const { url } = await UploadAPI.image(dataUrl, file.name);
        setForm(f => ({ ...f, coverImage: url }));
        setMessage('Cover image uploaded');
      } catch (err) {
        setError(err.message || 'Failed to upload image');
      }
    };
    reader.readAsDataURL(file);
    reader.readAsDataURL(file);
  }

  async function handleAIGenerate(promptText) {
    // Call the new 'blog' action
    const res = await AIAPI.generate({
      action: 'blog',
      topic: promptText,
      keywords: form.tags,
      tone: 'Professional, Engaging'
    });
    return res.data;
  }

  function handleAIAccept(data) {
    console.log('🤖 AI Data Accepted:', data);
    setForm(prev => {
      // Safe merge of categories: If AI sends strings, we might need to find IDs or just ignore for now.
      // Assuming AI sends an array of strings for tags/categories
      const incomingTags = Array.isArray(data.categories) ? data.categories.join(', ') : '';
      const mergedTags = prev.tags ? `${prev.tags}, ${incomingTags}` : incomingTags;

      return {
        ...prev,
        title: data.title || prev.title,
        content: data.content || prev.content,
        excerpt: data.excerpt || prev.excerpt,
        // Map Images if present
        featuredImage: data.featuredImage || prev.featuredImage,
        coverImage: data.coverImage || prev.coverImage,
        // Map SEO
        seoTitle: data.seo?.metaTitle || prev.seoTitle,
        seoDescription: data.seo?.metaDescription || prev.seoDescription,
        // Append suggested categories to tags (since we need IDs for real categories)
        tags: mergedTags
      };
    });
    setGeneratorOpen(false);
    setMessage('Content & Images applied successfully! 🚀');
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mt-1">
          <h1 className="page-title">Create a New Post</h1>
          <button
            type="button"
            onClick={() => {
              console.log('Auto-Generate clicked');
              setAiPrompt(form.title || '');
              setGeneratorOpen(true);
            }}
            className="btn-secondary flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', border: 'none' }}
          >
            <span>✨ Auto-Generate with AI</span>
          </button>

        </div>

        {error && (<div className="chip chip-error" style={{ marginTop: '.5rem' }}>{error}</div>)}
        {message && (<div className="chip chip-success" style={{ marginTop: '.5rem' }}>{message}</div>)}

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
          {/* Basic Details */}
          <section className="section-card">
            <h3>Basic details</h3>
            <div className="form-grid" style={{ marginTop: '.75rem' }}>
              <label className="form-label">Post title</label>
              <input
                className="form-field"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Enter a compelling post title (50-70 characters recommended)"
                required
              />
              <div className="hint">A clear, descriptive headline works best (50–70 characters).</div>
            </div>
            <div className="form-grid" style={{ marginTop: '.75rem' }}>
              <label className="form-label">Short description</label>
              <input
                className="form-field"
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Brief summary of your post (1-2 sentences)"
              />
              <div className="hint">1–2 lines to summarize the post. This may appear on the blog list.</div>
            </div>
          </section>

          {/* Featured Image */}
          <section className="section-card">
            <h3>Featured image</h3>
            <div className="uploader" onClick={() => uploadAndSet('featuredImage')}>
              {form.featuredImage ? (
                <div className="uploader-has-image">
                  <img src={form.featuredImage} alt="featured" className="uploader-preview" />
                  <button type="button" className="uploader-remove" onClick={(e) => { e.stopPropagation(); setForm(f => ({ ...f, featuredImage: '' })); }}>Remove photo</button>
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
              {categories.length === 0 ? (
                <div className="hint">No categories yet. Create one to organize your posts.</div>
              ) : (
                categories.map(cat => {
                  const checked = form.categories.includes(cat._id);
                  return (
                    <label key={cat._id} className="chip" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => setForm(f => ({
                          ...f,
                          categories: e.target.checked
                            ? [...new Set([...(f.categories || []), cat._id])]
                            : f.categories.filter(x => x !== cat._id)
                        }))}
                        style={{ marginRight: '.4rem' }}
                      />
                      <span>{cat.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </section>

          {/* Gallery */}
          <section className="section-card">
            <h3>Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {form.galleryImages.map((g, i) => (
                <div key={i} className="card relative" style={{ padding: '.25rem', borderRadius: '12px' }}>
                  <img src={g} alt="gallery" className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    className="uploader-remove absolute left-2 bottom-2"
                    onClick={() => setForm(f => ({ ...f, galleryImages: f.galleryImages.filter((_, x) => x !== i) }))}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary h-24 w-full flex items-center justify-center text-sm"
                onClick={async () => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async (ev) => {
                    const file = ev.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const dataUrl = reader.result;
                      const { url } = await UploadAPI.image(dataUrl, file.name);
                      setForm(f => ({ ...f, galleryImages: [...f.galleryImages, url] }));
                    };
                    reader.readAsDataURL(file);
                  };
                  input.click();
                }}
              >
                + Add image
              </button>
            </div>
            {form.galleryImages.length === 0 && (
              <div className="hint mt-2">Add multiple images to create a gallery for your post.</div>
            )}
          </section>

          {/* Post Cover */}
          <section className="section-card">
            <h3>Post cover</h3>
            <div className="uploader" onClick={() => document.getElementById('file-input').click()}>
              {form.coverImage ? (
                <div className="uploader-has-image">
                  <img src={form.coverImage} alt="cover" className="uploader-preview" />
                  <button type="button" className="uploader-remove" onClick={(e) => { e.stopPropagation(); setForm(f => ({ ...f, coverImage: '' })); }}>Remove photo</button>
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
              <input id="file-input" type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
            </div>
          </section>

          {/* Content Editor */}
          <section className="section-card">
            <h3>Content</h3>
            <div className="editor mt-3">
              <div className="editor-toolbar overflow-x-auto flex flex-wrap gap-1 p-2" style={{ backgroundColor: '#f5f5f5', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #ddd' }}>
                <button type="button" onClick={() => setBlock('p')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Paragraph">P</button>
                <button type="button" onClick={() => setBlock('h1')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Heading 1">H1</button>
                <button type="button" onClick={() => setBlock('h2')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Heading 2">H2</button>
                <button type="button" onClick={() => setBlock('h3')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Heading 3">H3</button>
                <button type="button" onClick={() => setBlock('h4')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Heading 4">H4</button>
                <button type="button" onClick={() => setBlock('h5')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Heading 5">H5</button>
                <button type="button" onClick={() => exec('bold')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', fontWeight: 'bold', minWidth: '36px' }} title="Bold">B</button>
                <button type="button" onClick={() => exec('italic')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', fontStyle: 'italic', minWidth: '36px' }} title="Italic">I</button>
                <button type="button" onClick={() => exec('underline')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', textDecoration: 'underline', minWidth: '36px' }} title="Underline">U</button>
                <button type="button" onClick={() => exec('insertOrderedList')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Numbered List">1.</button>
                <button type="button" onClick={() => exec('insertUnorderedList')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Bullet List">•</button>
                <button type="button" onClick={() => setBlock('blockquote')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Quote">❝</button>
                <button type="button" onClick={() => setBlock('pre')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Code Block">{'{ }'}</button>
                <button type="button" onClick={() => exec('justifyLeft')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Align Left">⟸</button>
                <button type="button" onClick={() => exec('justifyCenter')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Align Center">⟺</button>
                <button type="button" onClick={() => exec('justifyRight')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', minWidth: '36px' }} title="Align Right">⟹</button>
                <button type="button" onClick={insertLink} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }} title="Insert Link">Link</button>
                <button type="button" onClick={() => exec('unlink')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }} title="Remove Link">Unlink</button>
                <button type="button" onClick={() => exec('undo')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }} title="Undo">Undo</button>
                <button type="button" onClick={() => exec('redo')} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }} title="Redo">Redo</button>
                <button type="button" onClick={clearFormats} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }} title="Clear Formatting">Clear</button>
                <button type="button" onClick={uploadAndInsertToContent} className="whitespace-nowrap" style={{ padding: '6px 12px', border: '1px solid #0f2b5b', borderRadius: '4px', background: '#0f2b5b', color: 'white', cursor: 'pointer' }} title="Insert Image">+ Image</button>
              </div>
              <div
                ref={editorRef}
                className="form-field"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => {
                  const html = e.currentTarget?.innerHTML ?? e.target?.innerHTML ?? editorRef.current?.innerHTML ?? '';
                  setForm(f => ({ ...f, content: html }));
                }}
                dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:#999;">Start typing your content here... Use the toolbar above to format text, add headings, lists, links, and images.</p>' }}
                aria-label="Post content editor"
                style={{
                  minHeight: '300px',
                  padding: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '0 0 8px 8px',
                  outline: 'none',
                  backgroundColor: 'white',
                  lineHeight: '1.6',
                  fontSize: '15px',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              />
              <div className="hint mt-2">Use headings, lists, and emphasis to format your post. Click "+ Image" to insert images inline.</div>
            </div>
          </section>

          {/* Meta */}
          <section className="section-card">
            <h3>Meta</h3>
            <div className="space-y-4 mt-3">
              <div className="form-grid">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  className="form-field"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="design, ux, product, technology"
                />
                <div className="hint">Separate with commas. Example: design, ux, product</div>
              </div>
              <div className="form-grid">
                <label className="form-label">SEO title</label>
                <input
                  className="form-field"
                  value={form.seoTitle}
                  onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))}
                  placeholder="Optimized title for search engines (max 60 characters)"
                />
                <div className="hint">Keep it under 60 characters. {form.seoTitle.length}/60</div>
              </div>
              <div className="form-grid">
                <label className="form-label">SEO description</label>
                <input
                  className="form-field"
                  value={form.seoDescription}
                  onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))}
                  placeholder="Brief description for search results (150-160 characters)"
                />
                <div className="hint">About 150–160 characters describing the post. {form.seoDescription.length}/160</div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                  />
                  <span>Publish immediately</span>
                </label>
                <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={shareToSocial}
                    onChange={e => setShareToSocial(e.target.checked)}
                  />
                  <span>Also share on social media</span>
                </label>
              </div>
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="bottom-actions">
            <div className="container flex flex-row items-center justify-end gap-3">
              <button
                type="button"
                className="btn-secondary lg"
                onClick={() => navigate('/admin/blog')}
                style={{ backgroundColor: 'white', color: 'black', padding: '10px 24px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn lg"
                disabled={saving}
                style={{
                  backgroundColor: '#0f2b5b',
                  color: 'white',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Saving…' : 'Save Post'}
              </button>
            </div>
          </div>
        </form>
      </main>

      <AIPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        prompt={aiPrompt}
        onGenerate={handleAIGenerate}
        onAccept={handleAIAccept}
      />
      <BlogGeneratorModal
        isOpen={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onAccept={handleAIAccept}
        initialTopic={aiPrompt}
      />
    </div>
  );
} 