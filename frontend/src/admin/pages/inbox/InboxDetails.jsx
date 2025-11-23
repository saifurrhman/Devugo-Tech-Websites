import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import ConversationView from './ConversationView';
import ReplyManagement from './ReplyManagement';

export default function InboxDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-4">
                    <button onClick={() => navigate('/admin/inbox')} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                        <span>←</span> Back to Inbox
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                    {/* Conversation Thread */}
                    <div className="lg:col-span-2 card bg-[#1e293b] rounded-xl border border-gray-800 flex flex-col overflow-hidden">
                        <ConversationView conversationId={id} />
                    </div>

                    {/* Right Sidebar: Contact Info & Quick Replies */}
                    <div className="space-y-6 overflow-y-auto">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                                    JD
                                </div>
                                <h3 className="text-lg font-bold">John Doe</h3>
                                <p className="text-gray-400 text-sm">john@example.com</p>
                                <div className="mt-3 inline-flex px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                    Verified Customer
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-gray-800 pt-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Company</label>
                                    <div className="text-sm">Acme Inc</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Location</label>
                                    <div className="text-sm">New York, US</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Last Activity</label>
                                    <div className="text-sm">10 mins ago</div>
                                </div>
                            </div>

                            <button className="w-full mt-6 btn-outline border-gray-600 hover:bg-gray-800 py-2 rounded-lg text-sm">
                                View Full Profile
                            </button>
                        </div>

                        <ReplyManagement />
                    </div>
                </div>
            </main>
        </div>
    );
}
