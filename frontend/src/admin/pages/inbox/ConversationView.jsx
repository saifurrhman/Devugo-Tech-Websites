import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { InboxAPI, AIAPI, ContactAPI } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';
import AIPanel from '../../../components/AIPanel';
import DOMPurify from 'dompurify';

export default function ConversationView({ conversationId }) {
    const { success, error, info } = useNotification();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [isQualifying, setIsQualifying] = useState(false);
    const [senders, setSenders] = useState([]);
    const [selectedSenderId, setSelectedSenderId] = useState('');

    // AI State
    const [aiPanelOpen, setAiPanelOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiAction, setAiAction] = useState(null); // 'reply', 'qualify'

    useEffect(() => {
        if (!conversationId) return;
        loadMessages();
    }, [conversationId]);

    const loadMessages = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await InboxAPI.get(conversationId);
            setConversation(data);
            setMessages(Array.isArray(data.messages) ? data.messages : []);
            
            // Fetch senders if not already loaded
            if (senders.length === 0) {
                const { SenderAPI } = require('../../../lib/api');
                const senderData = await SenderAPI.list();
                const loadedSenders = Array.isArray(senderData) ? senderData : (senderData.data || []);
                const verifiedSenders = loadedSenders.filter(s => s.status === 'verified');
                setSenders(verifiedSenders);
            }
        } catch (err) {
            console.error('Failed to load conversation:', err);
            // Fallback to mock if API fails/not implemented yet
            setMessages([
                { id: 1, sender: 'user', name: 'User', content: 'Message content not loaded.', time: 'Now' }
            ]);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Auto-refresh every 15 seconds
    useEffect(() => {
        if (!conversationId) return;
        const interval = setInterval(() => {
            loadMessages(true);
        }, 15000);
        return () => clearInterval(interval);
    }, [conversationId]);

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setSending(true);
        try {
            await InboxAPI.reply(conversationId, { 
                content: replyText,
                senderId: selectedSenderId || undefined 
            });
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
            const errorMsg = err.response?.data?.message || 'Failed to send reply';
            error(errorMsg);
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
        <div className="flex flex-col h-full w-full bg-transparent text-gray-200">
            {/* Header Area */}
            <div className="p-5 border-b border-gray-700/50 flex flex-col gap-2 bg-[#1e293b]/50">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-xl text-white">
                            {conversation?.messages?.[0]?.name || 'Customer Conversation'}
                        </h2>
                        <div className="text-sm text-gray-400">
                            {conversation?.messages?.[0]?.email || conversation?.subject || ''}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => openAI('qualify')}
                            disabled={isQualifying}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors ${isQualifying ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-[#0f172a] text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500'
                                }`}
                            title="Analyze Lead Intent"
                        >
                            {isQualifying ? <div className="animate-spin h-3.5 w-3.5 border-2 border-yellow-500 rounded-full border-t-transparent"></div> : <Zap size={14} className="text-yellow-400" />}
                            {isQualifying ? 'Analyzing...' : 'Qualify Lead'}
                        </button>
                        <div className="h-7 w-px bg-gray-700 mx-1"></div>
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Archive">🗃️</button>
                        <button className="p-1.5 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400 transition-colors" title="Delete">🗑️</button>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium">
                    <span className="bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full border border-gray-700">Ticket #{conversationId?.substr(-4) || '----'}</span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Open
                    </span>
                </div>
            </div>

            {/* Messages Thread (Chat Bubbles) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-[#0f172a]">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="text-4xl mb-2">📭</div>
                        <div className="text-sm">No messages found</div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isAgent = msg.sender === 'agent';
                        return (
                            <div key={msg.id || msg._id || index} className={`flex w-full ${isAgent ? 'justify-end' : 'justify-start'}`}>
                                <div className="w-full flex flex-col mb-2">
                                    <div className={`w-full bg-white rounded-lg border shadow-sm overflow-hidden transition-all
                                        ${isAgent ? 'border-blue-200 shadow-blue-900/5' : 'border-gray-200'}`}
                                    >
                                        {/* Card Header */}
                                        <div className={`flex justify-between items-start p-4 border-b ${isAgent ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50/50 border-gray-100'}`}>
                                            <div className="flex gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 
                                                    ${isAgent ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'}`}>
                                                    {(msg.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900 text-sm">
                                                            {msg.name || (isAgent ? 'Support Agent' : 'Customer')}
                                                        </span>
                                                        {isAgent && (
                                                            <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                                                                Support
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500 mt-0.5">
                                                        {msg.email || (isAgent ? 'support@devugo.tech' : '')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                                {msg.time}
                                            </div>
                                        </div>
                                        
                                        {/* Card Body */}
                                        <div className="text-[14px] leading-relaxed text-gray-800 w-full">
                                            {!msg.content ? (
                                                <div className="p-5 italic opacity-60">No content</div>
                                            ) : (
                                                msg.content.includes('<') && msg.content.includes('>') ? (
                                                    <div className="w-full bg-white rounded-b-lg">
                                                        <iframe 
                                                            title={`email-content-${msg.id || index}`}
                                                            srcDoc={DOMPurify.sanitize(msg.content, { 
                                                                USE_PROFILES: { html: true },
                                                                FORBID_TAGS: ['script', 'form', 'object', 'embed'],
                                                                // Allow style tags for proper email rendering
                                                                ADD_TAGS: ['style']
                                                            })}
                                                            className="w-full border-none m-0 p-0"
                                                            style={{ 
                                                                minHeight: '600px', 
                                                                height: '100%',
                                                                overflow: 'hidden'
                                                            }}
                                                            onLoad={(e) => {
                                                                // Auto-resize iframe height based on content
                                                                try {
                                                                    const doc = e.target.contentWindow.document;
                                                                    const height = Math.max(
                                                                        doc.body.scrollHeight,
                                                                        doc.documentElement.scrollHeight
                                                                    );
                                                                    if (height > 100) {
                                                                        e.target.style.height = `${height}px`;
                                                                    }
                                                                } catch (err) {
                                                                    // Cross-origin restriction fallback
                                                                    e.target.style.height = '800px';
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="p-5 whitespace-pre-wrap font-sans text-gray-700">{msg.content}</div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Clean Reply Box */}
            <div className="p-4 md:p-6 border-t border-gray-700/50 bg-[#1e293b]/80">
                <div className="border border-gray-600/60 rounded-xl bg-[#0f172a] shadow-sm overflow-hidden focus-within:border-blue-500/50 transition-colors">
                    <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-700/50 bg-gray-800/20">
                        <div className="flex items-center gap-4">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reply</div>
                            {senders.length > 0 && (
                                <select 
                                    className="bg-[#0f172a] border border-gray-600 rounded text-xs text-gray-300 px-2 py-1 outline-none focus:border-blue-500"
                                    value={selectedSenderId}
                                    onChange={(e) => setSelectedSenderId(e.target.value)}
                                >
                                    <option value="">Default Sender</option>
                                    {senders.map(s => (
                                        <option key={s.id} value={s.id}>{s.name || s.displayName} ({s.email || s.emailAddress})</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <button
                            onClick={() => openAI('reply')}
                            className="flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded"
                        >
                            <Sparkles size={13} /> AI Assist
                        </button>
                    </div>
                    
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full bg-transparent p-4 text-gray-200 outline-none min-h-[120px] resize-y placeholder:text-gray-500 text-[15px]"
                    ></textarea>
                    
                    <div className="flex justify-between items-center px-4 py-3 bg-gray-800/40 border-t border-gray-700/50">
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                            <input type="checkbox" className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900 w-4 h-4 cursor-pointer" />
                            <span>Close ticket</span>
                        </label>
                        <button
                            onClick={handleReply}
                            disabled={sending || !replyText.trim()}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm ${sending || !replyText.trim() ? 'bg-blue-600/50 text-white/70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                        >
                            {sending ? (
                                <><div className="animate-spin h-3.5 w-3.5 border-2 border-white/50 rounded-full border-t-white"></div> Sending...</>
                            ) : (
                                'Send Reply'
                            )}
                        </button>
                    </div>
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
