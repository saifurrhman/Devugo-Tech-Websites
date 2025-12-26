import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { InboxAPI, AIAPI, ContactAPI } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';
import AIPanel from '../../../components/AIPanel';

export default function ConversationView({ conversationId }) {
    const { success, error, info } = useNotification();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [isQualifying, setIsQualifying] = useState(false);

    // AI State
    const [aiPanelOpen, setAiPanelOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiAction, setAiAction] = useState(null); // 'reply', 'qualify'

    useEffect(() => {
        if (!conversationId) return;
        loadMessages();
    }, [conversationId]);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const data = await InboxAPI.get(conversationId);
            setConversation(data);
            setMessages(Array.isArray(data.messages) ? data.messages : []);
        } catch (err) {
            console.error('Failed to load conversation:', err);
            // Fallback to mock if API fails/not implemented yet
            setMessages([
                { id: 1, sender: 'user', name: 'User', content: 'Message content not loaded.', time: 'Now' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setSending(true);
        try {
            await InboxAPI.reply(conversationId, { content: replyText });
            success('Reply sent successfully');
            setReplyText('');
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'agent',
                name: 'You',
                content: replyText,
                time: 'Just now'
            }]);
        } catch (err) {
            console.error('Failed to send reply:', err);
            error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    // AI Handlers
    const openAI = (action) => {
        setAiAction(action);
        if (action === 'reply') {
            // Context aware prompt
            const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : '';
            setAiPrompt(`Draft a polite and professional reply to this customer message: "${lastMsg}". Goal: Resolve their query.`);
        } else if (action === 'qualify') {
            // For qualification, we might just auto-trigger or ask for criteria
            handleQualifyLead(); // Auto-trigger for now
            return;
        }
        setAiPanelOpen(true);
    };

    const handleQualifyLead = async () => {
        setIsQualifying(true);
        try {
            // Gather context
            const threadText = messages.map(m => `${m.sender}: ${m.content}`).join('\n');
            const result = await AIAPI.generate({
                action: 'qualify',
                goal: 'Lead Qualification',
                conversation: threadText
            });

            // Assume AI returns { status: 'High Intent', reason: '...' }
            // For now, let's just show notification
            const score = result.data?.score || 'High';
            info(`Lead Qualified: ${score} Intent`);

            // Update UI/Backend if needed
            // await ContactAPI.updateStatus(...)
        } catch (e) {
            console.error(e);
            error('Failed to qualify lead');
        } finally {
            setIsQualifying(false);
        }
    };

    const handleAIAccept = (content) => {
        if (aiAction === 'reply') {
            const text = typeof content === 'string' ? content : content.body;
            setReplyText(text);
        }
        setAiPanelOpen(false);
    };

    const handleAIGenerate = async (prompt) => {
        try {
            const res = await AIAPI.generate({
                action: 'inbox_reply',
                goal: 'Reply to customer',
                customPrompt: prompt
            });
            return res.data;
        } catch (e) { throw e; }
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>;

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/30">
                <div>
                    <h2 className="font-semibold text-lg text-white">{conversation?.subject || 'Conversation'}</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Ticket #{conversationId.substr(-4)}</span>
                        <span>•</span>
                        <span className="text-green-400">Open</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => openAI('qualify')}
                        disabled={isQualifying}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors ${isQualifying ? 'bg-yellow-500/20 text-yellow-500' : 'bg-yellow-600/10 text-yellow-400 hover:bg-yellow-600/20'
                            }`}
                        title="Analyze Lead Intent"
                    >
                        {isQualifying ? <div className="animate-spin h-3 w-3 border-2 border-yellow-500 rounded-full border-t-transparent"></div> : <Zap size={14} />}
                        {isQualifying ? 'Analyzing...' : 'Qualify Lead'}
                    </button>
                    <div className="h-8 w-px bg-gray-700 mx-1"></div>
                    <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Mark as Unread">✉️</button>
                    <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Archive">🗃️</button>
                    <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-red-400" title="Delete">🗑️</button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">No messages yet.</div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id || msg._id} className={`flex gap-4 ${msg.sender === 'agent' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${msg.sender === 'agent' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                                }`}>
                                {(msg.name || 'U').charAt(0)}
                            </div>
                            <div className={`max-w-[70%] ${msg.sender === 'agent' ? 'items-end' : 'items-start'} flex flex-col`}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-medium text-sm text-gray-300">{msg.name}</span>
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
                    ))
                )}
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t border-gray-800 bg-gray-800/30">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Reply to Customer</span>
                    <button
                        onClick={() => openAI('reply')}
                        className="flex items-center gap-1.5 text-xs bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-2.5 py-1 rounded-full transition-colors"
                    >
                        <Sparkles size={12} /> AI Assist
                    </button>
                </div>
                <div className="relative">
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg p-4 pr-12 text-white outline-none focus:border-blue-500 min-h-[100px] resize-none"
                    ></textarea>
                    <div className="absolute bottom-3 right-3 flex gap-2">
                        <button className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Attach File">📎</button>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white">
                            <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                            <span>Close ticket on send</span>
                        </label>
                    </div>
                    <button
                        onClick={handleReply}
                        disabled={sending || !replyText.trim()}
                        className={`btn-primary px-6 py-2 rounded-lg font-medium transition-colors ${sending || !replyText.trim() ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                    >
                        {sending ? 'Sending...' : 'Send Reply'}
                    </button>
                </div>
            </div>

            <AIPanel
                isOpen={aiPanelOpen}
                onClose={() => setAiPanelOpen(false)}
                prompt={aiPrompt}
                onGenerate={handleAIGenerate}
                onAccept={handleAIAccept}
            />
        </div>
    );
}
