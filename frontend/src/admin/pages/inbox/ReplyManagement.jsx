import React from 'react';

export default function ReplyManagement() {
    const templates = [
        { id: 1, title: 'Standard Greeting', content: 'Hi {{name}}, thanks for reaching out!' },
        { id: 2, title: 'Pricing Inquiry', content: 'Our pricing starts at $29/mo for the Basic plan...' },
        { id: 3, title: 'Meeting Request', content: 'I would love to hop on a call to discuss this further.' },
    ];

    return (
        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
            <h3 className="font-semibold mb-4">Quick Replies</h3>
            <div className="space-y-3">
                {templates.map((t) => (
                    <button
                        key={t.id}
                        className="w-full text-left p-3 bg-[#0f172a] border border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-900/10 transition-all group"
                    >
                        <div className="font-medium text-sm mb-1 group-hover:text-blue-400">{t.title}</div>
                        <div className="text-xs text-gray-500 truncate">{t.content}</div>
                    </button>
                ))}
                <button className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                    + Create New Template
                </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
                <h3 className="font-semibold mb-4">AI Assistant</h3>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-400">✨</span>
                        <span className="text-sm font-medium text-purple-200">Suggested Reply</span>
                    </div>
                    <p className="text-xs text-gray-300 italic mb-3">
                        "Based on the customer's question about enterprise pricing, here is a draft response..."
                    </p>
                    <button className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 rounded text-xs font-medium transition-colors">
                        Insert Suggestion
                    </button>
                </div>
            </div>
        </div>
    );
}
