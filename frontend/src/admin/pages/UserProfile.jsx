import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AuthAPI } from '../../lib/api';
import {
    User, Mail, Shield, Calendar, Clock, Activity,
    ArrowLeft, Monitor, CheckCircle, AlertTriangle,
    Trash2, RefreshCw, Download
} from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success: showSuccess, error: showError } = useNotification();

    const [user, setUser] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, [id]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            // Parallel fetch: User Details (from users list or fetch one) + Activity
            // Since we don't have a direct "getUserById" that returns everything in one go widely used, 
            // we might need to rely on the activity endpoint to give us stats, but we need basic user info too.
            // Assuming AuthAPI.getUsers() returns all, we can filter or we can add a specific getUser endpoint.
            // For now, let's try to get basic info from the activity endpoint if it includes it, 
            // OR reuse the getUsers list and find one (less efficient but works for now without backend change).
            // BETTER: The activity endpoint should ideally return user details. 
            // Let's assume for now we use the activity endpoint effectively, but we need basic profile info.

            // Actually, we can just use the user activity endpoint we created!
            // Wait, our getUserActivity endpoint only returns logs and stats.
            // We should probably first fetch the user list to get the user object, or update backend.
            // Let's do the "fetch all and find" for simplicity as we didn't add a specific "GET /users/:id" route yet.

            const usersRes = await AuthAPI.getUsers();
            const foundUser = usersRes.data?.users?.find(u => u._id === id);

            if (!foundUser) {
                showError('User not found');
                navigate('/admin/users');
                return;
            }
            setUser(foundUser);

            const activityRes = await AuthAPI.getUserActivity(id);
            if (activityRes.success) {
                setActivityLogs(activityRes.logs);
                setStats(activityRes.stats);
            }

        } catch (err) {
            console.error(err);
            showError(err.message || 'Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!user) return;
        const action = user.isActive ? 'block' : 'unblock';
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const res = await AuthAPI.toggleUserStatus(user._id);
            showSuccess(res.message);
            setUser({ ...user, isActive: !user.isActive });
        } catch (err) {
            showError(err.message || `Failed to ${action} user`);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this user? This cannot be undone.')) return;
        try {
            await AuthAPI.deleteUser(user._id);
            showSuccess('User deleted successfully');
            navigate('/admin/users');
        } catch (err) {
            showError(err.message || 'Failed to delete user');
        }
    };

    const handleResendInvite = async () => {
        try {
            await AuthAPI.resendInvitation(user._id);
            showSuccess('Invitation resent successfully');
        } catch (err) {
            showError(err.message || 'Failed to resend invitation');
        }
    };

    const handleExport = () => {
        if (!activityLogs.length) return showError('No logs to export');

        const headers = ['Timestamp', 'Action', 'Method', 'Path', 'IP Address', 'User Agent'];
        const csvContent = [
            headers.join(','),
            ...activityLogs.map(log => [
                new Date(log.timestamp).toISOString(),
                `"${log.action}"`,
                log.method,
                log.path,
                log.ip,
                `"${(log.userAgent || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_log_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showSuccess('Activity log exported successfully');
    };

    if (loading) {
        return (
            <div className="admin-layout">
                <AdminSidebar />
                <main className="admin-content flex items-center justify-center min-h-screen">
                    <div className="text-gray-400 flex flex-col items-center gap-2">
                        <RefreshCw className="animate-spin" size={32} />
                        <p>Loading user profile...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content p-6">
                <AdminTopbar />

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={18} /> Back to Users
                    </button>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                        <div className="flex items-center gap-5">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${user.isActive ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
                                <div className="flex items-center gap-4 text-gray-400 text-sm">
                                    <span className="flex items-center gap-1.5">
                                        <Mail size={14} /> {user.email}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded textxs font-medium border ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        }`}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {!user.isActive && user.invitationToken && (
                                <button onClick={handleResendInvite} className="btn-secondary flex items-center gap-2">
                                    <Mail size={16} /> Resend Invite
                                </button>
                            )}

                            <button
                                onClick={handleToggleStatus}
                                className={`px-4 py-2 rounded-lg border font-medium flex items-center gap-2 transition-colors ${user.isActive
                                    ? 'border-amber-500/50 text-amber-500 hover:bg-amber-500/10'
                                    : 'border-green-500/50 text-green-500 hover:bg-green-500/10'
                                    }`}
                            >
                                {user.isActive ? <><Shield size={16} /> Block User</> : <><CheckCircle size={16} /> Unblock User</>}
                            </button>

                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-5 border border-gray-700 bg-gray-800/30">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Clock size={14} /> Active Time
                        </div>
                        <div className="text-3xl font-mono text-blue-400">{stats?.activeTime || '0h 0m'}</div>
                    </div>

                    <div className="card p-5 border border-gray-700 bg-gray-800/30">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Activity size={14} /> Total Actions
                        </div>
                        <div className="text-3xl font-mono text-green-400">{stats?.totalActions || 0}</div>
                    </div>

                    <div className="card p-5 border border-gray-700 bg-gray-800/30">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Calendar size={14} /> Last Active
                        </div>
                        <div className="text-lg font-medium text-white truncate">
                            {stats?.lastActive ? new Date(stats.lastActive).toLocaleString() : 'Never'}
                        </div>
                    </div>

                    <div className="card p-5 border border-gray-700 bg-gray-800/30">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Monitor size={14} /> Top IP Address
                        </div>
                        <div className="text-xl font-mono text-amber-400 truncate">
                            {stats?.topIPs?.[0] || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Activity Log Table */}
                <div className="card border border-gray-700 bg-gray-800/30 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <Activity size={18} className="text-blue-400" />
                            Activity Logs
                        </h3>
                        <span className="text-xs text-gray-500">Last 100 actions</span>

                        <div className="flex gap-2">
                            <button
                                onClick={fetchUserData}
                                className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-700/50 transition-colors"
                                title="Refresh Data"
                            >
                                <RefreshCw size={16} />
                            </button>
                            <button
                                onClick={handleExport}
                                className="p-1.5 text-blue-400 hover:text-blue-300 rounded hover:bg-blue-500/10 transition-colors"
                                title="Export CSV"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-xs uppercase border-b border-gray-700 bg-gray-800/50">
                                    <th className="p-4 font-medium">Time</th>
                                    <th className="p-4 font-medium">Method</th>
                                    <th className="p-4 font-medium">Path</th>
                                    <th className="p-4 font-medium">IP Address</th>
                                    <th className="p-4 font-medium">User Agent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50 text-sm">
                                {activityLogs.length > 0 ? (
                                    activityLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="p-4 text-gray-300 font-mono whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${log.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    log.method === 'POST' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        log.method === 'DELETE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                    {log.method}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-300 font-mono text-xs break-all">
                                                {log.path}
                                            </td>
                                            <td className="p-4 text-amber-500/80 font-mono text-xs">
                                                {log.ip}
                                            </td>
                                            <td className="p-4 text-gray-500 text-xs truncate max-w-[200px]" title={log.userAgent}>
                                                {log.userAgent}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-gray-500">
                                            No activity recorded yet or log is empty.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
