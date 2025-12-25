import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Download, Save, Send, Plus, Trash2, Link as LinkIcon, Edit2 } from 'lucide-react';
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
    const invoiceRef = useRef(null);

    const [formData, setFormData] = useState({
        // Sender Details (Bill From)
        senderName: 'Devugo Tech Solutions',
        senderEmail: 'contact@devugo.tech',
        senderPhone: '+44 7542 958272',

        // Client Details (Bill To)
        clientName: '',
        clientEmail: '',

        invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        currency: 'USD',
        notes: '',
        paymentLink: '',
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
    });

    const [errors, setErrors] = useState({});
    const [isEditingSender, setIsEditingSender] = useState(false);

    // Load contacts for auto-matching
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

    // Calculate totals
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = 0.10; // 10%
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

    const handleDownloadPDF = () => {
        const element = invoiceRef.current;
        const opt = {
            margin: 0,
            filename: `${formData.invoiceNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Clone element to modify for PDF generation (force white bg, black text)
        const clone = element.cloneNode(true);
        clone.style.padding = '40px';
        clone.style.backgroundColor = 'white';
        clone.style.color = 'black';
        const inputs = clone.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Replace inputs with spans for clean PDF
            const span = document.createElement('span');
            span.innerText = input.value;
            // Copy styles
            span.className = input.className;
            span.style.color = 'black';
            input.parentNode.replaceChild(span, input);
        });

        // Remove edit/delete buttons
        const buttons = clone.querySelectorAll('button');
        buttons.forEach(btn => btn.remove());

        html2pdf().set(opt).from(clone).save();
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.clientName) newErrors.clientName = 'Client Name is required';
        if (!formData.clientEmail) newErrors.clientEmail = 'Client Email is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due Date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (status) => {
        if (!validateForm()) {
            const missing = Object.keys(errors).join(', ');
            warning(`Please fill in required fields: ${missing}`);
            return;
        }

        setLoading(true);
        try {
            // 1. Find or Create Client
            let clientId;
            const existingClient = existingContacts.find(c => c.email.toLowerCase() === formData.clientEmail.toLowerCase());

            if (existingClient) {
                clientId = existingClient._id;
            } else {
                // Create new contact
                const newContact = await ContactAPI.create({
                    email: formData.clientEmail,
                    firstName: formData.clientName.split(' ')[0],
                    lastName: formData.clientName.split(' ').slice(1).join(' ') || 'Client',
                    status: 'active'
                });
                clientId = newContact.data?._id || newContact._id;
            }

            if (!clientId) throw new Error('Failed to identify client');

            // Determine final status
            let finalStatus = status;
            if (status === 'sent') {
                finalStatus = formData.status === 'paid' ? 'paid' : 'sent';
            }

            // 2. Prepare Payload
            const payload = {
                invoiceNumber: formData.invoiceNumber,
                client: clientId, // Required ObjectId
                clientDetails: {
                    name: formData.clientName,
                    email: formData.clientEmail
                },
                senderDetails: {
                    name: formData.senderName,
                    email: formData.senderEmail,
                    phone: formData.senderPhone
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
            navigate('/admin/invoices');
        } catch (err) {
            console.error('Failed to create invoice:', err);
            error(err.message || 'Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white print:bg-white print:text-black">
            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0; }
                    body { margin: 0; padding: 0; background: white !important; -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .admin-sidebar, .admin-topbar { display: none !important; }
                    .admin-content { padding: 0 !important; margin: 0 !important; width: 100% !important; }
                    .card { 
                        border: none !important; 
                        background: white !important; 
                        padding: 1cm !important; 
                        box-shadow: none !important;
                        width: 100%;
                        height: 100%;
                    }
                    input, textarea, select { 
                        border: none !important; 
                        background: transparent !important; 
                        padding: 0 !important;
                        color: black !important;
                        resize: none !important;
                    }
                    /* Force black text */
                    * { color: black !important; border-color: #ddd !important; }
                    .print\\:text-blue-600 { color: #2563eb !important; }
                    .print\\:bg-gray-100 { background-color: #f3f4f6 !important; }
                    
                    /* Hide placeholders when printing */
                    ::-webkit-input-placeholder { color: transparent; }
                }
            `}</style>

            <div className="no-print">
                <AdminSidebar />
            </div>

            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="no-print">
                    <AdminTopbar />
                </div>

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 no-print">
                    <div>
                        <h1 className="text-2xl font-bold">New Invoice</h1>
                        <p className="text-gray-400 text-sm mt-1">Create and manage your invoices</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {/* Download PDF Button */}
                        <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                            <Download size={18} />
                            <span>Download PDF</span>
                        </button>

                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
                            <Printer size={18} />
                            <span>Print</span>
                        </button>

                        <button onClick={() => handleSubmit('draft')} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
                            <Save size={18} />
                            <span>Save Draft</span>
                        </button>
                        <button onClick={() => handleSubmit('sent')} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-medium">
                            <Send size={18} />
                            <span>{loading ? 'Sending...' : 'Send Invoice'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Invoice Form - Ref is attached here for PDF generation */}
                    <div className="lg:col-span-2">
                        <div ref={invoiceRef} className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6 print:p-0">
                            {/* Invoice Header */}
                            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-6">
                                <div className="relative group">
                                    <img src={logo} alt="Company Logo" className="h-24 mb-4 object-contain" />

                                    {/* Editable Sender Details (Bill From) */}
                                    <div className="space-y-1 text-sm text-gray-400 print:text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={formData.senderName}
                                                onChange={e => setFormData({ ...formData, senderName: e.target.value })}
                                                className="bg-transparent border-none p-0 font-medium text-white print:text-black focus:ring-0 w-full"
                                                placeholder="Company Name"
                                            />
                                            <Edit2 size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity no-print" />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.senderEmail}
                                            onChange={e => setFormData({ ...formData, senderEmail: e.target.value })}
                                            className="bg-transparent border-none p-0 w-full"
                                            placeholder="Email"
                                        />
                                        <input
                                            type="text"
                                            value={formData.senderPhone}
                                            onChange={e => setFormData({ ...formData, senderPhone: e.target.value })}
                                            className="bg-transparent border-none p-0 w-full"
                                            placeholder="Phone"
                                        />
                                    </div>
                                </div>
                                <div className="text-right sm:text-right">
                                    <h2 className="text-4xl font-bold text-gray-700 print:text-gray-300 mb-2">INVOICE</h2>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="text-gray-400 text-sm">Invoice #</span>
                                            <span className="font-mono font-medium">{formData.invoiceNumber}</span>
                                        </div>
                                        <div className="flex items-center justify-end gap-3">
                                            <span className="text-gray-400 text-sm">Date</span>
                                            <span className="font-medium">{formData.date}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bill To Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Bill To</label>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Client Name"
                                            value={formData.clientName}
                                            onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                            className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 px-0 py-2 outline-none transition-colors text-lg font-medium placeholder-gray-600 print:text-black"
                                        />
                                        <input
                                            type="email"
                                            placeholder="client@email.com"
                                            value={formData.clientEmail}
                                            onChange={e => setFormData({ ...formData, clientEmail: e.target.value })}
                                            className="w-full bg-transparent border-b border-gray-700 focus:border-blue-500 px-0 py-2 outline-none transition-colors text-sm placeholder-gray-600 print:text-black"
                                        />
                                        {errors.clientName && <p className="text-red-500 text-xs no-print">{errors.clientName}</p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Status</label>
                                    <div className="flex justify-end">
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            className={`bg-transparent border-b border-gray-700 text-2xl font-bold outline-none cursor-pointer text-right appearance-none pr-4 ${formData.status === 'paid' ? 'text-green-500' : 'text-yellow-500'
                                                } print:text-black focus:border-blue-500`}
                                        >
                                            <option value="pending" className="bg-[#1e293b] text-yellow-500">Unpaid</option>
                                            <option value="paid" className="bg-[#1e293b] text-green-500">Paid</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="mb-8">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-700 text-left text-xs uppercase text-gray-500">
                                                <th className="py-3 px-2 w-1/2">Description</th>
                                                <th className="py-3 px-2 text-center w-20">Qty</th>
                                                <th className="py-3 px-2 text-right w-32">Rate</th>
                                                <th className="py-3 px-2 text-right w-32">Amount</th>
                                                <th className="py-3 px-2 w-10 no-print"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {formData.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="py-2 px-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Item description"
                                                            value={item.description}
                                                            onChange={e => handleItemChange(index, 'description', e.target.value)}
                                                            className="w-full bg-transparent outline-none py-2 placeholder-gray-600 print:text-black"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                            className="w-full bg-transparent outline-none py-2 text-center print:text-black"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2">
                                                        <input
                                                            type="number"
                                                            value={item.rate}
                                                            onChange={e => handleItemChange(index, 'rate', e.target.value)}
                                                            className="w-full bg-transparent outline-none py-2 text-right print:text-black"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-2 text-right font-medium">
                                                        {currencySymbols[formData.currency]}{item.amount.toFixed(2)}
                                                    </td>
                                                    <td className="py-2 px-2 text-center no-print">
                                                        <button
                                                            onClick={() => removeItem(index)}
                                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    onClick={addItem}
                                    className="mt-4 flex items-center gap-2 text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors no-print"
                                >
                                    <Plus size={16} /> Add Item
                                </button>
                            </div>

                            {/* Summary & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Notes / Terms</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full bg-[#0f172a] print:bg-transparent border border-gray-700 rounded-lg p-3 text-sm outline-none focus:border-blue-500 resize-none h-24 print:text-black print:border-gray-200"
                                        placeholder="Payment is due within 15 days. Thank you for your business."
                                    ></textarea>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 print:text-black">Subtotal</span>
                                        <span>{currencySymbols[formData.currency]}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 print:text-black">Tax (10%)</span>
                                        <span>{currencySymbols[formData.currency]}{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold border-t border-gray-700 pt-3 mt-2">
                                        <span>Total</span>
                                        <span>{currencySymbols[formData.currency]}{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-6 no-print">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4 text-white">Invoice Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                                    />
                                    {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4 text-white">Payment Info</h3>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Payment Link</label>
                                <div className="relative">
                                    <LinkIcon size={16} className="absolute left-3 top-3 text-gray-500" />
                                    <input
                                        type="url"
                                        placeholder="https://paypal.me/..."
                                        value={formData.paymentLink}
                                        onChange={e => setFormData({ ...formData, paymentLink: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">A direct link for clients to pay (Stripe, PayPal, etc.)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
