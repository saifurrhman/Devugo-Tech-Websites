import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AuthAPI } from '../../lib/api';
import { UserPlus, Mail, Shield, RefreshCw, Trash2, CheckCircle, Clock, Activity, X, Eye } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export default function UsersList() {
    const navigate = useNavigate();
    const { success: showSuccess, error: showError } = useNotification();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'email_marketing'
    });
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await AuthAPI.getUsers();
            setUsers(res.data?.users || []);
        } catch (err) {
            console.error(err);
            // showError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviting(true);
        try {
            await AuthAPI.inviteUser(formData);
            showSuccess('Invitation sent successfully');
            setIsModalOpen(false);
            setFormData({ name: '', email: '', role: 'email_marketing' });
            fetchUsers();
        } catch (err) {
            showError(err.message || 'Failed to send invitation');
        } finally {
            setInviting(false);
        }
    };

    const handleResend = async (id) => {
        try {
            await AuthAPI.resendInvitation(id);
            showSuccess('Invitation resent');
        } catch (err) {
            showError(err.message || 'Failed to resend');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await AuthAPI.deleteUser(id);
            showSuccess('User deleted successfully');
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            showError(err.message || 'Failed to delete user');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? 'block' : 'unblock';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            const res = await AuthAPI.toggleUserStatus(id);
            showSuccess(res.message);
            // Update local state
            setUsers(users.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
        } catch (err) {
            showError(err.message || `Failed to ${action} user`);
        }
    };

    // Helper for role badge color
    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'email_marketing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'crm': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'website_manager': return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
            case 'blog_writer': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const formatRole = (role) => {
        if (role === 'email_marketing') return 'Email Marketing';
        if (role === 'crm') return 'CRM & Projects';
        if (role === 'website_manager') return 'Website Manager';
        if (role === 'blog_writer') return 'Blog Writer';
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content">
                <AdminTopbar />

                <div className="toolbar flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Users & Roles</h1>
                        <p className="text-gray-400 text-sm">Manage system access and permissions</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn w-full md:w-auto flex items-center justify-center gap-2"
                    >
                        <UserPlus size={18} />
                        Invite User
                    </button>
                </div>

                {loading ? (
                    <div className="card p-8 text-center text-gray-400">Loading users...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {users.map(user => (
                            <div key={user._id} className="card p-4 sm:p-5 relative group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4 gap-3">
                                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg ${user.isActive ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-white leading-tight truncate text-sm sm:text-base" title={user.name}>{user.name}</h3>
                                            <p className="text-xs sm:text-sm text-gray-400 truncate" title={user.email}>{user.email}</p>
                                        </div>
                                    </div>
                                    <span className={`flex-shrink-0 px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs border font-medium ${getRoleColor(user.role)}`}>
                                        {formatRole(user.role)}
                                    </span>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-700/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs">
                                        {user.isActive ? (
                                            <span className="text-green-500 flex items-center gap-1 font-medium">
                                                <CheckCircle size={14} /> Active
                                            </span>
                                        ) : (
                                            <span className="text-amber-500 flex items-center gap-1 font-medium">
                                                <Clock size={14} /> {user.invitationToken ? 'Pending' : 'Blocked'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 sm:gap-2">
                                        {/* Don't allow modifying self */}
                                        {user._id !== JSON.parse(localStorage.getItem('adminUser') || '{}')._id && (
                                            <>
                                                {/* View Activity */}
                                                <button
                                                    onClick={() => navigate(`/admin/users/${user._id}`)}
                                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                                                    title="View Activity & Profile"
                                                >
                                                    <Eye size={14} />
                                                </button>

                                                {/* Resend Invite (only if pending) */}
                                                {!user.isActive && user.invitationToken && (
                                                    <button
                                                        onClick={() => handleResend(user._id)}
                                                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                                                        title="Resend Invite"
                                                    >
                                                        <RefreshCw size={14} />
                                                    </button>
                                                )}

                                                {/* Block/Unblock */}
                                                <button
                                                    onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                    className={`p-1.5 rounded transition-colors ${user.isActive ? 'text-amber-500 hover:text-amber-400 hover:bg-amber-500/10' : 'text-green-500 hover:text-green-400 hover:bg-green-500/10'}`}
                                                    title={user.isActive ? "Block User" : "Unblock User"}
                                                >
                                                    {user.isActive ? <Shield size={14} /> : <CheckCircle size={14} />}
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* INVITE MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-700 bg-gray-800/50">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Mail className="text-blue-500" size={24} />
                                    Invite New User
                                </h3>
                            </div>

                            <form onSubmit={handleInvite} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. john@company.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Role / Access Level</label>
                                    <div className="space-y-2">
                                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.role === 'email_marketing' ? 'bg-blue-500/10 border-blue-500/50' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="email_marketing"
                                                checked={formData.role === 'email_marketing'}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                className="mt-1"
                                            />
                                            <div>
                                                <span className="block font-medium text-white">Email Marketing</span>
                                                <span className="text-xs text-gray-400">Campaigns, Templates, Recipients</span>
                                            </div>
                                        </label>

                                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.role === 'crm' ? 'bg-green-500/10 border-green-500/50' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="crm"
                                                checked={formData.role === 'crm'}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                className="mt-1"
                                            />
                                            <div>
                                                <span className="block font-medium text-white">CRM & Projects</span>
                                                <span className="text-xs text-gray-400">Pipeline, Projects, Invoices, Meetings</span>
                                            </div>
                                        </label>

                                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.role === 'website_manager' ? 'bg-pink-500/10 border-pink-500/50' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="website_manager"
                                                checked={formData.role === 'website_manager'}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                className="mt-1"
                                            />
                                            <div>
                                                <span className="block font-medium text-white">Website Manager</span>
                                                <span className="text-xs text-gray-400">Manage public site content (Services, Portfolio, Team etc)</span>
                                            </div>
                                        </label>

                                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.role === 'admin' ? 'bg-purple-500/10 border-purple-500/50' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="admin"
                                                checked={formData.role === 'admin'}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                className="mt-1"
                                            />
                                            <div>
                                                <span className="block font-medium text-white">Super Admin</span>
                                                <span className="text-xs text-gray-400">Full access to all systems</span>
                                            </div>
                                        </label>

                                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.role === 'blog_writer' ? 'bg-orange-500/10 border-orange-500/50' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="blog_writer"
                                                checked={formData.role === 'blog_writer'}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                className="mt-1"
                                            />
                                            <div>
                                                <span className="block font-medium text-white">Blog Writer</span>
                                                <span className="text-xs text-gray-400">Can manage blog posts only</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={inviting}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {inviting ? 'Sending...' : 'Send Invitation'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
