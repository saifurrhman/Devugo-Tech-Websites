import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { InboxAPI } from '../../../lib/api';
import ConversationView from './ConversationView';

export default function InboxList() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [filter, setFilter] = useState('all');
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadInbox();
    }, []);

    const loadInbox = async () => {
        try {
            setLoading(true);
            const data = await InboxAPI.list();
            const list = Array.isArray(data) ? data : (data.data || []);
            setConversations(list);
        } catch (err) {
            console.error('Failed to load inbox:', err);
            setError('Failed to load inbox');
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = filter === 'all' ? conversations :
        filter === 'unread' ? conversations.filter(c => (c.status || 'unread') === 'unread') :
            conversations;

    if (error) {
        return (
            <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
                <AdminSidebar />
                <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                    <AdminTopbar />
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-red-400 mb-2 font-medium">{error}</div>
                        <button
                            onClick={loadInbox}
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

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Inbox</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage customer conversations</p>
                    </div>
                    <button className="btn-primary bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Compose New
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
                    {/* Sidebar / List */}
                    <div className={`lg:col-span-1 card bg-[#1e293b] rounded-xl border border-gray-800 flex flex-col overflow-hidden ${id ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-800">
                            <input
                                type="text"
                                placeholder="Search inbox..."
                                className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                            />
                            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                                {['all', 'unread', 'crm', 'promotions', 'starred'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border transition-colors capitalize ${filter === f ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                                    <p className="text-gray-400 text-xs">Loading...</p>
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No conversations found.
                                </div>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <div
                                        key={conv.id || conv._id}
                                        onClick={() => navigate(`/admin/inbox/${conv.id || conv._id}`)}
                                        className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors ${conv.status === 'unread' ? 'bg-blue-900/10 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'} ${(id === (conv.id || conv._id)) ? 'bg-gray-800' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`font-medium text-sm ${conv.status === 'unread' ? 'text-white' : 'text-gray-300'}`}>{conv.user || 'Unknown User'}</span>
                                            <span className="text-xs text-gray-500">{conv.time || 'Recently'}</span>
                                        </div>
                                        <div className={`text-sm mb-1 truncate ${conv.status === 'unread' ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>{conv.subject || '(No Subject)'}</div>
                                        <div className="text-xs text-gray-500 truncate">{conv.preview || ''}</div>
                                        <div className="mt-2 flex gap-1">
                                            {(conv.tags || []).map(tag => (
                                                <span key={tag} className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px] text-gray-300">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className={`lg:col-span-3 card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden ${id ? 'flex' : 'hidden lg:flex'}`}>
                        {id ? (
                            <ConversationView conversationId={id} />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center p-8">
                                <div>
                                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                                        📩
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                                    <p className="text-gray-400">Choose a message from the list to view details and reply.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
