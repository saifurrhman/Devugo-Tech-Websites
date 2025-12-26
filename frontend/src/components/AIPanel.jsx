import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, RefreshCw, Check, Copy } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function AIPanel({
    isOpen,
    onClose,
    title = "AI Assistant",
    prompt,
    onGenerate,
    onAccept,
    initialContent = ''
}) {
    const { success } = useNotification();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');

    // Ref for auto-focus/scroll
    const resultRef = useRef(null);

    useEffect(() => {
        if (isOpen && prompt && !initialContent) {
            handleGenerate();
        } else if (initialContent) {
            setResult(initialContent);
        }
    }, [isOpen, prompt]);

    async function handleGenerate() {
        if (!onGenerate) return;
        setLoading(true);
        try {
            // Pass custom prompt if user typed one, otherwise use the default prompt
            const finalPrompt = customPrompt || prompt;
            const data = await onGenerate(finalPrompt);

            // Handle both string and object responses
            let textContent = '';
            if (typeof data === 'string') {
                textContent = data;
            } else if (data?.body) {
                textContent = data.body; // Assuming the structure { subject, body } or similar
            } else {
                textContent = JSON.stringify(data, null, 2);
            }

            setResult(textContent);
        } catch (error) {
            console.error("AI Generation failed", error);
        } finally {
            setLoading(false);
        }
    }

    function handleCopy() {
        navigator.clipboard.writeText(result);
        success('Copied to clipboard');
    }

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0f172a] shadow-2xl z-50 border-l border-gray-700 flex flex-col transform transition-transform duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900/50">
                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <Sparkles size={20} />
                        <h2>{title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {/* Prompt Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Instructions</label>
                        <textarea
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            rows={3}
                            placeholder="e.g., Write a friendly intro..."
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            defaultValue={prompt}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={16} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result Output */}
                    {result && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-300">AI Output</label>
                                <button onClick={handleCopy} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                    <Copy size={12} /> Copy
                                </button>
                            </div>
                            <div
                                ref={resultRef}
                                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-sm text-gray-200 whitespace-pre-wrap max-h-[400px] overflow-y-auto"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => setResult(e.currentTarget.textContent)}
                            >
                                {/* Minimal cleanup for HTML display if needed, or raw text */}
                                {result.replace(/<[^>]+>/g, '')}
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                You can edit the text directly above.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-700 bg-gray-900/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onAccept(result)}
                        disabled={!result || loading}
                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check size={18} />
                        Accept & Use
                    </button>
                </div>

            </div>
        </>
    );
}
