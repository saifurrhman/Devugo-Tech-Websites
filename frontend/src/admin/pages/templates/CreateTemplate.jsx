import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Type, Image as ImageIcon, ExternalLink, Save, ArrowLeft,
    Monitor, Tablet, Smartphone, Move, Trash2, ChevronUp, ChevronDown,
    Minus, Instagram, Code, Video, Menu, Bold, Italic, Underline,
    AlignLeft, AlignCenter, AlignRight, Layout, Grid, Palette, Settings,
    Plus, Link, Copy
} from 'lucide-react';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { TemplateAPI } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';

// --- Block Definitions ---
const BLOCK_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    BUTTON: 'button',
    DIVIDER: 'divider',
    SPACER: 'spacer',
    SOCIAL: 'social',
    HTML: 'html',
    ROW: 'row' // New Layout Block
};

const DEFAULT_BLOCKS = {
    [BLOCK_TYPES.TEXT]: {
        text: '<h2 style="margin:0">Hello World</h2><p style="margin:0">Start editing your text here...</p>',
        styles: { textAlign: 'left', padding: '10px', color: '#000000', backgroundColor: 'transparent', fontSize: '16px', lineHeight: '1.5' }
    },
    [BLOCK_TYPES.IMAGE]: {
        src: 'https://via.placeholder.com/600x300',
        alt: 'Image',
        width: '100%',
        url: '',
        styles: { padding: '10px', textAlign: 'center', backgroundColor: 'transparent', borderRadius: '0px' }
    },
    [BLOCK_TYPES.BUTTON]: {
        text: 'Click Me',
        url: '#',
        styles: {
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            borderRadius: '4px',
            padding: '12px 24px',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            width: 'auto',
            border: 'none'
        },
        containerStyles: { textAlign: 'center', padding: '10px' }
    },
    [BLOCK_TYPES.DIVIDER]: {
        styles: { borderTop: '2px solid #e2e8f0', margin: '20px 0', width: '100%' },
        containerStyles: { padding: '10px' }
    },
    [BLOCK_TYPES.SPACER]: { height: '30px', styles: { backgroundColor: 'transparent' } },
    [BLOCK_TYPES.SOCIAL]: {
        networks: [
            { id: 'fb', icon: 'facebook', url: '#', color: '#3b5998' },
            { id: 'tw', icon: 'twitter', url: '#', color: '#1da1f2' },
            { id: 'li', icon: 'linkedin', url: '#', color: '#0077b5' },
            { id: 'in', icon: 'instagram', url: '#', color: '#e1306c' }
        ],
        iconStyle: 'rounded', // rounded, square, circle
        styles: { padding: '15px', textAlign: 'center', gap: '10px' }
    },
    [BLOCK_TYPES.ROW]: {
        columns: 2, // 1, 2, 3
        gap: '10px',
        styles: { padding: '0px', backgroundColor: 'transparent' },
        // Content for columns would effectively be nested blocks, but for simplicity we might just do text columns
        col1: 'Column 1 Text',
        col2: 'Column 2 Text',
        col3: 'Column 3 Text'
    }
};

