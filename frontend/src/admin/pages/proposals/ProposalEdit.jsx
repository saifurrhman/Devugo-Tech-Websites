import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import html2pdf from 'html2pdf.js';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { ProposalAPI } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';
import { ArrowLeft, Save, Download, FileText, User, DollarSign, Calendar, Mail, Copy, Eye } from 'lucide-react';

const getTemplateContent = (type) => {
    const structure = `
        <h2>1. Cover / Intro</h2>
        <p>[Client Name] / [Project Reference]</p>
        <p>I have reviewed your job post regarding [mention exactly what they need]. I fully understand the challenges you are facing and am confident in delivering a robust solution tailored to your exact needs.</p>

        <h2>2. Understanding of the Problem</h2>
        <p>Based on your requirements, the core issue is [restate their problem in your own words]. This requires a thoughtful approach to ensure scalability and efficiency without complicating the user experience.</p>

        <h2>3. Proposed Solution / Approach</h2>
        <p>Our approach will be structured in clear phases:</p>
        <ul>
            <li><strong>Phase 1: Discovery & Planning:</strong> Aligning on architecture and design.</li>
            <li><strong>Phase 2: Development:</strong> Building the core features.</li>
            <li><strong>Phase 3: Testing & Deployment:</strong> Rigorous QA and go-live.</li>
        </ul>

        <h2>4. Scope of Work / Deliverables</h2>
        <ul>
            <li>Deliverable 1</li>
            <li>Deliverable 2</li>
            <li>Deliverable 3</li>
        </ul>

        <h2>5. Tech Stack</h2>
        <p>We will utilize modern, scalable technologies including React, Node.js, and MongoDB.</p>

        <h2>6. Timeline</h2>
        <ul>
            <li><strong>Week 1-2:</strong> Design & Prototyping</li>
            <li><strong>Week 3-5:</strong> Core Development</li>
            <li><strong>Week 6:</strong> Testing & Handover</li>
        </ul>

        <h2>7. Pricing & Payment Terms</h2>
        <p>The project will be billed on a milestone basis to ensure trust and transparency at every step.</p>

        <h2>8. Why Choose Us</h2>
        <p>We have a proven track record of reducing manual workloads by over 40% and successfully launching highly scalable applications. You can view our past work here: [Insert Portfolio Link]</p>

        <h2>9. Next Steps</h2>
        <p>If this aligns with your vision, let's hop on a quick 15-minute call to finalize the scope, or reply to this proposal to confirm and I will share the contract.</p>
    `;

    if (type === 'web') {
        return structure.replace('React, Node.js, and MongoDB', 'Next.js, TailwindCSS, and Node.js').replace('reducing manual workloads', 'delivering high-converting websites');
    }
    if (type === 'saas') {
        return structure.replace('React, Node.js, and MongoDB', 'React, Node.js, PostgreSQL, and AWS').replace('reducing manual workloads', 'building scalable SaaS architectures with 10k+ active users');
    }
    if (type === 'automation') {
        return structure.replace('React, Node.js, and MongoDB', 'n8n, Zapier, Python, and OpenAI API').replace('reducing manual workloads by over 40%', 'automating 50+ hours of manual work weekly for clients');
    }
    
    return structure;
};

