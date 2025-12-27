import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { useNotification } from '../../../contexts/NotificationContext';
import { ContactAPI, ListAPI } from '../../../lib/api';
import VerificationDetailsModal from '../../components/verification/VerificationModal';
import ContactListModal from '../../components/contacts/ContactListModal';
import { UserPlus, Plus, Download, Upload, List as ListIcon, Trash2, Edit2, CheckCircle, XCircle, ChevronLeft, UserCheck } from 'lucide-react';

import CustomSelect from '../../../components/CustomSelect';

export default function ContactsList() {
    const navigate = useNavigate();
    const { success, error: notifyError } = useNotification();

    const location = useLocation();

    // UI State
    const [activeTab, setActiveTab] = useState(location.pathname.includes('recipients') ? 'subscribers' : 'leads'); // subscribers, leads, lists
    const [filter, setFilter] = useState('all');

    // Data State
    const [contacts, setContacts] = useState([]);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifyData, setVerifyData] = useState(null);
    const [selectedContactIds, setSelectedContactIds] = useState([]);
    const [addToListModalOpen, setAddToListModalOpen] = useState(false);
    const [targetListId, setTargetListId] = useState('');
    const [listModalOpen, setListModalOpen] = useState(false);
    const [creatingList, setCreatingList] = useState(false);
    const [selectedList, setSelectedList] = useState(null);

    const toggleSelectAll = () => {
        if (selectedContactIds.length === filteredContacts.length) {
            setSelectedContactIds([]);
        } else {
            setSelectedContactIds(filteredContacts.map(c => c.id || c._id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedContactIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleAddToList = async () => {
        if (!targetListId) return notifyError('Please select a list');
        try {
            await ListAPI.addContacts(targetListId, selectedContactIds);
            success(`Added ${selectedContactIds.length} contacts to list`);
            setAddToListModalOpen(false);
            setSelectedContactIds([]);
            // Optionally reload list counts if needed, or if we are in list view
            if (activeTab === 'lists') loadData();
        } catch (err) {
            notifyError(err.message || 'Failed to add to list');
        }
    };

    // ... rest of imports

    // Add this Modal near the bottom


    // ... In render ...

    // Action Bar when selected


    // ... Table Headers ...


    // ... Table Row ...


    React.useEffect(() => {
        loadData();
    }, [activeTab, selectedList]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'lists' && !selectedList) {
                const data = await ListAPI.list();
                setLists(Array.isArray(data) ? data : []);
            } else if (selectedList) {
                // Load contacts for specific list
                const data = await ListAPI.getContacts(selectedList._id);
                setContacts(Array.isArray(data) ? data : []);
            } else {
                // Load contacts based on tab
                let params = {};
                // Server-side filtering
                if (activeTab === 'subscribers') {
                    // Try to fetch only imports from server if supported, 
                    // otherwise fetch all and filter client-side.
                    // params.source = 'Import'; 
                } else if (activeTab === 'leads') {
                    params.source = 'Manual';
                }

                const data = await ContactAPI.list(params);
                let list = Array.isArray(data) ? data : (data.items || data.data || []);

                // Client-side strict separation
                if (activeTab === 'subscribers') {
                    // Show Import, CSV, or Upload sources
                    list = list.filter(c => {
                        const src = (c.source || '').toLowerCase();
                        return src.includes('import') || src.includes('csv') || src.includes('upload');
                    });
                } else if (activeTab === 'leads') {
                    // Show Manual or anything that is NOT Import
                    list = list.filter(c => {
                        const src = (c.source || '').toLowerCase();
                        return !src.includes('import') && !src.includes('csv') && !src.includes('upload');
                    });
                }

                setContacts(list);
            }
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) return;
        try {
            await ContactAPI.delete(id);
            setContacts(prev => prev.filter(c => (c.id || c._id) !== id));
            success('Contact deleted successfully');
        } catch (err) {
            console.error('Delete failed', err);
            notifyError('Failed to delete contact');
        }
    };

    const handleCreateList = async (listData) => {
        setCreatingList(true);
        try {
            await ListAPI.create(listData);
            success('List created successfully');
            setListModalOpen(false);
            loadData(); // Reload lists
        } catch (err) {
            notifyError(err.message || 'Failed to create list');
        } finally {
            setCreatingList(false);
        }
    };

    const handleDeleteList = async (id) => {
        if (!window.confirm('Delete this list? Contacts inside will NOT be deleted.')) return;
        try {
            await ListAPI.delete(id);
            setLists(prev => prev.filter(l => l._id !== id));
            success('List deleted');
        } catch (err) {
            notifyError('Failed to delete list');
        }
    };

    // Add Contact Modal State
    const [addContactModalOpen, setAddContactModalOpen] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', company: '' });
    const [addingContact, setAddingContact] = useState(false);

    const handleCreateContact = async (e) => {
        e.preventDefault();
        setAddingContact(true);
        try {
            const payload = {
                ...newContact,
                source: 'Manual'
            };
            const res = await ContactAPI.create(payload);
            // The API returns { message: '...', contact: {...} }
            setContacts(prev => [res.contact || res, ...prev]);
            success('Contact added successfully');
            setAddContactModalOpen(false);
            setNewContact({ name: '', email: '', phone: '', company: '' });
        } catch (err) {
            console.error(err);
            notifyError(err.message || 'Failed to create contact');
        } finally {
            setAddingContact(false);
        }
    };


    const handleVerify = async (e, contact) => {
        e.stopPropagation();
        setVerifyModalOpen(true);
        setVerifying(true);
        try {
            const res = await ContactAPI.verify(contact.id || contact._id);
            setVerifyData(res);
            setContacts(prev => prev.map(c =>
                (c.id || c._id) === (contact.id || contact._id)
                    ? { ...c, status: res.is_safe_to_send ? 'Verified' : 'Bounced' }
                    : c
            ));
        } catch (err) {
            console.error(err);
            notifyError('Verification failed');
            setVerifyModalOpen(false);
        } finally {
            setVerifying(false);
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
                        <button onClick={loadData} className="text-sm bg-red-500/20 text-red-300 px-4 py-2 rounded-lg">Retry</button>
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
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {selectedList && (
                                <button onClick={() => setSelectedList(null)} className="hover:bg-gray-800 p-1 rounded">
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            {selectedList ? selectedList.name : 'Contacts'}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {selectedList ? 'Manage contacts in this list' : 'Manage your subscribers and leads'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {activeTab === 'lists' && !selectedList ? (
                            <button
                                onClick={() => setListModalOpen(true)}
                                className="btn-primary bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} /> New list
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/admin/recipients/upload')}
                                    className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
                                >
                                    <Upload size={16} /> Import CSV
                                </button>
                                <button
                                    onClick={() => setAddContactModalOpen(true)}
                                    className="btn-primary bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} /> Add Contact
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Bar when selected */}
                {selectedContactIds.length > 0 && (
                    <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-3 mb-4 flex justify-between items-center text-sm">
                        <span className="text-blue-200">{selectedContactIds.length} contacts selected</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (lists.length === 0) ListAPI.list().then(d => setLists(Array.isArray(d) ? d : []));
                                    setAddToListModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                            >
                                Add to List
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm(`Delete ${selectedContactIds.length} contacts?`)) {
                                        Promise.all(selectedContactIds.map(id => ContactAPI.delete(id)))
                                            .then(() => {
                                                success('Contacts deleted');
                                                setSelectedContactIds([]);
                                                loadData();
                                            });
                                    }
                                }}
                                className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded transition-colors"
                            >
                                <Trash2 size={14} className="mr-1 inline" /> Delete
                            </button>
                        </div>
                    </div>
                )}

                {/* TABS */}
                {!selectedList && (
                    <div className="border-b border-gray-800 mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-end">
                        <div className="flex gap-6 w-full sm:w-auto overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('subscribers')}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'subscribers' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                Subscribers (CSV)
                            </button>
                            <button
                                onClick={() => setActiveTab('leads')}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'leads' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                Leads (Website)
                            </button>

                            <button
                                onClick={() => setActiveTab('lists')}
                                className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'lists' ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                Your lists
                            </button>
                        </div>

                        {/* Status Filter */}
                        <div className="pb-2">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="bg-[#1e293b] border border-gray-700 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-48 p-2"
                            >
                                <option value="all">All Status</option>
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                                <option value="bounced">Bounced</option>
                                <option value="unsubscribed">Unsubscribed</option>
                                <option value="new">New</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* DEBUG INFO REMOVED */}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-400">Loading...</p>
                    </div>
                ) : (
                    <>
                        {/* LISTS VIEW */}
                        {activeTab === 'lists' && !selectedList && (
                            <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                                            <tr>
                                                <th className="px-6 py-3">Name</th>
                                                <th className="px-6 py-3">Contacts</th>
                                                <th className="px-6 py-3">Created</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {lists.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                        <ListIcon size={48} className="mx-auto mb-4 opacity-20" />
                                                        <p className="text-lg font-medium text-gray-400">No lists created yet</p>
                                                        <button onClick={() => setListModalOpen(true)} className="mt-4 text-blue-400 hover:text-blue-300">Create your first list</button>
                                                    </td>
                                                </tr>
                                            ) : (
                                                lists.map(list => (
                                                    <tr key={list._id} className="hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => setSelectedList(list)}>
                                                        <td className="px-6 py-4 font-medium text-white">{list.name}</td>
                                                        <td className="px-6 py-4 text-gray-300">
                                                            <span className="bg-gray-800 px-2 py-1 rounded text-xs">{list.count || 0} contacts</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-400">{new Date(list.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => handleDeleteList(list._id)} className="text-gray-500 hover:text-red-400 p-2">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* CONTACTS VIEW (Standard) */}
                        {(activeTab !== 'lists' || selectedList) && (
                            <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                                            <tr>
                                                <th className="pl-6 py-3 w-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={filteredContacts.length > 0 && selectedContactIds.length === filteredContacts.length}
                                                        onChange={toggleSelectAll}
                                                        className="rounded border-gray-700 bg-gray-800"
                                                    />
                                                </th>
                                                <th className="px-6 py-3">Name</th>
                                                <th className="px-6 py-3">Email</th>
                                                <th className="px-6 py-3">Lists</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3 text-center">Score</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {filteredContacts.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                        No contacts found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredContacts.map((contact) => (
                                                    <tr key={contact.id || contact._id} className="hover:bg-gray-800/30 transition-colors">
                                                        <td className="pl-6 py-4 w-4" onClick={e => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedContactIds.includes(contact.id || contact._id)}
                                                                onChange={() => toggleSelect(contact.id || contact._id)}
                                                                className="rounded border-gray-700 bg-gray-800"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-white">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                                                    {(contact.name || 'U').charAt(0)}
                                                                </div>
                                                                {contact.name || 'Unknown'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-300">{contact.email}</td>
                                                        <td className="px-6 py-4 text-gray-400 text-xs">
                                                            {contact.lists && contact.lists.length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {contact.lists.map(listId => {
                                                                        const list = lists.find(l => l._id === listId);
                                                                        return list ? (
                                                                            <span key={listId} className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                                                                                {list.name}
                                                                            </span>
                                                                        ) : null;
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-600">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs border ${contact.status === 'Verified' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                contact.status === 'Bounced' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                                }`}>
                                                                {contact.status || 'Unverified'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${(contact.leadScore || 0) > 70 ? 'text-green-400 bg-green-900/20' : 'text-gray-500'}`}>
                                                                {contact.leadScore || 0}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={(e) => handleVerify(e, contact)}
                                                                className="text-blue-400 hover:text-blue-300 mx-2 text-xs"
                                                            >
                                                                Verify
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(contact.id || contact._id)}
                                                                className="text-gray-500 hover:text-red-400"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            <VerificationDetailsModal
                isOpen={verifyModalOpen}
                onClose={() => setVerifyModalOpen(false)}
                loading={verifying}
                data={verifyData}
            />

            <ContactListModal
                isOpen={listModalOpen}
                onClose={() => setListModalOpen(false)}
                onSave={handleCreateList}
                loading={creatingList}
            />

            {addToListModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#1e293b] rounded-xl border border-gray-800 w-full max-w-sm shadow-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Add directly to List</h2>
                        <p className="text-gray-400 text-sm mb-4">Adding {selectedContactIds.length} contacts</p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Select List</label>
                            <select
                                value={targetListId}
                                onChange={(e) => setTargetListId(e.target.value)}
                                className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="" className="bg-[#002747] text-white">-- Choose a list --</option>
                                {lists.map(l => (
                                    <option key={l._id} value={l._id} className="bg-[#002747] text-white py-2">{l.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setAddToListModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={handleAddToList} className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500">Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Contact Modal */}
            {addContactModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#1e293b] rounded-xl border border-gray-800 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Add New Contact</h2>
                            <button onClick={() => setAddContactModalOpen(false)} className="text-gray-400 hover:text-white">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateContact} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newContact.name}
                                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newContact.email}
                                    onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Company (Optional)</label>
                                <input
                                    type="text"
                                    value={newContact.company}
                                    onChange={e => setNewContact({ ...newContact, company: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                    placeholder="Acme Inc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Phone (Optional)</label>
                                <input
                                    type="tel"
                                    value={newContact.phone}
                                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setAddContactModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={addingContact}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {addingContact ? 'Adding...' : 'Add Contact'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

