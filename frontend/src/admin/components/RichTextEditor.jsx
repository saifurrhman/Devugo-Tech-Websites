import React, { useRef, useEffect, useState } from 'react';
import {
    Bold, Italic, Underline, Link, Image, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, Type, Code, X, Paperclip, Sparkles
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder }) {
    const [showCode, setShowCode] = useState(false);
    const editorRef = useRef(null);

    // Sync value to innerHTML when value changes externally (and we are not focusing/typing)
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML && !showCode) {
            // Only update if significantly different to avoid cursor jumping
            // Simple check: if empty value, clear. If value exists and editor is empty, set.
            if (!editorRef.current.innerHTML || value === '') {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value, showCode]);

    const exec = (command, val = null) => {
        document.execCommand(command, false, val);
        handleChange();
    };

    const handleChange = () => {
        if (editorRef.current && onChange) {
            const html = editorRef.current.innerHTML;
            onChange(html);
        }
    };

    const handleKeyDown = (e) => {
        // Simple support for tab indentation could go here
    };

    const addLink = () => {
        const url = prompt('Enter URL:');
        if (url) exec('createLink', url);
    };

    const addImage = () => {
        const url = prompt('Enter Image URL:');
        if (url) exec('insertImage', url);
    }

    return (
        <div className="border border-gray-700 rounded-lg overflow-hidden bg-[#1e293b] flex flex-col h-[400px]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-800/50 border-b border-gray-700">
                <ToolBtn onClick={() => exec('bold')} icon={Bold} title="Bold" />
                <ToolBtn onClick={() => exec('italic')} icon={Italic} title="Italic" />
                <ToolBtn onClick={() => exec('underline')} icon={Underline} title="Underline" />
                <div className="w-px h-6 bg-gray-700 mx-1" />

                <ToolBtn onClick={() => exec('justifyLeft')} icon={AlignLeft} title="Align Left" />
                <ToolBtn onClick={() => exec('justifyCenter')} icon={AlignCenter} title="Align Center" />
                <ToolBtn onClick={() => exec('justifyRight')} icon={AlignRight} title="Align Right" />
                <div className="w-px h-6 bg-gray-700 mx-1" />

                <ToolBtn onClick={() => exec('insertUnorderedList')} icon={List} title="Bullet List" />
                <ToolBtn onClick={() => exec('insertOrderedList')} icon={ListOrdered} title="Numbered List" />
                <div className="w-px h-6 bg-gray-700 mx-1" />

                <ToolBtn onClick={addLink} icon={Link} title="Link" />
                <ToolBtn onClick={addImage} icon={Image} title="Image" />
                <div className="w-px h-6 bg-gray-700 mx-1" />

                <ToolBtn onClick={() => exec('removeFormat')} icon={X} title="Clear Formatting" />
                <ToolBtn onClick={() => setShowCode(!showCode)} icon={Code} active={showCode} title="View Source" />
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden relative">
                {showCode ? (
                    <textarea
                        className="w-full h-full bg-gray-900 text-gray-300 p-4 font-mono text-sm outline-none resize-none"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                ) : (
                    <div
                        ref={editorRef}
                        className="w-full h-full bg-[#1e293b] text-white p-4 outline-none overflow-y-auto prose prose-invert max-w-none"
                        contentEditable
                        onInput={handleChange}
                        onBlur={handleChange}
                        style={{ minHeight: '100%' }}
                        dangerouslySetInnerHTML={{ __html: value }} // Initial render
                    />
                )}
                {!value && !showCode && (
                    <div className="absolute top-4 left-4 text-gray-600 pointer-events-none">
                        {placeholder || 'Start typing...'}
                    </div>
                )}
            </div>
        </div>
    );
}

function ToolBtn({ icon: Icon, onClick, title, active }) {
    return (
        <button
            onClick={(e) => { e.preventDefault(); onClick(); }}
            title={title}
            className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${active ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:text-white'}`}
        >
            <Icon size={18} />
        </button>
    );
}
