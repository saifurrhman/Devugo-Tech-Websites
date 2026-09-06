import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { ProductAPI, UploadAPI, getFileUrl } from '../../lib/api';
import { ArrowLeft, Save, Upload, Plus, X, Package, Star, Link as LinkIcon, DollarSign, Tag, Globe } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export default function ProductEdit() {
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    tagline: '',
    description: '',
    category: 'SaaS',
    price: 0,
    originalPrice: 0,
    currency: 'USD',
    badge: '',
    features: ['Instant AI Setup', '24/7 Automated Workflow', 'Cloud Dashboard Access'],
    techStack: ['React', 'Node.js', 'Tailwind', 'MongoDB'],
    image: '',
    demoUrl: '',
    buyUrl: '',
    documentationUrl: '',
    isFeatured: false,
    isActive: true,
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTech, setNewTech] = useState('');

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      ProductAPI.get(id)
        .then(res => {
          if (res?.item) {
            const p = res.item;
            setForm({
              title: p.title || '',
              slug: p.slug || '',
              tagline: p.tagline || '',
              description: p.description || '',
              category: p.category || 'SaaS',
              price: p.price || 0,
              originalPrice: p.originalPrice || 0,
              currency: p.currency || 'USD',
              badge: p.badge || '',
              features: Array.isArray(p.features) && p.features.length > 0 ? p.features : [],
              techStack: Array.isArray(p.techStack) && p.techStack.length > 0 ? p.techStack : [],
              image: p.image || '',
              demoUrl: p.demoUrl || '',
              buyUrl: p.buyUrl || '',
              documentationUrl: p.documentationUrl || '',
              isFeatured: Boolean(p.isFeatured),
              isActive: p.isActive !== false,
            });
          }
        })
        .catch(err => {
          console.error(err);
          notifyError('Failed to load product details');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await UploadAPI.uploadSingle(file);
      const url = res?.data?.url || res?.url || res?.path;
      if (url) {
        setForm(prev => ({ ...prev, image: url }));
        success('Image uploaded successfully');
      }
    } catch (err) {
      console.error(err);
      notifyError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setForm(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
    setNewFeature('');
  };

  const removeFeature = (index) => {
    setForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const addTech = () => {
    if (!newTech.trim()) return;
    setForm(prev => ({ ...prev, techStack: [...prev.techStack, newTech.trim()] }));
    setNewTech('');
  };

  const removeTech = (index) => {
    setForm(prev => ({ ...prev, techStack: prev.techStack.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      return notifyError('Product title is required');
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        originalPrice: Number(form.originalPrice) || 0,
      };

      if (isEdit) {
        await ProductAPI.update(id, payload);
        success('Product updated successfully');
      } else {
        await ProductAPI.create(payload);
        success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      notifyError('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout min-h-screen bg-[#09121f] text-white flex">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/products"
              className="p-2.5 rounded-xl bg-[#0f223f] border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {isEdit ? 'Edit Product' : 'Create New Product'}
              </h1>
              <p className="text-slate-400 text-xs md:text-sm">
                Fill in product details, pricing, feature highlights, and media.
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 disabled:opacity-50 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all shrink-0"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-[#0f223f] border border-slate-700/60 rounded-2xl">
            <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading product details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info Card */}
            <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
                <Package size={20} className="text-blue-400" /> General Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Devugo AI Social Suite"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-sm outline-none focus:border-blue-500"
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="AI Solution">AI Solution</option>
                    <option value="Web Application">Web Application</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Plugin">Plugin / Add-on</option>
                    <option value="Automation">Automation Tool</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Tagline / Short Pitch
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={form.tagline}
                    onChange={handleChange}
                    placeholder="e.g. AI-powered social media management & automation platform."
                    className="w-full px-4 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Badge Label (Optional)
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={form.badge}
                    onChange={handleChange}
                    placeholder="e.g. Featured, Hot, Popular, New, Pro"
                    className="w-full px-4 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                  Full Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Detailed description of what the product does, benefits, and capabilities..."
                  className="w-full px-4 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
                <DollarSign size={20} className="text-emerald-400" /> Pricing Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    placeholder="0 for Free"
                    className="w-full px-4 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Original Price ($) (Optional)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={form.originalPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 99 for strikethrough"
                    className="w-full px-4 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Currency
                  </label>
                  <input
                    type="text"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Image & Links Card */}
            <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
                <Globe size={20} className="text-purple-400" /> Media & Links
              </h2>

              {/* Main Image */}
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                  Product Image / Thumbnail URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://... or upload file"
                    className="flex-1 px-4 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500"
                  />
                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-[#1e2536] hover:bg-slate-700 border border-slate-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shrink-0">
                    <Upload size={16} />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                {form.image && (
                  <div className="mt-3 relative w-36 h-24 rounded-xl border border-slate-700/60 overflow-hidden bg-[#1e2536]">
                    <img src={getFileUrl(form.image)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    name="demoUrl"
                    value={form.demoUrl}
                    onChange={handleChange}
                    placeholder="https://demo.devugo.tech"
                    className="w-full px-4 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                    Purchase / Download URL
                  </label>
                  <input
                    type="url"
                    name="buyUrl"
                    value={form.buyUrl}
                    onChange={handleChange}
                    placeholder="https://buy.devugo.tech or /contact"
                    className="w-full px-4 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Features & Tech Stack Card */}
            <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
                <Tag size={20} className="text-amber-400" /> Features & Tech Stack
              </h2>

              {/* Features List */}
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                  Key Features Highlights
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={e => setNewFeature(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                    placeholder="Add a bullet point feature..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-xs text-slate-200"
                    >
                      ✓ {feat}
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tech Stack List */}
              <div>
                <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                  Technologies Used
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTech}
                    onChange={e => setNewTech(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                    placeholder="e.g. React, Node.js, Python, Tailwind"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addTech}
                    className="bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {form.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs text-blue-400 font-bold"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(idx)}
                        className="text-blue-400 hover:text-rose-400"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Visibility Settings Card */}
            <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6">
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-[#1e2536]"
                />
                <div>
                  <span className="text-sm font-extrabold text-white block">Published / Active</span>
                  <span className="text-xs text-slate-400">Product will be publicly visible on website</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-[#1e2536]"
                />
                <div>
                  <span className="text-sm font-extrabold text-amber-400 block">Featured Product</span>
                  <span className="text-xs text-slate-400">Highlighted on homepage and product hero</span>
                </div>
              </label>

            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Link
                to="/admin/products"
                className="px-6 py-3 rounded-xl bg-[#1e2536] border border-slate-700/60 text-slate-300 hover:text-white font-bold text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 disabled:opacity-50 text-white font-extrabold px-8 py-3 rounded-xl shadow-lg shadow-blue-600/30 text-sm transition-all"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>

          </form>
        )}

      </main>
    </div>
  );
}
