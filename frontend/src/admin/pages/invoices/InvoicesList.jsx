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

    React.useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const data = await InvoiceAPI.list();
            const list = Array.isArray(data) ? data : (data.data || []);
            setInvoices(list);
        } catch (err) {
            console.error('Failed to load invoices:', err);
            setError('Failed to load invoices');
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
                            onClick={loadInvoices}
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
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Invoices</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your billing and payments</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/invoices/create')}
                        className="btn-primary bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <span>+</span> Create Invoice
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="card bg-[#1e293b] p-4 rounded-xl border border-gray-800">
                        <div className="text-xs text-gray-400 uppercase">Total Revenue</div>
                        <div className="text-2xl font-bold mt-1">$45,200</div>
                    </div>
                    <div className="card bg-[#1e293b] p-4 rounded-xl border border-gray-800">
                        <div className="text-xs text-gray-400 uppercase">Pending</div>
                        <div className="text-2xl font-bold mt-1 text-yellow-400">$2,500</div>
                    </div>
                    <div className="card bg-[#1e293b] p-4 rounded-xl border border-gray-800">
                        <div className="text-xs text-gray-400 uppercase">Overdue</div>
                        <div className="text-2xl font-bold mt-1 text-red-400">$12,000</div>
                    </div>
                    <div className="card bg-[#1e293b] p-4 rounded-xl border border-gray-800">
                        <div className="text-xs text-gray-400 uppercase">Drafts</div>
                        <div className="text-2xl font-bold mt-1 text-gray-400">$8,000</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'paid', 'pending', 'overdue', 'draft'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm border transition-colors capitalize whitespace-nowrap ${filter === f
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
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
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-3">Invoice ID</th>
                                        <th className="px-6 py-3">Client</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Date</th>
                                        <th className="px-6 py-3 text-right">Due Date</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                No invoices found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInvoices.map((inv) => (
                                            <tr key={inv.id || inv._id} className="hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/invoices/${inv.id || inv._id}`)}>
                                                <td className="px-6 py-4 font-medium text-blue-400">{inv.id || inv._id}</td>
                                                <td className="px-6 py-4 text-white">{inv.client}</td>
                                                <td className="px-6 py-4 text-gray-200 font-medium">{inv.amount}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs border ${inv.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
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
                                                    <button className="text-gray-400 hover:text-white mx-2">Edit</button>
                                                    <button className="text-gray-400 hover:text-white">Download</button>
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
