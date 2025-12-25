import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { InvoiceAPI } from '../../../lib/api';

export default function InvoicesList() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [stats, setStats] = useState({ totalRevenue: 0, pending: 0, overdue: 0, drafts: 0 });

    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [listData, statsData] = await Promise.all([
                InvoiceAPI.list(),
                InvoiceAPI.stats()
            ]);

            const list = Array.isArray(listData) ? listData : (listData.data || []);
            setInvoices(list);
            setStats(statsData.data || { totalRevenue: 0, pending: 0, overdue: 0, drafts: 0 });
        } catch (err) {
            console.error('Failed to load invoice data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = filter === 'all' ? invoices : invoices.filter(i => (i.status || 'Draft').toLowerCase() === filter);

    if (error) {
        return (
            <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
                <AdminSidebar />
                <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                    <AdminTopbar />
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-red-400 mb-2 font-medium">{error}</div>
                        <button
                            onClick={loadData}
                            className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-layout min-h-screen bg-[#002747] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Invoices</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your billing and payments</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/invoices/create')}
                        className="btn-primary bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                        <span>+</span> Create Invoice
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="card bg-[rgba(255,255,255,0.06)] p-5 rounded-2xl border border-white/10 shadow-lg">
                        <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Total Revenue</div>
                        <div className="text-3xl font-bold mt-2 text-white">${stats.totalRevenue.toLocaleString()}</div>
                    </div>
                    <div className="card bg-[rgba(255,255,255,0.06)] p-5 rounded-2xl border border-white/10 shadow-lg">
                        <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Pending</div>
                        <div className="text-3xl font-bold mt-2 text-yellow-400">${stats.pending.toLocaleString()}</div>
                    </div>
                    <div className="card bg-[rgba(255,255,255,0.06)] p-5 rounded-2xl border border-white/10 shadow-lg">
                        <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Overdue</div>
                        <div className="text-3xl font-bold mt-2 text-red-400">${stats.overdue.toLocaleString()}</div>
                    </div>
                    <div className="card bg-[rgba(255,255,255,0.06)] p-5 rounded-2xl border border-white/10 shadow-lg">
                        <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Drafts</div>
                        <div className="text-3xl font-bold mt-2 text-gray-400">${stats.drafts.toLocaleString()}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'paid', 'pending', 'overdue', 'draft'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-full text-sm font-medium border transition-all capitalize whitespace-nowrap ${filter === f
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                : 'bg-[rgba(255,255,255,0.06)] border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-400">Loading invoices...</p>
                    </div>
                ) : (
                    /* Invoices Table */
                    <div className="card bg-[rgba(255,255,255,0.06)] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-900/40 border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Invoice ID</th>
                                        <th className="px-6 py-4 font-semibold">Client</th>
                                        <th className="px-6 py-4 font-semibold">Amount</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Date</th>
                                        <th className="px-6 py-4 font-semibold text-right">Due Date</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {filteredInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                No invoices found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInvoices.map((inv) => (
                                            <tr key={inv.id || inv._id} className="hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/invoices/${inv.id || inv._id}`)}>
                                                <td className="px-6 py-4 font-medium text-blue-400">{inv.id || inv._id}</td>
                                                <td className="px-6 py-4 text-gray-200">{inv.client}</td>
                                                <td className="px-6 py-4 text-white font-medium">{inv.amount}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${inv.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        inv.status === 'Overdue' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            inv.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                        }`}>
                                                        {inv.status || 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-400">{inv.date || new Date().toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right text-gray-400">{inv.due || '-'}</td>
                                                <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                                    <button className="text-gray-400 hover:text-white mx-2 transition-colors">Edit</button>
                                                    <button className="text-gray-400 hover:text-white transition-colors">Download</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
