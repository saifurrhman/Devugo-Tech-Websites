import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ProductAPI, UploadAPI, getFileUrl } from '../../lib/api';
import { 
  Plus, Search, Edit2, Trash2, ExternalLink, Star, Package, Check, X, 
  Tag, Upload, Save, Globe, DollarSign, Sparkles, Shield, Zap, RefreshCw
} from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useConfirm } from '../../contexts/ConfirmContext';

const DEFAULT_SAMPLE_PRODUCTS = [
  {
    _id: 'sample-p1',
    title: 'Devugo AI Social Suite',
    slug: 'devugo-ai-social-suite',
    category: 'AI Solution',
    price: 49,
    originalPrice: 99,
    currency: 'USD',
    badge: 'PROPRIETARY ECOSYSTEM',
    tagline: 'AI-powered social media management & automation platform.',
    description: 'A complete SaaS web app for scheduling, AI content creation, auto-replying, and multi-platform social media analytics.',
    features: ['Voice & WhatsApp Access', 'Native AI Content Engine', 'Live Engagement Telemetry', 'Auto-Reply Algorithms'],
    techStack: ['React', 'Node.js', 'OpenAI', 'MongoDB'],
    isFeatured: true,
    isActive: true,
    image: '',
    demoUrl: 'https://demo.devugo.tech',
    buyUrl: '/contact',
  },
  {
    _id: 'sample-p2',
    title: 'CRO Audit & Funnel Builder',
    slug: 'cro-audit-funnel-builder',
    category: 'SaaS',
    price: 99,
    originalPrice: 199,
    currency: 'USD',
    badge: 'LIVE PRODUCT DEPLOYMENT',
    tagline: 'Conversion rate optimization suite for e-commerce and landing pages.',
    description: 'Analyze landing pages, run automated CRO audits, and deploy high-converting sales funnels in minutes.',
    features: ['Instant CRO Score & Bottleneck Report', 'Heatmap & Click Tracking', 'A/B Testing Funnel Templates'],
    techStack: ['React', 'Tailwind', 'Node.js', 'PostgreSQL'],
    isFeatured: true,
    isActive: true,
    image: '',
    demoUrl: 'https://demo.devugo.tech',
    buyUrl: '/contact',
  },
  {
    _id: 'sample-p3',
    title: 'Smart Leads Engine',
    slug: 'smart-leads-engine',
    category: 'Automation',
    price: 29,
    originalPrice: 59,
    currency: 'USD',
    badge: 'ENTERPRISE SOLUTION',
    tagline: 'B2B lead generation & email verification automation web app.',
    description: 'Find verified corporate contacts, validate deliverability in real-time, and export structured CSV lead lists.',
    features: ['Real-time SMTP Email Verification', 'Industry & Location Lead Filters', 'Automated Lead Scoring System'],
    techStack: ['Node.js', 'Express', 'Python', 'Tailwind'],
    isFeatured: false,
    isActive: true,
    image: '',
    demoUrl: 'https://demo.devugo.tech',
    buyUrl: '/contact',
  }
];

const INITIAL_FORM = {
  title: '',
  slug: '',
  tagline: '',
  description: '',
  category: 'SaaS',
  price: 0,
  originalPrice: 0,
  currency: 'USD',
  badge: '',
  features: ['Voice & WhatsApp Access', 'Native Urdu Processing', 'Live Weather Telemetry'],
  techStack: ['React', 'Node.js', 'MongoDB'],
  image: '',
  demoUrl: '',
  buyUrl: '',
  documentationUrl: '',
  isFeatured: false,
  isActive: true,
};

