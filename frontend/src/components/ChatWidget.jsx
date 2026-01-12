import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyInfoAPI } from '../services/companyInfo';

const ChatWidget = ({ isOpen, setIsOpen }) => {
    // const [isOpen, setIsOpen] = useState(false); // Controlled by parent now
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Fetch Company Info on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { info } = await CompanyInfoAPI.getPublic();
                // Default to true if undefined, strictly check for false to hide
                if (info && info.showChatBot !== false) {
                    setIsVisible(true);
                    setMessages([
                        { type: 'bot', text: info.chatBotWelcomeMessage || 'Hi there! 👋 How can I help you today?' }
                    ]);
                }
            } catch (error) {
                console.error("Failed to load chat settings", error);
                // Fallback defaults
                setIsVisible(true);
                setMessages([
                    { type: 'bot', text: 'Hi there! 👋 How can I help you today?' }
                ]);
            }
        };
        fetchSettings();
    }, []);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = inputText.trim();
        setInputText('');
        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            // Determine API URL based on environment
            // Assuming the backend runs on port 5000 locally or relative path in prod
            const apiUrl = process.env.NODE_ENV === 'production'
                ? 'https://devugo-tech-websites.vercel.app/api/chat/message' // Update if needed
                : 'http://localhost:5000/api/chat/message';

            // Check if we are on the same domain or development
            const endpoint = window.location.hostname === 'localhost'
                ? 'http://localhost:5000/api/chat/message'
                : '/api/chat/message';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { type: 'bot', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { type: 'bot', text: "I'm having a bit of trouble connecting. Please try again." }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I couldn't reach the server. Please check your connection." }]);
        } finally {
            setIsLoading(false);
        }
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
                        className="w-[350px] md:w-[380px] h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800"
                    >
                        {/* Header */}
                        <div className="p-4 bg-blue-600 flex items-center justify-between text-white shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm md:text-base">Devugo support</h3>
                                    <span className="text-xs text-blue-100 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950/50">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`
                                            max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                            ${msg.type === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                            }
                                        `}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-blue-600" />
                                        <span className="text-xs text-gray-500">Typing...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type your message..."
                                    className="w-full bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-transparent focus:border-blue-500"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isLoading}
                                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-blue-500/40 flex items-center justify-center transition-all duration-300 z-50 group"
            >
                {isOpen ? (
                    <X size={28} className="transform group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                    <MessageCircle size={28} className="transform group-hover:scale-110 transition-transform duration-300" />
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
