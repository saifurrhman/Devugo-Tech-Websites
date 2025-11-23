import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function AITemplateGenerator() {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);

    const handleGenerate = () => {
        if (!prompt) return;
        setGenerating(true);
        setTimeout(() => setGenerating(false), 3000);
    };

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="max-w-3xl mx-auto text-center mb-10 mt-8">
                    <div className="inline-block p-3 rounded-full bg-purple-500/10 mb-4">
                        <span className="text-4xl">✨</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-3">AI Template Generator</h1>
                    <p className="text-gray-400 text-lg">
                        Describe the email you want to create, and our AI will design it for you in seconds.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-2">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Create a modern newsletter for a tech startup announcing a new product launch. Use blue and dark gray colors. Include a hero image, feature list, and a call to action button."
                            className="w-full bg-[#0f172a] border-none rounded-lg p-4 text-white outline-none focus:ring-0 min-h-[120px] resize-none text-lg"
                        ></textarea>
                        <div className="flex justify-between items-center p-2 border-t border-gray-800 mt-2">
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 rounded-full bg-gray-800 text-xs text-gray-300 hover:bg-gray-700">Newsletter</button>
                                <button className="px-3 py-1.5 rounded-full bg-gray-800 text-xs text-gray-300 hover:bg-gray-700">Promotional</button>
                                <button className="px-3 py-1.5 rounded-full bg-gray-800 text-xs text-gray-300 hover:bg-gray-700">Welcome</button>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !prompt}
                                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${generating || !prompt
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20'
                                    }`}
                            >
                                {generating ? (
                                    <>
                                        <span className="animate-spin">↻</span> Generating...
                                    </>
                                ) : (
                                    <>
                                        <span>✨</span> Generate Template
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">Powered by OpenAI GPT-4 & DALL-E 3</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
