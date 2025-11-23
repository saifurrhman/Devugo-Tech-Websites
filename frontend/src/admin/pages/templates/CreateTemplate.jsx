import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { TemplateAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function CreateTemplate() {
    const navigate = useNavigate();
    const { success, error, warning } = useNotification();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('Untitled Template');
    const [content, setContent] = useState('<div>Placeholder content for now</div>'); // Mock content from editor
    const [nameError, setNameError] = useState('');

    async function handleSave() {
        if (!name.trim()) {
            setNameError('Template name is required');
            warning('Please enter a template name');
            return;
        }

        setLoading(true);
        try {
            await TemplateAPI.create({
                name,
                content, // In a real app, this would be the HTML/JSON from the editor
                thumbnail: 'https://via.placeholder.com/300' // Mock thumbnail
            });
            success('Template saved successfully!');
            navigate('/admin/templates');
        } catch (err) {
            console.error('Failed to save template:', err);
            error('Failed to save template. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Create Template</h1>
                        <p className="text-gray-400 text-sm mt-1">Design a new email template from scratch</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (nameError) setNameError('');
                                }}
                                className={`bg-[#1e293b] border ${nameError ? 'border-red-500' : 'border-gray-700'} rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500`}
                                placeholder="Template Name"
                            />
                            {nameError && (
                                <span className="absolute left-0 -bottom-5 text-xs text-red-400">{nameError}</span>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/admin/templates')}
                            className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
                    {/* Editor Canvas */}
                    <div className="lg:col-span-2 card bg-white rounded-xl border border-gray-800 overflow-hidden flex flex-col">
                        <div className="bg-gray-100 p-2 border-b flex justify-center text-gray-500 text-xs">
                            Email Preview (Desktop)
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="max-w-[600px] mx-auto bg-white shadow-lg min-h-[800px] border border-gray-200">
                                {/* Placeholder for Email Content */}
                                <div className="p-8 text-center text-gray-400 mt-20">
                                    Drag and drop blocks here to build your email
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Tools */}
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 flex flex-col overflow-hidden">
                        <div className="flex border-b border-gray-700">
                            <button className="flex-1 py-3 text-sm font-medium text-blue-400 border-b-2 border-blue-500 bg-blue-900/10">Content</button>
                            <button className="flex-1 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800">Blocks</button>
                            <button className="flex-1 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800">Body</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {['Text', 'Image', 'Button', 'Divider', 'Social', 'HTML', 'Video', 'Menu'].map(block => (
                                    <div key={block} className="bg-[#0f172a] p-3 rounded-lg border border-gray-700 hover:border-gray-500 cursor-move text-center transition-colors">
                                        <div className="text-2xl mb-1">⬜</div>
                                        <div className="text-xs text-gray-300">{block}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
