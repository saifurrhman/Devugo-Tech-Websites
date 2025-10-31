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
        <main className="admin-content create-post">
          <AdminTopbar />
          <div className="card mt-4">Loading…</div>
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
          <div className="breadcrumbs">
            <Link to="/admin">Dashboard</Link>
            <span>/</span>
            <Link to="/admin/portfolio">Portfolio</Link>
            <span>/</span>
            <strong>{isNew ? 'Create' : 'Edit'}</strong>
          </div>
        </div>

        <h1 className="page-title mt-2">{isNew ? 'Add Project' : 'Edit Project'}</h1>
        {error && <div className="chip chip-error mt-2">{error}</div>}
        {message && <div className="chip chip-success mt-2">{message}</div>}

        <form onSubmit={handleSave} className="mt-4">

          {/* RESPONSIVE 2-COLUMN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              <section className="section-card">
                <h3>Basic details</h3>

                <label className="form-label mt-4">Title</label>
                <input
                  className="form-field ux-input w-full"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                />

                <label className="form-label mt-4">Client</label>
                <input
                  className="form-field ux-input w-full"
                  value={form.client}
                  onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
                />

                <label className="form-label mt-4">Description</label>
                <textarea
                  rows={5}
                  className="form-field ux-input w-full"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </section>

              <section className="section-card">
                <div className="flex justify-between flex-wrap">
                  <h3>Tech stack</h3>
                  <Link to="/admin/tech-stack" className="btn-secondary">Manage</Link>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {techOptions.map(opt => {
                    const name = String(opt.name || '');
                    const active = form.techStack.includes(name);

                    return (
                      <button
                        key={opt._id}
                        type="button"
                        className={`ql ${active ? 'active' : ''}`}
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
              </section>

              <section className="section-card">
                <h3>Gallery</h3>

                <div
                  className="uploader"
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
                  <div className="uploader-empty text-center">
                    <strong>Click to upload</strong>
                    <div className="muted text-sm">JPG, PNG, WEBP, GIF</div>
                  </div>
                </div>

                {/* RESPONSIVE THUMB GRID */}
                {form.thumbnails.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                    {form.thumbnails.map((url, idx) => (
                      <div key={idx} className="relative rounded border p-1">
                        <img src={url} className="rounded w-full h-24 object-cover" />
                        <button
                          type="button"
                          className="uploader-remove"
                          onClick={() => removeThumb(idx)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="section-card">
                <div className="flex justify-between flex-wrap">
                  <h3>Categories and tags</h3>
                  <Link to="/admin/portfolio-categories" className="btn-secondary">
                    Manage
                  </Link>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {categories.map(cat => {
                    const active = form.tags.includes(cat.name);

                    return (
                      <button
                        key={cat._id}
                        type="button"
                        className={`ql ${active ? 'active' : ''}`}
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
              </section>

            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="section-card">
              <h3>Settings</h3>

              <label className="form-label mt-4">Project URL</label>
              <input
                className="form-field ux-input w-full"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              />

              <label className="flex gap-2 mt-4 items-center">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                />
                Featured
              </label>
            </aside>
          </div>

          <div className="bottom-actions">
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => navigate('/admin/portfolio')} className="btn-secondary">
                Cancel
              </button>

              {!isNew && (
                <button type="button" onClick={handleDelete} className="btn-secondary">
                  Delete
                </button>
              )}

              <button type="submit" disabled={saving} className="btn">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}