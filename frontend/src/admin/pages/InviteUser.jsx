import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AuthAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import { Mail, ArrowLeft, CheckCircle, Shield, Globe, PenTool, Layout, Users } from 'lucide-react';

export default function InviteUser() {
    const navigate = useNavigate();
    const { success: showSuccess, error: showError } = useNotification();
    const [inviting, setInviting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'email_marketing'
    });

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviting(true);
        try {
            await AuthAPI.inviteUser(formData);
            showSuccess('Invitation sent successfully');
            navigate('/admin/users');
        } catch (err) {
            showError(err.message || 'Failed to send invitation');
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <main className="admin-content">
                <AdminTopbar />

                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Users
                    </button>

                    <div className="card overflow-hidden">
                        <div className="p-6 border-b border-gray-700 bg-gray-800/50">
                            <h1 className="text-xl font-bold flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Mail className="text-blue-500" size={24} />
                                </div>
                                Invite New User
                            </h1>
                            <p className="text-gray-400 text-sm mt-1 ml-[52px]">
                                Send an invitation email to add a new administrator to the team.
                            </p>
                        </div>

                        <form onSubmit={handleInvite} className="p-6 md:p-8 space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                                        placeholder="e.g. John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                                        placeholder="e.g. john@company.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-4">Role & Permissions</label>
                                <div className="grid sm:grid-cols-2 gap-4">

                                    {/* Email Marketing */}
                                    <label className={`relative flex p-4 cursor-pointer rounded-xl border-2 transition-all group ${formData.role === 'email_marketing' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-[#003560] hover:border-gray-500'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="email_marketing"
                                            checked={formData.role === 'email_marketing'}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="sr-only"
                                        />
                                        <div className="flex gap-4">
                                            <div className={`mt-1 p-2 rounded-lg h-fit ${formData.role === 'email_marketing' ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-300 group-hover:bg-white/20'}`}>
                                                <Mail size={20} />
                                            </div>
                                            <div>
                                                <span className={`block font-bold mb-1 ${formData.role === 'email_marketing' ? 'text-white' : 'text-white'}`}>Email Marketing</span>
                                                <span className="text-xs text-gray-300 leading-relaxed block">
                                                    Manage campaigns, templates, recipients, and view email analytics.
                                                </span>
                                            </div>
                                        </div>
                                        {formData.role === 'email_marketing' && (
                                            <div className="absolute top-4 right-4 text-blue-500">
                                                <CheckCircle size={20} fill="currentColor" className="text-blue-500 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </label>

                                    {/* CRM */}
                                    <label className={`relative flex p-4 cursor-pointer rounded-xl border-2 transition-all group ${formData.role === 'crm' ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-[#003560] hover:border-gray-500'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="crm"
                                            checked={formData.role === 'crm'}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="sr-only"
                                        />
                                        <div className="flex gap-4">
                                            <div className={`mt-1 p-2 rounded-lg h-fit ${formData.role === 'crm' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300 group-hover:bg-white/20'}`}>
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <span className={`block font-bold mb-1 ${formData.role === 'crm' ? 'text-white' : 'text-white'}`}>CRM & Projects</span>
                                                <span className="text-xs text-gray-300 leading-relaxed block">
                                                    Manage pipelines, projects, invoices, meetings, and leads.
                                                </span>
                                            </div>
                                        </div>
                                        {formData.role === 'crm' && (
                                            <div className="absolute top-4 right-4 text-green-500">
                                                <CheckCircle size={20} fill="currentColor" className="text-green-500 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </label>

                                    {/* Website Manager */}
                                    <label className={`relative flex p-4 cursor-pointer rounded-xl border-2 transition-all group ${formData.role === 'website_manager' ? 'border-pink-500 bg-pink-500/10' : 'border-white/10 bg-[#003560] hover:border-gray-500'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="website_manager"
                                            checked={formData.role === 'website_manager'}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="sr-only"
                                        />
                                        <div className="flex gap-4">
                                            <div className={`mt-1 p-2 rounded-lg h-fit ${formData.role === 'website_manager' ? 'bg-pink-500 text-white' : 'bg-white/10 text-gray-300 group-hover:bg-white/20'}`}>
                                                <Globe size={20} />
                                            </div>
                                            <div>
                                                <span className={`block font-bold mb-1 ${formData.role === 'website_manager' ? 'text-white' : 'text-white'}`}>Website Manager</span>
                                                <span className="text-xs text-gray-300 leading-relaxed block">
                                                    Manage services, portfolio, team members, and site content.
                                                </span>
                                            </div>
                                        </div>
                                        {formData.role === 'website_manager' && (
                                            <div className="absolute top-4 right-4 text-pink-500">
                                                <CheckCircle size={20} fill="currentColor" className="text-pink-500 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </label>

                                    {/* Blog Writer */}
                                    <label className={`relative flex p-4 cursor-pointer rounded-xl border-2 transition-all group ${formData.role === 'blog_writer' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-[#003560] hover:border-gray-500'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="blog_writer"
                                            checked={formData.role === 'blog_writer'}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="sr-only"
                                        />
                                        <div className="flex gap-4">
                                            <div className={`mt-1 p-2 rounded-lg h-fit ${formData.role === 'blog_writer' ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-300 group-hover:bg-white/20'}`}>
                                                <PenTool size={20} />
                                            </div>
                                            <div>
                                                <span className={`block font-bold mb-1 ${formData.role === 'blog_writer' ? 'text-white' : 'text-white'}`}>Blog Writer</span>
                                                <span className="text-xs text-gray-300 leading-relaxed block">
                                                    Can create, edit, and manage blog posts and categories.
                                                </span>
                                            </div>
                                        </div>
                                        {formData.role === 'blog_writer' && (
                                            <div className="absolute top-4 right-4 text-orange-500">
                                                <CheckCircle size={20} fill="currentColor" className="text-orange-500 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </label>

                                    {/* Admin */}
                                    <label className={`relative flex p-4 cursor-pointer rounded-xl border-2 transition-all group col-span-1 sm:col-span-2 ${formData.role === 'admin' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-[#003560] hover:border-gray-500'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={formData.role === 'admin'}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="sr-only"
                                        />
                                        <div className="flex gap-4">
                                            <div className={`mt-1 p-2 rounded-lg h-fit ${formData.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 group-hover:bg-white/20'}`}>
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <span className={`block font-bold mb-1 ${formData.role === 'admin' ? 'text-white' : 'text-white'}`}>Super Admin</span>
                                                <span className="text-xs text-gray-300 leading-relaxed block">
                                                    Full access to all systems, settings, users, and financial data.
                                                </span>
                                            </div>
                                        </div>
                                        {formData.role === 'admin' && (
                                            <div className="absolute top-4 right-4 text-purple-500">
                                                <CheckCircle size={20} fill="currentColor" className="text-purple-500 bg-white rounded-full" />
                                            </div>
                                        )}
                                    </label>

                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-700 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/users')}
                                    className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={inviting}
                                    className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {inviting ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Invitation'
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
