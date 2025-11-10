import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { PortfolioAPI, UploadAPI, PortfolioCategoryAPI, TechStackAPI } from '../../lib/api';

export default function PortfolioEdit() {
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnails: [],
    tags: [],
    url: '',
    client: '',
    featured: false,
    techStack: []
  });

  const [categories, setCategories] = useState([]);
  const [techOptions, setTechOptions] = useState([]);

  useEffect(() => {
    if (isNew) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const { item } = await PortfolioAPI.get(id);
        if (!mounted) return;

        setForm({
          title: item.title || '',
          description: item.description || '',
          thumbnails: item.thumbnails || [],
          tags: item.tags || [],
          techStack: item.techStack || [],
          url: item.url || '',
          client: item.client || '',
          featured: !!item.featured
        });
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load item');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, isNew]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { items } = await PortfolioCategoryAPI.list();
        if (mounted) setCategories(items || []);
      } catch (_e) {}
    })();

    return () => (mounted = false);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { items } = await TechStackAPI.list();
        if (mounted) setTechOptions(items || []);
      } catch (_e) {}
    })();
    return () => (mounted = false);
  }, []);

  async function onFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const uploads = await Promise.all(
        files.map(
          file =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = async () => {
                try {
                  const { url } = await UploadAPI.image(reader.result, file.name);
                  resolve(url);
                } catch (err) {
                  reject(err);
                }
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );

      setForm(f => ({ ...f, thumbnails: [...f.thumbnails, ...uploads] }));
      setMessage('Images uploaded');
    } catch (err) {
      setError(err.message || 'Failed to upload images');
    } finally {
      e.target.value = '';
    }
  }

  function removeThumb(index) {
    setForm(f => ({
      ...f,
      thumbnails: f.thumbnails.filter((_, i) => i !== index)
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        title: form.title,
        description: form.description,
        thumbnails: form.thumbnails,
        tags: form.tags,
        techStack: form.techStack,
        url: form.url,
        client: form.client,
        featured: form.featured
      };

      if (isNew) {
        await PortfolioAPI.create(payload);
        navigate('/admin/portfolio');
      } else {
        await PortfolioAPI.update(id, payload);
        setMessage('Saved');
      }
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (isNew) return;
    if (!window.confirm('Delete this item?')) return;

    setSaving(true);

    try {
      await PortfolioAPI.remove(id);
      navigate('/admin/portfolio');
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-content">
          <AdminTopbar />
          <div className="card mt-4">Loading…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <AdminTopbar />

        {/* Breadcrumbs */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <Link to="/admin" className="opacity-70 hover:opacity-100">Dashboard</Link>
            <span className="opacity-50">/</span>
            <Link to="/admin/portfolio" className="opacity-70 hover:opacity-100">Portfolio</Link>
            <span className="opacity-50">/</span>
            <strong>{isNew ? 'Create' : 'Edit'}</strong>
          </div>
          <Link to="/admin/portfolio" className="btn-secondary">Back to Portfolio</Link>
        </div>

        <h1 className="text-2xl font-bold mb-4">{isNew ? 'Add Project' : 'Edit Project'}</h1>
        
        {error && (
          <div className="card mb-4 p-3 bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}
        {message && (
          <div className="card mb-4 p-3 bg-green-50 border border-green-200 text-green-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          
          {/* RESPONSIVE 2-COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN - Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Basic Details */}
              <div className="card p-5">
                <h3 className="text-lg font-semibold mb-4">Basic details</h3>

                <div className="mb-4">
                  <label className="form-label block mb-2">Title</label>
                  <input
                    className="form-field w-full"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="E-commerce Website, Mobile App, etc."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label block mb-2">Client</label>
                  <input
                    className="form-field w-full"
                    value={form.client}
                    onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
                    placeholder="Client or company name"
                  />
                </div>

                <div>
                  <label className="form-label block mb-2">Description</label>
                  <textarea
                    rows={5}
                    className="form-field w-full resize-y"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the project, features, and your role..."
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-lg font-semibold">Tech stack</h3>
                  <Link to="/admin/tech-stack" className="btn-secondary">Manage Tech Stack</Link>
                </div>

                {techOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {techOptions.map(opt => {
                      const name = String(opt.name || '');
                      const active = form.techStack.includes(name);

                      return (
                        <button
                          key={opt._id}
                          type="button"
                          className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                            active 
                              ? 'bg-blue-500 text-white border-blue-500' 
                              : 'bg-transparent border-gray-300 hover:border-blue-400'
                          }`}
                          onClick={() => {
                            setForm(f => {
                              const exists = f.techStack.includes(name);
                              const next = exists
                                ? f.techStack.filter(x => x !== name)
                                : [...f.techStack, name];
                              return { ...f, techStack: next };
                            });
                          }}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm opacity-60">
                    No technologies available. <Link to="/admin/tech-stack" className="text-blue-500 hover:underline">Add some</Link>
                  </p>
                )}
              </div>

              {/* Gallery */}
              <div className="card p-5">
                <h3 className="text-lg font-semibold mb-4">Gallery</h3>

                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors mb-4"
                  onClick={() => document.getElementById('pf-uploader').click()}
                >
                  <input
                    id="pf-uploader"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFiles}
                    className="hidden"
                  />
                  <div>
                    <strong className="block mb-1">Click to upload images</strong>
                    <div className="text-sm opacity-60">JPG, PNG, WEBP, GIF</div>
                  </div>
                </div>

                {/* Thumbnails Grid */}
                {form.thumbnails.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {form.thumbnails.map((url, idx) => (
                      <div key={idx} className="relative border border-gray-300 rounded-lg p-2">
                        <img 
                          src={url} 
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-28 object-cover rounded mb-2"
                        />
                        <button
                          type="button"
                          className="btn-secondary w-full text-sm py-1 border-red-400 text-red-500 hover:bg-red-50"
                          onClick={() => removeThumb(idx)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories and Tags */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-lg font-semibold">Categories and tags</h3>
                  <Link to="/admin/portfolio-categories" className="btn-secondary">
                    Manage Categories
                  </Link>
                </div>

                {categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                      const active = form.tags.includes(cat.name);

                      return (
                        <button
                          key={cat._id}
                          type="button"
                          className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                            active 
                              ? 'bg-blue-500 text-white border-blue-500' 
                              : 'bg-transparent border-gray-300 hover:border-blue-400'
                          }`}
                          onClick={() =>
                            setForm(f => {
                              const exists = f.tags.includes(cat.name);
                              const next = exists
                                ? f.tags.filter(t => t !== cat.name)
                                : [...f.tags, cat.name];
                              return { ...f, tags: next };
                            })
                          }
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm opacity-60">
                    No categories available. <Link to="/admin/portfolio-categories" className="text-blue-500 hover:underline">Add some</Link>
                  </p>
                )}
              </div>

            </div>

            {/* RIGHT SIDEBAR - Settings */}
            <aside className="card p-5 h-fit">
              <h3 className="text-lg font-semibold mb-4">Settings</h3>

              <div className="mb-4">
                <label className="form-label block mb-2">Project URL</label>
                <input
                  className="form-field w-full"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>Featured Project</span>
              </label>
            </aside>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-4 border-t border-gray-300 flex justify-end gap-3 flex-wrap">
            <button 
              type="button" 
              onClick={() => navigate('/admin/portfolio')} 
              className="btn-secondary"
            >
              Cancel
            </button>

            {!isNew && (
              <button 
                type="button" 
                onClick={handleDelete} 
                className="btn-secondary border-red-400 text-red-500 hover:bg-red-50"
              >
                Delete
              </button>
            )}

            <button type="submit" disabled={saving} className="btn">
              {saving ? 'Saving...' : 'Save Project'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}