import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ContactAPI } from '../../../lib/api';

export default function ContactDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [contact, setContact] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        loadContact();
    }, [id]);

    const loadContact = async () => {
        try {
            setLoading(true);
            const data = await ContactAPI.get(id);
            setContact(data);
        } catch (err) {
            console.error("Failed to fetch contact", err);
            setError("Failed to load contact details");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this contact?")) return;
        try {
            await ContactAPI.delete(id);
            navigate('/admin/contacts');
        } catch (err) {
            console.error("Failed to delete contact", err);
            alert("Failed to delete contact");
        }
    };

    if (loading) return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error || !contact) return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />
                <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
                    <div className="text-red-400 text-xl">Failed to load contact details</div>
                    <button onClick={() => navigate('/admin/contacts')} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors">Back to Contacts</button>
                </div>
            </main>
        </div>
    );

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <button onClick={() => navigate('/admin/contacts')} className="text-sm text-gray-400 hover:text-white mb-2">← Back to Contacts</button>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                                {(contact.name || 'U').charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{contact.name}</h1>
                                <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                    <span>{contact.role || 'No Role'} at {contact.company || 'No Company'}</span>
                                    <span>•</span>
                                    <span className="text-green-400">{contact.status || 'Active'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm">Edit Profile</button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/20 transition-colors text-sm"
                            >
                                Delete
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium">Send Email</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Info */}
                    <div className="space-y-6">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Email</label>
                                    <div className="text-gray-200">{contact.email}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Phone</label>
                                    <div className="text-gray-200">{contact.phone || 'N/A'}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Location</label>
                                    <div className="text-gray-200">{contact.location || 'N/A'}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Joined</label>
                                    <div className="text-gray-200">{contact.joined || contact.createdAt || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {(contact.tags || []).map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 border border-gray-700">{tag}</span>
                                ))}
                                <button className="px-3 py-1 border border-dashed border-gray-600 rounded-full text-sm text-gray-500 hover:text-white hover:border-gray-500">+ Add</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity */}
                    <div className="lg:col-span-2">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-6">Activity Timeline</h3>
                            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-800">
                                {(contact.activity || []).length === 0 ? (
                                    <div className="pl-10 text-gray-500 text-sm">No recent activity</div>
                                ) : (
                                    (contact.activity || []).map((act, idx) => (
                                        <div key={idx} className="relative pl-10">
                                            <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-[#1e293b] -translate-x-1/2 ${act.type === 'email_open' ? 'bg-blue-500' :
                                                act.type === 'click' ? 'bg-green-500' :
                                                    'bg-purple-500'
                                                }`}></div>
                                            <div className="bg-[#0f172a] p-4 rounded-lg border border-gray-700">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-medium text-sm">{act.desc}</span>
                                                    <span className="text-xs text-gray-500">{act.date}</span>
                                                </div>
                                                <div className="text-xs text-gray-400 capitalize">{act.type.replace('_', ' ')}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
