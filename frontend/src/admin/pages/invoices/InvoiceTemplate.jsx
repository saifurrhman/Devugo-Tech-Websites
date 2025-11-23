import React from 'react';

export default function InvoiceTemplate() {
    return (
        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
            <h3 className="font-semibold mb-4">Invoice Branding</h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-xs text-gray-500 mb-2">Logo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-2xl border border-gray-700">
                            🏢
                        </div>
                        <button className="text-sm text-blue-400 hover:text-blue-300">Upload New</button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-500 mb-2">Accent Color</label>
                    <div className="flex gap-2">
                        {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                            <button
                                key={color}
                                className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white transition-all"
                                style={{ backgroundColor: color }}
                            ></button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs text-gray-500 mb-2">Footer Text</label>
                    <textarea
                        className="w-full bg-[#0f172a] border border-gray-700 rounded px-3 py-2 text-white outline-none h-20 resize-none text-sm"
                        defaultValue="Thank you for your business!"
                    ></textarea>
                </div>
            </div>
        </div>
    );
}
