import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { ProposalAPI } from '../../../lib/api';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useConfirm } from '../../../contexts/ConfirmContext';
import LoadingState from '../../components/LoadingState';
import Badge from '../../components/Badge';

export default function ProposalsList() {
    const navigate = useNavigate();
    const { success, error: notifyError } = useNotification();
    const confirm = useConfirm();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProposals();
    }, []);

    const loadProposals = async () => {
        try {
            setLoading(true);
            const data = await ProposalAPI.list();
            setProposals(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load proposals:', err);
            notifyError('Failed to load proposals');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        await confirm.show({
            title: 'Delete Proposal',
            message: 'Are you sure you want to delete this proposal?',
            variant: 'danger',
            confirmText: 'Delete',
            action: async () => {
                try {
                    await ProposalAPI.remove(id);
                    success('Proposal deleted successfully');
                    loadProposals();
                } catch (err) {
                    notifyError('Failed to delete proposal');
                }
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Sent': return 'info';
            case 'Accepted': return 'green';
            case 'Rejected': return 'red';
            default: return 'neutral';
        }
    };

    return (
        <div className="admin-layout min-h-screen bg-[#002747] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Proposals</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage your client proposals and pitches</p>
                    </div>
                    <Link
                        to="/admin/proposals/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create Proposal
                    </Link>
                </div>

                {!loading && proposals.length > 0 && (
                    <div className="card bg-[#003560] rounded-2xl border border-white/5 mb-6 p-4 flex flex-wrap gap-4 items-center">
                        <Badge status="neutral">Total: {proposals.length}</Badge>
                        <Badge status="info">Sent: {proposals.filter(p => p.status === 'Sent').length}</Badge>
                        <Badge status="green">Accepted: {proposals.filter(p => p.status === 'Accepted').length}</Badge>
                    </div>
                )}

                {loading ? (
                    <LoadingState message="Loading proposals..." />
                ) : proposals.length === 0 ? (
                    <div className="bg-[#003560] rounded-2xl border border-white/5 p-12 text-center">
                        <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} className="text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Proposals Yet</h3>
                        <p className="text-gray-400 mb-6">Create your first proposal to send to a client.</p>
                        <Link
                            to="/admin/proposals/new"
                            className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-6 py-2.5 rounded-xl font-medium transition-colors inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Create Proposal
                        </Link>
                    </div>
                ) : (
                    <div className="bg-[#003560] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                        <th className="px-6 py-4 font-semibold text-gray-300">Title</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300">Client</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300">Amount</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300">Status</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300">Date</th>
                                        <th className="px-6 py-4 font-semibold text-gray-300 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proposals.map(prop => (
                                        <tr 
                                            key={prop._id} 
                                            onClick={() => navigate(`/admin/proposals/${prop._id}`)}
                                            className="border-b border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{prop.title}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-300">{prop.clientName}</div>
                                                <div className="text-sm text-gray-500">{prop.clientEmail}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {prop.currency} {prop.amount?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge status={getStatusColor(prop.status)}>
                                                    {prop.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {new Date(prop.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/admin/proposals/${prop._id}`);
                                                        }}
                                                        className="btn-icon"
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(prop._id);
                                                        }}
                                                        className="btn-icon danger"
                                                        title="Delete"
                                                    >
                                                        🗑️
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
