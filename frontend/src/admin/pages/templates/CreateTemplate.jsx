import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutTemplate,
    Type,
    Image as ImageIcon,
    ExternalLink,
    Save,
    ArrowLeft,
    Send,
    Move,
    Columns,
    Minus,
    Instagram,
    Code,
    Video,
    Menu,
    Monitor,
    Smartphone,
    Tablet
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { TemplateAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function CreateTemplate() {
    const navigate = useNavigate();
    const { success, error, warning } = useNotification();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('Untitled Template');
    const [nameError, setNameError] = useState('');
    const [activeTab, setActiveTab] = useState('blocks'); // blocks, body, images

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
                content: '<div>Mock content</div>',
                thumbnail: 'https://via.placeholder.com/300'
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
        <div className="admin-layout flex h-screen bg-[#0f172a] text-white overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <AdminTopbar />

                {/* Toolbar / Header */}
                <div className="h-16 border-b border-gray-800 bg-[#1e293b]/50 px-6 flex justify-between items-center shrink-0 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/templates')}
                            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="h-8 w-px bg-gray-700"></div>
                        <div className="flex flex-col">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (nameError) setNameError('');
                                }}
                                className={`bg-transparent border-none p-0 text-white font-semibold focus:ring-0 ${nameError ? 'placeholder-red-400' : ''}`}
                                placeholder="Enter template name..."
                            />
                            <span className="text-xs text-gray-500">Email Campaign Template</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-800 rounded-lg p-1 mr-4">
                            <button className="p-1.5 rounded text-blue-400 bg-gray-700"><Monitor size={16} /></button>
                            <button className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700"><Tablet size={16} /></button>
                            <button className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700"><Smartphone size={16} /></button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="btn px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
                        >
                            <Save size={16} />
                            {loading ? 'Saving...' : 'Save Design'}
                        </button>
                    </div>
                </div>

                {/* Editor Workspace */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Canvas Area */}
                    <div className="flex-1 bg-[#0f172a] p-8 overflow-y-auto flex justify-center relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
                        <div className="w-full max-w-[600px] min-h-[800px] bg-white rounded-t-lg shadow-2xl flex flex-col">
                            {/* Mock Header of Email */}
                            <div className="p-8 border-b border-gray-100 text-center">
                                <div className="h-12 w-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400">
                                    <ImageIcon size={24} />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Logo Here</h1>
                                <p className="text-gray-500 text-sm">Drag logo block to replace</p>
                            </div>

                            {/* Mock Body */}
                            <div className="flex-1 p-8 bg-gray-50">
                                <div className="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-lg p-12 text-center">
                                    <Type className="mx-auto text-blue-300 mb-3" size={32} />
                                    <h3 className="text-blue-900 font-medium mb-1">Start Building</h3>
                                    <p className="text-blue-700/60 text-sm">Drag and drop blocks from the right panel</p>
                                </div>
                            </div>

                            {/* Mock Footer */}
                            <div className="p-6 bg-gray-100 text-center text-xs text-gray-400">
                                <p>© 2024 Company Name. All rights reserved.</p>
                                <div className="flex justify-center gap-3 mt-2">
                                    <span>Unsubscribe</span>
                                    <span>•</span>
                                    <span>Privacy Policy</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Tools */}
                    <div className="w-[320px] bg-[#1e293b] border-l border-gray-800 flex flex-col shrink-0 z-10">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-700">
                            <button
                                onClick={() => setActiveTab('blocks')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'blocks' ? 'border-blue-500 text-blue-400 bg-blue-900/10' : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                Blocks
                            </button>
                            <button
                                onClick={() => setActiveTab('style')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'style' ? 'border-blue-500 text-blue-400 bg-blue-900/10' : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                Body Style
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {activeTab === 'blocks' ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Content</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { icon: Type, label: 'Text' },
                                                { icon: ImageIcon, label: 'Image' },
                                                { icon: ExternalLink, label: 'Button' },
                                                { icon: Minus, label: 'Divider' },
                                                { icon: Instagram, label: 'Social' },
                                                { icon: Code, label: 'HTML' },
                                                { icon: Video, label: 'Video' },
                                                { icon: Menu, label: 'Menu' },
                                            ].map(block => (
                                                <div key={block.label} className="bg-[#0f172a] p-4 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-[#0f172a]/80 cursor-grab active:cursor-grabbing text-center group transition-all">
                                                    <block.icon size={24} className="mx-auto mb-2 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                                    <span className="text-xs font-medium text-gray-300 group-hover:text-white">{block.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Layout</h3>
                                        <div className="space-y-2">
                                            <div className="bg-[#0f172a] p-3 rounded border border-gray-700 hover:border-blue-500 cursor-pointer flex gap-2">
                                                <div className="flex-1 h-8 bg-gray-700/50 rounded"></div>
                                            </div>
                                            <div className="bg-[#0f172a] p-3 rounded border border-gray-700 hover:border-blue-500 cursor-pointer flex gap-2">
                                                <div className="flex-1 h-8 bg-gray-700/50 rounded"></div>
                                                <div className="flex-1 h-8 bg-gray-700/50 rounded"></div>
                                            </div>
                                            <div className="bg-[#0f172a] p-3 rounded border border-gray-700 hover:border-blue-500 cursor-pointer flex gap-2">
                                                <div className="w-1/3 h-8 bg-gray-700/50 rounded"></div>
                                                <div className="flex-1 h-8 bg-gray-700/50 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 text-sm text-gray-400">
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300">
                                        <p>Global body styles (background color, font family, etc.) would be configured here.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
