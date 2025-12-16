import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { ContactAPI } from '../../../lib/api';

export default function ContactsList() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            setLoading(true);
            const data = await ContactAPI.list();
            // Ensure data is an array, handle potential API response structures
            const list = Array.isArray(data) ? data : (data.data || []);
            setContacts(list);
        } catch (err) {
            console.error('Failed to load contacts:', err);
            setError('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = filter === 'all' ? contacts : contacts.filter(c => (c.status || 'Unverified').toLowerCase() === filter);

    if (error) {
        return (
            <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
                <AdminSidebar />
                <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                    <AdminTopbar />
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-red-400 mb-2 font-medium">{error}</div>
                        <button
                            onClick={loadContacts}
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
                        <h1 className="text-2xl font-bold">Contacts</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your subscribers and leads</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/admin/contacts/upload')}
                            className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
                        >
                            <span>📥</span> Import CSV
                        </button>
                        <button
                            className="btn-primary bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <span>+</span> Add Contact
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'verified', 'unverified', 'opened', 'clicked', 'replied'].map(f => (
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
                        <p className="text-gray-400">Loading contacts...</p>
                    </div>
                ) : (
                    /* Contacts Table */
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-center">Open %</th>
                                        <th className="px-6 py-3 text-center">Click %</th>
                                        <th className="px-6 py-3 text-right">Added</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredContacts.length === 0 ? (
                                        <tr>
                                            <td colspan="7" className="px-6 py-8 text-center text-gray-500">
                                                No contacts found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredContacts.map((contact) => (
                                            <tr key={contact.id || contact._id} className="hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/contacts/${contact.id || contact._id}`)}>
                                                <td className="px-6 py-4 font-medium text-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                                            {(contact.name || 'U').charAt(0)}
                                                        </div>
                                                        {contact.name || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">{contact.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs border ${contact.status === 'Verified' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        contact.status === 'Bounced' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                        }`}>
                                                        {contact.status || 'Unverified'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-300">{contact.openRate || 0}%</td>
                                                <td className="px-6 py-4 text-center text-gray-300">{contact.clickRate || 0}%</td>
                                                <td className="px-6 py-4 text-right text-gray-400">{contact.date || new Date().toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                                    <button className="text-gray-400 hover:text-white mx-2">Edit</button>
                                                    <button className="text-gray-400 hover:text-red-400">Delete</button>
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