export default function CreateTemplate() {
    const navigate = useNavigate();
    const { success, error, warning } = useNotification();

    // Editor State
    const [name, setName] = useState('Untitled Template');
    const [blocks, setBlocks] = useState([
        { id: Date.now(), type: BLOCK_TYPES.TEXT, content: JSON.parse(JSON.stringify(DEFAULT_BLOCKS[BLOCK_TYPES.TEXT])) }
    ]);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [viewMode, setViewMode] = useState('desktop');
    const [activePanelTab, setActivePanelTab] = useState('blocks'); // blocks, body
    const [loading, setLoading] = useState(false);

    // Design System State
    const [globalStyles, setGlobalStyles] = useState({
        backgroundColor: '#f1f5f9', // Outer bg
        bodyBackgroundColor: '#ffffff', // Inner card bg
        contentWidth: '600px',
        fontFamily: 'Arial, sans-serif',
        linkColor: '#3b82f6'
    });

    // --- Actions ---

    const addBlock = (type) => {
        const newBlock = {
            id: Date.now() + Math.random(),
            type,
            content: JSON.parse(JSON.stringify(DEFAULT_BLOCKS[type]))
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
        setActivePanelTab('edit'); // Switch to edit mode automatically
    };

    const duplicateBlock = (id) => {
        const block = blocks.find(b => b.id === id);
        if (!block) return;
        const newBlock = {
            ...JSON.parse(JSON.stringify(block)),
            id: Date.now() + Math.random()
        };
        const index = blocks.findIndex(b => b.id === id);
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        setBlocks(newBlocks);
    };

    const updateBlock = (id, newContent) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...newContent } } : b));
    };

    const deleteBlock = (id) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const moveBlock = (id, direction) => {
        const index = blocks.findIndex(b => b.id === id);
        if (index < 0) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    // --- HTML Generator (Advanced) ---
    const generateHTML = () => {
        const rows = blocks.map(block => {
            let inner = '';

            // Common styles
            const padding = block.content.styles?.padding || '0px';
            const bg = block.content.styles?.backgroundColor || 'transparent';
            const align = block.content.styles?.textAlign || 'left';

            switch (block.type) {
                case BLOCK_TYPES.TEXT:
                    inner = `<div style="font-size:${block.content.styles.fontSize}; line-height:${block.content.styles.lineHeight}; color:${block.content.styles.color}; font-family:${globalStyles.fontFamily};">${block.content.text}</div>`;
                    break;

                case BLOCK_TYPES.IMAGE:
                    inner = `<a href="${block.content.url || '#'}" style="text-decoration:none; display:block;">
                        <img src="${block.content.src}" alt="${block.content.alt}" width="${block.content.width.replace('%', '')}" style="width:${block.content.width}; max-width:100%; display:inline-block; border-radius:${block.content.styles.borderRadius};" border="0" />
                     </a>`;
                    break;

                case BLOCK_TYPES.BUTTON:
                    inner = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${block.content.styles.width === '100%' ? '100%' : 'auto'}" style="margin:${align === 'center' ? '0 auto' : '0'};">
                        <tr>
                            <td align="center" bgcolor="${block.content.styles.backgroundColor}" style="border-radius:${block.content.styles.borderRadius};">
                                <a href="${block.content.url}" target="_blank" style="font-family:${globalStyles.fontFamily}; font-size:${block.content.styles.fontSize}; font-weight:${block.content.styles.fontWeight}; color:${block.content.styles.color}; text-decoration:none; padding:${block.content.styles.padding}; border:1px solid ${block.content.styles.backgroundColor}; display:inline-block; border-radius:${block.content.styles.borderRadius}; letter-spacing:0.5px;">
                                    ${block.content.text}
                                </a>
                            </td>
                        </tr>
                    </table>`;
                    break;

                case BLOCK_TYPES.ROW:
                    // Multi-column layout simulation
                    const colWidth = 100 / block.content.columns;
                    let colsHTML = '';
                    for (let i = 1; i <= block.content.columns; i++) {
                        colsHTML += `
                        <td width="${colWidth}%" valign="top" style="padding:${block.content.gap};">
                           <div style="font-family:${globalStyles.fontFamily}">${block.content[`col${i}`]}</div> 
                        </td>`;
                    }
                    inner = `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr>${colsHTML}</tr></table>`;
                    break;

                case BLOCK_TYPES.SOCIAL:
                    const icons = block.content.networks.map(net =>
                        `<a href="${net.url}" style="text-decoration:none; display:inline-block; margin:0 5px;">
                            <span style="background:${net.color}; color:#fff; padding:8px 12px; border-radius:4px; font-size:12px; font-family:sans-serif;">${net.id.toUpperCase()}</span>
                        </a>`
                    ).join('');
                    inner = `<div style="text-align:${block.content.styles.textAlign};">${icons}</div>`;
                    break;

                case BLOCK_TYPES.DIVIDER:
                    inner = `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="padding:${block.content.containerStyles?.padding || '10px'}"><div style="border-top:${block.content.styles.borderTop}; width:${block.content.styles.width}; margin:0 auto;"></div></td></tr></table>`;
                    break;

                case BLOCK_TYPES.SPACER:
                    inner = `<div style="height:${block.content.height}; font-size:0; line-height:0;">&nbsp;</div>`;
                    break;
            }

            return `
            <tr>
                <td align="${align}" bgcolor="${bg}" style="padding:${padding};">
                    ${inner}
                </td>
            </tr>`;
        }).join('');

        return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>${name}</title>
</head>
<body width="100%" style="margin:0; padding:0 !important; mso-line-height-rule:exactly; background-color:${globalStyles.backgroundColor};">
    <center style="width:100%; background-color:${globalStyles.backgroundColor};">
        <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;font-family:sans-serif;">
            ${name}
        </div>
        <div style="max-width:${globalStyles.contentWidth}; margin:0 auto;" class="email-container">
            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:auto;">
                <tr>
                    <td style="background-color:${globalStyles.bodyBackgroundColor}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            ${rows}
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </center>
</body>
</html>`;
    };

    const handleSave = async () => {
        if (!name.trim()) { warning('Template name required'); return; }
        setLoading(true);
        try {
            const html = generateHTML();
            await TemplateAPI.create({ name, htmlContent: html, design: JSON.stringify({ blocks, globalStyles }) });
            success('Template saved successfully!');
            navigate('/admin/templates');
        } catch (err) {
            console.error('Save failed', err);
            error('Failed to save template');
        } finally {
            setLoading(false);
        }
    };

    // --- Sub-components ---

    const RichToolbar = ({ onFormat }) => (
        <div className="flex gap-1 p-1 bg-gray-800 rounded border border-gray-700 mb-2 overflow-x-auto">
            <button onClick={() => onFormat('bold')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Bold size={14} /></button>
            <button onClick={() => onFormat('italic')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Italic size={14} /></button>
            <button onClick={() => onFormat('underline')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><Underline size={14} /></button>
            <div className="w-px bg-gray-700 mx-1"></div>
            <button onClick={() => onFormat('left')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><AlignLeft size={14} /></button>
            <button onClick={() => onFormat('center')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><AlignCenter size={14} /></button>
            <button onClick={() => onFormat('right')} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"><AlignRight size={14} /></button>
        </div>
    );

    const PropertiesPanel = () => {
        const block = blocks.find(b => b.id === selectedBlockId);

        if (!block) return (
            <div className="p-6 text-gray-500 text-center flex flex-col items-center">
                <Move className="mb-3 opacity-50" size={32} />
                <p className="text-sm">Select a block on the canvas to customize it</p>
                <div className="my-4 w-full h-px bg-gray-800"></div>
                <p className="text-xs text-gray-600">Tip: You can reorder blocks using the controls on the canvas.</p>
            </div>
        );

        return (
            <div className="p-4 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="font-bold text-white text-sm uppercase flex items-center gap-2">
                        {block.type === BLOCK_TYPES.TEXT && <Type size={16} className="text-blue-500" />}
                        {block.type === BLOCK_TYPES.IMAGE && <ImageIcon size={16} className="text-purple-500" />}
                        {block.type === BLOCK_TYPES.BUTTON && <ExternalLink size={16} className="text-green-500" />}
                        {block.type} Settings
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => duplicateBlock(block.id)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors" title="Duplicate">
                            <Copy size={14} />
                        </button>
                        <button onClick={() => deleteBlock(block.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors" title="Delete">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Common: Box Model */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Spacing & Background</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400">Padding</label>
                            <input type="text" value={block.content.styles.padding || ''} onChange={(e) => updateBlock(block.id, { styles: { ...block.content.styles, padding: e.target.value } })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-white" placeholder="10px" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-400">Background</label>
                            <div className="flex gap-2">
                                <input type="color" value={block.content.styles.backgroundColor === 'transparent' ? '#ffffff' : block.content.styles.backgroundColor} onChange={(e) => updateBlock(block.id, { styles: { ...block.content.styles, backgroundColor: e.target.value } })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-none" />
                                <span className="text-xs text-gray-400 py-1">{block.content.styles.backgroundColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specifics */}
                {block.type === BLOCK_TYPES.TEXT && (
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Typography</label>
                        <RichToolbar onFormat={(fmt) => {
                            // Simple text modification mock - deeper integration would require ContentEditable or Slate.js
                            if (fmt === 'left' || fmt === 'center' || fmt === 'right') {
                                updateBlock(block.id, { styles: { ...block.content.styles, textAlign: fmt } });
                            }
                        }} />
                        <textarea
                            rows={8}
                            value={block.content.text.replace(/<[^>]*>?/gm, "")} // Simple strip tags for edit
                            onChange={(e) => updateBlock(block.id, { text: `<p style="margin:0">${e.target.value}</p>` })}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white font-sans leading-relaxed focus:border-blue-500 outline-none"
                            placeholder="Type your content..."
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400">Size</label>
                                <select value={block.content.styles.fontSize} onChange={(e) => updateBlock(block.id, { styles: { ...block.content.styles, fontSize: e.target.value } })} className="w-full bg-gray-800 border border-gray-700 rounded px-2 text-xs h-8 text-white">
                                    {[12, 14, 16, 18, 20, 24, 30, 36, 48].map(s => <option key={s} value={`${s}px`}>{s}px</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400">Color</label>
                                <input type="color" value={block.content.styles.color} onChange={(e) => updateBlock(block.id, { styles: { ...block.content.styles, color: e.target.value } })} className="w-full h-8 bg-gray-800 border border-gray-700 rounded" />
                            </div>
                        </div>
                    </div>
                )}

                {block.type === BLOCK_TYPES.IMAGE && (
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Image Attributes</label>
                        <input type="text" value={block.content.src} onChange={(e) => updateBlock(block.id, { src: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white" placeholder="Image URL (https://...)" />

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Width</label>
                                <input type="text" value={block.content.width} onChange={(e) => updateBlock(block.id, { width: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-xs text-white" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 mb-1 block">Link URL</label>
                                <input type="text" value={block.content.url} onChange={(e) => updateBlock(block.id, { url: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-xs text-white" placeholder="#" />
                            </div>
                        </div>
                    </div>
                )}

                {block.type === BLOCK_TYPES.BUTTON && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Button Content</label>
                            <input type="text" value={block.content.text} onChange={(e) => updateBlock(block.id, { text: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white font-medium" />
                            <input type="text" value={block.content.url} onChange={(e) => updateBlock(block.id, { url: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-gray-400" placeholder="https://..." />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Style</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-400 mb-1 block">Background</label>
                                    <input type="color" value={block.content.styles.backgroundColor} onChange={(e) => updateBlock(block.id, { styles: { ...block.content.styles, backgroundColor: e.target.value } })} className="w-full h-8 rounded cursor-pointer" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 mb-1 block">Text Color</label>
                                    <input type="color" value={block.content.styles.color} onChange={(e) => updateBlock(block.id, { styles: { ...block.content.styles, color: e.target.value } })} className="w-full h-8 rounded cursor-pointer" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div>
                                    <label className="text-[10px] text-gray-400 mb-1 block">Corner Radius</label>
                                    <input type="text" value={block.content.styles.borderRadius} onChange={(e) => updateBlock(block.id, { styles: { ...block.content.styles, borderRadius: e.target.value } })} className="w-full bg-gray-800 border-gray-700 rounded p-1.5 text-xs text-white" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 mb-1 block">Alignment</label>
                                    <div className="flex bg-gray-800 rounded border border-gray-700">
                                        {['left', 'center', 'right'].map(align => (
                                            <button key={align} onClick={() => updateBlock(block.id, { styles: { ...block.content.styles, textAlign: align } })} className={`flex-1 p-1.5 hover:bg-gray-700 ${block.content.styles.textAlign === align ? 'bg-gray-700 text-blue-400' : 'text-gray-400'}`}>
                                                {align === 'left' && <AlignLeft size={12} />}
                                                {align === 'center' && <AlignCenter size={12} />}
                                                {align === 'right' && <AlignRight size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const GlobalStylesPanel = () => (
        <div className="p-4 space-y-6">
            <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2 mb-4">
                <Settings size={16} className="text-gray-400" /> Page Settings
            </h3>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Content Width</label>
                    <select value={globalStyles.contentWidth} onChange={(e) => setGlobalStyles({ ...globalStyles, contentWidth: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white">
                        <option value="480px">Narrow (480px)</option>
                        <option value="600px">Standard (600px)</option>
                        <option value="720px">Wide (720px)</option>
                        <option value="100%">Full Width</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Background Color</label>
                    <div className="flex items-center gap-3 bg-gray-800 p-2 rounded border border-gray-700">
                        <input type="color" value={globalStyles.backgroundColor} onChange={(e) => setGlobalStyles({ ...globalStyles, backgroundColor: e.target.value })} className="w-8 h-8 rounded border-none cursor-pointer" />
                        <span className="text-xs text-gray-300 font-mono">{globalStyles.backgroundColor}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Card Color</label>
                    <div className="flex items-center gap-3 bg-gray-800 p-2 rounded border border-gray-700">
                        <input type="color" value={globalStyles.bodyBackgroundColor} onChange={(e) => setGlobalStyles({ ...globalStyles, bodyBackgroundColor: e.target.value })} className="w-8 h-8 rounded border-none cursor-pointer" />
                        <span className="text-xs text-gray-300 font-mono">{globalStyles.bodyBackgroundColor}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Font Family</label>
                    <select value={globalStyles.fontFamily} onChange={(e) => setGlobalStyles({ ...globalStyles, fontFamily: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white">
                        <option value="Arial, sans-serif">Arial / Helvetica</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Verdana, sans-serif">Verdana</option>
                        <option value="Tahoma, sans-serif">Tahoma</option>
                    </select>
                </div>
            </div>
        </div>
    );

    // Renderer
    const renderCanvasBlock = (block, index) => {
        const isSelected = selectedBlockId === block.id;

        // Overlay controls for reordering/deleting
        const controls = isSelected && (
            <div className="absolute -right-10 top-0 flex flex-col gap-1 z-30 opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }} className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded shadow-sm border border-gray-600" title="Move Up"><ChevronUp size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }} className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded shadow-sm border border-gray-600" title="Move Down"><ChevronDown size={14} /></button>
                <div className="h-px bg-gray-700 my-0.5"></div>
                <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="p-1.5 bg-red-900/80 hover:bg-red-700 text-red-200 rounded shadow-sm border border-red-800" title="Remove"><Trash2 size={14} /></button>
            </div>
        );

        let content = null;
        const styles = { ...block.content.styles };

        if (block.type === BLOCK_TYPES.TEXT) {
            content = <div style={{ ...styles, fontFamily: globalStyles.fontFamily }} dangerouslySetInnerHTML={{ __html: block.content.text }} />;
        } else if (block.type === BLOCK_TYPES.IMAGE) {
            content = (
                <div style={{ textAlign: styles.textAlign, padding: styles.padding, backgroundColor: styles.backgroundColor }}>
                    <img src={block.content.src} alt={block.content.alt} style={{ width: block.content.width, maxWidth: '100%', borderRadius: styles.borderRadius }} />
                </div>
            );
        } else if (block.type === BLOCK_TYPES.BUTTON) {
            content = (
                <div style={{ textAlign: block.content.containerStyles?.textAlign || 'center', padding: block.content.containerStyles?.padding || '10px' }}>
                    <span style={{
                        display: 'inline-block',
                        backgroundColor: styles.backgroundColor,
                        color: styles.color,
                        padding: styles.padding,
                        borderRadius: styles.borderRadius,
                        fontSize: styles.fontSize,
                        fontWeight: styles.fontWeight,
                        cursor: 'pointer'
                    }}>
                        {block.content.text}
                    </span>
                </div>
            );
        } else if (block.type === BLOCK_TYPES.DIVIDER) {
            content = <div style={{ padding: block.content.containerStyles?.padding || '10px' }}><div style={{ borderTop: styles.borderTop, margin: '0 auto', width: styles.width }}></div></div>;
        } else if (block.type === BLOCK_TYPES.SPACER) {
            content = <div style={{ height: block.content.height }}></div>;
        } else if (block.type === BLOCK_TYPES.ROW) {
            content = (
                <div className="flex w-full" style={{ gap: block.content.gap }}>
                    {[...Array(block.content.columns)].map((_, i) => (
                        <div key={i} className="flex-1 bg-gray-50/50 min-h-[50px] border border-dashed border-gray-300 flex items-center justify-center p-2 text-xs text-gray-400 font-mono">
                            {block.content[`col${i + 1}`]}
                        </div>
                    ))}
                </div>
            );
        } else if (block.type === BLOCK_TYPES.SOCIAL) {
            content = (
                <div style={{ ...styles, display: 'flex', justifyContent: styles.textAlign === 'center' ? 'center' : styles.textAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                    {block.content.networks.map(net => (
                        <div key={net.id} style={{ backgroundColor: net.color }} className="text-white text-[10px] px-2 py-1 rounded">
                            {net.id.toUpperCase()}
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div
                key={block.id}
                onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setActivePanelTab('edit'); }}
                className={`relative group transition-all cursor-pointer border-2 ${isSelected ? 'border-blue-500 ring-4 ring-blue-500/10 z-10' : 'border-transparent hover:border-blue-300 hover:z-10'}`}
                style={{ position: 'relative' }}
            >
                {controls}
                {content}
            </div>
        );
    };

    const widthClass = viewMode === 'mobile' ? 'w-[320px]' : viewMode === 'tablet' ? 'w-[480px]' : `w-[${globalStyles.contentWidth === '100%' ? '100%' : globalStyles.contentWidth}] max-w-full`;

    return (
        <div className="admin-layout flex h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <AdminTopbar />

                {/* Header Toolbar */}
                <header className="h-16 px-6 border-b border-gray-800 bg-[#1e293b] flex justify-between items-center shrink-0 shadow-lg z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/templates')} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                        <div className="h-6 w-px bg-gray-700"></div>
                        <div className="flex items-center gap-2">
                            <Link size={16} className="text-gray-500" />
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-transparent border-none text-white font-semibold focus:ring-0 placeholder-gray-500 w-64 px-0"
                                placeholder="Template Name..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* View Toggles */}
                        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                            <button onClick={() => setViewMode('desktop')} className={`p-2 rounded transition-all ${viewMode === 'desktop' ? 'bg-gray-700 text-blue-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}><Monitor size={18} /></button>
                            <button onClick={() => setViewMode('tablet')} className={`p-2 rounded transition-all ${viewMode === 'tablet' ? 'bg-gray-700 text-blue-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}><Tablet size={18} /></button>
                            <button onClick={() => setViewMode('mobile')} className={`p-2 rounded transition-all ${viewMode === 'mobile' ? 'bg-gray-700 text-blue-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}><Smartphone size={18} /></button>
                        </div>

                        <div className="h-6 w-px bg-gray-700"></div>

                        <button onClick={handleSave} disabled={loading} className="btn-primary px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg flex gap-2 items-center font-medium shadow-lg shadow-blue-500/20 transform active:scale-95 transition-all">
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Template'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Components Library (Left) */}
                    <div className="w-16 lg:w-20 bg-[#1e293b] border-r border-gray-800 flex flex-col items-center py-4 gap-4 shrink-0 z-10">
                        <button
                            onClick={() => { setActivePanelTab('blocks'); setSelectedBlockId(null); }}
                            className={`p-3 rounded-xl transition-all ${activePanelTab === 'blocks' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                            title="Blocks"
                        >
                            <Plus size={24} />
                        </button>
                        <button
                            onClick={() => { setActivePanelTab('design'); setSelectedBlockId(null); }}
                            className={`p-3 rounded-xl transition-all ${activePanelTab === 'design' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                            title="Global Design"
                        >
                            <Palette size={24} />
                        </button>
                    </div>

                    {/* Canvas Area (Center) */}
                    <div className="flex-1 bg-[#0f172a] p-8 overflow-y-auto flex justify-center relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
                        <div
                            className={`${widthClass} transition-all duration-300 shadow-2xl min-h-[800px] flex flex-col`}
                            style={{ backgroundColor: globalStyles.backgroundColor }}
                            onClick={() => setSelectedBlockId(null)}
                        >
                            <div className="p-8 flex-1" style={{ maxWidth: globalStyles.contentWidth, margin: '0 auto', width: '100%', backgroundColor: globalStyles.bodyBackgroundColor, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                                {blocks.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl p-10 bg-gray-50/50">
                                        <div className="bg-gray-200 p-4 rounded-full mb-4">
                                            <Grid size={40} className="text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-500 mb-2">Start Designing</h3>
                                        <p className="text-sm">Select blocks from the sidebar to build your template</p>
                                    </div>
                                ) : (
                                    blocks.map((block, i) => renderCanvasBlock(block, i))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Properties / Tools Panel (Right) */}
                    <div className="w-[320px] bg-[#1e293b] border-l border-gray-800 flex flex-col shrink-0">
                        {activePanelTab === 'blocks' && (
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-5">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Basic Content</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { type: BLOCK_TYPES.TEXT, icon: Type, label: 'Text' },
                                            { type: BLOCK_TYPES.IMAGE, icon: ImageIcon, label: 'Image' },
                                            { type: BLOCK_TYPES.BUTTON, icon: ExternalLink, label: 'Button' },
                                            { type: BLOCK_TYPES.DIVIDER, icon: Minus, label: 'Divider' },
                                            { type: BLOCK_TYPES.SPACER, icon: Move, label: 'Spacer' },
                                            { type: BLOCK_TYPES.SOCIAL, icon: Instagram, label: 'Social' },
                                        ].map(item => (
                                            <button
                                                key={item.label}
                                                onClick={() => addBlock(item.type)}
                                                className="flex flex-col items-center justify-center p-4 bg-[#0f172a] border border-gray-700 rounded-xl hover:border-blue-500 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                                            >
                                                <div className="bg-gray-800 p-2.5 rounded-lg mb-2 group-hover:bg-blue-500/10 group-hover:text-blue-400 text-gray-400 transition-colors">
                                                    <item.icon size={20} />
                                                </div>
                                                <span className="text-xs font-medium text-gray-300 group-hover:text-white">{item.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 mt-8">Layout</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button onClick={() => addBlock(BLOCK_TYPES.ROW)} className="flex items-center gap-3 p-4 bg-[#0f172a] border border-gray-700 rounded-xl hover:border-blue-500 hover:bg-gray-800 transition-all group text-left">
                                            <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-blue-500/10 group-hover:text-blue-400 text-gray-400 transition-colors">
                                                <Layout size={20} />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-medium text-gray-300 group-hover:text-white">Row Layout</span>
                                                <span className="text-[10px] text-gray-500">Add columns and sections</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activePanelTab === 'design' && <GlobalStylesPanel />}

                        {activePanelTab === 'edit' && (
                            <div className="flex-1 overflow-y-auto">
                                {selectedBlockId ? <PropertiesPanel /> : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                                        <span className="bg-gray-800 p-4 rounded-full mb-3"><Move size={24} /></span>
                                        <p>Please select a block to edit manually or add a new one.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
