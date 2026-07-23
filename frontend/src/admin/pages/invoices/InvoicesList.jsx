import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { InvoiceAPI } from '../../../lib/api';

const statusColors = {
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    sent: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    viewed: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    partial: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    paid: 'bg-green-500/10 text-green-400 border-green-500/20',
    overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
    cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const statusLabels = {
    draft: 'Draft',
    sent: 'Sent',
    viewed: 'Viewed',
    partial: 'Partial',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
};

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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        try {
            await InvoiceAPI.remove(id);
            setInvoices(prev => prev.filter(inv => (inv._id || inv.id) !== id));
        } catch (err) {
            console.error('Failed to delete invoice:', err);
            alert('Failed to delete invoice');
        }
    };

    const filteredInvoices = filter === 'all' ? invoices : invoices.filter(i => (i.status || 'draft') === filter);

    const getClientName = (inv) => {
        if (inv.clientDetails?.name) return inv.clientDetails.name;
        if (typeof inv.client === 'object' && inv.client) {
            return `${inv.client.firstName || ''} ${inv.client.lastName || ''}`.trim() || inv.client.email || 'Unknown';
        }
        return 'Unknown Client';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return '-';
        }
    };

    const formatCurrency = (amount, currency = 'USD') => {
        const symbols = { USD: '$', EUR: '€', GBP: '£', PKR: '₨', INR: '₹' };
        const symbol = symbols[currency] || '$';
        return `${symbol}${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    };

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
                    {['all', 'paid', 'sent', 'overdue', 'draft', 'partial', 'cancelled'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-full text-sm font-medium border transition-all capitalize whitespace-nowrap ${filter === f
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                : 'bg-[rgba(255,255,255,0.06)] border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                                }`}
                        >
                            {f === 'sent' ? 'Sent / Unpaid' : f}
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
                                        <th className="px-6 py-4 font-semibold">Invoice #</th>
                                        <th className="px-6 py-4 font-semibold">Client</th>
                                        <th className="px-6 py-4 font-semibold">Amount</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Issue Date</th>
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
                                        filteredInvoices.map((inv) => {
                                            const invId = inv._id || inv.id;
                                            const status = inv.status || 'draft';
                                            return (
                                                <tr key={invId} className="hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/invoices/${invId}`)}>
                                                    <td className="px-6 py-4 font-medium text-blue-400">{inv.invoiceNumber || invId}</td>
                                                    <td className="px-6 py-4 text-gray-200">{getClientName(inv)}</td>
                                                    <td className="px-6 py-4 text-white font-medium">{formatCurrency(inv.total, inv.currency)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status] || statusColors.draft}`}>
                                                            {statusLabels[status] || status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-gray-400">{formatDate(inv.issueDate)}</td>
                                                    <td className="px-6 py-4 text-right text-gray-400">{formatDate(inv.dueDate)}</td>
                                                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                                        <button onClick={() => navigate(`/admin/invoices/${invId}`)} className="text-blue-400 hover:text-blue-300 mx-1 transition-colors text-xs">View</button>
                                                        <button onClick={() => handleDelete(invId)} className="text-red-400 hover:text-red-300 mx-1 transition-colors text-xs">Delete</button>
                                                    </td>
                                                </tr>
                                            );
                                        })
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