export default function ProductsList() {
  const { success, error: notifyError } = useNotification();
  const confirm = useConfirm();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal Popup States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  // Dynamic input helpers
  const [newFeature, setNewFeature] = useState('');
  const [newTech, setNewTech] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await ProductAPI.list({ active: 'all' });
      const items = res?.items || res?.data || [];
      setProducts(items.length > 0 ? items : DEFAULT_SAMPLE_PRODUCTS);
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts(DEFAULT_SAMPLE_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.tagline || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, selectedCategory, search]);

  // Open Modal Popup for Add or Edit
  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        title: product.title || '',
        slug: product.slug || '',
        tagline: product.tagline || '',
        description: product.description || '',
        category: product.category || 'SaaS',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        currency: product.currency || 'USD',
        badge: product.badge || '',
        features: Array.isArray(product.features) && product.features.length > 0 ? product.features : [],
        techStack: Array.isArray(product.techStack) && product.techStack.length > 0 ? product.techStack : [],
        image: product.image || '',
        demoUrl: product.demoUrl || '',
        buyUrl: product.buyUrl || '',
        documentationUrl: product.documentationUrl || '',
        isFeatured: Boolean(product.isFeatured),
        isActive: product.isActive !== false,
      });
    } else {
      setEditingProduct(null);
      setForm(INITIAL_FORM);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setForm(INITIAL_FORM);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      if (name === 'title' && !editingProduct) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      return updated;
    });
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
    setForm(prev => ({
      ...prev,
      features: [...prev.features, newFeature.trim()]
    }));
    setNewFeature('');
  };

  const removeFeature = (index) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addTech = () => {
    if (!newTech.trim()) return;
    setForm(prev => ({
      ...prev,
      techStack: [...prev.techStack, newTech.trim()]
    }));
    setNewTech('');
  };

  const removeTech = (index) => {
    setForm(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      notifyError('Product title is required');
      return;
    }
    setSaving(true);

    const payload = {
      ...form,
      slug: form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      price: Number(form.price) || 0,
      originalPrice: Number(form.originalPrice) || 0,
    };

    try {
      if (editingProduct && editingProduct._id && !editingProduct._id.startsWith('sample-')) {
        const res = await ProductAPI.update(editingProduct._id, payload);
        const updatedItem = res?.item || { ...editingProduct, ...payload };
        setProducts(prev => prev.map(p => p._id === editingProduct._id ? updatedItem : p));
        success('Product updated successfully!');
      } else {
        const res = await ProductAPI.create(payload);
        const newItem = res?.item || { ...payload, _id: `p-${Date.now()}` };
        setProducts(prev => [newItem, ...prev]);
        success('Product created successfully!');
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      notifyError(err?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    const isConfirmed = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmVariant: 'danger'
    });
    if (!isConfirmed) return;

    try {
      if (!id.startsWith('sample-')) {
        await ProductAPI.remove(id);
      }
      success('Product deleted successfully');
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      notifyError('Failed to delete product');
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      if (!product._id.startsWith('sample-')) {
        const updated = await ProductAPI.update(product._id, { isActive: !product.isActive });
        setProducts(prev => prev.map(p => p._id === product._id ? (updated.item || { ...p, isActive: !p.isActive }) : p));
      } else {
        setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: !p.isActive } : p));
      }
      success(`Product ${!product.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      notifyError('Failed to update status');
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      if (!product._id.startsWith('sample-')) {
        const updated = await ProductAPI.update(product._id, { isFeatured: !product.isFeatured });
        setProducts(prev => prev.map(p => p._id === product._id ? (updated.item || { ...p, isFeatured: !p.isFeatured }) : p));
      } else {
        setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isFeatured: !p.isFeatured } : p));
      }
      success(`Product ${!product.isFeatured ? 'marked featured' : 'unfeatured'}`);
    } catch (err) {
      notifyError('Failed to update featured state');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content p-6 md:p-8 max-w-7xl mx-auto w-full">
        <AdminTopbar />
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <Package size={28} className="text-blue-400" />
              Products Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Create, edit, and publish digital products, SaaS tools, and software solutions.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal(null)}
            className="inline-flex items-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Plus size={18} />
            Add New Product
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Products</div>
            <div className="text-3xl font-black text-white">{products.length}</div>
          </div>
          <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Featured Products</div>
            <div className="text-3xl font-black text-amber-400">{products.filter(p => p.isFeatured).length}</div>
          </div>
          <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Categories</div>
            <div className="text-3xl font-black text-blue-400">{categories.length - 1 || 1}</div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-[#1e2536] border border-slate-700/60 rounded-xl text-white placeholder-slate-400 text-sm outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#3b5fe2] text-white border border-blue-400/50'
                    : 'bg-[#1e2536] border border-slate-700/60 text-slate-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 bg-[#0f223f] border border-slate-700/60 rounded-2xl">
            <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading products dataset...</p>
          </div>
        )}

        {/* Datatable */}
        {!loading && (
          <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e2536]/80 text-slate-400 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-700/60">
                    <th className="py-4 px-5">Product</th>
                    <th className="py-4 px-5">Category</th>
                    <th className="py-4 px-5">Price</th>
                    <th className="py-4 px-5 text-center">Featured</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        No products found matching your filters.
                      </td>
                    </tr>
                  ) : filtered.map(p => (
                    <tr key={p._id} className="hover:bg-[#152744]/60 transition-colors group">
                      
                      {/* Title & Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#1e2536] border border-slate-700/60 flex items-center justify-center shrink-0 overflow-hidden">
                            {p.image ? (
                              <img src={getFileUrl(p.image)} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={20} className="text-blue-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white group-hover:text-blue-400 transition-colors">
                                {p.title}
                              </span>
                              {p.badge && (
                                <span className="px-2 py-0.5 rounded-md bg-[#3b5fe2]/20 border border-blue-500/30 text-blue-400 text-[10px] font-extrabold">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 truncate max-w-sm">
                              {p.tagline || p.description || 'No description provided.'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1e2536] border border-slate-700/60 text-slate-300">
                          {p.category || 'General'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-5 font-bold text-white">
                        {p.price > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400">${p.price}</span>
                            {p.originalPrice > p.price && (
                              <span className="text-slate-500 line-through text-xs">${p.originalPrice}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-blue-400">Free / Custom</span>
                        )}
                      </td>

                      {/* Featured */}
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          title="Toggle Featured State"
                          className={`p-1.5 rounded-lg border transition-all ${
                            p.isFeatured
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              : 'bg-[#1e2536] border-slate-700/60 text-slate-500 hover:text-amber-400'
                          }`}
                        >
                          <Star size={16} fill={p.isFeatured ? 'currentColor' : 'none'} />
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold border transition-all ${
                            p.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Draft'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${p.slug || p._id}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-[#1e2536] border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
                            title="Preview Public Page"
                          >
                            <ExternalLink size={16} />
                          </Link>
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                            title="Edit Product (Popup)"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.title)}
                            className="p-2 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── CRUD POPUP MODAL OVERLAY ─── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
            <div className="bg-[#0f223f] border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto border-t-4 border-t-[#3b5fe2]">
              
              {/* Modal Header */}
              <div className="sticky top-0 bg-[#0f223f] z-20 px-6 py-5 border-b border-slate-700/60 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Package size={22} className="text-blue-400" />
                    {editingProduct ? 'Edit Product Details' : 'Add New Product'}
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {editingProduct ? `Updating product: ${editingProduct.title}` : 'Fill in the information to publish a new product on the catalog.'}
                  </p>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl bg-[#1e2536] text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSaveProduct} className="p-6 md:p-8 space-y-6 flex-1">
                
                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Product Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      required
                      placeholder="e.g. Devugo AI Social Suite"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleFormChange}
                      placeholder="e.g. devugo-ai-social-suite"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      placeholder="e.g. SaaS, AI Solution, Automation"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Badge Tag */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      name="badge"
                      value={form.badge}
                      onChange={handleFormChange}
                      placeholder="e.g. PROPRIETARY ECOSYSTEM, POPULAR, NEW"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleFormChange}
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-sm outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Original Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Original / Discount Price ($)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={form.originalPrice}
                      onChange={handleFormChange}
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-sm outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Tagline (Short Summary)
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    value={form.tagline}
                    onChange={handleFormChange}
                    placeholder="e.g. Voice-first agricultural intelligence. No apps to install."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Full Description & Architecture Notes
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Detailed explanation of the product architecture and enterprise features..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-500 text-sm outline-none focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {/* Image Upload Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Product Logo / Feature Image
                  </label>
                  <div className="flex items-center gap-4 bg-[#1e2536] p-4 rounded-xl border border-slate-700/60">
                    {form.image ? (
                      <div className="w-16 h-16 rounded-xl bg-[#0f223f] border border-slate-700/60 overflow-hidden shrink-0">
                        <img src={getFileUrl(form.image)} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#0f223f] border border-slate-700/60 flex items-center justify-center text-slate-500 shrink-0">
                        <Package size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        name="image"
                        value={form.image}
                        onChange={handleFormChange}
                        placeholder="Image URL or upload file..."
                        className="w-full px-3 py-1.5 rounded-lg bg-[#0f223f] border border-slate-700/60 text-white text-xs mb-2 outline-none"
                      />
                      <label className="inline-flex items-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                        <Upload size={14} />
                        {uploading ? 'Uploading...' : 'Upload Image File'}
                        <input type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Dynamic Features List */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Key Checkmark Features
                  </label>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={e => setNewFeature(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                      placeholder="Add checkmark feature (e.g. Voice & WhatsApp Access)..."
                      className="flex-1 px-4 py-2 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-xs outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="bg-[#3b5fe2] text-white font-extrabold text-xs px-4 py-2 rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.features.map((feat, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#162a4a] border border-slate-700/60 text-xs font-bold text-slate-200">
                        <Check size={12} className="text-emerald-400" />
                        <span>{feat}</span>
                        <button type="button" onClick={() => removeFeature(i)} className="text-slate-400 hover:text-rose-400 ml-1">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dynamic Tech Stack Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Tech Stack Badges
                  </label>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={newTech}
                      onChange={e => setNewTech(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                      placeholder="Add tech badge (e.g. React, OpenAI)..."
                      className="flex-1 px-4 py-2 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-xs outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addTech}
                      className="bg-[#3b5fe2] text-white font-extrabold text-xs px-4 py-2 rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.techStack.map((tech, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1e2536] border border-slate-700/60 text-xs font-bold text-blue-300">
                        <span>{tech}</span>
                        <button type="button" onClick={() => removeTech(i)} className="text-slate-400 hover:text-rose-400 ml-1">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* External Action Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      name="demoUrl"
                      value={form.demoUrl}
                      onChange={handleFormChange}
                      placeholder="https://demo.devugo.tech"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-sm outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      WhatsApp / Buy Link
                    </label>
                    <input
                      type="text"
                      name="buyUrl"
                      value={form.buyUrl}
                      onChange={handleFormChange}
                      placeholder="/contact or https://wa.me/923000000000"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white text-sm outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center gap-6 pt-4 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleFormChange}
                      className="w-4 h-4 rounded border-slate-700 accent-blue-600"
                    />
                    <span>Mark as Featured Product</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleFormChange}
                      className="w-4 h-4 rounded border-slate-700 accent-emerald-600"
                    />
                    <span>Active & Published</span>
                  </label>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="sticky bottom-0 bg-[#0f223f] pt-6 pb-2 border-t border-slate-800 flex items-center justify-end gap-3 z-10">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-xl bg-[#1e2536] hover:bg-slate-700 text-slate-300 font-extrabold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? 'Saving Product...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
