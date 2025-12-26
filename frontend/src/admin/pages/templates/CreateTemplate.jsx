import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Type, Image as ImageIcon, ExternalLink, Save, ArrowLeft,
    Monitor, Tablet, Smartphone, Move, Trash2, ChevronUp, ChevronDown,
    Minus, Instagram, Code, Layout, Grid, Palette, Settings,
    Plus, Link, Copy, Sparkles, Braces, Eye
} from 'lucide-react';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import AIPanel from '../../../components/AIPanel';
import { TemplateAPI, AIAPI } from '../../../lib/api';
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
    ROW: 'row'
};

const DEFAULT_BLOCKS = {
    [BLOCK_TYPES.TEXT]: {
        text: '<h2 style="margin:0">Hello World</h2><p style="margin:0">Start editing your text here...</p>',
        styles: { textAlign: 'left', padding: '10px', color: '#ffffff', backgroundColor: 'transparent', fontSize: '16px', lineHeight: '1.5' }
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
        styles: { borderTop: '2px solid #334155', margin: '20px 0', width: '100%' },
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
        iconStyle: 'rounded',
        styles: { padding: '15px', textAlign: 'center', gap: '10px' }
    },
    [BLOCK_TYPES.ROW]: {
        columns: 2,
        gap: '10px',
        styles: { padding: '0px', backgroundColor: 'transparent' },
        col1: 'Column 1 Text',
        col2: 'Column 2 Text',
        col3: 'Column 3 Text'
    }
};