export default function ProposalEdit() {
    const { id } = useParams();
    const isNew = id === 'new';
    const navigate = useNavigate();
    const { success, error: notifyError } = useNotification();
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const [form, setForm] = useState({
        title: '',
        clientName: '',
        clientEmail: '',
        companyName: '',
        phone: '',
        projectSource: 'Direct',
        amount: '',
        currency: 'USD',
        status: 'Draft',
        paymentTerms: 'Milestone-based',
        validUntil: '',
        content: '',
        notes: ''
    });

    useEffect(() => {
        if (!isNew) {
            loadProposal();
        }
    }, [id]);

    const loadProposal = async () => {
        try {
            const data = await ProposalAPI.get(id);
            setForm({
                ...data,
                amount: data.amount || '',
                validUntil: data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : ''
            });
        } catch (err) {
            notifyError('Failed to load proposal details');
            navigate('/admin/proposals');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content) => {
        setForm(prev => ({ ...prev, content }));
    };

    const applyTemplate = (e) => {
        const type = e.target.value;
        if (!type) return;
        if (form.content && !window.confirm('Applying a template will overwrite your current content. Continue?')) {
            e.target.value = '';
            return;
        }
        setForm(prev => ({ ...prev, content: getTemplateContent(type) }));
        e.target.value = ''; // reset dropdown
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                amount: Number(form.amount)
            };

            if (isNew) {
                await ProposalAPI.create(payload);
                success('Proposal created successfully');
                navigate('/admin/proposals');
            } else {
                await ProposalAPI.update(id, payload);
                success('Proposal updated successfully');
            }
        } catch (err) {
            notifyError('Failed to save proposal');
        } finally {
            setSaving(false);
        }
    };

    const handleDuplicate = async () => {
        setSaving(true);
        try {
            const payload = {
                ...form,
                title: `${form.title} (Copy)`,
                status: 'Draft',
                amount: Number(form.amount)
            };
            const created = await ProposalAPI.create(payload);
            success('Proposal duplicated successfully');
            navigate(`/admin/proposals/${created._id}`);
            window.location.reload();
        } catch (err) {
            notifyError('Failed to duplicate proposal');
        } finally {
            setSaving(false);
        }
    };

    const getPDFHtml = () => {
        // Enhance headings to have badges
        const styledContent = form.content
            .replace(/<h2>\s*(\d+)\.\s*(.*?)<\/h2>/g, "<h2><span class='num-badge'>$1</span> <span class='heading-text'>$2</span></h2>")
            .replace(/<strong>/g, "<strong style='color: #0f172a;'>");

        return `
            <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; color: #334155; line-height: 1.8; background: #fff;">
                <!-- Full Width Header -->
                <div style="background: #002747; color: white; padding: 40px 50px; margin: -15px -15px 40px -15px; border-bottom: 4px solid #3b82f6;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                        <img src="${window.location.origin}/Devugo Tech.png" alt="Devugo Tech" style="height: 45px; background: white; padding: 5px; border-radius: 4px;" />
                        <span style="background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 2px;">CONFIDENTIAL PROPOSAL</span>
                    </div>
                    <h1 style="margin: 0 0 10px 0; font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 700; line-height: 1.2;">${form.title || 'Project Proposal'}</h1>
                    <p style="margin: 0; font-size: 16px; color: #94a3b8; font-weight: 400;">Prepared exclusively for ${form.clientName} ${form.companyName ? `(${form.companyName})` : ''}</p>
                </div>

                <div style="padding: 0 35px;">
                    <!-- To / From Section -->
                    <div style="display: flex; justify-content: space-between; margin-top: 10px; margin-bottom: 40px; background: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 15px 0; color: #002747; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 2px solid #3b82f6; display: inline-block; padding-bottom: 5px;">Prepared For (Client)</h3>
                            <p style="margin: 0 0 5px 0; font-size: 18px; font-weight: 700; color: #0f172a;">${form.clientName}</p>
                            ${form.companyName ? `<div style="margin: 0 0 5px 0; color: #475569; font-weight: 500; display: flex; align-items: center; gap: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg> <span>${form.companyName}</span></div>` : ''}
                            ${form.clientEmail ? `<div style="margin: 0 0 5px 0; color: #475569; display: flex; align-items: center; gap: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg> <span>${form.clientEmail}</span></div>` : ''}
                            ${form.phone ? `<div style="margin: 0; color: #475569; display: flex; align-items: center; gap: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg> <span>${form.phone}</span></div>` : ''}
                        </div>
                        <div style="flex: 1; padding-left: 40px; border-left: 1px solid #cbd5e1;">
                            <h3 style="margin: 0 0 15px 0; color: #002747; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; border-bottom: 2px solid #3b82f6; display: inline-block; padding-bottom: 5px;">Prepared By (Provider)</h3>
                            <p style="margin: 0 0 5px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Devugo Tech Solutions</p>
                            <div style="margin: 0 0 5px 0; color: #475569; font-weight: 500; display: flex; align-items: center; gap: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg> <span>Software Development Agency</span></div>
                            <div style="margin: 0 0 5px 0; color: #475569; display: flex; align-items: center; gap: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg> <span>contact@devugotechsolution.store</span></div>
                            <div style="margin: 0; color: #475569; display: flex; align-items: center; gap: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg> <span>www.devugotechsolution.store</span></div>
                        </div>
                    </div>

                    <!-- Content -->
                    <style>
                        .pdf-content { font-size: 14px; }
                        .pdf-content h2 { 
                            font-family: 'Playfair Display', serif; 
                            color: #002747; 
                            font-size: 22px; 
                            margin: 35px 0 15px 0; 
                            border-bottom: 1px solid #e2e8f0; 
                            padding-bottom: 8px;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        }
                        .pdf-content .num-badge {
                            background: #002747;
                            color: #fff;
                            width: 28px;
                            height: 28px;
                            border-radius: 50%;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            font-family: 'Inter', sans-serif;
                            font-size: 14px;
                            font-weight: 600;
                        }
                        .pdf-content p { margin-bottom: 16px; color: #475569; }
                        .pdf-content li { margin-bottom: 8px; color: #475569; }
                        .pdf-content ul, .pdf-content ol { padding-left: 20px; margin-bottom: 20px; }
                        
                        /* Table Styling */
                        .pdf-content table { 
                            width: 100%; 
                            border-collapse: separate; 
                            border-spacing: 0;
                            margin: 25px 0; 
                            border-radius: 8px; 
                            overflow: hidden; 
                            border: 1px solid #e2e8f0;
                        }
                        .pdf-content th { 
                            background-color: #002747; 
                            color: white; 
                            padding: 14px; 
                            text-align: left; 
                            font-weight: 500; 
                        }
                        .pdf-content td { 
                            padding: 14px; 
                            border-bottom: 1px solid #e2e8f0; 
                            color: #334155; 
                        }
                        .pdf-content tr:nth-child(even) td { background-color: #f8fafc; }
                        .pdf-content tr:last-child td { border-bottom: none; }
                    </style>

                    <div class="pdf-content">
                        ${styledContent}
                    </div>

                    <!-- Isolated Pricing Box -->
                    <div style="margin: 50px 0; padding: 30px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background: #3b82f6;"></div>
                        <h3 style="margin: 0 0 5px 0; font-family: 'Playfair Display', serif; color: #002747; font-size: 20px;">Total Investment</h3>
                        <p style="margin: 0 0 20px 0; color: #64748b; font-size: 13px;">Transparent pricing with no hidden fees</p>
                        <div style="font-size: 38px; font-weight: 800; color: #3b82f6; line-height: 1; margin-bottom: 15px;">
                            ${form.currency} ${form.amount?.toLocaleString()}
                        </div>
                        <div style="display: inline-block; background: #f1f5f9; padding: 6px 16px; border-radius: 20px; color: #475569; font-size: 13px; font-weight: 600;">
                            Payment Terms: ${form.paymentTerms}
                        </div>
                        ${(() => {
                            if (form.paymentTerms && /(50)|(split)/i.test(form.paymentTerms)) {
                                const half = (form.amount / 2).toLocaleString();
                                return `
                                    <div style="display: flex; justify-content: center; gap: 40px; margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                                        <div>
                                            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Upfront Deposit</p>
                                            <p style="margin: 5px 0 0 0; color: #002747; font-size: 22px; font-weight: 800;">${form.currency} ${half}</p>
                                        </div>
                                        <div style="width: 1px; background: #e2e8f0;"></div>
                                        <div>
                                            <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Remaining Balance</p>
                                            <p style="margin: 5px 0 0 0; color: #002747; font-size: 22px; font-weight: 800;">${form.currency} ${half}</p>
                                        </div>
                                    </div>
                                `;
                            } else if (form.paymentTerms && form.paymentTerms.toLowerCase().includes('milestone')) {
                                return `
                                    <div style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                                        <p style="margin: 0; color: #0f172a; font-size: 14px; font-weight: 600;">Payments will be divided into specific project milestones.</p>
                                    </div>
                                `;
                            }
                            return '';
                        })()}
                    </div>

                    <!-- Signatures -->
                    <div style="margin-top: 60px; padding-top: 40px; padding-bottom: 20px; page-break-inside: avoid;">
                        <div style="display: flex; justify-content: space-between;">
                            <div style="width: 45%;">
                                <div style="height: 60px; border-bottom: 1px solid #cbd5e1; margin-bottom: 10px;"></div>
                                <p style="margin: 0 0 4px 0; color: #0f172a; font-weight: 700; font-size: 15px;">${form.clientName}</p>
                                <p style="margin: 0; color: #64748b; font-size: 12px;">Client Signature & Date</p>
                            </div>
                            <div style="width: 45%; position: relative;">
                                <div style="position: absolute; top: -20px; right: 0; border: 2px solid #10b981; color: #10b981; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: bold; transform: rotate(-5deg); opacity: 0.8;">ACCEPTED & APPROVED</div>
                                <div style="height: 60px; border-bottom: 1px solid #cbd5e1; margin-bottom: 10px;"></div>
                                <p style="margin: 0 0 4px 0; color: #0f172a; font-weight: 700; font-size: 15px;">Devugo Tech Solutions</p>
                                <p style="margin: 0; color: #64748b; font-size: 12px;">Authorized Signature & Date</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const handleExportPDF = () => {
        const element = document.createElement('div');
        // Inject Google Fonts
        element.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
            </style>
            ${getPDFHtml()}
        `;

        const opt = {
            margin: [15, 0, 20, 0], // Top, Left, Bottom, Right
            filename: `${form.title || 'Proposal'} - ${form.clientName}.pdf`,
            image: { type: 'jpeg', quality: 1.0 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(9);
                pdf.setTextColor(150, 163, 184); // #94a3b8
                
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                // Footer Line
                pdf.setDrawColor(226, 232, 240); // #e2e8f0
                pdf.setLineWidth(0.5);
                pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

                // Footer Text
                pdf.text('Devugo Tech Solutions | devugotechsolution.store', 15, pageHeight - 10);
                pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2 - 10, pageHeight - 10);
                pdf.text(`Confidential — Prepared for ${form.clientName}`, pageWidth - 70, pageHeight - 10);
            }
        }).save();
    };

    const handleExportWord = () => {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Proposal</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + getPDFHtml() + footer;
        
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `${form.title || 'Proposal'}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image'],
            ['clean']
        ]
    };

    if (loading) return <div className="admin-layout min-h-screen bg-[#002747] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>;

    return (
        <div className="admin-layout min-h-screen bg-[#002747] text-white flex">
            <AdminSidebar />
            <main className="admin-content w-full flex-1 flex flex-col h-screen overflow-hidden">
                <AdminTopbar />

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => previewMode ? setPreviewMode(false) : navigate('/admin/proposals')} 
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold">{isNew ? 'Create Proposal' : 'Edit Proposal'}</h1>
                                <p className="text-gray-400 text-sm">{isNew ? 'Draft a new proposal for your client' : form.title}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button 
                                type="button" 
                                onClick={() => setPreviewMode(!previewMode)}
                                className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                                <Eye size={18} />
                                {previewMode ? 'Edit Mode' : 'Preview'}
                            </button>
                            
                            {!isNew && (
                                <>
                                    <button 
                                        type="button" 
                                        onClick={handleDuplicate}
                                        className="bg-gray-600/30 text-gray-300 hover:bg-gray-600/50 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Copy size={18} />
                                        Duplicate
                                    </button>
                                    {form.clientEmail && (
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                success("Email Sent! (Mock Feature - Needs SMTP Integration)");
                                            }}
                                            className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Mail size={18} />
                                            Send Email
                                        </button>
                                    )}
                                </>
                            )}
                            
                            <button 
                                type="button" 
                                onClick={handleExportPDF}
                                className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                                <Download size={18} />
                                PDF
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={handleExportWord}
                                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                                <FileText size={18} />
                                Word
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Proposal'}
                            </button>
                        </div>
                    </div>

                    {previewMode ? (
                        <div className="max-w-4xl mx-auto bg-white text-black rounded-xl p-10 shadow-2xl overflow-y-auto mb-20">
                            <div dangerouslySetInnerHTML={{ __html: getPDFHtml() }} />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-20">
                            {/* Editor Section */}
                            <div className="xl:col-span-2 space-y-6">
                                <div className="bg-[#003560] rounded-2xl border border-white/5 p-6 shadow-xl shadow-black/10">
                                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <FileText size={18} className="text-blue-400" />
                                            Proposal Document
                                        </h2>
                                        <select 
                                            onChange={applyTemplate}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [&>option]:bg-[#003560]"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Load a Template...</option>
                                            <option value="web">Web Dev Proposal</option>
                                            <option value="saas">SaaS Development Proposal</option>
                                            <option value="automation">Automation Proposal</option>
                                        </select>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <input
                                            type="text"
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            placeholder="Project Title (e.g. Website Redesign Proposal)"
                                            className="w-full bg-transparent border-none text-2xl font-bold placeholder-gray-500 focus:ring-0 px-0"
                                            required
                                        />
                                    </div>

                                    <div className="text-black bg-white rounded-xl overflow-hidden min-h-[600px]">
                                        <style>{`
                                            .custom-quill .ql-editor { color: #000 !important; font-size: 15px; }
                                            .custom-quill .ql-editor p, 
                                            .custom-quill .ql-editor h1, 
                                            .custom-quill .ql-editor h2, 
                                            .custom-quill .ql-editor h3, 
                                            .custom-quill .ql-editor h4, 
                                            .custom-quill .ql-editor h5, 
                                            .custom-quill .ql-editor h6, 
                                            .custom-quill .ql-editor span, 
                                            .custom-quill .ql-editor li,
                                            .custom-quill .ql-editor strong,
                                            .custom-quill .ql-editor em {
                                                color: #000 !important;
                                            }
                                            .custom-quill .ql-editor.ql-blank::before { color: #6b7280 !important; font-style: normal; }
                                        `}</style>
                                        <ReactQuill 
                                            theme="snow" 
                                            value={form.content} 
                                            onChange={handleContentChange}
                                            modules={modules}
                                            className="h-[550px] custom-quill"
                                            placeholder="Write your proposal here or load a template..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Settings Section */}
                            <div className="space-y-6">
                                <div className="bg-[#003560] rounded-2xl border border-white/5 p-6 shadow-xl shadow-black/10">
                                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                                        <User size={18} className="text-blue-400" />
                                        Client Details
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Client Name *</label>
                                            <input
                                                type="text"
                                                name="clientName"
                                                value={form.clientName}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Company Name</label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={form.companyName || ''}
                                                onChange={handleChange}
                                                placeholder="e.g. Acme Corp"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Client Email</label>
                                                <input
                                                    type="email"
                                                    name="clientEmail"
                                                    value={form.clientEmail}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone / WA</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={form.phone || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Project Source</label>
                                            <select
                                                name="projectSource"
                                                value={form.projectSource}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [&>option]:bg-[#003560]"
                                            >
                                                <option value="Direct">Direct / Referrals</option>
                                                <option value="Upwork">Upwork</option>
                                                <option value="LinkedIn">LinkedIn</option>
                                                <option value="Fiverr">Fiverr</option>
                                                <option value="Website">Website Leads</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#003560] rounded-2xl border border-white/5 p-6 shadow-xl shadow-black/10">
                                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                                        <DollarSign size={18} className="text-emerald-400" />
                                        Financials & Status
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-1">
                                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Currency</label>
                                                <select
                                                    name="currency"
                                                    value={form.currency}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [&>option]:bg-[#003560]"
                                                >
                                                    <option value="USD">USD ($)</option>
                                                    <option value="EUR">EUR (€)</option>
                                                    <option value="GBP">GBP (£)</option>
                                                    <option value="PKR">PKR (₨)</option>
                                                    <option value="INR">INR (₹)</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amount *</label>
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    value={form.amount}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment Terms</label>
                                            <select
                                                name="paymentTerms"
                                                value={form.paymentTerms}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [&>option]:bg-[#003560]"
                                            >
                                                <option value="Full Upfront">Full Upfront (100%)</option>
                                                <option value="50-50 Split">50/50 Split (Start & Completion)</option>
                                                <option value="Milestone-based">Milestone-based (e.g. 30/40/30)</option>
                                                <option value="Hourly">Hourly / Retainer</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                                            <select
                                                name="status"
                                                value={form.status}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [&>option]:bg-[#003560]"
                                            >
                                                <option value="Draft">Draft</option>
                                                <option value="Sent">Sent</option>
                                                <option value="Accepted">Accepted</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Calendar size={14}/> Valid Until</label>
                                            <input
                                                type="date"
                                                name="validUntil"
                                                value={form.validUntil}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
