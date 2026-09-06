import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { ProductAPI, getFileUrl } from '../../lib/api';
import { Plus, Search, Edit2, Trash2, ExternalLink, Star, Package, Check, X, Tag } from 'lucide-react';
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
    badge: 'Popular',
    tagline: 'AI-powered social media management & automation platform.',
    isFeatured: true,
    isActive: true,
    image: '',
  },
  {
    _id: 'sample-p2',
    title: 'CRO Audit & Funnel Builder',
    slug: 'cro-audit-funnel-builder',
    category: 'SaaS',
    price: 99,
    originalPrice: 199,
    currency: 'USD',
    badge: 'Featured',
    tagline: 'Conversion rate optimization suite for e-commerce and landing pages.',
    isFeatured: true,
    isActive: true,
    image: '',
  },
  {
    _id: 'sample-p3',
    title: 'Smart Leads Engine',
    slug: 'smart-leads-engine',
    category: 'Automation',
    price: 29,
    originalPrice: 59,
    currency: 'USD',
    badge: 'New',
    tagline: 'B2B lead generation & email verification automation web app.',
    isFeatured: false,
    isActive: true,
    image: '',
  }
];

export default function ProductsList() {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  const confirm = useConfirm();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const handleDelete = async (id, title) => {
    const isConfirmed = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmVariant: 'danger'
    });
    if (!isConfirmed) return;

    try {
      await ProductAPI.remove(id);
      success('Product deleted successfully');
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      notifyError('Failed to delete product');
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const updated = await ProductAPI.update(product._id, { isActive: !product.isActive });
      success(`Product ${!product.isActive ? 'activated' : 'deactivated'}`);
      setProducts(prev => prev.map(p => p._id === product._id ? (updated.item || { ...p, isActive: !p.isActive }) : p));
    } catch (err) {
      notifyError('Failed to update status');
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      const updated = await ProductAPI.update(product._id, { isFeatured: !product.isFeatured });
      success(`Product ${!product.isFeatured ? 'marked featured' : 'unfeatured'}`);
      setProducts(prev => prev.map(p => p._id === product._id ? (updated.item || { ...p, isFeatured: !p.isFeatured }) : p));
    } catch (err) {
      notifyError('Failed to update featured state');
    }
  };

  return (
    <div className="admin-layout min-h-screen bg-[#09121f] text-white flex">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        
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

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all shrink-0"
          >
            <Plus size={18} />
            Add New Product
          </Link>
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

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-[#0f223f] border border-slate-700/60 p-4 rounded-2xl">
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1e2536] border border-slate-700/60 text-white placeholder-slate-400 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 shrink-0">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#3b5fe2] text-white'
                    : 'bg-[#1e2536] text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20 bg-[#0f223f] border border-slate-700/60 rounded-2xl">
            <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#0f223f] border border-slate-700/60 rounded-2xl">
            <Package size={48} className="mx-auto text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
            <p className="text-slate-400 text-sm mb-4">Try clearing search filters or create a new product.</p>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 bg-[#3b5fe2] hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm"
            >
              <Plus size={16} /> Create Product
            </Link>
          </div>
        ) : (
          /* Products Table */
          <div className="bg-[#0f223f] border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#132545] text-xs uppercase font-extrabold text-slate-400 border-b border-slate-700/60">
                  <tr>
                    <th className="py-4 px-5">Product</th>
                    <th className="py-4 px-5">Category</th>
                    <th className="py-4 px-5">Price</th>
                    <th className="py-4 px-5 text-center">Featured</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map(p => (
                    <tr key={p._id} className="hover:bg-[#132747] transition-colors">
                      
                      {/* Product Name & Tagline */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#1e2536] border border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0">
                            {p.image ? (
                              <img src={getFileUrl(p.image)} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={20} className="text-blue-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-white text-base flex items-center gap-2">
                              {p.title}
                              {p.badge && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
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
                          <Link
                            to={`/admin/products/edit/${p._id}`}
                            className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.title)}
                            className="p-2 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
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

      </main>
    </div>
  );
}