export default function CreateTemplate() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const templateId = searchParams.get('id');
    const { success, error, warning } = useNotification();

    // Editor State
    const [name, setName] = useState('Untitled Template');
    const [blocks, setBlocks] = useState([
        { id: Date.now(), type: BLOCK_TYPES.TEXT, content: JSON.parse(JSON.stringify(DEFAULT_BLOCKS[BLOCK_TYPES.TEXT])) }
    ]);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile, code
    const [activePanelTab, setActivePanelTab] = useState('blocks'); // blocks, body, edit
    const [loading, setLoading] = useState(false);

    // AI State
    const [aiPanelOpen, setAiPanelOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiAction, setAiAction] = useState(null);

    // Design System State
    const [globalStyles, setGlobalStyles] = useState({
        backgroundColor: '#0f172a', // Dark theme default
        bodyBackgroundColor: '#1e293b',
        contentWidth: '600px',
        fontFamily: 'Arial, sans-serif',
        linkColor: '#3b82f6'
    });

    // Variables
    const [variablesOpen, setVariablesOpen] = useState(false);
    const variables = ['{{firstName}}', '{{lastName}}', '{{email}}', '{{company}}', '{{unsubscribeUrl}}'];

    // --- Actions ---

    const addBlock = (type) => {
        const newBlock = {
            id: Date.now() + Math.random(),
            type,
            content: JSON.parse(JSON.stringify(DEFAULT_BLOCKS[type]))
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
        setActivePanelTab('edit');
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

    const insertVariable = (variable) => {
        if (selectedBlockId) {
            const block = blocks.find(b => b.id === selectedBlockId);
            if (block && block.type === BLOCK_TYPES.TEXT) {
                // Simple append for now - ideally insert at cursor
                // For now let's just copy to clipboard or append to end if simple
                updateBlock(selectedBlockId, { text: block.content.text + ' ' + variable });
                success(`Inserted ${variable}`);
            } else {
                warning('Select a text block to insert variable');
            }
        } else {
            navigator.clipboard.writeText(variable);
            success('Copied ' + variable + ' to clipboard');
        }
        setVariablesOpen(false);
    };

    // --- HTML Generator ---
    const generateHTML = (forPreview = false) => {
        const rows = blocks.map(block => {
            let inner = '';
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
                default: break;
            }

            return `<tr><td align="${align}" bgcolor="${bg}" style="padding:${padding};">${inner}</td></tr>`;
        }).join('');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${name}</title>
</head>
<body width="100%" style="margin:0; padding:0 !important; background-color:${globalStyles.backgroundColor}; color: #ffffff;">
    <center style="width:100%; background-color:${globalStyles.backgroundColor};">
        <div style="max-width:${globalStyles.contentWidth}; margin:0 auto; padding: 20px 0;">
            <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:auto; background-color:${globalStyles.bodyBackgroundColor}; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                ${rows}
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

    // AI Integration
    const startAI = (type) => {
        setAiAction(type); // 'generate_text', 'improve_text'
        if (type === 'generate_text') setAiPrompt('Write a paragraph about...');
        else if (type === 'improve_text') setAiPrompt('Make this text more persuasive...');
        setAiPanelOpen(true);
    };

    const handleAIGenerate = async (prompt) => {
        try {
            // Use generic endpoint or text generation endpoint
            const res = await AIAPI.generate({
                action: 'text',
                goal: 'Email Content',
                customPrompt: prompt
            });
            return res.data; // Expecting string or object with body
        } catch (e) {
            throw e;
        }
    };

    const handleAIAccept = (content) => {
        const final = typeof content === 'string' ? content : content.body;
        if (selectedBlockId) {
            // If a block is selected, try to update it
            updateBlock(selectedBlockId, { text: `<p>${final}</p>` });
        } else {
            // Add new text block
            const newBlock = {
                id: Date.now(),
                type: BLOCK_TYPES.TEXT,
                content: {
                    ...JSON.parse(JSON.stringify(DEFAULT_BLOCKS[BLOCK_TYPES.TEXT])),
                    text: `<p>${final}</p>`
                }
            };
            setBlocks([...blocks, newBlock]);
        }
        setAiPanelOpen(false);
    };

    const PropertiesPanel = () => {
        const block = blocks.find(b => b.id === selectedBlockId);
        if (!block) return (
            <div className="p-6 text-gray-500 text-center flex flex-col items-center">
                <Move className="mb-3 opacity-50" size={32} />
                <p className="text-sm">Select a block to edit</p>
            </div>
        );

        return (
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                    <span className="font-bold text-white text-sm uppercase">{block.type} Settings</span>
                    <div className="flex gap-2">
                        <button onClick={() => duplicateBlock(block.id)} className="p-1.5 text-gray-400 hover:text-white"><Copy size={14} /></button>
                        <button onClick={() => deleteBlock(block.id)} className="p-1.5 text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                </div>

                {block.type === BLOCK_TYPES.TEXT && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-500">Content</label>
                            <button onClick={() => startAI('generate_text')} className="flex items-center gap-1 text-[10px] bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded hover:bg-purple-600/30">
                                <Sparkles size={10} /> AI Write
                            </button>
                        </div>
                        <textarea
                            rows={8}
                            value={block.content.text.replace(/<[^>]*>?/gm, "")}
                            onChange={(e) => updateBlock(block.id, { text: `<p style="margin:0">${e.target.value}</p>` })}
                            className="w-full bg-gray-800 border-gray-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-gray-400">Color</label>
                                <input type="color" value={block.content.styles.color} onChange={(e) => updateBlock(block.id, { styles: { ...block.content.styles, color: e.target.value } })} className="w-full h-8 bg-gray-800 border-gray-700 rounded" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Font Size</label>
                                <select value={block.content.styles.fontSize} onChange={(e) => updateBlock(block.id, { styles: { ...block.content.styles, fontSize: e.target.value } })} className="w-full h-8 bg-gray-800 border-gray-700 rounded text-xs text-white">
                                    {[12, 14, 16, 18, 20, 24, 30, 36, 48].map(s => <option key={s} value={`${s}px`}>{s}px</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generic Styles */}
                <div className="space-y-3 pt-4 border-t border-gray-800">
                    <label className="text-xs font-semibold text-gray-500">Spacing & Styles</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-400">Padding</label>
                            <input type="text" value={block.content.styles.padding || ''} onChange={(e) => updateBlock(block.id, { styles: { ...block.content.styles, padding: e.target.value } })} className="w-full bg-gray-800 border-gray-700 rounded p-1 text-xs text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Background</label>
                            <div className="flex gap-2">
                                <input type="color" value={block.content.styles.backgroundColor === 'transparent' ? '#ffffff' : block.content.styles.backgroundColor} onChange={(e) => updateBlock(block.id, { styles: { ...block.content.styles, backgroundColor: e.target.value } })} className="w-6 h-6 rounded border-none" />
                                <span className="text-xs text-gray-400">{block.content.styles.backgroundColor}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-layout flex h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <AdminTopbar />

                <header className="h-16 px-6 border-b border-gray-800 bg-[#1e293b] flex justify-between items-center shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/templates')} className="text-gray-400 hover:text-white"><ArrowLeft size={20} /></button>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-transparent border-none text-white font-semibold w-64 px-2 hover:bg-gray-800 rounded"
                            placeholder="Template Name..."
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Variables Dropdown */}
                        <div className="relative">
                            <button onClick={() => setVariablesOpen(!variablesOpen)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
                                <Braces size={14} /> Variables <ChevronDown size={12} />
                            </button>
                            {variablesOpen && (
                                <div className="absolute top-full mt-2 right-0 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50">
                                    {variables.map(v => (
                                        <button key={v} onClick={() => insertVariable(v)} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white font-mono">
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* View Toggles */}
                        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                            {[
                                { id: 'desktop', icon: Monitor },
                                { id: 'tablet', icon: Tablet },
                                { id: 'mobile', icon: Smartphone },
                                { id: 'code', icon: Code }
                            ].map(view => (
                                <button
                                    key={view.id}
                                    onClick={() => setViewMode(view.id)}
                                    className={`p-2 rounded transition-all ${viewMode === view.id ? 'bg-gray-700 text-blue-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <view.icon size={18} />
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-px bg-gray-700"></div>

                        <button onClick={handleSave} disabled={loading} className="btn-primary px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex gap-2 items-center font-medium shadow-lg shadow-blue-500/20">
                            <Save size={18} /> {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Components Library (Left) */}
                    <div className="w-16 lg:w-20 bg-[#1e293b] border-r border-gray-800 flex flex-col items-center py-4 gap-4 shrink-0 z-10">
                        <button onClick={() => { setActivePanelTab('blocks'); setSelectedBlockId(null); }} className={`p-3 rounded-xl transition-all ${activePanelTab === 'blocks' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><Plus size={24} /></button>
                        <button onClick={() => { setActivePanelTab('design'); setSelectedBlockId(null); }} className={`p-3 rounded-xl transition-all ${activePanelTab === 'design' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><Palette size={24} /></button>
                    </div>

                    {/* Canvas Area (Center) */}
                    <div className="flex-1 bg-[#0f172a] p-8 overflow-y-auto flex justify-center relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
                        {viewMode === 'code' ? (
                            <div className="w-full max-w-4xl h-full bg-[#1e293b] rounded-xl border border-gray-700 overflow-hidden flex flex-col">
                                <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 text-xs text-gray-400 font-mono">HTML Source (Read Only)</div>
                                <pre className="flex-1 p-4 overflow-auto text-xs text-green-400 font-mono leading-relaxed">{generateHTML()}</pre>
                            </div>
                        ) : (
                            <div
                                className={`transition-all duration-300 shadow-2xl min-h-[800px] flex flex-col ${viewMode === 'mobile' ? 'w-[320px]' : viewMode === 'tablet' ? 'w-[480px]' : 'w-full max-w-[800px]'}`}
                                style={{ backgroundColor: globalStyles.backgroundColor }}
                                onClick={() => setSelectedBlockId(null)}
                            >
                                <div className="p-8 flex-1" style={{ maxWidth: globalStyles.contentWidth, margin: '0 auto', width: '100%', backgroundColor: globalStyles.bodyBackgroundColor, color: '#ffffff' }}>
                                    {blocks.map((block, i) => {
                                        let content;
                                        // Simple Inline Renderer Logic
                                        if (block.type === BLOCK_TYPES.TEXT) content = <div dangerouslySetInnerHTML={{ __html: block.content.text }} style={block.content.styles} />
                                        else if (block.type === BLOCK_TYPES.IMAGE) content = <img src={block.content.src} style={{ width: '100%', ...block.content.styles }} />
                                        else if (block.type === BLOCK_TYPES.BUTTON) content = <button style={block.content.styles}>{block.content.text}</button>
                                        else content = <div className="p-4 border border-dashed border-gray-600 text-gray-500 text-center text-xs">Block: {block.type}</div>

                                        return (
                                            <div
                                                key={block.id}
                                                onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); setActivePanelTab('edit'); }}
                                                className={`relative border-2 ${selectedBlockId === block.id ? 'border-blue-500' : 'border-transparent hover:border-blue-500/50'}`}
                                            >
                                                {content}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Properties (Right) */}
                    <div className="w-[300px] bg-[#1e293b] border-l border-gray-800 flex flex-col shrink-0">
                        {activePanelTab === 'blocks' && (
                            <div className="p-4 grid grid-cols-2 gap-3">
                                {Object.values(BLOCK_TYPES).map(type => (
                                    <button key={type} onClick={() => addBlock(type)} className="p-4 bg-gray-800 border border-gray-700 rounded-xl hover:border-blue-500 hover:text-white text-gray-400 flex flex-col items-center gap-2">
                                        <span className="capitalize text-xs font-bold">{type}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {activePanelTab === 'design' && (
                            <div className="p-4 space-y-4">
                                <h3 className="text-sm font-bold text-white">Global Styles</h3>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Background</label>
                                    <input type="color" value={globalStyles.backgroundColor} onChange={e => setGlobalStyles({ ...globalStyles, backgroundColor: e.target.value })} className="w-full h-8" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">Card Background</label>
                                    <input type="color" value={globalStyles.bodyBackgroundColor} onChange={e => setGlobalStyles({ ...globalStyles, bodyBackgroundColor: e.target.value })} className="w-full h-8" />
                                </div>
                            </div>
                        )}
                        {activePanelTab === 'edit' && <PropertiesPanel />}
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
        </div>
    );
}
