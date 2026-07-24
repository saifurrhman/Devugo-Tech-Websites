import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyInfoAPI } from '../services/companyInfo';

import { API_BASE } from '../lib/api';

const ChatWidget = ({ isOpen, setIsOpen }) => {
    // const [isOpen, setIsOpen] = useState(false); // Controlled by parent now
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Fetch Company Info on mount
    useEffect(() => {
        const fetchSettings = async () => {
            const defaultWelcome = 'Assalam-o-Alaikum! 👋 I\'m Devugo, your AI assistant.\n\nHow can I help you today? Ask about our services, pricing, products, or anything else!';
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            try {
                const { info } = await CompanyInfoAPI.getPublic();
                if (info && info.showChatBot !== false) {
                    setIsVisible(true);
                    setMessages([{ type: 'bot', text: info.chatBotWelcomeMessage || defaultWelcome, timestamp: time }]);
                }
            } catch (error) {
                console.error("Failed to load chat settings", error);
                setIsVisible(true);
                setMessages([{ type: 'bot', text: defaultWelcome, timestamp: time }]);
            }
        };
        fetchSettings();
    }, []);

    const QUICK_REPLIES = ["Services", "Pricing", "Products", "Book Demo", "Contact"];

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (userMessage) => {
        if (!userMessage.trim()) return;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setInputText('');
        setMessages(prev => [...prev, { type: 'user', text: userMessage, timestamp: time }]);
        setIsLoading(true);

        try {
            const endpoint = `${API_BASE}/api/chat/message`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });
            const data = await response.json();
            const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            if (data.success) {
                setMessages(prev => [...prev, { type: 'bot', text: data.reply, timestamp: botTime }]);
            } else {
                setMessages(prev => [...prev, { type: 'bot', text: "I'm having a bit of trouble connecting. Please try again.", timestamp: botTime }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I couldn't reach the server. Please check your connection.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        sendMessage(inputText);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-[calc(100vw-3rem)] sm:w-[380px] h-[70vh] sm:h-[550px] max-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 bg-[var(--chat-header-bg)] flex items-center justify-between text-white shadow-sm relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[var(--chat-primary)] rounded-full flex items-center justify-center shadow-md">
                                    <Bot size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[15px] tracking-wide leading-tight">Devugo Support</h3>
                                    <span className="text-[11px] text-gray-300 flex items-center gap-1.5 mt-0.5">
                                        <span className="w-2 h-2 bg-[var(--chat-primary)] rounded-full animate-pulse"></span>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors text-gray-300 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f8fafc]">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`
                                            max-w-[85%] p-4 text-[13.5px] leading-relaxed shadow-sm whitespace-pre-wrap
                                            ${msg.type === 'user'
                                                ? 'bg-[var(--chat-user-bubble)] text-white rounded-2xl rounded-tr-sm'
                                                : 'bg-[var(--chat-bot-bubble)] text-[var(--chat-text-dark)] rounded-2xl rounded-tl-sm border border-gray-200'
                                            }
                                        `}
                                    >
                                        {msg.text}
                                    </div>
                                    {msg.timestamp && (
                                        <span className={`text-[10px] text-gray-400 mt-1.5 ${msg.type === 'user' ? 'mr-1' : 'ml-1'}`}>
                                            {msg.timestamp}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-[var(--chat-bot-bubble)] p-4 rounded-2xl rounded-tl-sm border border-gray-200 flex items-center gap-2 shadow-sm">
                                        <Loader2 size={14} className="animate-spin text-[var(--chat-primary)]" />
                                        <span className="text-[12px] text-gray-500">Typing...</span>
                                    </div>
                                </div>
                            )}

                            {messages.length === 1 && !isLoading && (
                                <div className="flex flex-wrap gap-2 mt-2 ml-1">
                                    {QUICK_REPLIES.map((reply, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(reply)}
                                            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[var(--chat-primary)] text-[12px] font-medium rounded-full transition-colors border border-blue-100"
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 mb-1">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type your question..."
                                    className="flex-1 bg-[#f8fafc] text-gray-900 px-4 py-3 rounded-full text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--chat-primary)] transition-all border border-gray-200"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isLoading}
                                    className="w-11 h-11 flex items-center justify-center bg-[var(--chat-primary)] text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
                                >
                                    <Send size={16} className="ml-0.5" />
                                </button>
                            </form>
                            <div className="text-center">
                                <span className="text-[9px] text-gray-400">Powered by Devugo AI</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-[var(--chat-primary)] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 z-50 group"
            >
                {isOpen ? (
                    <X size={26} className="transform group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                    <MessageCircle size={26} className="transform group-hover:scale-110 transition-transform duration-300" />
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
