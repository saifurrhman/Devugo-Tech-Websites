import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Download, Save, Send, Plus, Trash2, Link as LinkIcon, Edit2, Calendar, Eye, EyeOff, FilePlus, RefreshCw } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { InvoiceAPI, ContactAPI } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';
import logo from '../../../assets/Devugo Tech.png';

export default function CreateInvoice() {
    const navigate = useNavigate();
    const { success, error, warning } = useNotification();
    const [loading, setLoading] = useState(false);
    const [existingContacts, setExistingContacts] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const invoiceRef = useRef(null);

    const [formData, setFormData] = useState({
        senderName: 'Devugo Tech Solutions',
        senderEmail: 'contact@devugo.tech',
        senderPhone: '+44 7542 958272',
        senderAddress: '123 Tech Street, London, UK',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        currency: 'USD',
        notes: '',
        paymentLink: '', // Added paymentLink field
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadContacts = async () => {
            try {
                const res = await ContactAPI.list();
                setExistingContacts(res.data || res || []);
            } catch (err) {
                console.error('Failed to load contacts', err);
            }
        };
        loadContacts();
    }, []);

    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = 0.10;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'quantity' || field === 'rate') {
            newItems[index].amount = (parseFloat(newItems[index].quantity) || 0) * (parseFloat(newItems[index].rate) || 0);
        }

        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData({
                ...formData,
                items: formData.items.filter((_, i) => i !== index)
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        setLoading(true);
        try {
            // Create container for PDF
            // We render this VISIBLY but obscured to ensure html2canvas captures it.
            const pdfContainer = document.createElement('div');
            pdfContainer.style.position = 'fixed';
            pdfContainer.style.top = '0';
            pdfContainer.style.left = '-10000px'; // Move off-screen to hide from user
            pdfContainer.style.width = '100vw';
            pdfContainer.style.height = '100vh';
            pdfContainer.style.zIndex = '-1'; // Lower z-index
            pdfContainer.style.backgroundColor = '#ffffff';
            pdfContainer.style.display = 'flex';
            pdfContainer.style.justifyContent = 'center';
            pdfContainer.style.alignItems = 'flex-start';
            pdfContainer.style.overflow = 'auto';
            pdfContainer.style.padding = '20px';
            document.body.appendChild(pdfContainer);

            // The actual A4 page container
            const page = document.createElement('div');
            page.style.width = '210mm';
            page.style.minHeight = '296mm'; // Slightly less than 297 to prevent overflow
            page.style.backgroundColor = 'white';
            page.style.padding = '15mm'; // Reduced padding
            page.style.boxShadow = '0 0 20px rgba(0,0,0,0.3)';
            pdfContainer.appendChild(page);

            // Invoice HTML
            page.innerHTML = `
                <div style="font-family: Arial, sans-serif; color: #000; box-sizing: border-box;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 4px solid #4a5568;">
                        <div style="flex: 1;">
                            <img src="${logo}" style="height: 150px; width: auto; margin-bottom: 15px; display: block;" crossorigin="anonymous" />
                            <div style="font-size: 10pt; color: #4a5568; line-height: 1.5;">
                                <div style="font-weight: bold; color: #2d3748; font-size: 12pt;">${formData.senderName}</div>
                                <div>${formData.senderAddress || ''}</div>
                                <div><a href="mailto:${formData.senderEmail}" style="color: #4a5568; text-decoration: none;">${formData.senderEmail || ''}</a></div>
                                <div><a href="tel:${formData.senderPhone}" style="color: #4a5568; text-decoration: none;">${formData.senderPhone || ''}</a></div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 16pt; color: #2d3748; font-weight: bold; margin-bottom: 5px;">INVOICE</div>
                            <div style="font-size: 11pt; color: #4a5568; font-weight: bold; margin-bottom: 5px;"># ${formData.invoiceNumber}</div>
                            <div style="font-size: 9pt; color: #4a5568; margin-bottom: 3px;">
                                <span style="display: inline-block; margin-right: 8px;">Date:</span>
                                <span>${new Date(formData.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Bill To, Details, Payment -->
                    <div style="display: flex; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
                        <div style="flex: 1;">
                            <div style="font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1a202c; margin-bottom: 8px;">BILL TO</div>
                            <div style="font-size: 9pt; color: #4a5568; line-height: 1.6;">
                                <div style="font-weight: 600; color: #2d3748;">${formData.clientName}</div>
                                <div><a href="mailto:${formData.clientEmail}" style="color: #4a5568; text-decoration: none;">${formData.clientEmail}</a></div>
                                <div><a href="tel:${formData.clientPhone}" style="color: #4a5568; text-decoration: none;">${formData.clientPhone}</a></div>
                                <div>${formData.clientAddress || ''}</div>
                            </div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1a202c; margin-bottom: 8px;">DETAILS</div>
                            <div style="font-size: 9pt; color: #4a5568; line-height: 1.6;">
                                ${formData.notes || 'No additional notes'}
                            </div>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1a202c; margin-bottom: 8px;">PAYMENT</div>
                            <div style="font-size: 9pt; color: #4a5568; line-height: 1.6;">
                                <div>Due date: ${formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '-'}</div>
                                <div style="font-weight: bold; font-size: 11pt; margin-top: 5px; color: #2d3748;">${currencySymbols[formData.currency]}${total.toFixed(2)}</div>
                                ${formData.paymentLink ? `
                                    <div style="margin-top: 8px;">
                                        <div style="font-size: 7pt; font-weight: bold; margin-bottom: 1px;">PAYMENT LINK:</div>
                                        <a href="${formData.paymentLink}" style="color: #3182ce; text-decoration: none; word-break: break-all; font-size: 8pt;">${formData.paymentLink}</a>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                        <thead>
                            <tr style="border-bottom: 2px solid #e2e8f0;">
                                <th style="text-align: left; padding: 8px; font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #1a202c;">ITEM</th>
                                <th style="text-align: center; padding: 8px; font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #1a202c; width: 60px;">QTY</th>
                                <th style="text-align: right; padding: 8px; font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #1a202c; width: 90px;">PRICE</th>
                                <th style="text-align: right; padding: 8px; font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #1a202c; width: 90px;">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${formData.items.map((item) => `
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 10px 8px;">
                                        <div style="font-size: 9pt; color: #1a202c; font-weight: 500;">${item.description}</div>
                                    </td>
                                    <td style="text-align: center; padding: 10px 8px; font-size: 9pt; color: #4a5568;">${item.quantity}</td>
                                    <td style="text-align: right; padding: 10px 8px; font-size: 9pt; color: #4a5568;">${currencySymbols[formData.currency]}${parseFloat(item.rate).toFixed(2)}</td>
                                    <td style="text-align: right; padding: 10px 8px; font-size: 9pt; color: #1a202c; font-weight: 600;">${currencySymbols[formData.currency]}${parseFloat(item.amount).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <!-- Totals -->
                    <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
                        <div style="width: 250px;">
                            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 9pt; color: #4a5568; border-bottom: 1px solid #e2e8f0;">
                                <span>Subtotal</span>
                                <span>${currencySymbols[formData.currency]}${subtotal.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 9pt; color: #4a5568; border-bottom: 2px solid #1a202c; margin-bottom: 8px;">
                                <span>Tax (10%)</span>
                                <span>${currencySymbols[formData.currency]}${tax.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 12pt; font-weight: bold; color: #1a202c;">
                                <span>Total Due</span>
                                <span>${currencySymbols[formData.currency]}${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Thank You Footer -->
                    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        <div style="font-size: 10pt; font-weight: bold; color: #2d3748;">Thank you for your business!</div>
                        <div style="font-size: 8pt; color: #718096; margin-top: 5px;">If you have any questions about this invoice, please contact us.</div>
                    </div>

                    <!-- Page Number (Optional) -->
                    <div style="text-align: right; margin-top: 20px; font-size: 8pt; color: #718096;">Page 1</div>
                </div>
            `;

            // Wait for images
            const images = page.querySelectorAll('img');
            await Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            }));

            await new Promise(resolve => setTimeout(resolve, 800));

            const opt = {
                margin: 0,
                filename: `${formData.invoiceNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };
            await html2pdf().set(opt).from(page).save();
            document.body.removeChild(pdfContainer);

        } catch (err) {
            console.error('PDF generation failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.clientName) newErrors.clientName = 'Client Name is required';
        if (!formData.clientEmail) newErrors.clientEmail = 'Client Email is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due Date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (status, createNew = false) => {
        if (!validateForm()) {
            warning('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            let clientId;
            const existingClient = existingContacts.find(c => c.email.toLowerCase() === formData.clientEmail.toLowerCase());

            if (existingClient) {
                clientId = existingClient._id;
            } else {
                const newContact = await ContactAPI.create({
                    email: formData.clientEmail,
                    firstName: formData.clientName.split(' ')[0],
                    lastName: formData.clientName.split(' ').slice(1).join(' ') || 'Client',
                    phone: formData.clientPhone,
                    address: formData.clientAddress,
                    status: 'active'
                });
                clientId = newContact.data?._id || newContact._id;
            }

            if (!clientId) throw new Error('Failed to identify client');

            let finalStatus = status;
            if (status === 'sent') {
                finalStatus = formData.status === 'paid' ? 'paid' : 'sent';
            }

            const payload = {
                invoiceNumber: formData.invoiceNumber,
                client: clientId,
                clientDetails: {
                    name: formData.clientName,
                    email: formData.clientEmail,
                    phone: formData.clientPhone,
                    address: formData.clientAddress
                },
                senderDetails: {
                    name: formData.senderName,
                    email: formData.senderEmail,
                    phone: formData.senderPhone,
                    address: formData.senderAddress
                },
                issueDate: formData.date,
                dueDate: formData.dueDate,
                currency: formData.currency,
                items: formData.items.map(item => ({
                    description: item.description,
                    quantity: parseFloat(item.quantity),
                    unitPrice: parseFloat(item.rate),
                    amount: parseFloat(item.amount)
                })),
                subtotal,
                taxAmount: tax,
                total,
                status: finalStatus,
                notes: formData.notes,
                paymentLink: formData.paymentLink
            };

            await InvoiceAPI.create(payload);
            success(`Invoice ${finalStatus === 'sent' ? 'sent' : 'saved'} successfully`);

            if (createNew) {
                setFormData(prev => ({
                    ...prev,
                    clientName: '',
                    clientEmail: '',
                    clientPhone: '',
                    clientAddress: '',
                    invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
                    status: 'pending',
                    dueDate: '',
                    paymentLink: '',
                    notes: '',
                    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
                }));
                window.scrollTo(0, 0);
            } else {
                navigate('/admin/invoices');
            }
        } catch (err) {
            console.error('Failed to create invoice:', err);
            error(err.message || 'Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-layout min-h-screen bg-[#002747] text-white print:bg-white print:text-black">
            <style>{`
                @media print {
                    @page { margin: 0; }
                    body { margin: 0; padding: 0; background: white !important; }
                    .no-print { display: none !important; }
                    .admin-sidebar, .admin-topbar { display: none !important; }
                    .admin-content { padding: 0 !important; margin: 0 !important; width: 100% !important; }
                    .card { border: none !important; background: white !important; padding: 1cm !important; box-shadow: none !important; }
                    input, textarea, select { border: none !important; background: transparent !important; padding: 0 !important; color: black !important; }
                    * { color: black !important; }
                }
            `}</style>

            <div className="no-print">
                <AdminSidebar />
            </div>

            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="no-print mb-6">
                    <AdminTopbar />
                </div>

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print top-controls">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            New Invoice
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Create and send professional invoices</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium border ${previewMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
                        >
                            {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                            <span>{previewMode ? 'Edit Mode' : 'Preview'}</span>
                        </button>

                        {!previewMode && (
                            <>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 text-sm font-medium border border-gray-700"
                                >
                                    <Download size={16} />
                                    <span>PDF</span>
                                </button>

                                <button
                                    onClick={() => handleSubmit('draft', true)}
                                    disabled={loading}
                                    className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 text-sm font-medium border border-gray-700 disabled:opacity-50"
                                >
                                    <FilePlus size={16} />
                                    <span>Save & New</span>
                                </button>

                                <button
                                    onClick={() => handleSubmit('draft')}
                                    disabled={loading}
                                    className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 text-sm font-medium border border-gray-700 disabled:opacity-50"
                                >
                                    <Save size={16} />
                                    <span>Save Draft</span>
                                </button>

                                <button
                                    onClick={() => handleSubmit('sent')}
                                    disabled={loading}
                                    className="flex-1 md:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all duration-200 font-medium shadow-lg shadow-blue-500/20"
                                >
                                    <Send size={16} />
                                    <span>{loading ? 'Sending...' : 'Send Invoice'}</span>
                                </button>
                            </>
                        )}

                        {previewMode && (
                            <button
                                onClick={() => setPreviewMode(false)}
                                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-all duration-200 font-medium shadow-lg"
                            >
                                <Edit2 size={16} />
                                <span>Continue Editing</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Invoice */}
                    <div className="lg:col-span-2">
                        <div ref={invoiceRef} className="bg-[rgba(255,255,255,0.06)] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                            <div className="p-8 lg:p-10">
                                {/* Header Section */}
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12 border-b border-gray-800/50 pb-8">
                                    <div className="flex-1">
                                        <img src={logo} alt="Logo" className="h-32 object-contain" />
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-3xl font-bold text-gray-500 mb-4">INVOICE</h2>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-end gap-3">
                                                <span className="text-gray-500">Invoice #</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-semibold text-white">{formData.invoiceNumber}</span>
                                                    {!previewMode && (
                                                        <button
                                                            onClick={() => setFormData({ ...formData, invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000) })}
                                                            className="text-blue-400 hover:text-blue-300 transition-colors p-1 no-print"
                                                            title="Generate New Invoice Number"
                                                        >
                                                            <RefreshCw size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-end gap-3">
                                                <span className="text-gray-500">Date</span>
                                                <span className="font-medium text-white">{formData.date}</span>
                                            </div>
                                            {/* Status moved here */}
                                            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-end gap-2 pt-2">
                                                <span className="text-gray-500 text-sm whitespace-nowrap">Payment Link</span>
                                                {previewMode ? (
                                                    <span className="text-white text-sm break-all text-right">{formData.paymentLink || '-'}</span>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={formData.paymentLink || ''}
                                                        onChange={e => setFormData({ ...formData, paymentLink: e.target.value })}
                                                        placeholder="https://"
                                                        className="bg-[rgba(255,255,255,0.08)] border border-white/10 rounded px-3 py-2 text-white placeholder-gray-500 text-sm w-full sm:w-64 outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex items-center justify-end gap-3 pt-2">
                                                <span className="text-gray-500">Status</span>
                                                {previewMode ? (
                                                    <span className={`px-3 py-0.5 rounded text-xs font-bold uppercase ${formData.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {formData.status}
                                                    </span>
                                                ) : (
                                                    <select
                                                        value={formData.status}
                                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                        className={`rounded px-2 py-0.5 text-xs font-bold uppercase cursor-pointer outline-none border ${formData.status === 'paid'
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                                            }`}
                                                    >
                                                        <option value="pending" className="bg-[#002747]">Unpaid</option>
                                                        <option value="paid" className="bg-[#002747]">Paid</option>
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Addresses Grid: Bill From (Left) | Bill To (Right) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-8 border-b border-gray-800/50">
                                    {/* BILL FROM */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">Bill From</label>
                                        <div className="space-y-3">
                                            {previewMode ? (
                                                <div className="text-sm space-y-1">
                                                    <div className="text-white font-semibold text-base">{formData.senderName}</div>
                                                    <div className="text-gray-300">{formData.senderEmail}</div>
                                                    <div className="text-gray-300">{formData.senderPhone}</div>
                                                    <div className="text-gray-300 whitespace-pre-line mt-2">{formData.senderAddress}</div>
                                                </div>
                                            ) : (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={formData.senderName}
                                                        onChange={e => setFormData({ ...formData, senderName: e.target.value })}
                                                        className="w-full bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors"
                                                        placeholder="Company Name"
                                                    />
                                                    <input
                                                        type="email"
                                                        value={formData.senderEmail}
                                                        onChange={e => setFormData({ ...formData, senderEmail: e.target.value })}
                                                        className="w-full bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors text-sm"
                                                        placeholder="Email Address"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={formData.senderPhone}
                                                        onChange={e => setFormData({ ...formData, senderPhone: e.target.value })}
                                                        className="w-full bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors text-sm"
                                                        placeholder="Phone Number"
                                                    />
                                                    <textarea
                                                        value={formData.senderAddress}
                                                        onChange={e => setFormData({ ...formData, senderAddress: e.target.value })}
                                                        className="w-full bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors text-sm resize-none"
                                                        placeholder="Street Address, City, Country"
                                                        rows="2"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* BILL TO */}
                                    <div className="md:text-right">
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">Bill To</label>
                                        <div className="space-y-3 flex flex-col md:items-end">
                                            {previewMode ? (
                                                <div className="text-sm space-y-1">
                                                    <div className="text-white font-semibold text-lg">{formData.clientName || 'Client Name'}</div>
                                                    <div className="text-gray-300">{formData.clientEmail || 'client@email.com'}</div>
                                                    <div className="text-gray-300">{formData.clientPhone}</div>
                                                    <div className="text-gray-300 whitespace-pre-line mt-2">{formData.clientAddress}</div>
                                                </div>
                                            ) : (
                                                <>
                                                    <input
                                                        type="text"
                                                        placeholder="Client Name"
                                                        value={formData.clientName}
                                                        onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                                        className="w-full md:text-right bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors"
                                                    />
                                                    <input
                                                        type="email"
                                                        placeholder="client@email.com"
                                                        value={formData.clientEmail}
                                                        onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                                                        className="w-full md:text-right bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Client Phone"
                                                        value={formData.clientPhone}
                                                        onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                                                        className="w-full md:text-right bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors text-sm"
                                                    />
                                                    <textarea
                                                        value={formData.clientAddress}
                                                        onChange={e => setFormData({ ...formData, clientAddress: e.target.value })}
                                                        className="w-full md:text-right bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-colors text-sm resize-none"
                                                        placeholder="Client Address"
                                                        rows="2"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Line Items */}
                                <div className="mb-10">
                                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                                        <div className="inline-block min-w-full align-middle">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr className="border-b-2 border-gray-800">
                                                        <th className="py-4 px-3 text-left text-xs uppercase tracking-wider text-gray-500 font-semibold">Description</th>
                                                        <th className="py-4 px-3 text-center text-xs uppercase tracking-wider text-gray-500 font-semibold w-24">Qty</th>
                                                        <th className="py-4 px-3 text-right text-xs uppercase tracking-wider text-gray-500 font-semibold w-32">Rate</th>
                                                        <th className="py-4 px-3 text-right text-xs uppercase tracking-wider text-gray-500 font-semibold w-32">Amount</th>
                                                        {!previewMode && <th className="py-4 px-3 w-10 no-print"></th>}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-800/30">
                                                    {formData.items.map((item, index) => (
                                                        <tr key={index} className="hover:bg-gray-800/20 transition-colors">
                                                            <td className="py-3 px-3">
                                                                {previewMode ? (
                                                                    <div className="text-white px-2 py-2">{item.description}</div>
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Item description"
                                                                        value={item.description}
                                                                        onChange={e => handleItemChange(index, 'description', e.target.value)}
                                                                        className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 px-2 py-2 text-white placeholder-gray-600 outline-none transition-colors"
                                                                    />
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                {previewMode ? (
                                                                    <div className="text-white text-center px-2 py-2">{item.quantity}</div>
                                                                ) : (
                                                                    <input
                                                                        type="number"
                                                                        value={item.quantity}
                                                                        onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                                        className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 px-2 py-2 text-center text-white outline-none"
                                                                    />
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-3">
                                                                {previewMode ? (
                                                                    <div className="text-white text-right px-2 py-2">{item.rate}</div>
                                                                ) : (
                                                                    <input
                                                                        type="number"
                                                                        value={item.rate}
                                                                        onChange={e => handleItemChange(index, 'rate', e.target.value)}
                                                                        className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 px-2 py-2 text-right text-white outline-none"
                                                                    />
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-3 text-right font-semibold text-white">
                                                                {currencySymbols[formData.currency]}{item.amount.toFixed(2)}
                                                            </td>
                                                            {!previewMode && (
                                                                <td className="py-3 px-3 text-center no-print">
                                                                    <button
                                                                        onClick={() => removeItem(index)}
                                                                        className="text-gray-600 hover:text-red-500 transition-colors p-1"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    {!previewMode && (
                                        <button
                                            onClick={addItem}
                                            className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors no-print"
                                        >
                                            <Plus size={18} /> Add Line Item
                                        </button>
                                    )}
                                </div>

                                {/* Summary & Notes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-800/50">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Notes / Terms</label>
                                        {previewMode ? (
                                            <div className="text-gray-300 text-sm whitespace-pre-wrap">{formData.notes}</div>
                                        ) : (
                                            <textarea
                                                value={formData.notes}
                                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                                className="w-full bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg p-4 text-sm outline-none focus:border-blue-500 resize-none h-28"
                                                placeholder="Payment is due within 15 days. Thank you for your business."
                                            ></textarea>
                                        )}
                                    </div>
                                    <div>
                                        <div className="space-y-3 bg-[rgba(255,255,255,0.08)] rounded-xl p-6 border border-white/10">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Subtotal</span>
                                                <span className="font-medium">{currencySymbols[formData.currency]}{subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Tax (10%)</span>
                                                <span className="font-medium">{currencySymbols[formData.currency]}{tax.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-2xl font-bold border-t border-gray-700 pt-4 mt-2">
                                                <span>Total</span>
                                                <span className="text-blue-400">{currencySymbols[formData.currency]}{total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className={`space-y-5 no-print ${previewMode ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="bg-[rgba(255,255,255,0.06)] rounded-2xl border border-white/10 p-6">
                            <h3 className="font-semibold mb-5 text-white flex items-center gap-2">
                                <Calendar size={18} className="text-blue-400" />
                                Invoice Settings
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Invoice Number</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.invoiceNumber}
                                            onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                            className="flex-1 bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 font-mono"
                                            placeholder="INV-1234"
                                        />
                                        <button
                                            onClick={() => setFormData({ ...formData, invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000) })}
                                            className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors flex items-center gap-2"
                                            title="Generate New"
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Click refresh to generate new number</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Due Date *</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        className={`w-full bg-[rgba(255,255,255,0.08)] border ${errors.dueDate ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500`}
                                    />
                                    {errors.dueDate && <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2 font-medium">Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 cursor-pointer"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[rgba(255,255,255,0.06)] rounded-2xl border border-white/10 p-6">
                            <h3 className="font-semibold mb-5 text-white flex items-center gap-2">
                                <LinkIcon size={18} className="text-blue-400" />
                                Payment Info
                            </h3>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2 font-medium">Payment Link</label>
                                <input
                                    type="url"
                                    placeholder="https://paypal.me/..."
                                    value={formData.paymentLink}
                                    onChange={e => setFormData({ ...formData, paymentLink: e.target.value })}
                                    className="w-full bg-[rgba(255,255,255,0.08)] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 placeholder-gray-600"
                                />
                                <p className="text-xs text-gray-500 mt-2">Direct payment link for clients</p>
                            </div>
                        </div>

                        {/* Quick Summary Card */}
                        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl border border-blue-500/20 p-6">
                            <h3 className="font-semibold mb-4 text-white">Quick Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Items</span>
                                    <span className="font-medium">{formData.items.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="font-medium">{currencySymbols[formData.currency]}{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-gray-700">
                                    <span className="text-white font-semibold">Total Due</span>
                                    <span className="font-bold text-blue-400 text-lg">{currencySymbols[formData.currency]}{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}