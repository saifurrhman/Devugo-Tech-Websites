import React, { useState } from 'react';
import { X, Send, Paperclip } from 'lucide-react';
import { InboxAPI } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';

export default function ComposeModal({ isOpen, onClose, onSent }) {
    const { success, error: notifyError } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        to: '',
        subject: '',
        content: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await InboxAPI.send(formData);
            success('Email sent successfully');
            setFormData({ to: '', subject: '', content: '' });
            onClose();
            if (onSent) onSent();
        } catch (err) {
            console.error(err);
            notifyError(err.message || 'Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#1e293b] rounded-xl border border-gray-800 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0f172a] rounded-t-xl">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Send size={18} className="text-blue-500" /> New Message
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <input
                            type="email"
                            required
                            placeholder="To: recipient@example.com"
                            value={formData.to}
                            onChange={e => setFormData({ ...formData, to: e.target.value })}
                            className="w-full bg-transparent border-b border-gray-700 p-2 text-white outline-none focus:border-blue-500 placeholder-gray-500 text-sm"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Subject"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full bg-transparent border-b border-gray-700 p-2 text-white outline-none focus:border-blue-500 placeholder-gray-500 font-medium"
                        />
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        <textarea
                            required
                            placeholder="Write your message..."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            className="w-full h-full bg-transparent resize-none outline-none text-gray-300 placeholder-gray-600 min-h-[200px]"
                        ></textarea>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 flex justify-between items-center bg-[#0f172a] rounded-b-xl">
                    <button className="text-gray-500 hover:text-white p-2 rounded transition-colors" title="Attach (Coming Soon)">
                        <Paperclip size={18} />
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !formData.to || !formData.content}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Sending...' : (
                                <>
                                    Send Message <Send size={14} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
