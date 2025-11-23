import React from 'react';

export default function ConversationView({ conversationId }) {
    const messages = [
        { id: 1, sender: 'user', name: 'John Doe', content: 'Hi, I was wondering if this discount applies to the enterprise plan as well?', time: '10:30 AM' },
        { id: 2, sender: 'agent', name: 'You', content: 'Hi John! Thanks for reaching out. Yes, the summer sale discount applies to all plans including Enterprise.', time: '10:45 AM' },
        { id: 3, sender: 'user', name: 'John Doe', content: 'That is great news! How do I apply it during checkout?', time: '10:50 AM' },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
                <div>
                    <h2 className="font-semibold text-lg">Re: Summer Sale 2024</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Ticket #1234</span>
                        <span>•</span>
                        <span className="text-green-400">Open</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Mark as Unread">✉️</button>
                    <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Archive">Hz</button>
                    <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400" title="Delete">🗑️</button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 ${msg.sender === 'agent' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${msg.sender === 'agent' ? 'bg-blue-600' : 'bg-gray-700'
                            }`}>
                            {msg.name.charAt(0)}
                        </div>
                        <div className={`max-w-[70%] ${msg.sender === 'agent' ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-medium text-sm">{msg.name}</span>
                                <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'agent'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-gray-800 text-gray-200 rounded-tl-none'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t border-gray-800 bg-gray-800/30">
                <div className="relative">
                    <textarea
                        placeholder="Type your reply..."
                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg p-4 pr-12 text-white outline-none focus:border-blue-500 min-h-[100px] resize-none"
                    ></textarea>
                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Attach File">📎</button>
                        <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Insert Template">📝</button>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white">
                            <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                            <span>Close ticket on send</span>
                        </label>
                    </div>
                    <button className="btn-primary bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-medium transition-colors">
                        Send Reply
                    </button>
                </div>
            </div>
        </div>
    );
}
