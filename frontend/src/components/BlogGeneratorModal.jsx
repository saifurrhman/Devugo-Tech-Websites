import React, { useState } from 'react';
import { Loader2, Sparkles, FileText, Copy, Check, X } from 'lucide-react';
import { AIAPI } from '../lib/api';
import { useNotification } from '../contexts/NotificationContext';

export default function BlogGeneratorModal({ isOpen, onClose, onAccept, initialTopic = '' }) {
    console.log('BlogGeneratorModal render', { isOpen, initialTopic });
    const { success, error: notifyError } = useNotification();
    const [topic, setTopic] = useState(initialTopic);
    const [keywords, setKeywords] = useState('');
    const [tone, setTone] = useState('Professional');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState('');

    if (!isOpen) return null;

    const generateBlog = async () => {
        if (!topic.trim()) {
            notifyError('Please enter a blog topic');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await AIAPI.generate({
                action: 'blog',
                topic: topic,
                keywords: keywords,
                tone: tone
            });

            const data = response.data || response;
            let parsedResult = data;
            if (typeof data === 'string') {
                try {
                    parsedResult = JSON.parse(data);
                } catch (e) {
                    parsedResult = {
                        title: topic,
                        content: data,
                        excerpt: data.substring(0, 150) + '...',
                        seo: { metaTitle: topic, metaDescription: data.substring(0, 150) }
                    };
                }
            }

            if (!parsedResult.title && parsedResult.subject) parsedResult.title = parsedResult.subject;
            if (!parsedResult.content && parsedResult.body) parsedResult.content = parsedResult.body;
            if (!parsedResult.excerpt) parsedResult.excerpt = parsedResult.content?.substring(0, 150) + '...' || 'No summary available.';

            setResult(parsedResult);
        } catch (err) {
            console.error('Error:', err);
            notifyError('Failed to generate content. Check your AI Integrations settings.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        success('Copied to clipboard');
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <div
            className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70 backdrop-blur-sm flex items-start md:items-center justify-center p-4 transition-all duration-300"
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
            <div className="bg-[#002747] rounded-xl md:rounded-2xl shadow-2xl w-full max-w-6xl md:max-h-[90vh] md:overflow-hidden overflow-visible flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-300 border border-white/10 ring-1 ring-black/20 my-4 md:my-0">

                {/* Close Button - Enhanced Visibility */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-[#003560] hover:bg-rose-600 text-white/80 hover:text-white rounded-full transition-all duration-300 hover:rotate-90 shadow-md border border-white/10 group"
                    title="Close Modal"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                {/* Left Panel: Configuration (Devugo Theme) */}
                <div className="w-full md:w-[400px] bg-[#003560] p-8 border-r border-white/10 overflow-y-auto custom-scrollbar">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 border border-blue-400/30">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">
                                    AI Writer
                                </h2>
                                <p className="text-xs font-semibold text-blue-200/70 uppercase tracking-wider">
                                    Blog Generator
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-blue-100/70 leading-relaxed">
                            Generate SEO-optimized content instantly using your AI agents.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white flex items-center justify-between">
                                Topic / Title <span className="text-rose-400 text-xs font-medium">*Required</span>
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="What is this post about?"
                                className="w-full px-4 py-3.5 bg-[#002747] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-500 text-white shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white">
                                Key Concepts <span className="text-blue-200/40 font-normal ml-1">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="e.g. React, Innovation, 2024"
                                className="w-full px-4 py-3.5 bg-[#002747] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-500 text-white shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-white">
                                Writing Tone
                            </label>
                            <div className="relative">
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-[#002747] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none text-white shadow-sm"
                                >
                                    <option value="Professional">Professional</option>
                                    <option value="Casual">Casual</option>
                                    <option value="Friendly">Friendly</option>
                                    <option value="Formal">Formal</option>
                                    <option value="Conversational">Conversational</option>
                                    <option value="Educational">Educational</option>
                                    <option value="Persuasive">Persuasive</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex flex-col gap-3">
                            <button
                                onClick={generateBlog}
                                disabled={loading || !topic}
                                className="w-full relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed group border border-blue-500/50"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Crafting Content...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span>Generate Article</span>
                                        </>
                                    )}
                                </div>
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full py-3 text-sm font-medium text-blue-200/60 hover:text-white transition-colors"
                            >
                                Close Modal
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Preview (Maintains Paper Look) */}
                <div className="flex-1 bg-[#f8fafc] relative flex flex-col min-h-[300px] md:min-h-[500px]">
                    {!result ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#f1f5f9]">
                            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 border border-slate-200">
                                <FileText className="w-10 h-10 text-[#003560]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#002747] mb-2">Ready to Write</h3>
                            <p className="text-slate-500 max-w-sm">
                                Enter your topic on the left and let AI generate a complete, formatted blog post for you in seconds.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            {/* Toolbar */}
                            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                                        <Check size={14} strokeWidth={3} />
                                    </span>
                                    <span className="font-semibold text-slate-700">Content Generated</span>
                                </div>
                                <button
                                    onClick={() => onAccept(result)}
                                    className="bg-[#0f2b5b] hover:bg-[#003560] text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 ring-1 ring-black/5"
                                >
                                    Use This Content <Check size={16} />
                                </button>
                            </div>

                            {/* Content Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[#f8fafc]">

                                {/* Images Preview Section */}
                                {(result.featuredImage || result.coverImage) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.featuredImage && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Featured Image</label>
                                                    <button onClick={() => copyToClipboard(result.featuredImage, 'img1')} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Copy URL">
                                                        {copied === 'img1' ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                                <div className="relative group overflow-hidden rounded-xl border border-slate-200 aspect-video bg-slate-100">
                                                    <img src={result.featuredImage} alt="Featured" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                </div>
                                            </div>
                                        )}
                                        {result.coverImage && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Post Cover</label>
                                                    <button onClick={() => copyToClipboard(result.coverImage, 'img2')} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Copy URL">
                                                        {copied === 'img2' ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                                <div className="relative group overflow-hidden rounded-xl border border-slate-200 aspect-video bg-slate-100">
                                                    <img src={result.coverImage} alt="Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Title Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</label>
                                        <button onClick={() => copyToClipboard(result.title, 'title')} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Copy">
                                            {copied === 'title' ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                                        {result.title}
                                    </h1>
                                    {result.categories && result.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {result.categories.map((cat, i) => (
                                                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-100">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Excerpt Section */}
                                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Meta Description</label>
                                        <button onClick={() => copyToClipboard(result.excerpt, 'excerpt')} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Copy">
                                            {copied === 'excerpt' ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        {result.excerpt}
                                    </p>
                                </div>

                                {/* SEO Preview */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Target Search Result</label>
                                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-default">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            </div>
                                            <span>example.com</span>
                                            <span className="text-slate-300">•</span>
                                            <span>blog</span>
                                        </div>
                                        <div className="text-[#1a0dab] text-lg font-medium hover:underline truncate cursor-pointer mb-1">
                                            {result.seo?.metaTitle || result.title}
                                        </div>
                                        <div className="text-slate-600 text-sm line-clamp-2">
                                            {result.seo?.metaDescription || result.excerpt}
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Article Content</label>
                                        <button onClick={() => copyToClipboard(result.content, 'content')} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Copy">
                                            {copied === 'content' ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <div className="prose prose-slate max-w-none bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div dangerouslySetInnerHTML={{ __html: result.content }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
